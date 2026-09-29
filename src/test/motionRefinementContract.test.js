import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (file) => readFileSync(join(root, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

describe('bounded motion and single typography scale', () => {
  it('wires the depth controller once inside the capability provider', () => {
    const provider = read('engine/providers/ExperienceProvider.jsx')
    expect(provider).toContain("import { useSurfaceDepth }")
    expect(provider.match(/useSurfaceDepth\(\)/g)).toHaveLength(1)
  })

  it('does not animate every paragraph or change heading tracking mid-scroll', () => {
    const css = read('styles/v2-scroll-motion.css')
    expect(css).toContain(".ds-frame[data-experience-mode='editorial'] .ds-copy-reveal")
    const keyframe = css.match(/@keyframes v2-heading-settle\s*\{[\s\S]*?\n {2}\}/)?.[0]
    expect(keyframe).toBeDefined()
    expect(keyframe).not.toContain('letter-spacing:')
    // The only universal paragraph list may be the static reduced-motion reset.
    const beforeReset = css.slice(0, css.indexOf('    main p,'))
    expect(beforeReset).not.toMatch(/\n {2}main p,/)
  })

  it('uses short spatial travel and independent rotation with a static fallback', () => {
    const css = read('styles/ds-experience.css')
    const spatial = css.match(/@keyframes ds-reveal-spatial\s*\{[\s\S]*?\n\}/)?.[0]
    expect(spatial).toContain('var(--bayona-dist-near, 16px)')
    expect(spatial).not.toContain('--bayona-dist-far')
    expect(css).toContain('rotate: var(--surface-depth-rotation, 1 0 0 0deg)')
    expect(css).toMatch(/prefers-reduced-motion: reduce[\s\S]*?\[data-depth-surface\][\s\S]*?rotate: none/)
  })

  it('does not reintroduce literal route heading sizes', () => {
    const css = read('styles/route-identity.css')
    expect(css).not.toMatch(/--fs-h[12]:\s*clamp\(/)
  })
})
