// motionBudget - presupuesto de movimiento por zona de pagina (Fase 5).
//
// Infraestructura de documentacion/decision para las paginas futuras
// (Fase 8): cada zona de una pagina tiene un presupuesto de movimiento.
// El presupuesto no es codigo que anima: es la REGLA que decide cuanto
// movimiento puede haber antes de que la pagina deje de dar paz.
//
// Principio: el reposo forma parte del diseno. Si quitar una animacion no
// empeora la comprension, probablemente sobra.

/**
 * Presupuestos por zona. `weight` es un peso relativo 0..3 para comparar
 * zonas; `recipes` lista las recetas tipicas de la zona (ver recipes/index).
 */
export const MOTION_BUDGETS = Object.freeze({
  hero: Object.freeze({
    id: 'hero',
    weight: 3,
    note: 'Apertura: una entrada con presencia, sin teatro que retrase el mensaje.',
    recipes: ['editorial-reveal', 'image-drift', 'quiet-transition'],
  }),
  body: Object.freeze({
    id: 'body',
    weight: 2,
    note: 'Cuerpo: ritmo de lectura. Micro > macro; alternar movimiento y reposo.',
    recipes: ['editorial-reveal', 'editorial-slide', 'data-cascade'],
  }),
  supporting: Object.freeze({
    id: 'supporting',
    weight: 1,
    note: 'Apoyo: casi estatico. Si se mueve, que sea respiracion (near).',
    recipes: ['editorial-reveal', 'quiet-transition'],
  }),
  cta: Object.freeze({
    id: 'cta',
    weight: 2,
    note: 'Decision: el CTA primario alcanza estado activo rapido; nunca se esconde detras de una animacion larga.',
    recipes: ['editorial-reveal', 'quiet-transition'],
  }),
  background: Object.freeze({
    id: 'background',
    weight: 0,
    note: 'Fondo: sutil o nada. Nada de grano animado continuo sin proposito.',
    recipes: ['image-drift'],
  }),
})

/**
 * Resuelve el presupuesto de una zona. Fail-safe: zona desconocida degrada
 * a `supporting` (la zona mas conservadora).
 *
 * @param {string} [zone]
 * @returns {{id: string, weight: number, note: string, recipes: string[]}}
 */
export function resolveBudget(zone) {
  return MOTION_BUDGETS[zone] ?? MOTION_BUDGETS.supporting
}

/**
 * Comprueba si una lista de zonas respeta el presupuesto global de una
 * pagina: como maximo UNA zona de peso 3 (hero) y el peso total no supera
 * el limite segun intensidad. Regla pura para tests y validacion de
 * contratos de pagina.
 *
 * @param {string[]} zones Zonas declaradas por la pagina.
 * @param {'quiet'|'balanced'|'immersive'} [intensity='balanced']
 * @returns {{ok: boolean, totalWeight: number, limit: number, reasons: string[]}}
 */
export function checkBudget(zones, intensity = 'balanced') {
  const limits = { quiet: 6, balanced: 8, immersive: 10 }
  const limit = limits[intensity] ?? limits.balanced
  const reasons = []

  const list = Array.isArray(zones) ? zones : []
  const totalWeight = list.reduce((sum, zone) => sum + resolveBudget(zone).weight, 0)
  const heroCount = list.filter((zone) => resolveBudget(zone).weight === 3).length

  if (heroCount > 1) reasons.push('Mas de una zona de peso 3: solo el hero abre con presencia.')
  if (totalWeight > limit) reasons.push(`Peso total ${totalWeight} supera el limite ${limit} de la intensidad ${intensity}.`)

  return { ok: reasons.length === 0, totalWeight, limit, reasons }
}
