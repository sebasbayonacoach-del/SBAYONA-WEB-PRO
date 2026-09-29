import { ArrowDown, ArrowRight, Check, Clock3, MapPin, ShieldCheck, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SectionLabel } from '../components/Layout.jsx'
import { sceneBackgroundProps } from '../components/SceneBackground.jsx'
import VideoSection from '../components/VideoSection.jsx'
import { siteMedia } from '../config/siteMedia.js'
import { whatsAppLink } from '../config/site.config.js'
import { StickyStage } from '../engine/scroll/StickyStage.jsx'
import { Reveal } from '../engine/motion/Reveal.jsx'
import '../styles/parkour-academy.css'

/* COPY 2026-09-19 · VOZ ÚNICA
   Menos texto, primera persona del plural, cero numeración decorativa en las
   preguntas, cero avisos sanitarios y cero texto defensivo. La progresión
   conserva su número porque nombra el peldaño, no porque decore.

   PASO 2026-09-22 (dirección §14)
   - El plano cenital en SVG sale: era un dibujo decorativo sobre una idea que
     ya se cuenta mejor con la forma de una sesión. Entra un mapa de ruta real,
     con los cinco tramos por los que pasa cualquier clase.
   - Las tarjetas de edad se abren: la flecha ya estaba, pero no llevaba a
     ningún sitio. Ahora cada etapa despliega lo que se lleva ese día.
   - Los niveles ganan preview: cada peldaño dice qué se ve en él y con qué se
     sube al siguiente, en su propia ficha.
   - El método deja de ser una lista: son tres escenas (seguridad, técnica,
     confianza) con fotografía propia, y la progresión vive en los niveles.
   - La seguridad y el cierre eran dos pantallas completas de fondo. Se quedan
     su mensaje, no su ocupación. */

const sessionMap = [
  ['Llegada', 'Se cambia el chip: fuera el móvil, dentro el cuerpo.'],
  ['Activación', 'Tobillo, rodilla, cadera y muñecas antes de cualquier salto.'],
  ['Bloque técnico', 'Un gesto nuevo, descompuesto en pasos que sí puedes hacer.'],
  ['Trabajo por niveles', 'Cada cual en su peldaño del mismo espacio. Nadie espera a nadie.'],
  ['Cierre', 'Se cuenta qué salió y qué se intenta la próxima.'],
]

const agePaths = [
  {
    range: '8—12',
    title: 'EXPLORADORES',
    copy: 'Juego, coordinación y confianza para moverse con atención.',
    outcome: 'Aprenden a caer, mirar y decidir sin prisa.',
    benefits: [
      'Cae antes que salta: recepción y rodadura desde el primer día.',
      'Juegos de persecución y equilibrio donde la técnica entra sin darse cuenta.',
      'Cada clase termina contando qué se atrevió a hacer cada uno.',
    ],
  },
  {
    range: '13—17',
    title: 'IMPULSO',
    copy: 'Técnica y fuerza para convertir energía en movimiento controlado.',
    outcome: 'Canalizan intensidad con reglas, retos y progresión.',
    benefits: [
      'Pasavallas, precisión y saltos con una progresión escrita, no a ver qué sale.',
      'Fuerza con peso corporal: dominar el propio cuerpo antes que añadir altura.',
      'Retos por niveles: se sube cuando la ejecución sale limpia.',
    ],
  },
  {
    range: '18+',
    title: 'MOVIMIENTO ADULTO',
    copy: 'Entramos al parkour paso a paso, con o sin experiencia.',
    outcome: 'Recuperan agilidad sin tener que demostrar nada.',
    benefits: [
      'Grupo de adultos: nadie empieza después que nadie.',
      'Activación larga y descarga: el cuerpo llega de la oficina, no del gimnasio.',
      'Altura y distancia se eligen contigo, no se imponen.',
    ],
  },
]

const levels = [
  [
    '01',
    'BASE',
    'Aterrizar antes de volar',
    ['Recepciones', 'Equilibrio', 'Desplazamientos', 'Fuerza esencial'],
    'Se ve en: caes de un metro sin ruido y sigues de pie.',
    'Subes cuando: tres recepciones seguidas salen iguales.',
  ],
  [
    '02',
    'FLUJO',
    'Conectar decisiones',
    ['Saltos de precisión', 'Pasavallas', 'Escalada', 'Secuencias'],
    'Se ve en: encadenas tres apoyos sin parar a pensar el siguiente.',
    'Subes cuando: eliges la salida del obstáculo, no te la decimos nosotros.',
  ],
  [
    '03',
    'RENDIMIENTO',
    'Refinar con criterio',
    ['Eficiencia', 'Potencia', 'Lectura del entorno', 'Autonomía técnica'],
    'Se ve en: lees una línea de obstáculos y sabes por dónde te sale cara.',
    'Subes cuando: entrenas solo y vuelves con las dudas correctas.',
  ],
]

const method = [
  {
    id: 'seguridad',
    scene: 'safety',
    title: 'Seguridad',
    headline: 'VALENTÍA NO ES',
    headlineAccent: 'IMPROVISACIÓN.',
    copy: 'Preparación específica, progresiones observables y permiso para parar. Nadie ejecuta nada porque sí: se mide antes de subir.',
    detail: ['Activación completa en cada clase', 'Altura decidida contigo', 'Parar también es técnica'],
  },
  {
    id: 'tecnica',
    scene: 'levels',
    title: 'Técnica',
    headline: 'UN GESTO SE DESCOMPONE',
    headlineAccent: 'O NO SE ENSEÑA.',
    copy: 'Cada salto, cada apoyo y cada caída se divide en partes que sí puedes hacer hoy. La dificultad se añade cuando la parte sale limpia.',
    detail: ['Recepción, impulso y lectura por separado', 'Corrección en la misma serie', 'Vídeo corto para ver lo que no sientes'],
  },
  {
    id: 'confianza',
    scene: 'closing',
    title: 'Confianza',
    headline: 'EL MIEDO SE TRADUCE',
    headlineAccent: 'EN INFORMACIÓN.',
    copy: 'Antes de saltar se mira: de qué caes, dónde apoyas, qué haces si te quedas corto. La calma no es falta de miedo, es saber leer el entorno.',
    detail: ['Elegir la salida, no recibirla hecha', 'Fallar en progresión baja', 'Contar el fallo en voz alta al cerrar'],
  },
]

const faqs = [
  ['¿Necesito experiencia previa?', 'No. Empezamos por los fundamentos y confirmamos edad y experiencia antes de la primera clase.'],
  ['¿El parkour es solo para personas jóvenes?', 'No. Adaptamos la dificultad a tu punto de partida.'],
  ['¿Qué necesito llevar?', 'Ropa cómoda, calzado con agarre y agua. Te enviamos el detalle al confirmar la sesión.'],
  ['¿Dónde y cuándo son las clases?', 'Te lo confirmamos antes de reservar. Ahora puedes dejar tu interés sin pagar nada.'],
  ['¿Cómo trabajamos la seguridad?', 'Preparación específica y progresiones a tu nivel. Nadie te obliga a ejecutar nada.'],
]

const interestUrl = whatsAppLink('Hola BAYONA, quiero que empecemos juntos en la Academia de Parkour.')

export default function ParkourAcademy() {
  const media = siteMedia.parkourAcademy

  return (
    <div className="parkour-academy">
      <section
        {...sceneBackgroundProps(media.hero, {
          className: 'academy-hero', variant: 'hero', motion: true, position: 'center 38%',
        })}
        aria-labelledby="academy-title"
      >
        <div className="academy-hero-inner">
          <div className="academy-hero-copy">
            <SectionLabel>BAYONA / PARKOUR ACADEMY</SectionLabel>
            <Reveal as="h1" id="academy-title">GANDÍA.<br /><span>LA CIUDAD</span><br />SE APRENDE EN MOVIMIENTO.</Reveal>
            <Reveal as="p" delay={0.18}>Parkour con técnica, fuerza y criterio: no buscamos riesgo; buscamos control, confianza y lectura del entorno.</Reveal>
            <div className="academy-actions">
              <a className="academy-action academy-action--primary" href={interestUrl} target="_blank" rel="noreferrer">
                EMPEZAMOS JUNTOS <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a className="academy-action academy-action--quiet" href="#academy-method">
                VER EL MÉTODO <ArrowDown size={17} aria-hidden="true" />
              </a>
            </div>
            <small>Interés abierto · Sin pago · Sede y horarios por confirmar</small>
          </div>
          <div className="academy-hero-words" aria-hidden="true">
            <span>FUERZA</span><span>CONTROL</span><span>ADAPTACIÓN</span>
          </div>
        </div>
      </section>

      <aside className="academy-principles ds-reveal ds-reveal--shift" aria-label="Principios de la Academia">
        <span>NO COMPITES CONTRA OTRO CUERPO</span>
        <span>PROGRESAS DESDE TU NIVEL</span>
        <span>LA TÉCNICA PRECEDE AL RIESGO</span>
      </aside>

      <section className="academy-section academy-paths" id="academy-paths" aria-labelledby="academy-paths-title">
        <header className="academy-heading" data-immersive="clip">
          <SectionLabel>UN LENGUAJE PARA CADA ETAPA</SectionLabel>
          <h2 id="academy-paths-title">NO HAY UN CUERPO IDEAL.<br /><span>HAY UN SIGUIENTE MOVIMIENTO.</span></h2>
          <p>Compartimos método, no presión. Empezamos donde estás y subimos cuando el cuerpo lo demuestra.</p>
        </header>

        {/* El plano cenital en SVG se fue: no decía nada que la lista de etapas
            no diga mejor. En su lugar, la forma real de una clase, en cinco
            tramos leídos de arriba abajo. */}
        <div className="academy-session-map" aria-labelledby="academy-session-map-title">
          <h3 id="academy-session-map-title">ASÍ ES UNA CLASE</h3>
          <ol>
            {sessionMap.map(([name, detail], index) => (
              <li key={name} style={{ '--stop': index + 1 }}>
                <span className="academy-stop-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <strong>{name}</strong>
                  <p>{detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Etapas: la flecha ahora abre. Cada tarjeta despliega lo que se lleva
            ese día en su grupo, que es lo que se pregunta antes de apuntar.
            PASO 2026-09-22 · anotaciones 33 y 34 («la flecha no hace nada,
            diseña algo»): el mando se dibuja como control —chip con filete,
            rótula VER/CERRAR y la flecha apuntando hacia abajo, que es hacia
            donde se abre— y el panel sale debajo, no al lado. */}
        <div className="academy-age-track">
          {agePaths.map(({ range, title, copy, outcome, benefits }) => (
            <details className="academy-age" key={range}>
              <summary>
                <strong>{range}</strong>
                <span>
                  <span className="academy-age-kicker">Ruta de entrada</span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </span>
                <span className="academy-age-open" aria-hidden="true">
                  <span className="academy-age-open-in">VER</span>
                  <span className="academy-age-open-out">CERRAR</span>
                  <ArrowRight className="academy-age-arrow" size={16} aria-hidden="true" />
                </span>
              </summary>
              <div className="academy-age-panel">
                <em>{outcome}</em>
                <ul>
                  {benefits.map((benefit) => <li key={benefit}><Check size={15} aria-hidden="true" />{benefit}</li>)}
                </ul>
                <a href={interestUrl} target="_blank" rel="noreferrer">APUNTAR A ESTA ETAPA <ArrowRight size={15} aria-hidden="true" /></a>
              </div>
            </details>
          ))}
        </div>
        <aside className="academy-zero-step" aria-label="Entrada suave a la academia">
          <span>NIVEL CERO</span>
          <p>Si todavía no quieres reservar, entra primero a la comunidad. Ves la cultura, haces preguntas y decides sin presión.</p>
          <Link to="/community">CONOCER LA COMUNIDAD <ArrowRight size={16} aria-hidden="true" /></Link>
        </aside>
      </section>

      <section className="academy-section academy-levels" aria-labelledby="academy-levels-title">
        <header className="academy-heading academy-heading--compact ds-reveal ds-reveal--spatial" data-immersive="clip">
          <SectionLabel>PROGRESIÓN VISIBLE</SectionLabel>
          <h2 id="academy-levels-title">TRES NIVELES.<br /><span>NINGÚN ATAJO.</span></h2>
          <p>Subimos cuando lo ves en tu ejecución, no cuando lo dice el calendario ni el ego.</p>
        </header>
        {/*
          FASE 8 · BLOQUE F — "LA ESCALERA" (cinematic-stage 2D del blueprint de
          parkour). La escalera sigue: el recorrido es VERTICAL y ASCENDENTE.
          Cada peldaño gana su propia preview: qué se ve en él y con qué se sube
          al siguiente, para que el nivel no sea solo un título con una lista.
        */}
        <StickyStage length="180vh" states={levels.length} className="academy-level-grid academy-level-grid--stage">
          {({ index, isStatic }) => (
            <div
              className="academy-level-stage"
              aria-live="polite"
              style={{ '--stage-fill': `${((index + 1) / levels.length) * 100}%` }}
            >
              {levels
                .filter((_, levelIndex) => (isStatic ? levelIndex === index : true))
                .map(([number, title, subtitle, skills, seen, promotion], levelIndex) => {
                const isActive = levelIndex === index
                const isPast = levelIndex < index
                return (
                  <article
                    key={number}
                    className={[
                      'academy-level',
                      'academy-level--stage',
                      isActive ? 'academy-level--active' : '',
                      isPast ? 'academy-level--past' : '',
                    ].filter(Boolean).join(' ')}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    <div className="academy-level-preview" aria-hidden="true">
                      <span className="academy-level-preview-frame">{number}</span>
                      <span className="academy-level-preview-tag">PREVIEW · {title}</span>
                    </div>
                    <span>{number}</span><p>{subtitle}</p><h3>{title}</h3>
                    <ul>{skills.map((skill) => <li key={skill}>{skill}</li>)}</ul>
                    <dl className="academy-level-criteria">
                      <div><dt>Se ve en</dt><dd>{seen.replace('Se ve en: ', '')}</dd></div>
                      <div><dt>Subes cuando</dt><dd>{promotion.replace('Subes cuando: ', '')}</dd></div>
                    </dl>
                  </article>
                )
              })}
            </div>
          )}
        </StickyStage>
      </section>

      {/* Tres escenas, no cuatro líneas sueltas. La seguridad y la confianza
          vivían cada una en su propia pantalla de fondo; aquí pasan a ser el
          método en sí, con fotografía y detalle por escena. */}
      <section className="academy-section academy-method" id="academy-method" aria-labelledby="academy-method-title">
        <header className="academy-heading" data-immersive="clip">
          <SectionLabel>EL MÉTODO BAYONA</SectionLabel>
          <h2 id="academy-method-title">EL MOVIMIENTO SE ENSEÑA.<br /><span>LA CONFIANZA SE GANA.</span></h2>
        </header>
        <div className="academy-method-scenes">
          {method.map((step, index) => (
            <article
              key={step.id}
              className={`academy-scene ${index % 2 === 1 ? 'is-reversed' : ''}`.trim()}
            >
              <div
                {...sceneBackgroundProps(media[step.scene], {
                  className: 'academy-scene-media',
                  variant: 'subtle',
                  position: step.scene === 'safety' ? 'center 34%' : 'center 42%',
                })}
              >
                <span className="academy-scene-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              </div>
              <div className="academy-scene-copy">
                <p className="academy-scene-kicker">{step.title}</p>
                <h3>{step.headline}<br /><span>{step.headlineAccent}</span></h3>
                <p>{step.copy}</p>
                <ul>
                  {step.detail.map((item) => <li key={item}>{item}</li>)}
                </ul>
                {step.id === 'seguridad' && <ShieldCheck className="academy-scene-mark" size={30} aria-hidden="true" />}
              </div>
            </article>
          ))}
        </div>
        {/* Anotación 35: «puedes hacer un espacio para un vídeo». Entra el
            mismo módulo que ya usa / y /programs —`VideoSection`, con el marco
            de reproductor, el rótulo de duración y el estado «próximamente»—,
            que es la forma honesta de reservar el hueco sin inventarse una
            reproducción. Se queda dentro del método: es ahí donde una progresión
            se entiende mirándola y no leyéndola. */}
        <VideoSection
          title="ASÍ SE DESCOMPONE UN SALTO"
          subtitle="Vídeo corto grabado en clase: lectura del obstáculo, apoyo, caída y salida, sin montaje."
          poster={media.hero.src}
          duration="90 SEG"
          placement="contained"
        />
      </section>

      <section className="academy-section academy-logistics" aria-labelledby="academy-logistics-title">
        <header className="academy-heading academy-heading--compact">
          <SectionLabel>PRIMERA APERTURA</SectionLabel>
          <h2 id="academy-logistics-title">DEJA TU INTERÉS.<br /><span>TE AVISAMOS CUANDO SEA REAL.</span></h2>
        </header>
        <ul className="academy-logistics-strip">
          <li><Users size={18} aria-hidden="true" /><span>FORMATO</span><strong>Presencial</strong><p>Organizamos por edad, experiencia y disponibilidad real.</p></li>
          <li><Clock3 size={18} aria-hidden="true" /><span>HORARIOS</span><strong>Por confirmar</strong><p>Recibirás franjas claras antes de aceptar una plaza.</p></li>
          <li><MapPin size={18} aria-hidden="true" /><span>UBICACIÓN</span><strong>Gandía · Por confirmar</strong><p>La sede exacta se comunica antes de cualquier reserva o pago.</p></li>
        </ul>
      </section>

      {/* El FAQ negro funcionaba y se queda; lo que faltaba era la costura: ya
          no cae como un bloque suelto, entra con la misma línea cálida del resto
          y cierra con el siguiente paso real. */}
      <section className="academy-section academy-faq" aria-labelledby="academy-faq-title">
        <header className="academy-heading academy-heading--compact">
          <SectionLabel>ANTES DE EMPEZAR</SectionLabel>
          <h2 id="academy-faq-title">PREGUNTAS CLARAS.<br /><span>RESPUESTAS CORTAS.</span></h2>
        </header>
        <div className="academy-faq-list">
          {faqs.map(([question, answer]) => (
            <details key={question}><summary>{question}</summary><p>{answer}</p></details>
          ))}
        </div>
        <p className="academy-faq-foot">
          ¿Falta la tuya? Se responde por WhatsApp antes de que dejes tu interés.
        </p>
      </section>

      <section className="academy-closing" aria-labelledby="academy-closing-title">
        <div>
          <SectionLabel>EL PRIMER OBSTÁCULO ES EMPEZAR</SectionLabel>
          <h2 id="academy-closing-title">TU PRÓXIMO<br /><span>MOVIMIENTO.</span></h2>
          <p>Deja tu interés y te escribimos cuando haya sede, horarios y condiciones reales en Gandía.</p>
          <a className="academy-action academy-action--primary" href={interestUrl} target="_blank" rel="noreferrer">
            EMPEZAMOS JUNTOS <ArrowRight size={18} aria-hidden="true" />
          </a>
          <Link className="academy-program-link" to="/programs">Mientras tanto, veamos los programas</Link>
        </div>
      </section>
    </div>
  )
}
