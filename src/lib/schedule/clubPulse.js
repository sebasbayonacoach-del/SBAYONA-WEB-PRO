/**
 * El pulso semanal de la comunidad.
 *
 * La franja de siete días de /community se leía como una etiqueta de calendario:
 * decía qué día era y poco más (anotaciones 52 y 53 pedían convertirlo en
 * sistema). Aquí se decide, dato por dato, qué día merece ser una pieza
 * navegable: solo los que tienen panel en la agenda. Un día sin agenda no
 * ofrece destino, aunque el JSX lo marque como activo, porque navegar a un panel
 * que no existe es justo el defecto que hay que impedir.
 */

const DAY_BY_LABEL = Object.freeze({
  LUN: 'LUNES',
  MAR: 'MARTES',
  MIÉ: 'MIÉRCOLES',
  JUE: 'JUEVES',
  VIE: 'VIERNES',
  SÁB: 'SÁBADO',
  DOM: 'DOMINGO',
})

/** Nombre completo del día, a partir de la etiqueta de tres letras del calendario. */
export function dayName(label) {
  return DAY_BY_LABEL[String(label ?? '').toUpperCase()] ?? String(label ?? '').toUpperCase()
}

/**
 * Id del panel que desarrolla ese día. Se calcula con el mismo nombre en las dos
 * puntas (botón del calendario y panel) para que el enlace no pueda quedar
 * huérfano si mañana se añade un día.
 */
export function pulsePanelId(day) {
  const slug = String(day ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return `pulso-${slug}`
}

/** El panel de la agenda que corresponde a la etiqueta del calendario, o null. */
export function findDayAgenda(label, agenda) {
  const name = dayName(label)

  return (agenda ?? []).find((entry) => entry?.day === name) ?? null
}

/**
 * Devuelve la franja semanal lista para pintar: cada día conserva lo que ya traía
 * y añade `hasAgenda`, `panelId` y `destination`. `destination` solo existe si
 * existe el panel, y es lo único que convierte el día en botón.
 */
export function buildWeekPulse(days, agenda) {
  return (days ?? []).map((day) => {
    const entry = findDayAgenda(day.label, agenda)
    const panelId = entry ? pulsePanelId(entry.day) : null

    return {
      ...day,
      hasAgenda: Boolean(entry),
      panelId,
      destination: panelId ? `#${panelId}` : null,
    }
  })
}
