/**
 * El cierre visual de BAYONA recupera la intención de NextChapter de la web
 * original: desde cualquier página editorial se abre la siguiente, mientras
 * las demás siguen a un toque. No añade misiones, pasos de pago ni rutas nuevas.
 */
import { ArrowUpRight } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { trackEvent } from '../lib/analytics/analytics.js'
import './editorial-outro.css'

export const OUTRO_DESTINATIONS = Object.freeze([
  { href: '/', name: 'Inicio', title: 'TODO EMPIEZA CON UN MOVIMIENTO.', description: 'Conoce una forma de entrenar que empieza escuchándote.', image: '/images/bayona-generated/home-method-1600.webp' },
  { href: '/about', name: 'Nosotros', title: 'DETRÁS DEL MOVIMIENTO.', description: 'La historia, el propósito y las personas que cuidan de este proyecto.', image: '/images/bayona-generated/about-hero-1600.webp' },
  { href: '/programs', name: 'Servicios', title: 'TU FORMA DE ENTRENAR.', description: 'Opciones claras para encontrar un entrenamiento que encaje contigo.', image: '/images/bayona-generated/home-method-1600.webp' },
  { href: '/parkour-academy', name: 'Parkour', title: 'LA CONFIANZA SE CONSTRUYE PASO A PASO.', description: 'Aprende técnica, progresión y confianza a tu propio ritmo.', image: '/images/bayona-generated/parkour-hero-1600.webp' },
  { href: '/community', name: 'Comunidad', title: 'EL CAMINO SE COMPARTE.', description: 'Un espacio para aprender, compartir y sentirte acompañado.', image: '/images/bayona-generated/community-hero-1600.webp' },
  { href: '/app', name: 'BAYONA+', title: 'ENTRA EN TU ESPACIO DIGITAL.', description: 'Conoce y abre BAYONA App, con Mi App y Coach Studio.', image: '/images/bayona-generated/app-hero-1600.webp' },
  { href: '/shop', name: 'Tienda', title: 'EQUÍPATE PARA MOVERTE.', description: 'Explora productos y solicita información.', image: '/images/bayona-generated/shop-hero-1600.webp' },
  { href: '/resources', name: 'Recursos', title: 'LLÉVATE UN PUNTO DE PARTIDA.', description: 'Recursos gratuitos para empezar con claridad y sin presión.', image: '/images/bayona-generated/resources-hero-1600.webp' },
  { href: '/faq', name: 'Preguntas', title: 'RESPUESTAS PARA AVANZAR.', description: 'Preguntar también es una forma de empezar. Aquí tienes respuestas claras.', image: '/images/bayona-generated/about-hero-1600.webp' },
])

export default function EditorialOutro() {
  const { pathname } = useLocation()
  const currentIndex = OUTRO_DESTINATIONS.findIndex((page) => page.href === pathname)
  if (currentIndex < 0) return null

  const next = OUTRO_DESTINATIONS[(currentIndex + 1) % OUTRO_DESTINATIONS.length]
  const others = OUTRO_DESTINATIONS.filter((page) => page.href !== pathname && page.href !== next.href)

  return (
    <aside className="editorial-outro" aria-label="Descubre más de BAYONA">
      <div className="editorial-outro__intro">
        <span className="editorial-outro__eyebrow">BAYONA / EXPLORAR</span>
        <p>SIGUE DESCUBRIENDO A TU RITMO.</p>
      </div>
      <Link
        to={next.href}
        className="editorial-outro__feature"
        onClick={() => trackEvent('editorial_next_page', { from: pathname, to: next.href })}
        aria-label={`Siguiente: ${next.name}. ${next.description}`}
      >
        <img className="editorial-outro__image" src={next.image} alt="" loading="lazy" decoding="async" />
        <span className="editorial-outro__shade" aria-hidden="true" />
        <span className="editorial-outro__content">
          <span className="editorial-outro__overline">SIGUIENTE / {next.name.toUpperCase()}</span>
          <strong>{next.title}</strong>
          <span className="editorial-outro__description">{next.description}</span>
          <span className="editorial-outro__action">DESCUBRIR {next.name.toUpperCase()} <ArrowUpRight size={20} strokeWidth={1.7} aria-hidden="true" /></span>
        </span>
        <span className="editorial-outro__arrow" aria-hidden="true"><ArrowUpRight size={30} strokeWidth={1.4} /></span>
      </Link>
      <nav className="editorial-outro__explore" aria-label="Otras páginas de BAYONA">
        <span className="editorial-outro__explore-label">O EXPLORA DIRECTAMENTE</span>
        <div className="editorial-outro__destinations">
          {others.map((page) => (
            <Link
              to={page.href}
              key={page.href}
              onClick={() => trackEvent('editorial_other_page', { from: pathname, to: page.href })}
            >{page.name}<ArrowUpRight size={13} strokeWidth={1.7} aria-hidden="true" /></Link>
          ))}
        </div>
      </nav>
    </aside>
  )
}
