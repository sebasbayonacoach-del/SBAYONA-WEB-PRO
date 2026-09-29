// InstancedCluster - cumulo de mallas instanciadas con LOD por distancia
// (Requirements 5.1, 5.2, 5.3, 5.4, 5.5).
//
// Nube de pequenos icosaedros dorados distribuidos en una capa esferica
// alrededor del origen. Todos los objetos de un mismo nivel de detalle se
// dibujan con UN solo THREE.InstancedMesh -> una unica draw call por nivel
// activo (R5.1), en lugar de un objeto por instancia.
//
// Rendimiento y adaptacion:
//   - `count` configurable via `params.instanceCount` (R5.2). La degradacion
//     movil (Mobile <= Desktop) ya la aplica `resolveSceneConfig` antes de
//     llegar aqui (R5.3), por lo que este componente solo consume el valor
//     resuelto sin volver a decidir por dispositivo.
//   - Nivel de detalle por distancia mediante THREE.LOD (R5.4): en Desktop se
//     montan varios niveles de icosaedro con subdivision decreciente a
//     distancias crecientes; en Mobile se prioriza baja densidad/detalle con un
//     unico nivel de menor coste (R5.5). El WebGLRenderer conmuta el nivel
//     visible automaticamente (LOD.autoUpdate = true), de modo que solo un
//     InstancedMesh se dibuja por fotograma.
//
// Las matrices de instancia (posicion + escala + rotacion) se generan UNA sola
// vez (no por fotograma) y se comparten entre todos los niveles del LOD, que
// reutilizan ademas el MISMO material dorado.
//
// Movimiento (R7.1 / R23.2): el progreso de scroll SIEMPRE orienta el cumulo;
// el giro idle autonomo solo ocurre sin movimiento reducido (con `reducedMotion`
// el cumulo queda estatico salvo por la orientacion -absoluta- del scroll).
//
// Ciclo de vida (R22.5): THREE.LOD NO libera por si solo las geometrias, los
// materiales ni los buffers de instancia; se registran explicitamente en
// `useDisposable` para liberarlos (`dispose()`) al desmontar.
//
// NOTA: componente interno de la escena; no se exporta en el barrel del engine.

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { theme } from '../config/theme.js'
import { useDisposable } from '../hooks/useDisposable.js'
import { readScroll } from '../hooks/useScrollProgress.js'

// Numero de instancias por defecto cuando la escena no lo especifica (R5.2).
const DEFAULT_INSTANCE_COUNT = 24

// Radio base del icosaedro de cada instancia (unidades de escena).
const BASE_GEOMETRY_RADIUS = 0.35

// Radio de la capa esferica sobre la que se distribuyen las instancias en torno
// al origen.
const CLUSTER_RADIUS = 2.6

// Variacion relativa del radio por instancia (+/-) para romper la regularidad
// perfecta de la esfera y dar un aspecto mas organico.
const RADIUS_JITTER = 0.3

// Rango de escala por instancia: introduce variedad de tamanos en el cumulo.
const MIN_INSTANCE_SCALE = 0.45
const MAX_INSTANCE_SCALE = 1.15

// Angulo aureo (~2.399963 rad): reparte los puntos de la esfera de Fibonacci de
// forma casi uniforme evitando agrupaciones.
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

// Acabado metalico dorado del material compartido (R5, marca R9): metal muy
// reflectante, poco rugoso, con un emisivo dorado tenue para que el LightingRig
// (y el bloom posterior) lo hagan brillar sin quedar negro sin entorno.
const GOLD_METALNESS = 0.9
const GOLD_ROUGHNESS = 0.25
const EMISSIVE_INTENSITY = 0.15

// Velocidad del giro idle (rad/s) cuando el movimiento esta permitido.
const IDLE_SPEED = 0.08

// Orientacion por scroll (R7.1): giro alrededor de Y e inclinacion en X, ambos
// proporcionales al progreso 0..1. Valores suaves ("levemente").
const SCROLL_SPIN_Y = Math.PI
const SCROLL_TILT_X = Math.PI * 0.12

/**
 * Niveles de detalle para Desktop (R5.4): subdivision del icosaedro decreciente
 * a distancias de camara crecientes. `detail` es el nivel de subdivision (mas
 * alto = mas triangulos); `distance` es la distancia a partir de la cual ese
 * nivel pasa a ser el visible.
 *
 * @type {ReadonlyArray<{detail:number, distance:number}>}
 */
const DESKTOP_LOD_LEVELS = [
  { detail: 2, distance: 0 }, // cerca: icosaedro mas subdividido (silueta fina)
  { detail: 1, distance: 6 }, // medio
  { detail: 0, distance: 11 }, // lejos: icosaedro base (20 caras)
]

/**
 * Nivel unico para Mobile (R5.5): prioriza baja densidad y coste minimo con el
 * icosaedro base, sin conmutacion de niveles.
 *
 * @type {ReadonlyArray<{detail:number, distance:number}>}
 */
const MOBILE_LOD_LEVELS = [{ detail: 0, distance: 0 }]

/**
 * Hash determinista 0..1 a partir de una semilla numerica (estilo GLSL). Permite
 * generar variacion pseudoaleatoria REPRODUCIBLE por indice de instancia, sin
 * depender de `Math.random` (mismo cumulo en cada render/entorno).
 *
 * @param {number} seed  Semilla (p. ej. indice de instancia desplazado).
 * @returns {number} Valor en el rango [0, 1).
 */
function hash01(seed) {
  const x = Math.sin(seed) * 43758.5453123
  return x - Math.floor(x)
}

/**
 * Genera, UNA sola vez, las matrices de transformacion de las instancias.
 *
 * Distribuye `count` objetos sobre una capa esferica (esfera de Fibonacci) en
 * torno al origen, aplicando a cada uno posicion, escala y rotacion propias. Se
 * usa un `THREE.Object3D` auxiliar y su `updateMatrix()` para componer cada
 * `Matrix4`, tal como espera `InstancedMesh.setMatrixAt`.
 *
 * @param {number} count  Numero de instancias (>= 0).
 * @returns {THREE.Matrix4[]} Matrices de instancia, una por objeto.
 */
function createInstanceMatrices(count) {
  const dummy = new THREE.Object3D()
  const matrices = new Array(count)
  // Denominador seguro para la coordenada vertical uniforme (evita /0 con count<=1).
  const denom = Math.max(count - 1, 1)

  for (let i = 0; i < count; i++) {
    // Esfera de Fibonacci: `y` uniforme en [-1, 1] y angulo aureo en el plano
    // -> reparto casi uniforme sobre la esfera unidad.
    const y = 1 - (i / denom) * 2
    const ringRadius = Math.sqrt(Math.max(0, 1 - y * y))
    const phi = i * GOLDEN_ANGLE

    // Radio de la capa con leve jitter determinista por instancia.
    const shellRadius = CLUSTER_RADIUS * (1 + (hash01(i + 1) - 0.5) * RADIUS_JITTER)

    dummy.position.set(
      Math.cos(phi) * ringRadius * shellRadius,
      y * shellRadius,
      Math.sin(phi) * ringRadius * shellRadius,
    )

    // Escala uniforme por instancia dentro del rango configurado.
    const scale =
      MIN_INSTANCE_SCALE + hash01(i + 11) * (MAX_INSTANCE_SCALE - MIN_INSTANCE_SCALE)
    dummy.scale.setScalar(scale)

    // Rotacion propia por instancia (orientaciones variadas).
    dummy.rotation.set(
      hash01(i + 23) * Math.PI * 2,
      hash01(i + 37) * Math.PI * 2,
      hash01(i + 53) * Math.PI * 2,
    )

    // Compone la Matrix4 a partir de position/quaternion/scale.
    dummy.updateMatrix()
    matrices[i] = dummy.matrix.clone()
  }

  return matrices
}

/**
 * Cumulo de mallas instanciadas con nivel de detalle por distancia.
 *
 * @param {Object} props
 * @param {import('../config/sceneConfig.js').ResolvedScene['params']} [props.params]
 *   Parametros resueltos; se lee `instanceCount` (ya degradado por dispositivo, R5.3).
 * @param {import('../providers/capabilities.js').Capabilities} [props.caps]
 *   Capacidades vivas: `mode` fija el esquema de LOD (Desktop multinivel / Mobile
 *   baja densidad, R5.4/R5.5) y `reducedMotion` congela el giro idle (R23.2).
 * @param {number|import('framer-motion').MotionValue<number>} [props.scrollProgress=0]
 *   Progreso de scroll normalizado 0..1 (numero o MotionValue) que orienta
 *   SIEMPRE el cumulo (R7.1). Se lee con `readScroll` en el `useFrame`.
 * @returns {JSX.Element}
 */
export function InstancedCluster({ params, caps, scrollProgress = 0 }) {
  // Registro de recursos GPU liberables al desmontar (R22.5).
  const register = useDisposable()
  // Acumulador del giro idle, separado del scroll (absoluto) para poder sumarlos.
  const idleRotation = useRef(0)

  // Numero de instancias configurable (R5.2); llega ya degradado para Mobile
  // desde resolveSceneConfig (Mobile <= Desktop, R5.3).
  const count = params?.instanceCount ?? DEFAULT_INSTANCE_COUNT
  const isDesktop = caps?.mode === 'desktop'

  // Matrices de instancia: se generan UNA vez por `count`, no por fotograma.
  const matrices = useMemo(() => createInstanceMatrices(count), [count])

  // Material dorado COMPARTIDO por todos los niveles del LOD: una sola instancia
  // reutilizada (crear/recompilar materiales es costoso). Lo ilumina el
  // LightingRig por ser un MeshStandardMaterial (metalico dorado, emisivo tenue).
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(theme.color.gold),
        metalness: GOLD_METALNESS,
        roughness: GOLD_ROUGHNESS,
        emissive: new THREE.Color(theme.color.goldBright),
        emissiveIntensity: EMISSIVE_INTENSITY,
      }),
    [],
  )

  // LOD por distancia: un InstancedMesh por nivel, todos con las MISMAS matrices
  // y el MISMO material. Se devuelven ademas los recursos GPU a liberar, porque
  // THREE.LOD no los libera por si solo (R22.5).
  const { lod, disposables } = useMemo(() => {
    const levels = isDesktop ? DESKTOP_LOD_LEVELS : MOBILE_LOD_LEVELS
    const lodObject = new THREE.LOD()
    /** @type {Array<THREE.BufferGeometry | THREE.InstancedMesh>} */
    const gpuResources = []

    for (const level of levels) {
      // Icosaedro de detalle decreciente por nivel (R5.4/R5.5).
      const geometry = new THREE.IcosahedronGeometry(BASE_GEOMETRY_RADIUS, level.detail)
      // Un unico InstancedMesh dibuja todas las instancias del nivel: una draw
      // call por nivel activo (R5.1).
      const instancedMesh = new THREE.InstancedMesh(geometry, material, matrices.length)

      for (let i = 0; i < matrices.length; i++) {
        instancedMesh.setMatrixAt(i, matrices[i])
      }
      // Marca las matrices como modificadas para subirlas al GPU.
      instancedMesh.instanceMatrix.needsUpdate = true

      // Anade el nivel al LOD a su distancia de conmutacion (R5.4).
      lodObject.addLevel(instancedMesh, level.distance)
      gpuResources.push(geometry, instancedMesh)
    }

    return { lod: lodObject, disposables: gpuResources }
  }, [material, matrices, isDesktop])

  // Libera GPU al desmontar (R22.5): material compartido + geometria y buffers de
  // instancia (InstancedMesh) de cada nivel. THREE.LOD no libera estos recursos.
  useEffect(() => {
    register(material)
    disposables.forEach((resource) => register(resource))
  }, [register, material, disposables])

  useFrame((_, delta) => {
    if (!lod) return

    // Valor vivo del scroll (numero o MotionValue) leido sin re-render (R19.2).
    const sp = readScroll(scrollProgress)

    if (!caps?.reducedMotion) {
      // Giro idle sutil, solo con movimiento permitido (R23.2).
      idleRotation.current += delta * IDLE_SPEED
    }
    // Con reducedMotion no se acumula idle: el cumulo solo se orienta -de forma
    // estatica- segun la posicion de scroll.

    // El progreso de scroll SIEMPRE orienta el cumulo (R7.1); el idle se suma
    // encima cuando esta permitido.
    lod.rotation.y = sp * SCROLL_SPIN_Y + idleRotation.current
    lod.rotation.x = sp * SCROLL_TILT_X
  })

  // El WebGLRenderer conmuta el nivel visible del LOD automaticamente por
  // distancia de camara (LOD.autoUpdate = true).
  return <primitive object={lod} />
}
