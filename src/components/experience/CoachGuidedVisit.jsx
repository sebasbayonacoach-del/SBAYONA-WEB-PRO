import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, LockKeyhole, RotateCcw, ShieldCheck, Sparkles, X } from 'lucide-react'
import { whatsAppLink } from '../../config/site.config.js'
import { COACH_VISIT_STEPS, coachAnswerLabel, suggestCoachPlan } from '../../data/coachVisit.js'
import { getJourneyGoal } from '../../data/journeyGoals.js'
import { useJourneyExperience } from './JourneyExperienceContext.jsx'
import '../../styles/coach-guided-visit.css'

function CoachResult({ answers, name, nameCoach, restart }) {
  const { plan, reasons, requiresConversation, goalService } = suggestCoachPlan(answers)
  const goal = getJourneyGoal(answers.objetivo)
  const entries = COACH_VISIT_STEPS.slice(0, 6).filter(stage => stage.id !== 'criterio')
    .map(stage => ({ title: stage.label.slice(5), value: coachAnswerLabel(stage.id, answers[stage.id]) }))
  const message = [
    'Hola, Sebastián. He completado voluntariamente la visita guiada de BAYONA.',
    name.trim() ? 'Me llamo ' + name.trim() + '.' : '',
    'Mi objetivo general: ' + (goal?.label || 'por definir') + '.',
    ...entries.filter(item => item.title !== 'TU MOTIVACIÓN').map(item => item.title + ': ' + item.value + '.'),
    'BAYONA me mostró como opción preliminar: ' + plan.name + ' (' + plan.priceDisplay + ' ' + plan.currency + ').',
    requiresConversation ? 'Prefiero conversar antes de iniciar el entrenamiento.' : '',
    'Quiero confirmar el alcance, las condiciones y la disponibilidad antes de decidir.',
  ].filter(Boolean).join('\n')
  return (
    <div className="bayona-coach__result" data-testid="coach-result">
      <div className="bayona-coach__result-lead">
        <span className="bayona-coach__result-index">TU PROPUESTA INICIAL</span>
        <h3>{plan.name}</h3>
        <strong>{plan.priceDisplay} <small>{plan.currency}</small></strong>
        <p>{plan.shortDescription}</p>
      </div>
      <div className="bayona-coach__reasons">
        <span>EL SERVICIO QUE CONVIENE EXPLORAR</span>
        <p><Check size={17} aria-hidden="true"/><strong>{goalService}</strong></p>
        <p>El plan sugerido define acompañamiento, pero no garantiza que incluya ese servicio. Confirmaremos disponibilidad y prestaciones antes de contratar.</p>
        <span>POR QUÉ ESTA OPCIÓN</span>
        {reasons.map(reason => <p key={reason}><Check size={17} aria-hidden="true" />{reason}</p>)}
        {requiresConversation && <p><ShieldCheck size={18} aria-hidden="true" />Lo adecuado es conversar antes de elegir un servicio.</p>}
      </div>
      <div className="bayona-coach__recap">
        <span>ASÍ TE HE ENTENDIDO</span>
        {entries.map(({ title, value }) => <p key={title}><small>{title}</small><strong>{value}</strong></p>)}
      </div>
      <div className="bayona-coach__contact">
        <label htmlFor="bayona-coach-name">¿CÓMO TE GUSTARÍA QUE TE LLAME? <small>Opcional</small></label>
        <input id="bayona-coach-name" value={name} onChange={event => nameCoach(event.target.value)}
          autoComplete="given-name" maxLength={70} placeholder="Tu nombre, si quieres" />
        <p>El nombre y las respuestas solo están en esta visita. El resumen se abrirá en WhatsApp únicamente si pulsas el botón; podrás revisarlo antes de enviarlo. No se ha creado ninguna ficha ni enviado ningún dato a BAYONA.</p>
        <a href={whatsAppLink(message)} target="_blank" rel="noopener noreferrer" className="bayona-coach__send">
          ABRIR WHATSAPP CON MI RESUMEN <ArrowUpRight size={19} aria-hidden="true"/>
        </a>
        <button type="button" className="bayona-coach__restart" onClick={restart}>
          <RotateCcw size={14} aria-hidden="true"/> Volver a empezar
        </button>
      </div>
    </div>
  )
}

export default function CoachGuidedVisit() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const dialogRef = useRef(null)
  const { coachOpen, coachStep, coachAnswers, coachName, closeCoach, moveCoach, answerCoach, nameCoach, clearCoach } = useJourneyExperience()
  const stage = COACH_VISIT_STEPS[coachStep]

  useEffect(() => {
    if (!coachOpen) return undefined
    document.documentElement.classList.add('bayona-coach-visit-active')
    const oldFocus = document.activeElement
    const onKeyDown = event => {
      if (event.key === 'Escape') closeCoach()
      if (event.key !== 'Tab') return
      const selectors = 'button:not([disabled]),a[href],input:not([disabled])'
      const items = [...(dialogRef.current?.querySelectorAll(selectors) || [])].filter(item => item.getBoundingClientRect().width > 0)
      if (!items.length) return
      const first = items[0]
      const last = items.at(-1)
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current?.contains(document.activeElement))) {
        event.preventDefault(); last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current?.contains(document.activeElement))) {
        event.preventDefault(); first.focus()
      }
    }
    // Atrás del navegador siempre sale de la visita. La navegación interna usa history.pushState sin popstate.
    const onBrowserBack = () => closeCoach()
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('popstate', onBrowserBack)
    return () => {
      document.documentElement.classList.remove('bayona-coach-visit-active')
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('popstate', onBrowserBack)
      if (oldFocus?.isConnected) oldFocus.focus({ preventScroll: true })
    }
  }, [coachOpen, closeCoach])

  useEffect(() => {
    if (!coachOpen || !stage) return undefined
    dialogRef.current?.querySelector('.bayona-coach__title')?.focus({ preventScroll: true })
    if (pathname !== stage.path) return undefined
    const scroll = () => {
      const target = document.getElementById(stage.anchor)
      if (target) target.scrollIntoView({ block: 'start', behavior: 'instant' })
    }
    const timer = setTimeout(scroll, 550)
    const retry = setTimeout(scroll, 1050)
    return () => { clearTimeout(timer); clearTimeout(retry) }
  }, [coachOpen, coachStep, pathname, stage])

  if (!coachOpen || !stage) return null
  const isLast = coachStep === COACH_VISIT_STEPS.length - 1
  const selected = coachAnswers[stage.id]
  const changeStage = next => {
    const item = COACH_VISIT_STEPS[next]
    moveCoach(next)
    if (pathname !== item.path) navigate(item.path)
  }
  const restart = () => {
    clearCoach()
    if (pathname !== '/') navigate('/')
  }

  return (
    <div className="bayona-coach__overlay" data-testid="guided-coach-overlay">
      <div className="bayona-coach__shade" aria-hidden="true"/>
      <section role="dialog" aria-modal="true" aria-labelledby="bayona-coach-heading"
        aria-describedby="bayona-coach-intro" className="bayona-coach" ref={dialogRef}>
        <div className="bayona-coach__top">
          <span className="bayona-coach__monogram">B</span>
          <div><strong>SEBASTIÁN / BAYONA</strong><small>VISITA GUIADA AUTOMATIZADA</small></div>
          <button type="button" className="bayona-coach__exit" onClick={closeCoach} aria-label="Salir de la visita guiada"><X size={21}/></button>
        </div>
        <div className="bayona-coach__progress" aria-label={'Etapa ' + (coachStep + 1) + ' de ' + COACH_VISIT_STEPS.length}>
          <span style={{ width: ((coachStep + 1) * 100 / COACH_VISIT_STEPS.length) + '%' }}/>
        </div>
        <div className="bayona-coach__content">
          <div className="bayona-coach__eyebrow"><Sparkles size={16} aria-hidden="true"/>
            <span>{stage.label}</span><span>{String(coachStep + 1).padStart(2, '0')} / {String(COACH_VISIT_STEPS.length).padStart(2, '0')}</span>
          </div>
          <h2 id="bayona-coach-heading" className="bayona-coach__title" tabIndex={-1}>{stage.title}</h2>
          <p id="bayona-coach-intro" className="bayona-coach__description">{stage.description}</p>
          {isLast
            ? <CoachResult answers={coachAnswers} name={coachName} nameCoach={nameCoach} restart={restart}/>
            : <div className="bayona-coach__choices" role="group" aria-label={stage.title}>
                {stage.options.map(option =>
                  <button key={option.value} type="button" className={selected === option.value ? 'is-chosen' : ''}
                    aria-pressed={selected === option.value} onClick={() => answerCoach(stage.id, option.value)}>
                    <span className="bayona-coach__choice-indicator">{selected === option.value ? <Check size={17}/> : null}</span>
                    {option.label}
                  </button>
                )}
              </div>}
          {!isLast && <p className="bayona-coach__privacy"><LockKeyhole size={15} aria-hidden="true"/> Tu respuesta permanece solo en esta visita. Nada se envía automáticamente.</p>}
        </div>
        <div className="bayona-coach__bottom">
          <button type="button" className="bayona-coach__back" onClick={() => coachStep ? changeStage(coachStep - 1) : closeCoach()}>
            <ArrowLeft size={18} aria-hidden="true"/>{coachStep ? 'ANTERIOR' : 'SALIR'}
          </button>
          {!isLast && <button type="button" className="bayona-coach__next" disabled={!selected} onClick={() => changeStage(coachStep + 1)}>
            CONTINUAR <ArrowRight size={18} aria-hidden="true"/>
          </button>}
          {isLast && <button type="button" className="bayona-coach__finish" onClick={closeCoach}>SEGUIR EXPLORANDO</button>}
        </div>
        <p className="bayona-coach__footer">Esta es una orientación general, no una valoración médica. Puedes salir cuando quieras.</p>
      </section>
    </div>
  )
}
