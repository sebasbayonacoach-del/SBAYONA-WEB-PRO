/**
 * BAYONA OS · capa de datos del área de miembros (WAVE 0-2).
 *
 * DECISIÓN DE ARQUITECTURA: no se crea un segundo sistema de datos. Se
 * reutilizan exactamente las dos fuentes que el producto ya tenía:
 *
 *   1. `localStorage` con LA MISMA CLAVE (`bayona_progress_count`) que usaba
 *      el área de miembros anterior. Si se cambiara la clave, el contador
 *      real de una persona se partiría en dos: eso sería perder su dato.
 *   2. Supabase `progress_logs` (misma tabla, mismo esquema, RLS por
 *      `user_id`), que ya escribe `/app`.
 *
 * Regla de honestidad de este módulo: NUNCA inventa. Sin filas devuelve
 * lista vacía; sin nube declara el modo. Sin dato, la interfaz enseña su
 * estado vacío.
 */
import { isCloudEnabled, supabase } from '../supabase.js'

/** Clave histórica del contador local. NO cambiar: es dato de la persona. */
export const PROGRESS_COUNT_KEY = 'bayona_progress_count'

/** Día local en formato ISO (aaaa-mm-dd), igual que `log_date` en la tabla. */
export function todayIso(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

/**
 * Rutina de ejemplo publicada. Es un EJEMPLO orientativo, no una
 * prescripción personalizada: la interfaz la rotula como tal y no promete
 * adaptación individual. Mismo contenido que ya mostraba `/app`.
 */
export const ROUTINE_EXAMPLE = Object.freeze([
  'Calentamiento con movilidad — 5 min',
  'Sentadilla goblet — 3 × 10',
  'Flexiones (o versión en rodillas) — 3 × 8',
  'Plancha — 3 × 30 seg',
  'Caminata tranquila — 10 min',
])

/** Etiqueta con la que se guarda una sesión marcada (igual que antes). */
export const SESSION_ROUTINE_LABEL = 'sesion-marcada'

/** Lee el contador local de sesiones. Devuelve 0 si no hay o está bloqueado. */
export function readLocalSessions() {
  try {
    const raw = window?.localStorage?.getItem(PROGRESS_COUNT_KEY)
    const value = Number.parseInt(String(raw ?? ''), 10)
    return Number.isFinite(value) && value > 0 ? value : 0
  } catch {
    return 0
  }
}

/** Escribe el contador local. Devuelve el valor realmente persistido. */
export function writeLocalSessions(count) {
  const safe = Number.isFinite(count) && count > 0 ? Math.trunc(count) : 0
  try {
    if (safe === 0) window?.localStorage?.removeItem(PROGRESS_COUNT_KEY)
    else window?.localStorage?.setItem(PROGRESS_COUNT_KEY, String(safe))
  } catch {
    // Almacenamiento bloqueado: el valor sigue vivo en memoria.
  }
  return safe
}

/**
 * Sesiones reales en la nube. Solo lectura y filtrada por `user_id`; la
 * política RLS de `progress_logs` garantiza que nadie ve filas ajenas.
 * @returns {Promise<{rows: Array<object>, enabled: boolean, error: Error|null}>}
 */
export async function fetchRecentLogs(userId, days = 90) {
  if (!isCloudEnabled() || !supabase || !userId) return { rows: [], enabled: false, error: null }
  try {
    const since = todayIso(new Date(Date.now() - days * 86400000))
    const { data, error } = await supabase
      .from('progress_logs')
      .select('log_date, routine, done_series')
      .eq('user_id', userId)
      .gte('log_date', since)
      .order('log_date', { ascending: true })
    if (error) return { rows: [], enabled: true, error }
    return { rows: Array.isArray(data) ? data : [], enabled: true, error: null }
  } catch (error) {
    return { rows: [], enabled: true, error }
  }
}

/**
 * Registra una sesión. Mismo contrato que ya usaba `/app` (una fila por
 * marcado). Nunca lanza: si la red falla, el contador local ya quedó.
 * @returns {Promise<{persisted: boolean}>}
 */
export async function insertSessionLog(userId, dateIso = todayIso()) {
  if (!isCloudEnabled() || !supabase || !userId) return { persisted: false }
  try {
    const { error } = await supabase.from('progress_logs').insert({
      user_id: userId,
      log_date: dateIso,
      routine: SESSION_ROUTINE_LABEL,
      done_series: 1,
    })
    return { persisted: !error }
  } catch {
    return { persisted: false }
  }
}

/** Serie de los últimos `days` días con las sesiones reales de cada fecha. */
export function buildDailySeries(rows, days = 14, today = new Date()) {
  const counts = new Map()
  for (const row of Array.isArray(rows) ? rows : []) {
    const key = String(row?.log_date ?? '').slice(0, 10)
    if (key === '') continue
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const series = []
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const key = todayIso(new Date(today.getTime() - offset * 86400000))
    series.push({ date: key, count: counts.get(key) ?? 0 })
  }
  return series
}

/** Racha real: días consecutivos con al menos una sesión, contando desde hoy. */
export function buildStreak(rows, today = new Date()) {
  const days = new Set(
    (Array.isArray(rows) ? rows : []).map((row) => String(row?.log_date ?? '').slice(0, 10)),
  )
  let streak = 0
  for (let offset = 0; offset < 365; offset += 1) {
    const key = todayIso(new Date(today.getTime() - offset * 86400000))
    if (days.has(key)) streak += 1
    else if (offset > 0) break
  }
  return streak
}

/**
 * Semana en curso (lunes como primer día). Devuelve SOLO conteos reales:
 * no hay «porcentaje de cumplimiento» porque no existe un plan planificado
 * contra el que medir. Inventar ese porcentaje sería mentir.
 */
export function buildWeekSummary(rows, today = new Date()) {
  const weekday = (today.getDay() + 6) % 7
  const monday = new Date(today.getTime() - weekday * 86400000)
  const keys = new Set()
  for (let offset = 0; offset <= weekday; offset += 1) {
    keys.add(todayIso(new Date(monday.getTime() + offset * 86400000)))
  }
  const weekRows = (Array.isArray(rows) ? rows : [])
    .filter((row) => keys.has(String(row?.log_date ?? '').slice(0, 10)))
  return {
    start: todayIso(monday),
    elapsedDays: weekday + 1,
    sessions: weekRows.length,
    activeDays: new Set(weekRows.map((row) => String(row.log_date).slice(0, 10))).size,
  }
}

/** Hitos reales derivados de las filas. Sin filas, no hay hitos. */
export function buildMilestones(rows) {
  const dates = (Array.isArray(rows) ? rows : [])
    .map((row) => String(row?.log_date ?? '').slice(0, 10))
    .filter((value) => value !== '')
    .sort()
  if (dates.length === 0) return []
  const unique = [...new Set(dates)]
  return [
    { id: 'first', label: 'PRIMERA SESIÓN', date: unique[0], detail: unique[0] },
    { id: 'last', label: 'ÚLTIMA SESIÓN', date: unique[unique.length - 1], detail: unique[unique.length - 1] },
    { id: 'total', label: 'SESIONES REGISTRADAS', date: unique[unique.length - 1], detail: String(dates.length) },
  ]
}