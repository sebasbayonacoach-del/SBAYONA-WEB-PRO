/**
 * CONTRATO COMPARTIDO DE PASARELA
 * ---------------------------------------------------------------------------
 * Los dos adaptadores (Stripe y PayPal) devuelven EXACTAMENTE la misma forma,
 * vivan o no las claves. Eso es lo que permite que la interfaz y los tests no
 * sepan ni les importe quién cobra.
 *
 * Regla dura: sin claves no hay red. `finalizeSimulation` resuelve en local.
 */

import { PAYMENT_PROVIDERS } from '../config.js'

/**
 * ¿Puede este proveedor cobrar de verdad? Solo si la pasarela está encendida y
 * la configuración lo eligió a él.
 */
export function resolveMode(config, provider) {
  if (!config?.enabled) return 'simulation'
  return config.provider === provider ? 'live' : 'simulation'
}

function baseResult({ provider, order, request, mode, status }) {
  return {
    status,
    provider,
    mode,
    orderId: order.id,
    planId: order.plan.id,
    periodId: order.period.id,
    amountEur: order.totalEur,
    currency: order.currency,
    chargeCurrency: order.chargeCurrency,
    isZero: order.isZero,
    redirectUrl: null,
    simulated: mode === 'simulation',
    request,
  }
}

/**
 * Resultado de simulación: misma forma que el cobro real, marcado como tal y
 * con la razón en español para poder enseñarla sin mentir.
 */
export function finalizeSimulation({ provider, label, order, request, reason }) {
  return {
    ...baseResult({ provider, order, request, mode: 'simulation', status: 'simulated' }),
    label,
    reason,
    note: `${label} en modo simulación: ${reason}`,
  }
}

/**
 * El servidor falló (todavía no existe la ruta, o dio error). No se rompe el
 * recorrido: se devuelve el error y, al lado, la simulación equivalente para
 * que la pantalla pueda ofrecerla explícitamente.
 */
export function liveTransportError({ provider, label, order, request, error }) {
  return {
    ...baseResult({ provider, order, request, mode: 'live', status: 'error' }),
    label,
    error: error instanceof Error ? error.message : String(error ?? 'Error desconocido'),
    note: 'No pudimos abrir la pasarela. Revisa las claves y el paso de servidor.',
    fallback: finalizeSimulation({
      provider,
      label,
      order,
      request,
      reason: 'la pasarela no respondió y seguimos en modo simulación',
    }),
  }
}

/**
 * Un pedido en cero no pasa por ninguna pasarela: no hay nada que cobrar y
 * fingirlo sería mentira. Se resuelve aquí, igual de explícito.
 */
export function resolveZeroPayment(order, { provider = PAYMENT_PROVIDERS.NONE } = {}) {
  return {
    status: 'completed',
    provider,
    mode: 'zero',
    orderId: order.id,
    planId: order.plan.id,
    periodId: order.period.id,
    amountEur: 0,
    currency: order.currency,
    chargeCurrency: order.chargeCurrency,
    isZero: true,
    redirectUrl: null,
    simulated: false,
    request: null,
    label: 'Sin cobro',
    reason: 'El total es cero: no se llama a ninguna pasarela.',
    note: 'Tu pedido quedó en cero. No se cobró nada.',
  }
}
