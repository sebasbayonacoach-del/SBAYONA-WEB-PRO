/**
 * BAYONA · «TRAYECTORIA» — GREYBOX ESPACIAL (Lote 2)
 * -------------------------------------------------------------------------
 * Variante `trajectory` del Scene_Registry: la primera representación espacial
 * real del método. NO es el acabado final ni un mundo completo — es una maqueta
 * para juzgar escala, profundidad, orientación, encuadre y la relación entre el
 * espacio y el contenido editorial que ya existe en el DOM.
 *
 * Contratos que cumple (leídos del motor, no inventados):
 *   - Firma de props de una variante: `<Component params scrollProgress
 *     particles postProcessing caps />` (Scene3D.jsx). Aquí solo interesan
 *     `params` (estado del recorrido, vía `resolveSceneConfig`) y `caps`
 *     (movimiento reducido). El scroll se IGNORE a propósito: este lote no hace
 *     scroll-jacking (ver docs/immersive/MASTERPLAN.md §9).
 *   - `React.lazy` exige `export default` además del named export.
 *   - Recursos GPU: lo que se crea a mano (`useMemo`) se registra en
 *     `useDisposable` y se libera al desmontar, una sola vez (R22.5). Lo que
 *     declara R3F en JSX no se duplica con `dispose` manual.
 *   - No se exporta en el barrel del engine (los módulos de escena se consumen
 *     por ruta directa; lo vigila fase7aSceneGovernance.test.js).
 *
 * Frontera de carga: este módulo SOLO se alcanza desde el `import()` perezoso
 * del Scene_Registry. Ni el shell de rutas, ni el laboratorio en modo sencillo
 * lo importan estáticamente.
 *
 * Presuestos asumidos y por qué:
 *   - SIN sombras: la escena se lee con una luz principal direccional + relleno
 *     + niebla de volumen. Menos knobs, menos GPU, y el greybox no depende de
 *     ellas (se evaluarán en el lote de dirección artística, midiendo).
 *   - SIN post-proceso, partículas ni adornos flotantes.
 *   - La cámara responde a la estación seleccionada; no flota ni respira.
 *   - Una estación = un canto de señal montado. La trayectoria NO se dibuja: la
 *     progresión la cuentan los peldaños (Lote 3A, §7 del mandato).
 */

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

import { useDisposable } from '../hooks/useDisposable.js'
import {
  FOG,
  GEOMETRY,
  INITIAL_VIEW_KEY,
  LIGHTS,
  MATERIALS,
  NARROW_ASPECT_MAX,
  viewFor,
} from './trajectoryStage.js'
import { applyCameraView, createCameraTravel, isSettled, readCameraPosition, travelDurationFor } from './trajectoryCamera.js'

/** Primitivas soportadas por la maqueta. Todo lo demás se ignora, no revienta. */
function buildGeometry(part) {
  switch (part.kind) {
    case 'box':
      return new THREE.BoxGeometry(...part.args)
    case 'plane':
      return new THREE.PlaneGeometry(...part.args)
    case 'cylinder':
      return new THREE.CylinderGeometry(...part.args)
    default:
      return null
  }
}

function buildMaterial(spec) {
  if (!spec) return null
  if (spec.unlit) {
    // Superficie autoluminosa; `side` se decide con el dato, no en la escena.
    // Superficie autoluminosa (la abertura): `toneMapped: false` para que no la
    // aplaste el tone mapping del renderer y se lea como fuente de luz, no como plástico.
    return new THREE.MeshBasicMaterial({
      color: spec.color,
      transparent: true,
      opacity: spec.opacity ?? 1,
      toneMapped: false,
      side: spec.doubleSided ? THREE.DoubleSide : THREE.FrontSide,
    })
  }
  return new THREE.MeshStandardMaterial({
    color: spec.color,
    roughness: spec.roughness ?? 0.9,
    metalness: spec.metalness ?? 0,
  })
}

/**
 * Encabezado de la variante. Scene3D ya lo envuelve en <Suspense> y ya le pasa
 * el `ResolvedScene` degradado por dispositivo.
 *
 * @param {Object} props
 * @param {Object} props.params  `ResolvedScene.params` + lo que el laboratorio
 *   monte dentro (aquí: `stationKey`).
 * @param {import('../providers/capabilities.js').Capabilities} [props.caps]
 */
export function TrajectoryScene({ params, caps }) {
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)
  const invalidate = useThree((state) => state.invalidate)
  const register = useDisposable()

  const reducedMotion = caps?.reducedMotion === true
  const stationKey = params?.stationKey ?? INITIAL_VIEW_KEY

  // Relación de aspecto del contenedor: decide el encuadre (wide/narrow) sin
  // escalar el objeto. Un alto de 0 (contenedor sin medir) no puede partir la escena.
  const aspect = size?.height > 0 ? size.width / size.height : 1.6
  // El encuadre salta de familia solo al CRUZAR el umbral de aspecto: si se
  // recostumbrara a cada píxel de un resize, arrastrar la ventana re-origina
  // la cámara en vano (y el usuario ve temblar el plano).
  const isNarrow = aspect < NARROW_ASPECT_MAX
  const view = useMemo(() => viewFor(stationKey, isNarrow ? 0.5 : 1.6), [stationKey, isNarrow])

  // Punto de mira actual como dato plano (no un Vector3): `lookAt` no es
  // consultable, así que hay que recordar dónde está mirando la cámara para que
  // el siguiente trayecto arranque desde ahí y no desde un valor inventado.
  const aimRef = useRef([...view.target])
  const travelRef = useRef(null)
  const mountedRef = useRef(false)

  const applyView = useCallback(
    (next) => {
      applyCameraView(camera, next)
      aimRef.current = [...next.target]
    },
    [camera],
  )

  // --- Primer montaje: corte limpio al encuadre inicial (no hay estado previo //
  //     que interpolar, y arrancar "viajando" desde el valor del <Canvas> sería
  //     un salto disfrazado). Redimensionado y reduced-motion: también corte.
  useEffect(() => {
    if (!mountedRef.current || reducedMotion) {
      applyView(view)
      travelRef.current = null
      mountedRef.current = true
      if (reducedMotion) invalidate()
      return
    }
    const from = { ...readCameraPosition(camera), target: aimRef.current }
    travelRef.current = {
      travel: createCameraTravel({ from, to: view, duration: travelDurationFor(from.position, view.position) }),
      elapsed: 0,
    }
    invalidate()
  }, [view, reducedMotion, applyView, invalidate, camera])

  // --- Bucle del trayecto: solo existe mientras queda trayecto. ------------
  useFrame((_, delta) => {
    const current = travelRef.current
    if (!current) return
    // `delta` puede ser enorme tras una pestaña en segundo plano: se recorta
    // para que la cámara no teletransporte a través de la geometría.
    current.elapsed += Math.min(delta, 0.05)
    const sampled = current.travel.sample(current.elapsed)
    applyView(sampled)
    if (sampled.done || isSettled(sampled.position, current.travel.to.position)) {
      applyView(current.travel.to) // snap exacto: sin deriva residual
      travelRef.current = null
    }
  })

  // --- Recursos creados a mano: su dueño es esta escena, y nadie más. -------
  const resources = useMemo(() => {
    const geometries = new Map()
    const materials = new Map()
    const disposables = []

    for (const spec of Object.entries(MATERIALS)) {
      const [name, definition] = spec
      const material = buildMaterial(definition)
      if (material) {
        materials.set(name, material)
        disposables.push(material)
      }
    }
    /**
     * Variante de la losa activa: la relación estación ↔ espacio se tiene que VER
     * sin leer el texto. Material aparte porque el resto de plataformas comparten
     * el suyo (un solo objeto, dos apariencias).
     *
     * Lote 3A: el color y el empuje salen del DATO (`platformActive`), no del
     * componente. El Lote 2 pintaba la losa entera con `emissive` naranja 0,28;
     * ahora la losa sube un paso de valor y el naranja se retira al canto
     * (`role: 'signal'`), que es la dosis que pedía §9. Aquí ya no hay ningún
     * número de gusto: cambiar el aspecto = cambiar `trajectoryStage.js`.
     */
    const activeSpec = MATERIALS.platformActive
    const active = new THREE.MeshStandardMaterial({
      color: activeSpec.color,
      roughness: activeSpec.roughness,
      metalness: activeSpec.metalness,
      emissive: new THREE.Color(activeSpec.glow),
      emissiveIntensity: activeSpec.glowIntensity,
    })
    materials.set('platformActive', active)
    disposables.push(active)

    for (const part of GEOMETRY) {
      const geometry = buildGeometry(part)
      if (geometry) {
        geometries.set(part.id, geometry)
        disposables.push(geometry)
      }
    }

    // Lote 3A: el tubo de trayectoria deja de montarse. Dos pasadas sobre la
    // proyección lo dejaron claro —línea fina = adorno; línea gruesa = láser—, y
    // §7 mandaba retirar el recurso antes que defenderlo. La RUTA sigue existiendo
    // como dato (`TRAJECTORY_CURVE`) y es la que fija dónde van los peldaños, que
    // son ya la trayectoria construida. Se retira el `TubeGeometry` y con él su
    // `dispose`: un recurso que no se crea no necesita dueño.

    disposables.forEach(register)
    return { geometries, materials }
  }, [register])

  return (
    <>
      <color attach="background" args={[FOG.color]} />
      <fog attach="fog" args={[FOG.color, FOG.near, FOG.far]} />

      <ambientLight color={LIGHTS.fill.color} intensity={LIGHTS.fill.intensity} />
      <directionalLight
        color={LIGHTS.key.color}
        intensity={LIGHTS.key.intensity}
        position={[LIGHTS.key.position[0], LIGHTS.key.position[1], LIGHTS.key.position[2]]}
      />

      {GEOMETRY.map((part) => {
        const geometry = resources.geometries.get(part.id)
        if (!geometry) return null
        // Un canto de señal por estación: la de las otras dos no se monta. No es
        // ocultarlo con `visible={false}` (un mesh montado y apagado sigue pagando
        // draw call): es no crearlo, que además deja el recuento de meshes a la
        // vista = sujeto + contexto + UNA señal, y es lo que comprueba el test.
        if (part.role === 'signal' && part.station !== stationKey) return null
        const isActivePlatform = part.role === 'platform' && part.station === stationKey
        const material = isActivePlatform
          ? resources.materials.get('platformActive')
          : resources.materials.get(part.material)
        if (!material) return null
        return (
          <mesh
            key={part.id}
            geometry={geometry}
            material={material}
            position={part.position}
            rotation={part.rotation}
          />
        )
      })}

    </>
  )
}

// `export default` requerido por React.lazy (Scene_Registry).
export default TrajectoryScene
