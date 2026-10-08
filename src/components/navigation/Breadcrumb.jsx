/**
 * BAYONA · MIGA DE PAN (FASE 4)
 * ---------------------------------------------------------------------------
 * El sistema de POSICIÓN: responde "dónde estoy dentro del sitio".
 *
 * Es el cuarto sistema de navegación y el único que faltaba por existir:
 * · Navbar        — dónde puedo ir.
 * · NextChapter   — qué viene después (itinerario de chapters.js).
 * · JourneyRibbon — progreso personal (solo tras pasar por recepción).
 * · Breadcrumb    — posición jerárquica (este componente).
 *
 * El dato ya existía en routeMeta.js (y lo consume el JSON-LD BreadcrumbList);
 * solo faltaba la pieza visible. Se monta una sola vez en App.jsx, dentro de
 * <main>, y decide por ruta:
 * · Home no pinta nada (su trail está vacío: ya estás en la raíz).
 * · Recepción (/onboarding, /entrar) es inmersiva y oculta el chrome.
 * · /design-system es interna; el 404 tiene su propia recuperación.
 * · Las rutas editoriales principales (About, Programas, Recursos, Shop y
 *   Comunidad) ya nombran su posición dentro del propio hero, así que no
 *   duplican una segunda franja de navegación antes del contenido.
 * · El embudo (/checkout, /order-confirmation) sí la muestra: incluso dentro
 *   del embudo la persona necesita saber dónde está y cómo volver.
 */

import { Link, useLocation } from 'react-router-dom'
import { resolveRouteMeta } from '../../lib/seo/routeMeta.js'
import '../../styles/breadcrumb.css'

/** Rutas donde la miga estorba en lugar de orientar. */
const HIDDEN_ON = new Set(['/onboarding', '/entrar', '/design-system', '/about', '/programs', '/resources', '/shop', '/community'])

export default function Breadcrumb() {
  const { pathname } = useLocation()
  const meta = resolveRouteMeta(pathname)

  if (meta.isNotFound || HIDDEN_ON.has(meta.canonicalPath)) return null

  const trail = meta.breadcrumb ?? []
  if (trail.length === 0) return null

  return (
    <nav className="breadcrumb" data-route={meta.canonicalPath} aria-label="Miga de pan">
      <ol className="breadcrumb-trail">
        <li className="breadcrumb-item">
          <Link to="/">Inicio</Link>
        </li>
        {trail.map(([label, href], index) => {
          const isLast = index === trail.length - 1

          return (
            <li className="breadcrumb-item" key={href}>
              {isLast
                ? <span aria-current="page">{label}</span>
                : <Link to={href}>{label}</Link>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
