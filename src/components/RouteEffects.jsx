/**
 * BAYONA · EFECTOS DE CAMBIO DE RUTA
 * ---------------------------------------------------------------------------
 * Dos huecos que tenía la SPA en cada navegación:
 *
 * 1. Accesibilidad. Al cambiar de ruta no se anunciaba nada ni se movía el
 *    foco. Con lector de pantalla, pulsar un enlace del menú no producía
 *    ninguna señal: el foco seguía donde estaba y el contenido cambiaba en
 *    silencio. Aquí se anuncia el nuevo título y se lleva el foco al inicio
 *    del contenido principal.
 *
 * 2. Medición. Se registra la vista de página en cada navegación (GA4 y
 *    Plausible no lo detectan solos en una SPA con History API).
 *
 * El reset de scroll ya lo hace PageTransition (R12.3), así que no se duplica.
 */

import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from '../lib/analytics/analytics.js'
import { resolveRouteMeta } from '../lib/seo/routeMeta.js'
import '../styles/route-effects.css'

export default function RouteEffects() {
  const { pathname } = useLocation()
  const [announcement, setAnnouncement] = useState('')
  /**
   * La carga inicial no se anuncia ni roba el foco: sería intrusivo. Se guarda
   * la ruta anterior en vez de un booleano porque StrictMode (dev) re-ejecuta
   * los efectos al montar: con un booleano, la segunda pasada se creía una
   * navegación y movía el foco a <main> nada más cargar, rompiendo el orden de
   * tabulación real (el skip link dejaba de ser el primer foco).
   */
  const prevPathname = useRef(null)

  useEffect(() => {
    const meta = resolveRouteMeta(pathname)

    trackPageView({ path: pathname, title: meta.fullTitle })

    if (prevPathname.current === null || prevPathname.current === pathname) {
      prevPathname.current = pathname
      return
    }
    prevPathname.current = pathname

    setAnnouncement(meta.fullTitle)

    /**
     * Se mueve el foco al contenedor principal para que el lector empiece a
     * leer la página nueva y el tabulador continúe desde arriba.
     * `preventScroll` evita pelearse con el reset de PageTransition.
     */
    const main = document.getElementById('main-content')
    if (main) {
      main.setAttribute('tabindex', '-1')
      main.focus({ preventScroll: true })
      /** Se retira el tabindex al perder el foco: no debe quedar tabulable. */
      main.addEventListener('blur', () => main.removeAttribute('tabindex'), { once: true })
    }
  }, [pathname])

  return (
    <p className="route-announcer" role="status" aria-live="polite" aria-atomic="true">
      {announcement}
    </p>
  )
}
