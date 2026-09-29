/**
 * BAYONA · PUENTE A WHATSAPP
 * ---------------------------------------------------------------------------
 * Toda la conversión del negocio pasa por un deep link de WhatsApp. Hasta
 * ahora el código hacía `window.open(url, '_blank')` y no comprobaba el
 * resultado: si el navegador bloqueaba la pestaña (muy habitual en iOS, en
 * navegadores embebidos de Instagram/TikTok o con bloqueadores activos), el
 * lead desaparecía en silencio. La persona pensaba que había enviado su
 * solicitud y en BAYONA no llegaba nada.
 *
 * Este módulo:
 * · Abre WhatsApp preservando la firma original (`_blank`, `noopener,noreferrer`).
 * · Informa si la apertura falló, para que la UI ofrezca un enlace manual.
 * · Guarda una copia local de la solicitud SOLO cuando la apertura falla,
 *   con caducidad, para que no se pierda y se pueda reintentar.
 * · Registra el evento de conversión (ver lib/analytics).
 */

import { trackWhatsAppClick } from '../analytics/analytics.js'

/** Clave del respaldo local de la última solicitud no entregada. */
export const PENDING_LEAD_KEY = 'bayona:pending-lead:v1'

/** El respaldo caduca a los 7 días: es una red de seguridad, no un CRM. */
export const PENDING_LEAD_TTL_MS = 7 * 24 * 60 * 60 * 1000

function storage() {
  if (typeof window === 'undefined') return null
  try {
    const probe = '__bayona_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return window.localStorage
  } catch {
    return null
  }
}

/**
 * Abre WhatsApp en una pestaña nueva.
 *
 * @returns {{opened: boolean, url: string, reason?: 'no-window'|'blocked'|'error'}}
 *   `opened: false` significa que hay que mostrar el enlace manual.
 */
export function openWhatsApp(url, { source, plan, value } = {}) {
  if (typeof url !== 'string' || url.trim() === '') {
    throw new TypeError('openWhatsApp necesita una URL de WhatsApp válida')
  }

  trackWhatsAppClick({ source, plan, value })

  if (typeof window === 'undefined' || typeof window.open !== 'function') {
    return { opened: false, url, reason: 'no-window' }
  }

  let handle = null
  try {
    // Firma idéntica a la original: el contrato de seguridad no cambia.
    handle = window.open(url, '_blank', 'noopener,noreferrer')
  } catch {
    return { opened: false, url, reason: 'error' }
  }

  if (!handle) return { opened: false, url, reason: 'blocked' }

  try {
    handle.opener = null
  } catch {
    // Algunos navegadores devuelven un handle de solo lectura. No es un fallo.
  }

  return { opened: true, url }
}

/**
 * Guarda una copia local de la solicitud que no se pudo entregar.
 * Es dato que la propia persona acaba de escribir, se queda en su dispositivo
 * y existe únicamente para que pueda reintentar el envío. Caduca a los 7 días.
 */
export function rememberPendingLead({ url, summary, source }) {
  const store = storage()
  if (!store) return false

  try {
    store.setItem(
      PENDING_LEAD_KEY,
      JSON.stringify({
        url,
        summary: typeof summary === 'string' ? summary.slice(0, 600) : '',
        source: source ?? 'desconocido',
        savedAt: Date.now(),
      }),
    )
    return true
  } catch {
    return false
  }
}

/** Lee el respaldo pendiente si existe y no ha caducado. */
export function readPendingLead() {
  const store = storage()
  if (!store) return null

  try {
    const raw = store.getItem(PENDING_LEAD_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed.url !== 'string') return null

    if (!Number.isFinite(parsed.savedAt) || Date.now() - parsed.savedAt > PENDING_LEAD_TTL_MS) {
      store.removeItem(PENDING_LEAD_KEY)
      return null
    }

    return parsed
  } catch {
    return null
  }
}

/** Descarta el respaldo pendiente. */
export function clearPendingLead() {
  const store = storage()
  if (!store) return
  try {
    store.removeItem(PENDING_LEAD_KEY)
  } catch {
    // Nada que hacer: el respaldo caducará por sí solo.
  }
}
