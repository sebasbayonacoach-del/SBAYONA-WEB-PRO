import { MessageCircle } from 'lucide-react'
import '../styles/community-bridges.css'

const MINI_BUBBLES = [
  {
    author: 'ANDREA',
    text: 'Tengo dolor en la rodilla al hacer sentadillas. ¿Es normal?',
    who: 'member',
  },
  {
    author: 'SEBASTIÁN',
    text: 'No es normal, pero sí común. Tu rodilla se va hacia adentro. Probemos esto y me cuentas.',
    who: 'sebastian',
  },
]

const FULL_BUBBLES = [
  MINI_BUBBLES[0],
  {
    author: 'SEBASTIÁN',
    text: 'No es normal, pero sí común. Tu rodilla se va hacia adentro al bajar. Probemos esto: pon un tapón entre las rodillas y apriétalo al subir. Cuéntame cómo te va.',
    who: 'sebastian',
  },
  {
    author: 'CARLOS',
    text: 'A mí me pasaba igual. Con ese ajuste desapareció en 2 semanas. Ánimo, aquí estamos.',
    who: 'member',
  },
]

export default function CommunityChatPreview({ variant = 'mini' }) {
  const bubbles = variant === 'full' ? FULL_BUBBLES : MINI_BUBBLES

  return (
    <div
      className="cb-chat"
      role="group"
      aria-label="Vista conceptual de una conversación en la comunidad BAYONA"
      data-variant={variant === 'full' ? 'full' : 'mini'}
    >
      <div className="cb-chat-header">
        <span className="cb-chat-avatar" aria-hidden="true">
          <MessageCircle size={19} strokeWidth={1.2} />
        </span>
        <div className="cb-chat-heading">
          <span className="cb-chat-name">BAYONA · COMUNIDAD</span>
          <span className="cb-chat-status">ACTIVO AHORA</span>
        </div>
      </div>

      <div className="cb-chat-thread">
        {bubbles.map((bubble, index) => (
          <div className={`cb-chat-bubble cb-chat-bubble--${bubble.who}`} key={`${bubble.author}-${index}`}>
            <span className="cb-chat-author">{bubble.author}</span>
            <span className="cb-chat-text">{bubble.text}</span>
          </div>
        ))}
      </div>

      <p className="cb-chat-caption">Así se siente tener un grupo que responde. Hoy.</p>
    </div>
  )
}
