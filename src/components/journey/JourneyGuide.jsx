import { HeartHandshake, ShieldCheck } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import '../../styles/journey-guide.css'
import { useJourneyExperience } from '../experience/JourneyExperienceContext.jsx'

const GUIDANCE = {
  '/about': ['CONÓCENOS', 'Puedes descubrir quién te acompañaría y cómo entiende BAYONA el entrenamiento antes de elegir un servicio.'],
  '/programs': ['SERVICIOS A LA VISTA', 'Compara entrenamiento personal, online y movimiento específico. Cada persona parte de una situación diferente.'],
  '/movimiento-adaptado': ['MOVIMIENTO CON CRITERIO', 'Las condiciones de salud requieren atención individual y, cuando corresponda, supervisión sanitaria. Esta página informa, no diagnostica.'],
  '/parkour-academy': ['APRENDER A TU RITMO', 'Empieza por la base: técnica, control, progresión y respeto por las capacidades de cada persona.'],
  '/resources': ['RECURSOS SIN PRESIÓN', 'Explora guías y herramientas para empezar a entender tus hábitos. No necesitas elegir un plan para aprender.'],
  '/community': ['CRECER ACOMPAÑADO', 'Aquí puedes conocer la comunidad antes de decidir si quieres participar.'],
  '/shop': ['EXPLORA CON CALMA', 'Mira los artículos disponibles y revisa sus detalles antes de decidir una compra.'],
  '/faq': ['PREGUNTAS CLARAS', 'Consulta directamente las respuestas. Si tu caso requiere valoración individual, puedes solicitar orientación.'],
  '/app': ['LA APP Y TU PROGRESO', 'Conoce qué hace BAYONA App y cómo puede ayudarte a organizar el entrenamiento.'],
}
const GENERIC = ['TÚ MARCAS EL RITMO', 'Aquí puedes informarte y comparar tus opciones sin completar formularios ni abrir paneles de orientación.']

/**
 * A quiet, always-expanded editorial note rather than a sticky chatbot.
 * On-page content does not infer diagnoses or remember browsing behavior.
 */
export default function JourneyGuide() {
  const { pathname } = useLocation()
  const { goal } = useJourneyExperience()
  if (pathname === '/') return null
  if (!Object.hasOwn(GUIDANCE, pathname)) return null
  const [title, description] = GUIDANCE[pathname] || GENERIC
  return (
    <aside className="bayona-journey-inline" aria-label="Tu acompañamiento en BAYONA">
      <div className="bayona-journey-inline__inner">
        <span className="bayona-journey-inline__icon"><HeartHandshake size={26} aria-hidden="true" /></span>
        <div>
          <span className="bayona-journey-inline__eyebrow">BAYONA / CONTIGO EN CADA PASO</span>
          <h2>{title}</h2>
          <p>{description}</p>
          {goal ? <p className="bayona-journey-inline__chosen"><strong>Tu objetivo: {goal.label}.</strong> Puedes seguir comparando todas las opciones; no preseleccionamos servicios por ti.</p> : null}
        </div>
        <p className="bayona-journey-inline__clarity"><ShieldCheck size={20} aria-hidden="true"/> No recogemos datos de salud mientras exploras la web.</p>
      </div>
    </aside>
  )
}
