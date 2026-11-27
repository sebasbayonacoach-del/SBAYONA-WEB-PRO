import { describe, expect, it } from 'vitest'
import { apparelSourcing, clothingDropIds } from './apparelSourcing.js'
import { blockedApparelIds, pendingApparelCount, storefrontProducts } from './apparelCatalog.js'
import { shopProducts } from './shopProducts.js'

describe('BAYONA public shop safety policy', () => {
  it('excludes all unverified technical and trademark claims from the storefront', () => {
    const blocked = Object.entries(apparelSourcing)
      .filter(([, candidate]) => candidate.status === 'blocked')
      .map(([id]) => id).sort()

    expect(blocked).toHaveLength(5)
    expect([...blockedApparelIds].sort()).toEqual(blocked)
    expect(storefrontProducts).toHaveLength(shopProducts.length - blocked.length)
    expect(storefrontProducts.every((product) => !blocked.includes(product.id))).toBe(true)
  })

  it('allows inquiries for the six proposed launch pieces without marking them available', () => {
    expect(pendingApparelCount).toBe(18)
    for (const id of clothingDropIds) {
      expect(storefrontProducts.find((product) => product.id === id), id).toBeDefined()
      expect(['pending', 'sample']).toContain(apparelSourcing[id].status)
    }
    expect(Object.values(apparelSourcing).every((p) => p.status !== 'available')).toBe(true)
  })

  it('preserves non-apparel catalog listings', () => {
    const unaffected = shopProducts.filter((product) => !apparelSourcing[product.id])
    for (const product of unaffected) {
      expect(storefrontProducts.find((item) => item.id === product.id), product.id).toBeDefined()
    }
  })
})
