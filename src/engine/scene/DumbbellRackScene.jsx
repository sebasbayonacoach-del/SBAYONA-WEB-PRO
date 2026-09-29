// DumbbellRackScene — mueble de tres pisos con seis parejas de mancuernas.
//
// Objeto real con progresión de verdad: del 5 al 20 kg, y cada pareja más
// gruesa que la anterior. Es el detalle que hace reconocible un mueble de
// mancuernas — si todas miden lo mismo, el ojo lo lee como decorado.
//
//   mueble   1,80 m de ancho · 0,60 m de fondo · 0,78 m de alto · 3 pisos
//   mancuerna 300 mm entre cabezas · cabeza hexagonal de 75 a 160 mm
//
// Cada cabeza y cada mango son DOS `InstancedMesh`: 36 piezas en dos draw
// calls. Como mallas sueltas serían 36 draw calls, que es lo que hunde el
// móvil.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Object3D } from 'three'
import { theme } from '../config/theme.js'
import { readScroll } from '../hooks/useScrollProgress.js'
import { LightingRig } from './LightingRig.jsx'
import { PostProcessing } from './PostProcessing.jsx'
import { StudioEnvironment } from './StudioEnvironment.jsx'

const RACK = { width: 1.8, depth: 0.6, height: 0.78, tierGap: 0.26, post: 0.05 }
const HANDLE = { length: 0.3, radius: 0.016 }

// Progresión real de una batería de 5 a 20 kg: cada cabeza más gruesa que la
// anterior. Es el detalle que hace reconocible el mueble.
const HEADS = [0.075, 0.075, 0.090, 0.090, 0.105, 0.105, 0.120, 0.120, 0.140, 0.140, 0.160, 0.160]
const TIERS = 3

// En FILA a lo ancho del mueble, mango de frente a fondo. Ponerlas en pareja
// lado a lado necesita 2 × diámetro por pareja y, con la de 20 kg, desborda el
// rack: las cabezas se solapan y la fila se convierte en una masa.
//
// El número SÍ viene de `params.instanceCount`, porque el motor lo recorta en
// móvil (MOBILE_MAX_INSTANCES) y quitar mancuernas es una degradación que no
// rompe el objeto. El reparto por pisos se recalcula sobre las que hay: con 8
// serían 3/3/2, no dos pisos llenos y uno vacío.
function layout(count) {
  const perTier = Math.max(1, Math.ceil(count / TIERS))
  return HEADS.slice(0, count).map((head, i) => {
    const tier = Math.floor(i / perTier)
    const slot = i % perTier
    const inTier = Math.min(perTier, count - tier * perTier)
    return {
      x: -RACK.width / 2 + (slot + 0.5) * (RACK.width / inTier),
      y: 0.06 + tier * RACK.tierGap + head + 0.02,
      z: 0,
      head,
      order: i / count,
    }
  })
}

export function DumbbellRackScene({ params, scrollProgress = 0, caps, postProcessing = true }) {
  const headRef = useRef()
  const handleRef = useRef()
  const dummy = useMemo(() => new Object3D(), [])
  const dumbbells = useMemo(
    () => layout(Math.min(HEADS.length, Math.max(1, Math.floor(params?.instanceCount ?? HEADS.length)))),
    [params?.instanceCount],
  )
  const total = dumbbells.length

  useFrame(() => {
    const heads = headRef.current
    const handles = handleRef.current
    if (!heads || !handles) return
    const sp = readScroll(scrollProgress)

    dumbbells.forEach((d, i) => {
      // Entran por pisos según se baja: el mueble se va cargando.
      const appear = caps?.reducedMotion
        ? 1
        : Math.min(1, Math.max(0, (sp - d.order * 0.7) * 5))
      const grown = 0.2 + appear * 0.8

      const capZ = HANDLE.length / 2 + d.head * 0.7
      const y = d.y - (1 - appear) * 0.05

      // Mango y cabezas a lo largo de Z: giro de 90° sobre X
      dummy.rotation.set(Math.PI / 2, 0, 0)

      dummy.position.set(d.x, y, d.z - capZ)
      dummy.scale.setScalar(d.head * grown)
      dummy.updateMatrix()
      heads.setMatrixAt(i * 2, dummy.matrix)

      dummy.position.set(d.x, y, d.z + capZ)
      dummy.updateMatrix()
      heads.setMatrixAt(i * 2 + 1, dummy.matrix)

      dummy.position.set(d.x, y, d.z)
      dummy.scale.set(grown, 1, grown)
      dummy.updateMatrix()
      handles.setMatrixAt(i, dummy.matrix)
    })

    heads.instanceMatrix.needsUpdate = true
    handles.instanceMatrix.needsUpdate = true
  })

  const posts = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => [sx, sz]))

  return (
    <>
      <LightingRig caps={caps} />
      <StudioEnvironment intensity={0.85} />
      {/* Relleno de frente: la cámara va en -Z sin `lookAt` y las luces del rig están
          detrás y arriba; sin esto el mueble entero salía como un borrón negro. */}
      <pointLight position={[0, 0.5, 1.6]} intensity={10} color={theme.color.muted} />

      {/* Bastidor: cuatro patas y tres pares de travesaños donde apoyan */}
      {posts.map(([sx, sz], i) => (
        <mesh key={`post${i}`} position={[sx * (RACK.width / 2 - RACK.post / 2), RACK.height / 2, sz * (RACK.depth / 2 - RACK.post / 2)]}>
          <boxGeometry args={[RACK.post, RACK.height, RACK.post]} />
          <meshStandardMaterial color="#55595f" metalness={0.2} roughness={0.75} />
        </mesh>
      ))}
      {Array.from({ length: TIERS }, (_, tier) =>
        [-1, 1].map((sz) => (
          <mesh
            key={`rail${tier}${sz}`}
            position={[0, 0.06 + tier * RACK.tierGap, sz * (RACK.depth / 2 - RACK.post)]}
          >
            <boxGeometry args={[RACK.width - RACK.post, 0.035, 0.16]} />
            <meshStandardMaterial color="#5b5f65" metalness={0.2} roughness={0.72} />
          </mesh>
        )),
      )}

      {/* Cabezas hexagonales en una instancia: 2 por mancuerna */}
      <instancedMesh ref={headRef} args={[undefined, undefined, total * 2]} frustumCulled={false}>
        <cylinderGeometry args={[1, 1, 0.9, 6]} />
        <meshStandardMaterial color="#64686e" metalness={0.15} roughness={0.78} />
      </instancedMesh>

      {/* Mangos cromados en otra */}
      <instancedMesh ref={handleRef} args={[undefined, undefined, total]} frustumCulled={false}>
        <cylinderGeometry args={[HANDLE.radius, HANDLE.radius, HANDLE.length, 16]} />
        <meshStandardMaterial color="#a8b0b8" metalness={0.95} roughness={0.22} />
      </instancedMesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} userData={{ noMeasure: true }}>
        <planeGeometry args={[24, 18]} />
        <meshStandardMaterial color={theme.color.black} roughness={0.95} metalness={0} />
      </mesh>

      {postProcessing && <PostProcessing params={params} caps={caps} />}
    </>
  )
}

export default DumbbellRackScene
