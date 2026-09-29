// DS/MediaBlock - bloque de imagen del Design System (Fase 3).
//
// Proporción controlada por token (16:9, 4:5, 1:1), cover y fondo de
// espera elevado mientras carga. `alt` es obligatorio: una imagen sin
// texto alternativo rompe el contrato de accesibilidad de la baseline.

const RATIOS = new Set(['16-9', '4-5', '1-1'])

/**
 * @param {{
 *   src: string,
 *   alt: string,
 *   ratio?: '16-9'|'4-5'|'1-1',
 *   className?: string,
 *   loading?: 'lazy'|'eager',
 * }} props
 */
export function MediaBlock({ src, alt, ratio, className = '', loading = 'lazy' }) {
  const classes = [
    'ds-media',
    ratio && RATIOS.has(ratio) ? `ds-media--${ratio}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <figure className={classes}>
      <img
        src={src}
        alt={alt}
        loading={loading}
        onError={(event) => {
          // Fallo de imagen: ocultar el <img> roto y conservar el marco con
          // proporción (ES-002). Nunca mostrar icono de imagen rota.
          event.currentTarget.style.display = 'none'
        }}
      />
    </figure>
  )
}
