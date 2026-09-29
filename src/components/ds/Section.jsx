// DS/Section - sección editorial del Design System (Fase 3).
//
// Aporta el aire vertical entre bloques y, opcionalmente, el nivel de
// superficie (escalera de elevación de ds-tokens.css). `flush` elimina el
// aire para secciones a sangre (full-bleed).

const SURFACE_LEVELS = new Set(['deep', 'raised', 'content', 'overlay', 'glass'])

/**
 * @param {{
 *   children?: import('react').ReactNode,
 *   className?: string,
 *   flush?: boolean,
 *   surface?: 'deep'|'raised'|'content'|'overlay'|'glass',
 *   id?: string,
 * }} props
 */
export function Section({ children, className = '', flush = false, surface, id }) {
  const classes = [
    'ds-section',
    flush ? 'ds-section--flush' : '',
    surface && SURFACE_LEVELS.has(surface) ? `ds-surface--${surface}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section id={id} className={classes}>
      {children}
    </section>
  )
}
