import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useReducedMotion } from 'framer-motion'
import { Gift, Send, X } from 'lucide-react'
import { whatsAppLink } from '../../config/site.config.js'
import { responder, destinoDel, sugerenciasIniciales, SALUDO } from '../../lib/companion/chatBrain.js'
import { useRewards } from '../../lib/rewards/RewardsProvider.jsx'
import { useVisitorJourney } from '../../lib/onboarding/VisitorJourneyProvider.jsx'
import WhatsAppMark from './WhatsAppMark.jsx'
import './companion-chat.css'

/**
 * CHAT CON EL ASISTENTE
 * ---------------------------------------------------------------------------
 * El acompañante hablaba; esto es lo que le faltaba: escuchar. Se abre desde
 * el acceso de Sebastián y mantiene la conversación en memoria, como el resto
 * del acompañante — la web no guarda nada del visitante entre sesiones.
 *
 * QUIÉN HAY AQUÍ (comentario 15 del 22-09): Sebastián, en primera persona, como
 * asistente personal de la casa. NO se anuncia como inteligencia artificial:
 * detrás no hay ningún modelo conectado, hay dos fuentes publicadas (FAQ y
 * planes) y una regla —lo que no esté publicado se deriva a WhatsApp. Fingir una
 * IA que no existe sería la única forma de romper esta pantalla.
 *
 * Cuatro decisiones que no son de gusto:
 *
 *  1. La respuesta no es síncrona de cara a quien mira. Se anuncia «escribiendo»
 *     un instante: sin esa señal, una contestación que aparece de golpe parece
 *     un error de la página. Con `prefers-reduced-motion` se salta la pausa.
 *  2. El hilo es `role="log"` con `aria-live="polite"`, y cada mensaje lleva su
 *     autor visible también para un lector de pantalla. Un chat sin eso es una
 *     pared de texto que sube.
 *  3. Los chips no son decorativos: o son una ruta que existe en el sitio, o son
 *     el WhatsApp de verdad. Ningún clic lleva a ninguna parte.
 *  4. Escape cierra y el foco vuelve al botón que abrió el chat. Abrir un panel
 *     y dejar el foco en el vacío deja a quien usa teclado navegando a ciegas.
 *
 * Y una nueva, del 22-09 (§8): WhatsApp se pinta como WhatsApp —logotipo real
 * y el canal escrito con todas las letras— para que nadie confunda «seguir
 * hablando aquí» con «hablar con una persona por el canal de cierre». El nombre
 * interno del chip sigue siendo el que usa el cerebro (`HABLAR CON SEBASTIÁN`);
 * lo que se lee es el canal.
 */

const WHATSAPP_CHIP = 'HABLAR CON SEBASTIÁN'
const CLAIM_CHIP = 'RECLAMAR MI CRÉDITO'

/** Turno del asistente. `propia` marca lo que escribió la persona. */
function Mensaje({ de, texto }) {
  return (
    <li className={`chat-msg chat-msg--${de}`}>
      <span className="chat-msg__who">{de === 'tu' ? 'TÚ' : 'SEBASTIÁN'}</span>
      <p className="chat-msg__texto">{texto}</p>
    </li>
  )
}

export default function CompanionChat({ onCerrar, nombre = '' }) {
  const reducedMotion = useReducedMotion()
  const { openCard, bonusClaimed, sealCount, pendingSealCount } = useRewards()
  const { hasRoute } = useVisitorJourney()

  /*
    Memoria de la visita (§8: «puede recordar progreso dentro de la visita» e
    «invitar a reclamar»). No es un perfil ni un historial: es lo que esta
    navegación ya dio de sí, en memoria, y se dice con las cifras reales.
  */
  const pendienteDeReclamar = !bonusClaimed || pendingSealCount > 0
  const [mensajes, setMensajes] = useState(() => {
    const apertura = nombre
      ? `${SALUDO} ${nombre}, puedes empezar por donde quieras.`
      : SALUDO
    const memoria = [
      `${sealCount > 0 ? `En esta visita has descubierto ${sealCount} ${sealCount === 1 ? 'sello' : 'sellos'}` : 'Todavía no has descubierto sellos en esta visita'}, ${hasRoute ? 'y tu ruta ya salió de la recepción' : 'y aún no has pasado por la recepción'}.`,
      pendienteDeReclamar
        ? 'Nada se suma solo: ábrelo tú desde el pase y pulsa RECLAMAR.'
        : 'Tu crédito ya está guardado en el pase. Al crear la cuenta se va contigo.',
    ].join(' ')
    return [
      { de: 'bot', texto: apertura },
      { de: 'bot', texto: memoria },
    ]
  })
  const [escribiendo, setEscribiendo] = useState(false)
  const [chips, setChips] = useState(() =>
    pendienteDeReclamar ? [CLAIM_CHIP, ...sugerenciasIniciales] : [...sugerenciasIniciales],
  )
  const [valor, setValor] = useState('')

  const cajaRef = useRef(null)
  const envioRef = useRef(null)
  const temporizadores = useRef([])

  /* Al abrir, el foco en la caja: quien llama a un chat quiere escribir. */
  useEffect(() => {
    const t = window.setTimeout(() => cajaRef.current?.focus(), 60)
    return () => window.clearTimeout(t)
  }, [])

  /* Los tecleos pendientes se cancelan al cerrar, no se quedan tirando estado. */
  useEffect(() => () => temporizadores.current.forEach(window.clearTimeout), [])

  useEffect(() => {
    const hilo = envioRef.current
    if (hilo) hilo.scrollTop = hilo.scrollHeight
  }, [mensajes, escribiendo])

  function enviar(texto) {
    const limpio = (texto || '').trim()
    if (!limpio || escribiendo) return

    setMensajes((prev) => [...prev, { de: 'tu', texto: limpio }])
    setValor('')
    setChips([])
    setEscribiendo(true)

    const respuesta = responder(limpio, { nombre })
    const espera = reducedMotion ? 0 : Math.min(1100, 320 + respuesta.texto.length * 4)
    const t = window.setTimeout(() => {
      setMensajes((prev) => [...prev, { de: 'bot', texto: respuesta.texto }])
      setChips(respuesta.chips)
      setEscribiendo(false)
    }, espera)
    temporizadores.current.push(t)
  }

  function alPulsar(evento) {
    if (evento.key === 'Enter' && !evento.shiftKey) {
      evento.preventDefault()
      enviar(valor)
    }
    if (evento.key === 'Escape') onCerrar()
  }

  return (
    <section
      className="chat"
      aria-label="Chat con el asistente BAYONA"
      onKeyDown={(e) => { if (e.key === 'Escape') onCerrar() }}
    >
      <header className="chat__head">
        <span className="chat__avatar" aria-hidden="true">S</span>
        <div className="chat__ident">
          <h2 className="chat__title">SEBASTIÁN · ASISTENTE BAYONA</h2>
          <p className="chat__sub">
            Respondo con lo publicado en la casa. No hay ninguna IA conectada detrás de
            esto: lo que no esté publicado lo derivo a WhatsApp, que es donde responde
            una persona.
          </p>
        </div>
        <button type="button" className="chat__close" onClick={onCerrar} aria-label="Cerrar el chat">
          <X size={16} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </header>

      <ol className="chat__hilo" ref={envioRef} role="log" aria-live="polite" aria-relevant="additions">
        {mensajes.map((m, i) => <Mensaje key={i} de={m.de} texto={m.texto} />)}
        {escribiendo ? (
          <li className="chat-msg chat-msg--bot chat-msg--escribiendo">
            <span className="chat-msg__who">SEBASTIÁN</span>
            <span className="chat__tecleo" aria-hidden="true"><i /><i /><i /></span>
            <span className="chat__sr">El asistente está escribiendo…</span>
          </li>
        ) : null}
      </ol>

      {chips.length ? (
        <div className="chat__chips" role="group" aria-label="Sugerencias">
          {chips.map((chip) => {
            /*
              Salir del chat: canal externo, logo real y el nombre del canal
              escrito. Distinguir «seguir aquí» de «hablar con una persona» es lo
              que pedía el comentario del 22-09.
            */
            if (chip === WHATSAPP_CHIP) {
              return (
                <a
                  key={chip}
                  className="chat__chip chat__chip--whatsapp"
                  href={whatsAppLink('Hola BAYONA, vengo del chat y quiero confirmar una cosa.')}
                  target="_blank"
                  rel="noreferrer"
                >
                  <WhatsAppMark size={15} />
                  HABLAR POR WHATSAPP
                </a>
              )
            }

            if (chip === CLAIM_CHIP) {
              return (
                <button
                  key={chip}
                  type="button"
                  className="chat__chip chat__chip--claim"
                  onClick={() => { openCard(); }}
                >
                  <Gift size={14} strokeWidth={1.6} aria-hidden="true" />
                  {bonusClaimed && pendingSealCount === 0 ? 'ABRIR MI CRÉDITO' : 'RECLAMAR MI CRÉDITO'}
                </button>
              )
            }

            const destino = destinoDel(chip)
            if (!destino) return null
            return (
              <Link key={chip} className="chat__chip" to={destino.to} onClick={onCerrar}>
                {chip}
              </Link>
            )
          })}
        </div>
      ) : null}

      <form
        className="chat__form"
        onSubmit={(e) => { e.preventDefault(); enviar(valor) }}
      >
        <input
          ref={cajaRef}
          className="chat__campo"
          type="text"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onKeyDown={alPulsar}
          placeholder="Escribe tu pregunta…"
          aria-label="Tu mensaje para Sebastián, el asistente de BAYONA"
          autoComplete="off"
          maxLength={280}
        />
        <button type="submit" className="chat__enviar" disabled={!valor.trim() || escribiendo}>
          <Send size={16} strokeWidth={1.6} aria-hidden="true" />
          <span className="chat__sr">Enviar mensaje</span>
        </button>
      </form>

      {/*
        La puerta de salida siempre a la vista: el chat responde con lo
        publicado y, cuando algo no lo está, el canal humano no está a un
        clic de distancia sino visible en el pie del panel.
      */}
      <div className="chat__foot">
        <span>Aquí respondo con lo publicado. Lo demás se habla con una persona:</span>
        <a
          className="chat__whatsapp"
          href={whatsAppLink('Hola BAYONA, vengo del asistente de la web y quiero confirmar una cosa.')}
          target="_blank"
          rel="noreferrer"
        >
          <WhatsAppMark size={15} />
          HABLAR POR WHATSAPP
        </a>
      </div>
    </section>
  )
}
