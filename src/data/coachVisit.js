import { membershipPlans } from '../config/offerings.js'
import { JOURNEY_GOALS } from './journeyGoals.js'

/* Una pregunta por etapa. 'nombre' es voluntario; las demás son preferencias, no datos clínicos. */
export const COACH_VISIT_STEPS = Object.freeze([
  { id:'nombre',path:'/',anchor:'inicio',label:'BIENVENIDA',title:'¿Cómo te llamas?',line:'Soy Sebastián. Voy a ayudarte a encontrar tu mejor punto de partida.',type:'name',options:[] },
  { id:'objetivo',path:'/',anchor:'tu-ruta',label:'TU OBJETIVO',title:'¿Qué quieres conseguir?',line:'Primero dime qué te gustaría lograr.',options:JOURNEY_GOALS.map(({id,label})=>({value:id,label})) },
  { id:'bloqueo',path:'/community',anchor:'por-que',label:'TU RETO',title:'¿Qué te está frenando?',line:'Quiero entender la dificultad real, no venderte una rutina cualquiera.',options:[
    {value:'constancia',label:'Me cuesta ser constante'},{value:'organizacion',label:'No sé cómo organizarme'},
    {value:'tecnica',label:'Necesito guía técnica'},{value:'tiempo',label:'No encuentro tiempo'},
  ] },
  { id:'experiencia',path:'/about',anchor:'la-persona',label:'TU PUNTO DE PARTIDA',title:'¿Cómo estás ahora?',line:'No te compararé con nadie.',options:[
    {value:'inicio',label:'Voy a empezar'},{value:'retomo',label:'Estoy retomando'},{value:'activo',label:'Ya entreno habitualmente'},
  ] },
  { id:'tiempo',path:'/resources',anchor:'reto',label:'TU SEMANA',title:'¿Cuántos días tienes?',line:'Hagamos que el plan encaje en tu vida.',options:[
    {value:'1-2',label:'1–2 días'},{value:'3-4',label:'3–4 días'},
    {value:'5+',label:'5 o más días'},{value:'depende',label:'Mi horario cambia'},
  ] },
  { id:'duracion',path:'/resources',anchor:'reto',label:'TIEMPO POR SESIÓN',title:'¿Cuánto dura tu sesión ideal?',line:'Podemos empezar con lo que de verdad tienes.',options:[
    {value:'20',label:'20–30 minutos'},{value:'45',label:'45–60 minutos'},{value:'flexible',label:'Prefiero algo flexible'},
  ] },
  { id:'formato',path:'/programs',anchor:'elige-servicio',label:'CÓMO ENTRENAS',title:'¿Dónde prefieres entrenar?',line:'Te mostraré opciones compatibles con tu rutina.',options:[
    {value:'online',label:'Desde casa u online'},{value:'consultar',label:'Quiero preguntar por presencial'},
    {value:'indefinido',label:'Necesito orientación'},
  ] },
  { id:'motivacion',path:'/programs',anchor:'elige-servicio',label:'LO QUE TE IMPORTA',title:'¿Qué valoras más?',line:'Así puedo entender cómo acompañarte.',options:[
    {value:'independencia',label:'Autonomía'},{value:'estructura',label:'Un plan claro'},
    {value:'correccion',label:'Que revisen mi técnica'},{value:'cercania',label:'Contacto cercano'},
  ] },
  { id:'apoyo',path:'/programs',anchor:'membresias',label:'ACOMPAÑAMIENTO',title:'¿Cuánto apoyo quieres?',line:'Esto me ayudará a comparar los planes disponibles.',options:[
    {value:'base',label:'Base y revisiones'},{value:'semanal',label:'Revisión cada semana'},
    {value:'integral',label:'Un proceso integral'},{value:'privado',label:'Acompañamiento privado'},
  ] },
  { id:'criterio',path:'/movimiento-adaptado',anchor:'contextos',label:'ENTRENAR CON CRITERIO',title:'Un punto importante.',line:'No necesito tus datos médicos aquí. Si existen restricciones de salud, pueden requerir valoración profesional.',options:[
    {value:'informacion',label:'Entiendo, sigamos'},{value:'orientacion',label:'Prefiero consultar primero'},
  ] },
  { id:'resultado',path:'/programs',anchor:'membresias',label:'TU PROPUESTA',title:'Ya tengo una primera orientación.',line:'Esta es una propuesta inicial, no una evaluación física ni médica.',options:[] },
])

export function suggestCoachPlan(answers={}) {
  const ids={base:'RAIZ',semanal:'FUERZA',integral:'RENDIMIENTO',privado:'ELITE'}
  const plan=membershipPlans.find(p=>p.id===(ids[answers.apoyo]||'RAIZ'))||membershipPlans[0]
  const obstacles={
    constancia:'Conviene construir una rutina sostenible.',
    organizacion:'Una estructura clara te ayudará a organizarte.',
    tecnica:'La revisión técnica debe valorarse antes de elegir sesiones.',
    tiempo:'El entrenamiento tendrá que ajustarse a tu agenda.',
  }
  const reasons=[
    obstacles[answers.bloqueo],
    answers.apoyo==='semanal'?'Quieres revisiones semanales.':answers.apoyo==='integral'?'Buscas un proceso más amplio.':answers.apoyo==='privado'?'Prefieres acompañamiento cercano.':'Prefieres una base y revisiones.',
    answers.tiempo==='depende'?'Tu horario es variable.':null,
  ].filter(Boolean)
  const services={
    fuerza:'Entrenamiento personal u online',movilidad:'Movilidad y entrenamiento adaptado (no clínico)',
    volver:'Entrenamiento online',parkour:'Parkour y rendimiento',energia:'Entrenamiento online',
  }
  return {
    plan,reasons,goalService:services[answers.objetivo]||'Entrenamiento general',
    requiresConversation:answers.criterio==='orientacion'||answers.formato==='consultar',
    alternatives:membershipPlans.filter(p=>p.id!==plan.id),
  }
}
export function coachAnswerLabel(id,value){
  const step=COACH_VISIT_STEPS.find(s=>s.id===id)
  return step?.options.find(o=>o.value===value)?.label||''
}
