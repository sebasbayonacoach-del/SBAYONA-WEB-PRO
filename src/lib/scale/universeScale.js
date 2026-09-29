/**
 * Escala del universo BAYONA (brief: «debe sentirse progresivamente más grande
 * cuanto más explora el usuario»).
 *
 * No es un contador de páginas vistas. Modela una idea concreta: BAYONA es un
 * sitio que se ABRE. Cada ruta nueva recorrida, cada sección realmente vista y
 * cada respuesta dada al acompañante suman, y a partir de cierta suma el
 * visitante pasa de fase. La fase se proyecta sobre la interfaz como
 * `data-universe-stage`, de modo que el usuario percibe más espacio, más capas y
 * un mapa del recorrido que crece — sin popups y sin cambiar la tipografía de
 * las páginas ya aprobadas.
 *
 * Todo vive EN MEMORIA, igual que el crédito de bienvenida: nada se escribe en
 * localStorage, sessionStorage, cookies ni ningún servidor.
 */

export const STAGES = Object.freeze([
  { id: 1, key: 'umbral', label: 'El umbral', hint: 'Acabas de entrar.' },
  { id: 2, key: 'casa', label: 'La casa', hint: 'Ya sabes qué hay aquí.' },
  { id: 3, key: 'instalaciones', label: 'El recorrido', hint: 'Estás viendo el sitio entero.' },
  { id: 4, key: 'metodo', label: 'El método', hint: 'Sabes cómo se entrena aquí.' },
  { id: 5, key: 'ecosistema', label: 'El ecosistema', hint: 'BAYONA es más grande de lo que parecía.' },
])

/** Puntos. Deliberadamente bajos: el visitante tiene que notar que crece. */
export const WEIGHTS = Object.freeze({
  route: 3,
  section: 1,
  answer: 2,
})

/** Secciones que hay que descubrir para pasar de fase. */
export const STAGE_THRESHOLDS = Object.freeze([0, 6, 12, 20, 30])

export const EMPTY_SCALE = Object.freeze({
  routes: [],
  sections: [],
  answers: [],
})

/** @returns {number} suma de méritos del estado */
export function scoreOf(state) {
  return (
    state.routes.length * WEIGHTS.route +
    state.sections.length * WEIGHTS.section +
    state.answers.length * WEIGHTS.answer
  )
}

/** @returns {(typeof STAGES)[number]} fase correspondiente a un estado */
export function stageOf(state) {
  const score = scoreOf(state)
  let index = 0
  for (let i = 0; i < STAGE_THRESHOLDS.length; i += 1) {
    if (score >= STAGE_THRESHOLDS[i]) index = i
  }
  return STAGES[index]
}

/**
 * Reductor puro: solo recuerda valores NUEVOS, así que volver a pasar por una
 * ruta o re-ver una sección no infla la escala. Eso es lo que impide que el
 * sistema se convierta en un contador de scroll sin sentido.
 */
export function reduceScale(state, action) {
  switch (action.type) {
    case 'visit-route':
      return state.routes.includes(action.value)
        ? state
        : { ...state, routes: [...state.routes, action.value] }
    case 'see-section':
      return state.sections.includes(action.value)
        ? state
        : { ...state, sections: [...state.sections, action.value] }
    case 'answer-coach':
      return state.answers.includes(action.value)
        ? state
        : { ...state, answers: [...state.answers, action.value] }
    default:
      return state
  }
}

/** Mérito que falta para la siguiente fase, o 0 si ya se llegó a la última. */
export function remainingForNextStage(state) {
  const stage = stageOf(state)
  const siguiente = STAGES.find(({ id }) => id === stage.id + 1)
  if (!siguiente) return 0
  return Math.max(0, STAGE_THRESHOLDS[siguiente.id - 1] - scoreOf(state))
}

/**
 * Progreso DENTRO de la fase actual.
 *
 * Se muestra en vez del resto hasta la siguiente capa porque el resto salta: al
 * cruzar una frontera pasa de «quedan 1» a «quedan 6» y el visitante lee que el
 * objetivo se ha alejado. Contar hacia arriba dentro de la capa no puede mentir.
 *
 * @returns {{enFase: number, falta: number, ultima: boolean}}
 */
export function progressInStage(state) {
  const stage = stageOf(state)
  const suelo = STAGE_THRESHOLDS[stage.id - 1]
  const siguiente = STAGES.find(({ id }) => id === stage.id + 1)

  if (!siguiente) return { enFase: scoreOf(state) - suelo, falta: 0, ultima: true }

  const techo = STAGE_THRESHOLDS[siguiente.id - 1]
  const enFase = scoreOf(state) - suelo
  return { enFase, falta: Math.max(0, techo - scoreOf(state)), ultima: false }
}
