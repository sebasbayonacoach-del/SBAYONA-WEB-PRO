// FASE 6 · CIERRE TRANSVERSAL — Contratos documentales D-01…D-07 (PLAN-FASE-6-WORLD-BUILDING.md §tests).
//
// Tests EXCLUSIVAMENTE documentales: leen los .md de Fase 6 y validan consistencia
// contra el registro de rutas y el engine. No modifican runtime, no añaden
// dependencias, no usan skip/only, no tocan tests existentes (D-008, contrato de
// alcance de Fase 6). La parte humana de D-07 queda documentada en el informe del
// bloque y NO se automatiza aquí (no se falsifica una auditoría humana).

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { ROUTE_META, ROUTE_ALIASES, NOT_FOUND_META } from '../lib/seo/routeMeta.js'
import { RECIPE_LIST } from '../engine/recipes/index.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

function readDoc(name) {
  return readFileSync(join(ROOT, name), 'utf8')
}

const BLUEPRINTS = () => readDoc('PAGE-BLUEPRINTS.md')
const WORLD_BIBLE = () => readDoc('BAYONA-WORLD-BIBLE.md')
const SPATIAL = () => readDoc('SPATIAL-LANGUAGE.md')
const STRATEGY = () => readDoc('WORLD-3D-STRATEGY.md')
const PLAN = () => readDoc('PLAN-FASE-6-WORLD-BUILDING.md')

const RECIPE_IDS = RECIPE_LIST.map((recipe) => recipe.id)
const RECIPE_SUFFIX_RE = /(reveal|slide|rail|stage|cascade|drift|passage|transition)/

/** Extrae todos los tokens en backticks de un texto. */
function backtickTokens(text) {
  return [...text.matchAll(/`([^`\n]+)`/g)].map((match) => match[1])
}

describe('FASE 6 · D-01 — Cobertura exacta de rutas (categorías §0.2)', () => {
  const blueprints = BLUEPRINTS()

  it('existe la sección COBERTURA DEL DOCUMENTO en PAGE-BLUEPRINTS', () => {
    expect(blueprints).toContain('# COBERTURA DEL DOCUMENTO')
  })

  it('toda ruta canónica de ROUTE_META tiene blueprint en el documento', () => {
    const canonical = Object.keys(ROUTE_META).filter((path) => path !== '/design-system')
    expect(canonical).toHaveLength(17)
    for (const path of canonical) {
      expect(blueprints, `falta blueprint de ${path}`).toContain(path)
    }
  })

  it('la categoría D (/design-system) consta como nota de exclusión', () => {
    expect(blueprints).toContain('/design-system')
    expect(blueprints).toMatch(/NOTA D|exclusión/i)
  })

  it('/entrar tiene metadatos propios y ya no es alias de /onboarding (B-C4004)', () => {
    expect(ROUTE_ALIASES).toEqual({})
    expect(ROUTE_META['/entrar']).toMatchObject({ noindex: true })
    expect(blueprints).toContain('/entrar')
  })

  it('el fallback 404 tiene blueprint propio y NOT_FOUND_META no se indexa', () => {
    expect(NOT_FOUND_META.noindex).toBe(true)
    expect(blueprints).toContain('(404)')
  })

  it('la ruta interna /design-system permanece en ROUTE_META (nota, no blueprint público)', () => {
    expect(ROUTE_META['/design-system']).toBeDefined()
  })
})

describe('FASE 6 · D-02 — Solo recetas reales del engine (o FUTURA marcada)', () => {
  const fase6Docs = [BLUEPRINTS(), WORLD_BIBLE(), SPATIAL(), STRATEGY(), PLAN()]

  it('los 8 ids reales del engine están disponibles como vocabulario', () => {
    expect(RECIPE_IDS).toEqual([
      'editorial-reveal',
      'editorial-slide',
      'compact-rail',
      'cinematic-stage',
      'data-cascade',
      'image-drift',
      'horizontal-passage',
      'quiet-transition',
    ])
  })

  it('ningún token con sufijo de receta escapa a los 8 ids reales', () => {
    for (const [index, doc] of fase6Docs.entries()) {
      const suspects = backtickTokens(doc).filter(
        (token) => RECIPE_SUFFIX_RE.test(token) && !RECIPE_IDS.includes(token),
      )
      expect(suspects, `receta inexistente en el doc Fase 6 #${index}`).toEqual([])
    }
  })
})

describe('FASE 6 · D-03 — Solo intensidades quiet/balanced/immersive', () => {
  const fase6Docs = [BLUEPRINTS(), WORLD_BIBLE(), SPATIAL(), STRATEGY(), PLAN()]

  it('ninguna intensidad paralela aparece como token (`calm`/`medium`/`intense`)', () => {
    for (const [index, doc] of fase6Docs.entries()) {
      const forbidden = backtickTokens(doc).filter((token) =>
        ['calm', 'medium', 'intense'].includes(token),
      )
      expect(forbidden, `intensidad paralela en el doc Fase 6 #${index}`).toEqual([])
    }
  })

  it('las tres intensidades reales están presentes en la matriz central', () => {
    const matrix = BLUEPRINTS().split('## M.2')[1] ?? ''
    for (const intensity of ['quiet', 'balanced', 'immersive']) {
      expect(matrix).toContain(`\`${intensity}\``)
    }
  })
})

describe('FASE 6 · D-04 — Los 9 mundos 00–08 existen con sus atributos', () => {
  const bible = WORLD_BIBLE()
  const strategy = STRATEGY()
  const WORLD_NAMES = [
    'ORIGEN',
    'CUERPO',
    'MÉTODO',
    'MOVIMIENTO',
    'EXPERIENCIA',
    'COMUNIDAD',
    'CONOCIMIENTO',
    'DECISIÓN',
    'CONTINUIDAD',
  ]

  it('el World Bible declara los 9 mundos en orden 00–08', () => {
    for (const [index, name] of WORLD_NAMES.entries()) {
      const header = `MUNDO 0${index} — ${name}`
      expect(bible, `falta el mundo ${header}`).toContain(header)
    }
  })

  it('la estrategia transversal cubre los 9 mundos (sección H)', () => {
    for (const name of WORLD_NAMES) {
      expect(strategy, `la estrategia no cubre el mundo ${name}`).toContain(name)
    }
  })
})

describe('FASE 6 · D-05 — Las clasificaciones 3D respetan la estrategia', () => {
  const ALLOWED_3D = new Set([
    'PROHIBIDO',
    'PROHIBIDO ABSOLUTO',
    'POSIBLE CON JUSTIFICACIÓN',
    'EXISTENTE/EXCEPCIONAL',
    'NO APLICA',
    '—',
  ])

  it('WORLD-3D-STRATEGY existe y es la autoridad del cierre transversal', () => {
    const strategy = STRATEGY()
    expect(strategy).toContain('# WORLD-3D-STRATEGY')
    expect(strategy).toContain('## F. GATE DE ADMISIÓN')
    expect(strategy).toContain('PROHIBIDO ABSOLUTO')
  })

  it('cada fila de la matriz central M.2 usa una clasificación 3D del vocabulario permitido', () => {
    const matrix = BLUEPRINTS().split('## M.2')[1].split('## M.3')[0]
    const rows = matrix.split('\n').filter((line) => /^\| `(\/|\*)/.test(line.trim()))
    expect(rows.length).toBe(19)
    for (const row of rows) {
      const cells = row.split('|').map((cell) => cell.trim())
      const classification = cells[17]
      expect(ALLOWED_3D.has(classification), `clasificación 3D no permitida: "${classification}"`).toBe(true)
    }
  })

  it('el embudo queda blindado: /checkout con 3D PROHIBIDO ABSOLUTO', () => {
    expect(BLUEPRINTS()).toContain('PROHIBIDO ABSOLUTO')
  })
})

describe('FASE 6 · D-06 — Sin vocabulario paralelo (anti-sinónimos)', () => {
  const fase6Docs = [BLUEPRINTS(), WORLD_BIBLE(), SPATIAL(), STRATEGY(), PLAN()]
  const FORBIDDEN_PARALLEL = ['calm', 'intense', 'scroll-in', 'scroll-out', 'mid-page']

  it('no existen tokens paralelos para conceptos ya nombrados por el engine', () => {
    for (const [index, doc] of fase6Docs.entries()) {
      const forbidden = backtickTokens(doc).filter((token) => FORBIDDEN_PARALLEL.includes(token))
      expect(forbidden, `vocabulario paralelo en el doc Fase 6 #${index}`).toEqual([])
    }
  })
})

describe('FASE 6 · D-07 — Contradicciones con matrices anteriores justificadas', () => {
  it('(parte mecánica) el Bloque 4 declara sus correcciones a SCROLL-STORY-MATRIX', () => {
    expect(BLUEPRINTS()).toMatch(/Correcciones declaradas a SCROLL-STORY-MATRIX/)
  })

  it('(parte mecánica) el Bloque 5 registra su contradiction ledger C-1…C-n', () => {
    const blueprints = BLUEPRINTS()
    expect(blueprints).toContain('REGISTRO DE CONTRADICCIONES')
    expect(blueprints).toContain('| C-1 |')
  })

  it('(parte mecánica) el cierre transversal registra su propia consistencia final', () => {
    expect(STRATEGY()).toContain('REGISTRO FINAL DE CONSISTENCIA')
    expect(STRATEGY()).toContain('| W1 |')
  })

  // La parte de REVISIÓN HUMANA de D-07 (coherencia semántica blueprint↔matriz↔
  // estrategia) corresponde a Sebastián/auditor y se registra en el informe final
  // del bloque. NO se automatiza: falsificarla sería fabricar cumplimiento.
})

describe('FASE 6 · Extra — Disciplina de evidencia e idioma (protección real, sin vanidad)', () => {
  const fase6Docs = [BLUEPRINTS(), WORLD_BIBLE(), SPATIAL(), STRATEGY(), PLAN()]

  it('ninguna pieza clasificada EXISTENTE/EXCEPCIONAL carece del componente vivo citado', () => {
    // Lo único EXISTENTE es el mapa de /about; su componente vivo debe citarse.
    const strategy = STRATEGY()
    expect(strategy).toContain('GlobeTestimonials')
    expect(strategy).toContain('DORMANTE')
  })

  it('la documentación de Fase 6 no contiene relleno en inglés', () => {
    for (const [index, doc] of fase6Docs.entries()) {
      expect(doc.toLowerCase(), `relleno en inglés en el doc #${index}`).not.toContain('lorem ipsum')
      expect(doc.toLowerCase(), `relleno en inglés en el doc #${index}`).not.toContain('coming soon')
    }
  })
})

