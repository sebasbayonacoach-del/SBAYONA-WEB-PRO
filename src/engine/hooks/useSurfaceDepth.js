import { useEffect } from 'react'
import { useCapabilities } from './useCapabilities.js'
import { pointerEffectsEnabled } from '../providers/capabilities.js'

// One delegated listener for lazy-loaded routes. Forms, prices, primary actions
// and the shop's existing Tilt controller are deliberately not new targets.
export const DEPTH_SURFACES = [
  '.plan-showroom-visual',
  '.plan-presentation-bridge-card',
  '.value-card',
  '.resource-card',
  '.faq-contact-card',
  '.academy-age',
  '.academy-level',
  '.community-social-thumb',
  '.community-scene-photo',
  '.entrar-vault > article',
  '.os-vault__grid > article',
].join(', ')

const ROTATION = '--surface-depth-rotation'
const MAX_ANGLE = 2.4

/** Axis-angle rotation: bounded even outside the card; never produces NaN. */
export function surfaceRotation(x, y, rect) {
  if (!rect || ![x, y, rect.left, rect.top, rect.width, rect.height].every(Number.isFinite)
      || rect.width <= 0 || rect.height <= 0) return '1 0 0 0deg'
  const clamp = (v) => Math.max(-1, Math.min(1, v))
  const nx = clamp(((x - rect.left) / rect.width - 0.5) * 2)
  const ny = clamp(((y - rect.top) / rect.height - 0.5) * 2)
  const length = Math.hypot(nx, ny)
  if (length === 0) return '1 0 0 0deg'
  return `${(-ny / length).toFixed(4)} ${(nx / length).toFixed(4)} 0 ${(Math.min(length, 1) * MAX_ANGLE).toFixed(3)}deg`
}

/** No render loop: at most one layout read on entry and one write per frame. */
export function bindSurfaceDepth(doc = document, win = window) {
  let active = null
  let bounds = null
  let frame = null
  let point = null
  const touched = new Set()

  const reset = () => {
    if (frame !== null) win.cancelAnimationFrame(frame)
    frame = null
    if (active) active.style.removeProperty(ROTATION)
    active = null
    bounds = null
    point = null
  }

  const move = (event) => {
    if (event.pointerType !== 'mouse' || doc.hidden) return reset()
    const target = event.target?.closest?.(DEPTH_SURFACES)
    if (!target || !target.closest('.ds-frame')
        || target.closest('body.system-route, .shop-product-tilt')
        || target.contains(doc.activeElement)) return reset()

    if (target !== active) {
      reset()
      active = target
      bounds = target.getBoundingClientRect()
      target.setAttribute('data-depth-surface', '')
      // SPA navigation must not retain detached card trees for the session.
      for (const previous of touched) {
        if (!previous.isConnected) touched.delete(previous)
      }
      touched.add(target)
    }
    point = { x: event.clientX, y: event.clientY }
    if (frame !== null) return
    frame = win.requestAnimationFrame(() => {
      frame = null
      if (!active?.isConnected || !point) return reset()
      active.style.setProperty(ROTATION, surfaceRotation(point.x, point.y, bounds))
    })
  }

  const leave = (event) => {
    if (active && !active.contains(event.relatedTarget)) reset()
  }
  const visibility = () => { if (doc.hidden) reset() }

  doc.addEventListener('pointermove', move, { passive: true })
  doc.addEventListener('pointerout', leave, { passive: true })
  doc.addEventListener('pointercancel', reset)
  doc.addEventListener('focusin', reset)
  doc.addEventListener('visibilitychange', visibility)
  win.addEventListener('scroll', reset, { passive: true, capture: true })
  win.addEventListener('resize', reset, { passive: true })
  win.addEventListener('blur', reset)

  return () => {
    reset()
    doc.removeEventListener('pointermove', move)
    doc.removeEventListener('pointerout', leave)
    doc.removeEventListener('pointercancel', reset)
    doc.removeEventListener('focusin', reset)
    doc.removeEventListener('visibilitychange', visibility)
    win.removeEventListener('scroll', reset, true)
    win.removeEventListener('resize', reset)
    win.removeEventListener('blur', reset)
    for (const el of touched) {
      el.style.removeProperty(ROTATION)
      el.removeAttribute('data-depth-surface')
    }
    touched.clear()
  }
}

export function useSurfaceDepth() {
  const enabled = pointerEffectsEnabled(useCapabilities())
  useEffect(() => {
    if (!enabled) return undefined
    return bindSurfaceDepth()
  }, [enabled])
}
