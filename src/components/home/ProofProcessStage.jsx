import NarrativeIntro from './NarrativeIntro.jsx'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useCapabilities } from '../../engine/hooks/useCapabilities.js'
import { StickyStage } from '../../engine/scroll/StickyStage.jsx'
import '../../styles/proof-process-stage.css'
import '../../styles/proof-workbook-elite.css'

const STEPS = ['CONTEXTO', 'PLAN', 'AJUSTE']
const FOLIO = [
  { label: '01 / OBSERVAR', title: 'PARTIMOS DE TU CONTEXTO', note: 'Movimiento, experiencia y objetivos' },
  { label: '02 / DISEÑAR', title: 'TU RUTA, POR ESCRITO', note: 'Secuencia clara y progresiva' },
  { label: '03 / AJUSTAR', title: 'MEDIR Y REVISAR', note: 'Decisiones según tu evolución' },
]

function WorkbookPreview({ progress, activeIndex, isStatic }) {
  const fallback = useMotionValue(activeIndex / 2)
  const driver = isStatic ? fallback : progress
  const rotateX = useTransform(driver, [0, 1], [7, -4])
  const rotateY = useTransform(driver, [0, 1], [-7, 4])
  const state = FOLIO[activeIndex] || FOLIO[0]

  return (
    <div className="proof-workbook" aria-hidden="true" data-chapter={activeIndex + 1}>
      <motion.div
        className="proof-workbook__stack"
        style={isStatic ? undefined : { rotateX, rotateY }}
      >
        <div className="proof-workbook__back" />
        <div className="proof-workbook__middle" />
        <article className="proof-workbook__front">
          <header>
            <span className="proof-workbook__mark">B / BAYONA</span>
            <span>ENTRENAMIENTO CON CRITERIO</span>
          </header>
          <div className="proof-workbook__issue">CUADERNO DE PROCESO <span>{String(activeIndex + 1).padStart(2, '0')} / 03</span></div>
          <div className="proof-workbook__spread">
            <div className="proof-workbook__statement">
              <span>{state.label}</span>
              <strong>{state.title}</strong>
              <p>{state.note}</p>
            </div>
            <figure className="proof-workbook__photograph">
              <img
                src="/images/burst/woman-strong-band-exercise-960.webp"
                alt=""
                loading="eager"
                decoding="async"
                width="960"
                height="640"
              />
            </figure>
          </div>
          <div className="proof-workbook__stages">
            {STEPS.map((step, i) => (
              <div key={step} data-active={i === activeIndex ? 'true' : undefined}>
                <span>0{i + 1}</span><strong>{step}</strong>
              </div>
            ))}
          </div>
          <footer>DOCUMENTO ILUSTRATIVO · NO EVIDENCIA DE RESULTADOS <span>↗ BAYONA</span></footer>
        </article>
      </motion.div>
    </div>
  )
}

export default function ProofProcessStage({ block }) {
  const { mode } = useCapabilities()
  const items = block?.items ?? []
  if (!items.length) return null

  return (
    <div className="proof-process-immersive">
      <NarrativeIntro className="proof-process-intro" image="/images/bayona-generated/home-proof-1600.webp" label="04 / TU PROCESO, POR ESCRITO" id="home-proof-heading" title={block.heading} body={block.body} />

      <ol className="proof-process-list sr-only" aria-label="Proceso verificable de BAYONA">
        {items.map(item => <li key={item.id}><h3>{item.title}</h3><p>{item.body}</p></li>)}
      </ol>

      <StickyStage length={mode === 'desktop' ? '210vh' : '150vh'}
        states={items.length} topOffset={66} className="proof-process-stage photo-story-stage">
        {({ index, progress, isStatic }) => {
          const item = items[index] ?? items[0]
          return (
            <div className="proof-process-viewport">
              <div className="proof-process-visual">
                <img className="photo-story-background" src="/images/bayona-generated/home-proof-1600.webp" alt="" width="1600" height="900" loading="lazy" decoding="async" />
                <WorkbookPreview progress={progress} activeIndex={index} isStatic={isStatic} />
              </div>
              <motion.article
                className="proof-process-copy"
                aria-hidden="true"
                key={item.id}
                initial={isStatic ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .4, ease: [0.16, 1, .3, 1] }}
              >
                <p>{STEPS[index] ?? item.marker}</p>
                <h3>{item.title}</h3>
                <div className="proof-workbook__copy-summary">{item.body}</div>
              </motion.article>
              <p className="proof-process-counter" aria-hidden="true">
                {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
              </p>
            </div>
          )
        }}
      </StickyStage>
    </div>
  )
}
