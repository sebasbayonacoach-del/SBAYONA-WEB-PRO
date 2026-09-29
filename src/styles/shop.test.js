import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(resolve(process.cwd(), 'src/styles/shop.css'), 'utf8')

describe('/shop — contrato visual responsive y accesible', () => {
  it('es mobile-first y amplía el catálogo en masonry progresivo (1→2→3→4 columnas)', () => {
    // El catálogo es un masonry CSS: 1 columna en móvil, 2 en tablet y
    // hasta 4 en escritorio ancho, con tarjetas que no se cortan.
    expect(css).toMatch(/\.shop-products-masonry\s*{[^}]*columns:\s*1;/s)
    expect(css).toMatch(/\.shop-product-entry\s*{[^}]*break-inside:\s*avoid/s)
    expect(css).toMatch(/@media\s*\(min-width:\s*700px\)[\s\S]*?\.shop-products-masonry\s*{[^}]*columns:\s*2/)
    expect(css).toMatch(/@media\s*\(min-width:\s*1080px\)[\s\S]*?\.shop-products-masonry\s*{[^}]*columns:\s*3/)
    expect(css).toMatch(/@media\s*\(min-width:\s*1500px\)[\s\S]*?\.shop-products-masonry\s*{[^}]*columns:\s*4/)
  })

  it('incluye foco visible, controles táctiles y reducción de movimiento', () => {
    expect(css).toMatch(/min-height:\s*48px/)
    expect(css).toMatch(/:focus-visible/)
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/)
    expect(css).toContain('#050505')
    expect(css).toContain('#f4a261')
    expect(css).not.toMatch(/border-radius:\s*(?!0(?:[;\s]|$))\d/)
  })
})
