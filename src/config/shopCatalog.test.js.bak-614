import { describe, expect, it } from 'vitest'
import { catalogCategories, catalogItems, filterCatalog } from './shopCatalog.js'

describe('configuración compartida del catálogo consultable', () => {
  it('mantiene referencias sin precios, stock ni especificaciones inventadas', () => {
    expect(catalogItems).toHaveLength(6)
    expect(catalogCategories).toEqual(['Todo', 'Ropa', 'Calzado', 'Equipamiento'])

    for (const item of catalogItems) {
      expect(item).not.toHaveProperty('price')
      expect(item).not.toHaveProperty('stock')
      expect(item).not.toHaveProperty('materials')
      expect(item).not.toHaveProperty('deliveryTime')
      expect(item.summary).toMatch(/selección consultable BAYONA/i)
      expect(JSON.stringify(item)).not.toMatch(/algodón|premium|garantía|certificad|reseñas|ventas/i)
    }
  })

  it('genera un WhatsApp contextual por artículo que solicita las tres confirmaciones comerciales', () => {
    for (const item of catalogItems) {
      const url = new URL(item.whatsappUrl)
      const message = url.searchParams.get('text')

      expect(url.origin).toBe('https://wa.me')
      expect(url.pathname).toBe('/34614988006')
      expect(message).toContain(item.name)
      expect(message).toContain(item.code)
      expect(message).toMatch(/precio/i)
      expect(message).toMatch(/disponibilidad/i)
      expect(message).toMatch(/condiciones vigentes/i)
    }
  })

  it('filtra por categoría y búsqueda normalizada sin mutar la fuente', () => {
    const original = [...catalogItems]

    expect(filterCatalog(catalogItems, { category: 'Ropa' }).map((item) => item.id)).toEqual([
      'hoodie-bayona',
      'camiseta-origins',
    ])
    expect(filterCatalog(catalogItems, { query: 'zapatillas' }).map((item) => item.id)).toEqual(['zapatillas-move'])
    expect(filterCatalog(catalogItems, { query: 'OBJ-06' }).map((item) => item.id)).toEqual(['mochila-bayona'])
    expect(filterCatalog(catalogItems, { category: 'Calzado', query: 'hoodie' })).toEqual([])
    expect(catalogItems).toEqual(original)
  })
})
