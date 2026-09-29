import { motion } from 'framer-motion'
// Import DIRECTO del provider (no el barrel) para leer la FUENTE UNICA de scroll.
import { useEngineScroll } from '../engine/providers/ExperienceProvider.jsx'

// Barra de progreso de scroll (R19.2). Consume el `MotionValue` 0..1 publicado
// por el Experience_Engine en vez de mantener su propio estado/listener: sin
// re-render por-fotograma. Fuera del provider (`progress === null`) queda a 0.
export function ScrollProgress() {
  const progress = useEngineScroll()
  return (
    <div className="scroll-progress" aria-hidden="true">
      <motion.i style={progress ? { scaleX: progress, transformOrigin: '0% 50%' } : { scaleX: 0 }} />
    </div>
  )
}
