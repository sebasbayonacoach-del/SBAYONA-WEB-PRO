// PlateTreeScene — arbol de discos, la metfora de "la base + los extras".
//
// La pagina dice: "Tu membresia es la BASE. Los servicios son OPCIONALES". Un
// arbol de discos es ese enunciado hecho objeto: el arbol esta ahi siempre (la
// membresia) y los discos se van colgando (los servicios). Bajar el scroll
// cuelga discos; no hay animacion decorativa, hay una pila que se llena como
// en la sala.
//
// Cotas reales:
//   base    450 x 450 mm de acero con goma
//   postes  3, diametro 50 mm (entra el agujero olimpico de 51 mm), 520 mm,
//           abiertos 12 grados para que los discos no se toquen entre si
//   disco   diametro 450 mm, 28 mm de grosor, agarradera central de 50 mm

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Object3D, Quaternion, Vector3 } from 'three'
import { theme } from '../config/theme.js'
import { readScroll } from '../hooks/useScrollProgress.js'
import { LightingRig } from './LightingRig.jsx'
import { PostProcessing } from './PostProcessing.jsx'
import { StudioEnvironment } from './StudioEnvironment.jsx'

// Base pequena y alta: si mide 45 cm y 22 mm, se lee como un disco mas
// y el arbol desaparece (pasaba en el render anterior).
const BASE = { size: 0.34, thickness: 0.05 }
// Apertura y arranque de los brazos calculados, no elegidos a ojo: con 12 grados
// los tres postes quedan casi verticales y los discos de 45 cm se solapan en el
// centro, que es lo que salio en el primer render (una tarta, no un arbol). Con
// 29 grados y arranque a 140 mm del eje, dos discos de brazos contiguos distan
// ~0,49 m y no se tocan.
const POST = { radius: 0.025, length: 0.62, splay: 0.58, count: 3, offset: 0.115 }
const PLATE = { radius: 0.225, thickness: 0.028 }
const PER_POST = 3
const TOTAL = POST.count * PER_POST
const FIRST = 0.3
const STEP = PLATE.thickness + 0.022

// Direccion de cada poste: sale del centro hacia arriba, abierto 12 grados.
const DIRS = Array.from({ length: POST.count }, (_, i) => {
  const angle = (i / POST.count) * Math.PI * 2 + Math.PI / 6
  return new Vector3(
    Math.sin(angle) * Math.sin(POST.splay),
    Math.cos(POST.splay),
    Math.cos(angle) * Math.sin(POST.splay),
  ).normalize()
})
// Origen de cada brazo, en el canto de la base
const ROOTS = Array.from({ length: POST.count }, (_, i) => {
  const angle = (i / POST.count) * Math.PI * 2 + Math.PI / 6
  return new Vector3(
    Math.sin(angle) * POST.offset,
    BASE.thickness,
    Math.cos(angle) * POST.offset,
  )
})

const UP = new Vector3(0, 1, 0)
// El toro nace con el eje en Z; para que la agarradera quede enhebrada en el
// poste hay que girarla a Y antes de aplicarle la orientacion del poste.
const RING_TO_Y = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2)
// El disco es un cilindro cuyo eje natural es Y: al enhebrarlo hay que girarlo
// para que ese eje coincida con el del poste. Sin esto los discos quedan
// clavados de canto y el arbol se ve roto desde el primer fotograma.
const ORIENTATIONS = DIRS.map((dir) => new Quaternion().setFromUnitVectors(UP, dir))

export function PlateTreeScene({ params, scrollProgress = 0, caps, postProcessing = true }) {
  const platesRef = useRef()
  const gripsRef = useRef()
  const dummy = useMemo(() => new Object3D(), [])

  useFrame(() => {
    const mesh = platesRef.current
    const grips = gripsRef.current
    if (!mesh || !grips) return
    const sp = readScroll(scrollProgress)
    // Los discos entran por poste, no todos a la vez: se va llenando la base.
    const shown = caps?.reducedMotion
      ? TOTAL
      : Math.round(Math.min(1, Math.max(0, sp)) * TOTAL)

    for (let i = 0; i < TOTAL; i += 1) {
      const post = i % POST.count
      const slot = Math.floor(i / POST.count)
      const dir = DIRS[post]
      const root = ROOTS[post]
      // Desfase de un disco entre brazos: asi los cantos no chocan cuando dos
      // discos de postes distintos caen a la misma altura.
      const along = FIRST + slot * STEP + post * 0.031
      const visible = i < shown

      // La agarradera va en la cara superior del disco: si se pone en el mismo
      // centro queda enterrada en la masa de goma y no se ve (era lo que pasaba,
      // solo salian dos puntos naranjas en el centro del arbol).
      const grip = along + PLATE.thickness / 2
      dummy.position.set(root.x + dir.x * grip, root.y + dir.y * grip, root.z + dir.z * grip)
      dummy.quaternion.copy(ORIENTATIONS[post]).multiply(RING_TO_Y)
      dummy.scale.setScalar(visible ? 1 : 0.0001)
      dummy.updateMatrix()
      grips.setMatrixAt(i, dummy.matrix)

      dummy.quaternion.copy(ORIENTATIONS[post])
      // Un disco que aun no esta puesto se retira, no se aplasta: escala 0
      // rompe las normales y sale negro.
      dummy.scale.setScalar(visible ? 1 : 0.0001)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
    grips.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      <LightingRig caps={caps} />
      <StudioEnvironment intensity={0.8} />
      {/* Relleno de frente: las luces del rig están todas detrás y arriba del
          árbol, y sin esta luz el canto de los discos llegaba casi negro. */}
      <pointLight position={[0, 0.8, 3.12]} intensity={38} color={theme.color.muted} />

      {/* Base: plato de acero con goma, no una caja */}
      <mesh position={[0, BASE.thickness / 2, 0]}>
        <cylinderGeometry args={[BASE.size / 2, BASE.size / 2 + 0.02, BASE.thickness, 32]} />
        <meshStandardMaterial color="#62666c" metalness={0.2} roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.004, 0]}>
        <cylinderGeometry args={[BASE.size / 2 + 0.02, BASE.size / 2 + 0.02, 0.008, 32]} />
        <meshStandardMaterial color="#55595f" metalness={0.05} roughness={0.8} />
      </mesh>

      {/* Tres brazos. Cada uno es un group con el cuaternio del poste: asi el
          tubo, su tope y los discos comparten el mismo eje. Antes solo se
          desplazaban los centros y los tubos quedaban verticales, que es lo que
          hacia flotar las bolas y descolgar los discos. */}
      {DIRS.map((dir, i) => (
        <group
          key={`post${i}`}
          position={[ROOTS[i].x, ROOTS[i].y, ROOTS[i].z]}
          quaternion={[
            ORIENTATIONS[i].x,
            ORIENTATIONS[i].y,
            ORIENTATIONS[i].z,
            ORIENTATIONS[i].w,
          ]}
        >
          <mesh position={[0, POST.length / 2, 0]}>
            <cylinderGeometry args={[POST.radius, POST.radius * 1.15, POST.length, 20]} />
            <meshStandardMaterial color="#9aa2aa" metalness={0.92} roughness={0.24} />
          </mesh>
          <mesh position={[0, POST.length + 0.02, 0]}>
            <sphereGeometry args={[0.032, 18, 12]} />
            <meshStandardMaterial color="#6b6f75" metalness={0.2} roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Los discos, en una sola instancia: 12 piezas, un draw call */}
      <instancedMesh ref={platesRef} args={[undefined, undefined, TOTAL]} frustumCulled={false}>
        <cylinderGeometry args={[PLATE.radius, PLATE.radius, PLATE.thickness, 40]} />
        <meshStandardMaterial color="#5a5e64" metalness={0.15} roughness={0.75} />
      </instancedMesh>
      {/* Agarraderas de los discos: un anillo mas claro en el centro */}
      <instancedMesh ref={gripsRef} args={[undefined, undefined, TOTAL]} frustumCulled={false}>
        <torusGeometry args={[0.062, 0.011, 8, 24]} />
        <meshStandardMaterial color={theme.color.orangeDeep} metalness={0.35} roughness={0.55} />
      </instancedMesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} userData={{ noMeasure: true }}>
        <planeGeometry args={[24, 18]} />
        <meshStandardMaterial color={theme.color.black} roughness={0.95} metalness={0} />
      </mesh>

      {postProcessing && <PostProcessing params={params} caps={caps} />}
    </>
  )
}

export default PlateTreeScene
