import { beforeEach, describe, expect, it } from 'vitest'
import { useCartStore } from './cartStore.js'

function resetCart() {
  useCartStore.setState({
    items: [],
    isOpen: false,
    lastAddedKey: null,
  })
}

describe('cartStore — apertura visible del carrito', () => {
  beforeEach(resetCart)

  it('abre el carrito y marca el artículo añadido más reciente', () => {
    expect(useCartStore.getState().isOpen).toBe(false)

    useCartStore.getState().addItem({
      type: 'producto',
      name: 'Hoodie Origins',
      priceCOP: 189000,
      qty: 1,
      icon: 'shirt',
    })

    expect(useCartStore.getState()).toMatchObject({
      isOpen: true,
      lastAddedKey: 'producto:Hoodie Origins',
    })
    expect(useCartStore.getState().items).toHaveLength(1)
  })

  it('permite cerrar el drawer sin vaciar la selección', () => {
    useCartStore.getState().addItem({
      type: 'producto',
      name: 'Hoodie Origins',
      priceCOP: 189000,
      qty: 1,
      icon: 'shirt',
    })

    useCartStore.getState().setOpen(false)

    expect(useCartStore.getState().isOpen).toBe(false)
    expect(useCartStore.getState().items).toHaveLength(1)
  })
})
