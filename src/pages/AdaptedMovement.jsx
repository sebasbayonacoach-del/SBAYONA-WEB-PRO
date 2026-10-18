import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Activity, ShieldCheck, Search, HeartPulse } from 'lucide-react'
import { MOVEMENT_CONTEXTS } from '../data/adaptedMovement.js'
import { bookingLink } from '../config/site.config.js'
import '../styles/adapted-movement.css'

export default function AdaptedMovement() {
  const [query,setQuery]=useState('')
  const [expanded,setExpanded]=useState(null)
  const matches=useMemo(()=>{
    const term=query.trim().toLocaleLowerCase('es')
    return term?MOVEMENT_CONTEXTS.filter(group=>
      [group.name,group.summary,...group.examples].some(text=>text.toLocaleLowerCase('es').includes(term))
    ):MOVEMENT_CONTEXTS
  },[query])
  const contact=bookingLink('Hola BAYONA. Me interesa el movimiento adaptado. Quisiera conocer el proceso de orientación y si es adecuado para mí. Prefiero tratar cualquier información clínica de forma privada y con las garantías oportunas.')
  return (
    <article className="bayona-adapted">
      <header className="bayona-adapted__hero">
        <div className="bayona-adapted__shell">
          <span className="bayona-adapted__eyebrow">BAYONA / MOVIMIENTO PARA PERSONAS REALES</span>
          <h1>TU CUERPO NO ES UN DIAGNÓSTICO. <em>TU CAMINO TAMPOCO.</em></h1>
          <p>Actividad física que respeta el contexto de cada persona. Fuerza, movilidad, autonomía y confianza, con adaptaciones y límites claros. Sin prometer curas ni sustituir la atención sanitaria.</p>
          <div className="bayona-adapted__actions">
            <a href="#contextos">EXPLORAR CONDICIONES <ArrowRight size={18} aria-hidden="true"/></a>
            <Link to="/#tu-ruta">DESCUBRIR MI PUNTO DE PARTIDA <ArrowRight size={18} aria-hidden="true"/></Link>
          </div>
          <div className="bayona-adapted__hero-rail"><span>01 / COMPRENDER</span><span>02 / ADAPTAR</span><span>03 / PROGRESAR</span></div>
        </div>
      </header>

      <section className="bayona-adapted__principles" aria-label="Nuestro enfoque">
        <div className="bayona-adapted__shell bayona-adapted__principles-grid">
          <div><Activity size={28} aria-hidden="true"/><strong>CAPACIDAD ANTES QUE ETIQUETAS</strong><p>Nos interesan tus objetivos, la función diaria y las actividades que te importan.</p></div>
          <div><ShieldCheck size={28} aria-hidden="true"/><strong>COORDINACIÓN CON SALUD</strong><p>Si tu situación requiere supervisión clínica, trabajamos solo dentro de las indicaciones del equipo sanitario.</p></div>
          <div><HeartPulse size={28} aria-hidden="true"/><strong>PROGRESIÓN INDIVIDUAL</strong><p>La intensidad y los ejercicios se ajustan a tu tolerancia, capacidades y seguimiento profesional cuando proceda.</p></div>
        </div>
      </section>

      <section className="bayona-adapted__catalog" id="contextos" aria-labelledby="bayona-contextos-title">
        <div className="bayona-adapted__shell">
          <div className="bayona-adapted__catalog-intro">
            <div>
              <span className="bayona-adapted__eyebrow">UN MAPA, NO UN DIAGNÓSTICO</span>
              <h2 id="bayona-contextos-title">MUCHAS REALIDADES. <em>UNA MIRADA INDIVIDUAL.</em></h2>
            </div>
            <p>Explora condiciones, lesiones o situaciones en las que puede resultar relevante adaptar la actividad física. Aparecer aquí <strong>no significa que BAYONA trate esa patología</strong> ni que puedas entrenar sin valoración clínica. Ninguna lista puede incluir todos los diagnósticos.</p>
          </div>
          <label className="bayona-adapted__search">
            <Search size={20} aria-hidden="true" />
            <span className="sr-only">Buscar condición o contexto</span>
            <input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar, por ejemplo: espalda, diabetes, Parkinson..." />
            <span>{matches.length} FAMILIAS</span>
          </label>
          {matches.length?(
            <div className="bayona-adapted__grid">
              {matches.map(group=>{
                const open=expanded===group.id||Boolean(query)
                return <article className="bayona-adapted__group" key={group.id}>
                  <div className="bayona-adapted__group-head"><span>{group.icon} / 12</span><h3>{group.name}</h3></div>
                  <p>{group.summary}</p>
                  <button type="button" aria-expanded={open} onClick={()=>setExpanded(open?null:group.id)}>
                    {open?'OCULTAR EJEMPLOS':'VER EJEMPLOS'} <span aria-hidden="true">{open?'−':'+'}</span>
                  </button>
                  {open?<ul>{group.examples.map(example=><li key={example}>{example}</li>)}</ul>:null}
                </article>
              })}
            </div>
          ):<p className="bayona-adapted__no-results" role="status">No aparece ese término. Puedes consultarnos cualquier otra situación; una etiqueta no decide si el ejercicio es adecuado.</p>}
          <p className="bayona-adapted__catalog-note">Los ejemplos son informativos y no constituyen programas prescritos por diagnóstico. Una misma condición puede tener distintas contraindicaciones, fases y necesidades.</p>
        </div>
      </section>
      <section className="bayona-adapted__limits" aria-labelledby="bayona-adapted-limits-title">
        <div className="bayona-adapted__shell bayona-adapted__limits-grid">
          <div>
            <span className="bayona-adapted__eyebrow">DÓNDE ESTÁ EL LÍMITE</span>
            <h2 id="bayona-adapted-limits-title">ENTRENAR CON CRITERIO TAMBIÉN ES SABER <em>CUÁNDO DERIVAR.</em></h2>
          </div>
          <div>
            <p>El entrenamiento personal no diagnostica, trata ni rehabilita enfermedades. La fisioterapia, la medicina y otras profesiones sanitarias tienen competencias diferentes. Ante una lesión reciente, cirugía, enfermedad no controlada o recomendaciones médicas específicas, hace falta valoración y autorización de los profesionales correspondientes antes de establecer un plan.</p>
            <p>Si aparecen síntomas de alarma —por ejemplo dolor torácico, dificultad respiratoria súbita, pérdida de fuerza repentina o síntomas neurológicos agudos— hay que buscar atención sanitaria urgente, no iniciar un programa de ejercicio.</p>
            <div className="bayona-adapted__actions">
              <a href={contact} rel="noopener noreferrer" target="_blank">PREGUNTAR POR EL PROCESO <ArrowRight size={18} aria-hidden="true"/></a>
              <Link to="/#tu-ruta">VER RECORRIDO DE ORIENTACIÓN <ArrowRight size={18} aria-hidden="true"/></Link>
            </div>
          </div>
        </div>
      </section>
    </article>
  )
}
