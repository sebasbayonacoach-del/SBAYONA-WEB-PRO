// StickyStage - escenario narrativo fijo del Scroll Storytelling (Fase 5).
//
// Una seccion alta (longitud declarable: 100vh/200vh/300vh) cuyo interior
// queda FIJO en el viewport mientras el usuario la recorre. El progreso del
// tramo fijado (rango `pin`) conmuta estados A/B/C... que el consumidor
// dibuja con una funcion `children({ index, progress })`.
//
// Presupuesto de calma: el re-render solo ocurre al CRUZAR un umbral de
// estado (nunca por pixel); el progreso fino se entrega como MotionValue
// para animar sin estado de React.
//
// Movimiento reducido / movil: sin fijacion ni altura forzada; los estados
// se apilan como secuencia estatica legible. La narrativa nunca bloquea la
// comprension del contenido.

import { useState } from 'react'
import { useMotionValueEvent } from 'framer-motion'
import { useCapabilities } from '../hooks/useCapabilities.js'
import { useSectionProgress } from './useSectionProgress.js'
import '../../styles/sticky-stage.css'

// Longitud por defecto del tramo de scroll del escenario.
export const STAGE_DEFAULT_LENGTH = '200vh'

/**
 * Valida y normaliza la longitud del tramo de scroll. Solo se aceptan
 * valores `Nvh` entre 100 y 500: fuera de ese rango la narrativa se vuelve
 * montana rusa (o no existe). Funcion PURA y fail-safe.
 *
 * @param {string} [length] Longitud pedida (p. ej. '200vh').
 * @param {string} [fallback=STAGE_DEFAULT_LENGTH] Valor si la pedida es invalida.
 * @returns {string} Longitud segura.
 */
export function resolveStageLength(length, fallback = STAGE_DEFAULT_LENGTH) {
  const candidate = typeof length === 'string' ? length.trim() : ''
  const match = /^([1-9]\d{0,2})vh$/.exec(candidate)
  if (!match) return fallback
  const vh = Number(match[1])
  if (vh < 100 || vh > 500) return fallback
  return `${vh}vh`
}

/**
 * Indice de estado (0..states-1) para un progreso dado. Funcion PURA.
 *
 * @param {number} progress Progreso normalizado 0..1.
 * @param {number} states Numero de estados (>= 1).
 * @returns {number} Indice del estado activo.
 */
export function resolveStageIndex(progress, states) {
  const count = Number.isFinite(states) && states >= 1 ? Math.floor(states) : 1
  const p = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0
  return Math.min(count - 1, Math.floor(p * count))
}

/**
 * Escenario sticky con estados narrativos.
 *
 * Uso:
 *   <StickyStage length="200vh" states={3}>
 *     {({ index, progress }) => <MiEscena estado={index} progreso={progress} />}
 *   </StickyStage>
 *
 * @param {object} props
 * @param {import('react').ReactNode | ({index, progress}) => import('react').ReactNode} props.children
 *   Contenido o funcion de estados. Recibe `index` (estado activo) y
 *   `progress` (MotionValue 0..1 del tramo fijado).
 * @param {string} [props.length='200vh'] Longitud del tramo de scroll.
 * @param {number} [props.states=3] Numero de estados narrativos.
 * @param {number} [props.topOffset=0] Desplazamiento superior del area fija (px).
 * @param {string} [props.className] Clases extra.
 * @param {boolean} [props.allowMobile=false] Mantiene el escenario sticky en móvil.
 *   Es opt-in: por defecto el motor sigue degradando a pila estática.
 * @returns {JSX.Element}
 */
export function StickyStage({
  children,
  length = STAGE_DEFAULT_LENGTH,
  states = 3,
  topOffset = 0,
  className = '',
  allowMobile = false,
}) {
  const { reducedMotion, mode } = useCapabilities()
  const safeLength = resolveStageLength(length)
  const count = Number.isFinite(states) && states >= 1 ? Math.floor(states) : 1
  const { ref, progress } = useSectionProgress({ range: 'pin' })
  const [index, setIndex] = useState(0)

  // Solo re-render al cruzar un umbral de estado: el movimiento fino lo
  // resuelve el MotionValue sin pasar por React.
  useMotionValueEvent(progress, 'change', (value) => {
    setIndex((current) => {
      const next = resolveStageIndex(value, count)
      return next === current ? current : next
    })
  })

  // El contrato del children incluye `isStatic`: en el fallback apilado cada
  // frame debe renderizar SOLO su estado; en el escenario fijo el consumidor
  // pinta todos los estados (superposición con el activo destacado).
  // Fase 9.0-A (hallazgo del arquitecto): sin este flag, cada frame pintaba
  // TODOS los estados -> N×N artículos visibles en móvil/reduced-motion.
  const renderChildren = (stateIndex, stateProgress, isStatic = false) =>
    typeof children === 'function'
      ? children({ index: stateIndex, progress: stateProgress, isStatic })
      : children

  // Movimiento reducido siempre degrada a secuencia estatica.
  // Movil tambien degrada por defecto; capitulos concretos pueden pedir
  // storytelling sticky ligero con allowMobile sin cambiar el contrato global.
  if (reducedMotion || (mode !== 'desktop' && !allowMobile)) {
    return (
      <section className={`sticky-stage sticky-stage--static ${className}`.trim()} ref={ref}>
        {Array.from({ length: count }, (_, stateIndex) => (
          <div className="sticky-stage-frame" key={stateIndex}>
            {renderChildren(stateIndex, count > 1 ? stateIndex / (count - 1) : 1, true)}
          </div>
        ))}
      </section>
    )
  }

  return (
    <section className={`sticky-stage ${className}`.trim()} style={{ height: safeLength }} ref={ref}>
      <div className="sticky-stage-viewport" style={{ top: topOffset }}>
        {renderChildren(index, progress, false)}
      </div>
    </section>
  )
}
