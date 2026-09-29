// HorizontalPassage - pasaje horizontal controlado por scroll (Fase 5).
//
// El usuario baja con la rueda y el contenido AVANZA EN HORIZONTAL: una via
// de vagones (rail) se desplaza de derecha a izquierda dentro de un tramo
// fijado. El desplazamiento esta 100% gobernado por el progreso del scroll
// (scrub): el usuario tiene el control en todo momento, sin inercias raras
// ni efecto montana rusa.
//
// Limites definidos: el rail se mueve exactamente (ancho del rail - ancho
// del viewport), medido con ResizeObserver; nunca hay overflow accidental
// ni desplazamiento de mas.
//
// Movil / movimiento reducido: el rail se convierte en una pila vertical
// convencional. La narrativa horizontal es un extra de desktop, nunca un
// obstaculo de lectura.

import { useEffect, useRef, useState } from 'react'
import { motion, useTransform } from 'framer-motion'
import { useCapabilities } from '../hooks/useCapabilities.js'
import { resolveStageLength } from './StickyStage.jsx'
import { useSectionProgress } from './useSectionProgress.js'
import '../../styles/horizontal-passage.css'

// Longitud por defecto del tramo de scroll del pasaje.
export const PASSAGE_DEFAULT_LENGTH = '300vh'

/**
 * Pasaje horizontal por scroll.
 *
 * Uso:
 *   <HorizontalPassage length="300vh">
 *     <article>Vagon 1</article>
 *     <article>Vagon 2</article>
 *   </HorizontalPassage>
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children Vagones del rail.
 * @param {string} [props.length='300vh'] Longitud del tramo de scroll.
 * @param {number} [props.gap=32] Separacion entre vagones (px).
 * @param {string} [props.className] Clases extra.
 * @returns {JSX.Element}
 */
export function HorizontalPassage({
  children,
  length = PASSAGE_DEFAULT_LENGTH,
  gap = 32,
  className = '',
}) {
  const { reducedMotion, mode } = useCapabilities()
  const safeLength = resolveStageLength(length, PASSAGE_DEFAULT_LENGTH)
  const safeGap = Number.isFinite(gap) && gap >= 0 ? gap : 32

  const viewportRef = useRef(null)
  const railRef = useRef(null)
  // Recorrido maximo del rail (px): ancho del rail - ancho del viewport.
  const [maxShift, setMaxShift] = useState(0)

  const { ref, progress } = useSectionProgress({ range: 'pin' })
  // Desplazamiento del rail: de 0 a -maxShift segun el progreso del tramo.
  // El MotionValue gobierna el transform sin re-render por fotograma.
  const x = useTransform(progress, [0, 1], [0, -Math.max(0, maxShift)])

  // Medida del recorrido con ResizeObserver: solo actualiza el estado cuando
  // cambian las dimensiones (resize, carga de imagenes), nunca por scroll.
  useEffect(() => {
    if (reducedMotion || mode !== 'desktop') return undefined
    const viewport = viewportRef.current
    const rail = railRef.current
    if (!viewport || !rail || typeof ResizeObserver === 'undefined') return undefined

    const measure = () => {
      const shift = rail.scrollWidth - viewport.clientWidth
      setMaxShift(Number.isFinite(shift) && shift > 0 ? shift : 0)
    }

    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    observer.observe(rail)
    measure()

    return () => observer.disconnect()
  }, [reducedMotion, mode])

  // Movil / movimiento reducido: pila vertical convencional.
  if (reducedMotion || mode !== 'desktop') {
    return (
      <section className={`horizontal-passage horizontal-passage--static ${className}`.trim()} ref={ref}>
        {children}
      </section>
    )
  }

  return (
    <section className={`horizontal-passage ${className}`.trim()} style={{ height: safeLength }} ref={ref}>
      <div className="horizontal-passage-viewport" ref={viewportRef}>
        <motion.div
          className="horizontal-passage-rail"
          ref={railRef}
          style={{ x, '--passage-gap': `${safeGap}px` }}
        >
          {children}
        </motion.div>
      </div>
    </section>
  )
}
