// Breakpoints - tokens responsivos del Design System (Fase 3, sección 14).
//
// Las media queries de CSS no pueden leer custom properties, así que esta es
// la fuente de verdad en JavaScript de los puntos de corte; el CSS del sistema
// (ds-tokens.css / ds-base.css) usa estos mismos números. No se inventan
// breakpoints: cada valor está MEDIDO en la cascada actual:
//
//   520px  → overrides.css (móvil compacto)
//   600px  → v2-typography.css §11 (compresión de titulares en móvil)
//   800px  → overrides.css (tablet pequeña)
//   900px  → v2-surface.css §2 (puerta de backdrop-filter: cristal solo
//            donde el dispositivo lo aguanta)
//   950px  → overrides.css / EL UMBRAL (navegación)
//   1180px → overrides.css (escritorio)
//   1440px → viewport de referencia del baseline visual (desktop)

export const BREAKPOINTS = Object.freeze({
  /** Móvil compacto: controles a ancho casi completo. */
  xs: 520,
  /** Móvil: la tipografía de titulares se comprime un paso más. */
  sm: 600,
  /** Tablet pequeña: las retículas de contenido pasan a una columna. */
  md: 800,
  /** Tablet: puerta del cristal (backdrop-filter) y retícula media. */
  lg: 900,
  /** Navegación: debajo de este ancho manda el menú móvil. */
  nav: 950,
  /** Escritorio: retícula completa de 12 columnas. */
  xl: 1180,
  /** Escritorio amplio: referencia del baseline visual desktop. */
  xxl: 1440,
})

/**
 * Media query `min-width` para un ancho dado.
 *
 * @param {number} px Ancho mínimo en píxeles.
 * @returns {string} Cadena de media query, p. ej. `(min-width: 900px)`.
 */
export function minWidth(px) {
  return `(min-width: ${px}px)`
}

/**
 * Media query `max-width` para un ancho dado (límite superior inclusivo).
 *
 * @param {number} px Ancho máximo en píxeles.
 * @returns {string} Cadena de media query, p. ej. `(max-width: 600px)`.
 */
export function maxWidth(px) {
  return `(max-width: ${px}px)`
}
