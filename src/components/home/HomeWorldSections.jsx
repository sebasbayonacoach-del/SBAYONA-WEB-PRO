import { ArrowRight, ArrowUpRight, BookOpen, CalendarDays, Check, CircleHelp, ClipboardList, Compass, ExternalLink, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { bookingLink, whatsAppLink } from '../../config/site.config.js'
import { BAYONA_APP_ENTRY_URL } from '../../config/bayonaAppIntegration.js'
import { trackEvent } from '../../lib/analytics/analytics.js'
import './home-world-sections.css'

const journeySpots=[
  {
    number:'01',label:'EL ORIGEN', title:'La Historia', italic:'Nada empieza desde cero.',
    description:'Descubre la experiencia y las ideas que dieron forma a este estudio. Para entender cómo entrenamos, primero conoce desde dónde pensamos el movimiento.',
    value:'Qué encontrarás: filosofía, trayectoria y una manera de entender el progreso.',
    image:'/images/bayona-generated/about-story-1600.webp',alt:'Escena editorial conceptual que representa una conversación sobre entrenamiento',
    href:'/about',action:'DESCUBRIR LA HISTORIA',tone:'paper',
  },
  {
    number:'02',label:'EL PROCESO', title:'Experiencias',italic:'Entrenar con dirección.',
    description:'No existe una única forma de avanzar. Explora opciones de fuerza, condición física, movimiento y acompañamiento adaptadas a diferentes objetivos.',
    value:'Qué encontrarás: modalidades, explicaciones claras y cómo elegir tu punto de partida.',
    image:'/images/bayona-generated/home-pillar-build-1600.webp',alt:'Imagen editorial conceptual de entrenamiento funcional',
    href:'/programs',action:'EXPLORAR EXPERIENCIAS',tone:'ink',
  },
  {
    number:'03',label:'EL ESPACIO',title:'Parkour Lab',italic:'La adaptación se entrena.',
    description:'El parkour comienza mucho antes de un salto: observar, decidir, apoyar, equilibrarse y construir técnica de forma progresiva y responsable.',
    value:'Qué encontrarás: fundamentos, seguridad, clases y una visión del movimiento libre.',
    image:'/images/bayona-generated/parkour-hero-1600.webp',alt:'Representación editorial de un practicante de parkour en un entorno urbano',
    href:'/parkour-academy',action:'CONOCER PARKOUR LAB',tone:'paper',
  },
  {
    number:'04',label:'TODAS LAS PERSONAS',title:'Movimiento adaptado',italic:'La capacidad tiene matices.',
    description:'El movimiento puede explorarse con otros ritmos, apoyos y niveles de complejidad. El objetivo no es encajar en una rutina, sino encontrar una opción apropiada.',
    value:'Qué encontrarás: enfoque de adaptación, criterios para empezar y límites de una propuesta general.',
    image:'/images/bayona-generated/home-problem-body-signals-1600.webp',alt:'Imagen editorial conceptual sobre conciencia corporal y movimiento accesible',
    href:'/movimiento-adaptado',action:'EXPLORAR MOVIMIENTO ADAPTADO',tone:'ink',
  },
]
const universe=[
  {
    num:'05',title:'El Círculo',label:'COMPARTIR EL CAMINO',
    summary:'Un espacio para conectar, aprender y acercarte a personas con intereses compartidos.',
    image:'/images/bayona-generated/community-group-1600.webp', alt:'Imagen editorial conceptual de comunidad y entrenamiento',
    href:'/community',cta:'CONOCER LA COMUNIDAD',
  },
  {
    num:'06',title:'SB+',label:'ESTUDIO DIGITAL',
    summary:'Descubre la puerta de entrada para atletas y Coach Studio, y cómo se relaciona con la experiencia presencial.',
    image:'/images/sb-plus/role-selection-desktop-20261104.png',alt:'Captura real de SB+ con acceso para atletas y entrenadores',
    href:'/app',cta:'DESCUBRIR SB+',
  },
  {
    num:'07',title:'La Colección',label:'OBJETOS CON SENTIDO',
    summary:'Explora la selección editorial de artículos y consulta precio final, disponibilidad y entrega antes de comprar.',
    image:'/images/bayona-generated/shop-movement-1600.webp',alt:'Imagen editorial conceptual de productos relacionados con el movimiento',
    href:'/shop',cta:'EXPLORAR LA COLECCIÓN',
  },
  {
    num:'08',title:'La Biblioteca',label:'CONOCIMIENTO ABIERTO',
    summary:'Guías gratuitas, lectura y herramientas para entender mejor lo que haces y por qué lo haces.',
    image:'/images/bayona-generated/resources-hero-1600.webp',alt:'Escena editorial conceptual de lectura y estudio del movimiento',
    href:'/resources',cta:'ABRIR LA BIBLIOTECA',
  },
]

const frequentlyAsked = [
  {q:'¿Tengo que pagar o registrarme para acceder a los libros?',a:'No. Los ebooks, guías de inicio y el configurador básico del mes pueden usarse sin crear una cuenta ni proporcionar un correo electrónico. Puedes compartir el material respetando su autoría.'},
  {q:'¿La rutina de 30 días es realmente personalizada?',a:'Es un borrador educativo que cambia según objetivo, experiencia, tiempo y material. No equivale a una evaluación individual ni sustituye la adaptación que puede realizar un entrenador después de hablar contigo.'},
  {q:'¿Puedo empezar si nunca he entrenado?',a:'Puedes explorar las opciones de nivel inicial y seguir propuestas suaves si no tienes contraindicaciones. Si tienes dolor, lesiones, enfermedades relevantes o dudas sobre qué puedes realizar, solicita orientación profesional antes de comenzar.'},
  {q:'¿Las clases son presenciales o también online?',a:'Se contemplan opciones presenciales en Gandía y acompañamiento online. La disponibilidad, lugar, duración, modalidad y condiciones concretas deben confirmarse al solicitar información.'},
  {q:'¿Puedo reservar una sesión desde la web?',a:'Puedes solicitar una cita o una revisión de objetivos desde el botón final. El enlace de agenda, cuando esté configurado, abre la reserva; en caso contrario inicia un mensaje para acordar el horario. Enviar una solicitud no garantiza una plaza.'},
  {q:'¿La tienda cobra inmediatamente?',a:'No se presenta un pago real como completado. Los artículos y condiciones se consultan antes de la confirmación de disponibilidad y el pago. No debes transferir dinero sin recibir información verificable de la compra.'},
]

export function LandingWorldSections() {
  return (
    <section className="lw-world" id="ruta-completa" aria-labelledby="lw-world-title">
      <div className="lw-world__top">
        <div className="lw-container">
          <div className="lw-section-rule"><span>07 / UNA MARCA QUE PUEDES EXPLORAR</span><span>EL UNIVERSO COMPLETO</span></div>
          <div className="lw-world__hero">
            <div><p className="lw-eyebrow">NO TE LIMITES A MIRAR UNA PORTADA</p><h2 id="lw-world-title">DETRÁS DE UN MOVIMIENTO,<br/><em>HAY UN UNIVERSO.</em></h2></div>
            <div><p>Lo que ves aquí tiene historia, método, práctica, tecnología y recursos. Puedes seguir el orden propuesto o elegir el capítulo que más se acerque a lo que buscas.</p><span>EXPLORA · APRENDE · PRACTICA · DECIDE</span></div>
          </div>
        </div>
      </div>
      {journeySpots.map((spot,i)=>(
        <article className={'lw-spot lw-spot--'+spot.tone+(i%2?' lw-spot--reverse':'')} key={spot.href}>
          <div className="lw-spot__image">
            <img src={spot.image} alt={spot.alt} loading="lazy" decoding="async" width="1600" height="1000"/>
            <span className="lw-spot__stamp">SEBASTIAN BAYONA / {spot.number}</span>
          </div>
          <div className="lw-spot__text">
            <div className="lw-spot__metadata"><span>{spot.number} / 11</span><span>{spot.label}</span></div>
            <div><h3>{spot.title}<br/><em>{spot.italic}</em></h3><p>{spot.description}</p><p className="lw-spot__value"><Check size={18} aria-hidden="true"/>{spot.value}</p></div>
            <Link to={spot.href} className="lw-spot__cta" onClick={()=>trackEvent('studio_home_world_route',{route:spot.href})}>{spot.action} <ArrowUpRight size={20} aria-hidden="true"/></Link>
          </div>
        </article>
      ))}
      <div className="lw-world__collection">
        <div className="lw-container">
          <div className="lw-section-rule lw-section-rule--dark"><span>08 / MÁS ALLÁ DE LAS CLASES</span><span>COMUNIDAD · TECNOLOGÍA · OBJETOS · IDEAS</span></div>
          <div className="lw-world__collection-intro"><h3>CONOCE TODO LO<br/><em>QUE PUEDE ACOMPAÑARTE.</em></h3><p>No se trata solo de entrenar hoy. También puedes descubrir con quién compartirlo, cómo organizarlo y dónde seguir aprendiendo.</p></div>
          <div className="lw-universe">
            {universe.map((item,i)=>(
              <article className={'lw-universe__item lw-universe__item--'+i} key={item.href}>
                <Link to={item.href} className="lw-universe__image" onClick={()=>trackEvent('studio_home_universe_click',{route:item.href})}><img src={item.image} alt={item.alt} loading="lazy" decoding="async" width="1600" height="1000"/><span>{item.num}</span></Link>
                <div className="lw-universe__content"><span>{item.label}</span><h4>{item.title}</h4><p>{item.summary}</p><Link to={item.href} onClick={()=>trackEvent('studio_home_universe_click',{route:item.href})}>{item.cta} <ArrowUpRight size={16} aria-hidden="true"/></Link></div>
              </article>
            ))}
          </div>
          <div className="lw-world__entry">
            <div><p className="lw-eyebrow">¿YA ERES PARTE DEL ESTUDIO?</p><h3>LA EXPERIENCIA<br/><em>CONTINÚA EN TU APP.</em></h3><p>Accede al espacio digital de atletas y entrenador. El acceso a la app es distinto de solicitar una sesión.</p></div>
            <a href={BAYONA_APP_ENTRY_URL} className="lw-world__entry-link" onClick={()=>trackEvent('studio_home_app_entry',{source:'world'})}>ABRIR MI APP / SB+ <ExternalLink size={20} aria-hidden="true"/></a>
          </div>
        </div>
      </div>
    </section>
  )
}

export function LandingFAQAndBooking() {
  const request=bookingLink('Hola Sebastián. He explorado la web, leído los recursos gratuitos y quiero valorar una sesión inicial. Me gustaría contarte mi objetivo y conocer disponibilidad y condiciones.')
  const direct=whatsAppLink('Hola Sebastián. He llegado desde la nueva web de SEBASTIAN BAYONA. Tengo una pregunta sobre clases, parkour, planes o la app.')
  return (
    <>
      <section className="lw-faq" id="preguntas-inicio" aria-labelledby="lw-faq-title">
        <div className="lw-container">
          <div className="lw-section-rule"><span>09 / RESPUESTAS ANTES DE DECIDIR</span><span>CLARIDAD · SIN LETRA PEQUEÑA</span></div>
          <div className="lw-faq__layout">
            <div className="lw-faq__lead"><p className="lw-eyebrow">LO QUE NECESITAS SABER</p><h2 id="lw-faq-title">PREGUNTA<br/><em>SIN COMPROMISO.</em></h2><p>No quiero que tomes decisiones con dudas. Estas son algunas de las preguntas más frecuentes; en cada caso encontrarás una respuesta sencilla.</p><Link to="/faq" className="lw-faq__more">VER TODAS LAS PREGUNTAS <ArrowUpRight size={18} aria-hidden="true"/></Link></div>
            <div className="lw-faq__list">
              {frequentlyAsked.map((item,i)=>(
                <details key={item.q} className="lw-faq__item">
                  <summary><span>{String(i+1).padStart(2,'0')}</span><strong>{item.q}</strong><span className="lw-faq__symbol" aria-hidden="true">+</span></summary>
                  <div className="lw-faq__answer"><p>{item.a}</p></div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="lw-decision" id="agenda" aria-labelledby="lw-decision-title">
        <div id="empieza" className="lw-decision__jump-target" aria-hidden="true" />
        <div className="lw-container">
          <div className="lw-section-rule lw-section-rule--dark"><span>10 / TU SIGUIENTE PASO REAL</span><span>UNA CONVERSACIÓN, SIN PRESIÓN</span></div>
          <div className="lw-decision__layout">
            <div className="lw-decision__story"><p className="lw-eyebrow">YA TIENES MATERIAL PARA EMPEZAR</p><h2 id="lw-decision-title">AHORA HABLEMOS<br/><em>DE TI.</em></h2><p>Ya puedes llevarte recursos, organizar un primer mes y conocer el estudio. Si quieres convertir ese punto de partida en un proceso acompañado, cuéntame tu objetivo.</p><div className="lw-decision__facts"><span><Check size={17} aria-hidden="true"/> Sin compromiso al consultar</span><span><Check size={17} aria-hidden="true"/> Presencial u online, según disponibilidad</span><span><Check size={17} aria-hidden="true"/> Primero revisamos tu situación</span></div></div>
            <div className="lw-decision__card">
              <div className="lw-decision__card-top"><CalendarDays size={27} strokeWidth={1.25} aria-hidden="true"/><span>CONVERSEMOS DE TU SIGUIENTE PASO</span></div>
              <h3>Tu primera conversación.</h3>
              <p>Cuéntame qué necesitas, qué has probado y qué te gustaría cambiar. Confirmaremos disponibilidad y opciones concretas antes de contratar.</p>
              <div className="atelier-contact__actions">
              <a href={request} className="lw-decision__primary" target="_blank" rel="noreferrer" onClick={()=>trackEvent('studio_home_booking_request',{source:'landing_final'})}>SOLICITAR MI SESIÓN INICIAL <ArrowUpRight size={20} aria-hidden="true"/></a>
              </div>
              <a href={direct} target="_blank" rel="noreferrer" className="lw-decision__secondary" onClick={()=>trackEvent('studio_home_direct_whatsapp',{source:'landing_final'})}><MessageCircle size={17} aria-hidden="true"/> PREFIERO ESCRIBIR POR WHATSAPP <ArrowRight size={16} aria-hidden="true"/></a>
              <small>Solicitar información no equivale a una cita confirmada ni implica un cobro automático.</small>
            </div>
          </div>
          <div className="lw-decision__final-links">
            <a href="#regalos-gratis"><BookOpen size={18} aria-hidden="true"/> Volver a los libros gratis</a>
            <a href="#plan-30-dias"><ClipboardList size={18} aria-hidden="true"/> Crear otro plan</a>
            <Link to="/faq"><CircleHelp size={18} aria-hidden="true"/> Más preguntas</Link>
            <a href={BAYONA_APP_ENTRY_URL}><Compass size={18} aria-hidden="true"/> Entrar a Mi App</a>
          </div>
        </div>
      </section>
    </>
  )
}
