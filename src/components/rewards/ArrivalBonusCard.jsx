/**
 * BAYONA · PASE DE LLEGADA Y CARTERA DE SELLOS
 * ---------------------------------------------------------------------------
 * La "notificación de lujo" que pidió el dueño (comentario 13, 22-09): al
 * llegar a la portada aparece un pase plegado, con aspecto de invitación VIP y
 * no de contador, y durante el recorrido el mismo artefacto se queda flotando
 * como una billetera minimalista que se abre con un clic.
 *
 * LA REGLA QUE MANDA AQUÍ (§6, comentario 23 y Fase 0): navegar produce
 * HALLAZGOS, nunca crédito. Cada sello llega en estado «descubierto, pendiente
 * de reclamar» y solo suma al saldo cuando la persona pulsa RECLAMAR — sobre un
 * sello concreto o sobre el pase entero. El provider lo garantiza (`claimSeal`
 * no puede reclamar lo que no se descubrió); esta vista lo deja visible con los
 * cuatro estados de §6: descubierto → pendiente de reclamar → reclamado → usado.
 *
 * Dentro vive el selector de país y con el país cambia la moneda (Colombia →
 * pesos, España/Europa → euros, otro país → dólares), reutilizando REGIONS de
 * la recepción para que los dos subsistemas no puedan divergir.
 *
 * Honestidad ante todo (palabras del dueño: "no quiero que empiece a imaginar
 * que les vamos a dar dinero"): el artefacto se lee SIEMPRE como CRÉDITO
 * BAYONA, una cortesía para el primer plan. Una sola línea corta lo aclara.
 *
 * Comportamiento:
 *  · No es modal bloqueante: flota y no impide leer ni comprar.
 *  · Al reclamar colapsa en el widget; el widget reabre el pase cuando hay
 *    sellos nuevos.
 *  · «Comparte y suma» abre WhatsApp, suma el crédito del compartidor y saca la
 *    TARJETA DE REGALO grande y personalizable (GiftPassCard, comentario 14).
 *  · Las secciones registran sellos con `useRewards().award(...)`; las misiones
 *    del recorrido se registran aquí mismo al descubrirlas, no al pagarlas.
 *
 * Accesibilidad: diálogo con nombre accesible, el foco entra al abrir (RECLAMAR)
 * y vuelve al widget al cerrar. Sin salida por Escape a propósito: la única
 * salida es reclamar. Movimiento solo con transform/opacity sobre elementos
 * propios y apagado con `prefers-reduced-motion`.
 */

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { Check, Gift, KeyRound, MessageCircle } from 'lucide-react'
import { CURRENCIES } from '../../lib/commerce/money.js'
import { REGIONS } from '../../lib/onboarding/questions.js'
import { whatsAppLink, SITE_URL } from '../../config/site.config.js'
import { useUniverseScale } from '../../lib/scale/UniverseScaleProvider.jsx'
import {
  ARRIVAL_BONUS_EUR,
  SHARE_BONUS_EUR,
  SEAL_STATES,
  useRewards,
} from '../../lib/rewards/RewardsProvider.jsx'
import GiftPassCard from './GiftPassCard.jsx'
import '../../styles/rewards.css'

/** Milisegundos hasta que la notificación aparece: llegada, no emboscada. */
const ARRIVAL_DELAY_MS = 1200

/** Enlace de compartir: el mismo helper de WhatsApp que usa todo el sitio. */
const SHARE_URL = whatsAppLink(
  'Te paso esto: en BAYONA te dan un crédito para empezar a entrenar. Empieza gratis conmigo: ' +
    SITE_URL,
)

/**
 * Las misiones del recorrido las publica UniverseScaleProvider, que NO envuelve
 * a este componente en los tests aislados (y su hook lanza sin proveedor). Se
 * lee con try/catch alrededor del hook: `useUniverseScale` ya llamó a
 * `useContext` antes de tirar, así que el orden de ganchos se mantiene y el
 * pase simplemente se queda sin misiones que ofrecer cuando no hay escala.
 */
function useMisiones() {
  try {
    return useUniverseScale().misiones ?? []
  } catch {
    return []
  }
}

export default function ArrivalBonusCard() {
  const { pathname } = useLocation()
  const reducedMotion = useReducedMotion()

  const {
    regionId,
    currency,
    seals,
    sealCount,
    pendingSealCount,
    claimedSealCount,
    totalEur,
    foundEur,
    bonusClaimed,
    shareClaimed,
    dismissed,
    stateOf,
    format,
    setRegion,
    discover,
    claimSeal,
    claimBonus,
    claimShareReward,
    openCard,
  } = useRewards()

  const misiones = useMisiones()

  /**
   * La invitación de llegada solo suena en la portada (su temporizador vive
   * ahí abajo), pero el cuadrito flotante acompaña TODO el recorrido: el
   * crédito se guarda y solo se canjea al final, en la pasarela.
   */
  const isHome = pathname === '/'

  const [arrived, setArrived] = useState(dismissed)
  const [regaloAbierto, setRegaloAbierto] = useState(false)
  const ctaRef = useRef(null)
  const widgetRef = useRef(null)
  /** Solo devuelve el foco si la tarjeta llegó a estar abierta de verdad. */
  const wasOpenRef = useRef(false)

  useEffect(() => {
    if (!isHome) return undefined
    if (dismissed) {
      setArrived(true)
      return undefined
    }
    const timer = setTimeout(() => setArrived(true), ARRIVAL_DELAY_MS)
    return () => clearTimeout(timer)
  }, [isHome, dismissed])

  /*
    Una misión cerrada es un HALLAZGO, no un pago. Se registra para que el pase
    pueda ofrecerlo; el crédito solo se mueve cuando la persona reclama (§6).
  */
  useEffect(() => {
    for (const mision of misiones) {
      if (!mision.hecha) continue
      discover({ id: `mision-${mision.id}`, label: mision.label, eur: mision.eur })
    }
  }, [misiones, discover])

  const isOpen = arrived && !dismissed
  const showWidget = arrived && dismissed
  const pendingEur = seals
    .filter((seal) => !seal.reclamado && !seal.usado)
    .reduce((total, seal) => total + seal.eur, 0)
  const pasePendiente = !bonusClaimed || pendingSealCount > 0
  const todoGuardado = bonusClaimed && pendingSealCount === 0
  const cifrasEncontradas = foundEur
  const escondidosPorDescubrir = misiones.filter((mision) => !mision.hecha).length

  useEffect(() => {
    if (isOpen) wasOpenRef.current = true
  }, [isOpen])

  /*
    El foco tiene que volver a la billetera, pero con `mode="wait"` (ver abajo)
    la billetera aún no está montada en el frame en que el pase se cierra:
    aparece cuando termina su salida. Por eso el gesto vive en el ref del propio
    botón, que corre en el único momento en que hay un nodo al que enfocar.
  */
  const attachWidget = (node) => {
    widgetRef.current = node
    if (node && wasOpenRef.current) {
      wasOpenRef.current = false
      node.focus()
    }
  }

  const onShare = () => {
    window.open(SHARE_URL, '_blank', 'noopener,noreferrer')
    claimShareReward()
    setRegaloAbierto(true)
  }

  const currencyLabel = CURRENCIES[currency]?.label ?? 'tu moneda'
  const shareButton = (
    <button
      type="button"
      className="arrival-bonus-widget__share"
      onClick={onShare}
      aria-label={
        shareClaimed
          ? 'Crédito por compartir ya sumado'
          : `Compartir por WhatsApp y sumar ${format(SHARE_BONUS_EUR)} de crédito`
      }
    >
      {shareClaimed ? (
        <>
          <Check size={14} strokeWidth={2} aria-hidden="true" />
          {/* El rótulo va en su propio span: en la columna estrecha de 1440 px
              se oculta con CSS y el botón se queda siendo solo el icono. */}
          <span className="arrival-bonus-widget__share-label">SUMADO</span>
        </>
      ) : (
        <>
          <MessageCircle size={14} strokeWidth={1.6} aria-hidden="true" />
          <span className="arrival-bonus-widget__share-label">COMPARTE Y SUMA</span>
        </>
      )}
    </button>
  )

  /*
    EL INVARIANTE DEL PASE. Antes había DOS `<AnimatePresence>` hermanos dentro
    de un mismo contenedor: al pasar de pase a billetera (o al revés) el que sale
    sigue montado ~450 ms mientras el que entra ya está pintando, y los dos
    caían dentro de la misma capa flex. Resultado medido en la portada a 1440:
    la capa `--widget` (casilla 2, abajo a la izquierda) se abría a 651x631 px
    metiendo dentro un pase de 436 px —el doble de su ancho de diseño, porque al
    irse el modificador `--open` deja de aplicar
    `.arrival-bonus-layer--open .arrival-bonus__card`— junto a una billetera
    colocada en x=468, en mitad de la columna de lectura. Se veía las dos cosas
    a la vez, que es justo lo que el dueño pidió que no pasara.

    Aquí se resuelve por estructura, no por timing: UN solo `<AnimatePresence>`
    con `mode="wait"` y UN hijo según el estado. El hijo es la capa, así que el
    modificador `--open` / `--widget` viaja con el elemento que anima y el que
    sale no puede saltar de casilla mientras se desvanece.
  */
  const duracionSalida = reducedMotion ? { duration: 0.12 } : { duration: 0.16 }

  const paseMotion = reducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0, transition: duracionSalida },
      }
    : {
        initial: { opacity: 0, y: 28, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 18, scale: 0.97, transition: duracionSalida },
      }

  const carteraMotion = reducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0, transition: duracionSalida },
      }
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 16, transition: duracionSalida },
      }

  if (!isOpen && !showWidget) return null

  return (
    <>
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="arrival-bonus-pase"
            className="arrival-bonus-layer arrival-bonus-layer--open"
            transition={{ duration: reducedMotion ? 0.15 : 0.5, ease: [0.16, 1, 0.3, 1] }}
            {...paseMotion}
          >
            <div
              role="dialog"
              aria-labelledby="arrival-bonus-title"
              aria-describedby="arrival-bonus-lead"
              className="arrival-bonus__card"
            >
              <div className="arrival-bonus__strip">
                <span className="arrival-bonus__brand">BAYONA</span>
                <span className="arrival-bonus__chip" aria-hidden="true" />
                <span className="arrival-bonus__kind">PASE VIP · CRÉDITO DE ENTRENAMIENTO</span>
              </div>

              <p className="arrival-bonus__eyebrow">{todoGuardado ? 'CARTERA BAYONA' : 'PASE VIP ENCONTRADO'}</p>
              <h2 id="arrival-bonus-title" className="arrival-bonus__title">
                PONME MUCHA ATENCIÓN
              </h2>
              <p id="arrival-bonus-lead" className="arrival-bonus__lead">
                {todoGuardado ? (
                  <>
                    Ya lo tienes guardado:{' '}
                    <strong className="arrival-bonus__amount">{format(totalEur)}</strong> en{' '}
                    {currencyLabel.toLowerCase()} de crédito BAYONA. Cuando crees tu cuenta, este pase
                    pasa a tu centro de mando.
                  </>
                ) : (
                  <>
                    Acabas de ganar un pase de llegada. Si quieres guardarlo, reclama{' '}
                    <strong className="arrival-bonus__amount">{format(ARRIVAL_BONUS_EUR)}</strong> en{' '}
                    {currencyLabel.toLowerCase()} como crédito BAYONA para tu primer paso.
                  </>
                )}
              </p>
              {/* Una línea, elegante y clara: nada de muros legales. */}
              <p className="arrival-bonus__honesty">
                Crédito BAYONA: cortesía para tu plan, no dinero retirable.
              </p>

              <div className="arrival-bonus__region">
                <label className="arrival-bonus__label" htmlFor="arrival-bonus-region">
                  Tu país
                </label>
                <select
                  id="arrival-bonus-region"
                  className="arrival-bonus__select"
                  value={regionId}
                  onChange={(event) => setRegion(event.target.value)}
                >
                  {REGIONS.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.label} · {CURRENCIES[region.currency]?.label ?? region.currency}
                    </option>
                  ))}
                </select>
              </div>

              <p className="arrival-bonus__seals">
                Mientras recorres la casa puedes encontrar <strong>SELLOS</strong>
                {sealCount > 0 ? (
                  <>
                    {' '}
                    — llevas {sealCount} ({seals.map((seal) => seal.label).join(', ')})
                  </>
                ) : null}
                . Ve sumando sellos por la casa: {' '}
                {pendingSealCount > 0
                  ? `${pendingSealCount} ${pendingSealCount === 1 ? 'sigue' : 'siguen'} abajo, esperando tu clic: nada se suma solo.`
                  : sealCount > 0
                    ? 'todos los que encontraste están reclamados y guardados.'
                    : `todavía no has encontrado ninguno${escondidosPorDescubrir > 0 ? ` y hay ${escondidosPorDescubrir} regalos escondidos por descubrir` : ''}.`}
                {' '}
                Al final, tus sellos y tu crédito se guardan juntos en tu cuenta.
              </p>

              {sealCount > 0 && (
                <ul className="arrival-bonus__seal-list" aria-label="Sellos encontrados en la visita">
                  {seals.map((seal) => {
                    const estado = stateOf(seal.id)
                    const pendiente = estado === SEAL_STATES.pendiente
                    return (
                      <li key={seal.id} className="arrival-bonus__seal" data-state={estado}>
                        <span className="arrival-bonus__seal-notch" aria-hidden="true" />
                        <span className="arrival-bonus__seal-copy">
                          <strong>{seal.label}</strong>
                          <small>
                            {format(seal.eur)} · {estado}
                          </small>
                        </span>
                        {pendiente ? (
                          <button
                            type="button"
                            className="arrival-bonus__seal-cta"
                            onClick={() => claimSeal(seal.id)}
                          >
                            RECLAMAR · {seal.label}
                          </button>
                        ) : (
                          <span className="arrival-bonus__seal-state">
                            {estado === SEAL_STATES.usado ? (
                              'CANJEADO'
                            ) : (
                              <>
                                <Check size={13} strokeWidth={2} aria-hidden="true" />
                                GUARDADO
                              </>
                            )}
                          </span>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}

              <div className="arrival-bonus__perf" aria-hidden="true" />

              <div className="arrival-bonus__actions">
                {/*
                  El gesto del pase: guarda lo encontrado (bono + sellos) de un
                  clic y cierra el pase sobre la billetera. Sigue siendo un
                  clic: sin él, el saldo no existe (§6).
                */}
                <button type="button" ref={ctaRef} className="arrival-bonus__cta" onClick={claimBonus}>
                  RECLAMAR
                </button>
                {todoGuardado ? (
                  <Link className="arrival-bonus__cta arrival-bonus__cta--link" to="/entrar">
                    <KeyRound size={15} strokeWidth={1.6} aria-hidden="true" />
                    GUARDAR EN MI CUENTA
                  </Link>
                ) : (
                  <button type="button" className="arrival-bonus__ghost" onClick={claimBonus}>
                    RECLAMAR TODO ({format(pendingEur + (bonusClaimed ? 0 : ARRIVAL_BONUS_EUR))})
                  </button>
                )}
                <button
                  type="button"
                  className="arrival-bonus__ghost arrival-bonus__ghost--gift"
                  onClick={onShare}
                >
                  <Gift size={14} strokeWidth={1.6} aria-hidden="true" />
                  REGALAR UN PASE
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="arrival-bonus-cartera"
            className="arrival-bonus-layer arrival-bonus-layer--widget"
            transition={{ duration: reducedMotion ? 0.15 : 0.4, ease: [0.16, 1, 0.3, 1] }}
            {...carteraMotion}
          >
            <div className="arrival-bonus-widget">
              <button
                type="button"
                ref={attachWidget}
                className="arrival-bonus-widget__main"
                onClick={openCard}
                aria-label={`Abrir mi crédito BAYONA: ${format(cifrasEncontradas)}${
                  sealCount > 0 ? `, ${sealCount} sellos` : ''
                }`}
              >
                <span className="arrival-bonus-widget__label">
                  {bonusClaimed && claimedSealCount > 0 ? 'CARTERA' : 'PASE VIP'}
                </span>
                {/*
                  Estado plegado (comentario 13): la billetera minimalista enseña
                  lo ENCONTRADO, no un contador suelto. El saldo canjeable sigue
                  siendo `totalEur`, que solo sube con un clic de por medio.

                  El testigo del canto es el aviso de «todavía no es tuyo» donde
                  la palabra RECLAMAR no cabe (la columna de 1440 px es de 80 px
                  y el rótulo mide 107 px): se ve, no cuesta un píxel de ancho, y
                  el `aria-label` del botón ya dice la cifra encontrada. La orden
                  escrita está dentro del pase, que es donde se reclama.
                */}
                {pasePendiente ? (
                  <span className="arrival-bonus-widget__claim">RECLAMAR</span>
                ) : null}
                <span className="arrival-bonus-widget__amount">
                  {pasePendiente ? format(cifrasEncontradas) : format(totalEur)}
                </span>
                {sealCount > 0 && (
                  <span className="arrival-bonus-widget__seals">
                    {sealCount} {sealCount === 1 ? 'sello' : 'sellos'}
                  </span>
                )}
                {pendingEur > 0 && (
                  <span className="arrival-bonus-widget__pending">
                    {format(pendingEur)} sin reclamar
                  </span>
                )}
                {pasePendiente ? (
                  <span className="arrival-bonus-widget__flag" aria-hidden="true" />
                ) : null}
              </button>
              {shareButton}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {regaloAbierto && (
          <GiftPassCard key="gift-pass" onCerrar={() => setRegaloAbierto(false)} />
        )}
      </AnimatePresence>
    </>
  )
}
