/**
 * ADAPTADOR PAYPAL
 * ---------------------------------------------------------------------------
 * Mismo contrato que el adaptador de Stripe (ver `adapters/contract.js`), para
 * que la pasarela se cambie con una variable y no con un refactor.
 *
 * Sin `VITE_PAYPAL_CLIENT_ID` no hay red: modo simulación explícito, misma
 * forma de resultado, embudo recorrible y testeable.
 *
 * Nota técnica honesta: en PayPal las suscripciones se crean sobre un PLAN
 * dado de alta en su panel. Por eso cada plan de BAYONA tiene su variable
 * (`VITE_PAYPAL_PLAN_<PLAN>_MONTH`), y la oferta "0 € el primer mes · precio
 * publicado después" vive en ese plan como periodo de prueba. Aquí se manda el
 * identificador y la intención; el cobro lo abre el servidor.
 */

import { buildReturnUrl, commerceConfig, PAYMENT_PROVIDERS } from '../config.js'
import { finalizeSimulation, liveTransportError, resolveMode } from './contract.js'

const PROVIDER = PAYMENT_PROVIDERS.PAYPAL

export function createPayPalAdapter(config = commerceConfig) {
  function planCodeFor(order) {
    return config.paypal.plans[String(order?.plan?.id ?? '').toUpperCase()] ?? ''
  }

  function isConfigured(order) {
    if (!config.enabled) return false
    if (!config.paypal.clientId) return false
    if (order && Number(order.totalEur) === 0) return true
    if (order) return planCodeFor(order) !== ''
    return Object.keys(config.paypal.plans).length > 0
  }

  function readiness(order) {
    if (!config.enabled) {
      return { configured: false, mode: 'simulation', reason: 'La pasarela está apagada con VITE_PAYMENTS_ENABLED=false.' }
    }
    if (!config.paypal.clientId) {
      return { configured: false, mode: 'simulation', reason: 'Falta VITE_PAYPAL_CLIENT_ID: modo simulación.' }
    }
    if (order && Number(order.totalEur) > 0 && planCodeFor(order) === '') {
      return {
        configured: false,
        mode: 'simulation',
        reason: `Falta VITE_PAYPAL_PLAN_${String(order.plan.id).toUpperCase()}_MONTH: modo simulación.`,
      }
    }
    return { configured: true, mode: 'live', reason: 'PayPal listo para cobrar.' }
  }

  function buildSessionRequest(order) {
    const isSubscription = Boolean(order.introOffer)

    return Object.freeze({
      provider: PROVIDER,
      endpoint: config.sessionEndpoint,
      method: 'POST',
      headers: Object.freeze({ 'content-type': 'application/json' }),
      /** Script que se cargaría en el navegador con las claves pegadas. */
      sdkUrl: config.paypal.clientId ? config.paypal.sdkUrl(config.paypal.clientId) : '',
      body: Object.freeze({
        provider: PROVIDER,
        intent: isSubscription ? 'subscription' : 'capture',
        paypalClientId: config.paypal.clientId,
        environment: config.paypal.environment,
        /** Plan de PayPal con la oferta de introducción dada de alta. */
        plan_id: planCodeFor(order),
        subscription_data: isSubscription
          ? Object.freeze({
              trial_period_days: order.introOffer.trialPeriodDays,
              intro_offer: order.introOffer.id,
              then_amount_eur: String(order.recurringEur),
            })
          : undefined,
        amount: Object.freeze({
          currency_code: String(order.chargeCurrency ?? 'EUR').toUpperCase(),
          value: (Number(order.totalEur) || 0).toFixed(2),
        }),
        custom_id: order.id,
        application_context: Object.freeze({
          brand_name: 'BAYONA',
          locale: 'es-ES',
          shipping_preference: 'NO_SHIPPING',
          user_action: isSubscription ? 'SUBSCRIBE_NOW' : 'PAY_NOW',
          return_url: buildReturnUrl(config, config.successPath),
          cancel_url: buildReturnUrl(config, config.cancelPath),
        }),
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

  async function liveTransport(transport, request) {
    const send = transport ?? (typeof globalThis !== 'undefined' ? globalThis.fetch : undefined)
    if (typeof send !== 'function') throw new Error('No hay transporte disponible para cobrar.')
    return send(request.endpoint, {
      method: request.method,
      headers: request.headers,
      body: JSON.stringify(request.body),
    }).then((response) => (response?.json ? response.json() : response))
  }

  async function startPayment(order, { transport } = {}) {
    const state = readiness(order)
    const request = buildSessionRequest(order)
    const context = { provider: PROVIDER, label: 'PayPal', order, request, config }

    if (!state.configured) return finalizeSimulation({ ...context, reason: state.reason })

    const mode = resolveMode(config, PROVIDER)
    if (mode === 'simulation') {
      return finalizeSimulation({
        ...context,
        reason: `PayPal tiene claves, pero VITE_PAYMENTS_PROVIDER eligió ${config.provider}.`,
      })
    }

    try {
      const response = await liveTransport(transport, request)
      const redirectUrl = response?.url ?? response?.approvalUrl ?? response?.links?.find?.((link) => link.rel === 'approve')?.href
      if (!redirectUrl) throw new Error('La respuesta de PayPal no trajo enlace de aprobación.')
      return {
        status: 'redirect',
        provider: PROVIDER,
        mode: 'live',
        orderId: order.id,
        planId: order.plan.id,
        periodId: order.period.id,
        amountEur: order.totalEur,
        currency: order.currency,
        chargeCurrency: order.chargeCurrency,
        isZero: order.isZero,
        redirectUrl,
        simulated: false,
        request,
        label: 'PayPal',
        note: 'Te llevamos a PayPal para terminar.',
      }
    } catch (error) {
      return liveTransportError({ ...context, error })
    }
  }

  return Object.freeze({
    id: PROVIDER,
    label: 'PayPal',
    sdkUrl: (clientId = config.paypal.clientId) => (clientId ? config.paypal.sdkUrl(clientId) : ''),
    isConfigured,
    readiness,
    buildSessionRequest,
    startPayment,
  })
}

export const paypalAdapter = createPayPalAdapter()
