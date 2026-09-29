/**
 * BAYONA · CONSENTIMIENTO DE MEDICIÓN
 * ---------------------------------------------------------------------------
 * BAYONA opera desde España, así que el RGPD aplica: ninguna cookie ni script
 * de analítica puede cargarse antes de que la persona lo acepte.
 *
 * Este módulo es la única fuente de verdad del estado de consentimiento.
 * `analytics.js` no carga ningún proveedor hasta que aquí hay 'granted'.
 *
 * Estados:
 *   null       → sin decidir (se muestra el banner)
 *   'granted'  → medición activa
 *   'denied'   → medición desactivada; no se guarda nada más
 */

export const CONSENT_STORAGE_KEY = 'bayona:consent:v1'

export const CONSENT_GRANTED = 'granted'
export const CONSENT_DENIED = 'denied'

const listeners = new Set()

/** Estado en memoria. Se hidrata desde localStorage en el primer acceso. */
let currentState
let hydrated = false

function canUseStorage() {
  if (typeof window === 'undefined') return false
  try {
    const probe = '__bayona_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return true
  } catch {
    // Safari en modo privado, cookies bloqueadas o storage lleno.
    return false
  }
}

function hydrate() {
  if (hydrated) return
  hydrated = true

  if (!canUseStorage()) {
    currentState = null
    return
  }

  const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY)
  currentState = stored === CONSENT_GRANTED || stored === CONSENT_DENIED ? stored : null
}

/** Estado actual del consentimiento: 'granted', 'denied' o null. */
export function getConsent() {
  hydrate()
  return currentState ?? null
}

/** true solo si hay consentimiento explícito para medir. */
export function hasAnalyticsConsent() {
  return getConsent() === CONSENT_GRANTED
}

/** true si todavía no se ha tomado ninguna decisión. */
export function isConsentPending() {
  return getConsent() === null
}

/** Registra la decisión y avisa a los suscriptores. */
export function setConsent(nextState) {
  if (nextState !== CONSENT_GRANTED && nextState !== CONSENT_DENIED) {
    throw new TypeError(`Consentimiento no válido: ${String(nextState)}`)
  }

  hydrate()
  currentState = nextState

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, nextState)
    } catch {
      // Si no se puede persistir, el estado vive solo en esta sesión.
    }
  }

  listeners.forEach((listener) => {
    try {
      listener(nextState)
    } catch {
      // Un suscriptor roto no debe impedir que los demás se enteren.
    }
  })

  return nextState
}

/** Suscribe a cambios de consentimiento. Devuelve la función para desuscribir. */
export function onConsentChange(listener) {
  if (typeof listener !== 'function') throw new TypeError('onConsentChange espera una función')
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Solo para tests: limpia el estado en memoria y los suscriptores. */
export function resetConsentForTests() {
  currentState = undefined
  hydrated = false
  listeners.clear()
}
