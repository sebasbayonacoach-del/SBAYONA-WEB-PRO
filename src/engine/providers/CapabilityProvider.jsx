// CapabilityProvider - contexto React con las capacidades vivas del dispositivo
// (Requirements 23.1, 23.5).
//
// Envuelve la logica pura de `capabilities.js` en un provider que:
//   - Detecta `(hover: hover)`, `(pointer: fine)`, `(prefers-reduced-motion: reduce)`
//     y el ancho de viewport mediante `matchMedia`.
//   - Se re-evalua EN VIVO durante la sesion ante cambios de esas media queries y
//     de `resize` (R23.5), de modo que el Experience_Engine reacciona sin recargar.
//   - Expone defaults mobile-safe cuando no hay `matchMedia` (SSR / sin DOM).

import { createContext, useEffect, useState } from 'react'
import { DEFAULT_CAPABILITIES, readCapabilities } from './capabilities.js'

// Re-export de la logica pura para que consumidores y tests puedan importarla
// desde el propio provider (interfaz descrita en design.md) ademas de capabilities.js.
export { resolveMode, pointerEffectsEnabled, dprLimit } from './capabilities.js'

/**
 * Contexto con las Capabilities vivas. Valor inicial mobile-safe (R23.1).
 * @type {import('react').Context<import('./capabilities.js').Capabilities>}
 */
export const CapabilityContext = createContext(DEFAULT_CAPABILITIES)

/** Suscribe un handler a una MediaQueryList (con fallback legacy Safari <14). */
function subscribeMedia(mql, handler) {
  if (typeof mql.addEventListener === 'function') mql.addEventListener('change', handler)
  else if (typeof mql.addListener === 'function') mql.addListener(handler)
}

/** Desuscribe el handler de una MediaQueryList (con fallback legacy). */
function unsubscribeMedia(mql, handler) {
  if (typeof mql.removeEventListener === 'function') mql.removeEventListener('change', handler)
  else if (typeof mql.removeListener === 'function') mql.removeListener(handler)
}

/**
 * Provider que recalcula las capacidades ante cambios de matchMedia y resize (R23.5).
 * @param {{ children: import('react').ReactNode }} props
 */
export function CapabilityProvider({ children }) {
  // Inicializador perezoso: lee el entorno una sola vez en el primer render.
  const [capabilities, setCapabilities] = useState(readCapabilities)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined

    const update = () => setCapabilities(readCapabilities())

    const queries = [
      window.matchMedia('(hover: hover)'),
      window.matchMedia('(pointer: fine)'),
      window.matchMedia('(prefers-reduced-motion: reduce)'),
    ]
    queries.forEach((mql) => subscribeMedia(mql, update))
    window.addEventListener('resize', update)

    // Re-sincroniza por si el entorno cambio entre el render inicial y el efecto.
    update()

    return () => {
      queries.forEach((mql) => unsubscribeMedia(mql, update))
      window.removeEventListener('resize', update)
    }
  }, [])

  return <CapabilityContext.Provider value={capabilities}>{children}</CapabilityContext.Provider>
}
