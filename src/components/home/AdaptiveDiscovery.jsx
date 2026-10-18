import { useMemo, useState } from 'react'
import { ArrowRight, RotateCcw, ShieldCheck, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { bookingLink } from '../../config/site.config.js'
import {
  DISCOVERY_GOALS, DISCOVERY_CONTEXTS, DISCOVERY_FORMATS, contextNeedsReview,
} from '../../data/adaptedMovement.js'
import '../../styles/adapted-movement.css'

const STEPS = [
  { title:'¿Qué te gustaría conseguir?', kicker:'01 / TU OBJETIVO', choices:DISCOVERY_GOALS },
  { title:'¿Cómo es tu punto de partida?', kicker:'02 / TU CONTEXTO', choices:DISCOVERY_CONTEXTS },
  { title:'¿Cómo prefieres empezar?', kicker:'03 / TU RITMO', choices:DISCOVERY_FORMATS },
]

/** All answers stay in transient React memory. No analytics, cookies, URL
 * params, network requests or pre-filled contact payloads involving health. */
export default function AdaptiveDiscovery() {
  const [answers,setAnswers] = useState([null,null,null])
  const [stage,setStage] = useState(0)
  const completed = answers.every(Boolean)
  const safety = contextNeedsReview(answers[1])
  const labels = useMemo(()=>answers.map((choice,i)=>STEPS[i].choices.find(c=>c.id===choice)?.label||''),[answers])
  const select = id => {
    setAnswers(previous=>previous.map((answer,index)=>index===stage?id:answer))
    if(stage<STEPS.length-1)setStage(stage+1)
    else setStage(3)
  }
  const reset=()=>{setAnswers([null,null,null]);setStage(0)}
  const safeContact=bookingLink('Hola, me interesa conocer las opciones de entrenamiento adaptado de BAYONA. Quisiera conversar primero sobre el proceso de valoración, sin compartir datos médicos por este mensaje.')
  return (
    <section id="tu-ruta" className="bayona-discovery" aria-labelledby="bayona-discovery-title">
      <div className="bayona-discovery__frame gym-home-shell">
        <div className="bayona-discovery__intro">
          <span className="bayona-discovery__index">BAYONA / PERFIL INICIAL</span>
          <h2 id="bayona-discovery-title">TU HISTORIA CAMBIA <em>CÓMO ENTRENAMOS.</em></h2>
          <p>Un recorrido breve para descubrir qué tipo de acompañamiento podría encajar contigo. Puedes saltarlo y seguir explorando la web.</p>
          <Link to="/movimiento-adaptado" className="bayona-discovery__explore">EXPLORAR MOVIMIENTO ADAPTADO <ArrowRight size={18} aria-hidden="true"/></Link>
        </div>
        <div className="bayona-discovery__interactive">
          <div className="bayona-discovery__meta">
            <span>ORIENTACIÓN PERSONAL · OPCIONAL</span>
            <span>{completed ? '03 / 03' : String(Math.min(stage+1,3)).padStart(2,'0')+' / 03'}</span>
          </div>
          <div className="bayona-discovery__progress" aria-label="Progreso del recorrido">
            {STEPS.map((step,index)=><span key={step.kicker} className={index<=stage?'is-active':''}/>)}
          </div>
          {!completed ? (
            <>
              <span className="bayona-discovery__step-label">{STEPS[stage].kicker}</span>
              <h3>{STEPS[stage].title}</h3>
              <div className="bayona-discovery__choices" aria-label={STEPS[stage].title}>
                {STEPS[stage].choices.map(choice=>(
                  <button key={choice.id} type="button" className="bayona-discovery__choice" onClick={()=>select(choice.id)}>
                    <span>{choice.label}{choice.detail?<small>{choice.detail}</small>:null}</span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                ))}
              </div>
              <div className="bayona-discovery__controls">
                {stage>0?<button type="button" onClick={()=>setStage(stage-1)}>VOLVER AL PASO ANTERIOR</button>:<span>NO HACE FALTA CREAR UNA CUENTA</span>}
                <button type="button" onClick={reset}>REINICIAR</button>
              </div>
            </>
          ):(
            <div className="bayona-discovery__result" role="status" aria-live="polite">
              <span className="bayona-discovery__step-label"><Check size={15} aria-hidden="true"/> TU PUNTO DE PARTIDA</span>
              <h3>YA TENEMOS UNA PRIMERA ORIENTACIÓN.</h3>
              <dl>{labels.map((label,i)=><div key={i}><dt>{['OBJETIVO','CONTEXTO','FORMATO'][i]}</dt><dd>{label}</dd></div>)}</dl>
              {safety?<p className="bayona-discovery__caution">Para adaptar el entrenamiento a una condición de salud o lesión, conviene contar con la valoración y autorización de los profesionales sanitarios que correspondan. Esta orientación no determina tu aptitud médica.</p>:null}
              <div className="bayona-discovery__result-links">
                <Link to={safety?'/movimiento-adaptado':'/programs'}>VER OPCIONES PARA MÍ <ArrowRight size={18} aria-hidden="true"/></Link>
                <a href={safeContact} target="_blank" rel="noopener noreferrer">HABLAR ANTES DE EMPEZAR <ArrowRight size={18} aria-hidden="true"/></a>
              </div>
              <button type="button" className="bayona-discovery__reset" onClick={reset}><RotateCcw size={15} aria-hidden="true"/> BORRAR MIS RESPUESTAS</button>
            </div>
          )}
          <p className="bayona-discovery__privacy"><ShieldCheck size={18} aria-hidden="true"/> Tus elecciones solo se muestran en esta pantalla: no se guardan, no se envían y no se usan para diagnosticar. Al contactar, no se incluyen automáticamente tus respuestas.</p>
        </div>
      </div>
    </section>
  )
}
