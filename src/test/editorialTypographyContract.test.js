// Contrato tipográfico editorial (2026-09-23).
//
// Diagnóstico que este contrato blinda: `luxury-typography-final.css` fijaba
// los titulares con `--lux-fs-*` (`!important`), pero
// `editorial-breathing-pass.css` —que entra MÁS TARDE en la cascada— redefinía
// `--fs-h1/--fs-h2/--fs-h3/--fs-lead/--fs-body` y los cuatro `--lh-*` con otra
// escala. Resultado: dos escalas paralelas y el mismo rol midiendo distinto
// según qué hoja ganara.
//
// Invariantes que se protegen aquí:
//   1. `luxury-typography-final.css` es el ÚNICO dueño escalar.
//   2. `editorial-breathing-pass.css` no declara ningún `--fs-*` / `--lh-*`.
//   3. La escala es fluida (clamp) y no salta por breakpoint.
//   4. La cobertura de titulares de producto es estable (main h1/h2/h3 + acceso)
//      y el cuerpo no se aplana a `!important` sobre todo el texto.
//   5. app-os unifica titulares de pantalla y ancla los compactos.
//   6. auth-members normaliza el acceso y ancla sus tarjetas.
//   7. ds-tokens conserva los alias `--ds-fs-*` → `--fs-*`.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const STYLES = join(ROOT, 'styles')

const read = (file) => readFileSync(join(STYLES, file), 'utf8')
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '')
const flat = (css) => css.replace(/\s+/g, ' ').trim()

const luxury = read('luxury-typography-final.css')
const breathing = read('editorial-breathing-pass.css')
const auth = read('auth-members.css')
const appOs = read('app-os.css')
const tokens = read('ds-tokens.css')

const flatLuxury = flat(stripComments(luxury))
const flatBreathing = flat(stripComments(breathing))
const flatAuth = flat(stripComments(auth))
const flatAppOs = flat(stripComments(appOs))
const flatTokens = flat(stripComments(tokens))

const count = (source, needle) => source.split(needle).length - 1

describe('escala tipográfica editorial — dueño escalar único', () => {
  it('luxury declara la escala fluida sugerida para h1..meta', () => {
    const steps = {
      h1: 'clamp(2.35rem, 1.4rem + 3.3vw, 4.35rem)',
      h2: 'clamp(1.85rem, 1.1rem + 2.4vw, 3.3rem)',
      h3: 'clamp(1.25rem, 1.06rem + 0.6vw, 1.6rem)',
      h4: 'clamp(1.0625rem, 1rem + 0.2vw, 1.2rem)',
      body: 'clamp(1rem, 0.96rem + 0.2vw, 1.125rem)',
      lead: 'clamp(1.0625rem, 0.98rem + 0.4vw, 1.25rem)',
      meta: 'clamp(0.8125rem, 0.78rem + 0.1vw, 0.875rem)',
    }

    for (const [step, value] of Object.entries(steps)) {
      expect(flatLuxury, `--lux-fs-${step}`).toContain(`--lux-fs-${step}: ${value}`)
    }
  })

  it('los alias --fs-* / --lh-* resuelven al mismo valor que --lux-*', () => {
    for (const step of ['display', 'h1', 'h2', 'h3', 'h4', 'lead', 'body', 'meta']) {
      expect(flatLuxury, `--fs-${step}`).toContain(`--fs-${step}: var(--lux-fs-${step})`)
    }
    for (const step of ['display', 'heading', 'title', 'body']) {
      expect(flatLuxury, `--lh-${step}`).toContain(`--lh-${step}: var(--lux-lh-${step})`)
    }
  })

  it('fija los interlineados por rol: display .98, heading 1.06, title 1.24, body 1.7', () => {
    expect(flatLuxury).toContain('--lux-lh-display: 0.98')
    expect(flatLuxury).toContain('--lux-lh-heading: 1.06')
    expect(flatLuxury).toContain('--lux-lh-title: 1.24')
    expect(flatLuxury).toContain('--lux-lh-body: 1.7')
  })

  it('la escala es continua: ningún paso se re-declara en media queries', () => {
    for (const token of [
      '--lux-fs-h1:',
      '--lux-fs-h2:',
      '--lux-fs-display:',
      '--lux-lh-display:',
      '--lux-lh-heading:',
    ]) {
      expect(count(flatLuxury, token), token).toBe(1)
    }
  })
})

describe('escala tipográfica editorial — la hoja de respiración no compite', () => {
  it('editorial-breathing-pass.css no declara ningún --fs-* / --lh-*', () => {
    expect(flatBreathing).not.toMatch(/--fs-[a-z0-9-]+\s*:/)
    expect(flatBreathing).not.toMatch(/--lh-[a-z0-9-]+\s*:/)
  })

  it('conserva solo el ritmo y el aire (tokens bayona-* / route-*)', () => {
    expect(flatBreathing).toContain('--bayona-copy-measure:')
    expect(flatBreathing).toContain('--bayona-section-intro-gap:')
    expect(flatBreathing).toContain('--bayona-card-gap:')
    expect(flatBreathing).toContain('--route-section-space:')
  })
})

describe('escala tipográfica editorial — cobertura estable de titulares', () => {
  it('el h1 de héroe incluye el acceso y usa el token del dueño', () => {
    const heroBlock = luxury.match(/:is\(\s*#home-hero-title,[\s\S]*?\)\s*\{[\s\S]*?\}/)
    expect(heroBlock, 'bloque de h1 de héroe').not.toBeNull()

    const block = flat(stripComments(heroBlock[0]))
    expect(block).toContain('.entrar-command h1')
    expect(block).toContain('.entrar-card h1')
    expect(block).toContain('font-size: var(--lux-fs-h1) !important')
  })

  it('existe un fallback genérico de main h1 acotado al ámbito de marca', () => {
    expect(flatLuxury).toMatch(
      /main\[data-experience-scope='brand'\] h1 \{ font-size: var\(--lux-fs-h1\) !important/,
    )
  })

  it('main h2 y main h3 siguen cubiertos con el token del dueño', () => {
    const h2Block = luxury.match(/:is\(\s*main h2,[\s\S]*?\)\s*\{[\s\S]*?\}/)
    const h3Block = luxury.match(/:is\(\s*main h3,[\s\S]*?\)\s*\{[\s\S]*?\}/)

    expect(h2Block, 'bloque de main h2').not.toBeNull()
    expect(h3Block, 'bloque de main h3').not.toBeNull()

    expect(flat(stripComments(h2Block[0]))).toContain('font-size: var(--lux-fs-h2) !important')
    expect(flat(stripComments(h3Block[0]))).toContain('font-size: var(--lux-fs-h3) !important')
  })

  it('el nombre canónico del plan cae en h3 y ya no es un cartel', () => {
    const h3Block = luxury.match(/:is\(\s*main h3,[\s\S]*?\)\s*\{[\s\S]*?\}/)
    expect(flat(stripComments(h3Block[0]))).toContain('.plan-canonical-name')
    expect(flatLuxury).not.toMatch(/\.plan-showroom-preview \.plan-canonical-name\s*\{/)
  })

  it('la cita editorial usa el token de lead', () => {
    expect(flatLuxury).toMatch(
      /\.experience-proof-quote \{ padding-left: 0; border-left: 0; color: #181512; font-size: var\(--lux-fs-lead\) !important/,
    )
  })

  it('el cuerpo de main p no se aplana con !important y excluye roles no-cuerpo', () => {
    const bodyRule = luxury.match(/main :where\(p, li, dd, blockquote\):not\(:where\([\s\S]*?\)\)\s*\{[\s\S]*?\}/)
    expect(bodyRule, 'regla de cuerpo').not.toBeNull()

    const block = flat(stripComments(bodyRule[0]))
    for (const role of ['price', 'figure', 'number', 'stat', 'value', 'label', 'button', 'cta']) {
      expect(block, `exclusión ${role}`).toContain(`[class*='${role}']`)
    }
    expect(block).toContain('font-size: var(--lux-fs-body)')
    expect(block).not.toContain('font-size: var(--lux-fs-body) !important')
  })

  it('ds-tokens conserva los alias --ds-fs-* → --fs-*', () => {
    expect(flatTokens).toContain('--ds-fs-h1: var(--fs-h1)')
    expect(flatTokens).toContain('--ds-fs-h2: var(--fs-h2)')
    expect(flatTokens).toContain('--ds-fs-h3: var(--fs-h3)')
    expect(flatTokens).toContain('--ds-lh-heading: var(--lh-heading)')
  })
})

describe('escala tipográfica editorial — panel (app-os)', () => {
  it('unifica os-today__title y os-screen__title con el peldaño h1', () => {
    expect(flatAppOs).toMatch(
      /\.os-today__title, \.os-screen__title \{ font-size: var\(--lux-fs-h1\) !important; line-height: var\(--lux-lh-display\) !important/,
    )
  })

  it('ancla los h2 compactos del panel a h3/h4 para que main h2 no los agigante', () => {
    expect(flatAppOs).toMatch(/\.os-vault__intro h2 \{[\s\S]*?font-size: var\(--lux-fs-h3\) !important/)
    expect(flatAppOs).toMatch(
      /\.os-program-console__hero h2, \.os-workout-stage__copy h2, \.os-coach-builder h2 \{[\s\S]*?font-size: var\(--lux-fs-h3\) !important/,
    )
    expect(flatAppOs).toMatch(/\.os-handoff h2 \{[\s\S]*?font-size: var\(--lux-fs-h3\) !important/)
    expect(flatAppOs).toMatch(/\.os-hero__title \{[\s\S]*?font-size: var\(--lux-fs-h3\) !important/)
    expect(flatAppOs).toMatch(/h2\.os-command-card__value \{[\s\S]*?font-size: var\(--lux-fs-h3\) !important/)
    expect(flatAppOs).toMatch(/\.os-panel__head h2 \{[\s\S]*?font-size: var\(--lux-fs-h4\) !important/)
  })

  it('usa un ritmo de grupo tokenizado y no hereda el aire editorial de sección', () => {
    expect(flatAppOs).toContain(
      '--os-group-gap: clamp(var(--ds-space-5), 2.6vw, var(--ds-space-6))',
    )
    expect(flatAppOs).toContain('margin: 0 0 var(--os-group-gap)')
    expect(flatAppOs).not.toContain('--route-section-space')
    expect(flatAppOs).not.toContain('--bayona-section-intro-gap')
  })
})

describe('escala tipográfica editorial — acceso (auth-members)', () => {
  it('normaliza el interlineado del titular y del cuerpo del acceso', () => {
    expect(flatAuth).toMatch(
      /\.entrar-command h1 \{[\s\S]*?font-size: var\(--lux-fs-h1[\s\S]*?line-height: var\(--lux-lh-display/,
    )
    expect(flatAuth).toMatch(/\.entrar-command > p \{[\s\S]*?line-height: var\(--lux-lh-body/)
  })

  it('ancla los h2 compactos de la zona de miembros a h3/h4', () => {
    expect(flatAuth).toMatch(/\.members-block h2 \{[\s\S]*?font-size: var\(--lux-fs-h4\) !important/)
    expect(flatAuth).toMatch(/\.lead-magnet h2 \{[\s\S]*?font-size: var\(--lux-fs-h3\) !important/)
  })
})
