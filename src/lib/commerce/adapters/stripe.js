/**
 * ADAPTADOR STRIPE
 * ---------------------------------------------------------------------------
 * Cumple el contrato único de pasarela:
 *   · `id`, `label`                     → quién es
 *   · `isConfigured(order?)`            → ¿hay claves pegadas?
 *   · `readiness(order?)`               → por qué sí / por qué no, en español
 *   · `buildSessionRequest(order)`      → el payload que ENVIARÍA al servidor
 *   · `startPayment(order, {transport})`→ resuelve SIEMPRE la misma forma
 *
 * Sin claves no hay red: entra en modo simulación explícito y resuelve el mismo
 * objeto, para que el embudo se pueda recorrer y probar entero.
 *
 * La sesión de cobro la crea el servidor con la clave secreta. Aquí solo se
 * prepara la petición; el paso de servidor está documentado e inerte en
 * `server/stripe-create-session.stub.js`.
 */

import { buildReturnUrl, commerceConfig, PAYMENT_PROVIDERS } from '../config.js'
import { finalizeSimulation, liveTransportError, resolveMode } from './contract.js'

const PROVIDER = PAYMENT_PROVIDERS.STRIPE

export function createStripeAdapter(config = commerceConfig) {
  function priceIdFor(order) {
    return config.stripe.prices[String(order?.plan?.id ?? '').toUpperCase()] ?? ''
  }

  function isConfigured(order) {
    if (!config.enabled) return false
    if (!config.stripe.publishableKey) return false
    // Un pedido en cero no necesita precio de Stripe: se resuelve solo.
    if (order && Number(order.totalEur) === 0) return true
    if (order) return priceIdFor(order) !== ''
    return Object.keys(config.stripe.prices).length > 0
  }

  function readiness(order) {
    if (!config.enabled) {
      return { configured: false, mode: 'simulation', reason: 'La pasarela está apagada con VITE_PAYMENTS_ENABLED=false.' }
    }
    if (!config.stripe.publishableKey) {
      return { configured: false, mode: 'simulation', reason: 'Falta VITE_STRIPE_PUBLISHABLE_KEY: modo simulación.' }
    }
    if (order && Number(order.totalEur) > 0 && priceIdFor(order) === '') {
      return {
        configured: false,
        mode: 'simulation',
        reason: `Falta VITE_STRIPE_PRICE_${String(order.plan.id).toUpperCase()}_MONTH: modo simulación.`,
      }
    }
    return { configured: true, mode: 'live', reason: 'Stripe listo para cobrar.' }
  }

  /** El payload exacto que se enviaría al paso de servidor. */
  function buildSessionRequest(order) {
    const isSubscription = Boolean(order.introOffer)
    const mode = isSubscription ? 'subscription' : 'payment'

    return Object.freeze({
      provider: PROVIDER,
      endpoint: config.sessionEndpoint,
      method: 'POST',
      headers: Object.freeze({ 'content-type': 'application/json' }),
      body: Object.freeze({
        provider: PROVIDER,
        mode,
        /** La clave pública ya se envía al navegador; se repite para que el
         *  servidor confirme que habla con la cuenta correcta. */
        stripePublishableKey: config.stripe.publishableKey,
        currency: String(order.chargeCurrency ?? 'EUR').toLowerCase(),
        client_reference_id: order.id,
        line_items: Object.freeze(
          order.lineItems.map((item) =>
            Object.freeze({
              price: priceIdFor(order),
              quantity: item.quantity,
              /** Se manda el desglose por si el servidor prefiere price_data. */
              price_data: Object.freeze({
                currency: String(order.chargeCurrency ?? 'EUR').toLowerCase(),
                unit_amount: Math.round(Number(item.unitEur) * 100),
                recurring: isSubscription
                  ? Object.freeze({ interval: order.period.interval, interval_count: order.period.intervalCount })
                  : undefined,
                product_data: Object.freeze({ name: item.label, description: item.detail }),
              }),
            }),
          ),
        ),
        /**
         * La oferta "primer mes 0 € · después el precio publicado del plan" se
         * expresa como periodo
         * de prueba sobre una suscripción con precio recurrente. No se toca el
         * total a mano: eso sería un parche, no una oferta.
         */
        subscription_data: isSubscription
          ? Object.freeze({
              trial_period_days: order.introOffer.trialPeriodDays,
              trial_settings: Object.freeze({ end_behavior: Object.freeze({ missing_payment_method: 'cancel' }) }),
              metadata: Object.freeze({
                intro_offer: order.introOffer.id,
                // El recurrente del pedido, no el de la constante: la oferta de
                // introducción ya no trae un importe propio (ver plans.js).
                then_amount_eur: String(order.recurringEur),
              }),
            })
          : undefined,
        success_url: buildReturnUrl(config, config.successPath),
        cancel_url: buildReturnUrl(config, config.cancelPath),
        metadata: Object.freeze({
          plan: order.plan.id,
          period: order.period.id,
          subtotal_eur: String(order.subtotalEur),
          credit_eur: String(order.creditEur),
          share_code: order.share?.code ?? '',
          total_eur: String(order.totalEur),
        }),
      }),
    })
  }

  async function startPayment(order, { transport } = {}) {
    const state = readiness(order)
    const request = buildSessionRequest(order)
    const context = { provider: PROVIDER, label: 'Stripe', order, request, config }

    if (!state.configured) return finalizeSimulation({ ...context, reason: state.reason })

    const mode = resolveMode(config, PROVIDER)
    if (mode === 'simulation') {
      return finalizeSimulation({
        ...context,
        reason: `Stripe tiene claves, pero VITE_PAYMENTS_PROVIDER eligió ${config.provider}.`,
      })
    }

    try {
      const response = await liveTransport(transport, request)
      if (!response?.url) throw new Error('La respuesta del servidor no trajo URL de pago.')
      return {
        status: 'redirect',
        provider: PROVIDER,
        mode: 'live',
        orderId: order.id,
        amountEur: order.totalEur,
        currency: order.currency,
        chargeCurrency: order.chargeCurrency,
        redirectUrl: response.url,
        simulated: false,
        request,
        note: 'Te llevamos a Stripe para terminar.',
      }
    } catch (error) {
      return liveTransportError({ ...context, error })
    }
  }

  async function liveTransport(transport, request) {
    const send = transport ?? (typeof globalThis !== 'undefined' ? globalThis.fetch : undefined)
    if (typeof send !== 'function') throw new Error('No hay transporte disponible para cobrar.')
    return send(request.endpoint, {
      method: request.method,
      headers: request.headers,
      body: JSON.stringify(request.body),
    }).then((response) => (response?.json ? response.json() : response))
  }

  return Object.freeze({
    id: PROVIDER,
    label: 'Stripe',
    sdkUrl: config.stripe.sdkUrl,
    isConfigured,
    readiness,
    buildSessionRequest,
    startPayment,
  })
}

export const stripeAdapter = createStripeAdapter()
