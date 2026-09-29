// Contrato de la capa de experiencia (FASE 4 · 4.1).
//
// Esta hoja es el pegamento perceptivo de todo el sitio, así que lo que se le
// exige no es estético sino estructural. Si alguna de estas invariantes se
// rompe, BAYONA vuelve a ser dos universos distintos en vez de uno:
//
//   1. CERO COLORES NUEVOS: todo hex permitido es espejo declarado del
//      laboratorio (spatial-lab.css). El resto son alias `var()`.
//   2. UN SOLO DUEÑO POR TOKEN: la hoja no redefine ningún `--bayona-*` que
//      ya posea overrides.css, ni ningún `--ds-*` de ds-tokens.css.
//   3. CERO `!important` y CERO `z-index` fuera de la escalera del sistema.
//   4. TRES CURVAS VIVAS como máximo, y siempre por token.
//   5. RADIO: no se declaran valores propios; el canto afilado viene del DS.
//   6. ESPACIADO: márgenes y paddings solo por tokens de la escala de 4px.
//   7. REDUCED MOTION: estado estático diseñado, nunca `duration: 0`.
//   8. ORDEN: es la última hoja global de la cascada (matiza sin gritar).
//   9. PREFIJO: todo selector propio es `.ds-` (extensión del sistema, no un
//      sistema paralelo). Las clases heredadas se matizan con `:where()`.
//  10. ATELIER: el pase que sube el nivel (FASE 4C) obedece este mismo régimen y
//      solo habla dentro del marco de marca; nunca dentro del laboratorio.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SHEET = join(ROOT, 'styles', 'ds-experience.css')

const experienceCss = readFileSync(SHEET, 'utf8')
const overridesCss = readFileSync(join(ROOT, 'overrides.css'), 'utf8')
const tokensCss = readFileSync(join(ROOT, 'styles', 'ds-tokens.css'), 'utf8')
const spatialLabCss = readFileSync(join(ROOT, 'styles', 'spatial-lab.css'), 'utf8')
const mainSource = readFileSync(join(ROOT, 'main.jsx'), 'utf8')

/** Quita comentarios de bloque para no auditar la documentación. */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

const css = stripComments(experienceCss)

function declaredTokens(source) {
  return new Set([...source.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map(([, name]) => name))
}

describe('Capa de experiencia — color y propiedad de los tokens', () => {
  it('no introduce ningún color que no sea espejo del laboratorio', () => {
    const hexes = [...new Set([...css.matchAll(/#[0-9a-f]{3,8}\b/gi)].map(([hex]) => hex.toLowerCase()))]

    expect(hexes.length).toBeGreaterThan(0)
    for (const hex of hexes) {
      expect(spatialLabCss.toLowerCase(), `hex ${hex} sin dueño en spatial-lab.css`).toContain(hex)
    }
  })

  it('no redefine tokens que ya poseen overrides.css o ds-tokens.css', () => {
    const owned = new Set([...declaredTokens(overridesCss), ...declaredTokens(tokensCss)])
    const redefined = [...declaredTokens(css)].filter((name) => owned.has(name))

    expect(redefined).toEqual([])
  })

  it('todos los valores de color son alias a un dueño del sistema', () => {
    const colorDeclarations = [...css.matchAll(/(?<![-\w])color:\s*([^;]+);/gi)].map(([, value]) => value.trim())

    expect(colorDeclarations.length).toBeGreaterThan(4)
    for (const value of colorDeclarations) {
      expect(value, `color «${value}» no está tokenizado`).toMatch(/^var\(--/)
    }
  })
})

describe('Capa de experiencia — reglas de fabricación', () => {
  it('cero !important', () => {
    expect(css).not.toMatch(/!important/)
  })

  it('cero z-index mágicos: solo la escalera del sistema', () => {
    const zValues = [...css.matchAll(/z-index:\s*([^;]+);/gi)].map(([, value]) => value.trim())

    for (const value of zValues) {
      expect(value).toMatch(/^var\(--ds-z-[a-z-]+\)$/)
    }
  })

  it('máximo tres curvas de movimiento vivas y ninguna creada aquí', () => {
    const easings = [...css.matchAll(/--bayona-ease-[a-z-]+:/gi)].map(([name]) => name.replace(':', ''))

    expect(easings).toEqual([
      '--bayona-ease-entrance',
      '--bayona-ease-standard',
      '--bayona-ease-travel',
    ])
    expect(css).not.toMatch(/cubic-bezier\(\s*\.?\d/)
    // Cada curva aliasa una del sistema: no hay una curva sexta escondida.
    for (const name of easings) {
      const owner = name.replace('bayona', 'ds')
      expect(tokensCss, `el sistema no define ${owner}`).toContain(`${owner}:`)
    }
  })

  it('no declara radios propios', () => {
    const radii = [...css.matchAll(/border-radius:\s*([^;]+);/gi)].map(([, value]) => value.trim())

    for (const value of radii) {
      expect(value).toMatch(/^var\(--(ds|bayona)-radius-/)
    }
  })

  it('el espaciado sale de la escala del sistema, no de números sueltos', () => {
    const spacing = [...css.matchAll(/(?<![-\w])(?:margin|padding|gap)(?:-(?:block|inline))?(?:-(?:start|end|top|bottom|left|right))?\s*:\s*([^;]+);/gi)]
      .map(([, value]) => value.trim())
      .filter((value) => value !== '0' && !value.startsWith('0 '))

    expect(spacing.length).toBeGreaterThan(4)
    for (const value of spacing) {
      expect(value, `espaciado «${value}» no tokenizado`).toMatch(/var\(--(ds|bayona)-|clamp\(|\b0\b/)
    }
  })

  it('es la última hoja global de la cascada', () => {
    const imports = [...mainSource.matchAll(/import '\.\/styles\/([^']+\.css)'/g)].map(([, file]) => file)

    // La capa de experiencia, el pase atelier y la portada atelier son las tres
    // últimas hojas: matizan al final, sin que nadie tenga que ganarles con
    // `!important`.
    expect(imports.slice(-3)).toEqual(['ds-experience.css', 'ds-atelier.css', 'home-atelier.css'])
    expect(imports.indexOf('ds-tokens.css')).toBeLessThan(imports.length - 3)
  })

  it.each([
    ['el pase atelier', 'ds-atelier.css'],
    ['la portada atelier', 'home-atelier.css'],
  ])('%s es aditivo y no invade el laboratorio', (_nombre, hoja) => {
    const pase = stripComments(readFileSync(join(ROOT, 'styles', hoja), 'utf8'))

    // Mismo régimen de fabricación que la hoja madre.
    expect(pase).not.toMatch(/!important/)
    expect(pase).not.toMatch(/#(?:[0-9a-f]{3,8})\b/i)
    expect(pase).not.toMatch(/z-index:\s*\d/)
    expect(pase).not.toMatch(/border-radius:\s*[^;]*\d/)
    const spacing = [...pase.matchAll(/(?<![-\w])(?:margin|padding|gap)(?:-(?:block|inline))?(?:-(?:start|end|top|bottom|left|right))?\s*:\s*([^;]+);/gi)]
      .map(([, value]) => value.trim())
      .filter((value) => value !== '0' && !value.startsWith('0 '))
    for (const value of spacing) {
      expect(value, `espaciado «${value}» no tokenizado`).toMatch(/var\(--(ds|bayona)-|clamp\(|\b0\b/)
    }

    // Y no vuelve a aplastar la luz ambiental del sitio: el marco no se pinta
    // con un fondo plano opaco, se envuelve en capas translúcidas.
    const backgrounds = [...pase.matchAll(/(?<![-\w])background\s*:\s*([^;]+);/gi)]
      .map(([, value]) => value.replace(/\s+/g, ' ').trim())

    for (const value of backgrounds) {
      expect(
        value,
        `el marco no puede pintarse con un fondo plano: ${value}`,
      ).toMatch(/^(?:none|transparent|(?:linear|radial|conic)-gradient|color-mix\()/)
    }

    // Toda regla que toca DOM ajeno declara el ámbito de marca o se limita a
    // `:where()`. El laboratorio 3A queda fuera por construcción, no por
    // accidente: ni una mención a su hoja ni a su armazón.
    const preludes = pase
      .split('{')
      .map((chunk) => chunk.slice(chunk.lastIndexOf('}') + 1).trim())
      .filter((prelude) => prelude && !prelude.startsWith('@'))
      .filter((prelude) => prelude.includes('.'))

    expect(preludes.length).toBeGreaterThan(9)
    for (const prelude of preludes) {
      expect(
        prelude.includes("data-experience-scope='brand'") || prelude.startsWith(':where('),
        `regla sin ámbito de marca: ${prelude.slice(0, 90)}`,
      ).toBe(true)
    }
    expect(pase).toMatch(/data-experience-scope='brand'/)
    expect(pase).not.toMatch(/\.lab-shell|spatial-lab/)

    // Un solo bloque reduced motion, y diseña estado en vez de borrar la marca.
    expect(pase.match(/@media \(prefers-reduced-motion: reduce\)/g) || []).toHaveLength(1)
  })


  it('solo usa prefijos del sistema y deja las clases heredadas en :where()', () => {
    const preludes = css
      .split('{')
      .map((chunk) => chunk.slice(chunk.lastIndexOf('}') + 1).trim())
      .filter((prelude) => prelude && !prelude.startsWith('@media') && !prelude.startsWith('@supports'))
      .filter((prelude) => !prelude.startsWith(':where('))
      .flatMap((prelude) => prelude.split(','))
      .map((selector) => selector.trim())
      .filter(Boolean)

    expect(preludes.length).toBeGreaterThan(24)
    for (const selector of preludes) {
      const classes = [...selector.matchAll(/\.([a-z][\w-]*)/gi)].map(([, name]) => name)

      for (const name of classes) {
        expect(
          name.startsWith('ds-') || selector.includes(':where('),
          `selector fuera del sistema: .${name}`,
        ).toBe(true)
      }
    }
  })
})

describe('Capa de experiencia — reduced motion como estado diseñado', () => {
  it('define estado estático y no apaga el motion a duration 0', () => {
    const blocks = [...css.matchAll(/@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?\n\}/g)]
      .map((found) => found[0])
    const reduced = blocks.find((block) => block.includes('.ds-reveal'))

    expect(blocks, 'la hoja debe tener UN solo bloque reduced motion').toHaveLength(1)
    expect(reduced, 'falta el bloque prefers-reduced-motion').not.toBeUndefined()
    expect(reduced).toMatch(/\.ds-reveal[^{]*\{[^}]*opacity:\s*1/s)
    expect(reduced).toMatch(/transform:\s*none/)
    expect(reduced).toMatch(/animation:\s*none/)
    expect(reduced).not.toMatch(/duration:\s*0s/)
    // La numeración compartida también apaga el tránsito, sin ocultar nada.
    expect(reduced).toMatch(/\.ds-sequence[^{]*::after\s*\{[^}]*transition:\s*none/s)
  })

  it('las cinco familias de movimiento existen y cada una es una idea', () => {
    for (const family of ['ds-reveal', 'ds-reveal--shift', 'ds-reveal--scale', 'ds-reveal--mask', 'ds-reveal--spatial']) {
      expect(css, `familia ${family}`).toContain(`.${family}`)
    }
    // Reveals ligados a scroll por CSS puro: sin hijack del scroll y sin JS.
    expect(css).toMatch(/animation-timeline:\s*view\(\)/)
    expect(css).toMatch(/@supports \(animation-timeline: view\(\)\)/)
  })

  it('el patrón del método es una secuencia, no tres tarjetas', () => {
    expect(css).toMatch(/\.ds-method\s*\{[^}]*border-top:/)
    expect(css).toMatch(/\.ds-method-step\s*\{[^}]*border-bottom:/)
    expect(css).not.toMatch(/\.ds-method-step[^{]*\{[^}]*(box-shadow|backdrop-filter)/)
  })
})
