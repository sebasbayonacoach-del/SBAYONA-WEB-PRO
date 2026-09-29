import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check, Copy, Share2 } from 'lucide-react'
import {
  applyCredit,
  applyShareCode,
  buildOrder,
  buildSharePayload,
  commerceConfig,
  describePaymentStatus,
  formatOrderAmount,
  orderSummaryLines,
  redeemShareCode,
  SHARE_EXCHANGE,
  startPayment,
} from '../../lib/commerce/index.js'
import QrCode from './QrCode.jsx'
import '../../styles/checkout-panel.css'

/**
 * PANEL DE CIERRE · pasarela en vez de WhatsApp
 * ---------------------------------------------------------------------------
 * Es presentacional: se puede montar en cualquier página sin tocar el router.
 * Recibe el plan, el periodo y la moneda; todo lo demás (matemáticas, código de
 * intercambio, elección de pasarela) sale de `src/lib/commerce/`.
 *
 * Tres cosas no son negociables aquí:
 *   1. El precio REAL se enseña siempre, y la resta hasta cero también. La
 *      persona tiene que sentir el valor de lo que se lleva.
 *   2. El cero se dice sin rodeos: "TOTAL HOY €0".
 *   3. Si faltan las claves, la pantalla dice "MODO SIMULACIÓN". Nunca finge
 *      un cobro que no ocurrió.
 *
 * Sin localStorage, sin cookies y sin red fuera del adaptador.
 */
export default function CheckoutPanel({
  planId = 'GRATIS',
  period = 'month',
  currency = 'EUR',
  creditEur = 0,
  introOffer = null,
  eyebrow = 'CIERRE / PASARELA DE PAGO',
  title = 'VAMOS A CERRARLO JUNTOS.',
  lead = 'Revisa tu pedido, canjea tu intercambio y sigue. Sin salir a WhatsApp.',
  provider,
  config = commerceConfig,
  transport,
  initialShareCode = '',
  onPaid,
  className = '',
}) {
  const reducedMotion = useReducedMotion()
  const inputId = useId()
  const hintId = `${inputId}-hint`
  const totalId = useId()

  const [codeInput, setCodeInput] = useState(initialShareCode)
  const [share, setShare] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [payment, setPayment] = useState({ status: 'idle' })
  const [copied, setCopied] = useState(false)

  // Pedido base + crédito. Inmutable: cada cambio de plan lo reconstruye.
  const pricedOrder = useMemo(() => {
    const base = buildOrder({ planId, period, currency, introOffer })
    return creditEur > 0 ? applyCredit(base, creditEur) : base
  }, [planId, period, currency, creditEur, introOffer])

  const order = useMemo(() => (share ? applyShareCode(pricedOrder, share) : pricedOrder), [pricedOrder, share])

  const sharePayload = useMemo(() => buildSharePayload(order, { siteUrl: config.siteUrl }), [order, config.siteUrl])
  const gateway = useMemo(() => describePaymentStatus(order, { provider, config }), [order, provider, config])
  const lines = useMemo(() => orderSummaryLines(order), [order])

  /** Si el plan cambia, el código canjeado ya no vale: se limpia. */
  useEffect(() => {
    setShare(null)
    setFeedback(null)
  }, [planId, period])

  /**
   * El enlace profundo trae `?codigo=`: se canjea solo la primera vez. Un solo
   * disparo, porque después el código ya vive en el estado del panel.
   */
  const autoRedeemed = useRef(false)
  useEffect(() => {
    if (autoRedeemed.current) return
    const incoming = String(initialShareCode ?? '').trim()
    if (incoming === '') return
    autoRedeemed.current = true

    const result = redeemShareCode(pricedOrder, incoming, { salt: config.shareSalt })
    setCodeInput(result.code || incoming)
    if (result.ok) {
      setShare(result.order.share)
      setFeedback({ kind: 'success', message: result.message })
    } else {
      setFeedback({ kind: 'error', message: result.message })
    }
  }, [initialShareCode, pricedOrder, config.shareSalt])

  const handleRedeem = useCallback(
    (event) => {
      event.preventDefault()
      const result = redeemShareCode(pricedOrder, codeInput, { salt: config.shareSalt })

      if (!result.ok) {
        setShare(null)
        setFeedback({ kind: 'error', message: result.message })
        return
      }

      setShare(result.order.share)
      setFeedback({ kind: 'success', message: result.message })
      setPayment({ status: 'idle' })
    },
    [pricedOrder, codeInput, config.shareSalt],
  )

  const handleCopy = useCallback(async () => {
    const clipboard = typeof navigator !== 'undefined' ? navigator.clipboard : undefined
    if (!clipboard?.writeText) {
      setCopied(false)
      return
    }
    try {
      await clipboard.writeText(sharePayload.shareUrl)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }, [sharePayload.shareUrl])

  const handlePay = useCallback(async () => {
    setPayment({ status: 'working' })
    const result = await startPayment(order, { provider, config, transport })

    setPayment({ status: result.status, result })
    if (result.status === 'redirect' && result.redirectUrl && typeof window !== 'undefined') {
      window.location.assign(result.redirectUrl)
    }
    if (result.status !== 'error') onPaid?.(result, order)
  }, [order, provider, config, transport, onPaid])

  const payLabel = order.isZero
    ? introOffer
      ? `EMPEZAR POR ${formatOrderAmount(0, order)}`
      : `COMPRAR POR ${formatOrderAmount(0, order)}`
    : `PAGAR ${formatOrderAmount(order.totalEur, order)}`

  const busy = payment.status === 'working'
  const done = payment.status === 'completed' || payment.status === 'simulated'

  /**
   * Movimiento mínimo y sin `opacity: 0` inicial: el panel entra desplazándose,
   * nunca desaparecido. Con `prefers-reduced-motion` no se anima nada.
   */
  const motionProps = reducedMotion
    ? {}
    : { initial: { y: 14 }, animate: { y: 0 }, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } }

  return (
    <section className={`cx-panel ${className}`.trim()} aria-labelledby={`${inputId}-title`}>
      <motion.div className="cx-panel__inner" {...motionProps}>
        <header className="cx-head">
          <p className="cx-eyebrow">{eyebrow}</p>
          <h2 className="cx-title" id={`${inputId}-title`}>
            {title}
          </h2>
          <p className="cx-lead">{lead}</p>
        </header>

        {/* --- Resumen: el valor real y la resta hasta cero ------------------- */}
        <div className="cx-summary">
          <p className="cx-micro">TU PEDIDO</p>
          <ul className="cx-lines">
            {lines.map((line) => (
              <li className={`cx-line cx-line--${line.kind}`} key={line.id}>
                <span className="cx-line__text">
                  <strong>{line.label}</strong>
                  {line.detail ? <small>{line.detail}</small> : null}
                </span>
                <span className="cx-line__value">{line.value}</span>
              </li>
            ))}
          </ul>

          <div className="cx-total" aria-live="polite" aria-atomic="true" id={totalId}>
            <span className="cx-micro">TOTAL HOY</span>
            <span className="cx-total__row">
              {order.isZero && order.subtotalEur > 0 ? (
                <s className="cx-total__was" aria-label={`Valor real ${formatOrderAmount(order.subtotalEur, order)}`}>
                  {formatOrderAmount(order.subtotalEur, order)}
                </s>
              ) : null}
              <strong className={`cx-total__amount${order.isZero ? ' cx-total__amount--zero' : ''}`}>
                {formatOrderAmount(order.totalEur, order)}
              </strong>
            </span>
            <span className="cx-total__verdict">
              {order.share
                ? 'No pagas con dinero: compartiste con un amigo. Ese es el intercambio.'
                : order.isZero
                  ? 'Este plan es gratuito: aquí no se cobra nada.'
                  : 'Esto es lo que vale y esto es lo que pagas. Sin letra pequeña.'}
            </span>
          </div>

          {introOffer ? (
            <p className="cx-offer">
              <strong>{introOffer.label}</strong>
              <small>{introOffer.note}</small>
            </p>
          ) : null}
        </div>

        {/* --- Intercambio: compartir para ponerlo en cero -------------------- */}
        <div className="cx-share">
          <p className="cx-micro">PONLO EN CERO</p>
          <p className="cx-share__what">{SHARE_EXCHANGE.what}</p>
          <p className="cx-share__why">{SHARE_EXCHANGE.why}</p>

          <div className="cx-share__media">
            <QrCode payload={sharePayload.code} size={168} />
            <div className="cx-share__actions">
              <a
                className="cx-button cx-button--primary"
                href={sharePayload.whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Share2 aria-hidden="true" size={16} />
                {SHARE_EXCHANGE.action}
              </a>
              <button type="button" className="cx-button cx-button--ghost" onClick={handleCopy}>
                {copied ? <Check aria-hidden="true" size={16} /> : <Copy aria-hidden="true" size={16} />}
                {copied ? 'ENLACE COPIADO' : 'COPIAR ENLACE'}
              </button>
            </div>
          </div>

          <form className="cx-redeem" onSubmit={handleRedeem} noValidate>
            <label className="cx-field" htmlFor={inputId}>
              <span className="cx-micro">{SHARE_EXCHANGE.inputLabel}</span>
              <input
                id={inputId}
                name="codigo-intercambio"
                type="text"
                inputMode="text"
                autoComplete="off"
                spellCheck="false"
                maxLength={10}
                placeholder={SHARE_EXCHANGE.inputPlaceholder}
                value={codeInput}
                onChange={(event) => setCodeInput(event.target.value)}
                aria-describedby={hintId}
                aria-invalid={feedback?.kind === 'error' ? 'true' : undefined}
              />
            </label>
            <button type="submit" className="cx-button cx-button--ghost">
              {SHARE_EXCHANGE.redeemAction}
            </button>
          </form>

          <p
            className={`cx-feedback${feedback ? ` cx-feedback--${feedback.kind}` : ''}`}
            id={hintId}
            role="status"
            aria-live="polite"
          >
            {feedback?.message ?? SHARE_EXCHANGE.hint}
          </p>
        </div>

        {/* --- Paso de pago --------------------------------------------------- */}
        <div className="cx-pay">
          <p className="cx-micro">PASO DE PAGO · {gateway.label.toUpperCase()}</p>
          <button
            type="button"
            className="cx-button cx-button--pay"
            onClick={handlePay}
            disabled={busy || done}
            aria-describedby={`${inputId}-gateway`}
          >
            {busy ? 'ABRIENDO PASARELA…' : payLabel}
            {busy || done ? null : <ArrowRight aria-hidden="true" size={16} />}
          </button>

          <p className="cx-gateway" id={`${inputId}-gateway`} role="status" aria-live="polite">
            {payment.status === 'completed'
              ? `Listo. Tu plan quedó en cero. Sigamos.`
              : payment.status === 'simulated'
                ? 'Pago simulado: así se vería el cobro. Nada se cobró de verdad.'
                : payment.status === 'error'
                  ? `No pudimos abrir la pasarela. ${payment.result?.error ?? ''}`
                  : gateway.notice || `Cobro activo con ${gateway.label}.`}
          </p>

          {done ? (
            <p className="cx-done">
              <Check aria-hidden="true" size={18} />
              {order.share ? SHARE_EXCHANGE.receipt : 'Pedido confirmado. Vamos juntos.'}
            </p>
          ) : null}
        </div>
      </motion.div>
    </section>
  )
}
