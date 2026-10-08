// Guard de gobernanza de escenas 3D — Fase 7A.
//
// Impide que una escena 3D llegue a una ruta pública sin pasar por el gate de
// admisión. No mide rendimiento: protege una DECISIÓN de arquitectura.
//
// Si este test se pone rojo, la pregunta correcta NO es "cómo lo arreglo",
// es "¿quién admitió esa escena y dónde está su 3D-ADMISSION-RECORD?".
//
// Nota 7A: el hallazgo 7A-01 (fuga vendor-three por import estático del entry
// vía ExperienceProvider→Loader→drei) NO lo vigila este guard: es un problema
// de chunking del shell, reportado en FASE7A-FORENSIC.md y pendiente de
// decisión del arquitecto. Este guard vigila escenas MONTADAS en rutas.

import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const PAGES_DIR = 'src/pages'

// Lista blanca de rutas autorizadas a montar una escena 3D.
// VACÍA a fecha de Fase 7A. Añadir una entrada aquí requiere un registro de
// admisión APPROVED en 3D-ADMISSION-RECORD.md, citado en el comentario.
const SCENE_ALLOWLIST = Object.freeze([
  { file: 'Home.jsx', admission: 'PLAN_3D_INMERSIVO.md#hero', state: 'APPROVED' },
  { file: 'About.jsx', admission: 'PLAN_3D_INMERSIVO.md#globe', state: 'APPROVED' },
  { file: 'ParkourAcademy.jsx', admission: 'PLAN_3D_INMERSIVO.md#parkour', state: 'APPROVED' },
  { file: 'AppExperience.jsx', admission: 'PLAN_3D_INMERSIVO.md#showcase', state: 'APPROVED' },
  { file: 'Programs.jsx', admission: 'PLAN_3D_INMERSIVO.md#showroom', state: 'APPROVED' },
  { file: 'Shop.jsx', admission: 'PLAN_3D_INMERSIVO.md#hologram', state: 'APPROVED' },
])

function formatsOf(source) {
  return [...source.matchAll(/\{\s*id:\s*'([\w-]+)',\s*width:\s*(\d+),\s*height:\s*(\d+)\s*\}/g)].map((m) => ({
    id: m[1],
    width: Number(m[2]),
    height: Number(m[3]),
  }))
}

function pageFiles() {
  return readdirSync(PAGES_DIR).filter(
    (f) => f.endsWith('.jsx') && !f.includes('.test.'),
  )
}

describe('gobernanza de escenas 3D (Fase 7A)', () => {
  it('ninguna página pasa la prop `scene` a PageHero sin estar en la lista blanca', () => {
    const offenders = []
    for (const file of pageFiles()) {
      const src = readFileSync(join(PAGES_DIR, file), 'utf8')
      // Detecta `scene={...}` y `scene="..."` en JSX.
      if (/\bscene\s*=\s*[{"']/.test(src)) {
        const allowed = SCENE_ALLOWLIST.some((e) => e.file === file)
        if (!allowed) offenders.push(file)
      }
    }
    expect(
      offenders,
      `Estas páginas montan una escena sin admisión aprobada: ${offenders.join(', ')}. ` +
        'Busca su 3D-ADMISSION-RECORD.md o quita la prop scene.',
    ).toEqual([])
  })

  it('ninguna página importa Three.js, R3F, drei o postprocessing directamente', () => {
    const offenders = []
    const banned = /from\s+['"](three|@react-three\/fiber|@react-three\/drei|@react-three\/postprocessing)['"]/
    for (const file of pageFiles()) {
      const src = readFileSync(join(PAGES_DIR, file), 'utf8')
      if (banned.test(src)) offenders.push(file)
    }
    expect(
      offenders,
      `Las páginas deben pasar por SceneMount, nunca importar 3D directo: ${offenders.join(', ')}`,
    ).toEqual([])
  })

  it('el registro de escenas contiene exactamente las variantes documentadas', async () => {
    const { sceneRegistry } = await import('../engine/config/sceneRegistry.js')
    // El registro es un CONJUNTO CERRADO, no una lista que crece. `signature` es
    // la escena insignia admitida; `trajectory` NO es una admisión pública: es la
    // maqueta del laboratorio aislado de /design-system, autorizada como
    // EVALUACIÓN en docs/DECISIONS.md (D-009) y vigilada por los dos testes de
    // abajo (nadie más puede montarla y no trae assets). Las 4 variantes
    // inmersivas restantes son las aprobadas en Fase 11 (PLAN_3D_INMERSIVO.md
    // §3.4) para rutas públicas.
    // 2026-09-20 SUMINISTRO bayona-3d-supply APROBADO por Sebastián: 13 variantes
    // nuevas de producto (barbell, dumbbells, kettlebell, weightstack, plyobox,
    // punchbag, bench, platetree, scale, timer, recovery, pullupbar, viewer).
    // Todas viven en engine/scene/, cargan SOLO vía lazy(), son 100% procedurales
    // (assets: []) y degradan por resolveSceneConfig. Sin esta alta el test tumba
    // el merge aunque el código sea correcto.
    expect(Object.keys(sceneRegistry).sort()).toEqual([
      'barbell',
      'bench',
      'dumbbells',
      'globe',
      'hero',
      'hologram',
      'kettlebell',
      'parkour',
      'platetree',
      'plyobox',
      'pullupbar',
      'punchbag',
      'recovery',
      'scale',
      'showcase',
      'showroom',
      'signature',
      'timer',
      'trajectory',
      'viewer',
      'weightstack',
    ])
  })

  it('D-009: la variante del laboratorio no la monta ninguna página ni ningún layout', () => {
    // La excepción es de EVALUACIÓN AISLADA, no de admisión: se permite que el
    // laboratorio la monte; se prohíbe que aparezca en una ruta pública. Si
    // alguien la cuela en Home/Onboarding/Parkour, este test se pone rojo y el
    // registro de admisión (CANDIDATO-01, RECHAZADO) sigue siendo el que manda.
    const offenders = []
    // El laboratorio es el ÚNICO dueño legítimo de la variante: se excluye su
    // propia carpeta (incluido el puente), no cualquier archivo que se llame lab.
    const LAB_DIR = 'src/components/lab/'
    // `join` usa el separador nativo (\ en Windows): normalizamos a / para que
    // la exclusión de la carpeta del laboratorio funcione en cualquier SO.
    const normSep = (p) => p.replace(/\\/g, '/')
    const walk = (dir) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const file = join(dir, entry.name)
        if (normSep(file).startsWith(LAB_DIR)) continue
        if (entry.isDirectory()) {
          walk(file)
        } else if (/\.(js|jsx)$/.test(entry.name) && !entry.name.includes('.test.')) {
          const src = readFileSync(file, 'utf8')
          if (/variant:\s*['"]trajectory['"]|\bTRAJECTORY_VARIANT\b/.test(src)) offenders.push(file)
        }
      }
    }
    walk('src/pages')
    walk('src/components')
    expect(
      offenders,
      'La variante "trajectory" solo la pide src/components/lab/. Apareció en: ' +
        `${offenders.join(', ')}. Para llevarla a una ruta pública hace falta un registro ` +
        'de admisión aprobado en 3D-ADMISSION-RECORD.md, no editar este test.',
    ).toEqual([])
  })

  it('D-009: la maqueta del laboratorio no arrastra assets ni cambia el grafo del shell', async () => {
    const { sceneRegistry } = await import('../engine/config/sceneRegistry.js')
    // Cero assets: es la condición de que un greybox no consuma presupuesto de red.
    expect(sceneRegistry.trajectory.assets).toEqual([])
    expect(sceneRegistry.trajectory.defaults.particleCount).toBe(0)
    expect(sceneRegistry.trajectory.defaults.bloomIntensity).toBe(0)
    // Lazy: si alguien lo pasa a import estático, el chunk 3D entra en la entrada.
    expect(typeof sceneRegistry.trajectory.component).toBe('object')
    expect(sceneRegistry.trajectory.component.$$typeof?.toString()).toBe('Symbol(react.lazy)')
    // La escena vive en engine/scene y se alcanza SOLO desde el puente del lab.
    const lab = readFileSync('src/components/lab/TrajectoryLab.jsx', 'utf8')
    expect(lab).toMatch(/import\(['"]\.\/TrajectoryStage\.jsx['"]\)/)
    expect(lab).not.toMatch(/from\s+['"](three|@react-three\/)/)
    expect(readFileSync('src/components/lab/TrajectoryStage.jsx', 'utf8')).not.toMatch(
      /from\s+['"](three|@react-three\/)/,
    )
    // Acoplamiento de encuadre: el registro y la maqueta dicen el MISMO número.
    // No se importa el módulo de datos al config (shared config no conoce una
    // escena del laboratorio); se comprueba aquí, que sí puede leer los dos.
    const stage = await import('../engine/scene/trajectoryStage.js')
    expect(sceneRegistry.trajectory.defaults.cameraPosition).toEqual(stage.VIEWS.understand.wide.position)
    // La promesa del lote: cero bytes de assets y cero postprocessing en la
    // maqueta, y el FOV del encuadre inicial dentro del rango razonable que la
    // propia maqueta declara (si alguien lo baja a 20º, esto también lo pilla).
    expect(stage.VIEWS.understand.wide.fov).toBeGreaterThanOrEqual(34)
    expect(stage.VIEWS.understand.wide.fov).toBeLessThanOrEqual(58)
    // signature NO cambió: la excepción del laboratorio no reescribe la escena madre.
    expect(sceneRegistry.signature.defaults.particleCount).toBe(1200)
    expect(sceneRegistry.signature.defaults.instanceCount).toBe(24)
    expect(sceneRegistry.signature.defaults.cameraPosition).toEqual([0, 0, 5])
  })

  it('los techos de degradación móvil no se han relajado', async () => {
    const mod = await import('../engine/config/sceneConfig.js')
    expect(mod.MOBILE_MAX_PARTICLES).toBe(400)
    expect(mod.MOBILE_MAX_INSTANCES).toBe(8)
  })

  it('resolveSceneConfig sigue siendo fail-safe con variante desconocida', async () => {
    const { resolveSceneConfig } = await import('../engine/config/sceneConfig.js')
    expect(resolveSceneConfig({ variant: 'no-existe-esta-variante' }, { mode: 'desktop' })).toBeNull()
    expect(resolveSceneConfig(null, { mode: 'desktop' })).toBeNull()
    expect(resolveSceneConfig({ variant: 'signature', enabled: false }, { mode: 'desktop' })).toBeNull()
  })

  it('no hay librerías de motion/3D prohibidas importadas en src', () => {
    // gsap está en package.json como deuda muerta declarada: 0 imports.
    const offenders = []
    const walk = (dir) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, entry.name)
        if (entry.isDirectory()) walk(p)
        else if (/\.(js|jsx)$/.test(entry.name)) {
          const src = readFileSync(p, 'utf8')
          if (/from\s+['"](gsap|animejs|@motionone|motion-one)['"]/.test(src)) offenders.push(p)
        }
      }
    }
    walk('src')
    expect(offenders, `Librerías prohibidas importadas: ${offenders.join(', ')}`).toEqual([])
  })

  it('7B: el shell del engine (providers/effects/motion/hooks) tiene CERO imports estáticos de @react-three', () => {
    // Post-fix 7A-01 (Fase 7B): el Loader ya no importa drei y el barrel ya no
    // reexporta las escenas. El shell debe estar 100% limpio: cualquier import
    // estático de @react-three en providers/effects/motion/hooks volvería a
    // arrastrar vendor-three al chunk de entrada de TODAS las rutas.
    // Los módulos de scene/ son los ÚNICOS legítimos (cargan vía lazy()).
    const offenders = []
    const walk = (dir) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, entry.name)
        if (entry.isDirectory()) walk(p)
        else if (/\.(js|jsx)$/.test(entry.name) && !p.includes('.test.')) {
          const src = readFileSync(p, 'utf8')
          if (/from\s+['"]@react-three\/(fiber|drei|postprocessing)['"]/.test(src)) offenders.push(p)
        }
      }
    }
    for (const shellDir of ['src/engine/providers', 'src/engine/effects', 'src/engine/motion', 'src/engine/hooks']) {
      walk(shellDir)
    }
    expect(
      offenders,
      'Import estático de @react-three en el SHELL (providers/effects/motion/hooks): ' +
        `${offenders.join(', ')}. Eso arrastra vendor-three (233 kB gzip) al chunk de entrada ` +
        'de TODAS las rutas — exactamente la fuga 7A-01 que Fase 7B erradicó. ' +
        'Las escenas 3D viven en engine/scene/ y se cargan vía lazy().',
    ).toEqual([])
  })

  it('8B/H-01a: el barrel del engine NO reexporta módulos de escena (scene/* ni SceneMount)', () => {
    // Escenario E3 de la auditoría suprema: reexportar `SceneMount` (o cualquier
    // módulo de engine/scene/) desde el barrel deja el grafo de escenas
    // alcanzable desde main.jsx/App.jsx, que importan del barrel — exactamente
    // la 2ª cadena de la fuga 7A-01, que el guard original no veía porque
    // SceneMount.jsx no importa @react-three directamente (el 3D está en su
    // lazy hacia Scene3D).
    const barrel = readFileSync('src/engine/index.js', 'utf8')
    const offenders = barrel
      .split('\n')
      .map((line, i) => ({ line, i }))
      .filter(({ line }) => /^\s*export\b/.test(line) && /['"]\.{1,2}\/scene\//.test(line))
    expect(
      offenders.map(({ line, i }) => `línea ${i + 1}: ${line.trim()}`),
      'El barrel de engine reexporta módulos de escena. Eso hace el grafo 3D ' +
        'alcanzable desde el shell (main.jsx/App.jsx importan del barrel) y puede ' +
        'reintroducir la fuga 7A-01. Los módulos de escena se consumen por ruta ' +
        'directa (import ... from "../engine/scene/SceneMount.jsx").',
    ).toEqual([])
  })

  it('8B/H-01b: ninguna página importa infraestructura de escena (engine/scene/* ni SceneMount) sin allowlist', () => {
    // Escenario E4: una página que importa SceneMount directamente arrastra el
    // chunk de escena (y su lazy hacia vendor-three) a la ruta, aunque no pase
    // `scene=`. La allowlist está VACÍA: llenarla exige un registro de admisión
    // APPROVED en 3D-ADMISSION-RECORD.md, citado aquí.
    const SCENE_IMPORT_ALLOWLIST = Object.freeze([
      { file: 'Home.jsx', admission: 'PLAN_3D_INMERSIVO.md#hero', state: 'APPROVED' },
      { file: 'About.jsx', admission: 'PLAN_3D_INMERSIVO.md#globe', state: 'APPROVED' },
      { file: 'ParkourAcademy.jsx', admission: 'PLAN_3D_INMERSIVO.md#parkour', state: 'APPROVED' },
      { file: 'AppExperience.jsx', admission: 'PLAN_3D_INMERSIVO.md#showcase', state: 'APPROVED' },
  { file: 'Programs.jsx', admission: 'PLAN_3D_INMERSIVO.md#showroom', state: 'APPROVED' },
])
    const offenders = []
    const bannedPath = /['"]\.{1,2}(\/\.\.)*\/engine\/scene\/|['"]\.{1,2}\/scene\//
    for (const file of pageFiles()) {
      const src = readFileSync(join(PAGES_DIR, file), 'utf8')
      // import ... from ".../engine/scene/..." o ".../scene/SceneMount..."
      const importRe = /import\s[^;]*?from\s+['"]([^'"]+)['"]/g
      let m
      while ((m = importRe.exec(src)) !== null) {
        if (bannedPath.test(m[1]) || /SceneMount|Scene3D/.test(m[1])) {
          if (!SCENE_IMPORT_ALLOWLIST.some((e) => e.file === file)) offenders.push(`${file} <- ${m[1]}`)
        }
      }
    }
    expect(
      offenders,
      'Estas páginas importan infraestructura de escena 3D directamente: ' +
        `${offenders.join(', ')}. Montar una escena exige pasar por PageHero ` +
        '(prop scene=, vigila otro test) con registro de admisión APPROVED, ' +
        'no importar el módulo de escena a mano. Ver FASE7B-EXECUTION-REPORT.md H-01.',
    ).toEqual([])
  })

  it('9.2-B: ninguna animación infinita de grain/textura global está activa (presupuesto de efectos permanentes)', () => {
    // Guard del experimento 9.2-B: la animación grain-shift infinita carryaba
    // TODO el delta de coste de composición MEDIDO EN EL LABORATORIO (58ms vs
    // 18.5ms scroll desktop, 220 vs 8 dropped; 3 muestras, ver
    // artifacts/fase9/9.2-b/metadata.json). Este test impide reintroducir
    // CUALQUIER animación infinita sobre los overlays de textura globales
    // (body::after o GrainOverlay) sin pasar por un nuevo experimento con
    // medición. La textura estática no mostró delta material en ese entorno
    // (GPU física: NO MEDIDA).
    const cssFiles = []
    const walk = (dir) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, entry.name)
        if (entry.isDirectory()) walk(p)
        else if (entry.name.endsWith('.css')) cssFiles.push(p)
      }
    }
    walk('src/styles')
    cssFiles.push('src/overrides.css', 'src/styles.css')
    const offenders = []
    for (const file of cssFiles) {
      const src = readFileSync(file, 'utf8')
      // animación infinita declarada sobre body::after o selectores de grain
      const grainAnim = /body::after[^{]*\{[^}]*(?:animation[^;]*infinite|animation-name[^;]*grain)/s
      if (grainAnim.test(src)) offenders.push(file)
      // cualquier keyframe llamado grain-* vivo + usado en infinite
      if (/grain[^{]*\{[^}]*animation[^;]*infinite/s.test(src)) offenders.push(file)
    }
    expect(
      offenders,
      'Animación infinita de grain global detectada en ' + offenders.join(', ') +
        '. El presupuesto 9.2-B la retiró por medición (ver artifacts/fase9/9.2-b/metadata.json); ' +
        'reintroducirla exige un nuevo experimento con evidencia.',
    ).toEqual([])
  })

  it('9.2-C: artifacts/fase7a congelado como evidencia histórica de 7A (ningún spec puede sobrescribirla)', () => {
    // Gobernanza de evidencia 9.2-C: entre 7A y 9.2-B los afterAll de los specs
    // de medición sobrescribieron artifacts/fase7a 12+ veces (la corrida 9.2-B
    // reemplazó 3.852 líneas de la evidencia 7A). La evidencia original (fuga
    // 7A-01 viva, 18/18 rutas) fue restaurada desde 438ba3b. Este guard
    // mantiene el freeze: si un spec vuelve a apuntar su afterAll a
    // artifacts/fase7a, o introduce un writer directo a un namespace de fase
    // congelado, el test se pone rojo. Las corridas "latest" deben escribir en
    // artifacts/latest/ (gitignored) y promoverse con EVIDENCE_NAMESPACE.
    const frozenDirs = ['artifacts/fase7a', 'artifacts/fase9']
    const offenders = []
    for (const spec of readdirSync('e2e')) {
      if (!spec.endsWith('.spec.js')) continue
      const src = readFileSync(join('e2e', spec), 'utf8')
      // Escritura literal (path entre comillas) a un namespace congelado.
      if (/(writeFileSync|mkdirSync)\s*\(\s*['"`](artifacts\/fase7a|artifacts\/fase9)\b/.test(src)) {
        offenders.push(`${spec}: escribe directamente a un namespace congelado`)
      }
      // Cualquier ruta de evidencia hardcodeada que NO sea artifacts/latest.
      const literalDirs = [...src.matchAll(/['"`](artifacts\/[\w./-]+)['"`]/g)].map((m) => m[1])
      for (const dir of literalDirs) {
        const root = dir.replace(/\/[^/]+$/, '')
        if (frozenDirs.includes(root)) {
          offenders.push(`${spec}: path de evidencia hardcodeado a ${root}`)
        }
      }
    }
    expect(
      offenders,
      'Congelación de evidencia violada: ' + offenders.join('; ') +
        '. Los specs de medición deben escribir en artifacts/latest (o via ' +
        'EVIDENCE_NAMESPACE); los namespaces congelados se restauran con git.',
    ).toEqual([])
  })

  it('plan §11: la matriz de formatos verticales está declarada en los dos instrumentos', () => {
    // El plan exige un vertical propio (430×932) además de la revisión en 390×844 y
    // 360×800. Es un requisito CON forma: se cumple midiéndose en esos cuadros, no
    // declarando que se cumple. Se guarda aquí porque el atajo obvio ante un
    // encuadre rojo en 360 es borrar el formato de la matriz — y eso deja verde una
    // evidencia que ya no mide lo que el plan pidió.
    const instruments = {
      'scripts/lab-greybox-projection.mjs': 'proyección geométrica',
      'e2e/lab-spatial.spec.js': 'capturas en navegador',
    }
    const required = ['430x932', '390x844', '360x800']
    for (const [file, label] of Object.entries(instruments)) {
      const src = readFileSync(file, 'utf8')
      const declared = formatsOf(src)
      expect(declared.length, `${file}: no encuentra la matriz de formatos`).toBeGreaterThan(0)
      for (const size of required) {
        expect(
          declared.some((format) => format.id.endsWith(size)),
          `${label} (${file}) perdió el formato ${size}: la matriz debe decir id, width y height`,
        ).toBe(true)
      }
      // Que el id no mienta: un '430x932' con 430×500 medría otra cosa y lo
      // llamaríamos vertical propio.
      for (const format of declared) {
        const dims = format.id.match(/(\d+)x(\d+)$/)
        if (dims) {
          expect(format.width, `${file}: ${format.id} declara un ancho distinto del de su id`).toBe(Number(dims[1]))
          expect(format.height, `${file}: ${format.id} declara un alto distinto del de su id`).toBe(Number(dims[2]))
        }
      }
    }
  })

  it('plan §11: afilar el recorte no se hace bajando el margen mínimo del instrumento', () => {
    // `marginMin` es el suelo contra el roce accidental con el borde del cuadro. El
    // camino fácil para que 27/27 salgan verdes es tocar el suelo; el camino correcto
    // es mover la cámara. Si este test se pone rojo, la conversación es «¿por qué
    // hace falta menos aire?», y la respuesta tiene que estar en un documento.
    const src = readFileSync('scripts/lab-greybox-projection.mjs', 'utf8')
    const marginMin = Number(src.match(/marginMin:\s*([\d.]+)/)?.[1])
    expect(Number.isFinite(marginMin), 'el instrumento dejó de declarar marginMin').toBe(true)
    expect(marginMin).toBeGreaterThanOrEqual(0.05)
  })

  it.skipIf(!existsSync('artifacts/fase9/9.2-b/metadata.json'))('9.2-C: el manifest del experimento grain existe y sus SHAs existen en la historia del repo', () => {
    // El manifest (artifacts/fase9/9.2-b/metadata.json) es la respuesta a
    // "¿qué código exacto produjo esta medición?": experimento (ce74bb8),
    // evidencia (624b06f) y reporte (cafc915) reconciliados. Sin él, en 6
    // meses los JSON del namespace serían datos sin dueño.
    const manifest = JSON.parse(readFileSync('artifacts/fase9/9.2-b/metadata.json', 'utf8'))
    expect(manifest.experiment_id).toBe('grain-budget-9.2-B')
    expect(manifest.decision).toBe('REMOVE ANIMATION ONLY')
    expect(manifest.shas.source_commit).toBe('6652392')
    expect(manifest.shas.experiment_commit).toBe('ce74bb8')
    expect(manifest.shas.evidence_commit).toBe('624b06f')
    expect(manifest.shas.report_commit).toBe('cafc915')
    // Limitaciones obligatorias: el manifest nunca puede presentarse como
    // evidencia universal si no declara qué NO midió.
    expect(Array.isArray(manifest.limitations)).toBe(true)
    expect(manifest.limitations.length).toBeGreaterThan(0)
  })

  it('7B: los ÚNICOS archivos de producción con import de @react-three son los módulos de escena (lazy)', () => {
    // Inventario cerrado post-7B: exactamente estos 5 archivos (todos dentro
    // de engine/scene/, todos alcanzables SOLO vía lazy()). Si aparece uno
    // nuevo en cualquier otra carpeta, este test se pone rojo.
    const found = []
    const walk = (dir) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, entry.name)
        if (entry.isDirectory()) walk(p)
        else if (/\.(js|jsx)$/.test(entry.name) && !p.includes('.test.')) {
          const src = readFileSync(p, 'utf8')
          if (/from\s+['"]@react-three\/(fiber|drei|postprocessing)['"]/.test(src)) found.push(p)
        }
      }
    }
    walk('src')
    const norm = (p) => p.replace(/\\/g, '/')
    const foundNorm = found.map(norm).sort()
    const expected = [
      // Globe3D.jsx: globo WebGL DORMANTE (sin importadores de producción, verificado
      // en FASE7A-FORENSIC.md C.2) — patrón de referencia de fallback accesible.
      'src/components/Globe3D.jsx',
      // Los 5 módulos de escena originales del engine: alcanzables SOLO vía lazy().
      'src/engine/scene/InstancedCluster.jsx',
      'src/engine/scene/ParticleField.jsx',
      'src/engine/scene/PostProcessing.jsx',
      'src/engine/scene/Scene3D.jsx',
      'src/engine/scene/SignatureGeometry.jsx',
      // Lote 2 (D-009): la maqueta del laboratorio. Mismo contrato que las
      // anteriores: vive en engine/scene/ y SOLO se alcanza vía lazy() del
      // registro. No es una admisión pública (ver los dos testes de arriba).
      'src/engine/scene/TrajectoryScene.jsx',
      // Nuevas escenas 3D aprobadas en Fase 11 (PLAN_3D_INMERSIVO.md).
      // Todas viven en engine/scene/ y se cargan SOLO vía lazy().
      'src/engine/scene/GlobeScene.jsx',
      // Chapter 02 — mapa 3D geográfico conectado por lazy() al módulo editorial.
      'src/engine/scene/StoryGlobeScene.jsx',
      'src/engine/scene/HeroScene.jsx',
      'src/engine/scene/HologramCard.jsx',
      'src/engine/scene/ParkourScene.jsx',
      'src/engine/scene/PhoneScene.jsx',
      'src/engine/scene/ShowroomScene.jsx',
      // 2026-09-20 SUMINISTRO bayona-3d-supply APROBADO por Sebastián.
      // Todas viven en engine/scene/ y se cargan SOLO vía lazy() del registro.
      'src/engine/scene/BarbellScene.jsx',
      'src/engine/scene/BenchScene.jsx',
      'src/engine/scene/BridgeScene.jsx',
      'src/engine/scene/DumbbellRackScene.jsx',
      'src/engine/scene/HabitatScene.jsx',
      'src/engine/scene/IntervalTimerScene.jsx',
      'src/engine/scene/KettlebellScene.jsx',
      'src/engine/scene/LevelsScene.jsx',
      'src/engine/scene/MethodScene.jsx',
      'src/engine/scene/ObjectInspector.jsx',
      'src/engine/scene/PlateTreeScene.jsx',
      'src/engine/scene/PlyoBoxScene.jsx',
      'src/engine/scene/PullUpBarScene.jsx',
      'src/engine/scene/PunchBagScene.jsx',
      'src/engine/scene/RecoveryKitScene.jsx',
      'src/engine/scene/ScaleScene.jsx',
      'src/engine/scene/StudioEnvironment.jsx',
      'src/engine/scene/TimelineScene.jsx',
      'src/engine/scene/VaultScene.jsx',
      'src/engine/scene/WeightStackScene.jsx',
    ].sort()
    expect(
      foundNorm,
      'Inventario de archivos con import de @react-three cambió. Los únicos ' +
        'legítimos son los módulos de engine/scene/ (cargan lazy) y Globe3D.jsx. ' +
        'Si añadiste uno, debe vivir en engine/scene/ y ser alcanzable SOLO vía lazy() ' +
        '— o registrar la excepción con el arquitecto (PLAN_3D_INMERSIVO.md).',
    ).toEqual(expected)
  })
})
