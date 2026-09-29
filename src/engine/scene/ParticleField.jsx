// ParticleField - campo de particulas interactivo de la escena 3D
// (Requirements 4.1, 4.2, 4.3, 4.4, 4.5).
//
// Nube de puntos dorados que reacciona a DOS entradas del usuario:
//   - Scroll: el progreso normalizado 0..1 rota y desplaza el conjunto en
//     reposo, de modo que las particulas "fluyen" a medida que se avanza por la
//     pagina (R4.1).
//   - Puntero: se proyecta el puntero (NDC) al plano z=0 del mundo mediante un
//     raycaster; las particulas dentro de un radio de influencia se EMPUJAN
//     alejandose del puntero con una fuerza proporcional a la cercania
//     (repulsion suave, R4.2). Al alejarse el puntero, cada particula regresa
//     progresivamente a su posicion de reposo por interpolacion (resorte, R4.3).
//
// El numero de particulas es configurable via `params.particleCount` (R4.4). La
// degradacion movil (Mobile <= Desktop) ya la aplica `resolveSceneConfig` antes
// de llegar aqui, por lo que este componente solo consume el valor resuelto
// (R4.5) sin volver a decidir por dispositivo.
//
// Accesibilidad (R23.2): con `reducedMotion` NO se anima; las particulas quedan
// fijas en su posicion de reposo (estado estatico equivalente en contenido).
//
// La geometria (BufferGeometry + atributo position) y el material
// (<pointsMaterial>) son DECLARATIVOS: React Three Fiber los libera al desmontar
// el componente, evitando fugas de recursos GPU (R22.5).
//
// NOTA: componente interno de la escena; no se exporta en el barrel del engine.

import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

import { theme } from '../config/theme.js'
import { useDisposable } from '../hooks/useDisposable.js'
import { readScroll } from '../hooks/useScrollProgress.js'

// Numero de particulas por defecto cuando la escena no lo especifica (R4.4).
const DEFAULT_PARTICLE_COUNT = 1200

// Radio del volumen esferico (unidades de escena) donde se distribuyen las
// particulas de reposo alrededor del origen.
const FIELD_RADIUS = 3

// Tamano de cada punto: pequeno para una nube fina y luminosa. Con el sprite
// radial (puntos suaves y redondos) un tamano algo mayor luce mejor que el
// cuadrado duro por defecto.
const POINT_SIZE = 0.05

// Opacidad del material: < 1 para que el polvo dorado se funda con el fondo
// oscuro (destellos suaves, no confeti solido).
const POINT_OPACITY = 0.85

// Lado (px) del canvas cuadrado que respalda la textura de sprite circular.
const SPRITE_SIZE = 64

// Radio de influencia del puntero: solo las particulas mas cercanas que esta
// distancia (en unidades de mundo) son repelidas (R4.2).
const POINTER_RADIUS = 1.2

// Intensidad de la repulsion: escala el desplazamiento maximo aplicado a una
// particula situada en el centro del radio de influencia (R4.2).
const REPULSION_STRENGTH = 1.4

// Factor de interpolacion por fotograma hacia la posicion objetivo. Valores
// bajos = retorno mas suave/gradual a reposo cuando el puntero se aleja (R4.3).
const RETURN_LERP = 0.08

// Deriva por scroll (R4.1): rotacion del conjunto alrededor del eje Y (radianes)
// y desplazamiento vertical, ambos proporcionales al progreso 0..1.
const SCROLL_ROTATION = Math.PI * 0.6
const SCROLL_DRIFT_Y = 1.2

// Distancia minima para evitar la division por cero al normalizar la direccion
// de repulsion (puntero practicamente sobre la particula).
const MIN_DISTANCE = 1e-4

/**
 * Genera una distribucion UNIFORME de `count` puntos dentro de un volumen
 * esferico de radio `FIELD_RADIUS` centrado en el origen.
 *
 * Se usa `r = R * cbrt(u)` para que la densidad sea uniforme en volumen (sin
 * acumularse en el centro) junto con angulos esfericos aleatorios.
 *
 * @param {number} count  Numero de particulas.
 * @returns {Float32Array} Array plano `[x0,y0,z0, x1,y1,z1, ...]` de longitud `count*3`.
 */
function createSphericalPositions(count) {
  const positions = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    // Radio con correccion de volumen (cbrt) -> densidad uniforme.
    const radius = FIELD_RADIUS * Math.cbrt(Math.random())
    // Direccion esferica uniforme.
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const sinPhi = Math.sin(phi)

    const idx = i * 3
    positions[idx] = radius * sinPhi * Math.cos(theta)
    positions[idx + 1] = radius * sinPhi * Math.sin(theta)
    positions[idx + 2] = radius * Math.cos(phi)
  }

  return positions
}

/**
 * Crea, UNA sola vez, la textura de "sprite" circular que se aplica a cada
 * punto para que deje de verse como un cuadrado duro (el default de `points`) y
 * pase a ser un destello dorado REDONDO y suave (polvo elegante).
 *
 * Se pinta un degradado radial blanco -> transparente en un canvas 64x64:
 * opaco en el centro y desvaneciendo hacia el borde. Envuelto en
 * `THREE.CanvasTexture`, sirve tanto de `map` (forma/color) como de `alphaMap`
 * (transparencia por pixel) del material, recortando el punto a un circulo con
 * bordes suaves.
 *
 * SSR-safe: sin DOM (`document` indefinido) no hay canvas; se devuelve `null` y
 * el material funciona sin textura.
 *
 * @returns {THREE.CanvasTexture|null} Textura del sprite, o `null` sin DOM.
 */
function createSpriteTexture() {
  if (typeof document === 'undefined') return null

  const canvas = document.createElement('canvas')
  canvas.width = SPRITE_SIZE
  canvas.height = SPRITE_SIZE

  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // Degradado radial centrado: opaco (centro) -> transparente (borde).
  const half = SPRITE_SIZE / 2
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE)

  return new THREE.CanvasTexture(canvas)
}

/**
 * Campo de particulas interactivo (scroll + puntero) de la escena 3D.
 *
 * @param {Object} props
 * @param {import('../config/sceneConfig.js').ResolvedScene['params']} [props.params]
 *   Parametros resueltos; se lee `particleCount` (ya degradado por dispositivo, R4.5).
 * @param {number|import('framer-motion').MotionValue<number>} [props.scrollProgress=0]
 *   Progreso de scroll normalizado 0..1 (numero o MotionValue) que modula el
 *   movimiento en reposo del conjunto (R4.1). Se lee con `readScroll` en el `useFrame`.
 * @param {import('../providers/capabilities.js').Capabilities} [props.caps]
 *   Capacidades vivas; `reducedMotion` congela la animacion (estado estatico, R23.2).
 * @returns {JSX.Element}
 */
export function ParticleField({ params, scrollProgress = 0, caps }) {
  // Referencia al objeto <points> para acceder a su geometria en cada fotograma.
  const pointsRef = useRef(null)

  // Registro de recursos GPU liberables al desmontar (R22.5).
  const register = useDisposable()

  // Textura de sprite circular: se crea UNA sola vez (independiente de `count`)
  // y da a cada punto forma redonda y suave en lugar de un cuadrado.
  const sprite = useMemo(() => createSpriteTexture(), [])

  // La CanvasTexture es un recurso GPU: se registra para liberarla (`dispose()`)
  // al desmontar, evitando fugas (R22.5). El material y la geometria declarativos
  // los libera React Three Fiber por si mismo.
  useEffect(() => {
    if (sprite) register(sprite)
  }, [register, sprite])

  // Numero de particulas configurable (R4.4). El valor llega ya degradado para
  // Mobile desde resolveSceneConfig (Mobile <= Desktop, R4.5).
  const count = params?.particleCount ?? DEFAULT_PARTICLE_COUNT

  // Posiciones de reposo (referencia estable) y copia mutable para el fotograma
  // actual. Se regeneran solo si cambia `count`, no en cada render.
  const basePositions = useMemo(() => createSphericalPositions(count), [count])
  const positions = useMemo(() => basePositions.slice(), [basePositions])

  // Utillaje de proyeccion del puntero reutilizado entre fotogramas (sin
  // asignaciones dentro del bucle): raycaster, plano z=0 y vector de destino.
  const projection = useMemo(
    () => ({
      raycaster: new THREE.Raycaster(),
      plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
      pointerWorld: new THREE.Vector3(),
    }),
    [],
  )

  // Puntero en NDC (-1..1) y camara activa, provistos por React Three Fiber.
  const pointer = useThree((state) => state.pointer)
  const camera = useThree((state) => state.camera)

  useFrame(() => {
    // Valor vivo del scroll (numero o MotionValue) leido sin re-render (R19.2).
    const sp = readScroll(scrollProgress)

    const points = pointsRef.current
    if (!points) return

    const positionAttribute = points.geometry.attributes.position
    if (!positionAttribute) return

    // Movimiento reducido: estado estatico. Las particulas descansan en su
    // posicion base, sin deriva por scroll ni repulsion por puntero (R23.2).
    if (caps?.reducedMotion) {
      positions.set(basePositions)
      positionAttribute.needsUpdate = true
      return
    }

    // Proyecta el puntero (NDC) al mundo intersecando el plano z=0. Si el rayo
    // es paralelo al plano (sin interseccion), se usa un punto lejano para que
    // ninguna particula quede dentro del radio de repulsion.
    const { raycaster, plane, pointerWorld } = projection
    raycaster.setFromCamera(pointer, camera)
    if (!raycaster.ray.intersectPlane(plane, pointerWorld)) {
      pointerWorld.set(Infinity, Infinity, Infinity)
    }

    // Deriva por scroll (R4.1): rota el conjunto alrededor de Y y lo desplaza en
    // vertical de forma proporcional al progreso. Se precalcula una sola vez.
    const angle = sp * SCROLL_ROTATION
    const cosA = Math.cos(angle)
    const sinA = Math.sin(angle)
    const driftY = sp * SCROLL_DRIFT_Y

    for (let i = 0; i < count; i++) {
      const idx = i * 3
      const bx = basePositions[idx]
      const by = basePositions[idx + 1]
      const bz = basePositions[idx + 2]

      // Posicion de reposo modulada por scroll (objetivo base del fotograma).
      let targetX = bx * cosA + bz * sinA
      let targetZ = -bx * sinA + bz * cosA
      let targetY = by + driftY

      // Repulsion suave (R4.2): si la particula (en su reposo derivado) cae
      // dentro del radio del puntero, se empuja ALEJANDOLA con una fuerza
      // proporcional a (radio - distancia), a lo largo de puntero -> particula.
      const ox = targetX - pointerWorld.x
      const oy = targetY - pointerWorld.y
      const oz = targetZ - pointerWorld.z
      const distance = Math.sqrt(ox * ox + oy * oy + oz * oz)

      if (distance < POINTER_RADIUS && distance > MIN_DISTANCE) {
        const force = (POINTER_RADIUS - distance) * REPULSION_STRENGTH
        const inv = 1 / distance
        targetX += ox * inv * force
        targetY += oy * inv * force
        targetZ += oz * inv * force
      }

      // Interpolacion hacia el objetivo: al entrar el puntero la particula se
      // aleja; al salir, el objetivo vuelve a ser el reposo y la particula
      // regresa progresivamente a el (resorte suave, R4.3).
      positions[idx] += (targetX - positions[idx]) * RETURN_LERP
      positions[idx + 1] += (targetY - positions[idx + 1]) * RETURN_LERP
      positions[idx + 2] += (targetZ - positions[idx + 2]) * RETURN_LERP
    }

    // Sube al GPU las posiciones modificadas en este fotograma.
    positionAttribute.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        {/* Atributo position respaldado por la copia mutable `positions`. */}
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      {/*
        map + alphaMap con el sprite radial recortan cada punto a un circulo
        suave (adios cuadrados). Con AdditiveBlending sobre fondo oscuro, el
        centro opaco del degradado brilla como polvo dorado y el borde
        transparente se funde sin recortes duros. `map` solo se aplica si hay
        textura (sprite no null en SSR).
      */}
      <pointsMaterial
        color={theme.color.gold}
        size={POINT_SIZE}
        transparent
        opacity={POINT_OPACITY}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
        {...(sprite ? { map: sprite, alphaMap: sprite } : null)}
      />
    </points>
  )
}
