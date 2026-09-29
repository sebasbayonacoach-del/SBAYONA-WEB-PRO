/**
 * BAYONA · LABORATORIO ESPACIAL — NAVEGACIÓN DE ESTACIONES (lógica PURA)
 * -----------------------------------------------------------------------
 * Funciones sin React, sin Three y sin scroll: se pueden probar solas y son la
 * única fuente de verdad de "en qué estación estoy". Mantenerlas puras es lo
 * que permite que mañana la cámara 3D lea el MISMO estado sin convertirse en
 * dueña de la navegación.
 *
 * Decisiones deliberadas del Lote 1 (arquitectura mínima, no pobre):
 *  - Sin Zustand ni store global: tres estaciones y un índice no necesitan un
 *    sistema de estado; un `useReducer` local con estas funciones basta y es
 *    sustituible sin tocar el contenido.
 *  - Sin envolverse (wrap): en un recorrido, "atrás" en la primera estación
 *    debe quedarse en la primera estación. Un bucle daría la falsa sensación de
 *    que el espacio es infinito cuando no lo es.
 *  - `visited` se registra para poder distinguir "recorrido hecho" de
 *    "primera pantalla", no para medir a nadie: no se persiste en ninguna parte.
 */

/** Estado inicial del recorrido: primera estación, nada recorrido aún. */
export function initialNavigation(count = 3) {
  return { index: 0, count, visited: [0], startedAt: null, moved: false }
}

/** Recorta un índice al rango válido [0, count-1]. Nunca lanza. */
export function clampIndex(index, count) {
  const safeCount = Number.isInteger(count) && count > 0 ? count : 1
  if (!Number.isFinite(index)) return 0
  return Math.min(Math.max(Math.trunc(index), 0), safeCount - 1)
}

/** Avanza o retrocede una estación, sin envolverse. */
export function step(state, delta = 1) {
  const next = clampIndex(state.index + Math.trunc(delta || 0), state.count)
  return touch(state, next)
}

/** Salta a una estación concreta; un índice inválido no mueve nada. */
export function goTo(state, index) {
  if (!Number.isFinite(index)) return state
  return touch(state, clampIndex(index, state.count))
}

/** Vuelve al principio del recorrido (salida predecible, sin cámara de despedida). */
export function reset(state) {
  return { ...state, index: 0, visited: [0], moved: false }
}

/** Progreso del recorrido 0..1 (para la barra de luz; no para animar cámaras). */
export function progressOf(state) {
  if (state.count <= 1) return 1
  return state.index / (state.count - 1)
}

/** ¿Ya se vieron todas las estaciones? (criterio de "recorrido completo").  */
export function isComplete(state) {
  return state.visited.length >= state.count
}

function touch(state, index) {
  if (index === state.index && state.startedAt !== null) {
    return state
  }
  return {
    ...state,
    index,
    moved: true,
    startedAt: state.startedAt ?? index,
    visited: state.visited.includes(index) ? state.visited : [...state.visited, index],
  }
}
