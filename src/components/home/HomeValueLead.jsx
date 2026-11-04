import { useMemo, useRef, useState } from 'react'
import { ArrowDown, ArrowUpRight, BookOpen, Download, FileDown, Printer, Timer, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { bookingLink } from '../../config/site.config.js'
import { trackEvent } from '../../lib/analytics/analytics.js'
import './home-value-lead.css'

const freeBooks = [
  { id:'month', num:'01', tag:'EBOOK ORIGINAL · 12 PÁGINAS', title:'Tu primer mes de movimiento', subtitle:'Cuatro semanas, sesiones reales, progresión y registro.', href:'/downloads/sebastian-bayona/tu-primer-mes-de-movimiento.pdf', tone:'dark', featured:true },
  { id:'everyday', num:'02', tag:'EBOOK ORIGINAL · 8 PÁGINAS', title:'Moverte cada día', subtitle:'Principios sencillos y una forma sostenible de empezar.', href:'/downloads/sebastian-bayona/moverte-cada-dia.pdf', tone:'clay', featured:true },
  { id:'first', num:'03', tag:'GUÍA GRATUITA', title:'Tu primera semana', subtitle:'Organiza tus siete primeros días con intención.', href:'/downloads/bayona-editorial/primera-semana.pdf', tone:'paper', featured:false },
  { id:'tracker', num:'04', tag:'CUADERNO GRATUITO', title:'Registro de 30 días', subtitle:'Una herramienta para observar tu avance.', href:'/downloads/bayona-editorial/registro-30-dias.pdf', tone:'paper', featured:false },
  { id:'start', num:'05', tag:'DOSSIER GRATUITO', title:'Tu punto de partida', subtitle:'Preguntas para entender tus prioridades.', href:'/downloads/bayona-editorial/dossier-punto-de-partida.pdf', tone:'paper', featured:false },
]

const jumpLinks = [
  { label:'Regalos', href:'#regalos-gratis' },
  { label:'Plan de 30 días', href:'#plan-30-dias' },
  { label:'Aprende hoy', href:'#primeras-lecciones' },
  { label:'Todo el universo', href:'#ruta-completa' },
  { label:'Preguntas', href:'#preguntas-inicio' },
  { label:'Agenda', href:'#agenda' },
]

const goalOptions = [
  { id:'strength',label:'Ganar fuerza y condición' },
  { id:'mobility',label:'Moverme con más soltura' },
  { id:'fitness',label:'Recuperar el hábito' },
  { id:'parkour',label:'Iniciarme en parkour' },
]
const equipmentOptions = [
  { id:'none',label:'Sin material / en casa' },
  { id:'bands',label:'Bandas y material ligero' },
  { id:'gym',label:'Gimnasio' },
]
const weekProgression = [
  { title:'Empezar con control', focus:'Aprende la técnica y descubre una intensidad cómoda.', effort:'5-6/10', sets:2, note:'Si eres principiante absoluto, empieza con una serie por patrón y añade otra cuando estés cómodo.' },
  { title:'Consolidar el hábito', focus:'Repite los patrones. Añade una repetición si hay buena técnica.', effort:'5-6/10', sets:2, note:'La regularidad importa más que hacer cada sesión más exigente.' },
  { title:'Progresar sin prisa', focus:'Solo si te recuperas bien, considera una serie extra en uno o dos ejercicios.', effort:'6-7/10', sets:3, note:'No incrementes carga, series y dificultad al mismo tiempo.' },
  { title:'Integrar y evaluar', focus:'Mantén un trabajo cómodo y revisa qué te ha servido.', effort:'5-6/10', sets:2, note:'Termina el mes con recursos para continuar, no agotado.' },
]

const routines = {
  strength: {
    none:['Sentarte y levantarte de una silla','Flexión de pared','Bisagra de cadera sin peso','Retracción escapular contra pared','Bird-dog con apoyo'],
    bands:['Sentadilla con banda o silla','Empuje con banda ligera','Remo con banda con apoyo estable','Bisagra de cadera controlada','Antirrotación con banda'],
    gym:['Prensa o sentadilla ligera','Press de pecho en máquina','Remo sentado en polea','Bisagra con mancuerna ligera','Pallof en polea'],
  },
  mobility: {
    none:['Sentarse y levantarse sin prisa','Movilidad torácica suave','Elevación de talones con apoyo','Equilibrio junto a pared','Movilidad de cadera sin dolor'],
    bands:['Sentarse y levantarse','Remo con banda ligero','Rotaciones suaves de hombro','Equilibrio con apoyo','Movilidad de cadera con ayuda'],
    gym:['Prensa ligera controlada','Remo sentado ligero','Movilidad de hombros','Marcha en cinta suave','Estabilidad con apoyo'],
  },
  fitness: {
    none:['Sentarse y levantarse','Flexión contra pared','Marcha en el sitio','Bisagra de cadera','Estabilidad en cuadrupedia'],
    bands:['Sentadilla con banda','Remo con banda','Marcha activa cómoda','Empuje con banda ligera','Estabilidad de tronco'],
    gym:['Prensa ligera','Remo en polea','Bicicleta suave','Press máquina ligero','Estabilidad de tronco'],
  },
  parkour: {
    none:['Balance sobre línea en el suelo','Apoyo suave de manos sobre pared','Sentadilla y control de tobillo','Precisión de pasos sin salto','Equilibrio en suelo junto a un apoyo'],
    bands:['Balance sobre línea en el suelo','Remo con banda','Sentadilla controlada','Precisión de pasos sin salto','Estabilidad de tobillo y cadera'],
    gym:['Balance sobre línea en el suelo','Remo ligero','Sentadilla controlada','Antirrotación de tronco','Precisión de pasos sin salto'],
  },
}
const mobilitySeries = [
  'Marcha cómoda y respiración tranquila',
  'Movilidad suave de hombros y columna',
  'Rotaciones cómodas de cadera',
  'Equilibrio con pared o silla',
  'Caminar despacio y registrar sensaciones',
]
const schedules = {
  2:[{day:'Lunes',type:'A'},{day:'Jueves',type:'B'}],
  3:[{day:'Lunes',type:'A'},{day:'Miércoles',type:'B'},{day:'Sábado',type:'C'}],
  4:[{day:'Lunes',type:'A'},{day:'Martes',type:'M'},{day:'Jueves',type:'B'},{day:'Sábado',type:'C'}],
  5:[{day:'Lunes',type:'A'},{day:'Martes',type:'M'},{day:'Jueves',type:'B'},{day:'Viernes',type:'M'},{day:'Sábado',type:'C'}],
}
const sessionNames = { A:'Fuerza y control',B:'Técnica y estabilidad',C:'Capacidad y movimiento',M:'Movilidad suave' }
function getExercises(goal, equipment, type, minutes) {
  if (type === 'M') return mobilitySeries.slice(0, minutes === 20 ? 3 : 5)
  const pool = routines[goal][equipment]
  const rotation = type === 'B' ? [2,3,0,4,1] : type === 'C' ? [4,0,2,1,3] : [0,1,2,3,4]
  return rotation.slice(0, minutes === 20 ? 3 : minutes === 35 ? 4 : 5).map(i=>pool[i])
}
function deriveWeek(answers, index) {
  const progression=weekProgression[index]
  const days=schedules[Number(answers.days)]
  return {
    ...progression,
    number:index+1,
    days:days.map((day,i)=>({
      ...day,
      id:index+'-'+i,
      title:sessionNames[day.type],
      moves:getExercises(answers.goal,answers.equipment,day.type,Number(answers.minutes)),
      sets:day.type==='M'?0:answers.level==='new' ? (index===0?1:2) : progression.sets,
      repetitions:day.type==='M'?'30-60 s por gesto':'6-12 repeticiones o 20-40 s en equilibrio/marcha',
    })),
  }
}
function buildPlanText(answers, weeks) {
  const goal=goalOptions.find(o=>o.id===answers.goal)?.label || ''
  const gear=equipmentOptions.find(o=>o.id===answers.equipment)?.label || ''
  const lines=[
    'SEBASTIAN BAYONA / TU PRIMER MES',
    'PLAN ORIENTATIVO BASADO EN TUS ELECCIONES',
    '',
    'OBJETIVO: '+goal,
    'EXPERIENCIA: '+(answers.level==='new'?'Empezar o retomar':'Ya tengo experiencia'),
    'MATERIAL: '+gear,
    'SESIONES POR SEMANA: '+answers.days,
    'MINUTOS POR SESIÓN: '+answers.minutes,
    '',
    'ANTES DE EMPEZAR: programa orientativo para adultos sanos. No es una evaluación ni prescripción clínica.',
    'Calienta 4-7 min, mantén esfuerzo controlable, descansa 60-120 s y para ante dolor o síntomas inusuales.',
  ]
  weeks.forEach(w=>{
    lines.push('','SEMANA '+w.number+': '+w.title,'Enfoque: '+w.focus,'Esfuerzo orientativo: '+w.effort)
    w.days.forEach(d=>{
      lines.push('  '+d.day+' - '+d.title)
      d.moves.forEach(m=>lines.push('    • '+m))
      lines.push('    '+(d.type==='M'?'Sin forzar amplitud ni provocar dolor':d.sets+' serie(s) por ejercicio · '+d.repetitions))
    })
    lines.push('  Recuperación el resto de días: paseo suave, movilidad cómoda o descanso.','  '+w.note)
  })
  lines.push('','DÍAS 29 Y 30: revisa tu constancia, sensaciones y prioridades. Decide tu siguiente paso.','',
    'No saltes desde alturas ni hagas acrobacias de parkour sin supervisión. Ante lesión, dolor o enfermedades relevantes, pide asesoramiento profesional.',
    'Orientación y revisión individual: https://wa.me/34641698332')
  return lines.join('\n')
}

function trackedDownload(id) { trackEvent('studio_home_free_download',{resource:id}) }
export function LandingQuickNav() {
  return (
    <nav className="lv-index" aria-label="Ir directamente a un apartado de la portada">
      <div className="lv-container lv-index__inner">
        <span className="lv-index__intro">ELIGE POR DÓNDE EMPEZAR <ArrowDown size={15} aria-hidden="true" /></span>
        <div className="lv-index__links">
          {jumpLinks.map(x=><a key={x.href} href={x.href} onClick={()=>trackEvent('studio_home_jump',{target:x.href})}>{x.label}</a>)}
        </div>
      </div>
    </nav>
  )
}
export function LandingFreeLibrary() {
  return (
    <section className="lv-free" id="regalos-gratis" aria-labelledby="lv-free-title">
      <div className="lv-container">
        <div className="lv-section-top"><span>01 / RECURSOS QUE PUEDES USAR HOY</span><span>100 % GRATIS · SIN EMAIL · SIN CUENTA</span></div>
        <div className="lv-free__intro">
          <div>
            <p className="lv-kicker">PRIMERO TE DOY VALOR</p>
            <h2 id="lv-free-title">NO EMPIECES<br/>COMPRANDO.<br/><em>EMPIEZA MOVIÉNDOTE.</em></h2>
          </div>
          <div className="lv-free__intro-text">
            <p>Antes de ofrecerte una sesión, quiero ayudarte a hacer algo útil. Descarga los libros, explora tu punto de partida o construye tu primer mes de entrenamiento.</p>
            <a href="#plan-30-dias" className="lv-text-link">QUIERO MI PLAN DE 30 DÍAS <ArrowUpRight size={18} aria-hidden="true"/></a>
          </div>
        </div>
        <div className="lv-books">
          {freeBooks.filter(x=>x.featured).map(book=>(
            <article key={book.id} className={'lv-book lv-book--'+book.tone}>
              <div className="lv-book__spine" aria-hidden="true"><span>SB.</span><span>EDICIÓN 2026</span></div>
              <div className="lv-book__content">
                <p>{book.tag}</p>
                <span className="lv-book__num">{book.num} / 05</span>
                <h3>{book.title}</h3>
                <span className="lv-book__caption">{book.subtitle}</span>
                <a href={book.href} download className="lv-book__cta" onClick={()=>trackedDownload(book.id)}>DESCARGAR EBOOK <FileDown size={19} aria-hidden="true"/></a>
              </div>
            </article>
          ))}
        </div>
        <div className="lv-free__extras">
          <div className="lv-free__extras-title"><span>MÁS RECURSOS PARA EMPEZAR</span><span>PDF SIN REGISTRO</span></div>
          {freeBooks.filter(x=>!x.featured).map(book=>(
            <a href={book.href} download className="lv-free__extra" key={book.id} onClick={()=>trackedDownload(book.id)}>
              <span>{book.num}</span><div><strong>{book.title}</strong><small>{book.subtitle}</small></div><span className="lv-free__extra-action">ABRIR PDF <Download size={17} aria-hidden="true"/></span>
            </a>
          ))}
        </div>
        <p className="lv-free__note"><ShieldCheck size={18} aria-hidden="true"/> Los documentos son educativos. No sustituyen la valoración de un profesional sanitario ni una prescripción individual cuando esta es necesaria.</p>
      </div>
    </section>
  )
}

export function LandingMonthBuilder() {
  const [answers,setAnswers]=useState({goal:'strength',level:'new',equipment:'none',days:'3',minutes:'35'})
  const [generated,setGenerated]=useState(false)
  const [selectedWeek,setSelectedWeek]=useState(0)
  const outputRef=useRef(null)
  const weeks=useMemo(()=>weekProgression.map((_,index)=>deriveWeek(answers,index)),[answers])
  const planText=useMemo(()=>buildPlanText(answers,weeks),[answers,weeks])
  const update=(key,value)=>{
    setAnswers(current=>({...current,[key]:value}))
    setSelectedWeek(0)
  }
  const generate=()=>{
    setGenerated(true)
    trackEvent('studio_home_plan_generated',{})
    window.requestAnimationFrame(()=>outputRef.current?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}))
  }
  const onWeekKeyDown=(event,index)=>{
    const keys=['ArrowRight','ArrowLeft','Home','End']
    if(!keys.includes(event.key))return
    event.preventDefault()
    const next=event.key==='Home'?0:event.key==='End'?weeks.length-1:(index+(event.key==='ArrowRight'?1:-1)+weeks.length)%weeks.length
    setSelectedWeek(next)
    document.getElementById('lv-week-tab-'+next)?.focus()
  }
  const download=()=>{
    const blob=new Blob(['\ufeff'+planText],{type:'text/plain;charset=utf-8'})
    const url=URL.createObjectURL(blob)
    const link=document.createElement('a')
    link.href=url;link.download='SEBASTIAN-BAYONA-mi-primer-mes.txt'
    document.body.appendChild(link);link.click();link.remove()
    window.setTimeout(()=>URL.revokeObjectURL(url),1200)
    trackEvent('studio_home_plan_download',{format:'txt'})
  }
  const contactMessage='Hola Sebastián. Preparé un borrador de mi primer mes en la web. Objetivo: '+(goalOptions.find(x=>x.id===answers.goal)?.label||answers.goal)+'. Nivel: '+(answers.level==='new'?'principiante':'con experiencia')+'. Material: '+(equipmentOptions.find(x=>x.id===answers.equipment)?.label||answers.equipment)+'. Disponibilidad: '+answers.days+' días/semana, '+answers.minutes+' minutos. Me gustaría una revisión profesional y conocer las opciones para entrenar contigo.'
  return (
    <section className="lv-plan" id="plan-30-dias" aria-labelledby="lv-plan-title">
      <div className="lv-container">
        <div className="lv-section-top lv-section-top--dark"><span>02 / TU PRIMER MES</span><span>UNA HERRAMIENTA PARA EMPEZAR</span></div>
        <div className="lv-plan__intro">
          <div><p className="lv-kicker">PREPARA UN PLAN INICIAL EN MENOS DE UN MINUTO</p><h2 id="lv-plan-title">30 DÍAS.<br/><em>TU PUNTO DE PARTIDA.</em></h2></div>
          <p>Responde cinco preguntas sencillas. Verás un borrador gratuito de cuatro semanas, adaptado a tus preferencias. Sin registro, sin pagar y sin compartir tus respuestas con nadie.</p>
        </div>
        <div className="lv-plan__layout">
          <div className="lv-plan__questionnaire">
            <div className="lv-plan__form-head"><span>CONFIGURA TU MES</span><span>5 DECISIONES · 0 €</span></div>
            <div className="lv-plan__field">
              <label htmlFor="lv-goal"><b>01</b> ¿Qué quieres conseguir?</label>
              <select id="lv-goal" value={answers.goal} onChange={e=>update('goal',e.target.value)}>{goalOptions.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select>
            </div>
            <div className="lv-plan__field">
              <label htmlFor="lv-level"><b>02</b> ¿Desde dónde empiezas?</label>
              <select id="lv-level" value={answers.level} onChange={e=>update('level',e.target.value)}>
                <option value="new">Estoy empezando o retomando</option>
                <option value="regular">Entreno con cierta regularidad</option>
              </select>
            </div>
            <div className="lv-plan__field">
              <label htmlFor="lv-equipment"><b>03</b> ¿Con qué cuentas?</label>
              <select id="lv-equipment" value={answers.equipment} onChange={e=>update('equipment',e.target.value)}>{equipmentOptions.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select>
            </div>
            <div className="lv-plan__field">
              <label htmlFor="lv-days"><b>04</b> ¿Cuántos días puedes dedicarle?</label>
              <select id="lv-days" value={answers.days} onChange={e=>update('days',e.target.value)}>
                <option value="2">2 días por semana</option><option value="3">3 días por semana</option><option value="4">4 días por semana</option><option value="5">5 días por semana, incluidos días suaves</option>
              </select>
            </div>
            <div className="lv-plan__field">
              <label htmlFor="lv-minutes"><b>05</b> ¿Cuánto tiempo tienes por sesión?</label>
              <select id="lv-minutes" value={answers.minutes} onChange={e=>update('minutes',e.target.value)}>
                <option value="20">20 minutos</option><option value="35">35 minutos</option><option value="50">50 minutos</option>
              </select>
            </div>
            <button className="lv-plan__generate" onClick={generate} type="button">CREAR MI PLAN GRATUITO <ArrowUpRight size={20} aria-hidden="true"/></button>
            <p className="lv-plan__privacy"><ShieldCheck size={16} aria-hidden="true"/> Tus elecciones se procesan aquí mismo, en tu navegador. No te pedimos datos personales ni diagnósticos.</p>
          </div>
          <div className="lv-plan__preview" aria-label="Qué recibirás con tu primer mes">
            <div className="lv-plan__preview-label">EL MÉTODO / PRIMEROS 30 DÍAS</div>
            <div className="lv-plan__circle" aria-hidden="true"><span>04</span><small>SEMANAS</small></div>
            <h3>UN CAMINO<br/><em>QUE SÍ PUEDES SEGUIR.</em></h3>
            <p>Un plan para empezar no debería agotarte antes de la segunda semana. Primero construimos consistencia. Después exploramos una progresión razonable.</p>
            <div className="lv-plan__timeline">
              {weekProgression.map((week,i)=><div key={week.title}><span>0{i+1}</span><strong>{week.title}</strong></div>)}
            </div>
            <div className="lv-plan__preview-foot"><Timer size={17} aria-hidden="true"/><span>ELIGE 20, 35 O 50 MINUTOS. TÚ DECIDES.</span></div>
          </div>
        </div>
        {generated ? (
          <div className="lv-plan-output" ref={outputRef} id="lv-mi-plan" aria-live="polite" aria-label="Tu borrador de entrenamiento">
            <div className="lv-plan-output__head">
              <div><p className="lv-kicker">TU PLAN HA SIDO CREADO</p><h3>Tu primer mes, <em>organizado.</em></h3><p>{answers.days} días por semana · {answers.minutes} minutos · {equipmentOptions.find(x=>x.id===answers.equipment)?.label}.</p></div>
              <div className="lv-plan-output__tools">
                <button type="button" onClick={download}><Download size={17} aria-hidden="true"/> GUARDAR PLAN</button>
                <button type="button" onClick={()=>{trackEvent('studio_home_plan_print',{});window.print()}}><Printer size={17} aria-hidden="true"/> IMPRIMIR / PDF</button>
              </div>
            </div>
            <div className="lv-plan-output__tabs" role="tablist" aria-label="Elegir semana del plan">
              {weeks.map((w,i)=><button key={w.number} id={'lv-week-tab-'+i} type="button" role="tab" tabIndex={selectedWeek===i?0:-1} aria-controls={'lv-week-'+i} aria-selected={selectedWeek===i} onKeyDown={e=>onWeekKeyDown(e,i)} onClick={()=>setSelectedWeek(i)}>SEMANA 0{w.number}</button>)}
            </div>
            <div className="lv-plan-output__weeks">
              {weeks.map((week,i)=>(
                <div key={week.number} id={'lv-week-'+i} className={'lv-week-panel'+(selectedWeek===i?' is-active':'')} role="tabpanel" aria-labelledby={'lv-week-tab-'+i} hidden={selectedWeek!==i}>
                  <div className="lv-week-panel__intro">
                    <div><span>SEMANA 0{week.number}</span><h4>{week.title}</h4><p>{week.focus}</p></div>
                    <div className="lv-week-panel__effort">ESFUERZO <strong>{week.effort}</strong><small>ORIENTATIVO</small></div>
                  </div>
                  <div className="lv-week-panel__sessions">
                    {week.days.map(day=>(
                      <article className="lv-week-panel__session" key={day.id}>
                        <header><span>{day.day}</span><strong>{day.title}</strong></header>
                        <ul>{day.moves.map(move=><li key={move}>{move}</li>)}</ul>
                        <p>{day.type==='M'?'Duración breve · sin forzar amplitud':day.sets+' serie(s) por ejercicio · '+day.repetitions+' · descanso 60-120 segundos según lo necesites.'}</p>
                      </article>
                    ))}
                  </div>
                  <p className="lv-week-panel__footnote">{week.note} El resto de días pueden dedicarse a descanso, caminata fácil o movilidad cómoda.</p>
                </div>
              ))}
            </div>
            <div className="lv-plan-output__finish"><strong>DÍAS 29 Y 30 — REVISIÓN</strong><span>Observa qué pudiste sostener, qué mejoró y qué necesitas adaptar para tu siguiente mes.</span></div>
            <div className="lv-plan-output__bottom">
              <div><h4>¿Quieres convertir este borrador en un plan verdaderamente individual?</h4><p>Para eso necesito conocer tu historia y tu forma de moverte. Solicita una revisión antes de tomarlo como prescripción personal.</p></div>
              <a href={bookingLink(contactMessage)} target="_blank" rel="noreferrer" onClick={()=>trackEvent('studio_home_plan_review',{})}>SOLICITAR REVISIÓN CON SEBASTIÁN <ArrowUpRight size={18} aria-hidden="true"/></a>
            </div>
            <p className="lv-plan-output__safety">Programa educativo general para adultos sin contraindicaciones conocidas. Ante dolor, lesión, síntomas relevantes o enfermedad, busca asesoramiento adecuado. Para parkour, evita saltos de altura o acrobacias sin supervisión. <Link to="/movimiento-adaptado">Conoce las opciones de movimiento adaptado.</Link></p>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export function LandingMicroLessons() {
  const lessons = [
    {num:'01',title:'Tu fuerza empieza por un patrón.',text:'Aprende a sentarte y levantarte con control. Si necesitas ayuda, utiliza una superficie estable y reduce el recorrido.',example:'Prueba 5 repeticiones cómodas, sin buscar agotarte.',symbol:'S'},
    {num:'02',title:'La movilidad no consiste en forzar.',text:'Explora rangos que puedes controlar, con respiración tranquila y sin dolor. Los movimientos suaves también cuentan.',example:'Haz 2 minutos de hombros, cadera y marcha suave.',symbol:'M'},
    {num:'03',title:'Progresar no es hacer más de todo.',text:'Cuando dominas una tarea, ajusta solo una variable: repeticiones, tiempo, apoyo o dificultad.',example:'Si hoy haces 2 × 8 con control, prueba 2 × 9 otro día.',symbol:'P'},
  ]
  return (
    <section className="lv-lessons" id="primeras-lecciones" aria-labelledby="lv-lessons-title">
      <div className="lv-container">
        <div className="lv-section-top"><span>03 / APRENDE ALGO ÚTIL AHORA</span><span>3 IDEAS · SIN TECNICISMOS INNECESARIOS</span></div>
        <div className="lv-lessons__intro"><p className="lv-kicker">CIENCIA APLICADA AL DÍA A DÍA</p><h2 id="lv-lessons-title">NO NECESITAS SABERLO TODO.<br/><em>NECESITAS UN BUEN COMIENZO.</em></h2><p>El entrenamiento tiene muchas disciplinas detrás. Aquí las convertimos en decisiones que puedes aplicar hoy.</p></div>
        <div className="lv-lessons__grid">
          {lessons.map(lesson=><article className="lv-lessons__item" key={lesson.num}>
            <div className="lv-lessons__item-top"><span>{lesson.num} / LECCIÓN</span><span>{lesson.symbol}</span></div>
            <h3>{lesson.title}</h3><p>{lesson.text}</p><div className="lv-lessons__try"><strong>PONLO EN PRÁCTICA</strong><p>{lesson.example}</p></div>
          </article>)}
        </div>
        <div className="lv-lessons__aside"><BookOpen size={23} aria-hidden="true"/><p>Estos principios son orientativos. El entrenamiento de fuerza progresivo y flexible tiene respaldo científico, pero el mejor punto de partida depende del contexto de cada persona.</p><a href="https://doi.org/10.1249/MSS.0000000000003897" target="_blank" rel="noreferrer">CONSULTAR REFERENCIA ACSM 2026 <ArrowUpRight size={17} aria-hidden="true"/></a></div>
      </div>
    </section>
  )
}
