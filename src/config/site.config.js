/**
 * BAYONA · IDENTIDAD DEL SITIO — FUENTE ÚNICA DE VERDAD
 * ---------------------------------------------------------------------------
 * Todo lo que define "quién es" BAYONA para buscadores, redes sociales y
 * datos estructurados vive aquí. Ningún otro archivo debe hardcodear el
 * dominio, el número de WhatsApp ni el nombre de marca.
 *
 * Reglas de contenido (heredadas de conversionContent.js):
 * · Español en toda la copia visible y en los metadatos.
 * · Sin promesas de resultado y sin lenguaje médico.
 * · Si un dato no es verificable, se omite: no se inventa.
 */

/** Dominio canónico. Sobrescribible en despliegue con VITE_SITE_URL. */
const RAW_SITE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL) || 'https://bayona-jet.vercel.app'

/** Normaliza a origen sin barra final para poder concatenar rutas con seguridad. */
export const SITE_URL = String(RAW_SITE_URL).replace(/\/+$/, '')

/**
 * URL de agenda externa. Puede apuntar a Calendly, TidyCal u otro proveedor
 * cuando exista una cuenta real. Vacía = fallback honesto a WhatsApp.
 */
const RAW_BOOKING_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BOOKING_URL) || ''

export const BOOKING_URL = /^https?:\/\//i.test(String(RAW_BOOKING_URL).trim())
  ? String(RAW_BOOKING_URL).trim()
  : ''

export function isBookingEnabled() {
  return BOOKING_URL !== ''
}

/** Número de WhatsApp en formato internacional sin signos (E.164 sin '+'). */
export const WHATSAPP_NUMBER = '34641698332'

/** Mismo número en formato legible para humanos y para schema.org. */
export const WHATSAPP_DISPLAY = '+34 641 69 83 32'

export const BRAND = {
  name: 'BAYONA',
  legalName: 'BAYONA',
  founder: 'Sebastián Bayona',
  tagline: 'Movimiento, ciencia y propósito humano.',
  locale: 'es_ES',
  lang: 'es',
  /**
   * País donde está constituido el negocio. Los servicios marcados con
   * `presencial: true` se imparten en Bogotá (Colombia): en España la oferta es
   * online y en grupo. La Ley 2/2022 de la Comunitat Valenciana reserva el
   * entrenamiento personal individual a quien acredita el Grado en CAFD
   * (arts. 9.3.b y 15), así que ningún servicio presencial puede anunciarse
   * como disponible en territorio valenciano sin esa titulación y sin estar
   * inscrito en el Censo de Profesionales del Deporte.
   */
  country: 'ES',
  themeColor: '#050505',
  backgroundColor: '#050505',
}

/** Imagen por defecto para Open Graph / Twitter. Debe ser PNG o JPG absoluto. */
export const DEFAULT_OG_IMAGE = {
  path: '/og/bayona-og.jpg',
  width: 1200,
  height: 630,
  type: 'image/jpeg',
  alt: 'BAYONA — Movimiento, ciencia y propósito humano.',
}

/**
 * Perfiles sociales oficiales, en el orden en que deben declararse como
 * `sameAs` en schema.org. Se filtran los vacíos en `siteSameAs()`.
 */
const SOCIAL_PROFILE_URLS = [
  'https://instagram.com/sebasbayona',
  'https://youtube.com/@sevisionari',
  'https://tiktok.com/@sebasbayona',
]

/** URLs de perfiles sociales no vacías, deduplicadas. */
export function siteSameAs() {
  return [...new Set(SOCIAL_PROFILE_URLS.filter((url) => typeof url === 'string' && url.trim() !== ''))]
}

/**
 * Convierte una ruta de la SPA en URL absoluta canónica.
 * · Colapsa barras duplicadas y quita la barra final (salvo en la raíz).
 * · Descarta query string y hash: no deben formar parte del canonical.
 */
export function absoluteUrl(pathname = '/') {
  const raw = typeof pathname === 'string' && pathname.trim() !== '' ? pathname.trim() : '/'
  const withoutOrigin = raw.replace(/^https?:\/\/[^/]+/i, '')
  const pathOnly = withoutOrigin.split('#')[0].split('?')[0]
  const normalized = `/${pathOnly}`.replace(/\/{2,}/g, '/')
  const trimmed = normalized.length > 1 ? normalized.replace(/\/+$/, '') : '/'
  return `${SITE_URL}${trimmed}`
}

/** URL absoluta de un asset alojado en /public. */
export function absoluteAsset(assetPath) {
  if (typeof assetPath !== 'string' || assetPath.trim() === '') return `${SITE_URL}${DEFAULT_OG_IMAGE.path}`
  if (/^https?:\/\//i.test(assetPath)) return assetPath
  return `${SITE_URL}/${assetPath.replace(/^\/+/, '')}`
}

/** Deep link de WhatsApp. Única forma permitida de construir la URL. */
export function whatsAppLink(message) {
  const text = typeof message === 'string' && message.trim() !== '' ? message : ''
  return text === ''
    ? `https://wa.me/${WHATSAPP_NUMBER}`
    : `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
}


/**
 * Destino de valoración: calendario real cuando está configurado y WhatsApp
 * cuando todavía no existe proveedor. Nunca fabrica disponibilidad.
 */
export function bookingLink(fallbackMessage) {
  return isBookingEnabled() ? BOOKING_URL : whatsAppLink(fallbackMessage)
}
