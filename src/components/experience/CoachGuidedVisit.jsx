import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowDown, ArrowRight, ArrowUpRight, Check, RotateCcw, ShieldCheck, Volume2, VolumeX, X } from 'lucide-react'
import { whatsAppLink } from '../../config/site.config.js'
import { COACH_VISIT_STEPS, coachAnswerLabel, suggestCoachPlan } from '../../data/coachVisit.js'
import { getJourneyGoal } from '../../data/journeyGoals.js'
import { useJourneyExperience } from './JourneyExperienceContext.jsx'
import '../../styles/coach-guided-visit.css'

function CoachResult({answers,name,restart}){
  const {plan,reasons,requiresConversation,goalService}=suggestCoachPlan(answers)
  const goal=getJourneyGoal(answers.objetivo)
  const summary=COACH_VISIT_STEPS.slice(0,-1).filter(stage=>stage.id!=='nombre'&&stage.id!=='criterio').map(stage=>({
    title:stage.label,value:coachAnswerLabel(stage.id,answers[stage.id]),
  }))
  const message=[
    'Hola, Sebastián. Quiero consultar una propuesta de BAYONA.',
    name.trim()?'Me llamo '+name.trim()+'.':'Prefiero no compartir mi nombre por ahora.',
    'Mi objetivo: '+(goal?.label||'por definir')+'.',
    ...summary.filter(item=>item.title!=='TU OBJETIVO').map(item=>item.title+': '+item.value+'.'),
    'Plan preliminar: '+plan.name+' ('+plan.priceDisplay+' '+plan.currency+').',
    requiresConversation?'Prefiero hablar antes de entrenar.':'',
    'Me gustaría confirmar prestaciones, disponibilidad y condiciones.',
  ].filter(Boolean).join('\n')
  return <div className="bayona-coach__result" data-testid="coach-result">
    <div className="bayona-coach__result-lead">
      <span className="bayona-coach__result-index">PROPUESTA PARA {name.trim()||'TI'}</span>
      <h3>{plan.name}</h3>
      <strong>{plan.priceDisplay} <small>{plan.currency} / mes</small></strong>
      <p>{plan.shortDescription}</p>
    </div>
    <div className="bayona-coach__reasons">
      <span>SERVICIO PARA EXPLORAR</span>
      <p><Check size={17} aria-hidden="true"/><strong>{goalService}</strong></p>
      {reasons.slice(0,2).map(reason=><p key={reason}><Check size={17} aria-hidden="true"/>{reason}</p>)}
      {requiresConversation&&<p><ShieldCheck size={17} aria-hidden="true"/>Hablemos antes de elegir el servicio.</p>}
    </div>
    <p className="bayona-coach__result-disclaimer">La recomendación es orientativa. El plan no garantiza la inclusión del servicio indicado. Precio, alcance y disponibilidad deben confirmarse antes de contratar.</p>
    <div className="bayona-coach__contact">
      <p><ShieldCheck size={16} aria-hidden="true"/> Las respuestas solo están en esta visita. Al abrir WhatsApp podrás revisar el mensaje antes de enviarlo. Nada se ha enviado ni registrado automáticamente.</p>
      <a href={whatsAppLink(message)} target="_blank" rel="noopener noreferrer" className="bayona-coach__send">
        HABLAR CON SEBASTIÁN <ArrowUpRight size={19} aria-hidden="true"/>
      </a>
      <button className="bayona-coach__restart" type="button" onClick={restart}><RotateCcw size={15} aria-hidden="true"/> Empezar de nuevo</button>
    </div>
  </div>
}

export default function CoachGuidedVisit(){
  const {pathname}=useLocation()
  const navigate=useNavigate()
  const dialogRef=useRef(null)
  const gestureStart=useRef(null)
  const lastGesture=useRef(0)
  const [voiceEnabled,setVoiceEnabled]=useState(false)
  const [voiceAvailable,setVoiceAvailable]=useState(false)
  const [speaking,setSpeaking]=useState(false)
  const {coachOpen,coachStep,coachAnswers,coachName,closeCoach,moveCoach,answerCoach,nameCoach,clearCoach}=useJourneyExperience()
  const stage=COACH_VISIT_STEPS[coachStep]
  const isLast=coachStep===COACH_VISIT_STEPS.length-1
  const selected=stage?.id==='nombre' ? !!coachAnswers.nombre : !!coachAnswers[stage?.id]
  const ready=stage?.id==='nombre' ? !!coachName.trim()||selected : selected
  const spokenName=coachName.trim()||'campeón'

  const changeStage=next=>{
    if(next<0||next>=COACH_VISIT_STEPS.length) return
    const item=COACH_VISIT_STEPS[next]
    lastGesture.current=Date.now()
    moveCoach(next)
    if(pathname!==item.path) navigate(item.path)
  }
  const advance=()=>{if(ready&&!isLast){if(stage.id==='nombre') handleNameContinue();changeStage(coachStep+1)}}
  const restart=()=>{clearCoach();setVoiceEnabled(false);if(pathname!=='/') navigate('/')}
  const handleNameContinue=()=>{
    const name=coachName.trim()
    answerCoach('nombre',name||'omitido')
  }
  useEffect(()=>{
    if(!coachOpen) return undefined
    document.documentElement.classList.add('bayona-coach-visit-active')
    const before=document.activeElement
    const onBrowserBack=()=>closeCoach()
    const onKeyDown=event=>{
      if(event.key==='Escape'){closeCoach();return}
      if(event.key==='ArrowDown'&&ready&&!isLast&&!event.repeat&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){
        event.preventDefault();advance();return
      }
      if(event.key!=='Tab')return
      const nodes=[...(dialogRef.current?.querySelectorAll('button:not([disabled]),a[href],input:not([disabled])')||[])].filter(node=>node.getBoundingClientRect().width>0)
      if(!nodes.length)return
      const first=nodes[0],last=nodes.at(-1)
      if(event.shiftKey&&(document.activeElement===first||!dialogRef.current?.contains(document.activeElement))){event.preventDefault();last.focus()}
      else if(!event.shiftKey&&(document.activeElement===last||!dialogRef.current?.contains(document.activeElement))){event.preventDefault();first.focus()}
    }
    window.addEventListener('popstate',onBrowserBack)
    window.addEventListener('keydown',onKeyDown)
    return ()=>{
      document.documentElement.classList.remove('bayona-coach-visit-active')
      window.removeEventListener('popstate',onBrowserBack)
      window.removeEventListener('keydown',onKeyDown)
      window.speechSynthesis?.cancel()
      if(before?.isConnected)before.focus({preventScroll:true})
    }
  },[coachOpen,closeCoach,ready,coachStep,isLast])

  useEffect(()=>{
    setVoiceAvailable(typeof window!=='undefined'&&'speechSynthesis' in window&&'SpeechSynthesisUtterance' in window)
  },[])
  useEffect(()=>{
    if(!coachOpen||!stage||!voiceEnabled||!voiceAvailable)return undefined
    const prefix=stage.id==='nombre'?'Bienvenido a BAYONA. Soy el asistente automático de Sebastián.':coachStep>1?spokenName+',':''
    const utterance=new window.SpeechSynthesisUtterance([prefix,stage.title,stage.line].filter(Boolean).join(' '))
    utterance.lang='es-ES'
    utterance.rate=.97
    utterance.pitch=.94
    utterance.onstart=()=>setSpeaking(true)
    utterance.onend=()=>setSpeaking(false)
    utterance.onerror=()=>setSpeaking(false)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
    return ()=>{window.speechSynthesis.cancel();setSpeaking(false)}
  },[coachOpen,coachStep,stage,voiceEnabled,voiceAvailable])

  useEffect(()=>{
    if(!coachOpen||!stage)return undefined
    dialogRef.current?.querySelector('.bayona-coach__title')?.focus({preventScroll:true})
    if(pathname!==stage.path)return undefined
    const scroll=()=>{
      const target=document.getElementById(stage.anchor)
      if(target)target.scrollIntoView({block:'start',behavior:'instant'})
    }
    const t=setTimeout(scroll,500),retry=setTimeout(scroll,1000)
    return ()=>{clearTimeout(t);clearTimeout(retry)}
  },[coachOpen,coachStep,pathname,stage])

  if(!coachOpen||!stage)return null

  const wheel=event=>{
    if(event.ctrlKey)return
    // En el modo guiado el deslizamiento solo desbloquea el siguiente capítulo después de contestar.
    if(event.deltaY>24&&ready&&!isLast&&Date.now()-lastGesture.current>850){
      event.preventDefault();advance()
    }else if(event.deltaY>0&&!ready){event.preventDefault()}
  }
  const touchStart=event=>{gestureStart.current={y:event.touches[0]?.clientY,time:Date.now()}}
  const touchEnd=event=>{
    const initial=gestureStart.current
    if(!initial||!ready||isLast)return
    const distance=initial.y-event.changedTouches[0]?.clientY
    if(distance>75&&Date.now()-initial.time<1200&&Date.now()-lastGesture.current>850)advance()
  }
  const voiceToggle=()=>{
    if(voiceEnabled){window.speechSynthesis?.cancel();setSpeaking(false)}
    setVoiceEnabled(!voiceEnabled)
  }

  return <div className="bayona-coach__overlay bayona-coach__overlay--conversation"
    data-testid="guided-coach-overlay" onWheel={wheel} onTouchStart={touchStart} onTouchEnd={touchEnd}>
    <div className="bayona-coach__shade" aria-hidden="true"/>
    <aside className="bayona-coach__world" aria-hidden="true">
      <span>BIENVENIDO A</span><strong>BAYONA.</strong>
      <p>NO ES UNA WEB MÁS.<br/>ES TU PUNTO DE PARTIDA.</p>
      <div className="bayona-coach__world-progress">{coachStep+1} / {COACH_VISIT_STEPS.length} · {stage.label}</div>
    </aside>
    <section role="dialog" aria-modal="true" aria-labelledby="bayona-coach-heading" aria-describedby="bayona-coach-intro"
      className="bayona-coach bayona-coach--chat" ref={dialogRef}>
      <div className="bayona-coach__top">
        <div className={'bayona-coach__portrait'+(speaking?' is-speaking':'')}>
          <img src="/images/testimonials/sebastian-atleta-960.jpg" alt="Entrenamiento BAYONA" loading="eager"/>
          <span className="bayona-coach__portrait-mark">B</span>
        </div>
        <div><strong>SEBASTIÁN · BAYONA</strong><small>ASISTENTE DIGITAL · GUÍA AUTOMATIZADA</small></div>
        {voiceAvailable&&<button type="button" onClick={voiceToggle} className="bayona-coach__voice"
          aria-label={voiceEnabled?'Desactivar voz sintética':'Activar voz sintética'} aria-pressed={voiceEnabled}
          title="Voz automática del navegador, no una grabación de Sebastián">
          {voiceEnabled?<Volume2 size={19}/>:<VolumeX size={19}/>}
        </button>}
        <button type="button" className="bayona-coach__exit" onClick={closeCoach} aria-label="Salir de la visita guiada"><X size={21}/></button>
      </div>
      <div className="bayona-coach__progress" aria-label={'Etapa '+(coachStep+1)+' de '+COACH_VISIT_STEPS.length}>
        <span style={{width:(coachStep+1)*100/COACH_VISIT_STEPS.length+'%'}}/>
      </div>
      <div className="bayona-coach__content">
        <div className="bayona-coach__eyebrow">
          <span className="bayona-coach__speaking-dots"><i/><i/><i/></span>
          <span>{stage.label}</span><span>{String(coachStep+1).padStart(2,'0')} / {String(COACH_VISIT_STEPS.length).padStart(2,'0')}</span>
        </div>
        <div className="bayona-coach__bubble">
          {stage.id!=='nombre'&&coachName.trim()&&<small>{spokenName.toUpperCase()},</small>}
          <h2 id="bayona-coach-heading" className="bayona-coach__title" tabIndex={-1}>{stage.title}</h2>
          <p id="bayona-coach-intro" className="bayona-coach__description">{stage.line}</p>
        </div>
        {isLast
          ? <CoachResult answers={coachAnswers} name={coachName} restart={restart}/>
          : stage.type==='name'
            ? <div className="bayona-coach__name-step">
                <label htmlFor="bayona-coach-firstname">TU NOMBRE <span>solo para esta visita</span></label>
                <input id="bayona-coach-firstname" value={coachName} onChange={event=>nameCoach(event.target.value)}
                  maxLength={70} autoComplete="given-name" placeholder="Escribe cómo te llamas" onKeyDown={event=>{if(event.key==='Enter'){handleNameContinue();event.preventDefault()}}}/>
                <button type="button" onClick={()=>{nameCoach('');answerCoach('nombre','omitido')}} aria-pressed={coachAnswers.nombre==='omitido'}
                  className="bayona-coach__anonymous">Prefiero seguir sin decirlo</button>
              </div>
            : <div className="bayona-coach__choices" role="group" aria-label={stage.title}>
                {stage.options.map(option=><button type="button" key={option.value}
                  className={coachAnswers[stage.id]===option.value?'is-chosen':''}
                  aria-pressed={coachAnswers[stage.id]===option.value}
                  onClick={()=>answerCoach(stage.id,option.value)}>
                  <span className="bayona-coach__choice-indicator">{coachAnswers[stage.id]===option.value?<Check size={16}/>:null}</span>
                  {option.label}
                </button>)}
              </div>
        }
      </div>
      <div className="bayona-coach__bottom">
        <button type="button" className="bayona-coach__back" onClick={()=>coachStep?changeStage(coachStep-1):closeCoach()}>
          <ArrowLeft size={17}/> {coachStep?'VOLVER':'SALIR'}
        </button>
        {!isLast&&<button type="button" className="bayona-coach__next"
          disabled={!ready}
          onClick={advance}>
          SIGUIENTE <ArrowRight size={18}/>
        </button>}
        {isLast&&<button type="button" className="bayona-coach__finish" onClick={closeCoach}>TERMINAR</button>}
      </div>
      <div className="bayona-coach__unlock" role="status">
        {!isLast?(stage.type==='name'?(coachName.trim()||selected?'LISTO · DESLIZA PARA AVANZAR':'TU NOMBRE ES OPCIONAL')
          :selected?'RESPUESTA GUARDADA SOLO AQUÍ · DESLIZA PARA AVANZAR':'ELIGE UNA RESPUESTA PARA DESBLOQUEAR EL DESLIZAMIENTO')
          :'TÚ DECIDES SI COMPARTES EL RESUMEN'}
        {!isLast&&<ArrowDown size={15} aria-hidden="true"/>}
      </div>
      <p className="bayona-coach__footer">Sin envío automático. Puedes salir cuando quieras. La voz, si se activa, es sintética.</p>
    </section>
  </div>
}
