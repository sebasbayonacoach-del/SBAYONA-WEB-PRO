/**
 * BAYONA · TARJETA DE REGALO (comentario 14 del 22-09)
 * ---------------------------------------------------------------------------
 * El dueño lo pidió con sus palabras: «Cuando se le da en comparte y suma, debe
 * aparecer también algo en la mitad súper grande … una tarjeta de regalo que la
 * persona puede personalizar y colocar un nombre, tipo: YO, [nombre], le regalo
 * este pase a [otro] … que le aparezca como una condición, un requisito, y es
 * que tenga que tomarle una foto a eso y ahí sí aparezcan las distintas redes
 * sociales para compartir … o la pueda descargar».
 *
 * Esto es lo que hace cada pieza de ese guion:
 *  · Sale AL CENTRO, grande, plegada como un pase VIP (mismo lenguaje visual
 *    que el pase de llegada: filete, troquel, chip, micro-etiquetas).
 *  · Dos nombres editables: quien regala (arranca con el nombre de la recepción
 *    si lo dio) y quien lo recibe.
 *  · La condición impresa, en la tarjeta misma: BAYONA no envía regalos por ti.
 *    Hay que fotografiarla o descargarla y pasársela a esa persona.
 *  · Descarga real: se dibuja un PNG con el canvas del navegador. Si el
 *    navegador no da canvas, se dice y se ofrece la foto — no se finge.
 *  · Redes: WhatsApp (el canal real de la casa, el mismo enlace del sitio),
 *    Facebook y X con sus enlaces públicos de compartir, más copiar enlace.
 *    TikTok e Instagram no tienen enlace de compartir genérico: no se inventan.
 *
 * Lo que NO hace: no promete que el regalo llegue, no garantiza que quien lo
 * reciba obtenga nada sin reclamarlo, y no suma crédito por si solo — el crédito
 * por compartir ya lo suma el pase al pulsar «COMPARTE Y SUMA».
 */

import { useMemo, useRef, useState } from 'react'
import { Download, Link2, X } from 'lucide-react'
import { SITE_URL, whatsAppLink } from '../../config/site.config.js'
import { SHARE_BONUS_EUR, useRewards } from '../../lib/rewards/RewardsProvider.jsx'
import { useVisitorJourney } from '../../lib/onboarding/VisitorJourneyProvider.jsx'

/** Día del pase, en el formato corto que se imprime en el troquel. */
function issuedOn() {
  try {
    return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date())
  } catch {
    return ''
  }
}

/**
 * Dibuja el pase en un canvas y devuelve un data URL PNG.
 * Devuelve `null` si este navegador no pinta canvas: la tarjeta lo comunica en
 * vez de simular una descarga que no ocurrió.
 */
function renderPassToPng({ from, to, amount, serial }) {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 680
  const ctx = canvas.getContext && canvas.getContext('2d')
  if (!ctx || typeof canvas.toDataURL !== 'function') return null

  const background = ctx.createLinearGradient(0, 0, 1080, 680)
  background.addColorStop(0, '#0b0b0c')
  background.addColorStop(1, '#17130f')
  ctx.fillStyle = background
  ctx.fillRect(0, 0, 1080, 680)

  ctx.strokeStyle = 'rgba(244, 162, 97, 0.55)'
  ctx.lineWidth = 3
  ctx.strokeRect(34, 34, 1012, 612)

  ctx.fillStyle = '#f4a261'
  ctx.font = '600 34px Inter, system-ui, sans-serif'
  ctx.fillText('BAYONA · PASE DE REGALO', 78, 128)

  ctx.fillStyle = '#f5f5f5'
  ctx.font = '700 62px Inter, system-ui, sans-serif'
  ctx.fillText('YO', 78, 232)
  ctx.font = '400 44px Inter, system-ui, sans-serif'
  ctx.fillText(from || 'ALGUIEN DE BAYONA', 148, 232)
  ctx.font = '400 34px Inter, system-ui, sans-serif'
  ctx.fillStyle = '#a3a3a3'
  ctx.fillText('le regalo este pase a', 78, 300)
  ctx.fillStyle = '#f5f5f5'
  ctx.font = '700 58px Inter, system-ui, sans-serif'
  ctx.fillText(to || 'UNA PERSONA QUE EMPIEZA', 78, 372)

  ctx.fillStyle = '#e76f51'
  ctx.font = '700 46px Inter, system-ui, sans-serif'
  ctx.fillText(amount, 78, 470)
  ctx.fillStyle = '#a3a3a3'
  ctx.font = '400 26px Inter, system-ui, sans-serif'
  ctx.fillText('crédito BAYONA para empezar a entrenar', 78, 512)
  ctx.fillText(`Condición: la persona tiene que reclamarlo. BAYONA no lo envía por ti.`, 78, 566)
  ctx.fillText(`${serial} · ${issuedOn()}`, 78, 610)

  try {
    return canvas.toDataURL('image/png')
  } catch {
    return null
  }
}

export default function GiftPassCard({ onCerrar }) {
  const { format } = useRewards()
  const { name } = useVisitorJourney()

  const [from, setFrom] = useState(name || '')
  const [to, setTo] = useState('')
  const [note, setNote] = useState('')
  const serialRef = useRef(`BAY-REG-${Math.random().toString(36).slice(2, 7).toUpperCase()}`)

  const amount = useMemo(() => format(SHARE_BONUS_EUR), [format])
  const shareText = `${from ? `Yo, ${from}, ` : 'Yo, '}le regalo este pase de BAYONA a ${to || 'ti'}: ${amount} en crédito para empezar. Entra gratis y reclámalo: ${SITE_URL}`
  const giftUrl = whatsAppLink(shareText)
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}&t=${encodeURIComponent(shareText)}`
  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`

  function descargar() {
    const dataUrl = renderPassToPng({ from, to, amount, serial: serialRef.current })
    if (!dataUrl) {
      setNote('Este navegador no deja generar la imagen. Hazle una foto o una captura a la tarjeta: vale igual.')
      return
    }
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `${serialRef.current}-pase-regalo-bayona.png`
    document.body.appendChild(link)
    link.click()
    link.remove()
    setNote('Pase descargado. Pásalo tú: BAYONA no lo envía por ti.')
  }

  async function copiarEnlace() {
    if (!navigator.clipboard?.writeText) {
      setNote('No se pudo copiar aquí. Copia la dirección a mano: ' + SITE_URL)
      return
    }
    try {
      await navigator.clipboard.writeText(`${shareText}`)
      setNote('Enlace copiado con tu dedicatoria dentro.')
    } catch {
      setNote('El navegador bloqueó el portapapeles. Copia la dirección a mano.')
    }
  }

  return (
    <div className="gift-pass" role="dialog" aria-modal="true" aria-labelledby="gift-pass-title">
      <div className="gift-pass__frame">
        <button type="button" className="gift-pass__close" onClick={onCerrar} aria-label="Guardar la tarjeta de regalo">
          <X size={16} strokeWidth={1.7} aria-hidden="true" />
        </button>

        <div className="gift-pass__strip">
          <span className="gift-pass__brand">BAYONA</span>
          <span className="gift-pass__chip" aria-hidden="true" />
          <span className="gift-pass__kind">PASE DE REGALO · INVITACIÓN VIP</span>
        </div>

        <p className="gift-pass__eyebrow">HECHO POR TI, PARA ELLA O ÉL</p>
        <h2 id="gift-pass-title" className="gift-pass__title">
          PERSONALIZA TU REGALO
        </h2>
        <p className="gift-pass__lead">
          Escribe los dos nombres. La tarjeta sale grande, se descarga o se fotografía, y el
          crédito de <strong>{amount}</strong> ya está sumado en tu pase.
        </p>

        <div className="gift-pass__fields">
          <label className="gift-pass__field">
            <span className="gift-pass__field-label">YO</span>
            <input
              type="text"
              value={from}
              maxLength={28}
              placeholder="tu nombre"
              onChange={(event) => setFrom(event.target.value)}
            />
          </label>
          <span className="gift-pass__verb">le regalo este pase a</span>
          <label className="gift-pass__field">
            <span className="gift-pass__field-label">PARA</span>
            <input
              type="text"
              value={to}
              maxLength={28}
              placeholder="su nombre"
              onChange={(event) => setTo(event.target.value)}
            />
          </label>
        </div>

        <p className="gift-pass__condition">
          <strong>Condición del regalo:</strong> tiene que llegarle en foto o descargado, de tu
          mano. BAYONA no lo envía por ti, y quien lo reciba debe reclamarlo al entrar.
        </p>

        <div className="gift-pass__actions">
          <button type="button" className="gift-pass__download" onClick={descargar}>
            <Download size={15} strokeWidth={1.7} aria-hidden="true" />
            DESCARGAR EL PASE
          </button>
          <button type="button" className="gift-pass__copy" onClick={copiarEnlace}>
            <Link2 size={15} strokeWidth={1.7} aria-hidden="true" />
            COPIAR CON DEDICATORIA
          </button>
        </div>

        <div className="gift-pass__social" role="group" aria-label="Compartir el pase">
          <a className="gift-pass__social-link gift-pass__social-link--wa" href={giftUrl} target="_blank" rel="noreferrer">
            WHATSAPP
          </a>
          <a className="gift-pass__social-link" href={facebookUrl} target="_blank" rel="noreferrer">
            FACEBOOK
          </a>
          <a className="gift-pass__social-link" href={xUrl} target="_blank" rel="noreferrer">
            X
          </a>
        </div>

        <p className="gift-pass__serial">
          {serialRef.current} · {issuedOn()}
        </p>
        {note !== '' && (
          <p className="gift-pass__note" role="status">
            {note}
          </p>
        )}
      </div>
    </div>
  )
}
