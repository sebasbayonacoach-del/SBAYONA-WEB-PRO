import { membershipPlans } from '../config/offerings.js'
import { JOURNEY_GOALS } from './journeyGoals.js'

/* Una pregunta por etapa. 'nombre' es voluntario; las demás son preferencias, no datos clínicos. */
export const COACH_VISIT_STEPS = Object.freeze([
  { id:'nombre',path:'/',anchor:'inicio',label:'BIENVENIDA',title:'¿Cómo te llamas?',line:'Soy Sebastián. Vamos a conocernos.',type:'name',options:[] },
  { id:'objetivo',path:'/',anchor:'tu-ruta',label:'TU OBJETIVO',title:'¿Qué quieres conseguir?',line:'Empecemos por ti.',options:JOURNEY_GOALS.map(({id,label})=>({value:id,label})) },
  { id:'bloqueo',path:'/community',anchor:'por-que',label:'TU RETO',title:'¿Qué te está frenando?',line:'Vamos al problema real.',options:[
    {value:'constancia',label:'Me cuesta ser constante'},{value:'organizacion',label:'No sé cómo organizarme'},
    {value:'tecnica',label:'Necesito guía técnica'},{value:'tiempo',label:'No encuentro tiempo'},
  ] },
  { id:'experiencia',path:'/about',anchor:'la-persona',label:'TU PUNTO DE PARTIDA',title:'¿Cómo estás ahora?',line:'Partimos de tu realidad.',options:[
    {value:'inicio',label:'Voy a empezar'},{value:'retomo',label:'Estoy retomando'},{value:'activo',label:'Ya entreno habitualmente'},
  ] },
  { id:'tiempo',path:'/resources',anchor:'reto',label:'TU SEMANA',title:'¿Cuántos días tienes?',line:'Tu tiempo cuenta.',options:[
    {value:'1-2',label:'1–2 días'},{value:'3-4',label:'3–4 días'},
    {value:'5+',label:'5 o más días'},{value:'depende',label:'Mi horario cambia'},
  ] },
  { id:'duracion',path:'/resources',anchor:'reto',label:'TIEMPO POR SESIÓN',title:'¿Cuánto dura tu sesión ideal?',line:'Elige algo posible.',options:[
    {value:'20',label:'20–30 minutos'},{value:'45',label:'45–60 minutos'},{value:'flexible',label:'Prefiero algo flexible'},
  ] },
  { id:'formato',path:'/programs',anchor:'elige-servicio',label:'CÓMO ENTRENAS',title:'¿Dónde prefieres entrenar?',line:'Lo haremos a tu manera.',options:[
    {value:'online',label:'Desde casa u online'},{value:'consultar',label:'Quiero preguntar por presencial'},
    {value:'indefinido',label:'Necesito orientación'},
  ] },
  { id:'motivacion',path:'/programs',anchor:'elige-servicio',label:'LO QUE TE IMPORTA',title:'¿Qué valoras más?',line:'Quiero conocer tu estilo.',options:[
    {value:'independencia',label:'Autonomía'},{value:'estructura',label:'Un plan claro'},
    {value:'correccion',label:'Que revisen mi técnica'},{value:'cercania',label:'Contacto cercano'},
  ] },
  { id:'apoyo',path:'/programs',anchor:'membresias',label:'ACOMPAÑAMIENTO',title:'¿Cuánto apoyo quieres?',line:'Busquemos el apoyo adecuado.',options:[
    {value:'base',label:'Base y revisiones'},{value:'semanal',label:'Revisión cada semana'},
    {value:'integral',label:'Un proceso integral'},{value:'privado',label:'Acompañamiento privado'},
  ] },
  { id:'criterio',path:'/movimiento-adaptado',anchor:'contextos',label:'ENTRENAR CON CRITERIO',title:'Un punto importante.',line:'Ante restricciones de salud, consulta a un profesional sanitario.',options:[
    {value:'informacion',label:'Entiendo, sigamos'},{value:'orientacion',label:'Prefiero consultar primero'},
  ] },
  { id:'resultado',path:'/programs',anchor:'membresias',label:'TU PROPUESTA',title:'Ya tengo una primera orientación.',line:'Una primera propuesta para ti.',options:[] },
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
