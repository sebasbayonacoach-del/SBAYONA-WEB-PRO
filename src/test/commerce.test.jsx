/**
 * CAPA DE COMERCIO · pedido, moneda, pasarelas y panel
 * ---------------------------------------------------------------------------
 * Un solo archivo para todo lo nuevo: las matemáticas del pedido (subtotal,
 * crédito, código de intercambio, cero), el formateo SIEMPRE a través del
 * helper de moneda del sitio, el comportamiento de los dos adaptadores con y
 * sin claves, y el panel pintando el resultado en cero.
 *
 * Lo que se vigila de cerca: sin claves no se hace NI UNA llamada de red.
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import {
  applyCredit,
  buildCommerceConfig,
  buildOrder,
  buildShareCode,
  createPayPalAdapter,
  createStripeAdapter,
  describePaymentStatus,
  formatOrderAmount,
  formatOrderTotal,
  FREE_PLAN,
  orderSummaryLines,
  planPriceEur,
  redeemShareCode,
  resolvePeriod,
  shareCodeForOrder,
  startPayment,
  ZERO_FIRST_MONTH_OFFER,
} from '../lib/commerce/index.js'
import { CURRENCIES, formatMoney } from '../lib/commerce/money.js'
import CheckoutPanel from '../components/commerce/CheckoutPanel.jsx'

/** Configuración sin ninguna clave: lo que hay hoy en el repositorio. */
const EMPTY_CONFIG = buildCommerceConfig({})

/** Configuración con claves falsas pero con la FORMA correcta. */
const STRIPE_CONFIG = buildCommerceConfig({
  VITE_PAYMENTS_PROVIDER: 'stripe',
  VITE_PAYMENTS_ENABLED: 'true',
  VITE_STRIPE_PUBLISHABLE_KEY: 'pk_test_demo',
  VITE_STRIPE_PRICE_RAIZ_MONTH: 'price_raiz_demo',
  VITE_SITE_URL: 'https://bayona.test',
})

const PAYPAL_CONFIG = buildCommerceConfig({
  VITE_PAYMENTS_PROVIDER: 'paypal',
  VITE_PAYMENTS_ENABLED: 'true',
  VITE_PAYPAL_CLIENT_ID: 'client_demo',
  VITE_PAYPAL_ENVIRONMENT: 'sandbox',
  VITE_PAYPAL_PLAN_RAIZ_MONTH: 'P-DEMO',
  VITE_SITE_URL: 'https://bayona.test',
})

let fetchSpy

afterEach(() => {
  vi.unstubAllGlobals()
})

function stubFetch() {
  fetchSpy = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }))
  vi.stubGlobal('fetch', fetchSpy)
  return fetchSpy
}

describe('Matemáticas del pedido', () => {
  it(
    'deriva el subtotal del catálogo publicado, en euros',
    () => {
      const order = buildOrder({ planId: 'RAIZ' })

      // 149.000 COP / 4.300 = 34,65 → 35 €, el mismo "≈ €35" que ya se publica.
      expect(order.subtotalEur).toBe(35)
      expect(order.totalEur).toBe(35)
      expect(order.lineItems).toHaveLength(1)
      expect(order.lineItems[0].label).toBe('PLAN RAÍZ')
      expect(order.lineItems[0].detail).toBe('CADA MES')
      expect(order.isZero).toBe(false)
    },
    60000,
  )

  it(
    'no duplica precios: los cuatro planes de pago salen de offerings.js',
    () => {
      const expected = { RAIZ: 35, FUERZA: 70, RENDIMIENTO: 116, ELITE: 209 }

      Object.entries(expected).forEach(([planId, eur]) => {
        expect(planPriceEur({ priceEur: eur }, resolvePeriod('month'))).toBe(eur)
        expect(buildOrder({ planId }).totalEur).toBe(eur)
      })

      expect(FREE_PLAN.priceEur).toBe(0)
      expect(buildOrder({ planId: 'GRATIS' }).totalEur).toBe(0)
    },
    60000,
  )

  it(
    'el anual es el mensual por doce, sin descuento inventado',
    () => {
      const monthly = buildOrder({ planId: 'FUERZA', period: 'month' })
      const yearly = buildOrder({ planId: 'FUERZA', period: 'year' })

      expect(yearly.totalEur).toBe(monthly.totalEur * 12)
      expect(yearly.period.label).toBe('CADA AÑO')
    },
    60000,
  )

  it(
    'aplica crédito y nunca deja el total en negativo',
    () => {
      const order = buildOrder({ planId: 'RENDIMIENTO' })
      const withCredit = applyCredit(order, 40)

      expect(withCredit.creditEur).toBe(40)
      expect(withCredit.totalEur).toBe(76)

      const overflowing = applyCredit(order, 999)
      expect(overflowing.creditEur).toBe(116)
      expect(overflowing.totalEur).toBe(0)
      expect(overflowing.isZero).toBe(true)
    },
    60000,
  )

  it(
    'el crédito se resta antes que el intercambio en el resumen',
    () => {
      const order = applyCredit(buildOrder({ planId: 'RAIZ' }), 10)
      const lines = orderSummaryLines(order)

      expect(lines.map((line) => line.kind)).toEqual(['item', 'credit'])
      expect(lines[1].valueEur).toBe(-10)
      expect(lines[1].value.endsWith('€10')).toBe(true)
      expect(order.totalEur).toBe(25)
    },
    60000,
  )

  it(
    'canjea el código de intercambio y pone el pedido en cero',
    () => {
      const order = buildOrder({ planId: 'RAIZ' })
      const code = shareCodeForOrder(order)
      const result = redeemShareCode(order, code)

      expect(code).toMatch(/^[A-Z2-9]{6}$/)
      expect(result.ok).toBe(true)
      expect(result.order.totalEur).toBe(0)
      expect(result.order.isZero).toBe(true)
      // El valor real sigue visible: se enseña lo que se dejó de pagar.
      expect(result.order.subtotalEur).toBe(35)
      expect(result.order.shareEur).toBe(35)
      expect(result.order.share.code).toBe(code)
      expect(result.order.share.exchange).toContain('Compartiste con un amigo')
    },
    60000,
  )

  it(
    'el código es determinista y tolera guiones y minúsculas',
    () => {
      const order = buildOrder({ planId: 'ELITE' })
      const code = shareCodeForOrder(order)

      expect(buildShareCode(order.seed)).toBe(code)
      expect(redeemShareCode(order, code.toLowerCase()).ok).toBe(true)
      expect(redeemShareCode(order, `${code.slice(0, 3)}-${code.slice(3)}`).ok).toBe(true)
    },
    60000,
  )

  it(
    'rechaza un código ajeno y no toca el precio',
    () => {
      const order = buildOrder({ planId: 'RAIZ' })

      const wrong = redeemShareCode(order, 'ZZZZZZ')
      expect(wrong.ok).toBe(false)
      expect(wrong.reason).toBe('mismatch')
      expect(wrong.order.totalEur).toBe(35)

      const empty = redeemShareCode(order, '')
      expect(empty.ok).toBe(false)
      expect(empty.reason).toBe('empty')
    },
    60000,
  )

  it(
    'expresa el primer mes a cero como oferta, no como un total trucado',
    () => {
      const order = buildOrder({ planId: 'FUERZA', introOffer: ZERO_FIRST_MONTH_OFFER })

      expect(order.introOffer.id).toBe('primer-mes-cero')
      expect(order.firstChargeEur).toBe(0)
      /*
        Esta aserción decía `toBe(1)`, es decir: el test garantizaba que un plan
        de 70 €/mes se ofrecía en la pasarela a 1 €/mes. Lo pineado era el
        defecto, no la guarda (comentario 26 del dueño: «no se puede pagar 0
        euros y después un mes, porque se rompe»). Se corrigió `plans.js` y aquí
        se exige lo que el enunciado del test ya prometía: que la oferta no
        truque el total. Se comprueba doble, contra el subtotal del propio plan
        y contra el número publicado, para que un `null` que se cole no vuelva a
        pasar como recurrente.
      */
      expect(order.recurringEur).toBe(order.subtotalEur)
      expect(order.recurringEur).toBe(70)
      expect(order.introOffer.trialPeriodDays).toBe(30)
      expect(order.introOffer.thenInterval).toBe('month')
      // El precio real sigue ahí: la oferta no lo borra.
      expect(order.subtotalEur).toBe(70)
    },
    60000,
  )
})

describe('Moneda · siempre a través del helper del sitio', () => {
  it(
    'formatea los importes del pedido con formatMoney',
    () => {
      const order = buildOrder({ planId: 'RAIZ', currency: 'EUR' })

      expect(formatOrderTotal(order)).toBe('€35')
      expect(formatOrderAmount(order.subtotalEur, order)).toBe('€35')
      expect(formatMoney(35, 'COP')).toBe('$150.500')
      expect(formatMoney(35, 'USD')).toBe('$38')
      expect(formatOrderAmount(35, { currency: 'COP' })).toBe(formatMoney(35, 'COP'))
    },
    60000,
  )

  it(
    'el cero se ve como cero en las tres monedas',
    () => {
      expect(formatMoney(0, 'EUR')).toBe('€0')
      expect(formatOrderTotal(buildOrder({ planId: 'GRATIS' }))).toBe('€0')
      expect(formatOrderTotal(buildOrder({ planId: 'GRATIS', currency: 'COP' }))).toBe('$0')
      expect(formatOrderTotal(buildOrder({ planId: 'GRATIS', currency: 'USD' }))).toBe('$0')
      expect(CURRENCIES.COP.perEur).toBe(4300)
    },
    60000,
  )
})

describe('Adaptador Stripe', () => {
  it(
    'sin claves se declara no configurado y resuelve en simulación sin tocar la red',
    async () => {
      const spy = stubFetch()
      const adapter = createStripeAdapter(EMPTY_CONFIG)
      const order = buildOrder({ planId: 'RAIZ' })

      expect(adapter.isConfigured()).toBe(false)
      expect(adapter.isConfigured(order)).toBe(false)
      expect(adapter.readiness(order)).toMatchObject({ configured: false, mode: 'simulation' })

      const result = await adapter.startPayment(order)

      expect(result).toMatchObject({
        status: 'simulated',
        provider: 'stripe',
        mode: 'simulation',
        simulated: true,
        redirectUrl: null,
        amountEur: 35,
      })
      expect(result.request.body.mode).toBe('payment')
      expect(spy).not.toHaveBeenCalled()
    },
    60000,
  )

  it(
    'con claves arma la petición de sesión y redirige',
    async () => {
      const spy = stubFetch()
      const adapter = createStripeAdapter(STRIPE_CONFIG)
      const order = buildOrder({ planId: 'RAIZ', introOffer: ZERO_FIRST_MONTH_OFFER })

      expect(adapter.isConfigured(order)).toBe(true)
      expect(adapter.readiness(order)).toMatchObject({ configured: true, mode: 'live' })

      const transport = vi.fn(() => Promise.resolve({ url: 'https://checkout.stripe.test/abc' }))
      const result = await adapter.startPayment(order, { transport })

      expect(result).toMatchObject({
        status: 'redirect',
        mode: 'live',
        simulated: false,
        redirectUrl: 'https://checkout.stripe.test/abc',
      })
      expect(transport).toHaveBeenCalledTimes(1)
      expect(spy).not.toHaveBeenCalled()

      const [endpoint, init] = transport.mock.calls[0]
      expect(endpoint).toBe('/pagos/sesion')
      expect(init.method).toBe('POST')

      const body = JSON.parse(init.body)
      expect(body.mode).toBe('subscription')
      expect(body.currency).toBe('eur')
      expect(body.stripePublishableKey).toBe('pk_test_demo')
      expect(body.line_items[0].price).toBe('price_raiz_demo')
      expect(body.subscription_data.trial_period_days).toBe(30)
      expect(body.subscription_data.trial_settings.end_behavior.missing_payment_method).toBe('cancel')
      expect(body.success_url).toBe('https://bayona.test/order-confirmation')
      expect(body.metadata.plan).toBe('RAIZ')
    },
    60000,
  )

  it(
    'falla sin romper el recorrido si el servidor no responde',
    async () => {
      const adapter = createStripeAdapter(STRIPE_CONFIG)
      const order = buildOrder({ planId: 'RAIZ' })
      const transport = vi.fn(() => Promise.reject(new Error('404')))

      const result = await adapter.startPayment(order, { transport })

      expect(result.status).toBe('error')
      expect(result.error).toBe('404')
      expect(result.fallback.mode).toBe('simulation')
      expect(result.fallback.simulated).toBe(true)
    },
    60000,
  )
})

describe('Adaptador PayPal', () => {
  it(
    'sin client id entra en simulación sin red',
    async () => {
      const spy = stubFetch()
      const adapter = createPayPalAdapter(EMPTY_CONFIG)
      const order = buildOrder({ planId: 'RAIZ' })

      expect(adapter.isConfigured(order)).toBe(false)
      expect(adapter.readiness(order).reason).toContain('VITE_PAYPAL_CLIENT_ID')

      const result = await adapter.startPayment(order)

      expect(result).toMatchObject({ status: 'simulated', provider: 'paypal', simulated: true })
      expect(result.request.body.intent).toBe('capture')
      expect(spy).not.toHaveBeenCalled()
    },
    60000,
  )

  it(
    'con client id arma la suscripción y el script del SDK',
    async () => {
      const adapter = createPayPalAdapter(PAYPAL_CONFIG)
      const order = buildOrder({ planId: 'RAIZ', introOffer: ZERO_FIRST_MONTH_OFFER })

      expect(adapter.isConfigured(order)).toBe(true)

      const request = adapter.buildSessionRequest(order)
      expect(request.body.intent).toBe('subscription')
      expect(request.body.plan_id).toBe('P-DEMO')
      expect(request.body.paypalClientId).toBe('client_demo')
      expect(request.body.environment).toBe('sandbox')
      expect(request.body.amount).toEqual({ currency_code: 'EUR', value: '35.00' })
      expect(request.body.subscription_data.trial_period_days).toBe(30)
      expect(request.body.application_context.user_action).toBe('SUBSCRIBE_NOW')
      expect(request.sdkUrl).toContain('client-id=client_demo')

      const transport = vi.fn(() => Promise.resolve({ links: [{ rel: 'approve', href: 'https://paypal.test/approve' }] }))
      const result = await adapter.startPayment(order, { transport })

      expect(result).toMatchObject({
        status: 'redirect',
        provider: 'paypal',
        redirectUrl: 'https://paypal.test/approve',
        simulated: false,
      })
    },
    60000,
  )
})

describe('Elección de pasarela y pedido en cero', () => {
  it(
    'un total de cero no pasa por ninguna pasarela',
    async () => {
      const spy = stubFetch()
      const order = buildOrder({ planId: 'GRATIS' })

      const result = await startPayment(order, { config: STRIPE_CONFIG })

      expect(result).toMatchObject({ status: 'completed', mode: 'zero', amountEur: 0, isZero: true })
      expect(result.simulated).toBe(false)
      expect(result.request).toBeNull()
      expect(spy).not.toHaveBeenCalled()
    },
    60000,
  )

  it(
    'la configuración elige el proveedor y el estado lo dice en español',
    () => {
      const order = buildOrder({ planId: 'RAIZ' })

      expect(describePaymentStatus(order, { config: EMPTY_CONFIG })).toMatchObject({
        provider: 'stripe',
        mode: 'simulation',
        live: false,
      })
      expect(describePaymentStatus(order, { config: EMPTY_CONFIG }).notice).toContain('MODO SIMULACIÓN')

      expect(describePaymentStatus(order, { config: STRIPE_CONFIG })).toMatchObject({
        provider: 'stripe',
        mode: 'live',
        live: true,
      })
      expect(describePaymentStatus(order, { provider: 'paypal', config: STRIPE_CONFIG })).toMatchObject({
        provider: 'paypal',
        mode: 'simulation',
        live: false,
      })
    },
    60000,
  )
})

describe('Panel de cierre', () => {
  it(
    'pinta el resultado en cero con el valor real tachado',
    async () => {
      render(<CheckoutPanel planId="RAIZ" period="month" currency="EUR" />)

      // Antes de canjear: el precio publicado, bien visible (línea + total).
      expect(screen.getByText('PLAN RAÍZ')).toBeInTheDocument()
      expect(screen.getAllByText('€35')).toHaveLength(2)
      expect(screen.getByText('TOTAL HOY')).toBeInTheDocument()
      expect(screen.getByText(/MODO SIMULACIÓN/)).toBeInTheDocument()

      // El intercambio, dicho claro.
      expect(screen.getByRole('link', { name: /COMPARTIR POR WHATSAPP/i })).toHaveAttribute(
        'href',
        expect.stringContaining('https://wa.me/?text='),
      )
      expect(screen.getByRole('textbox', { name: /CÓDIGO DE INTERCAMBIO/i })).toBeInTheDocument()

      const code = shareCodeForOrder(buildOrder({ planId: 'RAIZ' }))
      fireEvent.change(screen.getByRole('textbox', { name: /CÓDIGO DE INTERCAMBIO/i }), {
        target: { value: code },
      })
      fireEvent.click(screen.getByRole('button', { name: /^CANJEAR$/i }))

      expect(await screen.findByText('€0', { timeout: 4000 })).toBeInTheDocument()
      expect(
        await screen.findByText('No pagas con dinero: compartiste con un amigo. Ese es el intercambio.', {
          timeout: 4000,
        }),
      ).toBeInTheDocument()
      expect(await screen.findByText(/Ese es tu pago/, { timeout: 4000 })).toBeInTheDocument()
      // El valor real sigue ahí, tachado: se siente lo que se está recibiendo.
      expect(screen.getByLabelText(/Valor real €35/)).toHaveTextContent('€35')
    },
    60000,
  )

  it(
    'el plan gratuito ya nace en cero y se compra por cero',
    async () => {
      render(<CheckoutPanel planId="GRATIS" />)

      expect(screen.getByText('PLAN GRATIS')).toBeInTheDocument()
      expect(screen.getAllByText('€0')).toHaveLength(2)
      expect(screen.getByRole('button', { name: /COMPRAR POR €0/i })).toBeInTheDocument()
      expect(screen.getByTestId('qr-payload')).toHaveTextContent(shareCodeForOrder(buildOrder({ planId: 'GRATIS' })))
    },
    60000,
  )

  it(
    'al comprar en cero confirma sin abrir ninguna pasarela',
    async () => {
      const spy = stubFetch()
      const onPaid = vi.fn()
      render(<CheckoutPanel planId="GRATIS" onPaid={onPaid} />)

      fireEvent.click(screen.getByRole('button', { name: /COMPRAR POR €0/i }))

      expect(await screen.findByText(/Tu plan quedó en cero\. Sigamos\./, { timeout: 4000 })).toBeInTheDocument()
      expect(await screen.findByText(/Pedido confirmado\. Vamos juntos\./, { timeout: 4000 })).toBeInTheDocument()
      expect(onPaid).toHaveBeenCalledTimes(1)
      expect(onPaid.mock.calls[0][0]).toMatchObject({ status: 'completed', amountEur: 0 })
      expect(spy).not.toHaveBeenCalled()
    },
    60000,
  )

  it(
    'muestra la oferta de suscripción: cero hoy, un euro al mes después',
    () => {
      render(<CheckoutPanel planId="FUERZA" introOffer={ZERO_FIRST_MONTH_OFFER} />)

      expect(screen.getByText(ZERO_FIRST_MONTH_OFFER.label)).toBeInTheDocument()
      expect(screen.getByText(ZERO_FIRST_MONTH_OFFER.note)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /PAGAR €70/i })).toBeInTheDocument()
    },
    60000,
  )

  it(
    'avisa cuando el código no es el que toca',
    async () => {
      render(<CheckoutPanel planId="RAIZ" />)

      fireEvent.change(screen.getByRole('textbox', { name: /CÓDIGO DE INTERCAMBIO/i }), {
        target: { value: 'QQQQQQ' },
      })
      fireEvent.click(screen.getByRole('button', { name: /^CANJEAR$/i }))

      expect(await screen.findByText(/Ese código no coincide/, { timeout: 4000 })).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: /CÓDIGO DE INTERCAMBIO/i })).toHaveAttribute('aria-invalid', 'true')
      expect(screen.getAllByText('€35')).toHaveLength(2)
    },
    60000,
  )
})
