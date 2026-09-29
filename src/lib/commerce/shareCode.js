/**
 * CÓDIGO DE INTERCAMBIO · "comparte y te queda en cero"
 * ---------------------------------------------------------------------------
 * Lo que el dueño pidió: la persona no paga con dinero, paga presentando
 * BAYONA a un amigo. Ese intercambio es el que pone el pedido en cero, y la
 * interfaz tiene que decirlo con esa misma claridad — sin fingir un descuento
 * mágico y sin esconder qué se dio a cambio.
 *
 * El código es DETERMINISTA: sale de una semilla estable (plan + periodo +
 * sal de configuración). No es una medida de seguridad ni un antifraude; es un
 * recibo del intercambio. Se documenta así para que nadie lo confunda con un
 * cupón de valor.
 *
 * No se usa localStorage, ni cookies, ni red. Nada sale del navegador.
 */

import { commerceConfig } from './config.js'
import { whatsAppShareUrl } from './share.js'
import { applyShareCode } from './order.js'

/** Alfabeto sin caracteres ambiguos (fuera I, O, 0, 1): se dicta por teléfono. */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const CODE_LENGTH = 6

export const SHARE_EXCHANGE = Object.freeze({
  /** Qué dio la persona a cambio. Se pinta tal cual, sin adornos. */
  label: 'INTERCAMBIO',
  what: 'Comparte BAYONA con un amigo por WhatsApp.',
  why: 'No pagas con dinero: pagas presentándonos a alguien que quiera empezar.',
  receipt: 'Compartiste con un amigo. Ese es tu pago, y por eso queda en cero.',
  action: 'COMPARTIR POR WHATSAPP',
  inputLabel: 'CÓDIGO DE INTERCAMBIO',
  inputPlaceholder: 'EJ. K7M2QP',
  redeemAction: 'CANJEAR',
  success: 'Código canjeado. Tu plan queda en cero.',
  hint: 'Si todavía no lo tienes: compártelo y el código se activa.',
})

function fnv1a(text) {
  let hash = 0x811c9dc5
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    // hash *= 16777619 sin salirse de 32 bits.
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0
  }
  return hash >>> 0
}

/** Código corto y estable para una semilla. Misma semilla → mismo código. */
export function buildShareCode(seed, salt = commerceConfig.shareSalt) {
  const normalizedSeed = String(seed ?? '').trim()
  if (normalizedSeed === '') return ''
  const digest = fnv1a(`${String(salt)}::${normalizedSeed}`)
  let code = ''
  let remaining = digest
  for (let index = 0; index < CODE_LENGTH; index += 1) {
    code += ALPHABET[remaining % ALPHABET.length]
    remaining = Math.floor(remaining / ALPHABET.length)
  }
  return code
}

/** Código que le corresponde a este pedido. */
export function shareCodeForOrder(order, salt = commerceConfig.shareSalt) {
  return buildShareCode(order?.seed ?? '', salt)
}

/** Normaliza lo que escribe la persona: mayúsculas y sin guiones ni espacios. */
export function normalizeShareCode(rawCode) {
  return String(rawCode ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, CODE_LENGTH + 2)
}

/**
 * Valida un código contra el esperado.
 * @returns {{valid:boolean, code:string, reason:string}}
 */
export function validateShareCode(rawCode, { expected, seed, salt = commerceConfig.shareSalt } = {}) {
  const code = normalizeShareCode(rawCode)
  const target = normalizeShareCode(expected ?? (seed ? buildShareCode(seed, salt) : ''))

  if (code === '') return { valid: false, code, reason: 'empty' }
  if (target === '') return { valid: false, code, reason: 'unavailable' }
  if (code !== target) return { valid: false, code, reason: 'mismatch' }
  return { valid: true, code, reason: 'ok' }
}

const REDEEM_ERRORS = Object.freeze({
  empty: 'Escribe el código que te dimos al compartir.',
  mismatch: 'Ese código no coincide. Revisa el que recibiste al compartir.',
  unavailable: 'Todavía no hay código para este pedido. Comparte primero y lo generamos.',
})

/**
 * Canjea el código: valida y pone el pedido en cero.
 * @returns {{ok:boolean, order:object, code:string, reason:string, message:string}}
 */
export function redeemShareCode(order, rawCode, { salt = commerceConfig.shareSalt } = {}) {
  const expected = shareCodeForOrder(order, salt)
  const validation = validateShareCode(rawCode, { expected, salt })

  if (!validation.valid) {
    return {
      ok: false,
      order,
      code: validation.code,
      reason: validation.reason,
      message: REDEEM_ERRORS[validation.reason] ?? REDEEM_ERRORS.mismatch,
    }
  }

  const share = Object.freeze({
    code: validation.code,
    label: SHARE_EXCHANGE.label,
    exchange: SHARE_EXCHANGE.receipt,
    seed: order.seed,
    expected,
  })

  return {
    ok: true,
    order: applyShareCode(order, share),
    code: validation.code,
    reason: 'ok',
    message: SHARE_EXCHANGE.success,
  }
}

/**
 * Prepara el material para compartir: mensaje, enlace de WhatsApp y enlace
 * profundo a la web. El enlace va SIN número fijo a propósito: quien comparte
 * elige a qué amigo se lo manda, que es justo el intercambio que se pide.
 */
export function buildSharePayload(order, { siteUrl = commerceConfig.siteUrl, salt = commerceConfig.shareSalt } = {}) {
  const code = shareCodeForOrder(order, salt)
  const origin = String(siteUrl).replace(/\/+$/, '')
  const shareUrl = `${origin}/checkout?plan=${encodeURIComponent(order.plan.id.toLowerCase())}&codigo=${encodeURIComponent(code)}`
  const message = [
    'Te paso esto: BAYONA, entrenamiento con método y alguien que te sigue de cerca.',
    `${order.plan.name} · ${order.period.label}.`,
    `Empieza aquí y te queda en cero con mi código: ${code}`,
    shareUrl,
  ].join('\n')

  return Object.freeze({
    code,
    shareUrl,
    message,
    whatsAppUrl: whatsAppShareUrl(message),
    exchange: SHARE_EXCHANGE,
  })
}
