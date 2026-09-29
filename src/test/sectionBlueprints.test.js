import { describe, expect, it } from 'vitest'
import {
  LAYOUTS,
  REPEAT_CEILING,
  THEME_WORDS,
  UNCLASSIFIED,
  UNCLASSIFIED_CEILING,
  adjacentRepeats,
  classifyLayout,
  isThemeClaim,
} from '../config/sectionBlueprints.js'

// El brief §51 pide «un registro interno de diseños utilizados» que responda a
// ¿he usado este layout antes?. Este guard comprueba la lógica de ese registro
// sin navegador; la medición sobre el DOM real la hace
// scripts/measure-section-repetition.mjs con los mismos techos.

describe('registro anti-repetición de secciones', () => {
  it('solo admite plantas del vocabulario cerrado', () => {
    const validos = new Set(Object.values(LAYOUTS))

    expect(classifyLayout(['community-section', 'community-reveal', 'community-week'])).toBe(
      LAYOUTS.TIMELINE,
    )
    expect(classifyLayout(['calculator-section', 'home-services-configurator'])).toBe(
      LAYOUTS.CONFIGURATOR,
    )
    expect(classifyLayout(['about-globe-section'])).toBe(LAYOUTS.MAP)
    expect(classifyLayout(['nada-que-ver'])).toBe(UNCLASSIFIED)

    // Toda planta que el clasificador puede emitir existe en el vocabulario.
    const firmas = Object.keys(REPEAT_CEILING).map((ruta) => ruta)
    expect(firmas.length).toBeGreaterThan(0)
    for (const layout of new Set(Object.values(LAYOUTS))) {
      expect(validos.has(layout)).toBe(true)
    }
  })

  it('detecta la repetición contigua y solo la contigua', () => {
    const seguidas = [
      { layout: LAYOUTS.SPLIT },
      { layout: LAYOUTS.SPLIT },
      { layout: LAYOUTS.DATA },
    ]
    expect(adjacentRepeats(seguidas)).toEqual([{ index: 1, layout: LAYOUTS.SPLIT }])

    const separadas = [
      { layout: LAYOUTS.SPLIT },
      { layout: LAYOUTS.DATA },
      { layout: LAYOUTS.SPLIT },
    ]
    expect(adjacentRepeats(separadas)).toEqual([])
  })

  it('no cuenta como repetición lo que nadie supo nombrar', () => {
    // Dos `unclassified` seguidas no son dos secciones iguales: son dos secciones
    // sin decisión registrada. Se fiscalizan aparte, por su propio techo.
    expect(adjacentRepeats([{ layout: UNCLASSIFIED }, { layout: UNCLASSIFIED }])).toEqual([])
  })

  it('rechaza diferencias disfrazadas de tema', () => {
    // Gobernanza: prohibido resolver la diferenciación como «otro color /
    // gradiente / tema». Ninguna planta del vocabulario puede llamarse así.
    for (const layout of Object.values(LAYOUTS)) {
      expect(isThemeClaim(layout)).toBe(false)
    }
    expect(isThemeClaim('theme-dark-section')).toBe(true)
    expect(isThemeClaim('gradient-proof')).toBe(true)
    expect(THEME_WORDS.length).toBeGreaterThan(0)
  })

  it('mantiene los techos de deuda alineados con las rutas medidas', () => {
    // Las dos tablas de ratchet tienen que cubrir exactamente las mismas rutas:
    // si una ruta nueva aparece en una y no en la otra, el medidor la ignoraría.
    expect(Object.keys(UNCLASSIFIED_CEILING).sort()).toEqual(Object.keys(REPEAT_CEILING).sort())
  })
})
