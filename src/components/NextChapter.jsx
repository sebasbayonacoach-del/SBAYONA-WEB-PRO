/**
 * BAYONA · SIGUIENTE CAPÍTULO
 * ---------------------------------------------------------------------------
 * Cierre de página que anuncia la siguiente parada del recorrido.
 *
 * Se monta una sola vez en App.jsx, debajo de las rutas, así que las 9 páginas
 * del itinerario lo reciben sin tocar su JSX. Las rutas que no forman parte del
 * itinerario (planes, checkout, 404, onboarding) devuelven null desde
 * `nextChapter()` y conservan su propio cierre.
 *
 * Es la pieza que convierte el sitio en recorrido: nunca terminas de leer y te
 * quedas sin saber qué hay después.
 */

import { ArrowRight } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { nextChapter } from '../config/chapters.js'
import { trackEvent } from '../lib/analytics/analytics.js'
import '../styles/next-chapter.css'

export default function NextChapter() {
  const { pathname } = useLocation()
  const chapter = nextChapter(pathname)

  if (!chapter) return null

  return (
    <aside className="next-chapter" aria-label="Siguiente parada del recorrido">
      <Link
        className="next-chapter-link"
        to={chapter.href}
        onClick={() => trackEvent('chapter_advance', { from: pathname, to: chapter.href })}
      >
        <span className="next-chapter-rail" aria-hidden="true">
          <i style={{ '--chapter-progress': `${Math.max(8, Math.round((chapter.step / chapter.total) * 100))}%` }} />
        </span>

        <span className="next-chapter-meta">
          <em>TU RUTA</em>
          <i aria-hidden="true" />
          <b>
            {String(chapter.step).padStart(2, '0')} / {String(chapter.total).padStart(2, '0')}
          </b>
        </span>

        <span className="next-chapter-body">
          <small>{chapter.label}</small>
          <strong>{chapter.title}</strong>
          <p>{chapter.teaser}</p>
        </span>

        <span className="next-chapter-go" aria-hidden="true">
          <ArrowRight size={22} strokeWidth={1.2} />
        </span>
      </Link>
    </aside>
  )
}
