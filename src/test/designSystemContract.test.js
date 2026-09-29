// Contrato del Design System 2.0 (Fase 3).
//
// Invariantes que protegen el sistema frente a futuras derivas:
//   1. Los tokens existen y cubren todas las familias pedidas.
//   2. ds-base.css solo toca selectores prefijados `.ds-` (cero fugas a las
//      17 rutas públicas).
//   3. No existen capas `v4-*` (regla absoluta de la Fase 3).
//   4. El espejo CSS de movimiento coincide con motionTokens.js (fuente única).
//   5. La escalera z-index es estrictamente creciente.
//   6. El radio de marca sigue siendo canto afilado (R9.5).
//   7. El playground es ruta interna: noindex y fuera del sitemap.

import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { motionTokens } from '../engine/config/motionTokens.js'
import { indexableRoutes, resolveRouteMeta } from '../lib/seo/routeMeta.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const STYLES_DIR = join(ROOT, 'styles')

const tokensCss = readFileSync(join(STYLES_DIR, 'ds-tokens.css'), 'utf8')
const baseCss = readFileSync(join(STYLES_DIR, 'ds-base.css'), 'utf8')

/** Quita comentarios de bloque de una hoja CSS. */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

describe('Design System 2.0 — tokens', () => {
  it('cubre todas las familias de tokens', () => {
    const families = [
      '--ds-color-',
      '--ds-surface-',
      '--ds-border-',
      '--ds-shadow-',
      '--ds-radius-',
      '--ds-fs-',
      '--ds-lh-',
      '--ds-ls-',
      '--ds-font-',
      '--ds-fw-',
      '--ds-space-',
      '--ds-grid-',
      '--ds-z-',
      '--ds-dur-',
      '--ds-ease-',
      '--ds-dist-',
    ]

    for (const family of families) {
      expect(tokensCss, `familia ${family}`).toContain(family)
    }
  })

  it('el radio de marca sigue siendo canto afilado (R9.5)', () => {
    expect(tokensCss).toMatch(/--ds-radius-sharp:\s*0px/)
  })

  it('la escalera z-index es estrictamente creciente', () => {
    const entries = [...tokensCss.matchAll(/--ds-z-[a-z]+:\s*(-?\d+)/g)].map(([, value]) =>
      Number(value),
    )

    expect(entries.length).toBeGreaterThanOrEqual(8)
    for (let i = 1; i < entries.length; i += 1) {
      expect(entries[i], `peldaño ${i}`).toBeGreaterThan(entries[i - 1])
    }
  })

  it('el espejo CSS de movimiento coincide con motionTokens.js', () => {
    const durations = {
      '--ds-dur-micro': motionTokens.duration[motionTokens.tier.micro],
      '--ds-dur-standard': motionTokens.duration[motionTokens.tier.standard],
      '--ds-dur-emphasis': motionTokens.duration[motionTokens.tier.emphasis],
      '--ds-dur-cinematic': motionTokens.duration[motionTokens.tier.cinematic],
    }

    for (const [token, seconds] of Object.entries(durations)) {
      const match = tokensCss.match(new RegExp(`${token}:\\s*(\\d+)ms`))
      expect(match, token).not.toBeNull()
      expect(Number(match[1])).toBe(Math.round(seconds * 1000))
    }

    const eases = {
      '--ds-ease-standard': motionTokens.ease.standard,
      '--ds-ease-entrance': motionTokens.ease.entrance,
      '--ds-ease-curtain': motionTokens.ease.curtain,
      // Fase 5: curvas narrativas.
      '--ds-ease-exit': motionTokens.ease.exit,
      '--ds-ease-travel': motionTokens.ease.travel,
      '--ds-ease-transform': motionTokens.ease.transform,
    }

    for (const [token, curve] of Object.entries(eases)) {
      const expected = `cubic-bezier(${curve.join(', ')})`
      expect(tokensCss, token).toContain(expected)
    }

    // Fase 5: espejo de la escala de distancias.
    const distances = {
      '--ds-dist-near': motionTokens.distance.near,
      '--ds-dist-medium': motionTokens.distance.medium,
      '--ds-dist-far': motionTokens.distance.far,
    }

    for (const [token, px] of Object.entries(distances)) {
      const match = tokensCss.match(new RegExp(`${token}:\\s*(\\d+)px`))
      expect(match, token).not.toBeNull()
      expect(Number(match[1])).toBe(px)
    }
  })
})

describe('Design System 2.0 — aislamiento de la capa base', () => {
  it('ds-base.css solo declara selectores prefijados .ds-', () => {
    const clean = stripComments(baseCss)
    // Se aplanan las aperturas de @media/@supports para que los selectores
    // anidados también queden expuestos al chequeo.
    const flattened = clean.replace(/@[^{]+\{/g, '')
    const selectorBlocks = flattened.split('}').map((chunk) => chunk.split('{')[0].trim())

    const selectors = selectorBlocks
      .flatMap((block) => block.split(','))
      .map((selector) => selector.trim())
      .filter((selector) => selector.length > 0)

    expect(selectors.length).toBeGreaterThan(20)
    for (const selector of selectors) {
      // Cada selector simple de la lista debe empezar por .ds-.
      expect(selector, selector).toMatch(/^\.ds-/)
    }
  })

  it('no existe ninguna capa v4-* (regla absoluta de la Fase 3)', () => {
    const files = readdirSync(STYLES_DIR)
    expect(files.filter((file) => file.startsWith('v4-'))).toEqual([])
  })
})

describe('Design System 2.0 — playground interno', () => {
  it('/design-system es noindex y queda fuera del sitemap', () => {
    const meta = resolveRouteMeta('/design-system')

    expect(meta.noindex).toBe(true)
    expect(meta.isNotFound).toBe(false)
    expect(indexableRoutes()).not.toContain('/design-system')
  })

  it('el sitemap conserva las 14 rutas indexables', () => {
    expect(indexableRoutes()).toHaveLength(14)
  })
})
