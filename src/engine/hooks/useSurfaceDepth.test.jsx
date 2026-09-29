// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { bindSurfaceDepth, surfaceRotation, useSurfaceDepth } from './useSurfaceDepth.js'
import { useCapabilities } from './useCapabilities.js'

vi.mock('./useCapabilities.js', () => ({ useCapabilities: vi.fn() }))
const rect = { left: 0, top: 0, width: 200, height: 100 }
let dispose
let frameCallback
let card

function pointer(el, type = 'mouse', x = 200, y = 0) {
  const event = new MouseEvent('pointermove', { bubbles: true, clientX: x, clientY: y })
  Object.defineProperty(event, 'pointerType', { value: type })
  el.dispatchEvent(event)
}

beforeEach(() => {
  document.body.className = ''
  document.body.innerHTML = '<main class="ds-frame"><div class="resource-card"><button>Read</button></div></main>'
  card = document.querySelector('.resource-card')
  card.getBoundingClientRect = vi.fn(() => rect)
  frameCallback = null
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    frameCallback = callback
    return 1
  })
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => { frameCallback = null })
})

afterEach(() => {
  dispose?.()
  dispose = undefined
  document.body.innerHTML = ''
  document.body.className = ''
  vi.restoreAllMocks()
})

describe('surface rotation', () => {
  it('rests at the centre and rejects invalid dimensions', () => {
    expect(surfaceRotation(100, 50, rect)).toBe('1 0 0 0deg')
    expect(surfaceRotation(NaN, 0, rect)).toBe('1 0 0 0deg')
    expect(surfaceRotation(0, 0, { ...rect, width: 0 })).toBe('1 0 0 0deg')
  })

  it('caps the angle at 2.4 degrees, even far beyond an edge', () => {
    for (const x of [-1000, 0, 100, 200, 1000]) {
      for (const y of [-1000, 0, 50, 100, 1000]) {
        const result = surfaceRotation(x, y, rect)
        expect(result).not.toMatch(/NaN|Infinity/)
        expect(parseFloat(result.split(' ').at(-1))).toBeLessThanOrEqual(2.4)
      }
    }
  })
})

describe('delegated surface motion', () => {
  it('coalesces events, reads geometry once and keeps reveal transforms intact', () => {
    dispose = bindSurfaceDepth()
    card.style.transform = 'translateY(16px)'
    pointer(card)
    pointer(card, 'mouse', 180, 10)
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1)
    expect(card.getBoundingClientRect).toHaveBeenCalledTimes(1)
    frameCallback()
    expect(card.style.getPropertyValue('--surface-depth-rotation')).toContain('deg')
    expect(card.style.transform).toBe('translateY(16px)')
  })

  it('does not activate for touch, keyboard focus or the design playground', () => {
    dispose = bindSurfaceDepth()
    pointer(card, 'touch')
    expect(window.requestAnimationFrame).not.toHaveBeenCalled()
    card.querySelector('button').focus()
    pointer(card)
    expect(window.requestAnimationFrame).not.toHaveBeenCalled()
    card.querySelector('button').blur()
    document.body.className = 'system-route'
    pointer(card)
    expect(window.requestAnimationFrame).not.toHaveBeenCalled()
  })

  it('supports product-scope panel surfaces added after mount', () => {
    dispose = bindSurfaceDepth()
    document.querySelector('main').setAttribute('data-experience-scope', 'system')
    document.querySelector('main').innerHTML = '<div class="os-vault__grid"><article>Saved route</article></div>'
    const panelCard = document.querySelector('article')
    panelCard.getBoundingClientRect = () => rect
    pointer(panelCard)
    frameCallback()
    expect(panelCard.hasAttribute('data-depth-surface')).toBe(true)
  })

  it('resets on scroll and cleans up pending frames and listeners', () => {
    dispose = bindSurfaceDepth()
    pointer(card)
    frameCallback()
    window.dispatchEvent(new Event('scroll'))
    expect(card.style.getPropertyValue('--surface-depth-rotation')).toBe('')
    pointer(card)
    dispose()
    expect(card.hasAttribute('data-depth-surface')).toBe(false)
    expect(frameCallback).toBeNull()
    const count = window.requestAnimationFrame.mock.calls.length
    pointer(card)
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(count)
    dispose = undefined
  })

  it('removes active depth immediately when reduced motion changes', () => {
    useCapabilities.mockReturnValue({ mode: 'desktop', reducedMotion: false })
    const { rerender, unmount } = renderHook(() => useSurfaceDepth())
    pointer(card)
    frameCallback()
    useCapabilities.mockReturnValue({ mode: 'desktop', reducedMotion: true })
    rerender()
    expect(card.hasAttribute('data-depth-surface')).toBe(false)
    expect(card.style.getPropertyValue('--surface-depth-rotation')).toBe('')
    unmount()
  })
})
