// useScrollProgress - fuente UNICA de progreso de scroll normalizado 0..1
// (Requirements 7.3, 19.2).
//
// Si recibe una instancia de Lenis, escucha su evento `scroll` y usa
// `lenis.progress` (ya normalizado 0..1) como unica fuente de verdad (R19.2).
// Si no hay Lenis (p. ej. `reducedMotion` -> scroll nativo), cae a un listener
// `scroll` de `window` calculando el progreso a partir del documento. El listener
// se limpia siempre al desmontar.

import { useEffect, useState } from 'react'

/**
 * Restringe un numero al rango [0, 1]; devuelve 0 si no es finito.
 * @param {number} value
 * @returns {number}
 */
function clamp01(value) {
  if (!Number.isFinite(value)) return 0
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

/**
 * Progreso del scroll nativo del documento como fraccion 0..1.
 * Devuelve 0 cuando el contenido no desborda (divisor <= 0).
 * @returns {number}
 */
function readNativeProgress() {
  if (typeof document === 'undefined') return 0
  const el = document.documentElement
  const scrollTop =
    typeof window !== 'undefined' && typeof window.scrollY === 'number' ? window.scrollY : el.scrollTop
  const scrollable = el.scrollHeight - el.clientHeight
  if (scrollable <= 0) return 0
  return clamp01(scrollTop / scrollable)
}

/**
 * Devuelve el progreso de scroll normalizado (0..1) como estado reactivo.
 *
 * @param {import('lenis').default|null} [lenis] Instancia de Lenis o `null`.
 * @returns {number} Progreso normalizado en [0, 1].
 */
export function useScrollProgress(lenis) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Camino Lenis: `lenis.progress` ya viene normalizado 0..1 (R19.2).
    if (lenis && typeof lenis.on === 'function') {
      const onScroll = () => setProgress(clamp01(lenis.progress))
      lenis.on('scroll', onScroll)
      onScroll() // sincroniza el valor inicial
      return () => {
        if (typeof lenis.off === 'function') lenis.off('scroll', onScroll)
      }
    }

    // Fallback: scroll nativo del navegador.
    if (typeof window === 'undefined') return undefined
    const onScroll = () => setProgress(readNativeProgress())
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // sincroniza el valor inicial
    return () => window.removeEventListener('scroll', onScroll)
  }, [lenis])

  return progress
}

/**
 * Lee el progreso de scroll desde una fuente heterogenea SIN provocar re-render.
 *
 * Funcion PURA pensada para llamarse dentro de un `useFrame`/render loop: acepta
 * la FUENTE UNICA del engine como `MotionValue` (se lee con `.get()`, R19.2) o
 * un numero simple ya resuelto, y devuelve siempre un numero utilizable.
 *
 * @param {import('framer-motion').MotionValue<number>|number|null|undefined} source
 *   Fuente de progreso: un `MotionValue` (con metodo `.get`), un numero, o
 *   cualquier otro valor.
 * @returns {number} `source.get()` si es un MotionValue; `source` si es numero;
 *   `0` en cualquier otro caso.
 */
export function readScroll(source) {
  if (source && typeof source.get === 'function') return source.get()
  if (typeof source === 'number') return source
  return 0
}
