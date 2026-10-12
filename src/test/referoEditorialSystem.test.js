import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const main = readFileSync(join(ROOT, 'main.jsx'), 'utf8')
const css = readFileSync(join(ROOT, 'styles/refero-editorial-system.css'), 'utf8')

describe('Refero Styles → BAYONA brand adaptation', () => {
  it('is loaded before the three original experience owner stylesheets', () => {
    const imports = [...main.matchAll(/import '\.\/styles\/([^']+\.css)'/g)].map((match) => match[1])
    const pos = imports.indexOf('refero-editorial-system.css')
    expect(pos).toBeGreaterThan(-1)
    expect(imports.slice(-3)).toEqual([
      'ds-experience.css',
      'ds-atelier.css',
      'home-atelier.css',
    ])
    expect(pos).toBeLessThan(imports.length - 3)
  })

  it('does not add a webfont, script, forced cascade or new WebGL layer', () => {
    expect(css).not.toMatch(/@import\b|!important|@font-face|backdrop-filter|canvas\b/)
    expect(css).toContain("data-experience-scope='brand'")
    expect(css).toContain('prefers-reduced-motion: reduce')
  })

  it('keeps important physical accessibility constraints', () => {
    expect(css).toContain('min-height: 44px')
    expect(css).toContain(':focus-visible')
    expect(css).toContain('@media (max-width: 767px)')
    expect(css).toContain('--refero-reading-max: 64ch')
  })
})
