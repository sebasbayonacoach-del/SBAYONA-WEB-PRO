// useLenis - hook de smooth scroll con Lenis en CARGA DIFERIDA (Requirements 19.1, 19.3, 19.4).
//
// ÍTEM 4 (perf): `lenis` ya NO viaja en el entry. Se trae con `import()`
// dinámico SOLO cuando aplica smooth scroll real:
//   - `reducedMotion === false` (no `prefers-reduced-motion: reduce`), Y
//   - puntero fino (`finePointer === true`, es decir `(pointer: fine)`).
// En cualquier otro caso el fallback es el scroll nativo del navegador (R19.3)
// y el hook devuelve un ref cuyo `current` es `null`.
//
// Contrato `window.lenis` (tooling externo para scroll programático):
//   - Cuando Lenis carga, `window.lenis` ES la instancia viva.
//   - Cuando NO carga (nativo), `window.lenis` es un shim con `scrollTo`
//     nativo + noops de `on/off/raf/destroy` para no romper llamadas externas.
// El shim se marca con `__bayonaShim: true` para distinguirlo.

import { useEffect, useRef, useState } from 'react'

/** Noop compartido por el shim. */
function noop() {
  return undefined
}

/**
 * Shim mínimo con la superficie que el tooling externo usa (`scrollTo`),
 * más noops para no romper si alguien llama `on/off/raf/destroy`.
 */
function createLenisShim() {
  return {
    __bayonaShim: true,
    on: noop,
    off: noop,
    raf: noop,
    destroy: noop,
    start: noop,
    stop: noop,
    /**
     * Scroll programático nativo. Acepta número (px), selector o elemento,
     * como `lenis.scrollTo`. Siempre instantáneo (`auto`): el shim solo
     * existe donde NO aplica suavizado (reduced-motion o puntero grueso).
     */
    scrollTo(target, _options) {
      if (typeof window === 'undefined') return
      try {
        if (typeof target === 'number' && Number.isFinite(target)) {
          window.scrollTo({ top: target, left: 0, behavior: 'auto' })
        } else if (typeof target === 'string') {
          const el = document.querySelector(target)
          if (el) el.scrollIntoView({ behavior: 'auto' })
        } else if (target instanceof Element) {
          target.scrollIntoView({ behavior: 'auto' })
        } else {
          window.scrollTo(0, 0)
        }
      } catch {
        window.scrollTo(0, 0)
      }
    },
  }
}

/** Asegura que `window.lenis` exista como shim (solo si no hay instancia real). */
function ensureLenisShim() {
  if (typeof window === 'undefined') return null
  const current = window.lenis
  if (current && !current.__bayonaShim) return current
  const shim = createLenisShim()
  window.lenis = shim
  return shim
}

/**
 * Monta una instancia de Lenis para smooth scroll y expone la instancia viva.
 *
 * Con `reducedMotion` o sin puntero fino NO se instancia Lenis: se respeta el
 * scroll nativo (R19.3) y el hook devuelve `{ ref }` con `current === null`.
 * En caso contrario trae `lenis` con `import()` dinámico (chunk separado,
 * fuera del entry), crea `new Lenis(...)` y sincroniza su reloj interno con
 * un bucle `requestAnimationFrame` -> `lenis.raf(time)` (R19.1).
 *
 * Al desmontar (o al cambiar de modo) detiene el bucle con
 * `cancelAnimationFrame` y libera listeners con `destroy()`, EXACTAMENTE una
 * vez (R19.4).
 *
 * @param {{ reducedMotion?: boolean, finePointer?: boolean }} [options]
 * @param {boolean} [options.reducedMotion=false] Si es `true` no se instancia
 *   Lenis y se usa el scroll nativo del navegador (R19.3).
 * @param {boolean} [options.finePointer=true] Si es `false` (puntero grueso /
 *   táctil) no se instancia Lenis: el suavizado inercial solo aplica con
 *   puntero fino.
 * @returns {{ ref: import('react').MutableRefObject<*|null>, ready: number }}
 *   `ref` cuyo `current` es la instancia de Lenis (o `null` en nativo), y
 *   `ready`, un contador que cambia cuando la instancia (des)aparece para que
 *   el consumidor pueda re-suscribirse al camino correcto.
 */
export function useLenis({ reducedMotion = false, finePointer = true } = {}) {
  const lenisRef = useRef(null)
  const [ready, setReady] = useState(0)

  useEffect(() => {
    // Sin smooth scroll real: scroll nativo + shim para `window.lenis`.
    if (reducedMotion || finePointer === false) {
      lenisRef.current = null
      ensureLenisShim()
      return undefined
    }

    let cancelled = false
    /** @type {*|null} */
    let lenis = null
    let rafId = 0
    let settled = false

    ;(async () => {
      try {
        const mod = await import('lenis')
        if (cancelled) return
        const LenisCtor = mod.default ?? mod.Lenis ?? mod
        lenis = new LenisCtor()
        if (cancelled) {
          try {
            lenis.destroy()
          } catch {
            // Intencionalmente vacío: la instancia se descarta al cancelar.
          }
          return
        }
        lenisRef.current = lenis
        if (typeof window !== 'undefined') window.lenis = lenis
        settled = true
        setReady((generation) => generation + 1)

        // Bucle raf único: alimenta el reloj interno de Lenis en cada fotograma.
        rafId = requestAnimationFrame(function raf(time) {
          if (cancelled) return
          try {
            lenis.raf(time)
          } catch {
            // Intencionalmente vacío: un frame malo no tumba el bucle.
          }
          rafId = requestAnimationFrame(raf)
        })
      } catch {
        // Si la carga diferida falla (red/bundle): nativo + shim, sin romper.
        if (!cancelled) {
          lenisRef.current = null
          ensureLenisShim()
        }
      }
    })()

    // Cleanup: detiene el bucle y libera listeners EXACTAMENTE una vez (R19.4).
    return () => {
      cancelled = true
      if (rafId) {
        try {
          cancelAnimationFrame(rafId)
        } catch {
          // Intencionalmente vacío: el bucle ya no existe.
        }
        rafId = 0
      }
      if (lenis) {
        try {
          lenis.destroy()
        } catch {
          // Intencionalmente vacío: destruir dos veces no debe lanzar.
        }
      }
      lenisRef.current = null
      if (settled || (typeof window !== 'undefined' && window.lenis === lenis)) {
        ensureLenisShim()
      }
    }
  }, [reducedMotion, finePointer])

  return { ref: lenisRef, ready }
}
