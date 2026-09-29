// DS/Link - enlace de texto del Design System (Fase 3).
//
// Enlace inline con subrayado de marca y foco visible accesible. Para
// acciones con peso de botón se usa Button (con `href`), no este enlace.

/**
 * @param {{
 *   children?: import('react').ReactNode,
 *   href: string,
 *   className?: string,
 *   onClick?: (event: import('react').MouseEvent) => void,
 * }} props
 */
export function Link({ children, href, className = '', onClick }) {
  return (
    <a
      href={href}
      className={`ds-link${className ? ` ${className}` : ''}`}
      onClick={onClick}
    >
      {children}
    </a>
  )
}
