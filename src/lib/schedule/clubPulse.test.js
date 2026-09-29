import { describe, expect, it } from 'vitest'
import { buildWeekPulse, dayName, pulsePanelId } from './clubPulse.js'

// Mismos datos que pinta /community: siete casillas y tres paneles con agenda.
const weekDays = [
  { label: 'LUN', active: true, pulse: 'Dirección' },
  { label: 'MAR', active: false, pulse: 'El grupo sigue' },
  { label: 'MIÉ', active: true, pulse: 'Criterio' },
  { label: 'JUE', active: false, pulse: 'El grupo sigue' },
  { label: 'VIE', active: true, pulse: 'Acción' },
  { label: 'SÁB', active: false, pulse: 'Se entrena' },
  { label: 'DOM', active: false, pulse: 'Se descansa' },
]

const weekSchedule = [
  { day: 'LUNES', pulse: 'Dirección' },
  { day: 'MIÉRCOLES', pulse: 'Criterio' },
  { day: 'VIERNES', pulse: 'Acción' },
]

describe('pulso semanal de la comunidad', () => {
  it('un día con agenda se navega; un día sin agenda no ofrece destino', () => {
    const pulse = buildWeekPulse(weekDays, weekSchedule)
    const lunes = pulse.find((day) => day.label === 'LUN')
    const martes = pulse.find((day) => day.label === 'MAR')

    // Con agenda: pieza navegable, con su destino.
    expect(lunes.hasAgenda).toBe(true)
    expect(lunes.destination).toBe('#pulso-lunes')
    expect(lunes.panelId).toBe('pulso-lunes')

    // Sin agenda: casilla de solo lectura, sin destino que romper.
    expect(martes.hasAgenda).toBe(false)
    expect(martes.destination).toBeNull()
    expect(martes.panelId).toBeNull()
  })

  it('un día marcado como activo sin panel no inventa destino', () => {
    // El caso que el nombre del test anterior prometía y no comprobaba: `active`
    // es una pinta, `agenda` es el dato. Si algún día se marca activo sin tener
    // panel, no puede salir un botón que lleve a la nada.
    const [martes] = buildWeekPulse([{ label: 'MAR', active: true, pulse: 'El grupo sigue' }], weekSchedule)

    expect(martes.active).toBe(true)
    expect(martes.hasAgenda).toBe(false)
    expect(martes.destination).toBeNull()
  })

  it('cada destino apunta a un panel que existe en la agenda', () => {
    const pulse = buildWeekPulse(weekDays, weekSchedule)
    const panelIds = new Set(weekSchedule.map((entry) => pulsePanelId(entry.day)))
    const destinations = pulse.filter((day) => day.destination).map((day) => day.destination.slice(1))

    expect(destinations).toEqual(['pulso-lunes', 'pulso-miercoles', 'pulso-viernes'])
    for (const destination of destinations) {
      expect(panelIds.has(destination)).toBe(true)
    }
  })

  it('resuelve la tilde y la abreviatura sin dejar huérfanos', () => {
    expect(dayName('MIÉ')).toBe('MIÉRCOLES')
    expect(pulsePanelId('MIÉRCOLES')).toBe('pulso-miercoles')
    expect(buildWeekPulse(weekDays, [{ day: 'MIÉRCOLES' }])[2].destination).toBe('#pulso-miercoles')
  })
})
