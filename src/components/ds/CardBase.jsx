// DS/CardBase - tarjeta base del Design System (Fase 3).
//
// Superficie de contenido que flota: cristal, borde fino, elevación al hover.
// El contenido (icono, titular, cuerpo, acción) lo compone cada uso.

/**
 * @param {{
 *   children?: import('react').ReactNode,
 *   className?: string,
 *   as?: 'article'|'div'|'li',
 * }} props
 */
export function CardBase({ children, className = '', as: Tag = 'article' }) {
  return <Tag className={`ds-card${className ? ` ${className}` : ''}`}>{children}</Tag>
}
