import { Activity, HeartPulse, ShieldCheck } from 'lucide-react'
import { MOVEMENT_CONTEXTS } from '../../data/adaptedMovement.js'
import '../../styles/home-everything-visible.css'

/** Lectura editorial continua: todas las familias y ejemplos están en el DOM y visibles. */
export default function HomeMovementContexts() {
  const total = MOVEMENT_CONTEXTS.reduce((sum, group) => sum + group.examples.length, 0)
  return (
    <section className="bayona-home-contexts" id="movimiento-adaptado" aria-labelledby="bayona-home-contexts-heading">
      <div className="gym-home-shell">
        <div className="bayona-home-contexts__intro">
          <div>
            <span className="bayona-home-contexts__eyebrow">BAYONA / MOVIMIENTO ADAPTADO · {MOVEMENT_CONTEXTS.length} FAMILIAS</span>
            <h2 id="bayona-home-contexts-heading">TU HISTORIA CUENTA. <em>NINGUNA ETIQUETA TE DEFINE.</em></h2>
          </div>
          <div className="bayona-home-contexts__side">
            <HeartPulse size={32} aria-hidden="true"/>
            <p>Dolor, una lesión, una enfermedad o una limitación no se resuelven con un plan genérico. Primero importa entender tu situación y saber cuándo corresponde derivarte.</p>
            <strong>{total} EJEMPLOS · TODOS VISIBLES</strong>
          </div>
        </div>
        <div className="bayona-home-contexts__principles" aria-label="Principios de entrenamiento adaptado">
          <p><Activity size={19} aria-hidden="true" /><strong>CAPACIDAD Y AUTONOMÍA</strong><span>Partimos de lo que puedes y quieres hacer.</span></p>
          <p><ShieldCheck size={19} aria-hidden="true" /><strong>LÍMITES CLÍNICOS CLAROS</strong><span>El entrenamiento no sustituye diagnóstico, fisioterapia ni tratamiento.</span></p>
          <p><HeartPulse size={19} aria-hidden="true" /><strong>PROGRESIÓN RESPONSABLE</strong><span>Se adapta la carga a tu situación y a las indicaciones sanitarias.</span></p>
        </div>
        <div className="bayona-home-contexts__grid">
          {MOVEMENT_CONTEXTS.map(group => (
            <article className="bayona-home-contexts__group" key={group.id}>
              <span className="bayona-home-contexts__index">{group.icon} / {String(MOVEMENT_CONTEXTS.length).padStart(2, '0')}</span>
              <h3>{group.name}</h3>
              <p>{group.summary}</p>
              <ul>{group.examples.map(example => <li key={example}>{example}</li>)}</ul>
            </article>
          ))}
        </div>
        <div className="bayona-home-contexts__scope" role="note">
          <ShieldCheck size={23} aria-hidden="true"/>
          <div>
            <strong>UN MAPA DE CONTEXTOS, NO UNA LISTA DE TRATAMIENTOS.</strong>
            <p>Nombrar una condición no significa que BAYONA pueda tratarla ni que el ejercicio sea seguro para cualquier persona. La aptitud, las contraindicaciones y la necesidad de supervisión deben ser valoradas por profesionales sanitarios cuando corresponda. No recopilamos diagnósticos ni datos de salud mientras navegas.</p>
            <p>Ante dolor torácico, dificultad respiratoria repentina, pérdida brusca de fuerza o síntomas neurológicos agudos, busca atención sanitaria urgente en lugar de entrenar.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
