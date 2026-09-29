// pageMotionContract - contrato de movimiento por pagina (Fase 5).
//
// Cuando la Fase 8 rediseñe las 17 rutas, cada pagina DECLARARA aqui su
// intencion de movimiento antes de implementarla. El contrato es dato, no
// codigo: normaliza la declaracion, aplica defaults fail-safe y valida
// contra el presupuesto. Ninguna pagina se implementa en la Fase 5; esto es
// la infraestructura que evita decisiones improvisadas despues.

import { MOTION_INTENSITIES, resolveIntensity } from './intensity.js'
import { MOTION_RECIPES, resolveRecipe } from './index.js'
import { checkBudget } from './motionBudget.js'

/** Valores validos de movimiento de texto. */
export const TEXT_MOTION_MODES = Object.freeze(['none', 'mask', 'words'])

/** Contrato por defecto: el minimo movimiento posible (calma primero). */
export const DEFAULT_PAGE_MOTION = Object.freeze({
  intensity: 'balanced',
  narrative: false,
  horizontal: false,
  sticky: false,
  parallax: false,
  marquee: false,
  textMotion: 'none',
  future3d: false,
  zones: Object.freeze(['hero', 'body', 'supporting', 'cta']),
  recipes: Object.freeze([]),
})

/**
 * Normaliza una declaracion de movimiento de pagina. Funcion PURA y
 * fail-safe: cada campo invalido degrada a su default; nunca lanza.
 *
 * @param {object} [declaration] Declaracion cruda de la pagina.
 * @returns {typeof DEFAULT_PAGE_MOTION & {intensity: string}} Contrato normalizado.
 */
export function resolvePageMotionContract(declaration = {}) {
  const input = declaration && typeof declaration === 'object' ? declaration : {}

  const intensity = MOTION_INTENSITIES[input.intensity] ? input.intensity : DEFAULT_PAGE_MOTION.intensity
  const textMotion = TEXT_MOTION_MODES.includes(input.textMotion)
    ? input.textMotion
    : DEFAULT_PAGE_MOTION.textMotion

  const recipes = Array.isArray(input.recipes)
    ? [...new Set(input.recipes.filter((id) => resolveRecipe(id) !== null))]
    : []

  const zones = Array.isArray(input.zones) && input.zones.length > 0
    ? input.zones.filter((zone) => typeof zone === 'string')
    : [...DEFAULT_PAGE_MOTION.zones]

  return {
    intensity,
    narrative: Boolean(input.narrative),
    horizontal: Boolean(input.horizontal),
    sticky: Boolean(input.sticky),
    parallax: Boolean(input.parallax),
    marquee: Boolean(input.marquee),
    textMotion,
    future3d: Boolean(input.future3d),
    zones,
    recipes,
  }
}

/**
 * Valida un contrato normalizado contra las reglas del sistema.
 *
 * Reglas:
 *  - Las capacidades narrativas (sticky/horizontal) exigen intensidad
 *    inmersiva o declaracion narrativa: son caras y deben justificarse.
 *  - El marquee convive con cualquier intensidad pero nunca con informacion
 *    critica (eso lo decide la receta; aqui solo se avisa).
 *  - El presupuesto de zonas debe pasar `checkBudget`.
 *
 * @param {object} [declaration] Declaracion cruda (se normaliza primero).
 * @returns {{valid: boolean, contract: object, warnings: string[]}}
 */
export function validatePageMotionContract(declaration = {}) {
  const contract = resolvePageMotionContract(declaration)
  const warnings = []

  if ((contract.sticky || contract.horizontal) && contract.intensity === 'quiet') {
    warnings.push('Sticky/horizontal con intensidad quiet: la narrativa espacial pide immersive o, como minimo, balanced con narrative.')
  }
  if ((contract.sticky || contract.horizontal) && !contract.narrative) {
    warnings.push('Sticky/horizontal sin narrative: solo se usan cuando la seccion cuenta algo.')
  }
  if (contract.sticky && contract.horizontal && contract.intensity !== 'immersive') {
    warnings.push('Sticky + horizontal a la vez: reservado a intensidad immersive.')
  }

  const budget = checkBudget(contract.zones, contract.intensity)
  warnings.push(...budget.reasons)

  return { valid: warnings.length === 0, contract, warnings }
}

/**
 * Resumen de la oferta del sistema para documentacion/debug: intensidades,
 * modos de texto y recetas disponibles.
 *
 * @returns {{intensities: string[], textMotionModes: string[], recipes: string[]}}
 */
export function describeMotionOffer() {
  return {
    intensities: Object.keys(MOTION_INTENSITIES),
    textMotionModes: [...TEXT_MOTION_MODES],
    recipes: Object.keys(MOTION_RECIPES),
  }
}

// Re-export util para consumidores del contrato.
export { resolveIntensity }
