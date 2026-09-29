/**
 * BAYONA · LABORATORIO ESPACIAL — MÁQUINA DE CARGA DEL MODO ESPACIAL (Lote 2)
 * -------------------------------------------------------------------------
 * Lógica PURA (sin React, sin Three): cuatro estados y sus transiciones. Vive
 * aquí para poder verificarse sin navegador y para que el componente sea solo
 * interfaz, no política de carga.
 *
 * Los estados (Lote 2 §14):
 *   simple   La experiencia DOM. No se ha pedido el motor. Estado inicial y final.
 *   loading  El usuario pidió la vista espacial; la descarga está en curso.
 *            La UI sigue disponible y se puede cancelar.
 *   spatial  La escena está montada y verificada (hay contexto WebGL vivo).
 *   error    WebGL no está disponible o el montaje falló. El DOM sigue intacto
 *            y hay reintento cuando procede.
 *
 * Reglas duras que implementa:
 *   · Un `import()` ya lanzado NO se puede anular a mitad: cancelar no finge
 *     detener la descarga, invalida la RESOLUCIÓN para que una respuesta tardía
 *     no monte una escena que ya no se pidió. (`token`)
 *   · Ninguna transición se aplica con un token distinto del vigente.
 *   · No hay timeouts: un "carga lenta" no es un error, y decirlo sería mentir.
 *   · `spatial` exige verificación: llegar al estado "montado" sin contexto WebGL
 *     se convierte en `error`, no en un lienzo vacío silencioso.
 */

export const STAGE_STATUS = Object.freeze({
  SIMPLE: 'simple',
  LOADING: 'loading',
  SPATIAL: 'spatial',
  ERROR: 'error',
})

export const STAGE_ACTIONS = Object.freeze({
  REQUEST: 'request',
  RESOLVED: 'resolved',
  FAILED: 'failed',
  CANCEL: 'cancel',
  VERIFY_FAILED: 'verify-failed',
  RETURN: 'return',
  RETRY: 'retry',
})

/** Estado inicial: solo DOM, cero motor, cero peticiones. */
export function initialStageState() {
  return {
    status: STAGE_STATUS.SIMPLE,
    /** Componente puente resuelto (solo existe en `spatial`). */
    Stage: null,
    error: null,
    /** Identificador de la petición en curso: corta resoluciones tardías. */
    token: 0,
    /** Contador de intentos: permite un diagnóstico honesto en la UI. */
    attempts: 0,
  }
}

/** ¿Se puede cancelar la carga? Solo mientras esté en curso. */
export function canCancel(state) {
  return state?.status === STAGE_STATUS.LOADING
}

/** ¿Se puede pedir la vista espacial? Desde `simple` o desde `error`. */
export function canRequest(state) {
  return state?.status === STAGE_STATUS.SIMPLE || state?.status === STAGE_STATUS.ERROR
}

/**
 * Reductor de la máquina. Nunca lanza: ante acción desconocida o estado corrupto
 * devuelve el estado anterior intacto (el laboratorio no puede quedar en un
 * estado imposible por un evento raro).
 *
 * @param {ReturnType<typeof initialStageState>} state
 * @param {{type:string, token?:number, Stage?:unknown, error?:string}} action
 */
export function stageReducer(state, action) {
  if (!state || !action || typeof action.type !== 'string') return state
  const fresh = { ...state, error: null }

  switch (action.type) {
    case STAGE_ACTIONS.REQUEST: {
      if (!canRequest(state)) return state
      return {
        ...state,
        status: STAGE_STATUS.LOADING,
        token: state.token + 1,
        attempts: state.attempts + 1,
        Stage: null,
        error: null,
      }
    }

    case STAGE_ACTIONS.RESOLVED: {
      // Fuera de `loading` o con token obsoleto: se IGNORE (Lote 2 §14).
      if (state.status !== STAGE_STATUS.LOADING) return state
      if (action.token !== state.token) return state
      if (!action.Stage) return state
      return { ...fresh, status: STAGE_STATUS.SPATIAL, Stage: action.Stage }
    }

    case STAGE_ACTIONS.FAILED: {
      if (state.status !== STAGE_STATUS.LOADING) return state
      if (action.token !== state.token) return state
      return {
        ...state,
        status: STAGE_STATUS.ERROR,
        Stage: null,
        error: typeof action.error === 'string' ? action.error : 'No se pudo cargar la vista espacial.',
      }
    }

    case STAGE_ACTIONS.CANCEL: {
      if (state.status === STAGE_STATUS.LOADING) {
        // Subir el token invalida la resolución que llegue después.
        return { ...initialStageState(), attempts: state.attempts }
      }
      if (state.status === STAGE_STATUS.SPATIAL) {
        return { ...initialStageState(), attempts: state.attempts }
      }
      return state
    }

    case STAGE_ACTIONS.VERIFY_FAILED: {
      // El módulo llegó pero el lienzo no tiene contexto: el estado espacial NO
      // es real. Se desmonta (Stage: null) para que el render loop pare.
      if (state.status !== STAGE_STATUS.SPATIAL) return state
      return {
        ...state,
        status: STAGE_STATUS.ERROR,
        Stage: null,
        error:
          typeof action.error === 'string' && action.error
            ? action.error
            : 'El motor se descargó, pero el lienzo no obtuvo un contexto WebGL utilizable.',
      }
    }

    case STAGE_ACTIONS.RETURN: {
      if (state.status === STAGE_STATUS.SIMPLE) return state
      return { ...initialStageState(), attempts: state.attempts }
    }

    case STAGE_ACTIONS.RETRY: {
      if (state.status !== STAGE_STATUS.ERROR) return state
      return {
        ...state,
        status: STAGE_STATUS.LOADING,
        token: state.token + 1,
        attempts: state.attempts + 1,
        Stage: null,
        error: null,
      }
    }

    default:
      return state
  }
}

/** Etiqueta legible del estado, única fuente para el `role="status"`. */
export function stageStatusLabel(status) {
  switch (status) {
    case STAGE_STATUS.LOADING:
      return 'Cargando la vista espacial…'
    case STAGE_STATUS.SPATIAL:
      return 'Vista espacial activa'
    case STAGE_STATUS.ERROR:
      return 'Vista espacial no disponible'
    default:
      return 'Vista sencilla: composición 2D y texto'
  }
}
