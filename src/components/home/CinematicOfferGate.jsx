import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { useCapabilities } from '../../engine/hooks/useCapabilities.js'
import '../../styles/bayona-offer-reveal.css'

/**
 * Scroll-owned camera approach to Chapter 05. Nothing is pinned, timed or
 * intercepting scroll; the keynote can be skipped normally by the visitor.
 */
export default function CinematicOfferGate() {
  const ref = useRef(null)
  const { reducedMotion } = useCapabilities()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const cameraY = useTransform(scrollYProgress, [0, .33, .57, 1], [-110, -65, 0, 0])
  const cameraScale = useTransform(scrollYProgress, [0, .30, .61, 1], [1.52, 1.30, 1, 1])
  const cameraPitch = useTransform(scrollYProgress, [0, .32, .57, 1], [-22, -10, 0, 0])
  const cameraOpacity = useTransform(scrollYProgress, [0, .12, .48, 1], [.55, 1, 1, 1])
  const streakY = useTransform(scrollYProgress, [0, .30, .66, 1], [-140, -10, 230, 280])
  const streakOpacity = useTransform(scrollYProgress, [0, .22, .57, .85, 1], [0, .65, .55, .18, 0])

  return (
    <div ref={ref} className="bayona-offer-gate" aria-label="Capítulo cinco, acompañamiento BAYONA">
      <motion.div
        className="bayona-offer-gate__dive"
        style={reducedMotion ? undefined : { y: streakY, opacity: streakOpacity }}
        aria-hidden="true"
      >
        {Array.from({ length: 12 }, (_, i) => <span key={i} style={{ '--dive': i }} />)}
      </motion.div>
      <motion.div
        className="bayona-offer-gate__stage"
        style={reducedMotion ? undefined : {
          y: cameraY, scale: cameraScale, rotateX: cameraPitch, opacity: cameraOpacity,
        }}
      >
        <span className="bayona-offer-gate__kicker">BAYONA / PRESENTACIÓN DE PROGRAMAS</span>
        <div className="bayona-offer-gate__plinth"><span>05</span><i /></div>
        <p>DEL PROCESO AL ACOMPAÑAMIENTO.</p>
      </motion.div>
    </div>
  )
}
