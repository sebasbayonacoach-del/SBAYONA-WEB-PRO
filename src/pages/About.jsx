import { Suspense, lazy } from 'react'
import { ArrowUpRight, Award, BrainCircuit, GraduationCap, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import GlobeTestimonials from '../components/GlobeTestimonials.jsx'
import AboutValuesStage from '../components/about/AboutValuesStage.jsx'
import AboutMethodStage from '../components/about/AboutMethodStage.jsx'
import { MethodSequence } from '../components/method/MethodSequence.jsx'
import { StickyStage } from '../engine/scroll/StickyStage.jsx'
import { sceneBackgroundProps } from '../components/SceneBackground.jsx'
import { PageHero, SectionLabel } from '../components/Layout'
import { siteMedia } from '../config/siteMedia.js'
import { whatsAppLink } from '../config/site.config.js'
import { useCapabilities } from '../engine/hooks/useCapabilities.js'
import '../styles/about.css'
import '../styles/about-art-direction-2026.css'
import '../styles/about-second-chapter.css'

/**
 * Los tres fundamentos, en la única forma que tienen de decirse: lo primero va
 * antes de lo segundo. La franja de la sección PROPÓSITO se dibuja con esta
 * lista, así que no puede quedar descolgada de ella.
 */
const FUNDAMENTOS = Object.freeze([
  Object.freeze(['VALORAR', 'PRESCRIBIR']),
  Object.freeze(['EXPLICAR', 'EXIGIR']),
  Object.freeze(['REVISAR', 'AJUSTAR']),
])

/* COPY 2026-09-19 · VOZ ÚNICA
   Menos texto, primera persona del plural («vamos», «empecemos juntos»),
   cero numeración decorativa, cero avisos médicos y cero justificaciones
   defensivas. La familia y el cuerpo de cada bloque los pone la escala
   nombrada de ds-tokens.css §11, no un style inline. */

const stages = [
  {
    number: '01',
    year: '2003',
    title: 'EL MOVIMIENTO',
    copy: 'Antes de vender planes, el cuerpo fue escuela: moverse era aprender, fallar, repetir y entender límites.',
  },
  {
    number: '02',
    year: '2014',
    title: 'LA PRÁCTICA DEL PARKOUR',
    copy: 'El parkour enseñó la base del método: leer el entorno, decidir bajo presión y avanzar sin perder control.',
  },
  {
    number: '03',
    year: '2019-2025',
    title: 'EXPERIENCIA Y FORMACIÓN',
    copy: 'Gimnasios, clubes y formación europea en preparación física convirtieron la intuición en un sistema que se puede explicar.',
  },
  {
    number: '04',
    year: '2026',
    title: 'NACE BAYONA',
    copy: 'BAYONA nace para unir entrenamiento, fuerza, nutrición y seguimiento en una experiencia premium, humana y honesta.',
  },
]

const values = [
  [BrainCircuit, 'CRITERIO', 'No vendemos plantillas bonitas: tomamos decisiones con contexto, objetivo y evidencia del proceso.'],
  [ShieldCheck, 'RESPETO', 'Tu punto de partida no se juzga. Se entiende antes de exigir y se protege mientras avanzas.'],
  [GraduationCap, 'EDUCACIÓN', 'Queremos que sepas qué haces, para qué sirve y cómo sostenerlo cuando no estamos mirando.'],
  [Award, 'RIGOR', 'El plan se revisa con lo que pasa de verdad, no con frases decorativas ni promesas infladas.'],
]

const methodSteps = [
  {
    number: '01',
    title: 'VALORAR',
    copy: 'Miramos punto de partida, tiempo, objetivo, energía y capacidad real de sostener el proceso.',
  },
  {
    number: '02',
    title: 'PLANIFICAR',
    copy: 'Convertimos esa lectura en una ruta progresiva que entra en tu vida sin volverse castigo.',
  },
  {
    number: '03',
    title: 'AJUSTAR',
    copy: 'Revisamos lo que responde, corregimos lo que no y convertimos dudas en una siguiente acción clara.',
  },
]

const sebastianWhatsAppUrl = whatsAppLink('Hola Sebastián, quiero que empecemos juntos con BAYONA.')

/** Capa WebGL del globo — carga diferida para proteger el LCP (Fase 11.2). */
const AboutGlobeLayer = lazy(() => import('../components/about/AboutGlobeLayer.jsx'))

/**
 * Los cuatro principios ya tenían su foco escrito en about.css (`.about-value
 * .has-pointer-effects`): un halo que sigue al cursor y levanta la tarjeta.
 * Nunca se activaba porque nadie ponía la clase ni las coordenadas. Se enciende
 * solo con puntero real y sin reduced-motion, que es para lo que está diseñada.
 */
export default function About() {
  const { reducedMotion } = useCapabilities()

  return (
    <div className="about-page">
      <PageHero
        title="DETRÁS DEL MOVIMIENTO."
        kicker="CAPÍTULO 02 · NOSOTROS"
        media={siteMedia.about.hero}
      >
        <p className="hero-subtitle">Antes de hablar de resultados, queremos entender a la persona que viene a entrenar. Así nace BAYONA.</p>
        <div className="about-editorial-hero-actions">
          <a href="#la-persona" className="about-editorial-primary">CONOCE QUIÉN ESTÁ DETRÁS <ArrowUpRight size={18} aria-hidden="true" /></a>
          <a href="#about-purpose-title" className="about-editorial-secondary">DESCUBRE EL PORQUÉ <span aria-hidden="true">↘</span></a>
        </div>
        <div className="about-editorial-hero-index" aria-hidden="true"><span>02</span><span>UNA HISTORIA / UN MÉTODO</span></div>
      </PageHero>

      <section className="about-problem-section" aria-labelledby="about-purpose-title">
        {/*
          Los tres fundamentos eran una franja de tres frases. La frase entera
          dice «A antes que B», y eso es una relación, no una etiqueta: ahora se
          ve el orden, con lo primero lleno y lo segundo esperando. La franja
          sube a la primera posición de la sección porque es lo que la sección
          afirma. Se genera de FUNDAMENTOS, así que no puede descolgarse de la
          lista.
        */}
        <div className="about-reason-strip ds-reveal ds-reveal--mask" aria-label="Los tres fundamentos de BAYONA, en orden">
          <svg
            className="about-figure about-figure--antes"
            viewBox="0 0 640 44"
            aria-hidden="true"
            focusable="false"
          >
            {FUNDAMENTOS.map((_, index) => {
              const centro = 107 + index * 213
              return (
                <g key={index}>
                  <rect className="about-antes-lleno" x={centro - 62} y="11" width="22" height="22" />
                  <path className="about-antes-flecha" d={`M${centro - 28} 22 H${centro + 24}`} />
                  <polygon className="about-antes-punta" points={`${centro + 24},17 ${centro + 34},22 ${centro + 24},27`} />
                  <rect className="about-antes-hueco" x={centro + 42} y="11" width="22" height="22" />
                </g>
              )
            })}
          </svg>
          <ul className="about-reason-list">
            {FUNDAMENTOS.map(([antes, despues]) => (
              <li key={antes}>{`${antes} ANTES DE ${despues}`}</li>
            ))}
          </ul>
        </div>
        <div className="about-problem section-shell ds-reveal ds-reveal--shift">
          <span className="about-vertical-word" aria-hidden="true">PROPÓSITO</span>
          <div className="about-problem-heading">
            <SectionLabel>POR QUÉ BAYONA</SectionLabel>
            <h2 id="about-purpose-title">UN PLAN SIRVE<br aria-hidden="true" /> <span>CUANDO ENCAJA CONTIGO.</span></h2>
          </div>
          <p className="about-problem-copy">
            No necesitas encajar en un plan diseñado para otra persona. Necesitas un camino que entienda tu trabajo, tu energía, tu historia y tus objetivos. Por eso primero escuchamos; después diseñamos.
          </p>
        </div>
      </section>

      <section className="about-founder" id="la-persona" aria-labelledby="about-founder-title">
        <div className="about-founder__layout section-shell">
          <div className="about-founder__visual">
            <img src="/images/bayona-generated/about-timeline-movement-1600.webp" alt="Persona en movimiento frente al mar durante el atardecer" loading="lazy" decoding="async" />
            <span className="about-founder__image-marker">EL MOVIMIENTO COMO PUNTO DE PARTIDA</span>
            <span className="about-founder__image-number" aria-hidden="true">MOVIMIENTO / ORIGEN</span>
          </div>
          <div className="about-founder__editorial">
            <span className="about-founder__eyebrow">LA PERSONA DETRÁS DE BAYONA</span>
            <h2 id="about-founder-title">UNA MARCA.<br /><em>UNA PERSONA REAL.</em></h2>
            <p className="about-founder__lead">Soy Sebastián Bayona. El movimiento fue mi primera forma de aprender, y hoy es la base del trabajo que comparto con quienes entrenan conmigo.</p>
            <p className="about-founder__copy">El parkour me enseñó a observar antes de actuar. El entrenamiento y el estudio me llevaron a transformar esa experiencia en algo más útil: una estructura que pueda adaptarse a distintas personas, capacidades y momentos de la vida.</p>
            <div className="about-founder__signature">
              <span className="about-founder__signature-mark" aria-hidden="true">SB.</span>
              <span><strong>SEBASTIÁN BAYONA</strong><small>CREADOR DE BAYONA · ENTRENAMIENTO Y MOVIMIENTO</small></span>
            </div>
            <Link to="/programs" className="about-founder__link">CONOCE CÓMO TRABAJAMOS <ArrowUpRight size={18} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section
        {...sceneBackgroundProps(siteMedia.about.story, {
          className: 'about-story about-story-scene',
          variant: 'hero',
          pseudo: 'after',
          motion: true,
          position: 'center 34%',
          blur: 1,
        })}
        aria-labelledby="about-story-title"
      >
        <div className="about-story-heading section-shell ds-reveal" data-immersive="clip">
          <span className="about-vertical-word about-vertical-word--light" aria-hidden="true">RECORRIDO</span>
          <div>
            <SectionLabel>EL RECORRIDO</SectionLabel>
            <h2 id="about-story-title">DEL PRIMER SALTO<br /><span>A UN MÉTODO CON DIRECCIÓN.</span></h2>
            <p className="about-problem-copy">
              Una historia de práctica, preguntas y aprendizaje. Cada etapa explica por qué el método de hoy empieza escuchando y termina ajustándose a la vida real.
            </p>
          </div>
        </div>
        {/*
          FASE 8 · BLOQUE G — "LA LÍNEA DE VIDA" (sección RECORRIDO de About).
          Identidad PROPIA, tercera y distinta: la Home recorre una secuencia
          lógica en horizontal; parkour sube una escalera; About ES EL TIEMPO —
          una biografía. El marco queda fijado y cada etapa reemplaza a la
          anterior en el mismo plano, con el año como sello gigante que
          permanece unos instantes y cede su sitio al siguiente. La historia
          de una vida se lee con el scroll, no como lista de credenciales.
          Motor: StickyStage del engine (2D puro). Reduced-motion/móvil: pila
          estática legible por diseño del componente.
        */}
        <StickyStage
          length="160vh"
          states={stages.length}
          className="about-timeline about-timeline--stage section-shell"
        >
          {({ index, isStatic }) => {
            const visibleStages = isStatic
              ? [{ stage: stages[index], stageIndex: index }]
              : stages.map((stage, stageIndex) => ({ stage, stageIndex }))

            return (
              <div className="about-timeline-stage" aria-live="polite">
                {visibleStages.map(({ stage, stageIndex }) => {
                  const isActive = isStatic || stageIndex === index
                  return (
                    <article
                      key={stage.number}
                      className={[
                        'about-timeline-entry',
                        'about-timeline-entry--stage',
                        isActive ? 'about-timeline-entry--active' : '',
                      ].filter(Boolean).join(' ')}
                      data-year={stage.year}
                      aria-current={isActive ? 'step' : undefined}
                    >
                      <div className="about-timeline-meta">
                        <time>{stage.year}</time>
                      </div>
                      <div className="about-timeline-copy">
                        <h3>{stage.title}</h3>
                        <p>{stage.copy}</p>
                      </div>
                    </article>
                  )
                })}
              </div>
            )
          }}
        </StickyStage>
        <ol className="about-chronicle-mobile section-shell" aria-label="Los cuatro hitos del recorrido BAYONA">
          {stages.map((stage) => (
            <li key={stage.number} className="about-chronicle-mobile__item">
              <div className="about-chronicle-mobile__index"><span>{stage.number}</span><time>{stage.year}</time></div>
              <div className="about-chronicle-mobile__story"><h3>{stage.title}</h3><p>{stage.copy}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <section className="about-values-section" aria-labelledby="about-values-title">
        <div className="about-values section-shell">
          <AboutValuesStage items={values} />
        </div>
      </section>

      <section
        className="about-globe-section about-globe-testimonials-section section-shell"
        aria-labelledby="about-globe-title"
      >
        <div className="about-globe-copy about-globe-testimonials-heading ds-reveal ds-reveal--spatial">
          <SectionLabel>TRAYECTORIA E IMPACTO</SectionLabel>
          <h2 id="about-globe-title">DE COLOMBIA A ESPAÑA.<br /><span>HISTORIAS QUE SIGUEN.</span></h2>
          <p>
            Cada punto abre una experiencia publicada. El mapa muestra el recorrido que hoy podemos enseñar:
            Bogotá, Valencia, Madrid, Miami y Buenos Aires.
          </p>
        </div>
        {/* Capa WebGL 3D — atmósfera detrás del mapa interactivo (Fase 11.2). */}
        <Suspense fallback={null}>
          <AboutGlobeLayer />
        </Suspense>
        <GlobeTestimonials />
      </section>



      <section
        {...sceneBackgroundProps(siteMedia.about.values[0], {
          /*
            §9 del documento de dirección: una imagen no puede resolver dos
            momentos distintos de la misma página. Hasta aquí el bloque del
            método repetía la mansión del hero (`values[3]`); pasa a la mesa de
            decisión, que es literalmente lo que la sección explica.
          */
          className: 'about-method about-method-scene',
          variant: 'hero',
          pseudo: 'after',
          motion: true,
          position: 'center 36%',
          blur: 1,
        })}
        aria-labelledby="about-method-title"
      >
        <div className="about-method-inner section-shell" data-immersive="clip">
          <span className="about-vertical-word about-vertical-word--light" aria-hidden="true">PROCESO</span>
          <div className="about-method-heading ds-reveal ds-reveal--mask">
            <SectionLabel>EL MÉTODO</SectionLabel>
            <h2 id="about-method-title">NO ES UNA RUTINA.<br /><span>ES UNA DECISIÓN TRAS OTRA.</span></h2>
            <p>Qué miramos, qué decidimos con eso y cómo seguimos cuando la vida real aparece.</p>
          </div>

          {/* Fuente semántica compartida para lectura accesible del método. */}
          <MethodSequence items={methodSteps} className="sr-only" label="Las tres fases del método BAYONA" />
          <AboutMethodStage items={methodSteps} />

          <blockquote>
            EL CAMINO NO EMPIEZA CON EXIGIRTE MÁS. EMPIEZA CON ENTENDER POR DÓNDE SEGUIR.
          </blockquote>

          <div className="about-cta-actions">
            <Link to="/programs" className="cta-primary">
              EMPEZAR JUNTOS
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
            <a
              href={sebastianWhatsAppUrl}
              className="cta-secondary"
              target="_blank"
              rel="noreferrer"
            >
              HABLAMOS
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
