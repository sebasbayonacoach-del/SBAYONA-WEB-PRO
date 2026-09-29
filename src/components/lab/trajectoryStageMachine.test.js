/**
 * Lote 2 · máquina de carga del modo espacial — lógica pura.
 *
 * Lo que protege no es "funciona el reducer": es que NINGÚN camino alternativo
 * pueda montar la escena sin que el usuario lo haya pedido, y que una resolución
 * tardía (el usuario canceló, cambió de página, reintentó) no cuele un lienzo no
 * solicitado. Eso es lo que hace falta que sea verdad, no el conteo de estados.
 */

import { describe, expect, it } from 'vitest'
import {
  STAGE_ACTIONS,
  STAGE_STATUS,
  canCancel,
  canRequest,
  initialStageState,
  stageReducer,
  stageStatusLabel,
} from './trajectoryStageMachine.js'

const STUB = { name: 'StubStage' }

function request(state = initialStageState()) {
  return stageReducer(state, { type: STAGE_ACTIONS.REQUEST })
}

describe('trajectoryStageMachine · camino feliz', () => {
  it('empieza en DOM sencillo, sin módulo y sin peticiones', () => {
    const state = initialStageState()
    expect(state.status).toBe(STAGE_STATUS.SIMPLE)
    expect(state.Stage).toBeNull()
    expect(state.token).toBe(0)
    expect(state.attempts).toBe(0)
    expect(canRequest(state)).toBe(true)
    expect(canCancel(state)).toBe(false)
  })

  it('la petición sube el token y limpia el error anterior', () => {
    const errored = { ...initialStageState(), status: STAGE_STATUS.ERROR, error: 'nada', token: 4, attempts: 2 }
    const next = stageReducer(errored, { type: STAGE_ACTIONS.REQUEST })
    expect(next.status).toBe(STAGE_STATUS.LOADING)
    expect(next.token).toBe(5)
    expect(next.error).toBeNull()
    expect(next.attempts).toBe(3)
  })

  it('solo en loading se acepta la resolución, y el componente llega intacto', () => {
    const loading = request()
    const resolved = stageReducer(loading, { type: STAGE_ACTIONS.RESOLVED, token: loading.token, Stage: STUB })
    expect(resolved.status).toBe(STAGE_STATUS.SPATIAL)
    expect(resolved.Stage).toBe(STUB)
    expect(canCancel(resolved)).toBe(false)
    expect(canRequest(resolved)).toBe(false)
  })

  it('la vuelta a la vista sencilla desmonta el lienzo y vuelve a zero', () => {
    const spatial = stageReducer(request(), { type: STAGE_ACTIONS.RESOLVED, token: 1, Stage: STUB })
    const back = stageReducer(spatial, { type: STAGE_ACTIONS.RETURN })
    expect(back.status).toBe(STAGE_STATUS.SIMPLE)
    expect(back.Stage).toBeNull()
    expect(back.attempts).toBe(spatial.attempts) // el histórico del intento no se borra
    expect(canRequest(back)).toBe(true)
  })
})

describe('trajectoryStageMachine · resoluciones tardías (el riesgo real)', () => {
  it('una resolución con token obsoleto NO monta la escena', () => {
    const loading = request()
    const cancelled = stageReducer(loading, { type: STAGE_ACTIONS.CANCEL })
    const late = stageReducer(cancelled, { type: STAGE_ACTIONS.RESOLVED, token: loading.token, Stage: STUB })
    expect(late.status).toBe(STAGE_STATUS.SIMPLE)
    expect(late.Stage).toBeNull()
  })

  it('cancelar durante la carga invalida la petición en curso', () => {
    const loading = request()
    expect(canCancel(loading)).toBe(true)
    const cancelled = stageReducer(loading, { type: STAGE_ACTIONS.CANCEL })
    expect(cancelled.status).toBe(STAGE_STATUS.SIMPLE)
    expect(cancelled.token).not.toBe(loading.token)
  })

  it('una resolución fuera de loading se ignora aunque el token coincida', () => {
    const simple = initialStageState()
    const attempt = stageReducer(simple, { type: STAGE_ACTIONS.RESOLVED, token: 0, Stage: STUB })
    expect(attempt).toBe(simple)
  })

  it('un fracaso tardío tampoco escribe un error que ya no existe', () => {
    const loading = request()
    const spatial = stageReducer(loading, { type: STAGE_ACTIONS.RESOLVED, token: loading.token, Stage: STUB })
    const late = stageReducer(spatial, { type: STAGE_ACTIONS.FAILED, token: loading.token, error: 'tarde' })
    expect(late.status).toBe(STAGE_STATUS.SPATIAL)
    expect(late.error).toBeNull()
  })
})

describe('trajectoryStageMachine · errores y reintento', () => {
  it('el fallo deja el DOM sencillo como camino usable', () => {
    const loading = request()
    const failed = stageReducer(loading, { type: STAGE_ACTIONS.FAILED, token: 1, error: 'sin WebGL' })
    expect(failed.status).toBe(STAGE_STATUS.ERROR)
    expect(failed.error).toBe('sin WebGL')
    expect(failed.Stage).toBeNull()
    expect(canRequest(failed)).toBe(true) // reintento posible
  })

  it('un fallo sin mensaje no deja la UI en blanco', () => {
    const failed = stageReducer(request(), { type: STAGE_ACTIONS.FAILED, token: 1 })
    expect(failed.error).toMatch(/No se pudo cargar/)
  })

  it('la verificación post-montaje convierte un lienzo sin contexto en error', () => {
    const spatial = stageReducer(request(), { type: STAGE_ACTIONS.RESOLVED, token: 1, Stage: STUB })
    const broken = stageReducer(spatial, { type: STAGE_ACTIONS.VERIFY_FAILED, error: 'sin contexto' })
    expect(broken.status).toBe(STAGE_STATUS.ERROR)
    expect(broken.Stage).toBeNull() // <- el render loop se retira del árbol
    expect(broken.error).toBe('sin contexto')
  })

  it('verify-failed fuera de spatial no puede romper nada', () => {
    const simple = initialStageState()
    expect(stageReducer(simple, { type: STAGE_ACTIONS.VERIFY_FAILED, error: 'ruido' })).toBe(simple)
  })

  it('el reintento lanza una petición nueva, no reutiliza la vieja', () => {
    const failed = stageReducer(request(), { type: STAGE_ACTIONS.FAILED, token: 1, error: 'x' })
    const retried = stageReducer(failed, { type: STAGE_ACTIONS.RETRY })
    expect(retried.status).toBe(STAGE_STATUS.LOADING)
    expect(retried.token).toBe(failed.token + 1)
    expect(stageReducer(initialStageState(), { type: STAGE_ACTIONS.RETRY }).status).toBe(STAGE_STATUS.SIMPLE)
  })
})

describe('trajectoryStageMachine · robustez', () => {
  it('acciones desconocidas, estados corruptos y tokens basura no mutan nada', () => {
    const state = initialStageState()
    expect(stageReducer(state, { type: 'teletransportar' })).toBe(state)
    expect(stageReducer(state, undefined)).toBe(state)
    expect(stageReducer(state, { type: STAGE_ACTIONS.RESOLVED, token: 'no es número', Stage: STUB })).toBe(state)
    expect(stageReducer(null, { type: STAGE_ACTIONS.REQUEST })).toBeNull()
    expect(stageReducer(undefined, { type: STAGE_ACTIONS.CANCEL })).toBeUndefined()
  })

  it('las etiquetas de estado cubren los cuatro estados y no prometen lo que no hay', () => {
    expect(stageStatusLabel(STAGE_STATUS.SIMPLE)).toMatch(/sencilla/i)
    expect(stageStatusLabel(STAGE_STATUS.LOADING)).toMatch(/Cargando/)
    expect(stageStatusLabel(STAGE_STATUS.SPATIAL)).toMatch(/activa/i)
    expect(stageStatusLabel(STAGE_STATUS.ERROR)).toMatch(/no disponible/i)
    expect(stageStatusLabel('nadie-sabe')).toMatch(/sencilla/i)
  })
})
