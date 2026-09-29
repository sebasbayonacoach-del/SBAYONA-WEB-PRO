// useReveal - deteccion de entrada en viewport para reveals
// (Requirements 11.1, 11.2, 11.3, 11.4).
//
// Envuelve `useInView` de Framer Motion con `once: true` para que el reveal
// ocurra UNA sola vez y no se repita al volver a hacer scroll (R11.3). Expone
// ademas `useScrollLinked`, una utilidad opcional que vincula el progreso de
// scroll de un elemento a un rango de salida mediante `useScroll` +
// `useTransform` (R11.4), evitando duplicar esa fontaneria en cada consumidor.

import { useRef } from 'react'
import { useInView, useScroll, useTransform } from 'framer-motion'

/**
 * Observa un elemento y avisa cuando entra en el viewport una unica vez.
 *
 * Uso:
 *   const { ref, inView } = useReveal()
 *   return <section ref={ref}>{inView && <Contenido />}</section>
 *
 * @param {import('framer-motion').UseInViewOptions} [options] Opciones extra para `useInView`
 *   (p. ej. `margin` o `amount`). `once` ya viene forzado a `true`.
 * @returns {{ ref: import('react').MutableRefObject<Element|null>, inView: boolean }}
 *   `ref` a asignar al elemento observado e `inView` con su estado de visibilidad.
 */
export function useReveal(options = {}) {
  const ref = useRef(null)
  // `once: true` => el estado pasa a visible al entrar y NO vuelve a ocultarse (R11.3).
  const inView = useInView(ref, { once: true, ...options })
  return { ref, inView }
}

/**
 * Vincula el progreso de scroll de un elemento a un rango de salida (R11.4).
 * Util para efectos ligados al scroll (parallax, opacidad, desplazamiento) sin
 * repetir la combinacion `useScroll` + `useTransform`.
 *
 * Uso:
 *   const { ref, value } = useScrollLinked([0, 1], [0, -80])
 *   return <motion.div ref={ref} style={{ y: value }} />
 *
 * @template T
 * @param {[number, number]} [range=[0, 1]] Rango de entrada del progreso normalizado (0..1).
 * @param {[T, T]} [output=[0, 1]] Rango de salida al que se mapea el progreso.
 * @param {import('framer-motion').UseScrollOptions} [scrollOptions] Opciones para `useScroll`
 *   (p. ej. `{ offset: ['start end', 'end start'] }`). El `target` se rellena con el ref interno.
 * @returns {{
 *   ref: import('react').MutableRefObject<Element|null>,
 *   value: import('framer-motion').MotionValue<T>,
 *   scrollYProgress: import('framer-motion').MotionValue<number>
 * }} `ref` a asignar, `value` mapeado y el `scrollYProgress` crudo por si se necesita.
 */
export function useScrollLinked(range = [0, 1], output = [0, 1], scrollOptions = {}) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, ...scrollOptions })
  const value = useTransform(scrollYProgress, range, output)
  return { ref, value, scrollYProgress }
}
