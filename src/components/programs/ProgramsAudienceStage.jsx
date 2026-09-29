import { motion, useTransform } from 'framer-motion'
import { StickyStage } from '../../engine/scroll/StickyStage.jsx'
import { useCapabilities } from '../../engine/hooks/useCapabilities.js'
import { mediaHeroUrls } from '../../config/siteMedia.js'
import '../../styles/programs-audience-stage.css'

function MovingImage({ media, progress }) {
  const scale = useTransform(progress, [0, 1], [1.08, 1.015])
  const x = useTransform(progress, [0, 1], ['-2%', '2%'])
  const { retina, standard } = mediaHeroUrls(media)
  return <motion.img className="programs-audience-image" src={retina || media?.src} srcSet={standard && retina && standard !== retina ? `${standard} 1x, ${retina} 2x` : undefined} alt="" loading="lazy" decoding="async" style={{ scale, x }} />
}

function Frame({ item, media, index, total, progress, isStatic }) {
  return (
    <div className="programs-audience-frame">
      <div className="programs-audience-media" aria-hidden="true">
        {isStatic
          ? <img className="programs-audience-image" src={mediaHeroUrls(media).retina || media?.src} alt="" loading="lazy" decoding="async" />
          : <MovingImage media={media} progress={progress} />}
        <div className="programs-audience-scrim" />
      </div>
      <div className="programs-audience-meta" aria-hidden="true">
        <span>PUNTO DE PARTIDA</span>
        <span>{String(index + 1).padStart(2,'0')} / {String(total).padStart(2,'0')}</span>
      </div>
      <motion.article className="programs-audience-copy" aria-hidden="true" key={item.id} initial={isStatic ? false : { opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5, ease: [0.16,1,0.3,1] }}>
        <p className="programs-audience-age">{item.detail}</p>
        <h3>{item.title}</h3>
        <p className="programs-audience-lead">{item.copy}</p>
        <ul>{(item.practices ?? []).map((practice) => <li key={practice}>{practice}</li>)}</ul>
      </motion.article>
      <div className="programs-audience-dial" aria-hidden="true">
        {Array.from({ length: total }, (_, stepIndex) => <span key={stepIndex} data-active={stepIndex === index ? 'true' : undefined} data-past={stepIndex < index ? 'true' : undefined}>{String(stepIndex + 1).padStart(2,'0')}</span>)}
      </div>
    </div>
  )
}

export default function ProgramsAudienceStage({ items = [], media = [] }) {
  const { mode } = useCapabilities()
  if (!items.length) return null
  const length = mode === 'desktop' ? '430vh' : '340vh'
  return (
    <div className="programs-audience-stage">
      <header className="programs-audience-intro">
        <p>PUNTOS DE PARTIDA</p>
        <h2>Tu edad, tu nivel <span>y tu objetivo cambian la ruta.</span></h2>
        <small>Revisa las propuestas por etapa y confirma disponibilidad antes de elegir.</small>
      </header>
      <ol className="sr-only" aria-label="Propuestas por etapa">
        {items.map((item) => <li key={item.id}><h3>{item.title}</h3><p>{item.copy}</p><ul>{(item.practices ?? []).map((p) => <li key={p}>{p}</li>)}</ul></li>)}
      </ol>
      <StickyStage length={length} states={items.length} topOffset={66} allowMobile className="programs-audience-sticky">
        {({ index, progress, isStatic }) => <Frame item={items[index] ?? items[0]} media={media[index] ?? media[0]} index={index} total={items.length} progress={progress} isStatic={isStatic} />}
      </StickyStage>
      <p className="programs-audience-foot">En las cinco etapas se trabaja igual: se valora lo que puedes hacer hoy, se escribe el bloque siguiente y se revisa con tus notas.</p>
    </div>
  )
}
