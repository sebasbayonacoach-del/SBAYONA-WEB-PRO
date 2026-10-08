import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { useCapabilities } from '../../engine/hooks/useCapabilities.js'

/** A normal scrolling chapter: photography and a staggered editorial reveal. */
export default function PhotographicChapter({ image, children, className = '', visualClassName = '' }) {
  const ref = useRef(null)
  const { reducedMotion } = useCapabilities()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const scale = useTransform(scrollYProgress, [0, 1], [1.1, 1])
  const y = useTransform(scrollYProgress, [0, 1], ['-3%', '3%'])

  return (
    <div ref={ref} className={`luxury-chapter ${className}`.trim()} data-motion={reducedMotion ? 'reduced' : 'cinematic'}>
      <motion.div className={`luxury-chapter-photo ${visualClassName}`.trim()}
        style={reducedMotion ? undefined : { scale, y }} aria-hidden="true">
        <img src={image} alt="" width="1600" height="900" loading="lazy" decoding="async" />
      </motion.div>
      <div className="luxury-chapter-shade" aria-hidden="true" />
      <motion.div className="luxury-chapter-content"
        initial={reducedMotion ? false : { opacity: .65, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .15 }}
        transition={{ duration: .85, ease: [.16, 1, .3, 1] }}>
        {children}
      </motion.div>
      <span className="luxury-chapter-line" aria-hidden="true" />
    </div>
  )
}
