import { describe, expect, it } from 'vitest'
import {
  EMPTY_SCALE,
  STAGES,
  progressInStage,
  reduceScale,
  remainingForNextStage,
  scoreOf,
  stageOf,
} from './universeScale.js'

// La escala del universo es lo que hace que BAYONA se sienta más grande cuanto
// más se recorre. Si este contador se infla solo con repetir páginas, deja de
// significar nada: estos tests cierran esa puerta.

describe('escala del universo', () => {
  it('empieza en el umbral, sin mérito', () => {
    expect(scoreOf(EMPTY_SCALE)).toBe(0)
    expect(stageOf(EMPTY_SCALE)).toEqual(STAGES[0])
    expect(remainingForNextStage(EMPTY_SCALE)).toBe(6)
  })

  it('no cuenta dos veces la misma ruta, sección o respuesta', () => {
    let state = reduceScale(EMPTY_SCALE, { type: 'visit-route', value: '/shop' })
    const conUna = scoreOf(state)

    state = reduceScale(state, { type: 'visit-route', value: '/shop' })
    expect(scoreOf(state)).toBe(conUna)
    expect(state.routes).toEqual(['/shop'])

    state = reduceScale(state, { type: 'see-section', value: 'community-week' })
    state = reduceScale(state, { type: 'see-section', value: 'community-week' })
    expect(state.sections).toEqual(['community-week'])

    state = reduceScale(state, { type: 'answer-coach', value: 'objetivo' })
    state = reduceScale(state, { type: 'answer-coach', value: 'objetivo' })
    expect(state.answers).toEqual(['objetivo'])
  })

  it('sube de fase al explorar y no baja al recargar rutas', () => {
    let state = EMPTY_SCALE
    for (const ruta of ['/', '/shop', '/community', '/programs', '/resources']) {
      state = reduceScale(state, { type: 'visit-route', value: ruta })
    }
    expect(stageOf(state).id).toBeGreaterThan(1)

    const fase = stageOf(state)
    state = reduceScale(state, { type: 'visit-route', value: '/shop' })
    expect(stageOf(state)).toEqual(fase)
  })

  it('recorre las cinco fases y se detiene en la última', () => {
    let state = EMPTY_SCALE
    const fasesVistas = new Set([stageOf(state).id])

    for (let i = 0; i < 40; i += 1) {
      state = reduceScale(state, { type: 'see-section', value: `seccion-${i}` })
      fasesVistas.add(stageOf(state).id)
    }

    expect([...fasesVistas].sort()).toEqual([1, 2, 3, 4, 5])
    expect(stageOf(state).id).toBe(5)
    expect(remainingForNextStage(state)).toBe(0)
  })

  it('el progreso dentro de una capa solo crece hacia arriba', () => {
    // El resto hasta la siguiente capa SÍ salta al cruzar una frontera (ahí
    // empieza una capa nueva), así que la promesa que hay que vigilar es otra:
    // dentro de una misma fase lo acumulado sube y lo que falta baja.
    let state = EMPTY_SCALE
    let fase = stageOf(state).id
    let enFasePrevio = -1
    let faltaPrevio = null

    for (let i = 0; i < 40; i += 1) {
      state = reduceScale(state, { type: 'see-section', value: `s-${i}` })
      const { enFase, falta } = progressInStage(state)
      const actual = stageOf(state).id

      if (actual === fase) {
        expect(enFase).toBeGreaterThan(enFasePrevio)
        if (faltaPrevio !== null && falta > 0) expect(falta).toBeLessThan(faltaPrevio)
      } else {
        fase = actual
      }
      enFasePrevio = enFase
      faltaPrevio = falta
    }
    expect(progressInStage(state).ultima).toBe(true)
  })
})
