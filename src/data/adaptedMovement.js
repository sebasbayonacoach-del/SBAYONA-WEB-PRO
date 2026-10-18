/**
 * Guía de CONTEXTOS para actividad física adaptada, no un catálogo de
 * enfermedades que BAYONA afirme tratar. Nunca inferir diagnósticos ni
 * atribuir resultados clínicos a un entrenador.
 */
export const MOVEMENT_CONTEXTS = Object.freeze([
  {
    id: 'espalda', name: 'Espalda, articulaciones y postura', icon: '01',
    summary: 'Progresión de fuerza, tolerancia al movimiento y hábitos activos, según tu valoración.',
    examples: ['Lumbalgia persistente', 'Cervicalgia', 'Dorsalgia', 'Escoliosis', 'Hernia o protrusión discal', 'Artrosis de cadera o rodilla', 'Tendinopatías', 'Limitación de hombro', 'Dolor femoropatelar', 'Rigidez articular'],
  },
  {
    id: 'lesiones', name: 'Lesiones y vuelta a la actividad', icon: '02',
    summary: 'Adaptación del ejercicio después de una lesión, cuando un profesional sanitario autoriza la carga.',
    examples: ['Esguinces', 'Lesiones musculares', 'Roturas tendinosas', 'Fracturas consolidadas', 'Reconstrucción del LCA', 'Cirugía de hombro', 'Prótesis articulares', 'Postoperatorios', 'Readaptación deportiva', 'Dolor residual'],
  },
  {
    id: 'reumatologia', name: 'Reumatología y dolor persistente', icon: '03',
    summary: 'Trabajo graduado de capacidad funcional dentro de las indicaciones médicas.',
    examples: ['Artritis reumatoide', 'Espondiloartritis', 'Fibromialgia', 'Lupus', 'Artritis psoriásica', 'Osteoporosis', 'Osteopenia', 'Síndrome de dolor crónico', 'Polimialgia', 'Hipermovilidad articular'],
  },
  {
    id: 'metabolico', name: 'Metabolismo y salud cardiometabólica', icon: '04',
    summary: 'Movimiento progresivo y hábitos; nunca sustituye seguimiento médico ni nutrición clínica.',
    examples: ['Diabetes tipo 1', 'Diabetes tipo 2', 'Prediabetes', 'Obesidad', 'Síndrome metabólico', 'Hipotiroidismo', 'Síndrome de ovario poliquístico', 'Dislipemia', 'Resistencia a la insulina', 'Hígado graso'],
  },
  {
    id: 'cardiovascular', name: 'Sistema cardiovascular', icon: '05',
    summary: 'Actividad física únicamente cuando sea apropiada y con el nivel de supervisión indicado por cardiología.',
    examples: ['Hipertensión arterial', 'Enfermedad coronaria', 'Insuficiencia cardiaca', 'Arritmias', 'Cardiopatías congénitas', 'Valvulopatías', 'Después de infarto', 'Rehabilitación cardiaca supervisada'],
  },
  {
    id: 'respiratorio', name: 'Respiración y capacidad funcional', icon: '06',
    summary: 'Ajustes a la tolerancia al esfuerzo y las recomendaciones del equipo sanitario.',
    examples: ['Asma', 'EPOC', 'Bronquiectasias', 'Fibrosis pulmonar', 'Secuelas respiratorias', 'Apnea del sueño', 'Disnea de esfuerzo evaluada', 'Tras enfermedad respiratoria'],
  },
  {
    id: 'neurologico', name: 'Neurología y control motor', icon: '07',
    summary: 'Trabajo de fuerza, equilibrio y autonomía en coordinación con rehabilitación clínica cuando corresponda.',
    examples: ['Parkinson', 'Esclerosis múltiple', 'Ictus', 'Lesión medular', 'Parálisis cerebral', 'Neuropatías periféricas', 'Ataxias', 'Traumatismo craneoencefálico', 'Trastornos del equilibrio', 'Secuelas neurológicas'],
  },
  {
    id: 'oncologico', name: 'Procesos oncológicos', icon: '08',
    summary: 'Actividad física acordada con oncología según tratamiento, fatiga y posibles contraindicaciones.',
    examples: ['Durante tratamiento oncológico autorizado', 'Supervivencia al cáncer', 'Fatiga relacionada con cáncer', 'Después de cirugía oncológica', 'Limitación funcional posterior al tratamiento'],
  },
  {
    id: 'pelvico', name: 'Etapas vitales y suelo pélvico', icon: '09',
    summary: 'Ejercicio general adaptado; las disfunciones pélvicas requieren valoración especializada.',
    examples: ['Embarazo sin contraindicaciones', 'Posparto', 'Menopausia', 'Diástasis abdominal', 'Incontinencia urinaria', 'Prolapso de órganos pélvicos', 'Dolor pélvico', 'Retorno al deporte tras embarazo'],
  },
  {
    id: 'discapacidad', name: 'Discapacidad, diversidad y autonomía', icon: '10',
    summary: 'Accesibilidad, apoyos y progresión a partir de las capacidades y preferencias de cada persona.',
    examples: ['Discapacidad física', 'Discapacidad intelectual', 'Discapacidad visual', 'Discapacidad auditiva', 'Amputaciones', 'Movilidad reducida', 'Trastornos del neurodesarrollo', 'Condiciones genéticas con limitación funcional'],
  },
  {
    id: 'edad', name: 'Envejecimiento y vida cotidiana', icon: '11',
    summary: 'Fuerza, equilibrio, confianza y prevención de desacondicionamiento según capacidad actual.',
    examples: ['Fragilidad', 'Sarcopenia', 'Riesgo de caídas', 'Pérdida de equilibrio', 'Desacondicionamiento', 'Deterioro funcional', 'Movilidad reducida', 'Después de hospitalización'],
  },
  {
    id: 'bienestar', name: 'Bienestar y situaciones particulares', icon: '12',
    summary: 'Actividad física como apoyo al bienestar, sin sustituir atención psicológica o médica.',
    examples: ['Estrés', 'Ansiedad en seguimiento', 'Depresión en seguimiento', 'Fatiga persistente evaluada', 'Sueño irregular', 'Sedentarismo', 'Baja condición física', 'Dolor sin diagnóstico', 'Otras condiciones o combinaciones'],
  },
])

export const DISCOVERY_GOALS = Object.freeze([
  {id:'fuerza', label:'Ganar fuerza', detail:'Construir capacidad y confianza'},
  {id:'movilidad', label:'Moverme mejor', detail:'Mejorar movilidad y autonomía'},
  {id:'volver', label:'Retomar actividad', detail:'Regresar con progresión'},
  {id:'energia', label:'Tener más energía', detail:'Crear un hábito sostenible'},
])

export const DISCOVERY_CONTEXTS = Object.freeze([
  {id:'general', label:'Quiero empezar sin complicaciones'},
  {id:'limitaciones', label:'Tengo molestias o limitaciones'},
  {id:'diagnostico', label:'Tengo una condición de salud diagnosticada'},
  {id:'reincorporacion', label:'Regreso después de una lesión o intervención'},
  {id:'no-decidir', label:'Prefiero no indicarlo'},
])

export const DISCOVERY_FORMATS = Object.freeze([
  {id:'online', label:'Online y flexible'},
  {id:'presencial', label:'Acompañamiento individual'},
  {id:'autonomia', label:'Primero quiero recursos gratuitos'},
  {id:'orientacion', label:'Necesito orientación antes de elegir'},
])

export const contextNeedsReview = id => ['diagnostico','reincorporacion'].includes(id)
