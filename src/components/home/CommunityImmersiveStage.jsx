import { motion, useMotionValue, useTransform } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { StickyStage } from '../../engine/scroll/StickyStage.jsx'
import { useCapabilities } from '../../engine/hooks/useCapabilities.js'
import NarrativeIntro from './NarrativeIntro.jsx'
import '../../styles/community-immersive-stage.css'

const THREAD = [
  { author: 'ANDREA', side: 'member', text: 'Quiero volver a entrenar, pero mi semana nunca es igual.' },
  { author: 'SEBASTIÁN', side: 'coach', text: 'Empecemos por lo que sí cabe. ¿Cuántos días y cuánto tiempo tienes de verdad?' },
  { author: 'ANDREA', side: 'member', text: 'Tres días. Unos 30 minutos. Y material sencillo en casa.' },
  { author: 'SEBASTIÁN', side: 'coach', text: 'Ese es un punto de partida. Primero ordenamos tu semana; después revisamos cómo te va.' },
  { author: 'ANDREA', side: 'member', text: 'Ahora sí sé qué necesito. Quiero entender cómo sería mi proceso.' },
]

function PhoneScene({ index, progress, isStatic }) {
  const fallback = useMotionValue(0)
  const driver = isStatic ? fallback : progress
  const scale = useTransform(driver, [0, .72, .88, 1], [1, 1, 1.1, 5.5])
  const rotateY = useTransform(driver, [0, .72, 1], [-8, -3, 0])
  const copyOpacity = useTransform(driver, [.73, .89], [1, 0])
  const portalOpacity = useTransform(driver, [.87, .98], [0, 1])
  const conversationRef = useRef(null)
  useEffect(() => {
    const panel = conversationRef.current
    if (panel) panel.scrollTop = panel.scrollHeight
  }, [index])
  const visible = isStatic ? THREAD : THREAD.slice(0, index + 1)
  return (
    <div className="community-immersive-frame journey-phone-scene" data-state={index} data-motion={isStatic ? 'reduced' : 'cinematic'}>
      <img className="photo-story-background" src="/images/bayona-generated/community-hero-1600.webp" alt="" width="1600" height="900" loading="lazy" decoding="async" />
      <motion.div className="journey-phone-story" style={isStatic ? undefined : { opacity: copyOpacity }}>
        <p className="journey-label">UNA CONVERSACIÓN CAMBIA EL PUNTO DE PARTIDA</p>
        <h3>Primero te escuchamos.<br /><em>Después trazamos la ruta.</em></h3>
        <p>Tu tiempo, tu experiencia y tu objetivo. El método empieza con tu vida, no con una plantilla.</p>
        <Link to="/community">Conocer la comunidad <ArrowUpRight size={18} /></Link>
        <span className="journey-label">EJEMPLO ILUSTRATIVO · SOPORTE SEGÚN PLAN</span>
      </motion.div>
      <motion.div className="journey-phone" style={isStatic ? undefined : { scale, rotateY }}>
        <div className="journey-phone-hardware" aria-hidden="true"><span>9:41</span><i /><span>● ▰</span></div>
        <div className="journey-phone-bar"><b>B.</b><div><strong>BAYONA / COMUNIDAD</strong><span>Un espacio para empezar con contexto</span></div></div>
        <div ref={conversationRef} className="journey-phone-conversation" role="group" aria-label="Ejemplo ilustrativo de orientación en comunidad">
          {visible.map(message => <motion.div key={message.text} className="community-immersive-line" data-side={message.side} initial={isStatic ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }}><span className="community-immersive-line__author">{message.author}</span><p>{message.text}</p></motion.div>)}
        </div>
        <div className="journey-phone-input" aria-hidden="true"><span>Tu siguiente paso empieza aquí</span><ArrowUpRight size={18} /></div>
      </motion.div>
      {!isStatic && <motion.div className="journey-phone-portal" style={{ opacity: portalOpacity }} aria-hidden="true"><img src="/images/bayona-generated/home-method-1600.webp" alt="" width="1600" height="900" /><div><span className="journey-label">DE LA CONVERSACIÓN A LA ACCIÓN</span><strong>Tu vida.<br />Tu método.</strong></div></motion.div>}
      <div className="community-immersive-progress" aria-hidden="true"><span>ESCUCHAR</span><span>ORDENAR</span><span>EMPEZAR</span></div>
    </div>
  )
}

export default function CommunityImmersiveStage() {
  const { reducedMotion, mode } = useCapabilities()
  return (
    <section className="community-immersive journey-community" aria-labelledby="community-immersive-title">
      <NarrativeIntro image="/images/bayona-generated/community-hero-1600.webp" className="community-immersive-intro" label="COMUNIDAD · UN PRIMER ENCUENTRO" id="community-immersive-title" title="Entrenar empieza por entenderte." body="Entra, conoce la forma de trabajar y encuentra preguntas que también son las tuyas. Puedes mirar antes de decidir." />
      <StickyStage length={mode === 'desktop' ? '340vh' : '200vh'} states={reducedMotion ? 1 : THREAD.length} topOffset={66} allowMobile className="community-immersive-stage photo-story-stage">
        {state => <PhoneScene {...state} />}
      </StickyStage>
      <p className="community-immersive-note">Conversación ilustrativa. El seguimiento individual depende del plan elegido.</p>
    </section>
  )
}
