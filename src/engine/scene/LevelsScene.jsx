// LevelsScene — los cuatro niveles de acompañamiento como anillos que se llenan.
//
// Arquetipo para el layout `data`. Sustituye la fila de cuatro tarjetas negras
// idénticas de /programs por un solo objeto que muestra progreso: cada nivel es
// un anillo y el scroll lo va completando de dentro hacia fuera
// (raíz → fuerza → rendimiento → élite).
//
// Los arcos se reconstruyen por peldaño cuantizado, no por fotograma: rehacer
// geometría 60 veces por segundo es la forma más tonta de tirar el LCP móvil.

import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { theme } from '../config/theme.js'
import { readScroll } from '../hooks/useScrollProgress.js'
import { LightingRig } from './LightingRig.jsx'
import { PostProcessing } from './PostProcessing.jsx'

const LEVELS = [
  { key: 'raiz', radius: 0.62, color: theme.color.muted },
  { key: 'fuerza', radius: 0.86, color: theme.color.orangeDeep },
  { key: 'rendimiento', radius: 1.1, color: theme.color.orangeFire },
  { key: 'elite', radius: 1.34, color: theme.color.orange },
]
const ARC_STEPS = 24
const FULL_ARC = Math.PI * 1.75

export function LevelsScene({ params, scrollProgress = 0, caps, postProcessing = true }) {
  const [quantized, setQuantized] = useState(0)
  const groupRef = useRef()

  const arcs = useMemo(() => {
    const step = Math.round(quantized * ARC_STEPS) / ARC_STEPS
    return LEVELS.map((level, index) => {
      const share = Math.min(1, Math.max(0, step * LEVELS.length - index))
      return { ...level, sweep: FULL_ARC * share, empty: share <= 0.001 }
    })
  }, [quantized])

  useFrame(({ clock }) => {
    const sp = readScroll(scrollProgress)
    // Estado solo cuando cambia el peldaño: 24 reconstrucciones por recorrido,
    // no 60 por segundo.
    setQuantized((prev) => {
      const next = Math.round(sp * ARC_STEPS) / ARC_STEPS
      return Math.abs(next - prev) > 0.001 ? next : prev
    })
    if (groupRef.current && !caps?.reducedMotion) {
      groupRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.14) * 0.05
    }
  })

  return (
    <>
      <LightingRig caps={caps} />
      <group ref={groupRef} rotation={[-0.5, 0, 0]}>
        {arcs.map(({ key, radius, color, sweep }) => (
          <group key={key}>
            {/* Pista vacía: sin ella el anillo lleno no comunica avance. */}
            <mesh>
              <torusGeometry args={[radius, 0.014, 6, 72]} />
              <meshBasicMaterial color={theme.color.black3} transparent opacity={0.9} />
            </mesh>
            {sweep > 0.001 && (
              <mesh rotation={[0, 0, -Math.PI / 2]}>
                <torusGeometry args={[radius, 0.026, 8, 72, sweep]} />
                <meshStandardMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={0.5}
                  roughness={0.4}
                  metalness={0.2}
                />
              </mesh>
            )}
          </group>
        ))}
      </group>

      {postProcessing && <PostProcessing params={params} caps={caps} />}
    </>
  )
}

export default LevelsScene
