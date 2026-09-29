// DS/Container - contenedor editorial del Design System (Fase 3).
//
// Centra el contenido al ancho de la retícula de marca (1240px con 40px de
// aire por lado; 20px en móvil). Es la versión tokenizada de .section-shell.

/**
 * @param {{children?: import('react').ReactNode, className?: string}} props
 */
export function Container({ children, className = '' }) {
  return <div className={`ds-container${className ? ` ${className}` : ''}`}>{children}</div>
}
