// DS/SectionLabel - etiqueta técnica de sección (eyebrow) del Design
// System (Fase 3).
//
// DM Mono, tracking amplio y guion de marca (pintado por CSS con ::before).
// Es la versión tokenizada de .eyebrow: abre las secciones dando lectura de
// "dato técnico", carácter de la marca.

/**
 * @param {{children?: import('react').ReactNode, className?: string}} props
 */
export function SectionLabel({ children, className = '' }) {
  return <p className={`ds-eyebrow${className ? ` ${className}` : ''}`}>{children}</p>
}
