import { ArrowRight, Check, RotateCcw } from 'lucide-react'
import { JOURNEY_GOALS, journeyGoalById, useJourney } from './JourneyContext.jsx'
import '../../styles/journey-guide.css'

export default function ServicePersonalizer() {
  const { goal, setGoal, setOpen } = useJourney()
  const selected = journeyGoalById(goal)
  return (
    <div className="bayona-services-conversation" aria-labelledby="bayona-conversation-title">
      <div className="bayona-services-conversation__prompt">
        <span className="bayona-services-conversation__number">BAYONA / UNA PREGUNTA PARA TI</span>
        <h3 id="bayona-conversation-title">Antes de elegir, <em>¿qué te gustaría conseguir?</em></h3>
        <p>No tienes que saber qué servicio necesitas. Dime qué quieres lograr y te muestro por dónde podrías empezar.</p>
      </div>
      <div className="bayona-services-conversation__actions">
        <div className="bayona-services-conversation__choices" aria-label="Seleccionar tu objetivo">
          {JOURNEY_GOALS.map(item=>(
            <button key={item.id} type="button" aria-pressed={goal===item.id} className={goal===item.id?'is-selected':''} onClick={()=>setGoal(item.id)}>
              {goal===item.id?<Check size={16} aria-hidden="true"/>:null}{item.label}
            </button>
          ))}
        </div>
        {selected ? (
          <p className="bayona-services-conversation__reply" role="status">
            <strong>Te escucho: {selected.label.toLowerCase()}.</strong> He colocado primero una opción relacionada. Todas las demás siguen disponibles; tú decides.
            <button type="button" onClick={()=>setOpen(true)}>VER MI GUÍA <ArrowRight size={15} aria-hidden="true"/></button>
            <button type="button" onClick={()=>setGoal(null)} aria-label="Borrar objetivo elegido"><RotateCcw size={14} aria-hidden="true"/> BORRAR</button>
          </p>
        ) : <p className="bayona-services-conversation__privacy">No guardamos tu respuesta fuera de esta visita. No sustituye una valoración profesional.</p>}
      </div>
    </div>
  )
}
