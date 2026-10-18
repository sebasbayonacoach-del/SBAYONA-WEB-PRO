export const JOURNEY_GOALS = Object.freeze([
  { id: 'fuerza', label: 'Ganar fuerza', short: 'Más fuerza', serviceId: 'personal', service: 'Entrenamiento personal', description: 'Fuerza, técnica y una progresión diseñada alrededor de tu punto de partida.', next: 'Explora la guía personal' },
  { id: 'movilidad', label: 'Moverme mejor', short: 'Moverte mejor', serviceId: 'recovery', service: 'Movilidad y recuperación', description: 'Acompañamiento de movilidad y ejercicio general respetando tus límites.', next: 'Explora el movimiento adaptado' },
  { id: 'volver', label: 'Retomar el hábito', short: 'Volver a moverte', serviceId: 'online', service: 'Entrenamiento online', description: 'Una ruta gradual que puedes incorporar a tu semana.', next: 'Explora el entrenamiento online' },
  { id: 'parkour', label: 'Aprender parkour', short: 'Aprender parkour', serviceId: 'parkour', service: 'Parkour y rendimiento', description: 'Fundamentos, control y técnica para empezar progresivamente.', next: 'Explora parkour' },
  { id: 'energia', label: 'Tener más energía', short: 'Más energía', serviceId: 'online', service: 'Entrenamiento online', description: 'Movimiento y hábitos dentro de un plan realista.', next: 'Explora el entrenamiento online' },
])
export function getJourneyGoal(id) { return JOURNEY_GOALS.find(goal => goal.id === id) || null }
export const JOURNEY_CHAPTERS = Object.freeze([
  { id: 'inicio', label: 'TU PUNTO DE PARTIDA', detail: 'Te conocemos', number: '01' },
  { id: 'tu-ruta', label: 'CÓMO TE ESCUCHO', detail: 'Lo que te importa', number: '02' },
  { id: 'servicios', label: 'TU FORMA DE ENTRENAR', detail: 'Soluciones para ti', number: '03' },
  { id: 'planes', label: 'TU ACOMPAÑAMIENTO', detail: 'Compara el valor', number: '04' },
  { id: 'movimiento-adaptado', label: 'MOVIMIENTO CON CRITERIO', detail: 'Respetar tus límites', number: '05' },
  { id: 'como-empezar', label: 'CÓMO EMPEZAMOS', detail: 'Tres pasos sencillos', number: '06' },
  { id: 'bayona-app-real-home', label: 'TU APP BAYONA', detail: 'El proceso continúa', number: '07' },
  { id: 'regalos', label: 'EMPIEZA SIN COSTE', detail: 'Algo útil desde hoy', number: '08' },
  { id: 'empieza', label: 'HABLEMOS', detail: 'Tu siguiente paso', number: '09' },
])
