import { motion } from 'framer-motion'

/** Editorial preview of a real downloadable document, with a physical paper edge. */
export default function DossierMockup({ title, subtitle, issue = '01', image, isStatic = false }) {
  return (
    <motion.div className="journey-dossier" aria-hidden="true" initial={isStatic ? false : { rotateY: -14, y: 32 }} whileInView={{ rotateY: -5, y: 0 }} viewport={{ once: true }} transition={{ duration: .8 }}>
      <div className="journey-dossier-back" />
      <div className="journey-dossier-cover">
        <div className="journey-dossier-masthead"><span>B / BAYONA</span><span>EDICIÓN {issue}</span></div>
        <img src={image} alt="" width="960" height="640" loading="lazy" decoding="async" />
        <div className="journey-dossier-title"><span>ENTRENAR CON DIRECCIÓN</span><strong>{title}</strong><p>{subtitle}</p></div>
        <div className="journey-dossier-foot"><span>GUARDA · ESCRIBE · VUELVE</span><span>PDF ↗</span></div>
      </div>
    </motion.div>
  )
}
