/**
 * BAYONA · Push web (FCM) con gesto explícito.
 *
 * - `requestPushPermission()`: pide permiso Notification SOLO cuando se llama
 *   (botón "Activar avisos" en /app). Nunca se llama al cargar.
 * - Sin Firebase (`isFirebaseEnabled() === false`), sin `Notification` o sin
 *   permiso: no-op silencioso, sin errores por consola.
 * - Con Firebase + permiso: obtiene el token FCM, lo guarda en localStorage
 *   (`bayona_push_token`) y lo sube a Supabase (`push_tokens`, ver schema.sql).
 *   Fallar al subir no rompe nada: el token local ya quedó guardado.
 */
import { useCallback } from 'react'
import { firebaseApp, firebaseVapidKey, isFirebaseEnabled } from '../firebase.js'
import { isCloudEnabled, supabase } from '../supabase.js'

export const PUSH_TOKEN_KEY = 'bayona_push_token'

function readStoredToken() {
  try {
    return window?.localStorage?.getItem(PUSH_TOKEN_KEY) ?? null
  } catch {
    return null
  }
}

function storeToken(token) {
  try {
    window?.localStorage?.setItem(PUSH_TOKEN_KEY, token)
  } catch {
    // Almacenamiento bloqueado: el token en memoria ya se devuelve igual.
  }
}

async function saveTokenToSupabase(token) {
  if (!isCloudEnabled() || !supabase) return
  try {
    let userId = null
    try {
      const { data } = await supabase.auth.getUser()
      userId = data?.user?.id ?? null
    } catch {
      userId = null
    }
    // RLS exige user_id = auth.uid(): sin sesión no se puede insertar.
    if (!userId) return
    await supabase.from('push_tokens').upsert(
      { user_id: userId, token, platform: 'web' },
      { onConflict: 'user_id,token' },
    )
  } catch {
    // Subida best-effort: el token local ya vale para reintentar.
  }
}

/**
 * Pide permiso de notificaciones y registra el token FCM.
 * Pensada para llamarse tras un gesto (clic). Nunca lanza.
 */
export async function requestPushPermission() {
  try {
    if (!isFirebaseEnabled() || !firebaseApp) return { ok: false, reason: 'disabled' }
    if (typeof window === 'undefined' || typeof Notification === 'undefined') {
      return { ok: false, reason: 'unsupported' }
    }
    if (Notification.permission === 'denied') return { ok: false, reason: 'denied' }
    if (Notification.permission !== 'granted') {
      const result = await Notification.requestPermission()
      if (result !== 'granted') return { ok: false, reason: result }
    }
    // Import diferido: firebase/messaging solo existe en navegador.
    const { getMessaging, getToken } = await import('firebase/messaging')
    const messaging = getMessaging(firebaseApp)
    const token = await getToken(messaging, firebaseVapidKey ? { vapidKey: firebaseVapidKey } : undefined)
    if (!token) return { ok: false, reason: 'no-token' }
    storeToken(token)
    await saveTokenToSupabase(token)
    return { ok: true, token }
  } catch {
    return { ok: false, reason: 'error' }
  }
}

/** Devuelve el token guardado en este dispositivo (o `null`). */
export function getStoredPushToken() {
  return readStoredToken()
}

/**
 * Hook para el botón "Activar avisos". No pide nada al montar:
 * expone `requestPushPermission` + estado mínimo para la UI.
 */
export function usePush() {
  const request = useCallback(() => requestPushPermission(), [])
  return { requestPushPermission: request, getStoredPushToken }
}

export default usePush
