import { describe, expect, it, beforeEach, vi } from 'vitest'
import {
  PROGRESS_COUNT_KEY,
  ROUTINE_EXAMPLE,
  buildDailySeries,
  buildMilestones,
  buildStreak,
  buildWeekSummary,
  readLocalSessions,
  todayIso,
  writeLocalSessions,
} from './progressStore.js'
import { greetingFor, identityNameOf } from './useAppData.js'

const TODAY = new Date('2026-09-18T12:00:00') // viernes

describe('progressStore · contador local reutiliza la clave histórica', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('usa exactamente la clave que ya usaba el área de miembros', () => {
    expect(PROGRESS_COUNT_KEY).toBe('bayona_progress_count')
  })

  it('sin valor devuelve 0 (no inventa cero sesiones como dato)', () => {
    expect(readLocalSessions()).toBe(0)
  })

  it('escribe y relee el contador', () => {
    expect(writeLocalSessions(3)).toBe(3)
    expect(readLocalSessions()).toBe(3)
    expect(window.localStorage.getItem(PROGRESS_COUNT_KEY)).toBe('3')
  })

  it('valores inválidos o negativos no se persisten', () => {
    writeLocalSessions(5)
    expect(writeLocalSessions(-2)).toBe(0)
    expect(readLocalSessions()).toBe(0)
    expect(window.localStorage.getItem(PROGRESS_COUNT_KEY)).toBeNull()
  })
})

describe('progressStore · series reales desde filas de progress_logs', () => {
  const rows = [
    { log_date: '2026-09-16' },
    { log_date: '2026-09-16' },
    { log_date: '2026-09-18' },
  ]

  it('cuenta por día y rellena los días sin registro con 0', () => {
    const series = buildDailySeries(rows, 3, TODAY)
    expect(series).toEqual([
      { date: '2026-09-16', count: 2 },
      { date: '2026-09-17', count: 0 },
      { date: '2026-09-18', count: 1 },
    ])
  })

  it('sin filas la serie es todo ceros (la UI decidirá si dibujar)', () => {
    expect(buildDailySeries([], 2, TODAY).every((day) => day.count === 0)).toBe(true)
  })

  it('la racha cuenta días consecutivos desde hoy y se corta al fallar', () => {
    expect(buildStreak([{ log_date: '2026-09-18' }, { log_date: '2026-09-17' }], TODAY)).toBe(2)
    expect(buildStreak([{ log_date: '2026-09-16' }], TODAY)).toBe(0)
  })

  it('la semana se mide de lunes al día de hoy, sin porcentajes inventados', () => {
    const week = buildWeekSummary(rows, TODAY)
    expect(week.start).toBe('2026-09-14')
    expect(week.elapsedDays).toBe(5)
    expect(week.sessions).toBe(3)
    expect(week.activeDays).toBe(2)
    expect(week).not.toHaveProperty('compliance')
  })

  it('los hitos salen de fechas reales; sin filas no hay hitos', () => {
    expect(buildMilestones([])).toEqual([])
    const hitos = buildMilestones(rows)
    expect(hitos.map((item) => item.id)).toEqual(['first', 'last', 'total'])
    expect(hitos[0].detail).toBe('2026-09-16')
    expect(hitos[2].detail).toBe('3')
  })

  it('todayIso usa fecha LOCAL, no UTC (evita perder la sesión de hoy)', () => {
    const local = new Date(2026, 8, 18, 0, 30)
    expect(todayIso(local)).toBe('2026-09-18')
  })
})

describe('progressStore · la rutina publicada se declara ejemplo', () => {
  it('es una lista corta y estable de bloques', () => {
    expect(ROUTINE_EXAMPLE.length).toBe(5)
    expect(ROUTINE_EXAMPLE.every((item) => typeof item === 'string')).toBe(true)
  })
})

describe('useAppData · identidad y saludo honestos', () => {
  it('usa el nombre real del proveedor si existe (Google)', () => {
    expect(identityNameOf({ user_metadata: { full_name: 'Sebastián Bayona' } })).toBe('Sebastián Bayona')
  })

  it('sin nombre cae al correo real', () => {
    expect(identityNameOf({ email: 'hola@bayona.test' })).toBe('hola@bayona.test')
  })

  it('sin nada, cadena vacía (nunca inventa un nombre)', () => {
    expect(identityNameOf(null)).toBe('')
    expect(identityNameOf({})).toBe('')
  })

  it('el saludo depende solo de la hora local', () => {
    expect(greetingFor(new Date(2026, 8, 18, 3))).toBe('BUENAS NOCHES')
    expect(greetingFor(new Date(2026, 8, 18, 9))).toBe('BUENOS DÍAS')
    expect(greetingFor(new Date(2026, 8, 18, 16))).toBe('BUENAS TARDES')
    expect(greetingFor(new Date(2026, 8, 18, 22))).toBe('BUENAS NOCHES')
  })
})

describe('progressStore · sin nube no hay red ni error', () => {
  it('fetchRecentLogs e insertSessionLog no lanzan en modo local', async () => {
    const store = await import('./progressStore.js')
    vi.resetModules()
    await expect(store.fetchRecentLogs('u-1')).resolves.toEqual({ rows: [], enabled: false, error: null })
    await expect(store.insertSessionLog('u-1')).resolves.toEqual({ persisted: false })
  })
})