/**
 * BAYONA · Push nativo (Capacitor) — no-op salvo app nativa + Firebase.
 *
 * - Solo actúa si `window.Capacitor?.isNativePlatform()` (o
 *   `Capacitor.isNativePlatform()`) es `true` Y Firebase está activo.
 * - En web, sin claves o sin permiso: no-op silencioso, sin errores.
 * - NO toca `android/` nativo: sin `google-services.json` el proyecto Android
 *   no compila push; ese fichero lo pone el dueño en `android/app/`
 *   (ver `docs/SAAS-SETUP.md`, sección FIREBASE).
 */
import { Capacitor } from '@capacitor/core'
import { firebaseApp, isFirebaseEnabled } from '../firebase.js'
import { isCloudEnabled, supabase } from '../supabase.js'
import { PUSH_TOKEN_KEY } from './usePush.js'

function isNative() {
  try {
    if (typeof Capacitor?.isNativePlatform === 'function' && Capacitor.isNativePlatform()) return true
    const winCap = typeof window !== 'undefined' ? window.Capacitor : null
    if (typeof winCap?.isNativePlatform === 'function') return winCap.isNativePlatform()
    return false
  } catch {
    return false
  }
}

function storeToken(token) {
  try {
    window?.localStorage?.setItem(PUSH_TOKEN_KEY, token)
  } catch {
    // Silencio: el registro ya se intentó.
  }
}

/**
 * Registra el push nativo. Llamar una vez tras el arranque en la app
 * empaquetada (o tras login). Nunca lanza, nunca pide nada en web.
 */
export async function registerNativePush() {
  try {
    if (!isNative()) return { ok: false, reason: 'not-native' }
    if (!isFirebaseEnabled() || !firebaseApp) return { ok: false, reason: 'disabled' }
    const { PushNotifications } = await import('@capacitor/push-notifications')
    const perm = await PushNotifications.requestPermissions()
    if (perm?.receive !== 'granted') return { ok: false, reason: 'denied' }
    await PushNotifications.register()
    // El token llega por listener; se guarda igual que el de web.
    try {
      await PushNotifications.addListener('registration', async (event) => {
        const token = event?.value ?? null
        if (!token) return
        storeToken(token)
        try {
          if (isCloudEnabled() && supabase) {
            const { data } = await supabase.auth.getUser()
            const userId = data?.user?.id ?? null
            if (!userId) return
            await supabase.from('push_tokens').upsert(
              { user_id: userId, token, platform: 'android' },
              { onConflict: 'user_id,token' },
            )
          }
        } catch {
          // Best-effort.
        }
      })
    } catch {
      // Sin listener sigue registrado.
    }
    return { ok: true }
  } catch {
    return { ok: false, reason: 'error' }
  }
}

export default registerNativePush
