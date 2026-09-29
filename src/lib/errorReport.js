/**
 * BAYONA · Reporte centralizado de errores (punto único).
 *
 * Hoy: `console.error` + guarda las últimas 50 entradas en localStorage
 * (`bayona_error_log`) para depurar sin backend.
 *
 * TODO (cuando Firebase tenga claves): enchufar Crashlytics AQUÍ y solo aquí
 * (p. ej. `logToCrashlytics(report)` tras el `console.error`). Ningún otro
 * fichero debe llamar a Crashlytics directamente: todo pasa por `reportError`.
 *
 * Sin errores secundarios: si localStorage está bloqueado, sigue en memoria.
 */
const STORAGE_KEY = 'bayona_error_log'
const MAX_ENTRIES = 50

function safeMessage(error) {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  try {
    return JSON.stringify(error)?.slice(0, 500) ?? 'Error desconocido'
  } catch {
    return 'Error desconocido'
  }
}

function readLog() {
  try {
    const raw = window?.localStorage?.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLog(entries) {
  try {
    window?.localStorage?.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)))
  } catch {
    // Almacenamiento bloqueado: el console.error ya quedó arriba.
  }
}

/**
 * Registra un error en consola + log local rotativo (máx. 50).
 * Nunca lanza: fallar al reportar no puede romper la app.
 */
export function reportError(error, contexto) {
  const entry = {
    message: safeMessage(error),
    stack: error instanceof Error ? String(error.stack ?? '').slice(0, 1000) : undefined,
    contexto: typeof contexto === 'string' ? contexto : contexto ?? null,
    path: typeof window !== 'undefined' ? window.location?.pathname ?? '' : '',
    time: new Date().toISOString(),
  }
  try {
    console.error('[bayona] error', entry.contexto ?? '', error)
  } catch {
    // Consola no disponible (SSR/tests raros): seguir al log local.
  }
  try {
    writeLog([...readLog(), entry])
  } catch {
    // No romper nunca por el reporte.
  }
  // TODO-Crashlytics: cuando Firebase esté activo, llamar aquí a
  // Crashlytics (p. ej. recordException) con `entry`. Solo este fichero.
  return entry
}

/** Lee el log local (para depuración o tests). */
export function getErrorLog() {
  return readLog()
}

/** Limpia el log local. */
export function clearErrorLog() {
  try {
    window?.localStorage?.removeItem(STORAGE_KEY)
  } catch {
    // Silencio: limpiar nunca rompe.
  }
}

export const ERROR_LOG_KEY = STORAGE_KEY
export const ERROR_LOG_MAX = MAX_ENTRIES
