import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { useCapabilities } from '../../engine/hooks/useCapabilities.js'

/** A photographic chapter boundary. The visitor controls the reveal by scrolling. */
export default function NarrativeIntro({ className = '', image, label, title, body, id }) {
  const ref = useRef(null)
  const { reducedMotion } = useCapabilities()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1])
  return (
    <header ref={ref} className={`${className} journey-intro`}>
      <motion.img className="journey-intro-photo" src={image} alt="" width="1600" height="900" loading="lazy" decoding="async" style={reducedMotion ? undefined : { scale }} />
      <p className="journey-label">{label}</p>
      <motion.h2 id={id} initial={reducedMotion ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .3 }} transition={{ duration: .7 }}>{title}</motion.h2>
      <span className="journey-intro-body">{body}</span>
      <div className="journey-chapter-stitch" aria-hidden="true"><i /><span>CONTINÚA EL RECORRIDO</span><i /></div>
    </header>
  )
}
