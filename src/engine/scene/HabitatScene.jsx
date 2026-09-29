// HabitatScene — la habitación vacía que se amuebla entrenando.
//
// Arquetipo para el layout `immersive-3d` / preview del dashboard-juego del
// brief: el usuario ve su espacio vacío y, a medida que baja, el equipo entra por
// las ranuras. Es la versión web, barata y sin avatar, de la idea del
// «gimnasio virtual que construyo». Sirve de teaser en /app sin prometer el
// dashboard, que es otro producto.
//
// Ranuras fijas y objetos que entran con scale: cero física, cero assets.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { theme } from '../config/theme.js'
import { readScroll } from '../hooks/useScrollProgress.js'
import { LightingRig } from './LightingRig.jsx'
import { PostProcessing } from './PostProcessing.jsx'

// Cada hueco: posición en la habitación y geometría del objeto que lo ocupa.
const SLOTS = [
  { key: 'rack', at: [-1.05, 0.1, -0.35], kind: 'rack' },
  { key: 'dumbbells', at: [-0.2, -0.62, 0.55], kind: 'pair' },
  { key: 'bench', at: [0.75, -0.55, 0.1], kind: 'bench' },
  { key: 'bags', at: [1.15, 0.35, -0.5], kind: 'stack' },
  { key: 'rings', at: [-0.55, 0.95, -0.6], kind: 'rings' },
]

const ROOM = { width: 3.2, height: 2.4, depth: 2.6 }

export function HabitatScene({ params, scrollProgress = 0, caps, postProcessing = true }) {
  const slotRefs = useRef([])
  const groupRef = useRef()
  const starts = useMemo(() => SLOTS.map((_, i) => 0.08 + (i / SLOTS.length) * 0.82), [])

  useFrame(({ clock }) => {
    const sp = readScroll(scrollProgress)
    if (groupRef.current && !caps?.reducedMotion) {
      groupRef.current.rotation.y = -0.42 + Math.sin(clock.getElapsedTime() * 0.1) * 0.05
    }
    slotRefs.current.forEach((node, index) => {
      if (!node) return
      const fill = Math.min(1, Math.max(0, (sp - starts[index]) / 0.16))
      // Un objeto que entra no aparece: se infla desde el suelo y cae en su sitio.
      const eased = 1 - (1 - fill) ** 3
      node.scale.setScalar(eased || 0.001)
      node.position.y = SLOTS[index].at[1] + (1 - eased) * -0.5
    })
  })

  return (
    <>
      <LightingRig caps={caps} />
      <group ref={groupRef}>
        {/* Concha de la habitación: suelo y fondo. Sin paredes la escena flota
            y no comunica «espacio propio» que es la idea del brief. */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.85, 0]}>
          <planeGeometry args={[ROOM.width, ROOM.depth]} />
          <meshStandardMaterial color={theme.color.black2} roughness={0.95} metalness={0} />
        </mesh>
        <mesh position={[0, 0.35, -ROOM.depth / 2]}>
          <planeGeometry args={[ROOM.width, ROOM.height]} />
          <meshStandardMaterial color={theme.color.black} roughness={0.9} metalness={0} />
        </mesh>

        {SLOTS.map(({ key, at, kind }, index) => (
          <group
            key={key}
            position={at}
            ref={(node) => {
              slotRefs.current[index] = node
            }}
          >
            {kind === 'rack' && (
              <>
                <mesh position={[-0.28, 0, 0]}>
                  <boxGeometry args={[0.07, 1.5, 0.07]} />
                  <meshStandardMaterial color={theme.color.black3} metalness={0.4} roughness={0.5} />
                </mesh>
                <mesh position={[0.28, 0, 0]}>
                  <boxGeometry args={[0.07, 1.5, 0.07]} />
                  <meshStandardMaterial color={theme.color.black3} metalness={0.4} roughness={0.5} />
                </mesh>
                <mesh position={[0, 0.75, 0]}>
                  <boxGeometry args={[0.63, 0.07, 0.07]} />
                  <meshStandardMaterial color={theme.color.orangeDeep} metalness={0.3} roughness={0.45} />
                </mesh>
              </>
            )}
            {kind === 'pair' &&
              [-0.16, 0.16].map((x) => (
                <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.07, 0.07, 0.05, 16]} />
                  <meshStandardMaterial color={theme.color.black3} metalness={0.55} roughness={0.42} />
                </mesh>
              ))}
            {kind === 'bench' && (
              <>
                <mesh position={[0, 0.12, 0]}>
                  <boxGeometry args={[0.62, 0.06, 0.24]} />
                  <meshStandardMaterial color={theme.color.orangeFire} roughness={0.7} metalness={0.1} />
                </mesh>
                <mesh position={[0, -0.12, 0]}>
                  <boxGeometry args={[0.5, 0.18, 0.16]} />
                  <meshStandardMaterial color={theme.color.black3} roughness={0.8} metalness={0.1} />
                </mesh>
              </>
            )}
            {kind === 'stack' &&
              [0, 0.14, 0.28].map((y) => (
                <mesh key={y} position={[0, y, 0]}>
                  <icosahedronGeometry args={[0.11, 1]} />
                  <meshStandardMaterial
                    color={y === 0.14 ? theme.color.orange : theme.color.black3}
                    flatShading
                    roughness={0.6}
                    metalness={0.15}
                  />
                </mesh>
              ))}
            {kind === 'rings' &&
              [-0.12, 0.12].map((x) => (
                <mesh key={x} position={[x, 0, 0]}>
                  <torusGeometry args={[0.1, 0.012, 6, 32]} />
                  <meshBasicMaterial color={theme.color.orange} transparent opacity={0.85} />
                </mesh>
              ))}
          </group>
        ))}
      </group>

      {postProcessing && <PostProcessing params={params} caps={caps} />}
    </>
  )
}

export default HabitatScene
