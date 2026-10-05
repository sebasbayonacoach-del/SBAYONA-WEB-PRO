import { membershipPlans } from './offerings.js'

/**
 * @typedef {'problem'|'vision'|'mechanism'|'proof'|'offer'|'action'} NarrativeStage
 */

/**
 * @typedef {'editorial'|'aspiration'|'commercial'|'evidence'|'concept'} ClaimType
 */

/**
 * @typedef {'verified'|'aspirational'|'concept'|'unavailable'} ContentState
 */

/**
 * @typedef {Object} ContentBlock
 * @property {string} id Identificador editorial estable y único dentro de la página.
 * @property {NarrativeStage} stage Etapa que determina la posición del bloque en Narrative_Flow.
 * @property {ClaimType} claimType Naturaleza declarada del claim; no se infiere desde el copy.
 * @property {ContentState} state Estado verificable que limita cómo puede publicarse el bloque.
 * @property {string} heading Encabezado visible del bloque.
 * @property {string} body Cuerpo visible del bloque.
 * @property {ReadonlyArray<{id:string, marker:string, title:string, body:string}>=} items Detalles visibles ordenados del bloque cuando existen.
 * @property {string=} boundary Límite profesional visible asociado al bloque cuando aplica.
 * @property {string=} sourceRef Referencia a una fuente aprobada cuando resulte aplicable.
 */

/**
 * @typedef {Object} ContentAction
 * @property {string} label Texto específico de la acción.
 * @property {string} destination Destino real de la acción.
 * @property {string} consequence Consecuencia comprensible antes de continuar.
 */

/**
 * @typedef {Object} PageContentModel
 * @property {string} route Pathname público existente.
 * @property {string} h1 Encabezado principal único.
 * @property {ReadonlyArray<ContentBlock>} blocks Bloques en orden narrativo.
 * @property {string=} evidenceContext Clave opcional para consultar evidencia; no contiene evidencia ni placeholders.
 * @property {ContentAction} primaryAction Acción principal de la página.
 * @property {string} metadataKey Clave de metadatos asociada al pathname.
 */

/**
 * Capa exclusivamente editorial asociada a un plan mediante su id fuente.
 * Los datos comerciales permanecen en `offerings.js` y no forman parte del overlay.
 *
 * @typedef {Object} PlanEditorialOverlay
 * @property {string} descriptor Subtítulo editorial; nunca sustituye el nombre canónico.
 * @property {string} jtbdSummary Progreso que la persona intenta conseguir.
 * @property {string} valueSummary Síntesis del valor antes del precio y el detalle.
 */

/**
 * Mensajes de conversión que reaccionan al plan sin contaminar su contrato comercial.
 *
 * @typedef {Object} PlanConversionMessage
 * @property {string} proofAnchor Prueba o identificación breve bajo la tarjeta del plan.
 * @property {string} calculatorMessage Refuerzo emocional mostrado al elegir el plan.
 */

/**
 * @typedef {Object} PlanEditorialProjection
 * @property {Object} plan Objeto fuente de Commercial_Config, conservado por referencia.
 * @property {PlanEditorialOverlay} overlay Capa editorial asociada al id del plan.
 */

/** @type {ReadonlyArray<NarrativeStage>} */
export const NARRATIVE_STAGES = Object.freeze([
  'problem',
  'vision',
  'mechanism',
  'proof',
  'offer',
  'action',
])

/** @type {ReadonlyArray<ClaimType>} */
export const CLAIM_TYPES = Object.freeze([
  'editorial',
  'aspiration',
  'commercial',
  'evidence',
  'concept',
])

/** @type {ReadonlyArray<ContentState>} */
export const CONTENT_STATES = Object.freeze([
  'verified',
  'aspirational',
  'concept',
  'unavailable',
])

/**
 * Vocabulario único del Content_Model. Las páginas y el dominio comparten estas
 * referencias sin redefinir etapas, tipos de claim o estados.
 */
export const CONTENT_MODEL_VOCABULARY = Object.freeze({
  stages: NARRATIVE_STAGES,
  claimTypes: CLAIM_TYPES,
  states: CONTENT_STATES,
})

/** @type {ReadonlyArray<keyof PlanEditorialOverlay>} */
export const PLAN_EDITORIAL_OVERLAY_FIELDS = Object.freeze([
  'descriptor',
  'jtbdSummary',
  'valueSummary',
])

/** @type {Readonly<Record<string, PlanEditorialOverlay>>} */
export const planEditorialOverlays = Object.freeze({
  RAIZ: Object.freeze({
    descriptor: 'Tu reinicio con dirección',
    jtbdSummary: 'Quiero volver a sentirme en control sin perderme entre rutinas, excusas y lunes eternos.',
    valueSummary: 'Un plan claro, una sesión 1:1 y revisión quincenal para instalar el hábito sin depender de motivación.',
  }),
  FUERZA: Object.freeze({
    descriptor: 'Corrección y avance real',
    jtbdSummary: 'Quiero entrenar sabiendo que alguien mira mi técnica, mi constancia y mi siguiente ajuste.',
    valueSummary: 'Dos sesiones virtuales al mes, revisión semanal y una guía que convierte esfuerzo en progreso visible.',
  }),
  RENDIMIENTO: Object.freeze({
    descriptor: 'Sistema de transformación',
    jtbdSummary: 'Quiero una estrategia completa: entrenamiento, nutrición, recuperación y lectura semanal del proceso.',
    valueSummary: 'Cuatro sesiones virtuales, evaluación inicial y ajustes semanales para entrenar con precisión, no con intuición.',
  }),
  ELITE: Object.freeze({
    descriptor: 'Experiencia privada',
    jtbdSummary: 'Quiero el máximo nivel de cercanía: decisiones rápidas, contacto directo y una ruta diseñada alrededor de mi vida.',
    valueSummary: 'Ocho sesiones privadas al mes y comunicación directa con Sebastián, siempre sujeto a disponibilidad real.',
  }),
})

/** @type {Readonly<Record<string, PlanConversionMessage>>} */
export const planConversionMessages = Object.freeze({
  RAIZ: Object.freeze({
    proofAnchor: 'Plan mensual, una sesión virtual y seguimiento quincenal para volver con orden.',
    calculatorMessage: 'El punto de entrada para dejar de improvisar y recuperar constancia.',
  }),
  FUERZA: Object.freeze({
    proofAnchor: 'Dos sesiones virtuales al mes, corrección técnica y seguimiento semanal.',
    calculatorMessage: 'El plan para entrenar acompañado, corregir antes y sostener mejor.',
  }),
  RENDIMIENTO: Object.freeze({
    proofAnchor: 'Cuatro sesiones virtuales, evaluación inicial y ajustes semanales con criterio.',
    calculatorMessage: 'La experiencia para quien quiere un sistema completo, no solo una rutina.',
  }),
  ELITE: Object.freeze({
    proofAnchor: 'Ocho sesiones privadas y contacto directo, con máximo de 10 cupos.',
    calculatorMessage: 'La experiencia más cercana para decidir, ajustar y avanzar con prioridad.',
  }),
})

/**
 * Comprueba que planes y overlays formen una relación uno a uno y que la capa
 * editorial no incorpore ningún campo perteneciente al contrato comercial.
 *
 * @param {ReadonlyArray<Object>} plans Planes procedentes de Commercial_Config.
 * @param {Readonly<Record<string, PlanEditorialOverlay>>} overlays Overlays indexados por plan.id.
 * @returns {true}
 */
export function validatePlanEditorialOverlays(
  plans = membershipPlans,
  overlays = planEditorialOverlays,
) {
  if (!Array.isArray(plans)) {
    throw new TypeError('Los planes fuente deben proporcionarse como una lista.')
  }
  if (!overlays || typeof overlays !== 'object' || Array.isArray(overlays)) {
    throw new TypeError('Los overlays editoriales deben proporcionarse como un objeto por id.')
  }

  const sourcePlanIds = plans.map((plan, index) => {
    if (!plan || typeof plan !== 'object' || typeof plan.id !== 'string' || !plan.id.trim()) {
      throw new TypeError(`El plan fuente en la posición ${index} no tiene un id válido.`)
    }
    return plan.id
  })
  const duplicatePlanIds = [...new Set(
    sourcePlanIds.filter((planId, index) => sourcePlanIds.indexOf(planId) !== index),
  )]

  if (duplicatePlanIds.length) {
    throw new Error(`Ids de plan fuente duplicados: ${duplicatePlanIds.join(', ')}.`)
  }

  const overlayIds = Object.keys(overlays)
  const missingOverlayIds = sourcePlanIds.filter((planId) => !Object.hasOwn(overlays, planId))
  const orphanOverlayIds = overlayIds.filter((planId) => !sourcePlanIds.includes(planId))
  const coverageErrors = []

  if (missingOverlayIds.length) {
    coverageErrors.push(`Planes fuente sin overlay: ${missingOverlayIds.join(', ')}.`)
  }
  if (orphanOverlayIds.length) {
    coverageErrors.push(`Overlays huérfanos: ${orphanOverlayIds.join(', ')}.`)
  }
  if (coverageErrors.length) {
    throw new Error(`Cobertura editorial inválida. ${coverageErrors.join(' ')}`)
  }

  for (const planId of sourcePlanIds) {
    const overlay = overlays[planId]
    if (!overlay || typeof overlay !== 'object' || Array.isArray(overlay)) {
      throw new TypeError(`El overlay de ${planId} debe ser un objeto.`)
    }

    const overlayFields = Object.keys(overlay)
    const missingFields = PLAN_EDITORIAL_OVERLAY_FIELDS.filter(
      (field) => !Object.hasOwn(overlay, field),
    )
    const unexpectedFields = overlayFields.filter(
      (field) => !PLAN_EDITORIAL_OVERLAY_FIELDS.includes(field),
    )

    if (missingFields.length) {
      throw new Error(`Campos editoriales ausentes en ${planId}: ${missingFields.join(', ')}.`)
    }
    if (unexpectedFields.length) {
      throw new Error(`Campos editoriales no permitidos en ${planId}: ${unexpectedFields.join(', ')}.`)
    }

    for (const field of PLAN_EDITORIAL_OVERLAY_FIELDS) {
      if (typeof overlay[field] !== 'string' || !overlay[field].trim()) {
        throw new TypeError(`El campo editorial ${field} de ${planId} debe ser texto no vacío.`)
      }
    }
  }

  return true
}

/**
 * Adapta los planes para consumo editorial sin extender ni clonar sus campos
 * comerciales. Cada proyección conserva el objeto fuente y su overlay separados.
 *
 * @param {ReadonlyArray<Object>} plans Planes procedentes de Commercial_Config.
 * @param {Readonly<Record<string, PlanEditorialOverlay>>} overlays Overlays indexados por plan.id.
 * @returns {ReadonlyArray<PlanEditorialProjection>}
 */
export function createPlanEditorialProjection(
  plans = membershipPlans,
  overlays = planEditorialOverlays,
) {
  validatePlanEditorialOverlays(plans, overlays)

  return Object.freeze(plans.map((plan) => Object.freeze({
    plan,
    overlay: overlays[plan.id],
  })))
}

/**
 * Proyección canónica validada al importar el módulo. Un cambio de ids en
 * Commercial_Config sin su overlay correspondiente falla de forma explícita.
 */
export const membershipPlanEditorialProjection = createPlanEditorialProjection()

/** Contexto fail-closed usado por Home para consultar Evidence_Gate. */
export const HOME_EVIDENCE_CONTEXT = 'home'

/**
 * Contrato editorial de Home para Narrative_Flow.
 *
 * Centraliza el copy visible de problema, aspiración, mecanismo, beneficios y
 * fallback público de proceso aprobado para Home. No contiene nombres, precios,
 * prestaciones, cantidades ni condiciones de los planes: el bloque de oferta
 * referencia Commercial_Config en lugar de copiarlo.
 *
 * @type {PageContentModel}
 */
export const homeContentModel = Object.freeze({
  route: '/',
  h1: 'ENTRENA CON DIRECCIÓN. HAZTE MÁS FUERTE.',
  blocks: Object.freeze([
    Object.freeze({
      id: 'home-problem',
      stage: 'problem',
      claimType: 'editorial',
      state: 'verified',
      heading: 'Empieza desde donde estás.',
      body: 'Tu tiempo, tu experiencia y tu energía son el punto de partida. Ordenamos lo que tienes para que el siguiente paso sea posible.',
      items: Object.freeze([
        Object.freeze({
          id: 'daily-energy',
          marker: '01',
          title: 'Un comienzo posible.',
          body: 'El primer paso debe caber en tu día. Empezamos por una decisión que puedas sostener.',
        }),
        Object.freeze({
          id: 'effort-without-reference',
          marker: '02',
          title: 'Dale sentido a tu esfuerzo.',
          body: 'Relaciona cada sesión con lo que quieres construir. Registra lo que haces y revisa qué necesitas después.',
        }),
        Object.freeze({
          id: 'discomfort-with-context',
          marker: '03',
          title: 'Escucha tu contexto.',
          body: 'Tu energía y tus sensaciones importan. Nos ayudan a conversar sobre el entrenamiento y sus límites.',
        }),
        Object.freeze({
          id: 'real-life-method',
          marker: '04',
          title: 'Una ruta para tu vida.',
          body: 'Tu semana cambia. Tu ruta necesita tener en cuenta tu tiempo, tu equipo y tu experiencia.',
        }),
      ]),
      sourceRef: 'src/config/conversionContent.js#home-problem',
    }),
    Object.freeze({
      id: 'home-vision',
      stage: 'vision',
      claimType: 'aspiration',
      state: 'aspirational',
      heading: 'Un siguiente paso. Con dirección.',
      body: 'Esto es lo que buscamos construir contigo: intención en cada sesión, una forma de observarla y claridad para reconocer el siguiente paso cuando toca entrenar y cuando tu semana cambia.',
      items: Object.freeze([
        Object.freeze({ id: 'energy', marker: '01', title: 'Abres el día con una acción concreta.', body: 'No dependes de sentirte perfecto para empezar.' }),
        Object.freeze({ id: 'response', marker: '02', title: 'Entiendes mejor lo que tu cuerpo responde.', body: 'Aprendes qué observar, qué registrar y qué ajustar.' }),
        Object.freeze({ id: 'confidence', marker: '03', title: 'Entrenas con intención, no por culpa.', body: 'Cada bloque tiene una razón, un límite y una forma de medirse.' }),
        Object.freeze({ id: 'direction', marker: '04', title: 'Sabes cuál es el siguiente paso.', body: 'La claridad reduce ruido, dudas y abandono.' }),
        Object.freeze({ id: 'continuity', marker: '05', title: 'Dejas de vivir reiniciando.', body: 'Construyes continuidad real, no otra racha que se rompe cuando la vida aprieta.' }),
      ]),
      sourceRef: 'src/config/conversionContent.js#home-vision',
    }),
    Object.freeze({
      id: 'home-mechanism',
      stage: 'mechanism',
      claimType: 'editorial',
      state: 'verified',
      heading: 'Entender. Diseñar. Acompañar.',
      body: 'De una primera conversación a una semana con estructura. Tres decisiones conectan tu contexto, tu entrenamiento y la revisión de lo que ocurre.',
      boundary: 'BAYONA trabaja en un marco no médico: no diagnostica, trata ni sustituye la atención de profesionales sanitarios.',
      items: Object.freeze([
        Object.freeze({
          id: 'understand',
          marker: '01',
          title: 'Todo empieza contigo.',
          body: 'Hablamos de tu objetivo, tu tiempo y tus recursos. Entender dónde estás nos ayuda a elegir desde dónde empezar.',
        }),
        Object.freeze({
          id: 'build',
          marker: '02',
          title: 'Tu semana toma forma.',
          body: 'Ordenamos las sesiones y sus prioridades. Puedes entender qué toca, para qué sirve y cómo encaja en tu semana.',
        }),
        Object.freeze({
          id: 'support',
          marker: '03',
          title: 'El plan sigue contigo.',
          body: 'Revisamos tu experiencia y lo que registras. Conservamos lo que ayuda y ajustamos lo que necesita otra forma.',
        }),
      ]),
      sourceRef: 'src/config/conversionContent.js#home-mechanism',
    }),
    Object.freeze({
      id: 'home-process-benefits',
      stage: 'mechanism',
      claimType: 'editorial',
      state: 'verified',
      heading: 'Menos dudas. Más continuidad.',
      body: 'Un proceso útil conecta lo que haces hoy con lo que necesitas mañana. La claridad se construye sesión a sesión.',
      items: Object.freeze([
        Object.freeze({
          id: 'understand-your-body',
          marker: '01',
          title: 'Cada sesión tiene un propósito.',
          body: 'Sabes qué estás construyendo en cada sesión: fuerza, movilidad, capacidad, técnica o recuperación.',
        }),
        Object.freeze({
          id: 'purposeful-movement',
          marker: '02',
          title: 'Tu semana cuenta una historia.',
          body: 'No se trata de hacer más. Se trata de entender qué conviene mantener, subir, bajar o corregir.',
        }),
        Object.freeze({
          id: 'supported-practice',
          marker: '03',
          title: 'Acompañamiento con contexto.',
          body: 'Tienes acompañamiento según tu plan para no perderte justo cuando baja la motivación.',
        }),
      ]),
      sourceRef: 'src/config/conversionContent.js#home-process-benefits',
    }),
    Object.freeze({
      id: 'home-evidence-unavailable',
      stage: 'proof',
      claimType: 'evidence',
      state: 'unavailable',
      heading: 'PREMIUM NO ES PROMETER MÁS. ES SER MÁS CLARO.',
      body: 'No vendemos milagros ni cuerpos garantizados. Vendemos una experiencia seria: límites claros, método visible y una ruta que puedes entender antes de pagar.',
      sourceRef: 'src/config/evidenceRegistry.js#home',
    }),
    Object.freeze({
      id: 'home-process-fallback',
      stage: 'proof',
      claimType: 'editorial',
      state: 'verified',
      heading: 'Tu proceso. A la vista.',
      body: 'Así se ve la forma de trabajar: un punto de partida, una ruta que puedes entender y revisiones para decidir el siguiente paso.',
      items: Object.freeze([
        Object.freeze({
          id: 'context-before-diagnosis',
          marker: '01',
          title: 'Un punto de partida claro.',
          body: 'Tu objetivo y tu semana quedan por escrito. Una referencia para volver a ella cuando haga falta.',
        }),
        Object.freeze({
          id: 'reviewable-planning',
          marker: '02',
          title: 'Una ruta que puedes leer.',
          body: 'Sesiones, prioridades y decisiones conectadas. El documento hace visible la lógica del proceso.',
        }),
        Object.freeze({
          id: 'adjustments-without-guarantees',
          marker: '03',
          title: 'Revisar para continuar.',
          body: 'Lo que registras abre una conversación. Desde ahí revisamos qué mantener y qué cambiar.',
        }),
      ]),
      sourceRef: 'src/config/conversionContent.js#home-experience',
    }),
    Object.freeze({
      id: 'home-offer',
      stage: 'offer',
      claimType: 'commercial',
      state: 'verified',
      heading: 'Encuentra tu forma de avanzar.',
      body: 'Cuatro niveles de acompañamiento: RAÍZ, FUERZA, RENDIMIENTO y ELITE. Recorre sus presentaciones, compara lo que incluyen y elige la cercanía que encaja con tu momento.',
      sourceRef: 'src/pages/Home.jsx#offer-section + src/config/offerings.js#membershipPlans',
    }),
    Object.freeze({
      id: 'home-action',
      stage: 'action',
      claimType: 'editorial',
      state: 'verified',
      heading: 'SI QUIERES ENTRENAR CON CRITERIO, EMPEZAMOS POR ENTENDER TU PUNTO DE PARTIDA.',
      body: 'Primero entiende la forma de trabajar. Después eliges el nivel de acompañamiento que encaja con tu momento, tu objetivo y tu capacidad real de sostenerlo.',
      sourceRef: 'src/pages/Home.jsx#closing',
    }),
  ]),
  evidenceContext: HOME_EVIDENCE_CONTEXT,
  primaryAction: Object.freeze({
    label: 'QUIERO EMPEZAR CON DIRECCIÓN',
    destination: '/programs',
    consequence: 'Abre Programas para elegir cómo quieres empezar tu transformación.',
  }),
  metadataKey: '/',
})

/**
 * Registro editorial por pathname. Solo incorpora una página cuando comienza su
 * Page_Milestone; las demás rutas permanecen fuera hasta su turno serial.
 *
 * @type {Readonly<Record<string, PageContentModel>>}
 */
export const conversionContent = Object.freeze({
  '/': homeContentModel,
})
