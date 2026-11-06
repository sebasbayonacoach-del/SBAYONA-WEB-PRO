import { useMemo, useState } from 'react'
import { ArrowDownRight, ArrowRight, ArrowUpRight, BookOpen, Check, GraduationCap, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { whatsAppLink } from '../config/site.config.js'
import { academyCourses, academyPilot } from '../config/academyCourses.js'
import '../styles/academy.css'

const topics = ['TODAS', 'ENTRENAMIENTO', 'MOVIMIENTO', 'PROFESIONALES', 'TECNOLOGÍA', 'CREACIÓN', 'HÁBITOS']
function inquiry(course, mode = 'general') {
  const message = [
    'Hola Sebastián. He visto ACADEMIA SEBASTIAN BAYONA.',
    'Me interesa la formación ' + course.title + '.',
    'Modalidad que deseo conocer: ' + (mode === 'cohort' ? 'grupo acompañado' : mode === 'self' ? 'autónoma' : 'por definir') + '.',
    '¿Puedes informarme de próximas fechas, contenido y condiciones, sin compromiso?',
  ].join(' ')
  return whatsAppLink(message)
}
function Course({ course, index }) {
  const [curriculumOpen, setCurriculumOpen] = useState(false)
  return (
    <article className={'academy-course academy-course--' + course.color} id={'curso-' + course.id}>
      <div className="academy-course__art" aria-hidden="true">
        <span className="academy-course__serial">SB / EDUCACIÓN / 2026</span>
        <span className="academy-course__number">{String(index + 1).padStart(2, '0')}</span>
        <span className="academy-course__mark">SB.</span>
        <span className="academy-course__art-foot">{course.category} <span>—</span> {course.weeks} SEMANAS</span>
      </div>
      <div className="academy-course__content">
        <div className="academy-course__eyebrow"><span>PROGRAMA {String(index + 1).padStart(2, '0')}</span><span>EN PRELANZAMIENTO</span></div>
        <h3>{course.title}</h3>
        <p className="academy-course__tagline">{course.summary}</p>
        <div className="academy-course__fact"><span>DIRIGIDO A</span><p>{course.audience}</p></div>
        <div className="academy-course__fact"><span>RESULTADO DE APRENDIZAJE</span><p>{course.promise}</p></div>
        <div className="academy-course__price">
          <span>PRECIOS DE PRUEBA · PENDIENTES DE VALIDACIÓN</span>
          <div><strong>€{course.selfPaced.toLocaleString('es-ES')}</strong><small>autónomo</small><span>·</span><strong>€{course.cohort.toLocaleString('es-ES')}</strong><small>grupo guiado</small></div>
        </div>
        <button className="academy-course__curriculum-toggle" type="button" aria-expanded={curriculumOpen} aria-controls={'temario-' + course.id} onClick={() => setCurriculumOpen(!curriculumOpen)}>
          {curriculumOpen ? 'OCULTAR TEMARIO' : 'VER TEMARIO COMPLETO'} <span aria-hidden="true">{curriculumOpen ? '−' : '+'}</span>
        </button>
        {curriculumOpen && (
          <div id={'temario-' + course.id} className="academy-course__curriculum">
            <ol>
              {course.modules.map(([number, title, detail]) => (
                <li key={number}><span>{number}</span><div><strong>{title}</strong><p>{detail}</p></div></li>
              ))}
            </ol>
            <div className="academy-course__work">
              <strong>PROYECTO DE FINALIZACIÓN</strong><p>{course.project}</p>
            </div>
            <div className="academy-course__work">
              <strong>MATERIALES PREVISTOS</strong><p>{course.deliverables.join(' · ')}</p>
            </div>
          </div>
        )}
        <a className="academy-course__action" href={inquiry(course)} target="_blank" rel="noopener noreferrer">
          CONSULTAR PRÓXIMA EDICIÓN <ArrowUpRight size={18} aria-hidden="true"/>
        </a>
        <small className="academy-course__disclosure">Solicitud informativa, sin cobro ni matrícula confirmada. El programa aún está en preparación.</small>
      </div>
    </article>
  )
}
export default function Academy() {
  const [category, setCategory] = useState('TODAS')
  const filtered = useMemo(() => category === 'TODAS'
    ? academyCourses : academyCourses.filter(x => x.category === category), [category])
  return (
    <div className="academy" id="academy-top">
      <section className="academy-hero">
        <div className="academy-shell">
          <div className="academy-hero__bar"><span>SEBASTIAN BAYONA / EDUCACIÓN</span><span>01 — APRENDER PARA ACTUAR</span></div>
          <div className="academy-hero__grid">
            <div>
              <p className="academy-eyebrow">ACADEMIA DIGITAL · PRÓXIMAS FORMACIONES</p>
              <h1>APRENDE.<br/><em>APLICA.</em><br/>EVOLUCIONA.</h1>
              <p className="academy-hero__lead">Entrenamiento, parkour, creación digital e inteligencia artificial. Conocimiento que se convierte en una habilidad demostrable, no en horas de vídeo acumuladas.</p>
              <div className="academy-hero__actions">
                <a href="#formaciones" className="academy-primary">DESCUBRIR PROGRAMAS <ArrowDownRight size={19} aria-hidden="true"/></a>
                <a href="#primera-leccion" className="academy-secondary">EMPEZAR GRATIS <ArrowUpRight size={18} aria-hidden="true"/></a>
              </div>
              <p className="academy-hero__status"><ShieldCheck size={18} aria-hidden="true"/> Programas en preparación · No se aceptan pagos ni matrículas todavía.</p>
            </div>
            <div className="academy-hero__art" aria-hidden="true">
              <span className="academy-hero__orbit academy-hero__orbit--a"/>
              <span className="academy-hero__orbit academy-hero__orbit--b"/>
              <span className="academy-hero__monogram">B.</span>
              <span className="academy-hero__art-label">THE MOVEMENT OF KNOWLEDGE / 2026</span>
            </div>
          </div>
        </div>
      </section>

      <section className="academy-principles" aria-label="El método de aprendizaje">
        <div className="academy-shell">
          <div><span>01 / APRENDER</span><strong>Lecciones que explican el porqué.</strong></div>
          <div><span>02 / PRACTICAR</span><strong>Un ejercicio aplicable cada semana.</strong></div>
          <div><span>03 / DEMOSTRAR</span><strong>Un proyecto final comprobable.</strong></div>
          <div><span>04 / CONTINUAR</span><strong>Herramientas para avanzar sin depender de un curso.</strong></div>
        </div>
      </section>

      <section className="academy-intro academy-shell" aria-labelledby="academy-why">
        <p className="academy-eyebrow">FORMACIONES FUNDADAS EN LA PRÁCTICA</p>
        <div className="academy-intro__grid">
          <h2 id="academy-why">NO TE VENDO<br/><em>UN CERTIFICADO.</em><br/>TE ENSEÑO A HACER.</h2>
          <div><p>Cada programa parte de un problema concreto, enseña un método y termina con algo que puedes utilizar: una rutina, una progresión de parkour, un sistema de clientes o una propuesta comercial.</p><p>Los cursos son privados y no reglados. No sustituyen titulaciones oficiales, formación clínica ni requisitos profesionales.</p></div>
        </div>
      </section>

      <section className="academy-free" id="primera-leccion" aria-labelledby="academy-free-title">
        <div className="academy-shell academy-free__grid">
          <div><span className="academy-eyebrow">UNA LECCIÓN ANTES DE ELEGIR</span><h2 id="academy-free-title">PRIMERO,<br/><em>ALGO ÚTIL.</em></h2><p>Tu primer mes de movimiento comienza con una decisión: elegir dos o tres días que puedas mantener, un patrón que quieras aprender y una manera sencilla de medir cómo te sientes.</p><ul><li><Check size={17} aria-hidden="true"/> Define el objetivo de una frase.</li><li><Check size={17} aria-hidden="true"/> Elige un movimiento básico seguro para ti.</li><li><Check size={17} aria-hidden="true"/> Registra tiempo y sensación, no solo repeticiones.</li></ul></div>
          <div className="academy-free__offer"><span>LECCIÓN ABIERTA / 00</span><BookOpen size={52} strokeWidth={1} aria-hidden="true"/><h3>TU PRIMER MES DE MOVIMIENTO.</h3><p>Un ebook original y un configurador orientativo de cuatro semanas. Sin correo, sin pago y sin registro.</p><a href="/#regalos-gratis">DESCARGAR GUÍAS GRATIS <ArrowUpRight size={19} aria-hidden="true"/></a><a href="/#plan-30-dias">CREAR UN PLAN INICIAL <ArrowRight size={17} aria-hidden="true"/></a></div>
        </div>
      </section>

      <section className="academy-catalog academy-shell" id="formaciones" aria-labelledby="academy-catalog-title">
        <div className="academy-section-top"><span>LA COLECCIÓN EDUCATIVA</span><span>SEIS CAMINOS / MÚLTIPLES NIVELES</span></div>
        <div className="academy-catalog__lead"><div><p className="academy-eyebrow">UN PASO CONCRETO HACIA UN CAMBIO REAL</p><h2 id="academy-catalog-title">ELIGE LO QUE<br/><em>NECESITAS APRENDER.</em></h2></div><p>Explora el temario antes de expresar tu interés. Las modalidades, fechas y precios se confirmarán cuando cada edición esté preparada.</p></div>
        <div className="academy-filters" role="group" aria-label="Filtrar formaciones">
          {topics.map(topic=><button type="button" key={topic} aria-pressed={category === topic} onClick={()=>setCategory(topic)}>{topic}</button>)}
        </div>
        <div className="academy-courses">
          {filtered.map((course) => <Course key={course.id} course={course} index={academyCourses.indexOf(course)} />)}
        </div>
      </section>

      <section className="academy-pro" aria-labelledby="academy-pro-title">
        <div className="academy-shell academy-pro__grid">
          <div><span className="academy-eyebrow">PARA ESTUDIOS, COACHES Y PEQUEÑAS EMPRESAS</span><h2 id="academy-pro-title">DE APRENDER<br/><em>A IMPLEMENTAR.</em></h2><p>También puedes solicitar formación para equipos, una implantación acompañada de Coach Studio o una licencia de contenidos originales. Se define el alcance y se presupuesta antes de contratar.</p></div>
          <div className="academy-pro__panel">
            <span>ACADEMIA / EQUIPOS</span><h3>UNA FORMACIÓN QUE TERMINA EN UN SISTEMA.</h3>
            <p>Diagnóstico → formación → proyecto → documentación → revisión.</p>
            <a href={whatsAppLink('Hola Sebastián. Quiero consultar una formación para mi equipo o una licencia de la ACADEMIA SEBASTIAN BAYONA. ¿Podemos concretar objetivos y presupuesto?')} target="_blank" rel="noopener noreferrer">SOLICITAR UNA PROPUESTA <ArrowUpRight size={19} aria-hidden="true"/></a>
            <small>Presupuesto individual. No hay plazas ni rentabilidades garantizadas.</small>
          </div>
        </div>
      </section>

      <section className="academy-finish academy-shell" aria-labelledby="academy-finish-title">
        <div><GraduationCap size={29} aria-hidden="true"/><span>FORMACIÓN CON CRITERIO</span></div>
        <h2 id="academy-finish-title">NO HACE FALTA SABERLO TODO.<br/><em>HACE FALTA EMPEZAR BIEN.</em></h2>
        <p>{academyPilot.disclaimer} El acompañamiento, la certificación privada de participación, el temario definitivo y las condiciones se detallarán antes de cualquier venta.</p>
        <div><a href="#formaciones">VER LAS FORMACIONES <ArrowRight size={18} aria-hidden="true"/></a><Link to="/app">DESCUBRIR SB+ <ArrowUpRight size={18} aria-hidden="true"/></Link></div>
      </section>
    </div>
  )
}
