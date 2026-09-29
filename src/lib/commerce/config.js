/**
 * CONFIGURACIÓN DE PAGOS · fuente única de claves
 * ---------------------------------------------------------------------------
 * Todas las claves salen de variables de entorno de Vite (`VITE_*`). Ninguna
 * clave vive escrita en el código: este módulo solo LEE y pone por defecto lo
 * que falta, para que la web funcione igual de bien antes de que el dueño
 * pegue sus claves que después.
 *
 * Regla dura: si falta una clave, el proveedor entra en MODO SIMULACIÓN y lo
 * dice en voz alta en la interfaz. Nunca se inventa una clave, nunca se hace
 * una llamada de red con una clave ausente.
 *
 * Dónde se pegan las claves de verdad: ver `.env.example` en la raíz.
 */

import { DEFAULT_CURRENCY } from './money.js'

/** Lectura defensiva: en un entorno sin Vite (node puro) no explota. */
function readRawEnv() {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) return import.meta.env
  } catch {
    /* import.meta no disponible: se usa el objeto vacío. */
  }
  return {}
}

const RAW_ENV = readRawEnv()

export const PAYMENT_PROVIDERS = Object.freeze({
  NONE: 'none',
  STRIPE: 'stripe',
  PAYPAL: 'paypal',
})

/** Planes que tienen precio propio en Stripe/PayPal. `GRATIS` nunca lo tiene. */
export const PRICED_PLAN_IDS = Object.freeze(['RAIZ', 'FUERZA', 'RENDIMIENTO', 'ELITE'])

function readText(env, key, fallback = '') {
  const raw = env?.[key]
  if (typeof raw === 'string' && raw.trim() !== '') return raw.trim()
  if (typeof raw === 'number') return String(raw)
  return fallback
}

function readFlag(env, key, fallback = false) {
  const raw = env?.[key]
  if (typeof raw === 'boolean') return raw
  if (typeof raw !== 'string' || raw.trim() === '') return fallback
  const value = raw.trim().toLowerCase()
  if (['1', 'true', 'yes', 'si', 'sí', 'on'].includes(value)) return true
  if (['0', 'false', 'no', 'off'].includes(value)) return false
  return fallback
}

function normalizeProvider(raw) {
  const value = String(raw ?? '').trim().toLowerCase()
  if (value === PAYMENT_PROVIDERS.STRIPE) return PAYMENT_PROVIDERS.STRIPE
  if (value === PAYMENT_PROVIDERS.PAYPAL) return PAYMENT_PROVIDERS.PAYPAL
  return PAYMENT_PROVIDERS.NONE
}

function normalizeSiteUrl(raw) {
  const value = String(raw ?? '').trim().replace(/\/+$/, '')
  // Sin dominio configurado se usa un origen relativo: suficiente para
  // construir las URLs de vuelta en desarrollo y en tests.
  return value === '' ? '' : value
}

/**
 * Construye la configuración de comercio. Acepta un `env` explícito para que
 * los tests puedan simular "claves pegadas" sin tocar variables reales.
 */
export function buildCommerceConfig(env = RAW_ENV) {
  const siteUrl = normalizeSiteUrl(readText(env, 'VITE_SITE_URL', ''))
  const provider = normalizeProvider(readText(env, 'VITE_PAYMENTS_PROVIDER', ''))
  const enabled = readFlag(env, 'VITE_PAYMENTS_ENABLED', true)

  const stripePrices = PRICED_PLAN_IDS.reduce((accumulator, planId) => {
    const priceId = readText(env, `VITE_STRIPE_PRICE_${planId}_MONTH`, '')
    if (priceId !== '') accumulator[planId] = priceId
    return accumulator
  }, {})

  const paypalPlans = PRICED_PLAN_IDS.reduce((accumulator, planId) => {
    const planCode = readText(env, `VITE_PAYPAL_PLAN_${planId}_MONTH`, '')
    if (planCode !== '') accumulator[planId] = planCode
    return accumulator
  }, {})

  const stripe = Object.freeze({
    publishableKey: readText(env, 'VITE_STRIPE_PUBLISHABLE_KEY', ''),
    /** Clave secreta: NUNCA se expone al cliente. Solo se documenta. */
    secretKeyConfigured: readFlag(env, 'VITE_STRIPE_SECRET_KEY_PRESENT', false),
    prices: Object.freeze(stripePrices),
    /** Stripe.js se carga desde aquí cuando hay claves. */
    sdkUrl: 'https://js.stripe.com/v3/',
  })

  const paypalEnvironmentRaw = readText(env, 'VITE_PAYPAL_ENVIRONMENT', 'sandbox').toLowerCase()
  const paypal = Object.freeze({
    clientId: readText(env, 'VITE_PAYPAL_CLIENT_ID', ''),
    environment: paypalEnvironmentRaw === 'live' ? 'live' : 'sandbox',
    plans: Object.freeze(paypalPlans),
    sdkUrl: (clientId) =>
      `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}` +
      `&intent=subscription&currency=${encodeURIComponent(readText(env, 'VITE_PAYMENTS_CURRENCY', 'EUR'))}`,
  })

  return Object.freeze({
    enabled,
    provider: enabled ? provider : PAYMENT_PROVIDERS.NONE,
    siteUrl,
    /** Moneda de cobro. Stripe/PayPal cobran en EUR; la pantalla puede mostrar otra. */
    chargeCurrency: readText(env, 'VITE_PAYMENTS_CURRENCY', DEFAULT_CURRENCY).toUpperCase(),
    displayCurrency: readText(env, 'VITE_PAYMENTS_DISPLAY_CURRENCY', DEFAULT_CURRENCY).toUpperCase(),
    /**
     * Paso de servidor que crea la sesión con la clave secreta. Por defecto
     * apunta a una ruta que NO existe todavía: mientras no exista, la respuesta
     * es un error controlado y la interfaz vuelve al modo simulación. Ver
     * `server/stripe-create-session.stub.js`.
     */
    sessionEndpoint: readText(env, 'VITE_PAYMENTS_SESSION_ENDPOINT', '/pagos/sesion'),
    successPath: readText(env, 'VITE_PAYMENTS_SUCCESS_PATH', '/order-confirmation'),
    cancelPath: readText(env, 'VITE_PAYMENTS_CANCEL_PATH', '/checkout'),
    /** Semilla del código de intercambio. Cambiarla invalida los códigos viejos. */
    shareSalt: readText(env, 'VITE_SHARE_SALT', 'bayona-intercambio'),
    stripe,
    paypal,
  })
}

/** Configuración viva de la aplicación. */
export const commerceConfig = buildCommerceConfig()

/** URL absoluta de vuelta, tolerante a que no haya dominio configurado. */
export function buildReturnUrl(config, path) {
  const cleanPath = String(path ?? '').startsWith('/') ? String(path) : `/${String(path ?? '')}`
  return `${config.siteUrl}${cleanPath}`
}

/**
 * Estado honesto de la pasarela, para pintarlo en la interfaz sin mentir.
 * `mode: 'simulation'` significa "todavía no hay claves pegadas".
 */
export function describeConfig(config = commerceConfig) {
  const stripeReady = Boolean(config.stripe.publishableKey) && Object.keys(config.stripe.prices).length > 0
  const paypalReady = Boolean(config.paypal.clientId) && Object.keys(config.paypal.plans).length > 0
  const live = config.enabled && (config.provider === PAYMENT_PROVIDERS.STRIPE ? stripeReady : config.provider === PAYMENT_PROVIDERS.PAYPAL ? paypalReady : false)

  return {
    mode: live ? 'live' : 'simulation',
    live,
    provider: live ? config.provider : PAYMENT_PROVIDERS.NONE,
    stripeReady,
    paypalReady,
    reason: live
      ? 'Pasarela activa.'
      : config.enabled
        ? 'Sin claves: la pasarela funciona en modo simulación.'
        : 'Pasarela apagada a propósito con VITE_PAYMENTS_ENABLED=false.',
  }
}
