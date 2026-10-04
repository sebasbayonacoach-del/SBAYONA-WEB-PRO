import { motion } from 'framer-motion'
import { ArrowUpRight, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { sceneBackgroundProps } from '../SceneBackground.jsx'
import { StickyStage } from '../../engine/scroll/StickyStage.jsx'
import { useCapabilities } from '../../engine/hooks/useCapabilities.js'
import '../../styles/community-immersive-stage.css'

const THREAD = Object.freeze([
  Object.freeze({
    id: 'question',
    author: 'ANDREA',
    text: 'Al hacer sentadillas noto molestias en la rodilla. ¿Por dónde empiezo a revisarlo?',
    side: 'member',
  }),
  Object.freeze({
    id: 'answer',
    author: 'SEBASTIÁN',
    text: 'Si duele, reduce o detén ese ejercicio. Revisamos tu técnica y el contexto; si persiste, consulta a un profesional sanitario.',
    side: 'coach',
  }),
])

function ConversationLine({ message, isStatic }) {
  return (
    <motion.div
      className="community-immersive-line"
      data-side={message.side}
      initial={isStatic ? false : { opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="community-immersive-line__avatar" aria-hidden="true">{message.author === 'ANDREA' ? 'A' : 'B'}</span>
      <span className="community-immersive-line__author">{message.author} <small>{message.side === 'coach' ? '· ORIENTACIÓN' : '· COMUNIDAD'}</small></span>
      <p>{message.text}</p>
    </motion.div>
  )
}

export default function CommunityImmersiveStage({ media }) {
  const { mode } = useCapabilities()
  const length = mode === 'desktop' ? '240vh' : '260vh'

  return (
    <section
      {...sceneBackgroundProps(media, {
        className: 'community-immersive',
        variant: 'hero',
        pseudo: 'after',
        position: 'center 42%',
        blur: 0,
      })}
      aria-labelledby="community-immersive-title"
    >
      <header className="community-immersive-intro">
        <p>COMUNIDAD · NO ESTÁS SOLO</p>
        <h2 id="community-immersive-title">
          ENTRA GRATIS.
          <span>MIRA PRIMERO.</span>
          DECIDE DESPUÉS.
        </h2>
      </header>

      <StickyStage
        length={length}
        states={3}
        topOffset={66}
        allowMobile
        className="community-immersive-stage"
      >
        {({ index, isStatic }) => (
          <div className="community-immersive-frame" data-state={index}>
            <div className="community-immersive-scrim" aria-hidden="true" />

            <div className="community-immersive-transcript community-interface" role="group" aria-label="Ejemplo ilustrativo de orientación en comunidad">
              <div className="community-interface__chrome" aria-hidden="true"><span>B / COMMUNITY</span><span>ORIENTACIÓN · CONTEXTO · RESPETO</span><span>○ ○ ○</span></div>
              <div className="community-immersive-channel">
                <MessageCircle size={18} strokeWidth={1.25} aria-hidden="true" />
                <span>BAYONA / COMUNIDAD</span>
                <i>CONVERSACIÓN ILUSTRATIVA</i>
              </div>

              {index >= 0 ? <ConversationLine message={THREAD[0]} isStatic={isStatic} /> : null}
              {index >= 1 ? <ConversationLine message={THREAD[1]} isStatic={isStatic} /> : null}

              {index >= 2 ? (
                <motion.div
                  className="community-immersive-decision"
                  initial={isStatic ? false : { opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p>
                    Antes de pagar nada, entra, mira cómo pensamos y conoce a la comunidad.
                    Si luego quieres acompañamiento, eliges con contexto.
                  </p>
                  <span>GRATIS · SIN TARJETA · SIN COMPROMISO</span>
                  <Link to="/community">
                    ENTRAR A LA COMUNIDAD
                    <ArrowUpRight size={17} strokeWidth={1.2} aria-hidden="true" />
                  </Link>
                </motion.div>
              ) : null}
            </div>

            <div className="community-immersive-progress" aria-hidden="true">
              <span data-active={index === 0 ? 'true' : undefined}>01 / PREGUNTA</span>
              <span data-active={index === 1 ? 'true' : undefined}>02 / RESPUESTA</span>
              <span data-active={index === 2 ? 'true' : undefined}>03 / DECISIÓN</span>
            </div>
          </div>
        )}
      </StickyStage>

      <p className="community-immersive-note">
        El seguimiento individual depende del plan contratado.
      </p>
    </section>
  )
}
