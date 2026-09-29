/**
 * BAYONA OS · configuración de navegación (fuente única de verdad).
 *
 * Decisión de arquitectura (WAVE 1): cinco destinos primarios, no quince, y
 * SIN rutas nuevas de nivel superior.
 *
 * ¿Por qué secciones sobre `/app` y no `/app/progreso`? Porque
 * `src/lib/seo/routeMeta.js` resuelve cualquier ruta desconocida como 404
 * (título y descripción de «no encontrado») y ese archivo pertenece al carril
 * del otro agente: tocarlo ahora sería pisar su trabajo. Con `?s=` los
 * destinos siguen siendo enlazables, el guardia `RequireAuth` cubre todos y
 * los metadatos son los correctos de `/app`.
 *
 * `available` es HONESTIDAD DE PRODUCTO, no estética: `true` cuando la
 * sección puede mostrar algo real hoy. Cuando es `false`, la sección se pinta
 * igual (la arquitectura está lista) pero declara su estado real. Pasar a
 * `true` exige que exista el dato; no es una decisión de diseño.
 */
export const APP_OS_PRIMARY_NAV = Object.freeze([
  Object.freeze({
    id: 'today',
    keys: Object.freeze(['', 'today', 'hoy']),
    to: '/app',
    label: 'HOY',
    fullLabel: 'TODAY',
    icon: 'dot',
    available: true,
    purpose: 'Qué toca ahora mismo.',
  }),
  Object.freeze({
    id: 'training',
    keys: Object.freeze(['training', 'entrenamiento']),
    to: '/app?s=training',
    label: 'ENTRENO',
    fullLabel: 'TRAINING',
    icon: 'bar',
    available: true,
    purpose: 'La sesión de hoy y su registro.',
    secondary: Object.freeze(['programas', 'ejercicios', 'calendario']),
  }),
  Object.freeze({
    id: 'progress',
    keys: Object.freeze(['progress', 'progreso']),
    to: '/app?s=progress',
    label: 'PROGRESO',
    fullLabel: 'PROGRESS',
    icon: 'line',
    available: true,
    purpose: 'Qué ha cambiado desde el punto de partida.',
    secondary: Object.freeze(['constancia', 'historial']),
  }),
  Object.freeze({
    id: 'journey',
    keys: Object.freeze(['journey', 'camino']),
    to: '/app?s=journey',
    label: 'CAMINO',
    fullLabel: 'JOURNEY',
    icon: 'path',
    available: true,
    purpose: 'Dónde estoy dentro del proceso.',
  }),
  Object.freeze({
    id: 'profile',
    keys: Object.freeze(['profile', 'perfil']),
    to: '/app?s=profile',
    label: 'PERFIL',
    fullLabel: 'PROFILE',
    icon: 'ring',
    available: true,
    purpose: 'Identidad, membresía y cuenta.',
  }),
])

/** Lee la sección pedida en la URL. Desconocida o vacía → TODAY. */
export function resolveSectionId(search) {
  const raw = String(search ?? '').replace(/^\?/, '')
  const requested = new URLSearchParams(raw).get('s') ?? ''
  const key = requested.trim().toLowerCase()
  if (key === '') return 'today'
  const found = APP_OS_PRIMARY_NAV.find((item) => item.keys.includes(key))
  return found ? found.id : 'today'
}

export function findNavBySectionId(id) {
  return APP_OS_PRIMARY_NAV.find((item) => item.id === id) ?? APP_OS_PRIMARY_NAV[0]
}

export default APP_OS_PRIMARY_NAV