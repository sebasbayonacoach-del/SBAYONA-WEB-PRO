// El número vive en site.config.js (fuente única de verdad). Aquí se
// re-exporta para no romper los imports existentes.
import { WHATSAPP_NUMBER, whatsAppLink } from './site.config.js'

export { WHATSAPP_NUMBER }

const COP_PER_EUR_REFERENCE = 4300
const COP_PER_USD_REFERENCE = 4000

export function formatCop(valueCop) {
  return `$${Math.round(Number(valueCop)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

function formatEurApprox(valueCop) {
  return `≈ €${Math.round(Number(valueCop) / COP_PER_EUR_REFERENCE)}`
}

export function formatUsdApprox(valueCop) {
  return `≈ $${Math.round(Number(valueCop) / COP_PER_USD_REFERENCE)} USD`
}

export function buildWhatsAppUrl(message) {
  return whatsAppLink(message)
}

function buildPlanWhatsAppUrl(plan) {
  return buildWhatsAppUrl([
    `Hola BAYONA, quiero empezar mi transformación con ${plan.name}.`,
    `Inversión publicada: ${plan.priceDisplay} ${plan.currency} · ${plan.eur} · ${plan.usdDisplay}.`,
    'Quiero conocer el siguiente paso.',
  ].join('\n'))
}

function createMembershipPlan(plan) {
  const normalizedPlan = {
    ...plan,
    priceDisplay: formatCop(plan.priceCop),
    price: formatCop(plan.priceCop),
    currency: 'COP/mes',
    unit: 'COP/mes',
    description: plan.shortDescription,
    eur: plan.eurDisplay ?? formatEurApprox(plan.priceCop),
    usdDisplay: plan.usdDisplay ?? `≈ $${plan.usd} USD`,
  }

  return {
    ...normalizedPlan,
    cta: buildPlanWhatsAppUrl(normalizedPlan),
  }
}

export const membershipPlans = [
  createMembershipPlan({
    id: 'RAIZ',
    name: 'RAÍZ',
    journey: 'RECONSTRUCCIÓN',
    priceCop: 149000,
    eurDisplay: '≈ €35',
    usd: 38,
    tag: 'DEJA DE EMPEZAR DE CERO',
    presentationUrl: '/docs/plan-raiz.pdf',
    shortDescription: 'El plan para volver a entrenar con orden, comida simple y una estructura que puedas sostener.',
    audience: 'Para quien lleva tiempo queriendo volver y necesita una base clara, humana y realista.',
    problem: 'Cambias la improvisación por una ruta mensual: qué hacer, cuándo hacerlo y cómo saber si vas bien.',
    feeling: 'Terminas la semana con la sensación de haber cumplido algo concreto, no de haber sobrevivido a otra rutina imposible.',
    closing: 'La base seria para recuperar constancia sin destruir tu agenda.',
    included: [
      'Plan de entrenamiento mensual personalizado',
      '1 sesión virtual 1:1 al mes con tu entrenador',
      'Plan de alimentación simple que puedes seguir (con lista de mercado)',
      'Seguimiento quincenal con ajustes',
      'Cada ejercicio explicado en video',
      'Soporte por WhatsApp cuando lo necesites',
      'Comunidad BAYONA',
    ],
    excluded: [
      'Videollamada de revisión con Sebastián',
      'Evaluación biomecánica inicial',
      'Protocolos de biohacking',
      'Sesiones presenciales',
    ],
  }),
  createMembershipPlan({
    id: 'FUERZA',
    name: 'FUERZA',
    journey: 'PROGRESO REAL',
    priceCop: 299000,
    eurDisplay: '≈ €70',
    usd: 76,
    tag: 'CORRIGE ANTES. AVANZA MEJOR.',
    featured: true,
    presentationUrl: '/docs/plan-fuerza.pdf',
    shortDescription: 'El plan para entrenar acompañado, corregir técnica y sostener una semana con más responsabilidad.',
    audience: 'Para quien quiere dejar de adivinar y necesita que alguien revise ejecución, carga y constancia.',
    problem: 'Pasas de entrenar a ciegas a tener sesiones en vivo, revisión semanal y una siguiente decisión clara.',
    feeling: 'Sientes que ya no estás improvisando: cada corrección te acerca a entrenar mejor.',
    socialProof: 'La mejor puerta de entrada si quieres acompañamiento real sin saltar todavía al nivel más alto.',
    includedLead: 'Todo RAÍZ más:',
    included: [
      '2 sesiones virtuales 1:1 al mes con tu entrenador',
      'Plan de alimentación personalizado según tu objetivo',
      'Seguimiento semanal con ajustes',
      '1 videollamada mensual con Sebastián (30 min)',
      'Respuestas prioritarias por WhatsApp',
    ],
    /**
     * «Qué no incluye» dicho en los cuatro planes (dirección §12). No se
     * inventa nada: cada línea es una prestación que la propia tabla
     * comparada (`membershipComparisonRows`) o el listado de prestaciones
     * ya asigna a un nivel superior.
     */
    excluded: [
      'Evaluación biomecánica inicial',
      'Protocolos de biohacking',
      'Sesiones presenciales',
      'Chat privado directo con Sebastián',
    ],
  }),
  createMembershipPlan({
    id: 'RENDIMIENTO',
    name: 'RENDIMIENTO',
    journey: 'TRANSFORMACIÓN TOTAL',
    priceCop: 499000,
    eurDisplay: '≈ €116',
    usd: 125,
    tag: 'SISTEMA COMPLETO',
    presentationUrl: '/docs/plan-rendimiento.pdf',
    shortDescription: 'Para convertir tu esfuerzo en un proceso completo: entrenamiento, nutrición, recuperación y revisión.',
    audience: 'Para quien quiere tomarse esto en serio y necesita más frecuencia, más lectura y más precisión.',
    problem: 'Dejas de entrenar por sensación y empiezas a operar con una estrategia revisable cada semana.',
    feeling: 'Te sientes dentro de un sistema completo, no dentro de otra rutina descargada que nadie mira.',
    includedLead: 'Todo FUERZA más:',
    included: [
      '4 sesiones virtuales 1:1 al mes con tu entrenador',
      'Evaluación biomecánica inicial completa',
      'Protocolos de biohacking personalizados',
      'Plan de alimentación avanzado con ajustes semanales',
      'WhatsApp prioritario 24/7',
      'Acceso anticipado a la app BAYONA+',
    ],
    excluded: [
      'Sesiones presenciales',
      'Chat privado directo con Sebastián',
      'Eventos privados VIP',
      'Acceso de por vida al contenido',
    ],
  }),
  createMembershipPlan({
    id: 'ELITE',
    name: 'ELITE',
    journey: 'DOMINIO TOTAL',
    priceCop: 899000,
    eurDisplay: '≈ €209',
    usd: 226,
    tag: 'PRIVADO · DIRECTO · MÁXIMO 10 CUPOS',
    badge: 'ACOMPAÑAMIENTO PRIVADO · MÁXIMO 10 CUPOS',
    presentationUrl: '/docs/plan-elite.pdf',
    shortDescription: 'La experiencia más cercana: decisiones rápidas, contacto directo y un proceso diseñado alrededor de tu vida.',
    audience: 'Para quien quiere prioridad, máxima cercanía y una experiencia privada sin ruido ni plantillas.',
    problem: 'Dejas de delegar tu proceso a fórmulas genéricas. Cada detalle importante se decide contigo.',
    feeling: 'Sientes que tu entrenamiento tiene dirección ejecutiva: claro, cercano y exigente.',
    /**
     * `scarcity` es el tope publicado del plan: un dato real y estable.
     *
     * Aquí había además `urgency: 'Quedan 3 cupos de 10'`, un contador
     * hardcodeado que nadie actualiza. Afirmar una disponibilidad concreta que
     * no se comprueba es una promesa que la web no puede sostener y, en España,
     * entra en el terreno de la publicidad engañosa. Si algún día hay un
     * recuento real, debe venir de una fuente viva, no de una constante.
     */
    scarcity: 'SOLO 10 CUPOS DISPONIBLES',
    includedLead: 'Todo RENDIMIENTO más:',
    included: [
      '8 sesiones privadas al mes (virtuales, o presenciales en Bogotá)',
      'WhatsApp DIRECTO con Sebastián (chat privado)',
      'Plan 100% personalizado con biohacking avanzado',
      'Eventos privados VIP',
      'Acceso de por vida al contenido',
      'SOLO 10 CUPOS DISPONIBLES',
    ],
    excluded: [
      'Sesiones presenciales fuera de Bogotá (en España: online y grupo)',
      'BAYONA+ instalada: el acceso anticipado se activa cuando exista una versión utilizable',
    ],
  }),
]

function findMembershipPlan(planId) {
  const normalizedId = String(planId ?? '').toUpperCase()
  return membershipPlans.find((plan) => plan.id === normalizedId || plan.name === planId)
}

/**
 * `practices` (2026-09-22, dirección §11): cada etapa tiene que estar
 * representada con algo concreto, no con un icono y una frase de tono. Son
 * contenidos de entrenamiento descriptivos — no prestaciones vendidas ni
 * resultados prometidos — y se leen como chips bajo la foto de la etapa.
 * Es un campo añadido: `icon`, `detail` y `copy` siguen existiendo igual.
 */
export const programAudiences = [
  {
    id: 'ninos',
    icon: 'baby',
    title: 'NIÑOS',
    detail: '5 — 11',
    copy: 'Juego, coordinación y confianza para que moverse se vuelva una habilidad, no una obligación.',
    practices: [
      'Juego con desplazamientos y saltos',
      'Equilibrio y coordinación',
      'Aprender a caer y a recibir',
      'Reglas del espacio compartido',
    ],
  },
  {
    id: 'jovenes',
    icon: 'sparkles',
    title: 'JÓVENES',
    detail: '12 — 17',
    copy: 'Energía, identidad y desafío con técnica, límites y hábitos que construyen autoestima.',
    practices: [
      'Técnica con peso corporal',
      'Fuerza sin competir con el cuerpo del otro',
      'Comida real, sin extremos',
      'Ritmo que convive con los exámenes',
    ],
  },
  {
    id: 'adultos',
    icon: 'dumbbell',
    title: 'ADULTOS',
    detail: '18 — 59',
    copy: 'Fuerza, energía, nutrición y hábitos que caben en trabajo, familia y semanas reales.',
    practices: [
      'Bloques de 45 a 60 minutos',
      'Fuerza y energía para el día',
      'Comida que se sostiene con tu agenda',
      'Ajuste según cómo vino la semana',
    ],
  },
  {
    id: 'deportistas',
    icon: 'trophy',
    title: 'DEPORTISTAS',
    detail: 'OBJETIVO / RENDIMIENTO',
    copy: 'Rendimiento, técnica y lectura fina para que el esfuerzo se convierta en ventaja.',
    practices: [
      'Planificación por bloques',
      'Fuerza máxima y potencia',
      'Pruebas para leer el progreso',
      'Técnica específica de tu deporte',
    ],
  },
  {
    id: 'senior',
    icon: 'accessibility',
    title: 'SENIOR',
    detail: '60+',
    copy: 'Movilidad, autonomía y fuerza para seguir eligiendo movimiento con seguridad.',
    practices: [
      'Movilidad de articulaciones cada semana',
      'Fuerza para agacharse, cargar y subir',
      'Equilibrio y confianza al moverse',
      'Más descanso entre series, misma intención',
    ],
  },
]

export const membershipComparisonRows = [
  {
    feature: 'Sesiones con entrenador',
    values: ['1 virtual/mes', '2 virtuales/mes', '4 virtuales/mes', '8 privadas/mes'],
  },
  {
    feature: 'Plan de alimentación',
    values: ['Simple', 'Personalizado', 'Avanzado', 'Elite semanal'],
  },
  {
    feature: 'Alguien revisa tu progreso',
    values: ['Quincenal', 'Semanal', 'Semanal', 'Directo'],
  },
  {
    /**
     * RENDIMIENTO declaraba «Todo FUERZA más:» en su ficha y a la vez la tabla
     * le ponía un «—» en la videollamada mensual que FUERZA sí incluye
     * (`included` de FUERZA: '1 videollamada mensual con Sebastián (30 min)'),
     * y el `excluded` de RENDIMIENTO no la lista entre lo que queda fuera. Dos
     * afirmaciones publicadas contradiciéndose en la misma página: de las que
     * generan una discusión con el cliente, no una venta.
     *
     * Se alinean las tres fuentes a la que ya decían la ficha y el `excluded`
     * (la videollamada se hereda). Si en el negocio real RENDIMIENTO NO da esa
     * videollamada, lo que hay que corregir es `includedLead` de RENDIMIENTO,
     * no esta fila: dilo y se cambia al revés.
     */
    feature: 'Videollamada con Sebastián',
    values: ['—', '1/mes', '1/mes', 'Semanal'],
  },
  {
    feature: 'WhatsApp',
    values: ['Soporte', 'Prioritario', '24/7', 'Directo privado'],
  },
  {
    feature: 'Evaluación biomecánica',
    values: ['—', '—', 'Incluida', 'Incluida'],
  },
  {
    feature: 'Biohacking',
    values: ['—', '—', 'Incluido', 'Avanzado'],
  },
  {
    feature: 'Cupos',
    values: ['Sin límite', 'Sin límite', 'Sin límite', 'Máximo 10'],
  },
]

export const COMMERCIAL_SCOPE_NOTICE = 'BAYONA ofrece acompañamiento de entrenamiento dentro de un marco no médico. No diagnostica, trata ni sustituye atención sanitaria. Servicios presenciales sujetos a ubicación y disponibilidad.'

function buildServiceWhatsAppUrl(service) {
  return buildWhatsAppUrl([
    `Hola BAYONA, quiero añadir ${service.label} a mi transformación.`,
    `Precio publicado: ${formatCop(service.priceCop)} COP.`,
    '¿Cuál es el siguiente paso?',
  ].join('\n'))
}

function createService(service) {
  const normalizedService = {
    ...service,
    priceDisplay: formatCop(service.priceCop),
  }

  return {
    ...normalizedService,
    cta: buildServiceWhatsAppUrl(normalizedService),
  }
}

export const serviceCategoryDefinitions = Object.freeze([
  Object.freeze({ id: 'CLASES', title: 'CLASES', promise: 'Corrige en vivo' }),
  Object.freeze({ id: 'RECUPERACIÓN', title: 'RECUPERACIÓN', promise: 'Sostén el proceso' }),
  Object.freeze({ id: 'RENDIMIENTO', title: 'RENDIMIENTO', promise: 'Sube el nivel' }),
])

export const sessionServices = [
  createService({
    id: 'virtual-1to1',
    label: 'Clase virtual 1:1 extra',
    category: 'CLASES',
    description: 'Una sesión privada para corregir técnica, resolver dudas y salir con una acción clara.',
    priceCop: 35000,
    quantities: [0, 1, 2, 4, 8, 12],
  }),
  createService({
    id: 'presencial-bogota-1to1',
    label: 'Clase presencial en Bogotá',
    category: 'CLASES',
    description: 'Entrenamiento cuerpo a cuerpo con atención completa, corrección inmediata y presencia real. Solo en Bogotá: en España el trabajo es online o en grupo.',
    priceCop: 60000,
    quantities: [0, 1, 2, 4, 8],
    presencial: true,
  }),
  createService({
    id: 'grupal-virtual',
    label: 'Clase grupal virtual',
    category: 'CLASES',
    description: 'Energía de grupo, guía en vivo y la sensación de avanzar con gente al lado.',
    priceCop: 25000,
    quantities: [0, 1, 2, 4, 8, 12],
  }),
]

export const extraServices = [
  createService({
    id: 'masaje-deportivo',
    label: 'Masaje deportivo',
    category: 'RECUPERACIÓN',
    description: 'Tu cuerpo trabaja duro. Dale una recuperación a la altura del proceso que quieres sostener.',
    priceCop: 80000,
    presencial: true,
    healthScope: true,
  }),
  createService({
    id: 'protocolo-recuperacion',
    label: 'Protocolo de recuperación',
    category: 'RECUPERACIÓN',
    description: 'Una ruta clara para recuperar mejor, llegar más preparado y no vivir siempre al límite.',
    priceCop: 30000,
    healthScope: true,
  }),
  createService({
    id: 'movilidad-asistida',
    label: 'Movilidad asistida',
    category: 'RECUPERACIÓN',
    description: 'Recupera libertad de movimiento con guía personalizada, calma y control.',
    priceCop: 40000,
    presencial: true,
  }),
  createService({
    id: 'pilates-1to1',
    label: 'Pilates 1:1',
    category: 'RECUPERACIÓN',
    description: 'Control corporal que se nota en cómo entrenas, caminas, respiras y sostienes postura.',
    priceCop: 40000,
  }),
  createService({
    id: 'yoga-terapeutico',
    label: 'Yoga terapéutico',
    category: 'RECUPERACIÓN',
    description: 'Muévete mejor, respira mejor y vuelve a relacionarte con tu cuerpo sin castigo.',
    priceCop: 40000,
    healthScope: true,
  }),
  createService({
    id: 'parkour-tecnico',
    label: 'Parkour técnico',
    category: 'RENDIMIENTO',
    description: 'Aprende a leer obstáculos, moverte con técnica y ganar confianza real.',
    priceCop: 50000,
    presencial: true,
  }),
  createService({
    id: 'boxeo-funcional',
    label: 'Boxeo funcional',
    category: 'RENDIMIENTO',
    description: 'Potencia, coordinación y confianza con una sesión intensa, guiada y segura.',
    priceCop: 50000,
  }),
  createService({
    id: 'calistenia-avanzada',
    label: 'Calistenia avanzada',
    category: 'RENDIMIENTO',
    description: 'Domina tu propio peso y construye una fuerza que se ve, se siente y se controla.',
    priceCop: 50000,
  }),
  createService({
    id: 'preparacion-fisica',
    label: 'Preparación física',
    category: 'RENDIMIENTO',
    description: 'Más fuerte, más rápido y más resistente con una preparación orientada a tu disciplina.',
    priceCop: 50000,
  }),
  createService({
    id: 'biohacking',
    label: 'Biohacking',
    category: 'RENDIMIENTO',
    description: 'Explora variables de rendimiento con criterio, sin convertir la ciencia en humo.',
    priceCop: 50000,
    healthScope: true,
  }),
  createService({
    id: 'evaluacion-biomecanica',
    label: 'Evaluación biomecánica',
    category: 'RENDIMIENTO',
    description: 'Observamos cómo se mueve tu cuerpo para decidir mejor la siguiente fase del plan.',
    priceCop: 100000,
    healthScope: true,
  }),
  createService({
    id: 'composicion-corporal',
    label: 'Análisis corporal',
    category: 'RENDIMIENTO',
    description: 'Una referencia clara para entender tu punto de partida y revisar evolución.',
    priceCop: 70000,
    healthScope: true,
  }),
  createService({
    id: 'alimentacion-avanzada',
    label: 'Plan alimentación avanzado',
    category: 'RENDIMIENTO',
    description: 'Una estrategia de alimentación que puedas seguir, revisar y ajustar sin extremos.',
    priceCop: 80000,
    healthScope: true,
  }),
]

export const editorialServices = [...sessionServices, ...extraServices]

function validateSelection(selection) {
  const {
    planId,
    serviceQuantities = {},
    extraIds = [],
  } = selection ?? {}
  const plan = findMembershipPlan(planId)

  if (!plan) throw new Error(`Plan desconocido: ${String(planId)}`)
  if (!serviceQuantities || typeof serviceQuantities !== 'object' || Array.isArray(serviceQuantities)) {
    throw new TypeError('Las cantidades de servicios deben proporcionarse como un objeto.')
  }
  if (!Array.isArray(extraIds)) {
    throw new TypeError('Los servicios extra deben proporcionarse como una lista de identificadores.')
  }

  const sessionById = new Map(sessionServices.map((service) => [service.id, service]))
  const extraById = new Map(extraServices.map((service) => [service.id, service]))

  for (const serviceId of Object.keys(serviceQuantities)) {
    if (!sessionById.has(serviceId)) {
      throw new Error(`Servicio por cantidad desconocido: ${serviceId}`)
    }
  }

  const quantitiesById = new Map()
  for (const service of sessionServices) {
    const rawQuantity = serviceQuantities[service.id] ?? 0
    let quantity

    try {
      quantity = Number(rawQuantity)
    } catch {
      throw new RangeError(`Cantidad no permitida para ${service.id}: ${String(rawQuantity)}`)
    }

    if (!service.quantities.includes(quantity)) {
      throw new RangeError(`Cantidad no permitida para ${service.id}: ${String(rawQuantity)}`)
    }
    quantitiesById.set(service.id, quantity)
  }

  for (const extraId of extraIds) {
    if (!extraById.has(extraId)) throw new Error(`Servicio extra desconocido: ${String(extraId)}`)
  }

  return {
    plan,
    quantitiesById,
    selectedExtraIds: new Set(extraIds),
  }
}

export function calculateExperience(selection) {
  const { plan, quantitiesById, selectedExtraIds } = validateSelection(selection)
  const sessions = sessionServices.map((service) => {
    const quantity = quantitiesById.get(service.id)
    return {
      ...service,
      quantity,
      subtotalCop: service.priceCop * quantity,
    }
  })
  const extras = extraServices
    .filter((service) => selectedExtraIds.has(service.id))
    .map((service) => ({ ...service, subtotalCop: service.priceCop }))
  const totalCop = sessions.reduce((total, service) => total + service.subtotalCop, plan.priceCop)
    + extras.reduce((total, service) => total + service.subtotalCop, 0)

  return {
    plan,
    sessions,
    extras,
    totalCop,
    totalDisplay: formatCop(totalCop),
    eurApprox: formatEurApprox(totalCop),
    usdApprox: totalCop === plan.priceCop ? plan.usdDisplay : formatUsdApprox(totalCop),
  }
}

export function buildExperienceWhatsAppUrl(selection) {
  const calculation = calculateExperience(selection)
  const sessionLines = calculation.sessions
    .filter((service) => service.quantity > 0)
    .map((service) => `- ${service.label}: ${service.quantity} × ${formatCop(service.priceCop)}`)
  const extraLines = calculation.extras
    .map((service) => `- ${service.label}: ${formatCop(service.priceCop)}`)
  const selectedLines = [...sessionLines, ...extraLines]
  const contact = selection?.contact ?? {}
  const contactFields = [
    ['Nombre', contact.nombre ?? contact.name],
    ['Email', contact.email],
    ['WhatsApp', contact.whatsapp],
  ]
    .map(([label, value]) => [label, String(value ?? '').replace(/\s+/g, ' ').trim()])
    .filter(([, value]) => value)
  const contactLines = contactFields.length
    ? ['Datos para la solicitud:', ...contactFields.map(([label, value]) => `- ${label}: ${value}`)]
    : []
  const message = [
    'Hola BAYONA, quiero construir mi transformación.',
    ...contactLines,
    `Plan base: ${calculation.plan.name} — ${calculation.plan.priceDisplay} ${calculation.plan.currency}`,
    'Lo que quiero añadir:',
    ...(selectedLines.length ? selectedLines : ['- Sin extras por ahora']),
    `Mi camino: ${calculation.totalDisplay} COP (${calculation.eurApprox} · ${calculation.usdApprox}).`,
    'Siguiente paso: confirmar disponibilidad, ubicación cuando aplique y precio vigente.',
    'Esta solicitud no constituye pago, pedido, inscripción, disponibilidad ni acceso confirmados.',
    'Quiero revisar mi camino y dar el siguiente paso.',
  ].join('\n')

  return buildWhatsAppUrl(message)
}
