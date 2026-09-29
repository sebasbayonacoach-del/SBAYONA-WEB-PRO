/**
 * MONEDA DEL RECORRIDO
 * ---------------------------------------------------------------------------
 * El dueño lo pidió explícitamente: la persona elige su país y con el país
 * cambia la moneda, y todo lo que se muestra (regalo, sellos, crédito, planes)
 * habla en esa moneda desde ese momento.
 *
 * Los valores internos viven SIEMPRE en euros. Convertir en el origen y
 * formatear al final evita que cada pantalla invente su propio tipo de cambio y
 * que aparezcan dos cifras distintas para la misma cosa.
 *
 * Los tipos de cambio son los mismos que ya usa `src/config/offerings.js`
 * (COP_PER_EUR_REFERENCE = 4300). No son cotizaciones en vivo: son una
 * referencia estable para mostrar el valor aproximado de un regalo gratuito.
 */

export const CURRENCIES = Object.freeze({
  EUR: Object.freeze({
    code: 'EUR',
    symbol: '€',
    perEur: 1,
    /** El euro va delante y agrupa con punto, como en España. */
    prefix: true,
    thousand: '.',
    label: 'Euros',
  }),
  COP: Object.freeze({
    code: 'COP',
    symbol: '$',
    perEur: 4300,
    prefix: true,
    thousand: '.',
    label: 'Pesos colombianos',
  }),
  USD: Object.freeze({
    code: 'USD',
    symbol: '$',
    perEur: 1.09,
    prefix: true,
    thousand: ',',
    label: 'Dólares',
  }),
})

export const DEFAULT_CURRENCY = 'EUR'

export function currencyOf(code) {
  return CURRENCIES[String(code ?? '').toUpperCase()] ?? CURRENCIES[DEFAULT_CURRENCY]
}

/** Euros → unidad de la moneda elegida, redondeado a entero. */
export function convertFromEur(valueEur, code) {
  return Math.round((Number(valueEur) || 0) * currencyOf(code).perEur)
}

function groupDigits(value, separator) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, separator)
}

/**
 * `239` en EUR → "€239"; en COP → "$1.027.700"; en USD → "$261".
 * Formateo manual a propósito: `Intl.NumberFormat` depende del locale del
 * navegador y daría cifras distintas en los tests y entre visitantes.
 */
export function formatMoney(valueEur, code) {
  const currency = currencyOf(code)
  const amount = groupDigits(convertFromEur(valueEur, currency.code), currency.thousand)
  return `${currency.symbol}${amount}`
}

/** Igual que `formatMoney` pero con el código ISO detrás, para líneas de precio. */
export function formatMoneyWithCode(valueEur, code) {
  const currency = currencyOf(code)
  return `${formatMoney(valueEur, currency.code)} ${currency.code}`
}
