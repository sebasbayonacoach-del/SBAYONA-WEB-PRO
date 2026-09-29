// loadingProgress — fuente de progreso de carga de assets del engine (Fase 7B).
//
// Origen del módulo: hasta Fase 7A, el Loader del shell consumia `useProgress()`
// de `@react-three/drei` para leer el progreso de assets 3D. Ese import estatico
// era la unica cadena que arrastraba `vendor-three` (216,48 kB gzip) al chunk de
// entrada de TODAS las rutas (hallazgo 7A-01, ver FASE7A-FORENSIC.md).
//
// Este modulo replica el MINIMO del contrato que el Loader usaba:
//   { progress, active, loaded, total }
// con un store agnostico de WebGL (sin Three, sin drei, sin React): cualquier
// consumidor puede suscribirse con `subscribe()` y las escenas que carguen
// assets (cuando exista alguna admitida) reportan su avance con `update()`.
//
// Semantica conservada:
//   - `total === 0`: no hay assets declarados -> el Loader resuelve "listo" por
//     su propio fallback (READY_FALLBACK_MS), igual que antes (R20.6).
//   - `total > 0`: listo cuando `progress >= 100` y `!active` (R20.2).
//   - `reset()` permite devolver el store a su estado inicial entre escenas.
//
// GOBERNANZA: este archivo es del shell. PROHIBIDO importar aqui `three`,
// `@react-three/*` o cualquier dependencia WebGL (lo vigila
// `src/test/fase7aSceneGovernance.test.js`).

let state = Object.freeze({
  active: false,
  progress: 0,
  loaded: 0,
  total: 0,
})

const listeners = new Set()

function emit() {
  // H-02 (Fase 8B): cada listener se notifica de forma aislada. Un listener
  // que lance no puede interrumpir la notificación del resto ni propagar la
  // excepción hasta update()/reset(). El error se registra en consola (no se
  // silencia) pero el store sigue operativo: es infraestructura del shell.
  for (const listener of listeners) {
    try {
      listener(state)
    } catch (error) {
      // El fallo de UN observador no debe tumbar la carga del resto.
      console.error('[loadingProgress] un observador de progreso lanzó un error:', error)
    }
  }
}

/**
 * Estado actual del progreso de carga (inmutable).
 * @returns {{active: boolean, progress: number, loaded: number, total: number}}
 */
export function getLoadingProgress() {
  return state
}

/**
 * Suscribe un observador a los cambios de progreso.
 * @param {(state: {active: boolean, progress: number, loaded: number, total: number}) => void} listener
 * @returns {() => void} Funcion de dessuscripcion.
 */
export function subscribeLoadingProgress(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Notifica el avance de una carga de assets.
 *
 * @param {{loaded?: number, total?: number, progress?: number, active?: boolean}} patch
 *   Valores nuevos; `progress` se calcula desde loaded/total si no se da.
 */
export function updateLoadingProgress(patch = {}) {
  const next = { ...state }

  if (Number.isFinite(patch.loaded)) next.loaded = Math.max(0, Math.round(patch.loaded))
  if (Number.isFinite(patch.total)) next.total = Math.max(0, Math.round(patch.total))
  // H-02 (Fase 8B): el contador no puede exceder el total declarado. Antes,
  // una notificación {total: 2, loaded: 99} dejaba el estado en 99/2 —
  // inconsistencia benigna hoy, rota para un futuro consumidor que calcule
  // "assets restantes". El progreso se sigue acotando a [0, 100] aparte.
  if (Number.isFinite(next.total) && Number.isFinite(next.loaded)) {
    next.loaded = Math.min(next.loaded, next.total)
  }
  if (Number.isFinite(patch.progress)) {
    next.progress = Math.min(100, Math.max(0, patch.progress))
  } else if (next.total > 0) {
    next.progress = Math.min(100, (next.loaded / next.total) * 100)
  }
  if (typeof patch.active === 'boolean') next.active = patch.active

  state = Object.freeze(next)
  emit()
}

/**
 * Devuelve el store a su estado inicial (sin cargas declaradas).
 */
export function resetLoadingProgress() {
  state = Object.freeze({ active: false, progress: 0, loaded: 0, total: 0 })
  emit()
}
