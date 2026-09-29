/**
 * BAYONA · RECORRIDO DEL VISITANTE
 * ---------------------------------------------------------------------------
 * `/onboarding` abre las puertas, pregunta el nombre, deja que la persona
 * elija su ritmo (cinco preguntas o nueve), y con eso `routeMap.js` resuelve un
 * plan, un recurso gratuito y una puerta a la comunidad. Este contexto es la
 * memoria de esa conversación: sin él, quien acaba de contar su objetivo vuelve
 * a ser un desconocido en la página siguiente.
 *
 * ============================================================================
 * QUÉ SE GUARDA Y DÓNDE (versión honesta, 2026-09)
 * ============================================================================
 * La recepción pide el nombre. Antes no lo pedía, y el bloque antiguo de este
 * fichero citaba cuatro frases de la interfaz que prometían "no pedimos nombre".
 * Esa copia ya no existe: el dueño pidió personalización por nombre, y la
 * promesa en pantalla se reescribió con ella.
 *
 * Lo que NO ha cambiado es el almacenamiento. Todo vive EN MEMORIA:
 *
 *   - Sobrevive a la navegación interna, que es exactamente el recorrido de
 *     una visita.
 *   - Desaparece al recargar, al cerrar la pestaña o al pulsar
 *     "BORRAR MI RECORRIDO", que está visible en la última etapa.
 *   - No toca localStorage, sessionStorage, cookies ni ningún servidor.
 *
 * Consecuencia técnica que hay que recordar: un nombre en memoria no es un
 * dato persistente, pero SÍ es un dato personal mientras dura la sesión. Si
 * algún día se quiere que el recorrido sobreviva a un refresco, primero hay que
 * cambiar la copia en pantalla y añadir una base legal y un aviso de
 * conservación. No al revés.
 */

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { DEFAULT_CURRENCY, formatMoney } from '../commerce/money.js'
import { regionById } from './questions.js'

const VisitorJourneyContext = createContext(null)

/** Estado inicial: nadie ha cruzado el umbral todavía. */
const EMPTY_JOURNEY = Object.freeze({
  name: '',
  depth: null,
  region: null,
  currency: DEFAULT_CURRENCY,
  answers: null,
  route: null,
  visitType: null,
})

export function VisitorJourneyProvider({ children }) {
  const [journey, setJourney] = useState(EMPTY_JOURNEY)

  /**
   * Registra el resultado de la recepción.
   * `visitType` distingue a quien respondió las preguntas ('personalized') de
   * quien eligió mirar sin responder ('visitor').
   * La moneda se deriva del país, nunca se pasa suelta: así no hay dos cifras
   * para la misma cosa.
   */
  const completeJourney = useCallback(({ name, depth, region, answers, route, visitType }) => {
    const regionId = region ?? null

    setJourney({
      name: name?.trim() || '',
      depth: depth ?? null,
      region: regionId,
      currency: regionById(regionId)?.currency ?? DEFAULT_CURRENCY,
      answers: answers ?? null,
      route: route ?? null,
      visitType: visitType ?? 'personalized',
    })
  }, [])

  /** Vuelve al punto de partida. La persona siempre puede rehacer su ruta. */
  const resetJourney = useCallback(() => setJourney(EMPTY_JOURNEY), [])

  const value = useMemo(
    () => ({
      ...journey,
      /** true solo si hay una ruta personalizada utilizable. */
      hasRoute: Boolean(journey.route?.plan),
      /** true si respondió las preguntas de la recepción. */
      isPersonalized: journey.visitType === 'personalized' && Boolean(journey.route),
      /** Formatea euros a la moneda de la persona. */
      format: (valueEur) => formatMoney(valueEur, journey.currency),
      completeJourney,
      resetJourney,
    }),
    [journey, completeJourney, resetJourney],
  )

  return <VisitorJourneyContext.Provider value={value}>{children}</VisitorJourneyContext.Provider>
}

/**
 * Lee el recorrido del visitante.
 *
 * Devuelve un objeto seguro incluso sin proveedor, para que cualquier
 * componente o test pueda renderizarse aislado sin envolverlo.
 */
export function useVisitorJourney() {
  const context = useContext(VisitorJourneyContext)

  if (!context) {
    return {
      ...EMPTY_JOURNEY,
      hasRoute: false,
      isPersonalized: false,
      format: (valueEur) => formatMoney(valueEur, DEFAULT_CURRENCY),
      completeJourney: () => {},
      resetJourney: () => {},
    }
  }

  return context
}

/**
 * Identificador del plan recomendado ('RAIZ', 'FUERZA'…), o null.
 * `routeMap.js` usa ids en minúscula y sin tilde; la oferta los usa en
 * mayúscula, así que la traducción se hace aquí una sola vez.
 */
export function useRecommendedPlanId() {
  const { route } = useVisitorJourney()
  if (!route?.id) return null
  if (route.kind === 'visitor') return null
  return String(route.id).toUpperCase()
}
