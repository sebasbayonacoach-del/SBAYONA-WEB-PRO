import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import '../../styles/companion.css'

/**
 * ACOMPAÑANTE DE LA RECEPCIÓN
 * ---------------------------------------------------------------------------
 * Lo pidió el dueño: "una especie de drone… que te diga bienvenido y que salga,
 * todo con animaciones, que las letras se escriban, que la web esté viva".
 *
 * Tres decisiones de diseño que conviene no romper:
 *
 *  1. ESCRIBE, no aparece. El texto se teclea carácter a carácter. Con
 *     `prefers-reduced-motion` se entrega completo: la animación es adorno, la
 *     información no puede depender de ella.
 *
 *  2. La versión tecleada es `aria-hidden`. El lector de pantalla recibe el
 *     texto entero de una vez desde el nodo oculto con `role="status"`; si se
 *     leyera el tecleo, deletrearía la frase letra a letra.
 *
 *  3. Flota abajo a la IZQUIERDA a propósito: el botón de WhatsApp ya ocupa la
 *     esquina inferior derecha en todo el sitio, y dos elementos flotantes en la
 *     misma esquina se tapan entre sí.
 *
 * El guion no vive aquí. Viene de `lib/onboarding/companionScript.js`, que es
 * donde se revisa la voz ("juntos", nunca "usted solo") sin tocar React.
 */

/** Teclea `text` carácter a carácter. Devuelve la parte visible. */
function useTypewriter(text, { speed = 18, enabled = true } = {}) {
  const [visible, setVisible] = useState(enabled ? '' : text)

  useEffect(() => {
    if (!enabled) {
      setVisible(text)
      return undefined
    }

    let timer
    let index = 0
    setVisible('')

    const tick = () => {
      index += 1
      setVisible(text.slice(0, index))
      if (index < text.length) timer = window.setTimeout(tick, speed)
    }

    timer = window.setTimeout(tick, speed)
    return () => window.clearTimeout(timer)
  }, [text, speed, enabled])

  return visible
}

export default function CompanionDron({
  text,
  name = '',
  label = 'Acompañante BAYONA',
  speed = 18,
  className = '',
  onDismiss = null,
  onAsk = null,
}) {
  const reducedMotion = useReducedMotion()
  const typed = useTypewriter(text, { speed, enabled: !reducedMotion })
  const done = typed.length >= text.length

  return (
    <div className={`companion ${className}`.trim()} data-speaking={done ? 'no' : 'yes'}>
      <div className="companion__drone" aria-hidden="true">
        <span className="companion__rotor companion__rotor--left" />
        <span className="companion__rotor companion__rotor--right" />
        <span className="companion__hull">
          <span className="companion__lens" />
        </span>
        <span className="companion__halo" />
      </div>

      <div className="companion__bubble" role="status" aria-live="polite" aria-label={`${label}: ${text}`}>
        <span className="companion__screen-reader">{text}</span>
        <span className="companion__typed" aria-hidden="true">
          {typed}
          <i className="companion__caret" />
        </span>
        {name ? <span className="companion__signature" aria-hidden="true">BAYONA · {name}</span> : null}
        {onDismiss ? (
          <button
            type="button"
            className="companion__dismiss"
            onClick={onDismiss}
            aria-label={`Plegar ${label}`}
          >
            <X size={13} strokeWidth={1.75} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {/*
        Fuera de la burbuja a propósito: `.companion__bubble` recorta con
        `overflow: hidden`, así que un botón puesto dentro se veía pero no se
        podía pulsar (el punto caía en la sección de debajo).
      */}
      {onAsk ? (
        <button type="button" className="companion__ask" onClick={onAsk}>
          PREGUNTAR
        </button>
      ) : null}
    </div>
  )
}
