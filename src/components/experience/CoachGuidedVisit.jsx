import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, Check, RotateCcw, ShieldCheck, Volume2, VolumeX, X } from 'lucide-react'
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
    <p className="bayona-coach__result-disclaimer">Propuesta orientativa. Consulta prestaciones, precio y disponibilidad antes de contratar.</p>
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
  const pending=useRef(false)
  const advanceTimer=useRef(null)
  const [voiceEnabled,setVoiceEnabled]=useState(false)
  const [voiceAvailable,setVoiceAvailable]=useState(false)
  const [speaking,setSpeaking]=useState(false)
  const {coachOpen,coachStep,coachAnswers,coachName,closeCoach,moveCoach,answerCoach,nameCoach,clearCoach}=useJourneyExperience()
  const stage=COACH_VISIT_STEPS[coachStep]
  const isLast=coachStep===COACH_VISIT_STEPS.length-1
  const spokenName=coachName.trim()||'campeón'

  const changeStage=next=>{
    if(next<0||next>=COACH_VISIT_STEPS.length)return
    pending.current=false
    const item=COACH_VISIT_STEPS[next]
    moveCoach(next)
    if(pathname!==item.path)navigate(item.path)
  }
  const chooseAnswer=value=>{
    if(pending.current || isLast)return
    pending.current=true
    answerCoach(stage.id,value)
    advanceTimer.current=window.setTimeout(()=>changeStage(coachStep+1),380)
  }
  const continueName=()=> {
    if(pending.current)return
    pending.current=true
    answerCoach('nombre',coachName.trim()||'omitido')
    advanceTimer.current=window.setTimeout(()=>changeStage(coachStep+1),350)
  }
  const restart=()=>{pending.current=false;clearCoach();setVoiceEnabled(false);if(pathname!=='/')navigate('/')}
  useEffect(()=>{
    if(!coachOpen) return undefined
    let frame=0
    let last=null
    const freeze=()=>{
      const current=window.lenis
      if(current!==last && typeof current?.stop==='function'){
        current.stop()
        last=current
      }
      frame=window.requestAnimationFrame(freeze)
    }
    freeze()
    return ()=>{
      window.cancelAnimationFrame(frame)
      if(advanceTimer.current)window.clearTimeout(advanceTimer.current)
      advanceTimer.current=null
      pending.current=false
      if(typeof window.lenis?.start==='function')window.lenis.start()
    }
  },[coachOpen])

  useEffect(()=>{
    if(!coachOpen || stage?.id!=='nombre'||!coachName.trim()||coachAnswers.nombre==='omitido'||pending.current)return undefined
    // The name remains editable; after a brief pause in typing the visit progresses automatically.
    const t=window.setTimeout(()=>continueName(),1850)
    return ()=>window.clearTimeout(t)
  },[coachName,coachOpen,stage?.id,coachAnswers.nombre])
  useEffect(()=>{
    if(!coachOpen) return undefined
    document.documentElement.classList.add('bayona-coach-visit-active')
    const before=document.activeElement
    const onBrowserBack=()=>closeCoach()
    const onWheel=event=>{
      // Never let unanswered users scroll underlying pages or the question panel.
      // Result stage remains independently scrollable for prices and disclosures.
      if(!isLast)event.preventDefault()
      else if(!dialogRef.current?.contains(event.target))event.preventDefault()
    }
    const onTouchMove=event=>{
      if(!isLast)event.preventDefault()
      else if(!dialogRef.current?.contains(event.target))event.preventDefault()
    }
    const onKeyDown=event=>{
      if(event.key==='Escape'){closeCoach();return}
      if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End'].includes(event.key) &&
        !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName) && !isLast){
        event.preventDefault()
      }
      if(event.key!=='Tab')return
      const nodes=[...(dialogRef.current?.querySelectorAll('button:not([disabled]),a[href],input:not([disabled])')||[])].filter(node=>node.getBoundingClientRect().width>0)
      if(!nodes.length)return
      const first=nodes[0],last=nodes.at(-1)
      if(event.shiftKey&&(document.activeElement===first||!dialogRef.current?.contains(document.activeElement))){event.preventDefault();last.focus()}
      else if(!event.shiftKey&&(document.activeElement===last||!dialogRef.current?.contains(document.activeElement))){event.preventDefault();first.focus()}
    }
    window.addEventListener('popstate',onBrowserBack)
    window.addEventListener('keydown',onKeyDown,true)
    window.addEventListener('wheel',onWheel,{capture:true,passive:false})
    window.addEventListener('touchmove',onTouchMove,{capture:true,passive:false})
    return ()=>{
      document.documentElement.classList.remove('bayona-coach-visit-active')
      window.removeEventListener('popstate',onBrowserBack)
      window.removeEventListener('keydown',onKeyDown,true)
      window.removeEventListener('wheel',onWheel,true)
      window.removeEventListener('touchmove',onTouchMove,true)
      window.speechSynthesis?.cancel()
      if(before?.isConnected)before.focus({preventScroll:true})
    }
  },[coachOpen,closeCoach,isLast])

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
    return undefined
  },[coachOpen,coachStep,stage])

  if(!coachOpen||!stage)return null

  const voiceToggle=()=>{
    if(voiceEnabled){window.speechSynthesis?.cancel();setSpeaking(false)}
    setVoiceEnabled(!voiceEnabled)
  }

  return createPortal(<div className="bayona-coach__overlay bayona-coach__overlay--conversation"
    data-testid="guided-coach-overlay">
    <div className="bayona-coach__shade" aria-hidden="true"/>
    <aside className="bayona-coach__world" aria-hidden="true">
      <span>UN NUEVO COMIENZO</span><strong>BAYONA.</strong>
      <div className="bayona-coach__world-progress">{String(coachStep+1).padStart(2,'0')} — {String(COACH_VISIT_STEPS.length).padStart(2,'0')}</div>
    </aside>
    <section role="dialog" aria-modal="true" aria-labelledby="bayona-coach-heading" aria-describedby="bayona-coach-intro"
      className="bayona-coach bayona-coach--chat" ref={dialogRef}>
      <div className="bayona-coach__top">
        <div className={'bayona-coach__portrait'+(speaking?' is-speaking':'')} aria-hidden="true">
          <span className="bayona-coach__portrait-brand">SB</span>
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
                  maxLength={70} autoComplete="given-name" placeholder="Tu nombre" onKeyDown={event=>{if(event.key==='Enter'){continueName();event.preventDefault()}}}/>
                <button type="button" onClick={()=>{nameCoach('');chooseAnswer('omitido')}} aria-pressed={coachAnswers.nombre==='omitido'}
                  className="bayona-coach__anonymous">Continuar sin nombre →</button>
              </div>
            : <div className="bayona-coach__choices" role="group" aria-label={stage.title}>
                {stage.options.map(option=><button type="button" key={option.value}
                  className={coachAnswers[stage.id]===option.value?'is-chosen':''}
                  aria-pressed={coachAnswers[stage.id]===option.value}
                  onClick={()=>chooseAnswer(option.value)}>
                  <span className="bayona-coach__choice-indicator">{coachAnswers[stage.id]===option.value?<Check size={16}/>:null}</span>
                  {option.label}
                </button>)}
              </div>
        }
      </div>
      <div className="bayona-coach__bottom">
        {coachStep>0&&<button type="button" className="bayona-coach__back" onClick={()=>changeStage(coachStep-1)}>
          <ArrowLeft size={17}/> VOLVER
        </button>}
        {!isLast&&<span className="bayona-coach__autonext" role="status">
          {stage.type==='name'?'ESCRIBE TU NOMBRE · CONTINÚA SOLO':'ELIGE UNA OPCIÓN · CONTINÚA SOLO'}
        </span>}
        {isLast&&<button type="button" className="bayona-coach__finish" onClick={closeCoach}>EXPLORAR LA WEB</button>}
      </div>
      <p className="bayona-coach__footer">Guía automatizada · respuestas solo en esta visita</p>
    </section>
  </div>,document.body)
}
