import { motion, useTransform } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { sceneBackgroundProps } from '../SceneBackground.jsx'
import { siteMedia } from '../../config/siteMedia.js'
import { trackEvent } from '../../lib/analytics/analytics.js'
import { useCapabilities } from '../../engine/hooks/useCapabilities.js'
import { StickyStage } from '../../engine/scroll/StickyStage.jsx'
import '../../styles/free-value.css'

const PIECES = Object.freeze([
  Object.freeze({
    id: 'protocolo',
    marker: '01',
    tag: 'GUÍA · 7 DÍAS',
    title: 'PROTOCOLO 7 DÍAS',
    copy: 'Una primera semana con estructura: qué hacer, en qué orden y hasta dónde llegar si solo tienes veinte minutos.',
    action: 'Abrir la guía',
    href: '/resources',
  }),
  Object.freeze({
    id: 'reto',
    marker: '02',
    tag: 'WORKBOOK · 30 DÍAS',
    title: 'RETO 30 DÍAS',
    copy: 'Un taller de treinta días con guía: entrenas tú, se registra el proceso y las reglas se leen antes de entrar.',
    action: 'Ver condiciones',
    href: '/resources',
  }),
  Object.freeze({
    id: 'comunidad',
    marker: '03',
    tag: 'ACCESO ABIERTO',
    title: 'LA COMUNIDAD',
    copy: 'Entras, ves cómo entrena la gente y con qué ritmo se habla aquí. No se compra nada para leer.',
    action: 'Conocer el grupo',
    href: '/community',
  }),
  Object.freeze({
    id: 'dossier',
    marker: '04',
    tag: 'DOSSIER · PERSONALIZADO',
    title: 'DOSSIER DE ENTRADA',
    copy: 'El dossier reúne protocolo, reto y condiciones. Si añades tu contexto en la consulta, se revisa persona a persona.',
    action: 'Abrir el dossier',
    href: '/resources',
  }),
])

function DossierObject({ progress, activeIndex }) {
  const rotateX = useTransform(progress, [0, 1], [62, 26])
  const rotateY = useTransform(progress, [0, 1], [-18, 18])
  const rotateZ = useTransform(progress, [0, 1], [-7, 7])

  return (
    <motion.div
      className="free-dossier-object"
      style={{ rotateX, rotateY, rotateZ }}
      aria-hidden="true"
    >
      {PIECES.map((piece, index) => (
        <div
          className="free-dossier-sheet"
          data-active={index === activeIndex ? 'true' : undefined}
          data-past={index < activeIndex ? 'true' : undefined}
          key={piece.id}
          style={{ '--sheet-index': index }}
        >
          <span>{piece.marker}</span>
          <strong>{piece.title}</strong>
          <i />
          <small>BAYONA / ENTRADA</small>
        </div>
      ))}
      <div className="free-dossier-spine" />
    </motion.div>
  )
}

function ChallengeTheater({ progress }) {
  const speed = useTransform(progress,[0,.28,.45,1],[1.4,.95,1,1])
  const enter = useTransform(progress,[0,.25,.56,1],['16%','0%','0%','0%'])
  return (
    <div className="bayona-challenge-theater" aria-hidden="true">
      <div className="bayona-challenge-beams">
        {Array.from({length:9},(_,i)=><span key={i} style={{'--beam':i}} />)}
      </div>
      <motion.div className="bayona-challenge-screen" style={{scale:speed,x:enter}}>
        <span>UNA EXPERIENCIA GUIADA</span>
        <strong>30 DÍAS</strong>
        <p>UN DÍA A LA VEZ / SIN PROMESAS VACÍAS</p>
        <img className="bayona-challenge-screen__hero" src="/images/burst/man-running-at-the-track-960.webp" alt="" width="960" height="640" loading="lazy" decoding="async" /><div className="bayona-challenge-screen__rows"><i/><i/><i/><i/><i/></div>
      </motion.div>
      <div className="bayona-challenge-seats"><span/><span/><span/><span/><span/></div>
    </div>
  )
}

function StaticDossierObject({ activeIndex }) {
  return (
    <div className="free-dossier-object free-dossier-object--static" aria-hidden="true">
      {PIECES.map((piece, index) => (
        <div
          className="free-dossier-sheet"
          data-active={index === activeIndex ? 'true' : undefined}
          key={piece.id}
          style={{ '--sheet-index': index }}
        >
          <span>{piece.marker}</span>
          <strong>{piece.title}</strong>
          <i />
          <small>BAYONA / ENTRADA</small>
        </div>
      ))}
    </div>
  )
}

export default function FreeValue() {
  const { mode } = useCapabilities()
  const length = mode === 'desktop' ? '340vh' : '360vh'

  return (
    <section
      {...sceneBackgroundProps(siteMedia.home.freeKit, {
        className: 'free-value free-dossier',
        variant: 'hero',
        pseudo: 'after',
        position: 'center 46%',
        blur: 0,
      })}
      aria-labelledby="home-free-title"
    >
      <header className="free-dossier-intro">
        <p>UNA SOLA ENTREGA · CUATRO PIEZAS</p>
        <h2 id="home-free-title">
          EMPIEZA HOY
          <span>SIN PAGAR NADA.</span>
        </h2>
        <small>DESLIZA PARA ABRIR EL KIT</small>
      </header>

      <ol className="sr-only" aria-hidden="true" aria-label="Las cuatro piezas del kit de entrada gratuito">
        {PIECES.map((piece) => (
          <li key={piece.id}>
            <h3>{piece.title}</h3>
            <p>{piece.copy}</p>
            <Link to={piece.href}>{piece.action}</Link>
          </li>
        ))}
      </ol>

      <StickyStage
        length={length}
        states={PIECES.length}
        topOffset={66}
        allowMobile
        className="free-dossier-stage"
      >
        {({ index, progress, isStatic }) => {
          const piece = PIECES[index] ?? PIECES[0]
          const words = piece.copy.split(/\s+/)

          return (
            <div className="free-dossier-viewport" data-piece={piece.id}>
              <div className="free-dossier-visual">
                {isStatic ? (
                  <StaticDossierObject activeIndex={index} />
                ) : (
                  <>{piece.id === 'reto' ? <ChallengeTheater progress={progress} /> : <DossierObject progress={progress} activeIndex={index} />}</>
                )}
              </div>

              <motion.article
                className="free-dossier-copy"
                key={piece.id}
                initial={isStatic ? false : { opacity: 0, y: 28, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: .5, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="free-dossier-tag">{piece.tag}</p>
                <p className="free-dossier-index">{piece.marker} / {String(PIECES.length).padStart(2, '0')}</p>
                <h3>{piece.title}</h3>
                <div className="free-dossier-body">
                  {words.map((word, wordIndex) => (
                    <span key={`${word}-${wordIndex}`}>
                      {word}{wordIndex < words.length - 1 ? ' ' : ''}
                    </span>
                  ))}
                </div>
                <Link
                  className="free-dossier-action"
                  to={piece.href}
                  onClick={() => trackEvent('free_value_open', { door: piece.id, destination: piece.href })}
                >
                  {piece.action}
                  <ArrowUpRight size={15} strokeWidth={1.3} aria-hidden="true" />
                </Link>
              </motion.article>

              <div className="free-dossier-progress" aria-hidden="true">
                {PIECES.map((entry, stepIndex) => (
                  <span
                    key={entry.id}
                    data-active={stepIndex === index ? 'true' : undefined}
                    data-past={stepIndex < index ? 'true' : undefined}
                  />
                ))}
              </div>
            </div>
          )
        }}
      </StickyStage>

      <div className="free-dossier-footer">
        <Link
          to="/resources"
          onClick={() => trackEvent('free_value_open', { door: 'kit', destination: '/resources' })}
        >
          LLEVARME EL KIT COMPLETO
          <ArrowUpRight size={16} strokeWidth={1.3} aria-hidden="true" />
        </Link>
        <p>Sin cuenta · sin tarjeta · sin persecución.</p>
      </div>
    </section>
  )
}
