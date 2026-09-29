/*
 * Un elemento `position: fixed` en una esquina del shell tapa contenido al
 * pasar: eso es normal en cualquier web. Lo que no es normal es que se le
 * clique ENCIMA y no deje pulsar lo que hay debajo.
 *
 * Medido en BAYONA con `probe-solapes.mjs` / `probe-overlays.mjs`:
 *  · el botón de WhatsApp se llevaba por delante cuatro preguntas del acordeón
 *    de `/faq` (03, 04, 08, 09);
 *  · el orbe del acompañante y el chip de crédito se comían el precio de la
 *    portada y el botón «ACTIVAR RAÍZ» en las cuatro fichas de plan a 390 px
 *    (`elementFromPoint` sobre el texto del precio devolvía el `<button>` del
 *    orbe: clic perdido, no solo estética).
 *
 * La regla que resuelve lo segundo sin quitar la funcionalidad que pidió el
 * proyecto: mientras la página se mueve, la capa se aparta y suelta el puntero;
 * vuelve 280 ms después del último scroll. Nadie clica un flotante mientras
 * scrollea, así que no se pierde ningún uso real. Es el mismo principio con que
 * el dron ya se repliega solo.
 */
import { useEffect, useState } from 'react'

/**
 * @param {number} espera  ms sin scroll después de los cuales la capa vuelve.
 * @returns {boolean} `true` mientras el usuario está moviendo la página.
 */
export function useRecedeWhileScrolling(espera = 280) {
  const [moviendo, setMoviendo] = useState(false)

  useEffect(() => {
    let temporizador
    const alMover = () => {
      setMoviendo(true)
      window.clearTimeout(temporizador)
      temporizador = window.setTimeout(() => setMoviendo(false), espera)
    }
    window.addEventListener('scroll', alMover, { passive: true })
    return () => {
      window.removeEventListener('scroll', alMover)
      window.clearTimeout(temporizador)
    }
  }, [espera])

  return moviendo
}
