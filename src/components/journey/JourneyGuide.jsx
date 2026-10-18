import { ArrowRight, Check, Compass, RotateCcw, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { JOURNEY_GOALS, SERVICE_LABELS, journeyForRoute, useJourney } from './JourneyContext.jsx'
import '../../styles/journey-guide.css'

export default function JourneyGuide() {
  const { pathname } = useLocation()
  const { goal, service, open, setGoal, setService, setOpen, reset } = useJourney()
  const guide = journeyForRoute(pathname, goal)
  const started = Boolean(goal || service)
  const close = () => setOpen(false)
  return (
    <aside className={'bayona-care'+(open?' bayona-care--open':'')} aria-label="Guía de acompañamiento BAYONA">
      {open ? (
        <div id="bayona-care-panel" className="bayona-care__panel">
          <div className="bayona-care__header">
            <div>
              <span>BA / ESTOY AQUÍ PARA ORIENTARTE</span>
              <strong>TU GUÍA BAYONA</strong>
            </div>
            <button type="button" onClick={close} className="bayona-care__close" aria-label="Cerrar la guía"><X size={19} aria-hidden="true"/></button>
          </div>
          {!started ? (
            <div className="bayona-care__body">
              <span className="bayona-care__eyebrow">EMPEZAMOS POR TI · OPCIONAL</span>
              <h2>¿QUÉ TE GUSTARÍA CONSEGUIR?</h2>
              <p>No hace falta crear una cuenta ni contarme nada médico. Elige qué buscas y te indicaré dónde puede interesarte continuar.</p>
              <div className="bayona-care__options" aria-label="Elegir objetivo de entrenamiento">
                {JOURNEY_GOALS.map(option=>(
                  <button type="button" key={option.id} onClick={()=>setGoal(option.id)}>
                    <span>{option.label}</span><ArrowRight size={17} aria-hidden="true"/>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bayona-care__body">
              <span className="bayona-care__eyebrow"><Check size={14} aria-hidden="true"/> {guide.eyebrow}</span>
              <h2>{guide.title}</h2>
              <p>{guide.copy}</p>
              <div className="bayona-care__summary">
                {goal ? <span><small>TU OBJETIVO</small><strong>{guide.goalTitle}</strong></span>:null}
                {service ? <span><small>TE INTERESÓ</small><strong>{SERVICE_LABELS[service]}</strong></span>:null}
              </div>
              <Link to={guide.nextUrl} onClick={close} className="bayona-care__next">{guide.nextLabel} <ArrowRight size={18} aria-hidden="true"/></Link>
              <div className="bayona-care__secondary">
                <button type="button" onClick={()=>{setGoal(null);setService(null)}}>CAMBIAR MI OBJETIVO</button>
                <button type="button" onClick={reset}><RotateCcw size={14} aria-hidden="true"/> BORRAR ELECCIÓN</button>
              </div>
            </div>
          )}
          <p className="bayona-care__privacy">Esta guía usa únicamente lo que eliges durante la visita. Sin guardar, enviar ni deducir condiciones de salud.</p>
        </div>
      ):null}
      <button type="button" className="bayona-care__trigger" aria-controls={open ? "bayona-care-panel" : undefined} aria-expanded={open} onClick={()=>setOpen(!open)}>
        <Compass size={17} aria-hidden="true"/>
        <span>{goal ? 'TU RUTA: '+guide.goalTitle.toUpperCase() : service ? 'TU SERVICIO BAYONA' : '¿TE ACOMPAÑO?'}</span>
        <span className="bayona-care__trigger-arrow" aria-hidden="true">{open?'−':'+'}</span>
      </button>
    </aside>
  )
}
