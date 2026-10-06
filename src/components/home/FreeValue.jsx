import { motion } from 'framer-motion'
import { ArrowUpRight, Download } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCapabilities } from '../../engine/hooks/useCapabilities.js'
import { StickyStage } from '../../engine/scroll/StickyStage.jsx'
import NarrativeIntro from './NarrativeIntro.jsx'
import DossierMockup from './DossierMockup.jsx'
import '../../styles/free-value.css'

export const FREE_PIECES = [
  { id: 'protocolo', title: 'Tu primera semana.', tag: 'GUÍA · 7 DÍAS', copy: 'Un comienzo que cabe en tu vida. Organiza tus días, prepara el espacio y apunta lo que quieres construir.', document: 'primera-semana', action: 'Descargar mi primera semana', photo: 'home-pillar-read', issue: '01' },
  { id: 'reto', title: '30 días, por escrito.', tag: 'WORKBOOK · 30 DÍAS', copy: 'Ponle fecha a tus decisiones. Un registro para anotar sesiones, energía y aprendizajes, sin perseguir un resultado prometido.', document: 'registro-30-dias', action: 'Descargar el workbook', photo: 'resources-challenge', issue: '02' },
  { id: 'movilidad', title: 'Espacio para moverte.', tag: 'GUÍA · MOVILIDAD Y HÁBITOS', copy: 'Observa tus hábitos, haz espacio para el movimiento y registra qué te ayuda a sostenerlo. A tu ritmo, con contexto.', document: 'movilidad-y-habitos', action: 'Descargar la guía de hábitos', photo: 'home-pillar-build', issue: '03' },
  { id: 'dossier', title: 'Tu punto de partida.', tag: 'DOSSIER · EDICIÓN PERSONAL', copy: 'Reúne tus objetivos, tu tiempo y tus recursos en un solo documento. Prepáralo para una conversación o úsalo para ordenar tus ideas.', document: 'dossier-punto-de-partida', action: 'Descargar el dossier', photo: 'home-free-kit', issue: '04' },
]

export default function FreeValue() {
  const { mode, reducedMotion } = useCapabilities()
  return (
    <section className="free-value free-dossier journey-free" aria-labelledby="home-free-title">
      <NarrativeIntro className="free-dossier-intro" image="/images/bayona-generated/home-free-kit-1600.webp" label="TU BIBLIOTECA · TRES GUÍAS Y UN DOSSIER" id="home-free-title" title="Llévate un comienzo. Es gratis." body="Tres recursos para organizar tu entrenamiento y un dossier para entender desde dónde partes. Descárgalos, escribe sobre ellos y vuelve cuando quieras." />
      {mode === 'desktop' && (
        <StickyStage length="290vh" states={FREE_PIECES.length} topOffset={66} className="free-dossier-stage photo-story-stage">
        {({ index, isStatic }) => {
          const piece = FREE_PIECES[index] ?? FREE_PIECES[0]
          const image = `/images/bayona-generated/${piece.photo}-1600.webp`
          return (
            <div className="free-dossier-viewport journey-resource" data-piece={piece.id}>
              <div className="free-dossier-visual"><img className={`photo-story-background${piece.id === 'reto' ? ' bayona-challenge-screen__hero' : ''}`} src={image} alt="" width="1600" height="900" loading="lazy" decoding="async" /></div>
              <DossierMockup key={`${piece.id}-mockup`} title={piece.title} subtitle={piece.tag} issue={piece.issue} image={image} isStatic={isStatic} />
              <motion.article className="free-dossier-copy" key={`${piece.id}-copy`} initial={isStatic ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}>
                <p className="free-dossier-tag">{piece.tag}</p>
                <p className="free-dossier-index">{piece.issue} / 04</p>
                <h3>{piece.title}</h3>
                <p className="free-dossier-body">{piece.copy}</p>
                <a className="free-dossier-action journey-download" href={`/downloads/bayona-editorial/${piece.document}.pdf`} download><Download size={18} />{piece.action}</a>
                <span className="journey-label">PDF PARA GUARDAR E IMPRIMIR · SIN REGISTRO</span>
              </motion.article>
              <div className="free-dossier-progress" aria-hidden="true">{FREE_PIECES.map((entry, i) => <span key={entry.id} data-active={i === index ? 'true' : undefined} />)}</div>
            </div>
          )
        }}
        </StickyStage>
      )}
      <div className="journey-library" aria-label="Todos los recursos gratuitos">
        {FREE_PIECES.map((piece, index) => {
          const image = `/images/bayona-generated/${piece.photo}-1600.webp`
          return (
            <motion.a
              href={`/downloads/bayona-editorial/${piece.document}.pdf`}
              download
              key={piece.id}
              className="journey-library-entry"
              data-piece={piece.id}
              aria-label={`${piece.title} — ${piece.action}`}
              initial={reducedMotion || mode !== 'desktop' ? false : { opacity: .68, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: .2 }}
              transition={{ duration: .5, delay: reducedMotion ? 0 : index * .06, ease: [.16, 1, .3, 1] }}
              whileHover={reducedMotion ? undefined : { y: -8 }}
            >
              <span className="journey-library-preview" aria-hidden="true">
                <img src={image} alt="" width="900" height="1120" loading="lazy" decoding="async" />
                <span className="journey-library-preview-shade" />
                <span className="journey-library-preview-index">{piece.issue}</span>
                <span className="journey-library-preview-sheet">
                  <small>BAYONA · EDICIÓN {piece.issue}</small>
                  <strong>{piece.title}</strong>
                  <em>{piece.tag}</em>
                </span>
              </span>
              <span className="journey-library-entry-copy">
                <span className="journey-label">{piece.tag}</span>
                <strong>{piece.title}</strong>
                <span className="journey-library-entry-description">{piece.copy}</span>
              </span>
              <span className="journey-library-entry-action">
                <Download size={19} aria-hidden="true" />
                <span>{piece.action}</span>
                <ArrowUpRight size={17} aria-hidden="true" />
              </span>
            </motion.a>
          )
        })}
      </div>
      <div className="free-dossier-footer"><Link to="/resources">Explorar toda la biblioteca <ArrowUpRight size={18} /></Link><p>Empieza sin cuenta, sin tarjeta y sin entregar tus datos.</p></div>
    </section>
  )
}
