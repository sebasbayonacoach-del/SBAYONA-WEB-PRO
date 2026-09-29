// DS/CTABlock - grupo de llamada a la acción del Design System (Fase 3).
//
// Fila de acciones (botones/enlaces) con microcopia opcional debajo
// (condiciones, alcance, aclaración legal corta). Mismo aire que
// .home-actions de la home.

/**
 * @param {{
 *   children?: import('react').ReactNode,
 *   note?: import('react').ReactNode,
 *   className?: string,
 * }} props
 */
export function CTABlock({ children, note, className = '' }) {
  return (
    <div className={`ds-cta${className ? ` ${className}` : ''}`}>
      {children}
      {note ? <p className="ds-cta__note">{note}</p> : null}
    </div>
  )
}
