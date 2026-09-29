/**
 * BAYONA · MEDICIÓN DE CONVERSIÓN
 * ---------------------------------------------------------------------------
 * Antes de este módulo la web no medía nada: no había forma de saber cuántas
 * personas pulsaban un CTA de WhatsApp ni qué plan miraban antes de escribir.
 * Con una conversión 100 % basada en deep links de WhatsApp, eso significaba
 * invertir en marketing a ciegas.
 *
 * Diseño:
 * · Sin dependencias. Sin SDK propietario en el bundle.
 * · No-op absoluto si no hay IDs configurados: no rompe en desarrollo ni en tests.
 * · No carga NADA antes del consentimiento (RGPD, ver consent.js).
 * · Los eventos disparados antes del consentimiento se encolan y se envían
 *   al aceptar; si se rechaza, la cola se descarta.
 * · Proveedores soportados: GA4 (gtag), Plausible y Meta Pixel. Se activa solo
 *   el que tenga variable de entorno.
 *
 * Variables de entorno (todas opcionales):
 *   VITE_GA4_ID           p. ej. G-XXXXXXXXXX
 *   VITE_PLAUSIBLE_DOMAIN p. ej. bayona-jet.vercel.app
 *   VITE_META_PIXEL_ID    p. ej. 1234567890
 *   VITE_ANALYTICS_DEBUG  'true' para volcar los eventos por consola
 */

import { CONSENT_GRANTED, getConsent, onConsentChange } from './consent.js'

const env = (typeof import.meta !== 'undefined' && import.meta.env) || {}

const GA4_ID = env.VITE_GA4_ID || ''
const PLAUSIBLE_DOMAIN = env.VITE_PLAUSIBLE_DOMAIN || ''
const META_PIXEL_ID = env.VITE_META_PIXEL_ID || ''
const DEBUG = String(env.VITE_ANALYTICS_DEBUG || '') === 'true'

/** Cola de eventos previos al consentimiento. Se acota para no crecer sin fin. */
const MAX_QUEUE = 50
let queue = []

let providersLoaded = false
let subscribed = false

function isBrowser() {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

/** true si hay al menos un proveedor configurado. */
export function isAnalyticsConfigured() {
  return Boolean(GA4_ID || PLAUSIBLE_DOMAIN || META_PIXEL_ID)
}

function debugLog(...args) {
  if (!DEBUG) return
  console.info('[bayona:analytics]', ...args)
}

/** Inserta un <script> async una sola vez, identificado por `id`. */
function injectScript({ id, src, attrs = {} }) {
  if (!isBrowser() || document.getElementById(id)) return
  const script = document.createElement('script')
  script.id = id
  script.async = true
  script.src = src
  Object.entries(attrs).forEach(([key, value]) => script.setAttribute(key, value))
  document.head.appendChild(script)
}

function loadGa4() {
  if (!GA4_ID) return

  window.dataLayer = window.dataLayer || []
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments) }

  window.gtag('js', new Date())
  /**
   * `anonymize_ip` y el envío manual de page_view: la SPA notifica las vistas
   * desde RouteAnalytics, no en la carga del script.
   */
  window.gtag('config', GA4_ID, { anonymize_ip: true, send_page_view: false })

  injectScript({ id: 'bayona-ga4', src: `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}` })
  debugLog('GA4 cargado', GA4_ID)
}

function loadPlausible() {
  if (!PLAUSIBLE_DOMAIN) return

  injectScript({
    id: 'bayona-plausible',
    src: 'https://plausible.io/js/script.tagged-events.js',
    attrs: { 'data-domain': PLAUSIBLE_DOMAIN, defer: 'defer' },
  })
  debugLog('Plausible cargado', PLAUSIBLE_DOMAIN)
}

function loadMetaPixel() {
  if (!META_PIXEL_ID) return

  if (!window.fbq) {
    const fbq = function fbqShim(...args) {
      if (fbq.callMethod) fbq.callMethod(...args)
      else fbq.queue.push(args)
    }
    fbq.queue = []
    fbq.loaded = true
    fbq.version = '2.0'
    window.fbq = fbq
    window._fbq = window._fbq || fbq
  }

  injectScript({ id: 'bayona-meta-pixel', src: 'https://connect.facebook.net/en_US/fbevents.js' })
  window.fbq('init', META_PIXEL_ID)
  debugLog('Meta Pixel cargado', META_PIXEL_ID)
}

function loadProviders() {
  if (providersLoaded || !isBrowser() || !isAnalyticsConfigured()) return
  providersLoaded = true
  loadGa4()
  loadPlausible()
  loadMetaPixel()
}

/** Nombres de evento GA4 → nombres estándar de Meta Pixel, cuando aplican. */
const META_STANDARD_EVENTS = {
  lead_submitted: 'Lead',
  whatsapp_click: 'Contact',
  plan_selected: 'AddToCart',
  checkout_started: 'InitiateCheckout',
  add_to_cart: 'AddToCart',
  view_plan: 'ViewContent',
}

/** Envía el evento a cada proveedor activo. */
function dispatch(name, params) {
  if (!isBrowser()) return

  if (GA4_ID && typeof window.gtag === 'function') {
    window.gtag('event', name, params)
  }

  if (PLAUSIBLE_DOMAIN && typeof window.plausible === 'function') {
    window.plausible(name, { props: params })
  }

  if (META_PIXEL_ID && typeof window.fbq === 'function') {
    const standard = META_STANDARD_EVENTS[name]
    if (standard) window.fbq('track', standard, params)
    else window.fbq('trackCustom', name, params)
  }
}

function flushQueue() {
  const pending = queue
  queue = []
  pending.forEach(({ name, params }) => dispatch(name, params))
  if (pending.length > 0) debugLog(`cola vaciada (${pending.length} eventos)`)
}

/**
 * Arranca la medición. Idempotente.
 * Si ya hay consentimiento, carga los proveedores; si no, se queda escuchando.
 */
export function initAnalytics() {
  if (!isBrowser()) return

  if (!subscribed) {
    subscribed = true
    onConsentChange((state) => {
      if (state === CONSENT_GRANTED) {
        loadProviders()
        flushQueue()
      } else {
        // Rechazo explícito: se descarta lo pendiente y no se carga nada.
        queue = []
      }
    })
  }

  if (getConsent() === CONSENT_GRANTED) {
    loadProviders()
    flushQueue()
  }
}

/** Quita valores nulos y recorta strings largas para no ensuciar los informes. */
function sanitizeParams(params) {
  if (!params || typeof params !== 'object') return {}

  return Object.fromEntries(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => [key, typeof value === 'string' ? value.slice(0, 120) : value]),
  )
}

/**
 * Registra un evento de conversión.
 * Seguro de llamar en cualquier momento: si no hay consentimiento, se encola;
 * si no hay proveedores configurados, no hace nada.
 */
export function trackEvent(name, params = {}) {
  if (typeof name !== 'string' || name.trim() === '') return

  const payload = sanitizeParams(params)
  debugLog('evento', name, payload)

  if (!isAnalyticsConfigured() || !isBrowser()) return

  if (getConsent() !== CONSENT_GRANTED) {
    if (queue.length < MAX_QUEUE) queue.push({ name, params: payload })
    return
  }

  loadProviders()
  dispatch(name, payload)
}

/** Registra una vista de página de la SPA. */
export function trackPageView({ path, title }) {
  trackEvent('page_view', { page_path: path, page_title: title })
}

/**
 * Registra un clic hacia WhatsApp, que es el evento de conversión real
 * de este negocio. `source` identifica el punto de la web que lo originó.
 */
export function trackWhatsAppClick({ source, plan, value, currency = 'COP' }) {
  trackEvent('whatsapp_click', { source, plan, value, currency })
}

/** Registra un lead enviado (formulario de checkout o configurador). */
export function trackLead({ source, plan, value, currency = 'COP' }) {
  trackEvent('lead_submitted', { source, plan, value, currency })
}

/** Solo para tests: reinicia el estado interno del módulo. */
export function resetAnalyticsForTests() {
  queue = []
  providersLoaded = false
  subscribed = false
}
