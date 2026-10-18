import { ArrowDownRight, ShieldCheck, Activity } from 'lucide-react'
import '../../styles/adapted-movement.css'

const SECTIONS = [
  {
    n: '01',
    title: 'QUÉ QUIERES MEJORAR',
    body: 'Fuerza, movilidad, energía, resistencia o volver a moverte. No necesitas elegir una sola meta para conocer las opciones.',
    notes: ['Objetivos realistas', 'Respeto por tu nivel', 'Sin compararte con nadie'],
  },
  {
    n: '02',
    title: 'DESDE DÓNDE EMPIEZAS',
    body: 'Puedes estar comenzando, llevar tiempo sin entrenar o tener limitaciones. La carga siempre debe corresponder a tu situación.',
    notes: ['Entrenamiento gradual', 'Ajustes por capacidad', 'Consultar si existen contraindicaciones'],
  },
  {
    n: '03',
    title: 'CÓMO TE ACOMPAÑAMOS',
    body: 'Presencial, online o movimiento específico: primero se conocen los objetivos y después se conversa sobre el programa adecuado.',
    notes: ['Opciones de acompañamiento', 'Plan y seguimiento según servicio', 'Tú eliges cuándo contactar'],
  },
]

/** No health questionnaire, progressive disclosure, client data or buttons. */
export default function AdaptiveDiscovery() {
  return (
    <section id="tu-ruta" className="bayona-discovery bayona-discovery--open" aria-labelledby="bayona-discovery-title">
      <div className="bayona-discovery__frame gym-home-shell">
        <div className="bayona-discovery__intro">
          <span className="bayona-discovery__index">BAYONA / TU PUNTO DE PARTIDA</span>
          <h2 id="bayona-discovery-title">TU HISTORIA IMPORTA. <em>EL CAMINO SE ADAPTA.</em></h2>
          <p>No tienes que completar un cuestionario para entender cómo trabajamos. Estas son las tres cosas que tenemos en cuenta desde el principio.</p>
          <p className="bayona-discovery__openness"><Activity size={20} aria-hidden="true" /> Léelo a tu ritmo: todo está aquí, sin pasos ocultos.</p>
        </div>
        <div className="bayona-discovery__allsteps" aria-label="Los tres aspectos de tu acompañamiento">
          {SECTIONS.map(section => (
            <article className="bayona-discovery__allstep" key={section.n}>
              <span className="bayona-discovery__step-label">{section.n} / 03</span>
              <h3>{section.title}</h3>
              <p>{section.body}</p>
              <ul>{section.notes.map(note=><li key={note}>{note}</li>)}</ul>
            </article>
          ))}
          <div className="bayona-discovery__health">
            <ShieldCheck size={25} aria-hidden="true" />
            <p><strong>¿Hay dolor, lesión o alguna condición de salud?</strong> Puedes explorar el enfoque de actividad física adaptada, pero la aptitud para entrenar y las contraindicaciones deben valorarlas los profesionales sanitarios que correspondan. Nunca hace falta compartir información médica aquí para navegar.</p>
            <span className="bayona-discovery__continue">DEBAJO: MOVIMIENTO ADAPTADO Y CONDICIONES <ArrowDownRight size={18} aria-hidden="true"/></span>
          </div>
        </div>
      </div>
    </section>
  )
}
