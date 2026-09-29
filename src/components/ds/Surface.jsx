// DS/Surface - nivel de superficie del Design System (Fase 3).
//
// Envoltorio que aplica un peldaño de la escalera de elevación
// (background → deep → raised → content → overlay → glass). La profundidad
// se logra por tono, luz y textura, no por color (identidad oscura).

const SURFACE_LEVELS = new Set(['deep', 'raised', 'content', 'overlay', 'glass'])

/**
 * @param {{
 *   children?: import('react').ReactNode,
 *   className?: string,
 *   level?: 'deep'|'raised'|'content'|'overlay'|'glass',
 * }} props
 */
export function Surface({ children, className = '', level }) {
  const classes = [
    'ds-surface',
    level && SURFACE_LEVELS.has(level) ? `ds-surface--${level}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <div className={classes}>{children}</div>
}
