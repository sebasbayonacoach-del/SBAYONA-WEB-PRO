// useSectionProgress - progreso normalizado de SECCION/ELEMENTO del sistema de
// Scroll Storytelling (Fase 5).
//
// Complementa a useScrollProgress (progreso de PAGINA como estado React) y a
// useEngineScroll (progreso de pagina como MotionValue): este hook publica el
// progreso 0..1 de un ELEMENTO a su paso por el viewport como MotionValue, sin
// re-render por fotograma, con rangos de inicio/fin DECLARATIVOS.
//
// Los rangos usan el vocabulario de `useScroll` de Framer Motion
// (`[borde del elemento] [borde del viewport]`), pero el consumidor pide la
// INTENCION narrativa (traverse/enter/pin/exit) y no la fontaneria.

import { useRef } from 'react'
import { useScroll, useTransform } from 'framer-motion'

/**
 * Rangos narrativos predefinidos. Cada entrada es el par `offset` que acepta
 * `useScroll`: `[inicio, fin]` con bordes `start|center|end` del elemento y
 * del viewport.
 *
 *  - traverse: el elemento cruza el viewport completo (defecto; parallax,
 *    derivas y scrubs de acompanamiento).
 *  - enter: desde que el elemento asoma por abajo hasta que su borde superior
 *    alcanza la cima del viewport (fase de entrada).
 *  - pin: desde que el elemento se fija arriba hasta que su borde inferior
 *    llega abajo (secciones sticky / escenarios narrativos).
 *  - exit: la despedida: desde que el centro del elemento alcanza la cima
 *    hasta que su borde inferior sale por arriba.
 */
export const SECTION_RANGES = Object.freeze({
  traverse: Object.freeze(['start end', 'end start']),
  enter: Object.freeze(['start end', 'start start']),
  pin: Object.freeze(['start start', 'end end']),
  exit: Object.freeze(['center start', 'end start']),
})

const EDGES = new Set(['start', 'center', 'end'])

/** Es un offset de Framer Motion valido: dos palabras de borde separadas. */
function isValidOffsetEntry(entry) {
  if (typeof entry !== 'string') return false
  const words = entry.trim().split(/\s+/)
  return words.length === 2 && EDGES.has(words[0]) && EDGES.has(words[1])
}

/**
 * Resuelve un rango declarativo de scroll al par `offset` de Framer Motion.
 * Funcion PURA y fail-safe: cualquier entrada no reconocida degrada al rango
 * `traverse` (el contenido nunca queda atrapado en un rango imposible).
 *
 * @param {string|[string, string]} [range='traverse'] Clave de
 *   `SECTION_RANGES` o un par offset explicito (p. ej. `['start end','center start']`).
 * @returns {[string, string]} Par offset listo para `useScroll`.
 */
export function resolveRange(range = 'traverse') {
  if (Array.isArray(range) && range.length === 2 && range.every(isValidOffsetEntry)) {
    return [range[0], range[1]]
  }
  if (typeof range === 'string' && SECTION_RANGES[range]) {
    return [...SECTION_RANGES[range]]
  }
  return [...SECTION_RANGES.traverse]
}

/**
 * Progreso de scroll normalizado (0..1) de un elemento, como MotionValue.
 *
 * Uso:
 *   const { ref, progress } = useSectionProgress({ range: 'pin' })
 *   return <section ref={ref}>...</section>
 *
 * Con `output`, ademas mapea el progreso a ese rango de salida (p. ej.
 * `[0, -120]` para un desplazamiento), igual que `useScrollLinked` pero con
 * el vocabulario narrativo de rangos de la Fase 5.
 *
 * @param {object} [options]
 * @param {string|[string, string]} [options.range='traverse'] Rango declarativo.
 * @param {[number, number]} [options.output=[0, 1]] Rango de salida opcional.
 * @returns {{
 *   ref: import('react').MutableRefObject<Element|null>,
 *   progress: import('framer-motion').MotionValue<number>,
 *   value: import('framer-motion').MotionValue<number>,
 * }} `ref` a asignar, `progress` crudo 0..1 y `value` mapeado.
 */
export function useSectionProgress({ range = 'traverse', output } = {}) {
  const ref = useRef(null)
  const offset = resolveRange(range)
  const { scrollYProgress } = useScroll({ target: ref, offset })
  // useTransform se llama siempre (reglas de hooks): sin `output` el valor
  // mapeado es identico al progreso.
  const value = useTransform(scrollYProgress, [0, 1], output ?? [0, 1])
  return { ref, progress: scrollYProgress, value }
}
