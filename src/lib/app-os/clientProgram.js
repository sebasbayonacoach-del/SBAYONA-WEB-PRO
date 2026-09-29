import { useEffect, useState } from 'react'

/**
 * BAYONA OS · estructura inicial del programa del cliente.
 *
 * Hoy vive en código porque todavía no existe el backend de asignación de
 * rutinas. Está separada para que después Sebastián pueda reemplazarla por
 * datos reales sin rediseñar la interfaz.
 */

export const CLIENT_PROGRAM_KEY = 'bayona_client_program_v1'

export const CLIENT_PROGRAM = Object.freeze({
  name: 'Base atlética RAÍZ',
  phase: 'Fase 01 · Reconstrucción',
  week: 'Semana 1',
  coachNote:
    'Prioridad: recuperar constancia, técnica y sensación de control antes de subir intensidad.',
  nextCheckIn: 'Revisión: domingo',
  readiness: Object.freeze([
    Object.freeze({ label: 'Energía', value: 'Media', tone: 'steady' }),
    Object.freeze({ label: 'Carga', value: 'Controlada', tone: 'good' }),
    Object.freeze({ label: 'Riesgo', value: 'Bajo', tone: 'good' }),
  ]),
  weekPlan: Object.freeze([
    Object.freeze({ day: 'Lun', focus: 'Fuerza base', status: 'Hoy' }),
    Object.freeze({ day: 'Mar', focus: 'Movilidad + pasos', status: 'Ligero' }),
    Object.freeze({ day: 'Mié', focus: 'Full body', status: 'Programado' }),
    Object.freeze({ day: 'Jue', focus: 'Recuperación', status: 'Control' }),
    Object.freeze({ day: 'Vie', focus: 'Técnica + core', status: 'Programado' }),
    Object.freeze({ day: 'Sáb', focus: 'Zona 2', status: 'Opcional' }),
    Object.freeze({ day: 'Dom', focus: 'Check-in', status: 'Revisión' }),
  ]),
  sessionBlocks: Object.freeze([
    Object.freeze({
      id: 'warmup',
      label: 'Activación',
      time: '06 min',
      goal: 'Subir temperatura y desbloquear cadera/columna.',
    }),
    Object.freeze({
      id: 'strength',
      label: 'Fuerza',
      time: '16 min',
      goal: 'Patrón de sentadilla + empuje con técnica limpia.',
    }),
    Object.freeze({
      id: 'core',
      label: 'Control',
      time: '06 min',
      goal: 'Centro estable, respiración y postura.',
    }),
    Object.freeze({
      id: 'recovery',
      label: 'Salida',
      time: '07 min',
      goal: 'Bajar pulsaciones y dejar el cuerpo listo para mañana.',
    }),
  ]),
  coachBuilder: Object.freeze([
    Object.freeze({ label: 'Objetivo', value: 'Constancia + base física' }),
    Object.freeze({ label: 'Restricción', value: 'Sin cargas máximas todavía' }),
    Object.freeze({ label: 'Siguiente ajuste', value: 'Asignar progresión por nivel' }),
  ]),
})

function mutableProgram(program = CLIENT_PROGRAM) {
  return {
    ...program,
    readiness: [...program.readiness],
    weekPlan: [...program.weekPlan],
    sessionBlocks: [...program.sessionBlocks],
    coachBuilder: [...program.coachBuilder],
  }
}

export function normalizeClientProgram(value) {
  const source = value && typeof value === 'object' ? value : {}
  return {
    ...mutableProgram(CLIENT_PROGRAM),
    name: typeof source.name === 'string' && source.name.trim() ? source.name.trim() : CLIENT_PROGRAM.name,
    phase: typeof source.phase === 'string' && source.phase.trim() ? source.phase.trim() : CLIENT_PROGRAM.phase,
    week: typeof source.week === 'string' && source.week.trim() ? source.week.trim() : CLIENT_PROGRAM.week,
    coachNote:
      typeof source.coachNote === 'string' && source.coachNote.trim()
        ? source.coachNote.trim()
        : CLIENT_PROGRAM.coachNote,
    nextCheckIn:
      typeof source.nextCheckIn === 'string' && source.nextCheckIn.trim()
        ? source.nextCheckIn.trim()
        : CLIENT_PROGRAM.nextCheckIn,
  }
}

export function readClientProgram() {
  try {
    const raw = window?.localStorage?.getItem(CLIENT_PROGRAM_KEY)
    if (!raw) return mutableProgram(CLIENT_PROGRAM)
    return normalizeClientProgram(JSON.parse(raw))
  } catch {
    return mutableProgram(CLIENT_PROGRAM)
  }
}

export function writeClientProgram(program) {
  const safe = normalizeClientProgram(program)
  try {
    window?.localStorage?.setItem(CLIENT_PROGRAM_KEY, JSON.stringify(safe))
  } catch {
    // Si el navegador bloquea storage, la app conserva el estado en memoria.
  }
  return safe
}

export function resetClientProgram() {
  try {
    window?.localStorage?.removeItem(CLIENT_PROGRAM_KEY)
  } catch {
    // Sin ruido: reset local no debe romper el panel.
  }
  return mutableProgram(CLIENT_PROGRAM)
}

export function useClientProgram() {
  const [program, setProgram] = useState(() => mutableProgram(CLIENT_PROGRAM))

  useEffect(() => {
    setProgram(readClientProgram())
  }, [])

  function updateProgram(patch) {
    setProgram((current) => writeClientProgram({ ...current, ...patch }))
  }

  function restoreProgram() {
    setProgram(resetClientProgram())
  }

  return { program, updateProgram, restoreProgram }
}

export default CLIENT_PROGRAM
