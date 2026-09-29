// ParkourScene — trayectoria 3D de Parkour Academy
// Fase 11.3 · Experiencia inmersiva Awwwards-grade
//
// La progresion de aprendizaje es un CAMINO 3D que sube, gira y desbloquea
// niveles: plataformas ascendentes y anillos de checkpoint. El visitante ve su
// progresion como geometria viva. Se monta via SceneMount con lazy loading y
// degrada a la lista estatica de niveles (cinematic-stage 2D) si WebGL falla.

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { theme } from '../config/theme.js'
import { LightingRig } from './LightingRig.jsx'
import { ParticleField } from './ParticleField.jsx'
import { PostProcessing } from './PostProcessing.jsx'

// Niveles del camino de aprendizaje (orden de progresion).
const LEVELS = [
  { id: 'RAIZ', label: 'Raíz' },
  { id: 'FUERZA', label: 'Fuerza' },
  { id: 'RENDIMIENTO', label: 'Rendimiento' },
  { id: 'ELITE', label: 'Elite' },
]

const STEP_X = 1.05
const STEP_Y = 0.62

/**
 * Escena 3D de la trayectoria de Parkour Academy.
 * @param {Object} props
 * @param {import('../config/sceneConfig.js').ResolvedScene['params']} props.params
 * @param {import('../providers/capabilities.js').Capabilities} [props.caps]
 * @param {boolean} [props.particles=true]
 * @param {boolean} [props.postProcessing=true]
 */
export function ParkourScene({ params, caps, particles = true, postProcessing = true }) {
  const groupRef = useRef()

  // Plataformas: suben y se desplazan en zigzag; el nivel final es la meta.
  const platforms = useMemo(
    () =>
      LEVELS.map((level, i) => ({
        ...level,
        position: [(i - (LEVELS.length - 1) / 2) * STEP_X, i * STEP_Y, 0],
        isFinal: i === LEVELS.length - 1,
      })),
    [],
  )

  // Deriva lenta del conjunto: la trayectoria flota como geometria viva.
  useFrame(({ clock }) => {
    if (!groupRef.current || caps?.reducedMotion) return
    const t = clock.getElapsedTime()
    groupRef.current.rotation.y = Math.sin(t * 0.09) * 0.05
    groupRef.current.position.y = Math.sin(t * 0.14) * 0.04
  })

  return (
    <group ref={groupRef}>
      <LightingRig caps={caps} />

      {platforms.map(({ id, position, isFinal }, index) => (
        <group key={id} position={position}>
          {/* Plataforma del nivel: mas pequena y oscura cuanto mas alta */}
          <mesh position={[0, -0.05, 0]} castShadow>
            <boxGeometry args={[0.85, 0.1, 0.85]} />
            <meshStandardMaterial
              color={isFinal ? theme.color.orangeDeep : theme.color.black3}
              roughness={0.5}
              metalness={0.3}
            />
          </mesh>

          {/* Anillo de checkpoint: corona luminosa sobre la plataforma */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.28, 0]}>
            <torusGeometry args={[0.3, 0.022, 10, 40]} />
            <meshBasicMaterial
              color={isFinal ? theme.color.orange : theme.color.muted}
              transparent
              opacity={0.9}
            />
          </mesh>

          {/* Conector al siguiente nivel: la trayectoria es visible */}
          {index < platforms.length - 1 && (
            <mesh
              position={[STEP_X / 2, STEP_Y / 2 - 0.05, 0]}
              rotation={[0, 0, -Math.atan2(STEP_Y, STEP_X)]}
            >
              <boxGeometry args={[Math.hypot(STEP_X, STEP_Y), 0.025, 0.025]} />
              <meshBasicMaterial color={theme.color.orange} transparent opacity={0.4} />
            </mesh>
          )}
        </group>
      ))}

      {particles && <ParticleField params={params} scrollProgress={0} caps={caps} />}
      {postProcessing && <PostProcessing params={params} caps={caps} />}
    </group>
  )
}

// Default export requerido por `React.lazy` (Scene_Registry).
export default ParkourScene
