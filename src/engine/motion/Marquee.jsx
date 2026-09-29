// Marquee - marquesina declarativa del Motion Engine 2.0 (Fase 5).
//
// Generaliza el patron probado de TestimonialMarquee (community-bridges.css):
// una pista duplicada que se desplaza en bucle por CSS (compositor, sin JS
// por fotograma) con fallback de movimiento reducido a RAIL ESTATICO con
// scroll-snap: el contenido nunca desaparece ni queda atrapado.
//
// Uso previsto (ver MOTION-MAP.md): contenido repetitivo y decorativo —
// lineas editoriales (BAYONA / METODO / MOVIMIENTO / DISCIPLINA), etiquetas,
// datos de ambiente. NUNCA informacion critica: el bucle infinito es
// decoracion, no lectura.

import { useCapabilities } from '../hooks/useCapabilities.js'
import '../../styles/marquee.css'

// Duracion base del bucle completo (segundos). El prop `duration` la ajusta;
// no es una duracion de transicion (no vive en motionTokens): es el periodo
// de un bucle continuo que depende del ancho del contenido. Valores mayores
// = mas calma; el presupuesto de BAYONA es movimiento lento y legible.
export const MARQUEE_BASE_DURATION = 40

/**
 * Marquesina horizontal continua y declarativa.
 *
 * Comportamiento por capacidades:
 *  - Movimiento normal: pista duplicada en bucle infinito (la copia va
 *    `aria-hidden` para lectores de pantalla).
 *  - `pauseOnHover` solo se aplica con puntero fino que soporta hover
 *    (`caps.canHover`): en tactil no hay hover que pausar.
 *  - `reducedMotion`: sin animacion ni duplicado; el contenido queda como
 *    rail horizontal estatico con scroll manual y snap.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children Contenido de la pista.
 * @param {string} [props.ariaLabel] Etiqueta accesible de la region.
 * @param {'left'|'right'} [props.direction='left'] Sentido del desplazamiento.
 * @param {number} [props.duration=MARQUEE_BASE_DURATION] Segundos por bucle completo.
 * @param {number} [props.gap=32] Separacion entre elementos de la pista (px).
 * @param {boolean} [props.pauseOnHover=false] Pausar al pasar el puntero (solo desktop).
 * @param {string} [props.className] Clases extra para el contenedor.
 * @returns {JSX.Element}
 */
export function Marquee({
  children,
  ariaLabel,
  direction = 'left',
  duration = MARQUEE_BASE_DURATION,
  gap = 32,
  pauseOnHover = false,
  className = '',
}) {
  const { reducedMotion, canHover } = useCapabilities()

  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : MARQUEE_BASE_DURATION
  const safeGap = Number.isFinite(gap) && gap >= 0 ? gap : 32
  const dir = direction === 'right' ? 'right' : 'left'

  // Movimiento reducido (R23): rail estatico, sin bucle ni duplicado.
  if (reducedMotion) {
    return (
      <div
        className={`marquee marquee--static ${className}`.trim()}
        role="region"
        aria-label={ariaLabel}
        style={{ '--marquee-gap': `${safeGap}px` }}
      >
      <div className="marquee-track">
        <div className="marquee-group">{children}</div>
      </div>
    </div>
  )
}

  const pauseClass = pauseOnHover && canHover ? ' marquee--pause-hover' : ''

  return (
    <div
      className={`marquee marquee--${dir}${pauseClass} ${className}`.trim()}
      role="region"
      aria-label={ariaLabel}
      aria-live="off"
      style={{
        '--marquee-duration': `${safeDuration}s`,
        '--marquee-gap': `${safeGap}px`,
      }}
    >
      <div className="marquee-track">
        <div className="marquee-group">{children}</div>
        {/* Copia para el bucle continuo: invisible para lectores de pantalla. */}
        <div className="marquee-group" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  )
}
