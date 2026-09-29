// Variantes reutilizables de Framer Motion del Motion_System.
//
// unica fuente de tiempos = motionTokens (R10.4): ninguna duracion, curva de
// easing ni delay de stagger se escribe como literal aqui; todos derivan de
// `motionTokens`. La Property 7 del diseno verifica esa invariante recorriendo
// las variantes con `collectTimings`.

import { motionTokens } from '../config/motionTokens.js'

/**
 * Reveal de entrada: desliza hacia arriba mientras aparece.
 * La duracion y la curva provienen de `motionTokens` (R10.4, R10.5).
 * @type {import('framer-motion').Variants}
 */
export const revealUp = {
  hidden: { opacity: 0, y: motionTokens.distance.near },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionTokens.duration.base,
      ease: motionTokens.ease.entrance,
    },
  },
}

/**
 * Factory de escalonado (stagger) para orquestar hijos.
 * El retraso por hijo sale de `motionTokens` por defecto (R10.4).
 * @param {number} [staggerDelay=motionTokens.duration.fast] Retraso entre hijos en segundos.
 * @returns {import('framer-motion').Variants} Variante con `staggerChildren`.
 */
export const stagger = (staggerDelay = motionTokens.duration.fast) => ({
  visible: {
    transition: {
      staggerChildren: staggerDelay,
    },
  },
})

/**
 * Estado de hover: leve aumento de escala (la escala NO es un valor de tiempo).
 * La duracion y la curva derivan de `motionTokens` (R10.4).
 * @type {import('framer-motion').TargetAndTransition}
 */
export const hoverScale = {
  scale: 1.03,
  transition: {
    duration: motionTokens.duration.fast,
    ease: motionTokens.ease.standard,
  },
}

/**
 * Estado de pulsacion (tap): leve reduccion de escala.
 * La duracion y la curva derivan de `motionTokens` (R10.4).
 * @type {import('framer-motion').TargetAndTransition}
 */
export const tap = {
  scale: 0.97,
  transition: {
    duration: motionTokens.duration.fast,
    ease: motionTokens.ease.standard,
  },
}

/**
 * Funcion PURA que recorre un objeto variante y recolecta todos los valores de
 * tiempo declarados en cualquier `transition` anidada. `staggerChildren` se
 * trata como una duracion. No muta la entrada.
 *
 * Permite verificar la invariante R10.4: toda duracion recolectada debe
 * pertenecer a `motionTokens.duration` y todo easing a `motionTokens.ease`.
 *
 * @param {unknown} variant Objeto variante (o subarbol) de Framer Motion.
 * @returns {{ durations: number[], eases: Array }} Tiempos y curvas hallados.
 */
export function collectTimings(variant) {
  /** @type {number[]} */
  const durations = []
  /** @type {Array} */
  const eases = []

  const extractFromTransition = (transition) => {
    if (typeof transition.duration === 'number') {
      durations.push(transition.duration)
    }
    if (typeof transition.staggerChildren === 'number') {
      durations.push(transition.staggerChildren)
    }
    if (transition.ease !== undefined) {
      eases.push(transition.ease)
    }
  }

  const visit = (node) => {
    if (node === null || typeof node !== 'object' || Array.isArray(node)) {
      return
    }
    for (const [key, value] of Object.entries(node)) {
      if (
        key === 'transition' &&
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value)
      ) {
        extractFromTransition(value)
      }
      visit(value)
    }
  }

  visit(variant)
  return { durations, eases }
}
