import { membershipPlans } from '../config/offerings.js'
import { JOURNEY_GOALS } from './journeyGoals.js'

export const COACH_VISIT_STEPS = Object.freeze([
  {
    id: 'objetivo', path: '/', anchor: 'inicio',
    label: '01 / TU MOTIVACIÓN',
    title: '¿Qué te gustaría conseguir?',
    description: 'Primero quiero entender lo que buscas. No necesitas saber qué plan elegir.',
    options: JOURNEY_GOALS.map(item => ({ value: item.id, label: item.label })),
  },
  {
    id: 'experiencia', path: '/about', anchor: 'la-persona',
    label: '02 / TU PUNTO DE PARTIDA',
    title: '¿De dónde partimos?',
    description: 'No se trata de compararte con nadie. Solo de ajustar las expectativas.',
    options: [
      { value: 'inicio', label: 'Voy a empezar' },
      { value: 'retomo', label: 'Quiero retomar' },
      { value: 'activo', label: 'Ya entreno' },
    ],
  },
  {
    id: 'bloqueo', path: '/community', anchor: 'por-que',
    label: '03 / TU RETO',
    title: '¿Qué te está frenando?',
    description: 'Quiero saber qué necesitas resolver, no simplemente venderte una rutina.',
    options: [
      { value: 'constancia', label: 'Me cuesta ser constante' },
      { value: 'organizacion', label: 'No sé cómo organizarme' },
      { value: 'tecnica', label: 'Necesito guía técnica' },
      { value: 'tiempo', label: 'No encuentro tiempo' },
    ],
  },
  {
    id: 'tiempo', path: '/resources', anchor: 'reto',
    label: '04 / TU VIDA REAL',
    title: '¿Cuántos días te encajarían?',
    description: 'Un programa útil debe tener espacio en tu semana.',
    options: [
      { value: '1-2', label: '1–2 días por semana' },
      { value: '3-4', label: '3–4 días por semana' },
      { value: '5+', label: '5 o más días por semana' },
      { value: 'depende', label: 'Mi horario cambia' },
    ],
  },
  {
    id: 'formato', path: '/programs', anchor: 'elige-servicio',
    label: '05 / TU FORMA DE ENTRENAR',
    title: '¿Qué formato prefieres?',
    description: 'Los servicios presenciales requieren confirmar ubicación, disponibilidad y habilitación profesional.',
    options: [
      { value: 'online', label: 'Online, desde donde esté' },
      { value: 'consultar', label: 'Quiero preguntar por presencial' },
      { value: 'indefinido', label: 'Todavía no lo sé' },
    ],
  },
  {
    id: 'apoyo', path: '/programs', anchor: 'membresias',
    label: '06 / ACOMPAÑAMIENTO',
    title: '¿Cuánta ayuda quieres?',
    description: 'Este punto orientará tu plan. Ninguno se contratará automáticamente.',
    options: [
      { value: 'base', label: 'Una base y revisiones periódicas' },
      { value: 'semanal', label: 'Ajustes y apoyo cada semana' },
      { value: 'integral', label: 'Un proceso integral y más sesiones' },
      { value: 'privado', label: 'Máxima cercanía y prioridad' },
    ],
  },
  {
    id: 'criterio', path: '/movimiento-adaptado', anchor: 'contextos',
    label: '07 / MOVERTE CON CRITERIO',
    title: 'El entrenamiento tiene límites.',
    description: 'No te pediré diagnósticos ni antecedentes médicos aquí. Si tienes una condición de salud o restricciones, la aptitud para entrenar puede requerir valoración sanitaria.',
    options: [
      { value: 'informacion', label: 'Entiendo, quiero ver la propuesta' },
      { value: 'orientacion', label: 'Prefiero hablar antes de entrenar' },
    ],
  },
  {
    id: 'resultado', path: '/programs', anchor: 'membresias',
    label: '08 / TU PROPUESTA',
    title: 'Este podría ser tu comienzo.',
    description: 'Propuesta preliminar basada en preferencias, no en una evaluación física ni sanitaria.',
    options: [],
  },
])

/** Reglas simples, auditable y no clínicas; sin resultados de salud ni urgencia artificial. */
export function suggestCoachPlan(answers = {}) {
  const ids = { base: 'RAIZ', semanal: 'FUERZA', integral: 'RENDIMIENTO', privado: 'ELITE' }
  let id = ids[answers.apoyo] || 'RAIZ'
  // Cuando se necesita consulta antes de entrenar, no se bloquea ni se prescribe un plan.
  const requiresConversation = answers.criterio === 'orientacion' || answers.formato === 'consultar'
  const plan = membershipPlans.find(p => p.id === id) || membershipPlans[0]
  const obstacleReasons = {
    constancia: 'El enfoque debe ayudarte a sostener la constancia.',
    organizacion: 'Necesitas una estructura clara para organizar tus entrenamientos.',
    tecnica: 'La revisión de técnica será importante al definir las sesiones.',
    tiempo: 'La planificación debe caber en tu agenda real.',
  }
  const reasons = [
    obstacleReasons[answers.bloqueo] || '',
    answers.apoyo === 'privado' ? 'Buscas una relación de acompañamiento más cercana.' :
      answers.apoyo === 'integral' ? 'Quieres una estructura integral con mayor frecuencia de revisión.' :
      answers.apoyo === 'semanal' ? 'Has priorizado las revisiones y los ajustes semanales.' :
      'Has elegido una base organizada con seguimiento.',
    answers.tiempo === 'depende' ? 'Tu horario variable requiere una planificación flexible.' :
      answers.tiempo ? 'El plan debe ajustarse a los días que puedes dedicarle.' : '',
  ].filter(Boolean)
  const goalServices = {
    fuerza: 'Entrenamiento personal u online',
    movilidad: 'Movilidad y entrenamiento adaptado (no atención clínica)',
    volver: 'Entrenamiento online',
    parkour: 'Parkour y rendimiento',
    energia: 'Entrenamiento online',
  }
  return {
    plan, reasons, requiresConversation,
    goalService: goalServices[answers.objetivo] || 'Entrenamiento general',
    alternatives: membershipPlans.filter(p => p.id !== plan.id),
  }
}

export function coachAnswerLabel(stepId, value) {
  const step = COACH_VISIT_STEPS.find(s => s.id === stepId)
  return step?.options.find(option => option.value === value)?.label || ''
}
