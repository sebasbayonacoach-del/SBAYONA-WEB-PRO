/**
 * Tests del bono de llegada y de la capa de crédito/sellos.
 * Cubren: crédito colapsado por defecto, tarjeta bajo demanda, selector de
 * país → moneda (siempre vía formatMoney), compartir por WhatsApp, la API
 * imperativa award() y el gancho seguro sin proveedor.
 */

import { useEffect } from 'react'
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi, afterEach } from 'vitest'
import ArrivalBonusCard from './ArrivalBonusCard.jsx'
import HiddenSealGift from './HiddenSealGift.jsx'
import { RewardsProvider, useRewards } from '../../lib/rewards/RewardsProvider.jsx'

function renderOnHome({ route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <RewardsProvider>
        <ArrivalBonusCard />
      </RewardsProvider>
    </MemoryRouter>,
  )
}

/** Componente que ejercita la API imperativa de sellos. */
function Awardee() {
  const { award } = useRewards()
  useEffect(() => {
    award({ id: 'metodo', label: 'Descubriste el método', eur: 5 })
    // Mismo id dos veces: idempotente, la sección no paga dos veces.
    award({ id: 'metodo', label: 'Descubriste el método', eur: 5 })
    award({ id: 'planes', label: 'Viste los planes', eur: 7 })
  }, [award])
  return null
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ArrivalBonusCard · bono de llegada', () => {
  it('aparece al llegar como crédito colapsado y no bloquea la portada', async () => {
    renderOnHome()

    const widget = await screen.findByRole(
      'button',
      { name: /abrir mi crédito bayona: \$70\.000/i },
      { timeout: 4000 },
    )
    expect(widget).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /compartir por whatsapp/i })).toBeInTheDocument()
  }, 60000)

  it('el widget abre la tarjeta con RECLAMAR y honestidad de crédito', async () => {
    renderOnHome()
    fireEvent.click(await screen.findByRole('button', { name: /abrir mi crédito bayona/i }))

    const dialog = await screen.findByRole('dialog', { name: /ponme mucha atención/i })
    expect(dialog).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^reclamar$/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /cerrar el bono/i })).not.toBeInTheDocument()
    expect(screen.getByText(/acabas de ganar/i)).toBeInTheDocument()
    expect(screen.getByText(/crédito bayona: cortesía para tu plan, no dinero retirable/i)).toBeInTheDocument()
    expect(screen.getAllByText('$70.000').length).toBeGreaterThan(0)
    expect(screen.getByText(/sumando/i)).toBeInTheDocument()
  }, 60000)

  it('el selector de país cambia la moneda mostrada (COP → EUR → USD)', async () => {
    renderOnHome()
    fireEvent.click(await screen.findByRole('button', { name: /abrir mi crédito bayona/i }))
    await screen.findByRole('dialog', { name: /ponme mucha atención/i }, { timeout: 4000 })

    const select = screen.getByRole('combobox', { name: /tu país/i })
    expect(select).toHaveValue('colombia')

    fireEvent.change(select, { target: { value: 'espana' } })
    expect(screen.getByText('€16')).toBeInTheDocument()
    expect(screen.getByText(/en euros/i)).toBeInTheDocument()

    fireEvent.change(select, { target: { value: 'otro-pais' } })
    expect(screen.getByText('$18')).toBeInTheDocument()
    expect(screen.getByText(/en dólares/i)).toBeInTheDocument()

    fireEvent.change(select, { target: { value: 'colombia' } })
    expect(screen.getAllByText('$70.000').length).toBeGreaterThan(0)
    expect(screen.getByText(/en pesos colombianos/i)).toBeInTheDocument()
  }, 60000)

  it('RECLAMAR colapsa la tarjeta y el widget puede reabrirla', async () => {
    renderOnHome()
    const widgetBefore = await screen.findByRole('button', { name: /abrir mi crédito bayona/i })
    fireEvent.click(widgetBefore)
    await screen.findByRole('dialog', { name: /ponme mucha atención/i }, { timeout: 4000 })

    fireEvent.click(screen.getByRole('button', { name: /^reclamar$/i }))

    await waitFor(
      () => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      { timeout: 4000 },
    )
    const widget = screen.getByRole('button', { name: /abrir mi crédito bayona/i })
    expect(widget).toBeInTheDocument()

    fireEvent.click(widget)
    await screen.findByRole('dialog', { name: /ponme mucha atención/i }, { timeout: 4000 })
    expect(screen.getByRole('button', { name: /^reclamar$/i })).toBeInTheDocument()
  }, 60000)

  /*
    Regresión de la captura f-home-00: el pase y la billetera vivían en dos
    <AnimatePresence> hermanos dentro de la misma capa, así que durante el cruce
    (~450 ms) los dos seguían montadas y el pase se pintaba dentro de la casilla
    de la billetera. El invariante que se vigila aquí es de DOM, no de CSS: en
    ningún fotograma pueden existir las dos a la vez, y la capa que existe es la
    que corresponde al elemento montado.
  */
  it('el pase y la billetera nunca coexisten en el DOM, ni durante el pliegue', async () => {
    const soloUna = () => {
      const pase = document.querySelector('.arrival-bonus__card')
      const billetera = document.querySelector('.arrival-bonus-widget')
      expect([pase, billetera].filter(Boolean)).toHaveLength(1)
      const capa = document.querySelector('.arrival-bonus-layer')
      expect(capa).not.toBeNull()
      expect(capa.classList.contains('arrival-bonus-layer--open')).toBe(Boolean(pase))
      expect(capa.classList.contains('arrival-bonus-layer--widget')).toBe(Boolean(billetera))
    }

    renderOnHome()
    const widget = await screen.findByRole('button', { name: /abrir mi crédito bayona/i })
    soloUna()

    fireEvent.click(widget)
    soloUna()
    await screen.findByRole('dialog', { name: /ponme mucha atención/i }, { timeout: 4000 })
    soloUna()

    fireEvent.click(screen.getByRole('button', { name: /^reclamar$/i }))
    soloUna()
    await waitFor(
      () => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      { timeout: 4000 },
    )
    soloUna()
  }, 60000)

  it('la billetera avisa de lo pendiente con un testigo, sin duplicar la orden', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <RewardsProvider>
          <Awardee />
          <ArrivalBonusCard />
        </RewardsProvider>
      </MemoryRouter>,
    )

    const widget = await screen.findByRole('button', { name: /abrir mi crédito bayona/i })
    expect(within(widget).getByText('$51.600 sin reclamar')).toBeInTheDocument()
    expect(widget.querySelector('.arrival-bonus-widget__flag')).toBeInTheDocument()

    fireEvent.click(widget)
    await screen.findByRole('dialog', { name: /ponme mucha atención/i }, { timeout: 4000 })
    fireEvent.click(screen.getByRole('button', { name: /^reclamar$/i }))
    await waitFor(
      () => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      { timeout: 4000 },
    )

    // Todo reclamado: el testigo se apaga y la billetera muestra el saldo guardado.
    const cartera = await screen.findByRole('button', { name: /abrir mi crédito bayona/i })
    expect(cartera.querySelector('.arrival-bonus-widget__flag')).not.toBeInTheDocument()
    expect(within(cartera).queryByText(/sin reclamar/)).not.toBeInTheDocument()
  }, 60000)

  it('Escape no altera el crédito colapsado ni cierra la tarjeta abierta', async () => {    renderOnHome()
    const widget = await screen.findByRole('button', { name: /abrir mi crédito bayona/i })
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(widget).toBeInTheDocument()

    fireEvent.click(widget)
    await screen.findByRole('dialog', { name: /ponme mucha atención/i }, { timeout: 4000 })

    fireEvent.keyDown(document, { key: 'Escape' })
    await new Promise((resolve) => setTimeout(resolve, 600))

    expect(screen.getByRole('dialog', { name: /ponme mucha atención/i })).toBeInTheDocument()
  }, 60000)

  it('el widget muestra el crédito acumulado desde el inicio', async () => {
    renderOnHome()
    const widget = await screen.findByRole('button', { name: /abrir mi crédito bayona/i })
    expect(widget).toHaveAccessibleName('Abrir mi crédito BAYONA: $70.000')
    expect(screen.getByText('$70.000')).toBeInTheDocument()
  }, 60000)

  it('compartir por WhatsApp suma crédito y abre el enlace del sitio', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    renderOnHome()
    await screen.findByRole('button', { name: /abrir mi crédito bayona/i })

    fireEvent.click(screen.getByRole('button', { name: /compartir por whatsapp/i }))

    expect(openSpy).toHaveBeenCalledTimes(1)
    expect(String(openSpy.mock.calls[0][0])).toContain('https://wa.me/')
    // 70.000 del bono + 20.000 por compartir.
    expect(screen.getByRole('button', { name: /abrir mi crédito bayona/i })).toHaveAccessibleName(
      'Abrir mi crédito BAYONA: $90.000',
    )
    expect(screen.getByRole('button', { name: /crédito por compartir ya sumado/i })).toHaveTextContent(
      'SUMADO',
    )

    // Idempotente: volver a pulsar no suma dos veces.
    fireEvent.click(screen.getByRole('button', { name: /crédito por compartir ya sumado/i }))
    expect(screen.getByRole('button', { name: /abrir mi crédito bayona/i })).toHaveAccessibleName(
      'Abrir mi crédito BAYONA: $90.000',
    )
  }, 60000)

  it('award() suma sellos desde otras secciones, una sola vez por id', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <RewardsProvider>
          <Awardee />
          <ArrivalBonusCard />
        </RewardsProvider>
      </MemoryRouter>,
    )
    fireEvent.click(await screen.findByRole('button', { name: /abrir mi crédito bayona/i }))
    await screen.findByRole('dialog', { name: /ponme mucha atención/i }, { timeout: 4000 })
    // La tarjeta refleja los sellos ganados durante el recorrido.
    expect(screen.getByText(/llevas 2/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /^reclamar$/i }))
    await waitFor(
      () => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      { timeout: 4000 },
    )
    // Bono (70.000) + 12 € en sellos → $121.600 con el bono ya reclamado.
    const widget = screen.getByRole('button', { name: /abrir mi crédito bayona/i })
    expect(widget).toHaveAccessibleName('Abrir mi crédito BAYONA: $121.600, 2 sellos')
    expect(screen.getByText('$121.600')).toBeInTheDocument()
    expect(screen.getByText('2 sellos')).toBeInTheDocument()
  }, 60000)

  it('useRewards sin proveedor devuelve un estado seguro y no rompe', () => {
    function Bare() {
      const rewards = useRewards()
      return (
        <p>
          {rewards.format(239)} · {rewards.totalEur} · {rewards.sealCount}
        </p>
      )
    }
    render(<Bare />)
    expect(screen.getByText('€239 · 0 · 0')).toBeInTheDocument()
  }, 60000)

  it('fuera de la portada no abre tarjeta automática, pero conserva el crédito del recorrido', async () => {
    renderOnHome({ route: '/about' })

    // Espera de sobra por si la tarjeta intentara abrirse (retardo de 1,2 s).
    await new Promise((resolve) => setTimeout(resolve, 1600))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /abrir mi crédito bayona/i })).toBeInTheDocument()
  }, 60000)
})

/**
 * §6 y comentario 23: descubrir no es cobrar. Estos tres tests vigilan el
 * ciclo completo por sello (descubierto → pendiente → reclamado → usado), que
 * `claimSeal` no pueda inventar un hallazgo y que el regalo escondido solo
 * exista si alguien lo pulsa.
 */

/** Sonda del estado de UN sello concreto, sin UI de pase en medio. */
function Probe({ id }) {
  const { claimSeal, totalEur, stateOf } = useRewards()
  return (
    <p>
      <button type="button" onClick={() => claimSeal(id)}>
        reclamar {id}
      </button>
      <span>{`estado-${id}: ${stateOf(id)} · saldo ${totalEur.toFixed(2)}`}</span>
    </p>
  )
}

describe('Sellos reclamables · regla de §6 (nada se suma solo)', () => {
  it('cada sello llega como pendiente y solo suma al reclamarlo', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <RewardsProvider>
          <Awardee />
          <ArrivalBonusCard />
        </RewardsProvider>
      </MemoryRouter>,
    )

    /*
      Estado plegado: la billetera enseña lo ENCONTRADO (12 € en sellos =
      $51.600 COP) con la advertencia de que sigue sin reclamar. El saldo
      canjeable no se mueve hasta que hay un clic.
    */
    const widget = await screen.findByRole('button', { name: /abrir mi crédito bayona/i })
    expect(widget).toHaveAccessibleName('Abrir mi crédito BAYONA: $121.600, 2 sellos')
    expect(within(widget).getByText('$51.600 sin reclamar')).toBeInTheDocument()

    fireEvent.click(widget)
    await screen.findByRole('dialog', { name: /ponme mucha atención/i }, { timeout: 4000 })

    // Los dos hallazgos, uno por línea, cada uno con su botón de reclamo.
    expect(screen.getAllByText(/Pendiente de reclamar/i)).toHaveLength(2)
    fireEvent.click(screen.getByRole('button', { name: /RECLAMAR · Descubriste el método/i }))

    expect(screen.getByText('$21.500 · Reclamado')).toBeInTheDocument()
    expect(screen.getAllByText(/Pendiente de reclamar/i)).toHaveLength(1)
    expect(screen.queryByRole('button', { name: /RECLAMAR · Descubriste el método/i })).not.toBeInTheDocument()

    // El pendiente que queda sigue ofreciéndose.
    fireEvent.click(screen.getByRole('button', { name: /RECLAMAR · Viste los planes/i }))
    expect(screen.getByText('$30.100 · Reclamado')).toBeInTheDocument()
    expect(screen.queryAllByText(/Pendiente de reclamar/i)).toHaveLength(0)
  }, 60000)

  it('claimSeal no puede reclamar algo que no se descubrió', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <RewardsProvider>
          <Awardee />
          <Probe id="fantasma" />
          <Probe id="metodo" />
        </RewardsProvider>
      </MemoryRouter>,
    )

    fireEvent.click(await screen.findByRole('button', { name: /reclamar fantasma/i }))
    // Sigilo: no existe, no se cuela en la lista y el saldo no se mueve.
    expect(screen.getByText(/estado-fantasma: Descubierto · saldo 0\.00/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /reclamar metodo/i }))
    expect(screen.getByText(/estado-metodo: Reclamado · saldo 5\.00/)).toBeInTheDocument()
  }, 60000)

  it('el regalo escondido no existe hasta que alguien lo pulsa', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <RewardsProvider>
          <HiddenSealGift id="secreto-cierre" label="Pieza escondida" eur={4} />
          <Probe id="secreto-cierre" />
        </RewardsProvider>
      </MemoryRouter>,
    )

    // Sin pulsar: el pase no tiene ni sellos ni saldo.
    expect(screen.getByText(/estado-secreto-cierre: Descubierto · saldo 0\.00/)).toBeInTheDocument()

    fireEvent.click(await screen.findByRole('button', { name: /regalo escondido: recoger pieza escondida/i }))

    expect(screen.getByText(/estado-secreto-cierre: Reclamado · saldo 4\.00/)).toBeInTheDocument()
    expect(screen.getByText(/guardados en tu pase/i)).toBeInTheDocument()
    expect(screen.getByText(/GUARDADO · Pieza escondida/i)).toBeInTheDocument()
  }, 60000)
})
