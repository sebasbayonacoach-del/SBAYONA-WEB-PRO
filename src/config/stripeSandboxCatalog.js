/**
 * Catálogo de Stripe SOLO DE PRUEBA (claves y productos livemode=false).
 * No importar desde páginas públicas ni publicar enlaces de cobro en producción.
 * Esta información no es secreta, pero nunca puede sustituir a un precio
 * validado en un servidor de pagos real.
 */
export const STRIPE_SANDBOX = Object.freeze({
  RAIZ: Object.freeze({
    monthly: 'https://buy.stripe.com/test_14A3cv9BHeEmcbx8lxgQE00',
    once: 'https://buy.stripe.com/test_7sYaEXaFLao62AXfNZgQE01',
  }),
  FUERZA: Object.freeze({
    monthly: 'https://buy.stripe.com/test_28EcN5aFL9k24J531dgQE02',
    once: 'https://buy.stripe.com/test_7sYeVd8xDcwe3F145hgQE03',
  }),
  RENDIMIENTO: Object.freeze({
    monthly: 'https://buy.stripe.com/test_6oU8wP4hndAib7t59lgQE04',
    once: 'https://buy.stripe.com/test_7sY5kD15bgMu1wTdFRgQE05',
  }),
  ELITE: Object.freeze({
    monthly: 'https://buy.stripe.com/test_aFafZhbJPfIq1wT31dgQE06',
    once: 'https://buy.stripe.com/test_dRmbJ1dRXgMu8Zl0T5gQE07',
  }),
})
export const SANDBOX_MODES = Object.freeze({
  monthly: 'Suscripción mensual renovable',
  once: 'Pago único por un mes',
})
export function getSandboxPaymentLink(planId, billingMode){
  if (!Object.hasOwn(SANDBOX_MODES,billingMode)) return null
  const links=STRIPE_SANDBOX[planId]
  return links && Object.hasOwn(links,billingMode) ? links[billingMode] : null
}
