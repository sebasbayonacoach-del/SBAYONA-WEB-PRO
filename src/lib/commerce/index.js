/**
 * CAPA DE COMERCIO · índice público
 * ---------------------------------------------------------------------------
 * Todo lo que la interfaz necesita para cobrar sale de aquí. Los detalles de
 * Stripe y PayPal quedan detrás del contrato de `adapters/contract.js`.
 *
 * Orden de uso típico:
 *   1. `buildOrder({ planId, period, currency, introOffer })`
 *   2. `applyCredit(order, 20)`            (opcional)
 *   3. `redeemShareCode(order, 'K7M2QP')`  (opcional → total 0)
 *   4. `startPayment(order)`               (simulación si faltan claves)
 */

export {
  CURRENCIES,
  DEFAULT_CURRENCY,
  formatMoney,
  formatMoneyWithCode,
  convertFromEur,
  currencyOf,
} from './money.js'

export {
  buildCommerceConfig,
  buildReturnUrl,
  commerceConfig,
  describeConfig,
  PAYMENT_PROVIDERS,
  PRICED_PLAN_IDS,
} from './config.js'

export {
  ACCESS_SUBSCRIPTION_OFFER,
  BILLING_PERIODS,
  commercePlans,
  copToEur,
  DEFAULT_PERIOD,
  findCommercePlan,
  FREE_PLAN,
  planPriceEur,
  resolveCommercePlan,
  resolvePeriod,
  ZERO_FIRST_MONTH_OFFER,
} from './plans.js'

export {
  applyCredit,
  applyShareCode,
  buildOrder,
  buildOrderId,
  changePlan,
  clearCredit,
  clearShareCode,
  createLineItem,
  finalizeOrder,
  formatOrderAmount,
  formatOrderTotal,
  orderSummaryLines,
  roundEur,
} from './order.js'

export {
  buildDeepLink,
  shareNatively,
  whatsAppShareUrl,
} from './share.js'

export {
  buildShareCode,
  buildSharePayload,
  normalizeShareCode,
  redeemShareCode,
  SHARE_EXCHANGE,
  shareCodeForOrder,
  validateShareCode,
} from './shareCode.js'

export {
  finalizeSimulation,
  liveTransportError,
  resolveMode,
  resolveZeroPayment,
} from './adapters/contract.js'

export { createStripeAdapter, stripeAdapter } from './adapters/stripe.js'
export { createPayPalAdapter, paypalAdapter } from './adapters/paypal.js'

export {
  ADAPTER_FACTORIES,
  describePaymentStatus,
  getPaymentAdapters,
  isSimulation,
  resolveAdapter,
  startPayment,
} from './payments.js'
