import { describe, expect, it } from 'vitest'
import { apparelSourcing, clothingDropIds, sourcingStatus } from './apparelSourcing.js'
import { shopProducts } from './shopProducts.js'

const physicalApparel = shopProducts.filter((product) =>
  ['Ropa Entreno', 'Ropa Lifestyle', 'Calzado'].includes(product.category),
)

describe('BAYONA clothing supply gate', () => {
  it('tracks every existing clothing and footwear listing', () => {
    expect(physicalApparel).toHaveLength(18)
    expect(Object.keys(apparelSourcing)).toHaveLength(18)

    for (const product of physicalApparel) {
      expect(apparelSourcing[product.id], product.id).toBeDefined()
      expect(apparelSourcing[product.id].supplier.length).toBeGreaterThan(0)
      expect(['pending', 'sample', 'blocked']).toContain(apparelSourcing[product.id].status)
    }
  })

  it('keeps the limited launch free of products requiring safety proof', () => {
    expect(clothingDropIds).toHaveLength(6)
    expect(new Set(clothingDropIds).size).toBe(clothingDropIds.length)

    for (const id of clothingDropIds) {
      const product = physicalApparel.find((item) => item.id === id)
      expect(product, id).toBeDefined()
      expect(apparelSourcing[id].status).not.toBe('blocked')
    }
  })

  it('blocks unsupported product performance and therapeutic descriptions', () => {
    const blocked = [
      'camiseta-compresion',
      'chaqueta-windstopper',
      'calcetines-compresion-pack-3',
      'zapatillas-trainer-pro',
      'zapatillas-parkour-free',
    ]
    for (const id of blocked) {
      expect(apparelSourcing[id].status, id).toBe('blocked')
    }
  })

  it('does not mark any supplier as confirmed and does not invent price or stock', () => {
    expect(Object.keys(sourcingStatus).sort()).toEqual(['blocked', 'pending', 'sample'])
    expect(Object.values(apparelSourcing).every(({ status }) => status !== 'confirmed')).toBe(true)
    expect(Object.values(apparelSourcing).every((item) => !('stock' in item) && !('cost' in item))).toBe(true)
  })
})
