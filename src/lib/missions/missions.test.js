import { describe, expect, it } from 'vitest'
import {
  MISIONES,
  evaluarMisiones,
  misionesCerradas,
  progresoMisiones,
} from './missions.js'

const VACIO = { routes: [], sections: [], answers: {} }

// §27-28: la gamificación tiene que ser un sistema central, no un adorno. Para
// que lo sea, cada misión tiene que cerrarse con algo que el visitante hace de
// verdad, y ninguna puede cerrarse sola al cargar la página.

describe('misiones del recorrido', () => {
  it('ninguna misión se cumple con el recorrido vacío', () => {
    expect(misionesCerradas(VACIO)).toEqual([])
    expect(progresoMisiones(VACIO)).toEqual({ hechas: 0, total: MISIONES.length, valorEur: 0 })
  })

  it('cada misión se cierra con su propia señal', () => {
    const casos = {
      bienvenida: { answers: { objetivo: 'fuerza' } },
      'cuatro-casas': { routes: ['/', '/shop', '/community', '/faq'] },
      metodo: { sections: ['/::mechanism-section home-scene'] },
      ecosistema: {
        sections: ['/community::a', '/community::b', '/community::c'],
      },
      experiencia: { routes: ['/checkout'] },
    }

    for (const [id, estado] of Object.entries(casos)) {
      const lista = evaluarMisiones({ ...VACIO, ...estado })
      const mision = lista.find((m) => m.id === id)
      expect(mision, `la misión ${id} existe`).toBeTruthy()
      expect(mision.hecha, `${id} se cumple con su señal`).toBe(true)
      // Y no se cumple con la señal de otra.
      const ajenas = lista.filter((m) => m.id !== id && m.id !== 'cuatro-casas')
      expect(ajenas.every((m) => !m.hecha) || ajenas.length === 0).toBe(true)
    }
  })

  it('una ruta de plan cuenta como experiencia configurada, igual que el checkout', () => {
    expect(
      evaluarMisiones({ ...VACIO, routes: ['/plan/fuerza'] }).find((m) => m.id === 'experiencia').hecha,
    ).toBe(true)
    expect(
      evaluarMisiones({ ...VACIO, routes: ['/plan'] }).find((m) => m.id === 'experiencia').hecha,
    ).toBe(false)
  })

  it('el progreso nunca supera el total ni suma valor inventado', () => {
    const todo = {
      routes: ['/', '/shop', '/community', '/faq', '/checkout'],
      sections: [
        '/::mechanism-section',
        '/community::why',
        '/community::week',
        '/community::live',
      ],
      answers: { objetivo: 'fuerza' },
    }
    const p = progresoMisiones(todo)
    expect(p.hechas).toBe(p.total)
    expect(p.valorEur).toBe(MISIONES.reduce((t, m) => t + m.eur, 0))

    const parcial = progresoMisiones({ ...VACIO, routes: ['/', '/shop'] })
    expect(parcial.hechas).toBe(0)
    expect(parcial.valorEur).toBe(0)
  })

  it('el catálogo está bien formado y no se paga igual que un casino', () => {
    expect(new Set(MISIONES.map((m) => m.id)).size).toBe(MISIONES.length)
    for (const m of MISIONES) {
      expect(m.label.length).toBeGreaterThan(4)
      expect(m.detalle.length).toBeGreaterThan(10)
      // §12: la recompensa tiene que ser real pero contenida.
      expect(m.eur).toBeGreaterThan(0)
      expect(m.eur).toBeLessThanOrEqual(10)
    }
  })
})
