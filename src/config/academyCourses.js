/**
 * SEBASTIAN BAYONA ACADEMIA · commercial curriculum prototypes.
 * These are course concepts ready for learner validation, not live enrollments.
 * Prices are tests, not fixed retail offers or Shopify products.
 * Copyright: original SEBASTIAN BAYONA course outlines.
 */
const c = (id, title, category, audience, weeks, selfPaced, cohort, summary, promise, modules, deliverables, project, color) => Object.freeze({
  id, title, category, audience, weeks, selfPaced, cohort,
  summary, promise, modules: Object.freeze(modules),
  deliverables: Object.freeze(deliverables),
  project, color,
  status: 'prelaunch',
})

export const academyCourses = Object.freeze([
  c(
    'movimiento-360', 'MOVIMIENTO 360°', 'ENTRENAMIENTO',
    'Adultos que quieren recuperar hábitos, fuerza y libertad de movimiento.',
    12, 149, 449,
    'Una metodología progresiva para entrenar sin improvisar y entender qué hacer cada semana.',
    'Al terminar tendrás un plan de actividad de 12 semanas, criterios para adaptarlo y un registro de tu progreso.',
    [
      ['01','Punto de partida','Objetivos, disponibilidad, historial, límites de una autoevaluación.'],
      ['02','Movimiento con criterio','Patrones de fuerza, locomoción, equilibrio y recuperación.'],
      ['03','Técnica que se puede explicar','Control y regresiones para piernas, empuje, tirón y cadera.'],
      ['04','Fuerza funcional','Series, repeticiones, descanso, dificultad y progresión.'],
      ['05','Movilidad y estabilidad','Rangos cómodos, coordinación, base de apoyo.'],
      ['06','Resistencia sostenible','Intensidad percibida, caminar, trabajo continuo y recuperación.'],
      ['07','Construye tu calendario','Microciclos, semanas realistas, adaptación del volumen.'],
      ['08','Entrena donde estés','Casa, bandas y gimnasio; soluciones a los días difíciles.'],
      ['09','Registra para aprender','Tiempo, sensaciones, técnica, adherencia y revisión.'],
      ['10','Revisión y autonomía','Diseña el siguiente bloque sin metas falsas ni extremo físico.'],
    ],
    ['Libro del alumno','Plantillas de semanas','Registro de cargas y tiempos','Vídeos demostrativos originales pendientes de grabación','Cuestionarios de cada módulo'],
    'Presentar un programa propio de cuatro semanas y explicar tres decisiones técnicas.',
    'copper'
  ),
  c(
    'parkour-lab', 'PARKOUR LAB · BASES', 'MOVIMIENTO',
    'Personas que quieren iniciarse en parkour mediante progresiones seguras.',
    8, 129, 349,
    'Aprende a observar el entorno y construir equilibrio, precisión, apoyos y desplazamiento.',
    'Al terminar tendrás una progresión documentada de movimientos básicos de bajo riesgo y criterios para entrenar acompañado.',
    [
      ['01','Moverse antes de saltar','Entorno, calentamiento y evaluación del riesgo.'],
      ['02','Balance','Líneas al nivel del suelo, centros de masa y apoyo.'],
      ['03','Recepción conceptual','Mecánica básica y límites: no practicar caídas desde altura sin supervisión.'],
      ['04','Cuadrupedia y apoyos','Manos, hombros, transición y reparto de cargas.'],
      ['05','Precisión de pasos','Orientación visual y coordinación a ras de suelo.'],
      ['06','Fuerza para el parkour','Control de cadera, tobillo y tronco.'],
      ['07','Diseño de circuitos seguros','Secuencias al nivel del suelo y descansos.'],
      ['08','Tu recorrido técnico','Portafolio propio y siguiente paso supervisado.'],
    ],
    ['Mapa de progresiones','Ficha de seguridad de la sesión','Registro de técnicas','Vídeos propios de nivel suelo pendientes de grabación','Rúbrica de control'],
    'Grabar o describir una secuencia a ras de suelo y su evaluación de riesgos.',
    'olive'
  ),
  c(
    'coach-studio-ai', 'COACH STUDIO IA', 'PROFESIONALES',
    'Entrenadores y pequeños estudios que desean organizar clientes y procesos con tecnología.',
    10, 499, 1490,
    'De hojas dispersas a un sistema profesional de planificación, seguimiento y comunicación con ayuda responsable de IA.',
    'Al terminar tendrás un sistema mínimo funcional de organización para tu práctica de entrenador.',
    [
      ['01','Mapa del negocio real','Auditar oferta, alumnos, tareas y cuellos de botella.'],
      ['02','Experiencia del cliente','Onboarding, consentimiento, objetivos, seguimiento.'],
      ['03','Planificar sin improvisar','Sesión, microciclo, mesociclo y objetivos medibles.'],
      ['04','Biblioteca de ejercicios propia','Metadatos, licencias, variantes y vídeos autorizados.'],
      ['05','Datos útiles sin invadir','Registro mínimo, privacidad y acceso por rol.'],
      ['06','IA como asistente','Instrucciones, revisiones humanas, errores y límites.'],
      ['07','Tablero de seguimiento','Adherencia, cargas, tareas y avisos que sí sirven.'],
      ['08','Comunicación y retención','Mensajes de progreso, límites de frecuencia, renovación.'],
      ['09','Oferta y comercialización','Paquetes, página de servicios, CTA, cobro responsable.'],
      ['10','Tu Coach Studio','Implementación guiada y auditoría final de datos y experiencia.'],
    ],
    ['Mapa de procesos','Plantilla de onboarding','Modelo de microciclos','Inventario de ejercicios','Guías de prompts seguros','Checklist de privacidad','Tablero demostrativo sin datos reales'],
    'Diseñar y demostrar un sistema de acompañamiento de un cliente ficticio, con revisión humana.',
    'gold'
  ),
  c(
    'ia-negocio', 'IA PARA NEGOCIOS REALES', 'TECNOLOGÍA',
    'Autónomos y microempresas que quieren reducir tareas y responder mejor a clientes.',
    8, 299, 990,
    'Sistemas simples de IA, contenidos, seguimiento comercial y automatizaciones autorizadas.',
    'Al finalizar tendrás un flujo de captación, respuesta y seguimiento documentado y medible.',
    [
      ['01','Diagnóstico antes de automatizar','Elegir problema, cliente y métrica de resultado.'],
      ['02','Página que convierte','Propuesta clara, prueba útil y solicitud de contacto.'],
      ['03','Organiza contactos con permiso','CRM mínimo, etiquetas, consentimiento, etapas.'],
      ['04','IA para redactar y revisar','Casos de uso, errores, corrección humana.'],
      ['05','Automatizaciones reversibles','Triggers, límites, auditoría, fallos seguros.'],
      ['06','Contenido que resuelve dudas','Investigación y calendario de piezas útiles.'],
      ['07','Ofertas y cierre responsable','Presupuesto, objeciones, seguimiento sin spam.'],
      ['08','Sistema probado','Prototipo, métricas y plan de mejora.'],
    ],
    ['Mapa de procesos','Plantilla de CRM','Biblioteca de mensajes','Checklist de consentimientos','Panel de métricas ejemplo','Modelo de automatización reversible'],
    'Mostrar un flujo de servicio que reduzca una tarea medible sin enviar mensajes no solicitados.',
    'slate'
  ),
  c(
    'marca-movimiento', 'MARCA EN MOVIMIENTO', 'CREACIÓN',
    'Entrenadores, creadores y profesionales que desean expresar mejor su experiencia.',
    6, 179, 490,
    'Una identidad editorial, contenido útil y un catálogo coherente sin depender de trucos virales.',
    'Al finalizar tendrás una narrativa de marca, 12 piezas planificadas y una propuesta comercial.',
    [
      ['01','Tu punto de vista','Valores, especialidad, historia y límites.'],
      ['02','El cliente y su problema','Escucha, preguntas, contexto y objeciones.'],
      ['03','Estilo editorial','Sistema visual, paleta, tipografía y consistencia.'],
      ['04','Contenido con sustancia','Guion, demostración, explicación y llamada a la acción.'],
      ['05','Landing y oferta','Portfolio, claridad del servicio y contacto.'],
      ['06','Producción sostenible','Calendario, medición y mejoras por evidencia.'],
    ],
    ['Guía de marca','Matriz de 12 contenidos','Guiones de vídeo','Plantilla de landing','Calendario editable'],
    'Entregar una mini campaña de 12 contenidos y una página de oferta.',
    'clay'
  ),
  c(
    'disciplina-adaptacion', 'DISCIPLINA Y ADAPTACIÓN', 'HÁBITOS',
    'Personas que desean recuperar estructura, actividad y objetivos realistas.',
    6, 79, 249,
    'Herramientas cotidianas de planificación, hábitos y movimiento inspiradas en experiencias reales de adaptación.',
    'Al terminar tendrás un calendario semanal, un sistema de revisión y un conjunto de hábitos elegidos.',
    [
      ['01','El punto de partida','Inventario de tiempo, energía y recursos.'],
      ['02','Decidir qué importa','Prioridades, límites, objetivos semanales.'],
      ['03','Movimiento como hábito','Plan mínimo, práctica flexible y recuperación.'],
      ['04','Aprender mientras haces','Microproyectos y mejora gradual.'],
      ['05','Red de apoyo','Pedir ayuda, relaciones y comunidad.'],
      ['06','Mantener el sistema','Revisión semanal, obstáculos y plan de continuidad.'],
    ],
    ['Agenda semanal','Hoja de prioridades','Plantilla de hábitos','Cuaderno de revisión'],
    'Crear y aplicar un plan semanal durante 14 días, registrando ajustes.',
    'sand'
  ),
])

export const academyPilot = Object.freeze({
  priority: Object.freeze(['coach-studio-ai','movimiento-360','parkour-lab']),
  freeOffer: 'Tu primer mes de movimiento: guía gratuita y plan inicial orientativo',
  b2bLicensing: 'Licencia de contenido o implementación para estudios: presupuesto individual tras validar derechos, soporte y alcance.',
  disclaimer: 'Formaciones privadas no regladas. No expiden títulos oficiales ni garantizan ingresos, empleo, resultados médicos o físicos.',
})
