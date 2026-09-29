/**
 * BAYONA · Cliente Firebase en modo degradado (push + crash + beta).
 *
 * - Firebase se usa SOLO para 3 servicios gratuitos: push (FCM),
 *   crash reports y distribución beta. La base de datos sigue en Supabase.
 * - Si existe `VITE_FIREBASE_API_KEY` (y resto `VITE_FIREBASE_*`), inicializa
 *   la app real y `isFirebaseEnabled() === true`.
 * - Si faltan (estado actual: el proyecto Firebase aún no existe), exporta
 *   `firebaseApp = null` y `isFirebaseEnabled() === false`. La web sigue
 *   funcionando sin tirar ningún error por consola.
 *
 * Cero `console.*` en este módulo en ambos modos: el silencio es el contrato.
 */
import { getApps, initializeApp } from 'firebase/app'

function readEnv(name) {
  try {
    const value = import.meta?.env?.[name]
    return typeof value === 'string' && value.trim() !== '' ? value.trim() : null
  } catch {
    return null
  }
}

const firebaseConfig = {
  apiKey: readEnv('VITE_FIREBASE_API_KEY'),
  authDomain: readEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: readEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: readEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: readEnv('VITE_FIREBASE_APP_ID'),
}

const vapidKey = readEnv('VITE_FIREBASE_VAPID_KEY')

let app = null

if (firebaseConfig.apiKey) {
  try {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig)
  } catch {
    app = null
  }
}

/** App Firebase o `null` en modo degradado (sin claves). */
export const firebaseApp = app

/** Config leída (sin secretos reales en el repo: solo viene de env vars). */
export const firebaseOptions = app ? { ...firebaseConfig } : null

/** Clave pública VAPID para FCM web (puede ser `null`). */
export const firebaseVapidKey = vapidKey

/** `true` solo cuando hay app Firebase real inicializada. */
export function isFirebaseEnabled() {
  return app !== null
}
