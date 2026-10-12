/**
 * 21st.dev-inspired spotlight interaction for BAYONA.
 * One delegated pointer listener per grid. No React state, rerenders or RAF.
 * Decorative; CSS owns the visual, and reduced motion disables it completely.
 */
export function handleSpotlightPointerMove(event) {
  if (event.pointerType === 'touch') return
  if (typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

  const node = event.target
  if (!(node instanceof Element)) return
  const card = node.closest('[data-bayona-spotlight]')
  if (!card || !event.currentTarget.contains(card)) return

  const bounds = card.getBoundingClientRect()
  card.style.setProperty('--bayona-spot-x', `${Math.round(event.clientX - bounds.left)}px`)
  card.style.setProperty('--bayona-spot-y', `${Math.round(event.clientY - bounds.top)}px`)
}
