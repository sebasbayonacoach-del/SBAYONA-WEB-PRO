import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Onboarding from './Onboarding.jsx'

/**
 * LA RECEPCIÓN — contrato de las seis pantallas
 * ---------------------------------------------------------------------------
 *   umbral → nombre → ritmo → preguntas → regalo → ruta
 *
 * `Onboarding` llama a `useVisitorJourney`, que devuelve un valor seguro cuando
 * no hay proveedor (ver `lib/onboarding/VisitorJourneyProvider.jsx`), así que el
 * arnés es el mismo que en el resto de `src/pages`: `MemoryRouter` y nada más.
 *
 * TIMING: `AnimatePresence mode="wait"` saca la pantalla anterior ANTES de
 * montar la siguiente y cada transición dura ~0,5 s. Un recorrido completo son
 * 13 transiciones (~13 s reales). Por eso cada test lleva su timeout explícito
 * de 60 s y cada `findBy*` espera 4 s en lugar del segundo por defecto: no son
 * holguras caprichosas, son los segundos que tarda la coreografía.
 */

const FIND = { timeout: 4000 }

/**
 * Las preguntas en el orden en que deben aparecer. El `value` de cada opción no
 * se escribe aquí a propósito: se pincha por su etiqueta visible, que es lo que
 * ve la persona. Los títulos son además el `aria-label` del radiogroup.
 *
 * 2026-09-22 — dos literales siguen un cambio de copy mandado por la dirección
 * de producto (§20 y comentarios 67-68): la pregunta de objetivo deja de ser
 * «¿Qué viniste a construir?» y pasa a «¿Qué quieres resolver primero?», y la
 * opción de quien aún no decide pasa a llamarse «Solo estoy explorando».
 * Aquí se actualizan ESAS DOS CADENAS y nada más: el número de preguntas (5 y
 * 9), el orden, los contadores, las cifras del regalo y el pinchazo por
 * etiqueta visible quedan exactamente igual.
 */
const EXPRESS_ANSWERS = Object.freeze([
  ['¿DESDE DÓNDE EMPEZAMOS?', /^España/i],
  ['¿QUÉ QUIERES RESOLVER PRIMERO?', /^Que esto dure/i],
  ['¿DÓNDE ESTÁS HOY?', /^Arranco de cero/i],
  ['¿CUÁNTOS DÍAS SON TUYOS?', /^1 o 2 días/i],
  ['¿QUÉ TE FRENA HOY?', /^El tiempo/i],
])

const EXTRA_ANSWERS = Object.freeze([
  ['¿CUÁNDO TE VA MEJOR?', /^Primera hora/i],
  ['¿CON QUÉ CUENTAS?', /^Gimnasio/i],
  ['¿CÓMO ESTÁS COMIENDO?', /^Sin orden/i],
  ['¿ENTRAS AL RETO DE 30 DÍAS?', /^Entro/i],
])

const COMPLETO_ANSWERS = Object.freeze([...EXPRESS_ANSWERS, ...EXTRA_ANSWERS])

const EXPRESS_TITLES = EXPRESS_ANSWERS.map(([title]) => title)
const COMPLETO_TITLES = COMPLETO_ANSWERS.map(([title]) => title)

function renderOnboarding() {
  return render(
    <MemoryRouter>
      <Onboarding />
    </MemoryRouter>,
  )
}

/** Cruza el umbral y entrega el nombre. Aterriza en el paso del ritmo. */
async function crossThreshold(name = 'Valeria') {
  fireEvent.click(screen.getByRole('button', { name: /EMPEZAR EL RECORRIDO/i }))

  // `selector: 'input'` no es un adorno: el acompañante habla con `aria-label`
  // ("…dime cómo te llamas y te hablo por tu nombre") y colisionaría con la
  // etiqueta visible del campo durante la transición entre pantallas.
  const input = await screen.findByLabelText(/tu nombre/i, { ...FIND, selector: 'input' })
  fireEvent.change(input, { target: { value: name } })
  fireEvent.click(screen.getByRole('button', { name: /^SEGUIR/i }))

  await screen.findByRole('heading', { level: 1, name: /¿VAMOS RÁPIDO/i }, FIND)
}

/** Responde la batería y devuelve lo que se vio: título y contador de cada paso. */
async function answerQuestions(pairs) {
  const seen = []

  for (const [title, option] of pairs) {
    const group = await screen.findByRole('radiogroup', { name: title }, FIND)
    const stage = group.closest('.rx-question')

    seen.push({
      title: group.getAttribute('aria-label'),
      counter: stage?.querySelector('.rx-question__count')?.textContent?.replace(/\s+/g, ' ').trim() ?? null,
    })

    fireEvent.click(within(group).getByRole('radio', { name: option }))
  }

  return seen
}

/** Recorrido completo desde el umbral hasta la pantalla del regalo. */
async function walkToGift({ name = 'Valeria', rhythm = /^Voy con prisa/i, answers = EXPRESS_ANSWERS } = {}) {
  await crossThreshold(name)
  fireEvent.click(screen.getByRole('button', { name: rhythm }))

  const seen = await answerQuestions(answers)
  await screen.findByRole('heading', { level: 1, name: /ESTO YA ES TUYO/i }, FIND)

  return seen
}

/** Recorrido completo desde el umbral hasta las tres puertas del cierre. */
async function walkToRoute(options = {}) {
  await walkToGift(options)
  fireEvent.click(screen.getByRole('button', { name: /VER MI RUTA/i }))
  await screen.findByRole('heading', { level: 1, name: /EMPIEZA/i }, FIND)
}

function getGiftList(container) {
  const list = container.querySelector('.rx-gift__list')
  expect(list).not.toBeNull()
  return list
}

function giftItemNames(container) {
  return within(getGiftList(container))
    .getAllByRole('listitem')
    .map((item) => item.querySelector('strong')?.textContent ?? '')
}

function giftTotal(container) {
  const total = container.querySelector('.rx-gift__total')
  expect(total).not.toBeNull()
  return total
}

describe('/onboarding — LA RECEPCIÓN, seis pantallas', () => {
  it('abre con el umbral: titular, entrada y salida para mirar, sin pedir nada todavía', () => {
    const { container } = renderOnboarding()

    expect(
      screen.getByRole('heading', { level: 1, name: 'BIENVENIDO A BAYONA.' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /EMPEZAR EL RECORRIDO/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /SOLO QUIERO MIRAR/i })).toHaveAttribute('href', '/programs')

    // La primera pantalla no pide datos: el nombre llega después, en la suya.
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(container.querySelector('input')).not.toBeInTheDocument()

    // Copia retirada a propósito: ni pase, ni código visual, ni muro legal, ni
    // WhatsApp como canal de esta pantalla.
    expect(screen.queryByText(/PASE BAYONA/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/CÓDIGO VISUAL/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/No es un diagnóstico/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Orientación, no atención sanitaria/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /SALTAR INTRO/i })).not.toBeInTheDocument()
    expect(container.innerHTML).not.toContain('wa.me')
  }, 60000)

  it('pide el nombre con su etiqueta, no avanza vacío y avanza en cuanto lo hay', async () => {
    renderOnboarding()

    fireEvent.click(screen.getByRole('button', { name: /EMPEZAR EL RECORRIDO/i }))

    const input = await screen.findByLabelText(/tu nombre/i, { ...FIND, selector: 'input' })
    expect(input).toHaveAttribute('type', 'text')
    expect(screen.getByRole('heading', { level: 1, name: /¿CÓMO TE LLAMAS\?/i })).toBeInTheDocument()

    // Enviar en blanco devuelve un error legible y NO avanza.
    fireEvent.click(screen.getByRole('button', { name: /^SEGUIR/i }))
    expect(await screen.findByText(/Escribe tu nombre y seguimos\./i, FIND)).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: /¿CÓMO TE LLAMAS\?/i })).toBeInTheDocument()

    fireEvent.change(input, { target: { value: 'Valeria' } })
    fireEvent.click(screen.getByRole('button', { name: /^SEGUIR/i }))

    expect(
      await screen.findByRole('heading', { level: 1, name: /¿VAMOS RÁPIDO/i }, FIND),
    ).toBeInTheDocument()
  }, 60000)

  it('deja elegir el ritmo: cinco preguntas si va con prisa, nueve si tiene tiempo', async () => {
    renderOnboarding()

    const express = await walkToGift()
    expect(express.map((question) => question.title)).toEqual(EXPRESS_TITLES)
    expect(express).toHaveLength(5)
    expect(express[express.length - 1].counter).toBe('05 / 05')
    // Ya no queda ninguna pregunta por delante: el regalo es la pantalla actual.
    expect(screen.queryAllByRole('radiogroup')).toHaveLength(0)

    cleanup()
    renderOnboarding()

    const completo = await walkToGift({ rhythm: /^Tengo tiempo/i, answers: COMPLETO_ANSWERS })
    expect(completo.map((question) => question.title)).toEqual(COMPLETO_TITLES)
    expect(completo).toHaveLength(9)
    expect(completo[completo.length - 1].counter).toBe('09 / 09')
    expect(screen.queryAllByRole('radiogroup')).toHaveLength(0)
  }, 60000)

  it('el regalo esencial trae cuatro piezas, valor €134 y cero a pagar', async () => {
    const { container } = renderOnboarding()

    await walkToGift({ answers: EXPRESS_ANSWERS })

    const list = getGiftList(container)
    expect(giftItemNames(container)).toEqual([
      'PLAN DE ENTRENAMIENTO 30 DÍAS',
      'PLAN DE NUTRICIÓN',
      'GUÍA DE ESTIRAMIENTOS',
      'GRUPO SEMANAL BAYONA',
    ])
    expect(within(list).getAllByRole('listitem')).toHaveLength(4)

    // Las dos piezas del paquete completo NO están en el esencial.
    expect(within(list).queryByText(/CLASE DE PARKOUR/)).not.toBeInTheDocument()
    expect(within(list).queryByText(/RETO 30 DÍAS/)).not.toBeInTheDocument()

    // Valor real del paquete, en la moneda del país elegido (España → euros).
    expect(screen.getByText('€134')).toBeInTheDocument()
    expect(within(giftTotal(container)).getByText('TOTAL A PAGAR')).toBeInTheDocument()
    expect(within(giftTotal(container)).getByText('€0')).toBeInTheDocument()
  }, 60000)

  it('el regalo completo en Colombia trae seis piezas y habla en pesos', async () => {
    const { container } = renderOnboarding()

    await walkToGift({
      rhythm: /^Tengo tiempo/i,
      answers: [[EXPRESS_ANSWERS[0][0], /^Colombia/i], ...COMPLETO_ANSWERS.slice(1)],
    })

    const list = getGiftList(container)
    expect(within(list).getAllByRole('listitem')).toHaveLength(6)
    expect(giftItemNames(container)).toEqual([
      'PLAN DE ENTRENAMIENTO 30 DÍAS',
      'PLAN DE NUTRICIÓN',
      'GUÍA DE ESTIRAMIENTOS',
      'GRUPO SEMANAL BAYONA',
      'CLASE DE PARKOUR',
      'RETO 30 DÍAS',
    ])

    // 239 € × 4300 COP/EUR, agrupado con punto: la misma cifra que usa el resto
    // del sitio, no una invención de esta pantalla.
    expect(screen.getByText('$1.027.700')).toBeInTheDocument()
    expect(within(giftTotal(container)).getByText('TOTAL A PAGAR')).toBeInTheDocument()
    expect(within(giftTotal(container)).getByText('$0')).toBeInTheDocument()

    // Fuera de Europa la clase es en vídeo: no se promete presencialidad lejana.
    const parkour = within(list).getByText('CLASE DE PARKOUR').closest('li')
    expect(parkour).toHaveTextContent(/En vídeo, paso a paso, desde donde estés/)
  }, 60000)

  it('la clase de parkour solo existe en el recorrido largo y es presencial en España', async () => {
    const express = renderOnboarding()
    await walkToGift({ answers: EXPRESS_ANSWERS })

    // Express + España: la línea del parkour no aparece en el regalo.
    expect(within(getGiftList(express.container)).queryByText(/CLASE DE PARKOUR/)).not.toBeInTheDocument()

    cleanup()
    const completo = renderOnboarding()
    await walkToGift({ rhythm: /^Tengo tiempo/i, answers: COMPLETO_ANSWERS })

    const list = getGiftList(completo.container)
    const parkour = within(list).getByText('CLASE DE PARKOUR').closest('li')
    expect(parkour).not.toBeNull()
    expect(parkour).toHaveTextContent(/Presencial en España · una clase con Sebastián/)
  }, 60000)

  it('cierra con tres puertas en horizontal, el nombre en el titular y salida para borrar', async () => {
    const { container } = renderOnboarding()

    await walkToRoute({ name: 'Valeria' })

    // El titular devuelve el nombre capturado, en mayúsculas.
    expect(
      screen.getByRole('heading', { level: 1, name: /VALERIA, EMPIEZA/i }),
    ).toBeInTheDocument()

    // Tres tarjetas de oferta, lado a lado, cada una con su nombre accesible.
    const offersGrid = container.querySelector('.rx-offers')
    expect(offersGrid).not.toBeNull()
    const offers = within(offersGrid).getAllByRole('region')
    expect(offers).toHaveLength(3)
    expect(offers.map((offer) => offer.getAttribute('aria-label'))).toEqual([
      'Tu ruta BAYONA',
      'Gratis desde hoy',
      'Gratis siempre',
    ])

    // Las tres puertas resuelven contenido real de routeMap.js, no placeholders.
    expect(screen.getByRole('region', { name: 'Tu ruta BAYONA' })).toHaveTextContent('RAÍZ')
    expect(screen.getByRole('region', { name: 'Gratis desde hoy' })).toHaveTextContent('PROTOCOLO 7 DÍAS')
    expect(screen.getByRole('region', { name: 'Gratis siempre' })).toHaveTextContent('COMUNIDAD BAYONA')

    expect(screen.getByRole('button', { name: /BORRAR MI RECORRIDO/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /COMPARAR TODOS LOS PLANES/i })).toHaveAttribute(
      'href',
      '/programs',
    )
  }, 60000)

  it('la matriz de rutas manda: mirar + ya entreno + 3 días recomienda ELITE', async () => {
    renderOnboarding()

    await walkToRoute({
      answers: [
        EXPRESS_ANSWERS[0],
        ['¿QUÉ QUIERES RESOLVER PRIMERO?', /^Solo estoy explorando/i],
        ['¿DÓNDE ESTÁS HOY?', /^Ya entreno/i],
        ['¿CUÁNTOS DÍAS SON TUYOS?', /^3 días/i],
        EXPRESS_ANSWERS[4],
      ],
    })

    const lead = screen.getByRole('region', { name: 'Tu ruta BAYONA' })
    expect(within(lead).getByRole('heading', { name: 'ELITE' })).toBeInTheDocument()
    expect(within(lead).getByRole('link', { name: /EMPEZAR CON ELITE/i })).toHaveAttribute(
      'href',
      '/plan/elite',
    )
  }, 60000)

  it('BORRAR MI RECORRIDO devuelve al umbral y deja de contar el progreso', async () => {
    renderOnboarding()

    await walkToRoute({ name: 'Valeria' })
    expect(screen.getByRole('progressbar', { name: /Tu recorrido/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /BORRAR MI RECORRIDO/i }))

    expect(
      await screen.findByRole('heading', { level: 1, name: 'BIENVENIDO A BAYONA.' }, FIND),
    ).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Tu ruta BAYONA' })).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  }, 60000)
})
