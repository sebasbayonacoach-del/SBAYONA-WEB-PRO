/**
 * COMPARTIR · el enlace sale del visitante, no de BAYONA
 * ---------------------------------------------------------------------------
 * `src/config/site.config.js` ya tiene `whatsAppLink()`, y ese va al número de
 * BAYONA: sirve para escribirnos. Aquí hace falta lo contrario, un enlace SIN
 * número para que WhatsApp abra el selector de contactos y la persona elija a
 * qué amigo se lo manda. Ese es el intercambio real que se está cobrando, así
 * que se construye aparte y se deja dicho por qué.
 *
 * No hay llamada de red: solo se devuelve una URL para un `<a href>`.
 */

import { SITE_URL } from '../../config/site.config.js'

/** `https://wa.me/?text=…` sin número: abre el selector de contactos. */
export function whatsAppShareUrl(message) {
  const text = String(message ?? '').trim()
  return text === '' ? 'https://wa.me/' : `https://wa.me/?text=${encodeURIComponent(text)}`
}

/** Enlace profundo a la web para el Web Share API o para copiar. */
export function buildDeepLink(path = '/checkout', siteUrl = SITE_URL) {
  const cleanPath = String(path).startsWith('/') ? String(path) : `/${String(path)}`
  return `${String(siteUrl).replace(/\/+$/, '')}${cleanPath}`
}

/**
 * Comparte con la API nativa del dispositivo cuando existe (móvil) y devuelve
 * `false` si no, para que la interfaz muestre el enlace manual en vez de
 * quedarse callada. No lanza nunca: cancelar no es un error.
 */
export async function shareNatively(payload) {
  const navigator = typeof globalThis !== 'undefined' ? globalThis.navigator : undefined
  if (!navigator?.share) return false

  try {
    await navigator.share({ title: 'BAYONA', text: payload.message, url: payload.shareUrl })
    return true
  } catch {
    return false
  }
}
