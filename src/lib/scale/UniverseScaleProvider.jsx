import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'
import { useLocation } from 'react-router-dom'
import { useVisitorJourney } from '../onboarding/VisitorJourneyProvider.jsx'
import { useRewards } from '../rewards/RewardsProvider.jsx'
import { evaluarMisiones, progresoMisiones } from '../missions/missions.js'
import { EMPTY_SCALE, progressInStage, reduceScale, stageOf } from './universeScale.js'

const UniverseScaleContext = createContext(null)

/**
 * Registra la exploración real del visitante y la traduce a una fase del
 * universo. Vive en el shell, fuera de <Routes>, para que la escala sobreviva a
 * la navegación igual que el crédito de bienvenida.
 */
export function UniverseScaleProvider({ children }) {
  const [state, dispatch] = useReducer(reduceScale, EMPTY_SCALE)
  const location = useLocation()

  useEffect(() => {
    dispatch({ type: 'visit-route', value: location.pathname })
  }, [location.pathname])

  /*
    Cada respuesta dada en la recepción también agranda el universo. Es lo que
    convierte el perfilado en parte del recorrido: quien contesta sube de fase
    más rápido que quien solo mira. Se usa `pregunta:respuesta` como clave para
    que cambiar una respuesta cuente como algo nuevo y no se infle repitiendo la
    misma. El provider de la recepción cae a un `answers: null` si no hay
    contexto, así que esto es seguro en rutas fuera del itinerario.
  */
  const { answers } = useVisitorJourney()
  useEffect(() => {
    if (!answers || typeof answers !== 'object') return
    for (const [pregunta, respuesta] of Object.entries(answers)) {
      if (respuesta === null || respuesta === undefined || respuesta === '') continue
      dispatch({ type: 'answer-coach', value: `${pregunta}:${respuesta}` })
    }
  }, [answers])

  const seeSection = useCallback((id) => {
    if (id) dispatch({ type: 'see-section', value: id })
  }, [])

  const answerCoach = useCallback((id) => {
    if (id) dispatch({ type: 'answer-coach', value: id })
  }, [])

  /*
    Misiones del recorrido (§27-28).

    ANTES este efecto llamaba a `award()` con cada misión cerrada, y las misiones
    se evalúan contra rutas visitadas y secciones vistas: el crédito de la visita
    subía solo por navegar. Es justo lo que el brief veta dos veces — §6 «el
    usuario debe descubrir y HACER CLIC para reclamar regalos, no se regalan por
    scroll pasivo» y el comentario 23 «no debe sumarse automáticamente» — y lo
    que el dueño pidió en el comentario 13: regalos escondidos que se descubren
    y se reclaman.

    AHORA el proveedor de recompensas separa los dos gestos (`discover` registra
    el hallazgo, `claimSeal` mueve el dinero) y es `ArrivalBonusCard` quien
    registra las misiones cerradas como hallazgos, con su botón RECLAMAR. Aquí
    solo se publica el estado de cada misión, que es lo que la interfaz necesita.
    Se comprueba en `src/lib/rewards/RewardsProvider.test` y en el contrato de
    `ArrivalBonusCard`.
  */
  const misiones = useMemo(
    () => evaluarMisiones({ routes: state.routes, sections: state.sections, answers }),
    [state.routes, state.sections, answers],
  )

  const progreso = useMemo(() => progresoMisiones({ routes: state.routes, sections: state.sections, answers }), [state.routes, state.sections, answers])

  const value = useMemo(() => {
    const stage = stageOf(state)
    const progresoFase = progressInStage(state)
    return {
      stage,
      score: state.routes.length * 3 + state.sections.length + state.answers.length * 2,
      visited: state.routes,
      misiones,
      progreso,
      progress: {
        stageId: stage.id,
        label: stage.label,
        hint: stage.hint,
        enFase: progresoFase.enFase,
        falta: progresoFase.falta,
        ultima: progresoFase.ultima,
      },
      seeSection,
      answerCoach,
    }
  }, [state, seeSection, answerCoach, misiones, progreso])

  return <UniverseScaleContext.Provider value={value}>{children}</UniverseScaleContext.Provider>
}

export function useUniverseScale() {
  const ctx = useContext(UniverseScaleContext)
  if (!ctx) throw new Error('useUniverseScale necesita <UniverseScaleProvider>')
  return ctx
}
