import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it, vi } from 'vitest'
import { handleSpotlightPointerMove } from '../components/home/spotlightPointer.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => readFileSync(join(ROOT, path), 'utf8')

describe('21st.dev interaction adaptation / BAYONA', () => {
  it('integrates just two spotlight grids with four services and three gifts', () => {
    const home = read('pages/Home.jsx')
    expect(home.match(/onPointerMove=\{handleSpotlightPointerMove\}/g)).toHaveLength(2)
    expect(home).toContain('data-bayona-spotlight')
    expect(home).toContain('gift_claim_click')
    expect(home).toContain('service_card_click')
    const chrome = read('components/PremiumRouteChrome.jsx')
    expect(chrome).toMatch(/key: 'home',[\s\S]*?spotlightSelectors: \[\]/)
  })

  it('updates CSS variables instead of React state', () => {
    const grid = document.createElement('div')
    const card = document.createElement('a')
    const child = document.createElement('span')
    card.setAttribute('data-bayona-spotlight', '')
    grid.append(card)
    card.append(child)
    const rect = vi.spyOn(card, 'getBoundingClientRect').mockReturnValue({
      left: 100, top: 200, width: 500, height: 400,
      x: 100, y: 200, right: 600, bottom: 600, toJSON: () => ({}),
    })
    handleSpotlightPointerMove({
      currentTarget: grid, target: child, pointerType: 'mouse', clientX: 245, clientY: 328,
    })
    expect(card.style.getPropertyValue('--bayona-spot-x')).toBe('145px')
    expect(card.style.getPropertyValue('--bayona-spot-y')).toBe('128px')
    rect.mockRestore()
  })

  it('ignores touch and targets that are not within the grid', () => {
    const grid = document.createElement('div')
    const card = document.createElement('a')
    card.setAttribute('data-bayona-spotlight', '')
    grid.append(card)
    handleSpotlightPointerMove({
      currentTarget: grid, target: card, pointerType: 'touch', clientX: 12, clientY: 14,
    })
    expect(card.style.getPropertyValue('--bayona-spot-x')).toBe('')
    handleSpotlightPointerMove({
      currentTarget: document.createElement('div'), target: card,
      pointerType: 'mouse', clientX: 12, clientY: 14,
    })
    expect(card.style.getPropertyValue('--bayona-spot-x')).toBe('')
  })

  it('retires the old global 21st layer and hands visual ownership to V4 per route', () => {
    const main = read('main.jsx')
    const imports = [...main.matchAll(/import '\.\/styles\/([^']+\.css)'/g)].map(match => match[1])
    expect(imports).not.toContain('21st-community-interactions.css')
    expect(imports.slice(-3)).toEqual(['ds-experience.css', 'ds-atelier.css', 'home-atelier.css'])
    expect(read('pages/Home.jsx')).toContain("import '../styles/bayona-final-visual-v4.css'")
    const finalCss = read('styles/bayona-final-visual-v4.css')
    expect(finalCss).toContain('FINAL VISUAL OWNER V4')
    expect(finalCss).toContain('prefers-reduced-motion: reduce')
  })
})
