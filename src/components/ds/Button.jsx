// DS/Button - botón del Design System (Fase 3).
//
// Tres variantes (primary / secondary / ghost) con los siete estados
// cubiertos en ds-base.css: default, hover, focus-visible, active, disabled,
// loading (aria-busy) y error vía composición. Con `href` se convierte en
// enlace manteniendo el mismo visual. El lenguaje es el de .gold-button
// (gradiente cálido, mayúsculas, tracking), tokenizado.

const VARIANTS = new Set(['primary', 'secondary', 'ghost'])

/**
 * @param {{
 *   children?: import('react').ReactNode,
 *   variant?: 'primary'|'secondary'|'ghost',
 *   href?: string,
 *   type?: 'button'|'submit'|'reset',
 *   disabled?: boolean,
 *   loading?: boolean,
 *   className?: string,
 *   onClick?: (event: import('react').MouseEvent) => void,
 * }} props
 */
export function Button({
  children,
  variant = 'primary',
  href,
  type = 'button',
  disabled = false,
  loading = false,
  className = '',
  onClick,
}) {
  const safeVariant = VARIANTS.has(variant) ? variant : 'primary'
  const classes = [`ds-button`, `ds-button--${safeVariant}`, className]
    .filter(Boolean)
    .join(' ')

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        aria-disabled={disabled || undefined}
        aria-busy={loading || undefined}
        onClick={onClick}
      >
        {children}
      </a>
    )
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      aria-busy={loading || undefined}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
