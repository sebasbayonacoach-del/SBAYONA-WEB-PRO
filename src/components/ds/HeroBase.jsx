// DS/HeroBase - estructura base del opening de página (Fase 3).
//
// Solo estructura: alineación vertical centrada, altura mínima y contenedor
// del contenido. El fondo (imagen, escena 3D o atmósfera) lo aporta cada
// página vía `className`/`style` o capas absolutas propias.

/**
 * @param {{
 *   children?: import('react').ReactNode,
 *   className?: string,
 *   contentClassName?: string,
 * }} props
 */
export function HeroBase({ children, className = '', contentClassName = '' }) {
  return (
    <section className={`ds-hero${className ? ` ${className}` : ''}`}>
      <div className={`ds-hero__content${contentClassName ? ` ${contentClassName}` : ''}`}>
        {children}
      </div>
    </section>
  )
}
