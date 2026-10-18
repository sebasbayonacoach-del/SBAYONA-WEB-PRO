import { createContext, useContext, useMemo, useState } from 'react'

/**
 * BAYONA public-visit guide.
 * Only the visitor's EXPLICIT, non-medical preference is held in React memory.
 * No storage, URL tracking, cookies, analytics, network, or data persistence.
 * Medical answers inside AdaptiveDiscovery remain strictly inside that feature.
 */
export const JOURNEY_GOALS = Object.freeze([
  { id: 'fuerza', label: 'Ganar fuerza', preferred: 'personal', detail: 'Construir una base a tu ritmo.' },
  { id: 'movilidad', label: 'Moverme mejor', preferred: 'recovery', detail: 'Cuidar movilidad y autonomía.' },
  { id: 'volver', label: 'Volver a entrenar', preferred: 'online', detail: 'Recuperar constancia sin prisas.' },
  { id: 'energia', label: 'Tener más energía', preferred: 'online', detail: 'Crear hábitos sostenibles.' },
  { id: 'parkour', label: 'Aprender parkour', preferred: 'parkour', detail: 'Explorar fuerza y técnica.' },
])

const serviceLabels = Object.freeze({
  personal: 'Entrenamiento personal',
  online: 'Entrenamiento online',
  parkour: 'Parkour y rendimiento',
  recovery: 'Movilidad y entrenamiento adaptado',
})
export const SERVICE_LABELS = serviceLabels

const noop = () => {}
const defaultContext = Object.freeze({
  goal: null, service: null, open: false,
  setGoal: noop, setService: noop, setOpen: noop, reset: noop,
})

const JourneyContext = createContext(defaultContext)

export function JourneyProvider({ children }) {
  const [goal, setGoal] = useState(null)
  const [service, setService] = useState(null)
  const [open, setOpen] = useState(false)
  const value = useMemo(() => ({
    goal, service, open,
    setGoal: id => setGoal(JOURNEY_GOALS.some(item => item.id === id) ? id : null),
    setService: id => setService(Object.hasOwn(serviceLabels, id) ? id : null),
    setOpen,
    reset: () => { setGoal(null); setService(null); setOpen(false) },
  }), [goal, service, open])
  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>
}

export function useJourney() {
  return useContext(JourneyContext)
}

export function journeyGoalById(id) {
  return JOURNEY_GOALS.find(item => item.id === id) || null
}

/** Curated navigation prompts, not medical recommendations or AI diagnosis. */
export function journeyForRoute(pathname, goal) {
  const title = journeyGoalById(goal)?.label || 'Empezar con claridad'
  const paths = {
    '/': ['Estás descubriendo BAYONA.', 'Mira las cuatro formas de entrenar y elige la que te interese.', '/#servicios', 'VER OPCIONES'],
    '/programs': ['Ahora puedes comparar servicios.', 'Revisa qué incluye cada modalidad y confirma disponibilidad antes de decidir.', '/programs#servicios', 'EXPLORAR SESIONES'],
    '/movimiento-adaptado': ['Aquí la prioridad es tu contexto.', 'Si tienes una condición de salud, consulta con los profesionales sanitarios que correspondan antes de elegir un ejercicio.', '/#tu-ruta', 'EXPLORAR MI PUNTO DE PARTIDA'],
    '/parkour-academy': ['Estás conociendo Parkour Academy.', 'Explora los niveles y empieza por fundamentos, independientemente de tu experiencia.', '/#tu-ruta', 'DESCUBRIR MI PUNTO DE PARTIDA'],
    '/resources': ['Puedes comenzar sin contratar.', 'En la biblioteca tienes guías y recursos para conocer nuestro enfoque.', '/#regalos', 'VER RECURSOS GRATIS'],
    '/community': ['También puedes aprender acompañado.', 'Conoce la comunidad y sus espacios antes de participar.', '/resources', 'EXPLORAR RECURSOS'],
    '/app': ['Aquí conocerás BAYONA App.', 'Revisa cómo funciona el seguimiento y qué funcionalidades están disponibles.', '/#tu-ruta', 'VER MI PUNTO DE PARTIDA'],
    '/about': ['Conoce quién está detrás de BAYONA.', 'Antes de elegir puedes conocer la historia, el método y sus límites.', '/programs', 'VER SERVICIOS'],
    '/shop': ['En Tienda puedes explorar sin presión.', 'Si buscas acompañamiento personalizado, vuelve a los servicios antes de comprar.', '/programs', 'VER SERVICIOS'],
    '/faq': ['¿Te falta resolver algo?', 'Consulta las preguntas frecuentes o revisa los servicios con calma.', '/programs', 'VOLVER A SERVICIOS'],
  }
  const current = paths[pathname] || ['Tu recorrido continúa.', 'Puedes comparar servicios o revisar los recursos disponibles.', '/programs', 'VER SERVICIOS']
  if (goal === 'movilidad' && pathname !== '/movimiento-adaptado') {
    return { goalTitle: title, eyebrow: 'EN TU CAMINO: MOVILIDAD', title: current[0],
      copy: 'Como elegiste moverte mejor, puedes explorar las opciones de movilidad. Si hay dolor o una condición diagnosticada, busca primero orientación sanitaria.',
      nextUrl: '/movimiento-adaptado', nextLabel: 'EXPLORAR MOVIMIENTO ADAPTADO' }
  }
  if (goal === 'parkour' && pathname !== '/parkour-academy') {
    return { goalTitle: title, eyebrow: 'EN TU CAMINO: PARKOUR', title: current[0],
      copy: 'Como elegiste parkour, quizá te interese conocer los fundamentos y niveles de nuestra academia.',
      nextUrl: '/parkour-academy', nextLabel: 'CONOCER PARKOUR ACADEMY' }
  }
  return {goalTitle:title, eyebrow: 'TU RECORRIDO BAYONA', title: current[0], copy: current[1], nextUrl: current[2], nextLabel: current[3]}
}
