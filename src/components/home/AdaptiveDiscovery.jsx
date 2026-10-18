import { Activity, ShieldCheck } from 'lucide-react'
import '../../styles/adapted-movement.css'
import { useJourneyExperience } from '../experience/JourneyExperienceContext.jsx'

const PROMPTS = [
  { id: '01', label: 'TU OBJETIVO', title: '¿Qué quieres conseguir?', summary: 'Fuerza, movimiento, energía o parkour.' },
  { id: '02', label: 'TU PUNTO DE PARTIDA', title: '¿Cómo estás hoy?', summary: 'Empezar, retomar o adaptar la carga.' },
  { id: '03', label: 'TU VIDA REAL', title: '¿Qué te encaja?', summary: 'Presencial, online y tu propio ritmo.' },
]

/** Orientación legible sin datos personales, formularios o clics. */
export default function AdaptiveDiscovery() {
  const { goal } = useJourneyExperience()
  return (
    <section id="tu-ruta" className="bayona-discovery bayona-discovery--open bayona-discovery--focused" aria-labelledby="bayona-discovery-title">
      <div className="gym-home-shell bayona-discovery__focus-shell">
        <div className="bayona-discovery__intro">
          <span className="bayona-discovery__index">ANTES QUE UN PLAN, ESTÁS TÚ</span>
          <h2 id="bayona-discovery-title">PRIMERO <em>TE ESCUCHO.</em></h2>
          <p>{goal ? `Para ${goal.label.toLowerCase()}, empezamos escuchando tu situación y tus prioridades.` : 'Tres cosas que importan antes de empezar.'}</p>
        </div>
        <div className="bayona-discovery__focus-grid">
          {PROMPTS.map(prompt => (
            <article className="bayona-discovery__focus-card" key={prompt.id}>
              <span className="bayona-discovery__focus-index"><Activity size={15} aria-hidden="true" /> {prompt.id} / {prompt.label}</span>
              <h3>{prompt.title}</h3>
              <p>{prompt.summary}</p>
            </article>
          ))}
        </div>
        <p className="bayona-discovery__focus-safety"><ShieldCheck size={17} aria-hidden="true" /> Ante lesiones o condiciones de salud, el entrenamiento respeta la valoración y las indicaciones sanitarias que correspondan.</p>
      </div>
    </section>
  )
}
