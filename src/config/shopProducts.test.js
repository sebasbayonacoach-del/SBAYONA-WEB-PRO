import { describe, expect, it } from 'vitest'
import {
  filterShopProducts,
  shopCategoryFilters,
  shopProducts,
} from './shopProducts.js'

const TRAINING_PROGRAM_NAMES = /parkour mastery|elite fitness|mindful warrior|pack transformación total/i

describe('shopProducts — catálogo exclusivo de productos', () => {
  it('excluye programas, planes y membresías de la tienda', () => {
    expect(shopProducts).toHaveLength(39)
    expect(shopProducts.map(({ name }) => name).join(' | ')).not.toMatch(TRAINING_PROGRAM_NAMES)
    expect(shopProducts.every(({ category }) => category !== 'Digitales')).toBe(true)
  })

  it('no deja filtros de categorías vacías tras retirar los programas', () => {
    expect(shopCategoryFilters).not.toContain('Digitales')
    expect(filterShopProducts(shopProducts, { category: 'Digitales' })).toEqual([])
  })
})
