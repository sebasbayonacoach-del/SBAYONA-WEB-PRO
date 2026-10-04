import { motion, useTransform } from 'framer-motion'
import { useCapabilities } from '../../engine/hooks/useCapabilities.js'
import { StickyStage } from '../../engine/scroll/StickyStage.jsx'
import '../../styles/vision-shift-stage.css'
import '../../styles/vision-shift-elite.css'
import '../../styles/vision-spatial-gallery.css'
import '../../styles/vision-device-mockups.css'

const VISION_LABELS = ['ACCIÓN', 'LECTURA', 'INTENCIÓN', 'DIRECCIÓN', 'CONTINUIDAD']

// Diez fotografías deportivas existentes en el catálogo local y comprobadas
// en public/images/burst. Sin requests a bancos externos ni recursos ficticios.
export const VISION_STORY_FRAMES = Object.freeze([
  { id: 'preparacion', file: 'jogger-laces-up', label: 'Preparación', kind: 'phone' },
  { id: 'primer-paso', file: 'one-arm-push-up', label: 'Primer paso', kind: 'coach' },
  { id: 'aprendizaje', file: 'woman-strong-band-exercise', label: 'Aprendizaje', kind: 'phone' },
  { id: 'progresion', file: 'weighted-squat-exercise', label: 'Progresión', kind: 'desktop' },
  { id: 'movilidad', file: 'person-stretching-in-fitness-clothing', label: 'Movilidad', kind: 'coach' },
  { id: 'ritmo', file: 'man-running-at-the-track', label: 'Ritmo', kind: 'phone' },
  { id: 'control', file: 'core-strength-fitness', label: 'Control', kind: 'desktop' },
  { id: 'fuerza', file: 'woman-lifts-free-weights', label: 'Fuerza', kind: 'phone' },
  { id: 'perspectiva', file: 'sunset-hike-to-the-summit', label: 'Perspectiva', kind: 'coach' },
  { id: 'continuidad', file: 'strong-women-planking', label: 'Continuidad', kind: 'phone' },
])

// Movimiento sin React re-render por pixel; MotionValue controla las diez
// placas. CSS 3D usa transform-style:preserve-3d y perspectiva real.
function GalleryFrame({ progress, frame, frameIndex }) {
  const transform = useTransform(progress, (value) => {
    const distance = frameIndex - Math.max(0, Math.min(1, value)) * 9
    const depth = Math.min(4, Math.abs(distance))
    return `translate3d(${distance * 29}%, ${depth * 4}%, ${-depth * 166}px) rotateY(${distance * -8}deg) rotateZ(${distance * 1.65}deg) scale(${1 - depth * 0.085})`
  })
  const opacity = useTransform(progress, (value) => {
    const distance = Math.abs(frameIndex - Math.max(0, Math.min(1, value)) * 9)
    return Math.max(0, Math.min(1, 1.2 - distance * 0.36))
  })

  return (
    <motion.figure
      className={`vision-spatial-frame vision-spatial-frame--${frame.kind}`}
      style={{ transform, opacity, zIndex: 10 - frameIndex }}
      data-frame={frame.id}
      data-device={frame.kind}
    >
      <div className="vision-spatial-device">
        {frame.kind === 'phone' && (
          <div className="vision-spatial-phone-bar" aria-hidden="true">
            <span className="vision-spatial-device-brand">BAYONA</span>
            <span className="vision-spatial-phone-status">● ●</span>
          </div>
        )}
        {frame.kind === 'desktop' && <div className="vision-spatial-desktop-bar" aria-hidden="true"><span>● ● ●</span><strong>BAYONA / MOVIMIENTO</strong></div>}
        <div className="vision-spatial-screen">
          <img
            src={`/images/burst/${frame.file}-960.webp`}
            alt=""
            width="960"
            height="640"
            loading={frameIndex < 2 ? 'eager' : 'lazy'}
            decoding="async"
            draggable="false"
          />
          {frame.kind === 'phone' && <div className="vision-spatial-screen-overlay" aria-hidden="true"><strong>UNA SEMANA.<br />UN SIGUIENTE PASO.</strong><small>PROCESO BAYONA</small></div>}
        </div>
        {frame.kind === 'desktop' && <div className="vision-spatial-keyboard" aria-hidden="true" />}
      </div>
      <figcaption>
        <span>{String(frameIndex + 1).padStart(2, '0')} / 10</span>
        <span>{frame.label}</span>
      </figcaption>
    </motion.figure>
  )
}

function SpatialGallery({ progress }) {
  const rotation = useTransform(progress, [0, 1], [-9, 11])
  return (
    <div className="vision-spatial-environment" aria-hidden="true" data-spatial-gallery="10">
      <div className="vision-spatial-depth">
        <span className="vision-spatial-depth__plane vision-spatial-depth__plane--rear" />
        <span className="vision-spatial-depth__plane vision-spatial-depth__plane--middle" />
        <span className="vision-spatial-depth__floor" />
      </div>
      <motion.div className="vision-spatial-track" style={{ rotateY: rotation }}>
        {VISION_STORY_FRAMES.map((frame, frameIndex) => (
          <GalleryFrame
            frame={frame}
            frameIndex={frameIndex}
            progress={progress}
            key={frame.id}
          />
        ))}
      </motion.div>
      <div className="vision-spatial-timeline">
        {VISION_STORY_FRAMES.map((frame, frameIndex) => (
          <span key={frame.id}>
            <span className="sr-only">{frame.label}</span>
            <span className="vision-spatial-timeline__line" />
            {frameIndex === 0 || frameIndex === VISION_STORY_FRAMES.length - 1
              ? <small>{String(frameIndex + 1).padStart(2, '0')}</small>
              : null}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function VisionShiftStage({ block }) {
  const { mode } = useCapabilities()
  const items = block?.items ?? []
  if (!items.length) return null

  const length = mode === 'desktop' ? '440vh' : '330vh'

  return (
    <div className="vision-shift">
      <header className="vision-shift-intro">
        <p>LO PRIMERO QUE CAMBIA</p>
        <h2 id="home-vision-heading">
          {block.heading.endsWith('A CIEGAS.') ? (
            <>{block.heading.slice(0, -'A CIEGAS.'.length)}<em>A CIEGAS.</em></>
          ) : block.heading}
        </h2>
        <span>{block.body}</span>
        <a className="vision-shift-follow" href="#problemas">
          VAMOS A VER CÓMO FUNCIONA <span aria-hidden="true">↓</span>
        </a>
      </header>

      <ol className="sr-only" aria-label="Cambios que notas cuando entrenas con dirección">
        {items.map((item) => (
          <li key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </li>
        ))}
      </ol>

      <StickyStage
        length={length}
        states={items.length}
        topOffset={66}
        allowMobile
        className="vision-shift-stage vision-shift-stage--spatial"
      >
        {({ index, progress, isStatic }) => {
          const item = items[index] ?? items[0]
          const isContinuity = item.id === 'continuity'

          return (
            <div className="vision-shift-viewport">
              <div className="vision-shift-visual">
                {!isStatic && <SpatialGallery progress={progress} />}
              </div>

              <motion.article
                className="vision-shift-copy"
                aria-hidden="true"
                key={item.id}
                initial={isStatic ? false : { opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <p>{VISION_LABELS[index] ?? item.marker}</p>
                <h3>{item.title}</h3>
                {isStatic && <span className="vision-shift-summary">{item.body}</span>}
                {isContinuity && !isStatic && (
                  <p className="vision-spatial-promise">
                    Sin entrenar por rachas. Un proceso que puedes adaptar a tu vida, incluso cuando cambia tu semana.
                  </p>
                )}
              </motion.article>
              {isContinuity && (
                <a className="vision-spatial-cta" href="/programs">
                  DESCUBRE TU PROGRAMA <span aria-hidden="true">↗</span>
                </a>
              )}
              <p className="vision-shift-counter" aria-hidden="true">
                {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
              </p>
            </div>
          )
        }}
      </StickyStage>
    </div>
  )
}
