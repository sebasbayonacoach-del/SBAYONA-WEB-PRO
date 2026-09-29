import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import ProtocoloCheckIn from './ProtocoloCheckIn.jsx'
import { CLAVE_ALMACEN, DIAS, HABITOS, alternar, escribirRegistro, registroVacio } from '../../lib/checkin/checkin.js'

const resumen = () => document.querySelector('.protocolo-resumen').textContent

describe('ProtocoloCheckIn', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('empieza sin marcas y lo dice en vez de fingir progreso', () => {
    render(<ProtocoloCheckIn />)
    expect(screen.getByRole('button', { name: 'MOVERME · LUNES' }).getAttribute('aria-pressed')).toBe('false')
    expect(resumen()).toMatch(/Aún no hay nada marcado/)
  })

  it('marcar una casilla cambia su estado y el resumen', () => {
    render(<ProtocoloCheckIn />)
    const celda = screen.getByRole('button', { name: 'MOVERME · LUNES' })

    fireEvent.click(celda)

    expect(celda.getAttribute('aria-pressed')).toBe('true')
    expect(resumen()).toMatch(/1 marca · 1 día seguido/)
  })

  it('tres días seguidos cambian el mensaje, no solo el número', () => {
    render(<ProtocoloCheckIn />)
    ;['LUNES', 'MARTES', 'MIÉRCOLES'].forEach((dia) => {
      fireEvent.click(screen.getByRole('button', { name: `DORMIR · ${dia}` }))
    })

    expect(resumen()).toMatch(/3 marcas · 3 días seguidos/)
    expect(resumen()).toMatch(/ya es un hábito/)
  })

  it('guarda en el aparato y vuelve con las marcas puestas', () => {
    const previo = alternar(alternar(registroVacio(), 'comida', 4), 'mover', 5)
    window.localStorage.setItem(CLAVE_ALMACEN, escribirRegistro(previo))

    render(<ProtocoloCheckIn />)

    expect(screen.getByRole('button', { name: 'COMER BIEN · VIERNES' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: 'MOVERME · SÁBADO' }).getAttribute('aria-pressed')).toBe('true')
    expect(resumen()).toMatch(/2 marcas/)
  })

  it('escribe en el almacenamiento lo que se marca', () => {
    render(<ProtocoloCheckIn />)
    fireEvent.click(screen.getByRole('button', { name: 'DORMIR · DOMINGO' }))

    const guardado = JSON.parse(window.localStorage.getItem(CLAVE_ALMACEN))
    expect(guardado.version).toBe(1)
    expect(guardado.registro.dormir[DIAS.length - 1]).toBe(true)
  })

  it('un almacenamiento corrupto no rompe la sección', () => {
    window.localStorage.setItem(CLAVE_ALMACEN, '{esto no es json')
    render(<ProtocoloCheckIn />)

    expect(screen.getByRole('button', { name: 'MOVERME · LUNES' })).toBeTruthy()
    expect(resumen()).toMatch(/Aún no hay nada marcado/)
  })

  it('cada hábito y cada día se nombran, y ningún botón es decorativo', () => {
    render(<ProtocoloCheckIn />)
    const celdas = screen.getAllByRole('button')

    expect(celdas).toHaveLength(HABITOS.length * DIAS.length)
    celdas.forEach((celda) => {
      expect(celda.getAttribute('type')).toBe('button')
      expect(celda.getAttribute('aria-label')).toMatch(/ · /)
    })
  })

  it('dice dónde se guarda, porque si no lo dice alguien lo supone', () => {
    render(<ProtocoloCheckIn />)
    expect(document.querySelector('.protocolo-nota').textContent).toMatch(/este aparato y no en ningún servidor/)
  })
})
