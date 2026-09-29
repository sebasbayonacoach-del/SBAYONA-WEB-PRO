/**
 * CATÁLOGO DE PLANES PARA COBRAR
 * ---------------------------------------------------------------------------
 * Los precios NO se duplican aquí: se derivan de `src/config/offerings.js`,
 * que es la fuente publicada (RAÍZ $149.000, FUERZA $299.000, RENDIMIENTO
 * $499.000, ELITE $899.000 COP/mes). El sitio guarda los valores internos en
 * euros (ver `money.js`), así que la conversión usa la MISMA referencia de
 * 4.300 COP por euro que ya publica `CURRENCIES.COP.perEur`.
 *
 * Lo único nuevo es el plan GRATUITO que pidió el dueño: no es un precio
 * inventado, es el plan de entrada con el valor en cero porque se paga con un
 * intercambio (compartir con un amigo) en vez de con dinero.
 */

import { membershipPlans } from '../../config/offerings.js'
import { CURRENCIES } from './money.js'

/** Misma referencia que usa el resto del sitio. No es una cotización en vivo. */
const COP_PER_EUR = CURRENCIES.COP.perEur

export function copToEur(valueCop) {
  return Math.round((Number(valueCop) || 0) / COP_PER_EUR)
}

/**
 * Periodos de facturación. El anual no tiene descuento inventado: es el precio
 * mensual publicado multiplicado por doce, dicho así de claro.
 */
export const BILLING_PERIODS = Object.freeze({
  month: Object.freeze({
    id: 'month',
    label: 'CADA MES',
    shortLabel: '/MES',
    interval: 'month',
    intervalCount: 1,
    months: 1,
  }),
  year: Object.freeze({
    id: 'year',
    label: 'CADA AÑO',
    shortLabel: '/AÑO',
    interval: 'year',
    intervalCount: 1,
    months: 12,
  }),
})

export const DEFAULT_PERIOD = 'month'

export function resolvePeriod(periodId = DEFAULT_PERIOD) {
  return BILLING_PERIODS[String(periodId ?? '').toLowerCase()] ?? BILLING_PERIODS[DEFAULT_PERIOD]
}

function toCommercePlan(plan) {
  return Object.freeze({
    id: plan.id,
    name: plan.name,
    journey: plan.journey,
    tag: plan.tag,
    shortDescription: plan.shortDescription,
    included: plan.included,
    /** Valor publicado en COP (fuente: offerings.js). */
    priceCop: plan.priceCop,
    /** Valor interno en EUR, derivado. Es la cifra que se cobra. */
    priceEur: copToEur(plan.priceCop),
    free: false,
  })
}

const ENTRY_PLAN = membershipPlans.find((plan) => plan.id === 'RAIZ') ?? membershipPlans[0]

/**
 * Plan gratuito: el mismo contenido del plan de entrada, con el valor en cero.
 * El dueño lo describió así: "lo gratuito es el intercambio". Se deriva de
 * RAÍZ para no escribir aquí ni una línea de lo que incluye.
 */
export const FREE_PLAN = Object.freeze({
  id: 'GRATIS',
  name: 'GRATIS',
  journey: 'PRIMER PASO',
  tag: 'INTERCAMBIO · SIN DINERO',
  shortDescription: 'El mismo plan de siempre. Aquí no se paga con dinero: se paga compartiéndolo con un amigo.',
  included: ENTRY_PLAN.included,
  priceCop: 0,
  priceEur: 0,
  /** Basado en el plan de entrada publicado. */
  basedOnPlanId: ENTRY_PLAN.id,
  free: true,
})

export const commercePlans = Object.freeze([FREE_PLAN, ...membershipPlans.map(toCommercePlan)])

export function findCommercePlan(planId) {
  const normalized = String(planId ?? '').trim().toUpperCase()
  return commercePlans.find((plan) => plan.id === normalized) ?? null
}

/** Plan que se usa si no se pide ninguno: el gratuito, para que el embudo exista. */
export function resolveCommercePlan(planId) {
  return findCommercePlan(planId) ?? FREE_PLAN
}

/** Precio en EUR del plan para un periodo. Derivado, nunca escrito a mano. */
export function planPriceEur(plan, period = resolvePeriod()) {
  const base = Number(plan?.priceEur) || 0
  return Math.round(base * (resolvePeriod(period.id ?? period).months || 1))
}

/**
 * Oferta de introducción: el primer mes no se cobra.
 *
 * ANTES esta oferta llevaba `thenAmountEur: 1` y un rótulo que prometía, después
 * del primer mes gratis, un euro al mes. `order.js` usaba ese número como
 * `recurringEur`, así que el checkout afirmaba que FUERZA (70 €/mes) o RENDIMIENTO
 * (116 €/mes) pasaban a costar UN EURO AL MES. No era un detalle de redacción:
 * era el cargo recurrente de la pasarela. Es la clase de promesa que se firma
 * sin querer y se paga en reembolsos y en confianza.
 *
 * El dueño lo señaló en el comentario 26 de sus 70 anotaciones: «dice primer
 * mes 0 euros, después un mes. Eso no va ahí… no se puede pagar 0 euros y
 * después un mes, porque se rompe».
 *
 * AHORA: la oferta solo declara el periodo de introducción a cero. El importe
 * recurrente es `null`, que `order.js` lee como «lo que vale el plan», de modo
 * que el número que ve el cliente es siempre el precio publicado en su propia
 * ficha y no puede desincronizarse de él. Si algún día hay una promo real con
 * un precio recurrente distinto, se modela como Price nuevo en la pasarela, no
 * como una constante aquí.
 */
export const ZERO_FIRST_MONTH_OFFER = Object.freeze({
  id: 'primer-mes-cero',
  kind: 'intro-offer',
  label: 'PRIMER MES SIN COSTE',
  introInterval: 'month',
  introIntervalCount: 1,
  introAmountEur: 0,
  trialPeriodDays: 30,
  thenInterval: 'month',
  thenIntervalCount: 1,
  /** null = se aplica el precio publicado del plan (ver `order.js`). */
  thenAmountEur: null,
  note: 'Después sigue el precio publicado del plan, que verás en el resumen antes de pagar. Puedes cancelar cuando quieras.',
})

/** Suscripción de acceso: 0 € hoy, el precio publicado del plan después. */
export const ACCESS_SUBSCRIPTION_OFFER = ZERO_FIRST_MONTH_OFFER
