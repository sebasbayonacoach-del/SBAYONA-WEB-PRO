import { ArrowDownRight, Check, ShieldCheck, Sparkles } from 'lucide-react'
import { JOURNEY_GOALS } from '../../data/journeyGoals.js'
import { useJourneyExperience } from './JourneyExperienceContext.jsx'
/** El scroll no requiere responder; una elección voluntaria destaca servicios sin ocultar alternativas. */
export default function HeroGlassIntake() {
  const { goal, goalId, chooseGoal, clearGoal } = useJourneyExperience()
  return (
    <aside className="bayona-glass-entry" aria-label="Tu punto de partida en BAYONA">
      <div className="bayona-glass-entry__top">
        <span className="bayona-glass-entry__orb"><Sparkles size={17} aria-hidden="true"/></span>
        <span>BAYONA / HECHO PARA TI</span>
        <span className="bayona-glass-entry__live">EN DIRECTO</span>
      </div>
      <h2>¿QUÉ TE MUEVE <em>HOY?</em></h2>
      <p>Si quieres, elige un objetivo. El recorrido destacará la información que puede interesarte.</p>
      <div className="bayona-glass-entry__goals" aria-label="Objetivos generales opcionales">
        {JOURNEY_GOALS.map(option => (
          <button type="button" key={option.id} aria-pressed={goalId === option.id}
            className={goalId === option.id ? 'is-active' : ''}
            onClick={() => chooseGoal(option.id)}>
            {goalId === option.id ? <Check size={13} aria-hidden="true"/> : <span aria-hidden="true" className="bayona-glass-entry__bullet"/>}
            {option.label}
          </button>
        ))}
      </div>
      <div className="bayona-glass-entry__result" role="status" aria-live="polite">
        <span className="bayona-glass-entry__result-kicker">{goal ? 'TU OBJETIVO ELEGIDO' : 'EXPLORACIÓN LIBRE'}</span>
        <strong>{goal ? goal.service : 'Tú decides tu camino.'}</strong>
        <p>{goal ? goal.description : 'Todos los servicios y precios están a la vista.'}</p>
        {goal ? <button type="button" onClick={clearGoal} className="bayona-glass-entry__clear">Volver a recorrido libre</button> : null}
      </div>
      <div className="bayona-glass-entry__foot">
        <ShieldCheck size={15} aria-hidden="true"/>
        <span>No pedimos diagnósticos. Nada se envía por elegir.</span>
        <ArrowDownRight size={18} aria-hidden="true"/>
      </div>
    </aside>
  )
}
