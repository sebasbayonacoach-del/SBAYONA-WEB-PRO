/**
 * BAYONA · CONTENIDO DE PREGUNTAS FRECUENTES
 * ---------------------------------------------------------------------------
 * Extraído de src/pages/FAQ.jsx para que sea dato puro y reutilizable:
 * la página lo renderiza y la capa SEO lo convierte en schema.org/FAQPage.
 *
 * Mantener el marco no médico y sin promesas de resultado.
 * `pricing: true` marca la única respuesta que además muestra la tabla de precios.
 */

import { GUARANTEE_FAQ_ANSWER } from './commitments.js'

export const questionCategories = [
  {
    title: 'SERVICIOS',
    questions: [
      {
        q: '¿Necesito experiencia previa?',
        a: 'No. Hay propuestas desde iniciación hasta rendimiento. Antes de contratar revisamos tu punto de partida, objetivo y disponibilidad para orientar la elección.',
      },
      {
        q: '¿Hay servicios para niños y jóvenes?',
        a: 'Sí. La oferta publicada contempla niños de 5 a 11 años y jóvenes de 12 a 17, además de adultos, deportistas y personas de 60 años o más. La actividad concreta depende de nivel, ubicación y disponibilidad.',
      },
      {
        q: '¿Qué incluye cada plan?',
        a: 'RAÍZ incluye plan mensual personalizado, una sesión virtual 1:1, guía de alimentación y seguimiento quincenal. FUERZA eleva el seguimiento a semanal e incluye dos sesiones virtuales al mes y una videollamada mensual con Sebastián. RENDIMIENTO incluye cuatro sesiones virtuales, evaluación inicial y ajustes semanales. ELITE incluye ocho sesiones privadas y contacto directo con Sebastián, con un máximo publicado de 10 cupos. Revisa siempre la ficha vigente antes de pagar. BAYONA+ sigue en desarrollo y no se presenta como una prestación operativa hoy.',
      },
      {
        q: '¿Puedo cambiar de plan?',
        a: 'El cambio se coordina por WhatsApp y queda sujeto al ciclo de facturación, la disponibilidad y las condiciones vigentes. Te confirmamos por escrito cuándo se aplica antes de procesarlo.',
      },
      {
        q: '¿Hay permanencia?',
        a: 'Los planes se publican con precio mensual. Antes de pagar te confirmamos por escrito renovación, fecha de corte y procedimiento de cancelación para que decidas con la información completa.',
      },
    ],
  },
  {
    title: 'PRECIOS',
    questions: [
      {
        q: '¿Cuánto cuesta?',
        a: 'Aquí ves los precios mensuales publicados en COP y sus equivalencias aproximadas en EUR y USD. Confirma el importe final y la disponibilidad antes de pagar.',
        pricing: true,
      },
      {
        /*
          Esta pregunta no existía, y era la que más falta hacía: la garantía se
          anuncia en Programs y en las cuatro páginas de plan, pero la FAQ solo
          decía "confirma las condiciones", como si hubiera letra pequeña.
          La respuesta se deriva de config/commitments.js.
        */
        q: '¿Cómo funciona la garantía de 30 días?',
        a: GUARANTEE_FAQ_ANSWER,
      },
      {
        q: '¿Qué métodos de pago aceptáis?',
        a: 'El medio disponible depende del país y se confirma por WhatsApp antes del cobro. No envíes datos de tarjeta por el chat; si corresponde, recibirás un enlace de pago seguro.',
      },
      {
        q: '¿Hay descuentos para familias?',
        a: 'No hay un descuento familiar fijo publicado. Pregunta por WhatsApp y te confirmamos si existe una condición vigente para tu caso antes de contratar.',
      },
    ],
  },
  {
    title: 'BAYONA+',
    questions: [
      {
        q: '¿La app funciona en iOS y Android?',
        a: 'Todavía no. BAYONA+ está en desarrollo y no hay una app operativa para descargar. iOS, Android y web son formatos contemplados en el concepto, no compatibilidades confirmadas.',
      },
      {
        q: '¿Cuándo estará lista la app?',
        a: 'No hay una fecha pública confirmada. Si se abre una prueba o acceso anticipado, se comunicarán por escrito los requisitos, dispositivos compatibles y funciones disponibles. RENDIMIENTO y ELITE contemplan acceso anticipado cuando exista una versión utilizable; no significa acceso inmediato.',
      },
      {
        q: '¿Qué incluirá la app?',
        a: 'La página de BAYONA+ muestra funciones en exploración: plan diario, registro de sesiones, recursos, comunidad y contacto según el plan. El alcance puede cambiar durante el desarrollo y ninguna maqueta garantiza una función final.',
      },
    ],
  },
  {
    title: 'MÉTODO',
    questions: [
      {
        q: '¿Puedo entrenar si vengo de una lesión?',
        a: 'Vamos con cabeza desde el primer día: empiezas por lo que tu cuerpo sostiene hoy y sumamos carga cuando el movimiento ya te resulta cómodo. Si alguien está cuidando tu caso, entrenamos dentro de ese acuerdo y ajustamos cada sesión a lo que puedes hacer sin prisa.',
      },
      {
        q: '¿Qué material necesito?',
        a: 'Depende del servicio y del objetivo. Puede incluir peso corporal, bandas o mancuernas. Antes de empezar te confirmamos el material y las alternativas disponibles.',
      },
      {
        q: '¿Hay clases presenciales?',
        a: 'El servicio es principalmente online. Las sesiones presenciales individuales se imparten en Bogotá (Colombia). En España no ofrecemos entrenamiento personal 1 a 1: allí el trabajo es online, o en grupo cuando hay grupo abierto. Confirma la modalidad antes de contratar.',
      },
    ],
  },
  {
    title: 'COMUNIDAD',
    questions: [
      {
        q: '¿Cómo accedo a la comunidad?',
        a: 'El acceso abierto es gratuito y se solicita por WhatsApp. No necesitas comprar un plan. El seguimiento individual y la prioridad de respuesta dependen de la membresía contratada.',
      },
      {
        q: '¿Puedo regalar una membresía?',
        a: 'Consulta por WhatsApp la disponibilidad y las condiciones vigentes. Si puede emitirse como regalo, te confirmamos plan, precio, activación y datos necesarios antes de cobrar.',
      },
    ],
  },
]

/** Lista plana de pares pregunta/respuesta, en el orden en que se muestran. */
export const faqEntries = questionCategories.flatMap((category) =>
  category.questions.map((item) => ({ category: category.title, question: item.q, answer: item.a })),
)
