/**
 * MODELO DE PEDIDO NORMALIZADO
 * ---------------------------------------------------------------------------
 * Un solo objeto describe el pedido, venga de Stripe, de PayPal o del modo
 * simulación. Los importes internos van SIEMPRE en euros (igual que
 * `money.js`); la moneda de visualización es un dato aparte, para que la
 * pantalla pueda enseñar COP o USD sin tocar las matemáticas.
 *
 * El pedido es INMUTABLE: cada operación devuelve un objeto nuevo. Así el
 * panel puede pintar "antes / después" del crédito o del código sin guardar
 * estado fuera de React, y sin tocar localStorage (el sitio es privacy-first).
 */

import { DEFAULT_CURRENCY, formatMoney } from './money.js'
import {
  DEFAULT_PERIOD,
  FREE_PLAN,
  planPriceEur,
  resolveCommercePlan,
  resolvePeriod,
} from './plans.js'

/** Redondeo a céntimos para que nunca aparezca ruido de punto flotante. */
export function roundEur(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return 0
  return Math.round(number * 100) / 100
}

export function createLineItem({ id, label, detail = '', unitEur = 0, quantity = 1 } = {}) {
  const safeQuantity = Math.max(0, Math.round(Number(quantity) || 0))
  return Object.freeze({
    id: String(id),
    label: String(label),
    detail: String(detail),
    unitEur: roundEur(unitEur),
    quantity: safeQuantity,
    totalEur: roundEur(unitEur * safeQuantity),
  })
}

function sumLineItems(lineItems) {
  return roundEur(lineItems.reduce((total, item) => total + (Number(item.totalEur) || 0), 0))
}

/**
 * Recalcula totales a partir de las piezas del pedido. Es la única función que
 * sabe sumar, así que no puede haber dos totales distintos para el mismo pedido.
 */
export function finalizeOrder(draft) {
  const lineItems = Object.freeze((draft.lineItems ?? []).map((item) => Object.freeze({ ...item })))
  const subtotalEur = sumLineItems(lineItems)

  const rawCredit = Number(draft.credit?.amountEur) || 0
  const creditEur = roundEur(Math.min(Math.max(0, rawCredit), subtotalEur))
  const afterCreditEur = roundEur(subtotalEur - creditEur)

  // El código de intercambio pone a cero lo que quede después del crédito.
  const shareEur = draft.share ? afterCreditEur : 0
  const totalEur = draft.share ? 0 : afterCreditEur

  const introOffer = draft.introOffer ?? null
  const firstChargeEur = introOffer ? roundEur(introOffer.introAmountEur) : totalEur
  /*
    `thenAmountEur` es `null` en la oferta de introducción: significa «el precio
    publicado del plan», que es `totalEur`. Antes se leía un 1 € duro y el
    checkout terminaba afirmando que un plan de 70 € costaba 1 € al mes
    (comentario 26 del dueño). El recurrente nunca puede ser un número
    independiente del plan que se está vendiendo.
  */
  const recurringEur = roundEur(
    introOffer && introOffer.thenAmountEur !== null && introOffer.thenAmountEur !== undefined
      ? introOffer.thenAmountEur
      : totalEur,
  )

  return Object.freeze({
    id: draft.id,
    plan: draft.plan,
    period: draft.period,
    currency: draft.currency,
    chargeCurrency: draft.chargeCurrency,
    lineItems,
    subtotalEur,
    credit: creditEur > 0 ? Object.freeze({ ...(draft.credit ?? {}), amountEur: creditEur }) : null,
    creditEur,
    share: draft.share ?? null,
    shareEur,
    totalEur,
    isZero: totalEur === 0,
    introOffer,
    firstChargeEur,
    recurringEur,
    seed: draft.seed ?? '',
    notes: Object.freeze(draft.notes ?? []),
  })
}

/** Identificador determinista: mismo plan y periodo dan el mismo pedido. */
export function buildOrderId(planId, periodId, suffix = '') {
  const base = `bayona-${String(planId).toLowerCase()}-${String(periodId).toLowerCase()}`
  return suffix ? `${base}-${suffix}` : base
}

/**
 * Construye el pedido. Deriva todo del catálogo: aquí no se escribe ningún
 * precio a mano.
 *
 * @param {object} input
 * @param {string} [input.planId]        id del catálogo ('GRATIS', 'RAIZ', …)
 * @param {string} [input.period]        'month' | 'year'
 * @param {string} [input.currency]      moneda en la que se MUESTRA
 * @param {object[]} [input.extraLineItems] líneas añadidas (servicios extra)
 * @param {object} [input.introOffer]    oferta de introducción (0 € hoy, precio publicado después)
 */
export function buildOrder(input = {}) {
  const plan = resolveCommercePlan(input.planId ?? FREE_PLAN.id)
  const period = resolvePeriod(input.period ?? DEFAULT_PERIOD)
  const currency = String(input.currency ?? DEFAULT_CURRENCY).toUpperCase()
  const chargeCurrency = String(input.chargeCurrency ?? 'EUR').toUpperCase()

  const baseItem = createLineItem({
    id: `plan-${plan.id.toLowerCase()}`,
    label: `PLAN ${plan.name}`,
    detail: period.label,
    unitEur: planPriceEur(plan, period),
    quantity: 1,
  })

  const lineItems = [baseItem, ...(input.extraLineItems ?? []).map((item) => createLineItem(item))]

  return finalizeOrder({
    id: input.orderId ?? buildOrderId(plan.id, period.id),
    plan,
    period,
    currency,
    chargeCurrency,
    lineItems,
    credit: input.credit ?? null,
    share: input.share ?? null,
    introOffer: input.introOffer ?? null,
    seed: input.seed ?? `bayona:${plan.id}:${period.id}`,
    notes: input.notes ?? [],
  })
}

/**
 * Aplica crédito acumulado (bonos, sellos, saldo de la casa). Nunca puede
 * superar el subtotal: el crédito no genera dinero a favor.
 */
export function applyCredit(order, amountEur, { label = 'CRÉDITO APLICADO', reason = 'credit' } = {}) {
  const amount = roundEur(Number(amountEur) || 0)
  const credit = amount > 0 ? { amountEur: amount, label, reason } : null
  return finalizeOrder({ ...order, credit })
}

/** Quita el crédito y vuelve al importe anterior. */
export function clearCredit(order) {
  return finalizeOrder({ ...order, credit: null })
}

/**
 * Marca el pedido como canjeado con un código de intercambio y lo pone a cero.
 * La validación del código vive en `shareCode.js`; esto solo aplica el efecto.
 */
export function applyShareCode(order, share) {
  return finalizeOrder({ ...order, share })
}

/** Quita el código: el pedido vuelve a tener precio. */
export function clearShareCode(order) {
  return finalizeOrder({ ...order, share: null })
}

/** Cambia el plan manteniendo crédito y código ya aplicados. */
export function changePlan(order, planId) {
  const plan = resolveCommercePlan(planId)
  const period = order.period
  const baseItem = createLineItem({
    id: `plan-${plan.id.toLowerCase()}`,
    label: `PLAN ${plan.name}`,
    detail: period.label,
    unitEur: planPriceEur(plan, period),
    quantity: 1,
  })
  return finalizeOrder({
    ...order,
    id: buildOrderId(plan.id, period.id),
    plan,
    lineItems: [baseItem, ...order.lineItems.filter((item) => !item.id.startsWith('plan-'))],
    seed: `bayona:${plan.id}:${period.id}`,
  })
}

/** Importe formateado con el helper de moneda del sitio. Nunca a mano. */
export function formatOrderAmount(valueEur, order) {
  return formatMoney(roundEur(valueEur), order?.currency ?? DEFAULT_CURRENCY)
}

export function formatOrderTotal(order) {
  return formatOrderAmount(order.totalEur, order)
}

/**
 * Líneas listas para pintar en el resumen, con su importe ya formateado.
 * `kind` permite darle color a cada una (base / resta / total).
 */
export function orderSummaryLines(order) {
  const lines = order.lineItems.map((item) => ({
    id: item.id,
    kind: 'item',
    label: item.label,
    detail: `${item.detail}${item.quantity > 1 ? ` · ×${item.quantity}` : ''}`,
    value: formatOrderAmount(item.totalEur, order),
    valueEur: item.totalEur,
  }))

  if (order.creditEur > 0) {
    lines.push({
      id: 'credit',
      kind: 'credit',
      label: order.credit?.label ?? 'CRÉDITO APLICADO',
      detail: 'Lo tenías acumulado.',
      value: `−${formatOrderAmount(order.creditEur, order)}`,
      valueEur: -order.creditEur,
    })
  }

  if (order.share) {
    lines.push({
      id: 'share',
      kind: 'share',
      label: 'INTERCAMBIO',
      detail: order.share.exchange ?? 'Compartiste con un amigo.',
      value: `−${formatOrderAmount(order.shareEur, order)}`,
      valueEur: -order.shareEur,
    })
  }

  return lines
}
