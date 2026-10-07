import React from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCartStore } from '../store/cartStore.js'
import { shopCategoryFilters, shopProducts } from '../config/shopProducts.js'
import Shop from './Shop.jsx'

vi.mock('framer-motion', () => {
  const ignoredProps = new Set(['initial', 'animate', 'exit', 'variants', 'whileInView', 'viewport', 'transition', 'whileHover', 'whileTap', 'layout'])
  const component = (tag) => React.forwardRef(({ children, ...props }, ref) => {
    const domProps = Object.fromEntries(Object.entries(props).filter(([key]) => !ignoredProps.has(key)))
    return React.createElement(tag, { ...domProps, ref }, children)
  })

  const motion = new Proxy({}, {
    get: (_, tag) => tag === 'create'
      ? (BaseComponent) => React.forwardRef((props, ref) => React.createElement(BaseComponent, { ...props, ref }))
      : component(tag),
  })

  return {
    motion,
    AnimatePresence: ({ children }) => children,
    useReducedMotion: () => false,
  }
})

vi.mock('../engine/hooks/useCapabilities.js', () => ({
  useCapabilities: () => ({ reducedMotion: false, mode: 'desktop' }),
}))

vi.mock('../engine/scroll/StickyStage.jsx', () => ({
  StickyStage: ({ children }) => children({ index: 0, progress: {}, isStatic: true }),
}))

vi.mock('../components/shop/ShopHologramLayer.jsx', () => ({
  default: () => null,
}))

function renderShop() {
  return render(<MemoryRouter><Shop /></MemoryRouter>)
}

beforeEach(() => {
  useCartStore.getState().clear()
  useCartStore.getState().setOpen(false)
})

describe('/shop — tienda de producto Gym Funnel V2', () => {
  it('separa producto físico de servicios y elimina crédito gamificado', () => {
    const { container } = renderShop()

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(container.querySelector('#shop-counter')).toBeNull()
    expect(container.querySelector('.shop-credit')).toBeNull()
    expect(container.textContent).not.toMatch(/MOSTRADOR DE SERVICIOS|CRÉDITO BAYONA|RECLAMAR MI PASE/i)
  })

  it('entra por categorías fitness reconocibles y conserva filtros secundarios', () => {
    renderShop()

    const shortcuts = screen.getByRole('group', { name: /Categorías principales de tienda/i })
    expect(within(shortcuts).getAllByRole('button')).toHaveLength(shopCategoryFilters.length - 1)
    shopCategoryFilters.filter((item) => item !== 'Todo').forEach((category) => {
      expect(within(shortcuts).getByRole('button', { name: new RegExp(category, 'i') })).toBeInTheDocument()
    })

    expect(screen.getByRole('heading', { name: /ENCUENTRA LO QUE NECESITAS/i })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Por colección' })).toBeInTheDocument()
  })

  it('muestra fotografía de producto en todas las fichas que tienen media', () => {
    const { container } = renderShop()
    const cards = [...container.querySelectorAll('[data-product-id]')]

    expect(cards).toHaveLength(shopProducts.length)

    for (const product of shopProducts) {
      const card = cards.find((node) => node.dataset.productId === product.id)
      expect(card).toBeDefined()
      expect(card).toHaveTextContent(product.name)
      expect(card).toHaveTextContent(/COP/)

      if (product.media) {
        const image = card.querySelector('.shop-product-image')
        expect(image).not.toBeNull()
        expect(image).toHaveAttribute('src', product.media.src)
      }
    }
  })

  it('expone un WhatsApp propio por producto con el número oficial', () => {
    renderShop()

    const productLinks = [...document.querySelectorAll('a[data-shop-product]')]
    expect(new Set(productLinks.map((link) => link.dataset.shopProduct)).size).toBe(shopProducts.length)

    for (const link of productLinks) {
      const url = new URL(link.getAttribute('href'))
      expect(url.origin).toBe('https://wa.me')
      expect(url.pathname).toBe('/34641698332')
      expect(url.searchParams.get('text').length).toBeGreaterThan(0)
    }
  })

  it('permite filtrar y buscar productos', () => {
    renderShop()

    expect(screen.getByRole('group', { name: 'Por categoría' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Por colección' })).toBeInTheDocument()

    const search = screen.getByRole('searchbox', { name: 'Buscar producto' })
    fireEvent.change(search, { target: { value: 'zzz-sin-coincidencias' } })

    const emptyState = screen.getByRole('status')
    expect(emptyState).toHaveTextContent('NO ENCONTRAMOS ESA PIEZA.')
    fireEvent.click(within(emptyState).getByRole('button', { name: new RegExp(`VER LOS ${shopProducts.length} PRODUCTOS`, 'i') }))
    expect(screen.queryByText('NO ENCONTRAMOS ESA PIEZA.')).not.toBeInTheDocument()
  })

  it('añade productos al carrito y lo abre', () => {
    renderShop()

    const addButtons = screen.getAllByRole('button', { name: /^Añadir .+ al carrito$/i })
    expect(addButtons.length).toBeGreaterThan(0)
    fireEvent.click(addButtons[0])

    const state = useCartStore.getState()
    expect(state.items).toHaveLength(1)
    expect(state.items[0].type).toBe('producto')
    expect(state.isOpen).toBe(true)
  })

  it('cierra conectando con Servicios y Empieza gratis, no con cuenta o Programas', () => {
    renderShop()

    const bridge = document.querySelector('.shop-training-bridge')
    expect(within(bridge).getByRole('link', { name: /VER SERVICIOS/i })).toHaveAttribute('href', '/programs')
    expect(within(bridge).getByRole('link', { name: /EMPIEZA GRATIS/i })).toHaveAttribute('href', '/#empieza')
    expect(bridge.textContent).not.toMatch(/VER PROGRAMAS|GUARDAR EN MI CUENTA/i)
  })
})
