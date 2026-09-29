// useSticky - hook de infraestructura de scroll del Design System (Fase 3).
//
// Completa el juego de hooks de scroll del engine: useReveal (aparicion),
// useScrollProgress (progreso), Parallax (desplazamiento relativo),
// PageTransition (cortina) y este: estado PINNED de un elemento fijo.
//
// Devuelve un `ref` para el elemento y `stuck` (boolean): `true` cuando el
// elemento alcanza su limite de fijacion (topOffset). Con eso la UI puede
// encender un estado (sombra, borde, fondo) sin que cada pagina reimplemente
// la escucha de scroll. Preparado para las migraciones de pagina; la Fase 3
// no lo aplica a ninguna ruta publica.
//
// Respeta el presupuesto de rendimiento: una sola escucha pasiva, lecturas
// acotadas por requestAnimationFrame y limpieza completa al desmontar.

import { useEffect, useRef, useState } from 'react'

/**
 * Observa cuando un elemento queda fijado en su limite de scroll.
 *
 * @param {{topOffset?: number}} [options] `topOffset` es la distancia (px)
 *   desde la parte superior del viewport a la que el elemento se considera
 *   fijado (defecto 0).
 * @returns {{ref: import('react').RefObject<HTMLElement|null>, stuck: boolean}}
 */
export function useSticky({ topOffset = 0 } = {}) {
  const ref = useRef(null)
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || typeof window === 'undefined') return undefined

    let frame = 0

    const update = () => {
      frame = 0
      const rect = node.getBoundingClientRect()
      setStuck(rect.top <= topOffset + 1)
    }

    const schedule = () => {
      if (!frame && typeof window.requestAnimationFrame === 'function') {
        frame = window.requestAnimationFrame(update)
      }
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame && typeof window.cancelAnimationFrame === 'function') {
        window.cancelAnimationFrame(frame)
      }
    }
  }, [topOffset])

  return { ref, stuck }
}
