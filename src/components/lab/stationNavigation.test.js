/**
 * CONTRATO DEL LABORATORIO ESPACIAL — navegación pura + integridad de datos.
 * -------------------------------------------------------------------------
 * Lote 1 (FASE A). Qué comprueba, dicho sin rodeos:
 *  1. Que la navegación de estaciones no puede salirse del recorrido (sin
 *     envolverse), que ignora entradas basura y que el progreso es acotado.
 *  2. Que las tres estaciones salen DEL CATÁLOGO REAL del método
 *     (`conversionContent.js` → `home-mechanism`), no de una copia pegada que
 *     pueda oxidarse: si la fuente cambia, el laboratorio cambia con ella.
 *  3. Que ningún enlace del laboratorio apunta a una ruta inexistente o
 *     excluida de la indexación: es el contrato que exige la aceptación del
 *     lote («los enlaces apuntan a rutas existentes»).
 * No simula cobertura de cámara ni de red: eso no existe todavía (Lote 2).
 */

import { describe, expect, it } from 'vitest'
import { ROUTE_META } from '../../lib/seo/routeMeta.js'
import { homeContentModel } from '../../config/conversionContent.js'
import { STATIONS, STATION_BY_ID, STATION_COUNT, TRAJECTORY } from './trajectoryStations.js'
import {
  clampIndex,
  goTo,
  initialNavigation,
  isComplete,
  progressOf,
  reset,
  step,
} from './stationNavigation.js'

const methodBlock = homeContentModel.blocks.find(({ id }) => id === 'home-mechanism')

describe('trajectoryStations — procedencia real del contenido', () => {
  it('declara exactamente las tres estaciones del método publicado', () => {
    expect(STATION_COUNT).toBe(3)
    expect(STATIONS.map((s) => s.title)).toEqual(methodBlock.items.map((i) => i.title))
    expect(STATIONS.map((s) => s.body)).toEqual(methodBlock.items.map((i) => i.body))
  })

  it('hereda el marco editorial del bloque (heading, intro y descargo)', () => {
    expect(TRAJECTORY.heading).toBe(methodBlock.heading)
    expect(TRAJECTORY.intro).toBe(methodBlock.body)
    expect(TRAJECTORY.boundary).toBe(methodBlock.boundary)
  })

  it('no exagera en ninguna dirección: declara qué hay y qué no hay', () => {
    // El Lote 1 no podía decir que había escena. El Lote 2 no puede decir que
    // hay un pabellón. La aserción es la misma con otro contenido: el texto tiene
    // que describir el estado REAL, ni más ni menos.
    expect(TRAJECTORY.status).toMatch(/maqueta/i)
    expect(TRAJECTORY.status).toMatch(/bajo demanda/i)
    expect(TRAJECTORY.disclaimer).toMatch(/espacio conceptual/i)
    expect(TRAJECTORY.disclaimer).toMatch(/no una instalación real|no es una instalación real/i)
    expect(TRAJECTORY.disclaimer).toMatch(/greybox|materiales definitivos/i)
    expect(TRAJECTORY.disclaimer).toMatch(/activarla|solo dentro de este laboratorio/i)
    // Y no se autorga lo que el plan reserva: acabado ni obra construida.
    expect(TRAJECTORY.disclaimer).not.toMatch(/acabado final|instalación real de BAYONA|obra construida/i)
  })

  it('mantiene ids únicos y acceso por id coherente', () => {
    const ids = STATIONS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
    ids.forEach((id, index) => expect(STATION_BY_ID[id].index).toBe(index))
  })

  it('mantiene los hotspots dentro del lienzo (porcentajes 0..100)', () => {
    STATIONS.forEach((station) => {
      expect(station.hotspot.x).toBeGreaterThan(0)
      expect(station.hotspot.x).toBeLessThan(100)
      expect(station.hotspot.y).toBeGreaterThan(0)
      expect(station.hotspot.y).toBeLessThan(100)
    })
  })

  it('apunta cada estación a una ruta real del registro de rutas', () => {
    STATIONS.forEach((station) => {
      const meta = ROUTE_META[station.to]
      expect(meta, `ruta inexistente: ${station.to}`).toBeTruthy()
      expect(
        meta.noindex,
        `el laboratorio no debe enlazar a una ruta no indexable: ${station.to}`,
      ).toBeFalsy()
    })
  })
})

describe('stationNavigation — recorrido acotado y sin sorpresas', () => {
  const nav0 = initialNavigation(3)

  it('empieza en la primera estación, sin progreso y sin completar', () => {
    expect(nav0).toMatchObject({ index: 0, count: 3, moved: false })
    expect(nav0.visited).toEqual([0])
    expect(progressOf(nav0)).toBe(0)
    expect(isComplete(nav0)).toBe(false)
  })

  it('avanza hasta el final y NO se envuelve al pedir más', () => {
    const last = step(step(nav0), 1)
    expect(last.index).toBe(2)
    expect(step(last, 1).index).toBe(2)
    expect(progressOf(last)).toBe(1)
    expect(isComplete(last)).toBe(true)
  })

  it('retrocede hasta el principio y se queda ahí', () => {
    const back = step(step(step(nav0, -1), -1), -1)
    expect(back.index).toBe(0)
  })

  it('salta por índice y recorta los desbordes sin lanzar', () => {
    expect(goTo(nav0, 2).index).toBe(2)
    expect(goTo(nav0, 99).index).toBe(2)
    expect(goTo(nav0, -7).index).toBe(0)
  })

  it('ignora entradas que no son un número', () => {
    expect(goTo(nav0, Number.NaN).index).toBe(0)
    expect(goTo(nav0, undefined).index).toBe(0)
    expect(goTo(nav0, 'dos').index).toBe(0)
    expect(clampIndex(Number.NaN, 3)).toBe(0)
    expect(clampIndex(2.9, 3)).toBe(2)
  })

  it('registra cada estación visitada una sola vez', () => {
    const walked = goTo(goTo(goTo(nav0, 2), 1), 2)
    expect(walked.visited).toEqual([0, 2, 1])
  })

  it('volver al principio deja el recorrido sin empezar', () => {
    const after = reset(goTo(nav0, 2))
    expect(after).toMatchObject({ index: 0, moved: false })
    expect(after.visited).toEqual([0])
    expect(progressOf(after)).toBe(0)
  })

  it('un recorrido de una sola estación ya está completo (degenerado, no NaN)', () => {
    const one = initialNavigation(1)
    expect(progressOf(one)).toBe(1)
    expect(isComplete(one)).toBe(true)
    expect(step(one, 1).index).toBe(0)
  })

  it('una cuenta rara no rompe nada (count <= 0 o no entero)', () => {
    expect(clampIndex(5, 0)).toBe(0)
    expect(clampIndex(5, undefined)).toBe(0)
    expect(initialNavigation(-2).count).toBe(-2)
    expect(progressOf({ index: 0, count: 0 })).toBe(1)
  })
})
