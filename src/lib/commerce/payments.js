/**
 * PUNTO DE ENTRADA DE PAGOS
 * ---------------------------------------------------------------------------
 * Una sola función para cobrar: `startPayment(order, opciones)`. Elige el
 * adaptador según la configuración, resuelve los pedidos en cero sin tocar
 * ninguna pasarela y devuelve siempre la misma forma de objeto.
 *
 * Inercia garantizada: sin claves no se hace NI UNA llamada de red. Todo se
 * resuelve en local y el resultado va marcado `simulated: true`.
 */

import { commerceConfig, describeConfig, PAYMENT_PROVIDERS } from './config.js'
import { resolveZeroPayment } from './adapters/contract.js'
import { createStripeAdapter } from './adapters/stripe.js'
import { createPayPalAdapter } from './adapters/paypal.js'

/** Fábricas por proveedor. Añadir una pasarela nueva es añadir una entrada. */
export const ADAPTER_FACTORIES = Object.freeze({
  [PAYMENT_PROVIDERS.STRIPE]: createStripeAdapter,
  [PAYMENT_PROVIDERS.PAYPAL]: createPayPalAdapter,
})

const adapterCache = new WeakMap()

function adaptersFor(config) {
  if (!adapterCache.has(config)) {
    adapterCache.set(config, Object.freeze({
      [PAYMENT_PROVIDERS.STRIPE]: createStripeAdapter(config),
      [PAYMENT_PROVIDERS.PAYPAL]: createPayPalAdapter(config),
    }))
  }
  return adapterCache.get(config)
}

/** Los dos adaptadores construidos con una configuración concreta. */
export function getPaymentAdapters(config = commerceConfig) {
  return adaptersFor(config)
}

/**
 * Adaptador activo. Si la configuración no eligió proveedor, se usa Stripe como
 * referencia: así la pantalla siempre puede enseñar la forma real de la petición
 * y el aviso honesto de que falta la clave.
 */
export function resolveAdapter(provider, config = commerceConfig) {
  const adapters = adaptersFor(config)
  const wanted = String(provider ?? config.provider ?? '').toLowerCase()
  return adapters[wanted] ?? adapters[PAYMENT_PROVIDERS.STRIPE]
}

/**
 * Estado de la pasarela para pintar en la interfaz: quién cobra, si está en
 * vivo o simulando, y por qué. En español, sin tecnicismos.
 */
export function describePaymentStatus(order, { provider, config = commerceConfig } = {}) {
  const adapter = resolveAdapter(provider, config)
  const global = describeConfig(config)
  const ready = adapter.isConfigured(order)
  const adapterState = adapter.readiness(order)
  const live = ready && global.live && global.provider === adapter.id

  return {
    provider: adapter.id,
    label: adapter.label,
    mode: live ? 'live' : 'simulation',
    live,
    configured: ready,
    reason: live ? adapterState.reason : adapterState.reason || global.reason,
    /** Aviso corto para la persona: solo cuando de verdad hace falta. */
    notice: live
      ? ''
      : 'MODO SIMULACIÓN · todavía no hay claves de pago pegadas. Nada se cobra de verdad.',
  }
}

/**
 * Inicia el pago de un pedido.
 *
 * @param {object} order                pedido construido con `buildOrder`
 * @param {object} [options]
 * @param {string} [options.provider]   'stripe' | 'paypal' (por defecto, config)
 * @param {object} [options.config]     configuración alternativa (tests)
 * @param {Function} [options.transport] inyecta el envío HTTP (tests)
 * @returns {Promise<object>} resultado normalizado:
 *   { status, provider, mode, orderId, planId, periodId, amountEur, currency,
 *     chargeCurrency, isZero, redirectUrl, simulated, request, label, reason, note }
 */
export async function startPayment(order, { provider, config = commerceConfig, transport } = {}) {
  // Cero es cero: no se abre ninguna pasarela para cobrar nada.
  if (Number(order?.totalEur) === 0) {
    return resolveZeroPayment(order, {
      provider: provider ?? config.provider ?? PAYMENT_PROVIDERS.NONE,
    })
  }

  const adapter = resolveAdapter(provider, config)
  return adapter.startPayment(order, { transport })
}

/** Atajo para saber si hace falta enseñar el aviso de simulación. */
export function isSimulation(order, options) {
  return describePaymentStatus(order, options).mode === 'simulation'
}
