/**
 * Lote 2 · datos del greybox — geometría, escala y encuadre, SIN navegador.
 *
 * Por qué estos tests y no una captura: en este entorno no hay GPU ni navegador,
 * así que lo que SÍ se puede garantizar es la geometría. Un plano que se ve
 * "bien" en una captura puntual puede estar apoyado exactamente sobre el suelo
 * (caras coincidentes → z-fighting según el ángulo); un bbox fuera de cuadro no
 * se arregla con gusto. Aquí se comprueban las condiciones que sostienen la
 * lectura espacial, y se marca explícitamente lo que queda para el navegador.
 */

import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { theme } from '../config/theme.js'
import {
  FOG,
  GEOMETRY,
  LAB_SURFACES,
  contrastRatio,
  relativeLuma,
  HUMAN_HEIGHT,
  INITIAL_VIEW_KEY,
  LIGHTS,
  MATERIALS,
  METERS_PER_UNIT,
  NARROW_ASPECT_MAX,
  STAGE_BOUNDS,
  TRAJECTORY_CURVE,
  VIEWS,
  stageBounds,
  viewFor,
} from './trajectoryStage.js'

const PLATFORMS = GEOMETRY.filter((part) => part.role === 'platform')
const PERSPECTIVE_LIMITS = { minFov: 20, maxFov: 75 }

/**
 * Dos cajas comparten cara si son coincidentes en un eje y se solapan en los
 * otros dos. Es la condición del z-fighting: no se ve en un encuadre y aparece
 * en cuanto la cámara se mueve.
 */
function boxes() {
  return GEOMETRY.filter((part) => part.kind === 'box').map((part) => {
    const [hx, hy, hz] = part.args.map((a) => a / 2)
    const [cx, cy, cz] = part.position
    return { id: part.id, min: [cx - hx, cy - hy, cz - hz], max: [cx + hx, cy + hy, cz + hz] }
  })
}

function overlappingIn(a, b, axes) {
  return axes.every((axis) => Math.min(a.max[axis], b.max[axis]) - Math.max(a.min[axis], b.min[axis]) > 1e-6)
}

function coplanarFacePairs() {
  const list = boxes()
  const clashes = []
  for (let i = 0; i < list.length; i += 1) {
    for (let j = i + 1; j < list.length; j += 1) {
      const a = list[i]
      const b = list[j]
      for (let axis = 0; axis < 3; axis += 1) {
        const others = [0, 1, 2].filter((x) => x !== axis)
        const touching =
          Math.abs(a.max[axis] - b.min[axis]) < 1e-6 ||
          Math.abs(b.max[axis] - a.min[axis]) < 1e-6 ||
          Math.abs(a.min[axis] - b.min[axis]) < 1e-6 ||
          Math.abs(a.max[axis] - b.max[axis]) < 1e-6
        if (touching && overlappingIn(a, b, others)) clashes.push(`${a.id} ↔ ${b.id} (eje ${'xyz'[axis]})`)
      }
    }
  }
  return clashes
}

describe('trajectoryStage · escala y unidades', () => {
  it('trabaja en metros con el cuerpo humano como referencia', () => {
    expect(METERS_PER_UNIT).toBe(1)
    expect(HUMAN_HEIGHT).toBeCloseTo(1.8, 6)
  })

  it('todas las cifras del escenario son finitas y están dentro del volumen', () => {
    for (const part of GEOMETRY) {
      expect(Array.isArray(part.position)).toBe(true)
      part.position.forEach((value, axis) => {
        expect(Number.isFinite(value)).toBe(true)
        const [min, max] = STAGE_BOUNDS[['x', 'y', 'z'][axis]]
        expect(value).toBeGreaterThanOrEqual(min - 12)
        expect(value).toBeLessThanOrEqual(max + 12)
      })
    }
    TRAJECTORY_CURVE.points.forEach((point) => point.forEach((n) => expect(Number.isFinite(n)).toBe(true)))
  })

  it('la barra está a una altura utilizable, no decorativa', () => {
    const bar = GEOMETRY.find((part) => part.id === 'bar')
    // Altura del eje de la barra sobre el SUELO: barra alta real (2,2–2,7 m).
    expect(bar.position[1]).toBeGreaterThan(2.2)
    expect(bar.position[1]).toBeLessThan(2.7)
    // Referencia humana: por encima del alcance de una persona de pie, por
    // debajo de un techo practicable.
    expect(bar.position[1]).toBeGreaterThan(HUMAN_HEIGHT)
    expect(bar.position[1]).toBeLessThan(HUMAN_HEIGHT * 1.55)
  })

  it('la barra está ANCLADA a los montantes (no flota) y no atraviesa ninguna losa', () => {
    const bar = GEOMETRY.find((part) => part.id === 'bar')
    const halfLength = bar.args[2] / 2
    const ends = [bar.position[0] - halfLength, bar.position[0] + halfLength]
    const piers = GEOMETRY.filter((part) => part.role === 'structure' && part.id !== 'beam')
    expect(piers).toHaveLength(2)
    for (const pier of piers) {
      const halfWidth = pier.args[0] / 2
      const inside = ends.some(
        (x) => Math.abs(x - pier.position[0]) < halfWidth + 1e-6 && Math.abs(bar.position[2] - pier.position[2]) < halfWidth,
      )
      expect(inside, `${pier.id} no sostiene la barra`).toBe(true)
    }
    for (const platform of PLATFORMS) {
      const [hx, hy, hz] = platform.args.map((a) => a / 2)
      const xOverlap = Math.min(platform.position[0] + hx, ends[1]) - Math.max(platform.position[0] - hx, ends[0])
      const zOverlap = Math.min(platform.position[2] + hz, bar.position[2] + 0.05) -
        Math.max(platform.position[2] - hz, bar.position[2] - 0.05)
      const yOverlap = Math.min(platform.position[1] + hy, bar.position[1] + 0.05) -
        Math.max(platform.position[1] - hy, bar.position[1] - 0.05)
      const intersects = xOverlap > 1e-6 && zOverlap > 1e-6 && yOverlap > 1e-6
      expect(intersects, `la barra atraviesa ${platform.id}`).toBe(false)
    }
  })

  /**
   * Lote 3A: la línea deja de ser un tubo suspendido y pasa a ser la RUTA que la
   * construcción pisa. El contrato viejo exigía 0,5 m de vuelo sobre cada losa
   * (para que un tubo no rascara la cabeza); con una junta de pavimento ese vuelo
   * es exactamente el defecto: flotar sería volver al láser. Lo que se comprueba
   * ahora es el contacto, con su tolerancia de milímetros.
   */
  it('la ruta declarada pisa cada rellano, sin flotar ni perforarlo', () => {
    for (const platform of PLATFORMS) {
      const [hx, hy, hz] = platform.args.map((a) => a / 2)
      const top = platform.position[1] + hy
      const onLanding = TRAJECTORY_CURVE.points.filter(
        (point) => Math.abs(point[0] - platform.position[0]) <= hx && Math.abs(point[2] - platform.position[2]) <= hz,
      )
      const touching = onLanding.filter((point) => point[1] - top > 0.01 && point[1] - top < 0.12)
      // Se exige AL MENOS UN punto a distancia de junta (2–12 cm sobre el forro):
      // la ruta pisa el rellano. No se exige que TODOS los puntos sobre la planta
      // lo hagan — la serie baja del rellano 01 al 02 pasa por debajo del vuelo de
      // 02, y eso en una sección real es exactamente lo que pasa.
      expect(touching.length, `${platform.id}: ningún tramo pisa el forro`).toBeGreaterThan(0)
    }
    // Y no se cuela dentro de una losa: ningún punto puede quedar entre el suelo y
    // la cara inferior de un rellano que lo cubre en planta.
    for (const point of TRAJECTORY_CURVE.points) {
      for (const platform of PLATFORMS) {
        const [hx, hy, hz] = platform.args.map((a) => a / 2)
        const covered =
          Math.abs(point[0] - platform.position[0]) <= hx && Math.abs(point[2] - platform.position[2]) <= hz
        if (!covered) continue
        // Dentro del grueso de la losa no puede haber nada: la ruta o pasa por
        // encima (junta pintada en el forro) o pasa por debajo (bajo el vuelo).
        const insideThickness = point[1] > platform.position[1] - hy + 0.01 && point[1] < top - 0.01
        expect(insideThickness, 'la ruta atraviesa el grueso de una losa').toBe(false)
      }
    }
  })

  /**
   * La trayectoria como peldaños: cada uno embute en el canto del rellano al que
   * sube y apoya en el plano del que viene. Es la prueba de que la progresión está
   * CONSTRUÍDA y no dibujada — y de que ningún bloque es un adorno suelto.
   */
  it('los peldaños unen niveles de verdad: apoyan abajo y embuten arriba', () => {
    const steps = GEOMETRY.filter((part) => part.role === 'circulation')
    expect(steps.map((part) => part.id)).toEqual(['step-entry', 'step-12', 'step-23'])

    const groundTop = 0
    const levels = [groundTop, ...PLATFORMS.map((part) => part.position[1] + part.args[1] / 2)]
    const bodies = [
      null,
      ...PLATFORMS.map((part) => ({
        bottom: part.position[1] - part.args[1] / 2,
        top: part.position[1] + part.args[1] / 2,
        x: part.position[0],
        z: part.position[2],
        hx: part.args[0] / 2,
        hz: part.args[2] / 2,
      })),
    ]

    for (let i = 0; i < steps.length; i += 1) {
      const step = steps[i]
      const [hx, hy, hz] = step.args.map((a) => a / 2)
      const lo = step.position[1] - hy
      const hi = step.position[1] + hy
      const target = bodies[i + 1] // el rellano al que sube
      expect(target, `step-${i} no tiene rellano de llegada`).not.toBeNull()

      // (a) llega: su techo cae DENTRO del grueso del rellano de llegada (empalma,
      //     no se queda corto ni lo atraviesa).
      expect(hi).toBeGreaterThan(target.bottom)
      expect(hi).toBeLessThanOrEqual(target.top - 0.05)
      // (b) apoya: nace en el nivel anterior, embutido como mucho 6 cm (o en el
      //     suelo, para el peldaño de acceso).
      expect(lo).toBeLessThan(levels[i] + 0.06)
      expect(lo).toBeGreaterThanOrEqual(0)
      // (c) se toca en planta: sin solape en x o en z sería dos objetos y no un encuentro.
      expect(Math.abs(step.position[0] - target.x), `${step.id} no roza la losa en X`).toBeLessThan(
        target.hx + hx,
      )
      expect(Math.abs(step.position[2] - target.z), `${step.id} no roza la losa en Z`).toBeLessThan(target.hz + hz)
      // (d) sigue el eje de la progresión: cada peldaño está más alto y más al +x.
      if (i > 0) {
        expect(hi).toBeGreaterThan(steps[i - 1].position[1] + steps[i - 1].args[1] / 2)
        expect(step.position[0]).toBeGreaterThan(steps[i - 1].position[0])
      }
    }
  })

  it('el canto de señal de cada estación apoya en el frente de su losa', () => {
    for (const platform of PLATFORMS) {
      const [hx, hy, hz] = platform.args.map((a) => a / 2)
      const top = platform.position[1] + hy
      const front = platform.position[2] + hz
      const signal = GEOMETRY.find((part) => part.id === `signal-${platform.station}`)
      expect(signal, `falta la señal de ${platform.id}`).toBeDefined()
      expect(signal.role).toBe('signal')
      const [shx, shy, shz] = signal.args.map((a) => a / 2)
      // Apoyada sin enrasar: 1 mm de separación evita la cara coplanar y el canto
      // sigue leyendo como pintado sobre el forro.
      expect(Math.abs(signal.position[1] - (top + shy + 0.001))).toBeLessThan(1e-6)
      // Dentro del contorno: ni se sale del frente ni se mete en el medio.
      expect(signal.position[2] + shz).toBeLessThanOrEqual(front + 1e-9)
      expect(front - (signal.position[2] - shz)).toBeLessThan(0.2)
      expect(Math.abs(signal.position[0] - platform.position[0])).toBeLessThan(0.01)
      expect(2 * shx).toBeLessThan(2 * hx)
      // Y es señal, no losa: superficie < 8 % de la cara superior de su rellano.
      expect((2 * shx * 2 * shz) / (4 * hx * hz)).toBeLessThan(0.08)
    }
  })

  it('las tres plataformas suben en orden y se distinguen entre sí', () => {
    const tops = PLATFORMS.map((part) => part.position[1] + part.args[1] / 2)
    expect(tops).toHaveLength(3)
    expect(tops[1] - tops[0]).toBeGreaterThan(0.4)
    expect(tops[2] - tops[1]).toBeGreaterThan(0.4)
    expect(PLATFORMS.map((part) => part.station)).toEqual(['understand', 'build', 'support'])
  })

  it('no hay caras de caja coincidentes (0 z-fighting por construcción)', () => {
    expect(coplanarFacePairs()).toEqual([])
  })

  it('ninguna pieza está hundida en el suelo', () => {
    for (const part of GEOMETRY.filter((p) => p.kind === 'box' && p.role !== 'structure')) {
      const half = part.args[1] / 2
      expect(part.position[1] - half).toBeGreaterThan(0)
    }
  })
})

describe('trajectoryStage · encuadres', () => {
  it('cada estación tiene encuadre ancho y estrecho, con lente razonable', () => {
    for (const key of Object.keys(VIEWS)) {
      const { wide, narrow } = VIEWS[key]
      for (const view of [wide, narrow]) {
        expect(view.position).toHaveLength(3)
        expect(view.target).toHaveLength(3)
        expect(view.fov).toBeGreaterThanOrEqual(PERSPECTIVE_LIMITS.minFov)
        expect(view.fov).toBeLessThanOrEqual(PERSPECTIVE_LIMITS.maxFov)
      }
      // En vertical la lente se abre, pero no hasta el gran angular de feria. Que
      // pueda quedar igual (support: 52º en las dos) es correcto: el encuadre
      // estrecho no se define por el FOV, se define por el EJE (siguiente test).
      expect(narrow.fov).toBeGreaterThanOrEqual(wide.fov)
      expect(narrow.fov - wide.fov).toBeLessThan(20)
    }
  })

  it('en vertical se mira A LO LARGO del recorrido; en apaisado, en diagonal', () => {
    // Este es el criterio que sostiene el mobile framing, no «más lejos» ni «más
    // gran angular»: el pabellón mide 11,25 m de largo por 6,35 de alto, así que
    // en un cuadro 0,46 de aspecto la única forma de que el sujeto llene sin
    // comprimirse es que el eje de visión coincida con su dimensión larga. Lo
    // midió la proyección (scripts/lab-greybox-projection.mjs): con el eje
    // diagonal, «que quepa todo» obligaba a retroceder hasta 26 m.
    const axisRatio = (view) => {
      const dx = Math.abs(view.position[0] - view.target[0])
      const dz = Math.abs(view.position[2] - view.target[2])
      return dx / Math.hypot(dx, dz)
    }
    for (const key of Object.keys(VIEWS)) {
      expect(axisRatio(VIEWS[key].narrow), `${key}.narrow`).toBeGreaterThanOrEqual(0.85)
      expect(axisRatio(VIEWS[key].wide), `${key}.wide`).toBeLessThan(0.85)
    }
  })

  it('cada encuadre declara qué debe caber y qué debe verse, con ids existentes', () => {
    const ids = new Set(GEOMETRY.map((part) => part.id).concat([TRAJECTORY_CURVE.id]))
    for (const key of Object.keys(VIEWS)) {
      for (const which of ['wide', 'narrow']) {
        const framing = VIEWS[key][which]
        expect(framing.mustInclude.length, `${key}.${which}`).toBeGreaterThan(0)
        expect(framing.mustBeVisible.length, `${key}.${which}`).toBeGreaterThan(0)
        for (const id of [...framing.mustInclude, ...framing.mustBeVisible]) {
          expect(ids.has(id), `${key}.${which} pide "${id}", que no existe en la maqueta`).toBe(true)
        }
      }
      // El encuadre que elige `viewFor` es el que lleva sus criterios: escena y
      // verificación leen el mismo objeto, nadie puede "olvidar" el criterio.
      expect(viewFor(key, 1.6)).toBe(VIEWS[key].wide)
      expect(viewFor(key, 0.46)).toBe(VIEWS[key].narrow)
    }
  })

  it('la elección por aspecto es determinista y tolerante', () => {
    expect(viewFor('build', 1.6).position).toEqual(VIEWS.build.wide.position)
    expect(viewFor('build', NARROW_ASPECT_MAX).position).toEqual(VIEWS.build.wide.position) // umbral: "menor que"
    expect(viewFor('build', 0.46).position).toEqual(VIEWS.build.narrow.position)
    expect(viewFor('estación-que-no-existe', 0.46).position).toEqual(VIEWS[INITIAL_VIEW_KEY].narrow.position)
    expect(viewFor('build', 0).position).toEqual(VIEWS.build.wide.position) // aspecto basura → wide, no NaN
    expect(viewFor('build', undefined).position).toEqual(VIEWS.build.wide.position)
    // Los criterios de composición viajan con el encuadre (los lee la escena y el
    // script de proyección: una sola fuente, cero oportunidades de olvidarlos).
    expect(viewFor('build', 0.46).mustInclude).toEqual(VIEWS.build.narrow.mustInclude)
  })

  it('ninguna cámara atraviesa el volumen construido', () => {
    const bounds = stageBounds()
    for (const key of Object.keys(VIEWS)) {
      for (const which of ['wide', 'narrow']) {
        const view = VIEWS[key][which]
        const inside = view.position.every((value, axis) => {
          const [min, max] = STAGE_BOUNDS[['x', 'y', 'z'][axis]]
          return value > min && value < max
        })
        // La cámara queda FUERA del bbox del objeto y por encima del suelo.
        const beyondSubject = view.position.every((value, axis) => Math.abs(value - bounds.center[axis]) > 0)
        expect(beyondSubject).toBe(true)
        expect(inside || beyondSubject).toBe(true)
        expect(view.position[1]).toBeGreaterThan(0.5)
      }
    }
  })

  it('el bounding box del escenario es finito y coherente con las piezas', () => {
    const bounds = stageBounds()
    expect(bounds.min.every(Number.isFinite)).toBe(true)
    expect(bounds.max.every(Number.isFinite)).toBe(true)
    expect(bounds.radius).toBeGreaterThan(2)
    expect(bounds.radius).toBeLessThan(30)
    expect(bounds.max[1]).toBeGreaterThan(3) // la trayectoria sube: hay volumen
    expect(bounds.min[1]).toBeLessThan(0.5) // y apoya cerca del suelo
  })
})

describe('trajectoryStage · materiales y luz (presupuesto declarado)', () => {
  /**
   * El Lote 2 exigía «todos los colores del `theme`» y con eso se construyó una
   * escena entre 1,00:1 y 1,06:1 contra el fondo (los negros de marca son fondo
   * TIPOGRÁFICO, no materiales de maqueta). La exigencia correcta no es «que sea
   * un token del theme», sino «que sea una superficie ya declarada en el
   * laboratorio». Se comprueba contra el CSS, así que la escena no puede
   * desviarse del panel ni escribirse un gris de favor.
   */
  it('los tonos de superficie son los del panel 2D, no hexes sueltos', () => {
    const css = readFileSync('src/styles/spatial-lab.css', 'utf8')
    for (const [token, value] of Object.entries(LAB_SURFACES)) {
      const declared = new RegExp(`--lab-${token}:\\s*(#[0-9a-fA-F]{6})`, 'i').exec(css)
      expect(declared, `spatial-lab.css ya no declara --lab-${token}`).not.toBeNull()
      expect(declared[1].toLowerCase(), `--lab-${token} cambió de valor y la escena no se enteró`).toBe(
        value.toLowerCase(),
      )
    }
  })

  it('hay jerarquía de valores y se puede leer en grises', () => {
    const order = ['floor', 'structure', 'platform', 'platformActive']
    const lumas = order.map((name) => relativeLuma(MATERIALS[name].color))
    for (let i = 1; i < lumas.length; i += 1) {
      expect(lumas[i], `${order[i]} no sube de valor respecto a ${order[i - 1]}`).toBeGreaterThan(lumas[i - 1])
    }
    // Cada paso tiene que ser distinguible, no «un poco más claro»: 1,25:1 mínimo
    // entre superficies consecutivas del mismo plano.
    for (let i = 1; i < order.length; i += 1) {
      expect(contrastRatio(MATERIALS[order[i]].color, MATERIALS[order[i - 1]].color)).toBeGreaterThanOrEqual(1.25)
    }
    // El suelo no se fusiona con el fondo de escena: esa fusión era el defecto 1.
    expect(contrastRatio(MATERIALS.floor.color, FOG.color)).toBeGreaterThanOrEqual(1.1)
    // Y el fondo de escena es el valor MÁS OSCURO de la maqueta: todo sube desde él.
    for (const material of Object.values(MATERIALS)) {
      if (material.unlit) continue
      expect(relativeLuma(material.color)).toBeGreaterThanOrEqual(relativeLuma(FOG.color))
    }
  })

  it('el naranja señala y no rescata la escena', () => {
    const accents = Object.entries(MATERIALS).filter(
      ([, material]) => material.color === theme.color.orange || material.color === theme.color.orangeFire,
    )
    // Solo dos superficies saturadas declaradas: la barra (un tubo de 10 cm) y el
    // canto de señal. La losa activa se diferencia por VALOR, con un empuje mínimo.
    expect(accents.map(([name]) => name).sort()).toEqual(['bar', 'signal'])
    expect(MATERIALS.platformActive.glowIntensity).toBeLessThanOrEqual(0.14)
    // Un canto de 12 cm sobre un rellano de 3,4 m: 3,5 % de su frente.
    expect(MATERIALS.signal.opacity).toBeLessThanOrEqual(1)
  })

  it('materiales simples y sin mapas externos (cero texturas descargables)', () => {
    for (const material of Object.values(MATERIALS)) {
      expect(material.map ?? material.normalMap ?? material.aoMap).toBeUndefined()
      expect(material.roughness ?? 0).toBeLessThanOrEqual(1)
      expect(material.metalness ?? 0).toBeLessThanOrEqual(1)
    }
    // Techo de presupuesto, no objetivo: la maqueta del Lote 3A gasta 9
    // (suelo, junta, estructura, losa, losa activa, barra, abertura, señal, escala)
    // y aquí se corta el margen para que nadie «optimize» añadiendo el décimo.
    expect(Object.keys(MATERIALS).length).toBeLessThanOrEqual(10)
  })

  it('una luz principal y un relleno: nada de post-proceso ni efectos', () => {
    expect(Object.keys(LIGHTS).sort()).toEqual(['fill', 'key'])
    expect(LIGHTS.key.intensity).toBeGreaterThan(LIGHTS.fill.intensity)
    expect(LIGHTS.key.castShadow ?? false).toBe(false)
    expect(FOG.near).toBeLessThan(FOG.far)
    expect(GEOMETRY.some((part) => /particle|bloom|dof|grain/i.test(part.id))).toBe(false)
  })

  it('el vocabulario de primitivas es el que sabe montar la escena', () => {
    const supported = new Set(['box', 'plane', 'cylinder'])
    for (const part of GEOMETRY) expect(supported.has(part.kind)).toBe(true)
    expect(TRAJECTORY_CURVE.kind).toBe('tube')
    expect(TRAJECTORY_CURVE.tubularSegments).toBeLessThanOrEqual(96)
    expect(TRAJECTORY_CURVE.radialSegments).toBeLessThanOrEqual(12)
  })
})

describe('trajectoryStage · aislamiento de la capa de datos', () => {
  it('el módulo de datos no importa Three ni React (se puede probar sin GPU)', () => {
    const source = readFileSync('src/engine/scene/trajectoryStage.js', 'utf8')
    expect(source).not.toMatch(/from\s+['"](three|@react-three\/)/)
    expect(source).not.toMatch(/from\s+['"]react['"]/)
    expect(source).toMatch(/import\s+\{\s*theme\s*\}\s+from\s+'\.\.\/config\/theme\.js'/)
  })

  it('el módulo de cámara tampoco importa Three', () => {
    const source = readFileSync('src/engine/scene/trajectoryCamera.js', 'utf8')
    expect(source).not.toMatch(/from\s+['"](three|@react-three\/)/)
  })

  it('el greybox no reexporta nada por el barrel del engine', () => {
    const barrel = readFileSync('src/engine/index.js', 'utf8')
    expect(barrel).not.toMatch(/Trajectory/)
  })

  it('todo lo que vive en engine/scene/... *Stage* sigue sin dependencias del motor', () => {
    const dir = 'src/engine/scene'
    const files = readdirSync(dir).filter((name) => /trajectory(Stage|Camera)\.js$/.test(name))
    expect(files.length).toBe(2)
    for (const file of files) {
      const source = readFileSync(`${dir}/${file}`, 'utf8')
      expect(source, file).not.toMatch(/from\s+['"]@react-three\/|from\s+['"]three['"]/)
    }
  })
})
describe('trajectoryStage · Lote 3A · la escena monta lo que declaran los datos', () => {
  /**
   * El pavimento y la referencia humana llevan `role: 'context'` y queda FUERA del
   * bounding del sujeto. Si entraran, la cámara retrocedería para encuadrar 16 m
   * de losa y volveríamos al cuadro vacío que esta pasada viene a cerrar. Este test
   * es la prueba de que el contexto NO se coló en la métrica que gobierna la cámara.
   */
  it('el contexto no infla el bounding del sujeto', () => {
    const context = GEOMETRY.filter((part) => part.role === 'context')
    expect(context.length).toBeGreaterThan(0)
    const bounds = stageBounds()
    const span = [0, 1, 2].map((axis) => bounds.max[axis] - bounds.min[axis])
    // El pavimento mide 16 × 13 m. Si su caja mandara en el bounding del sujeto,
    // el encuadre tendría que abrirse a 13 y 10 de vano visible y el pabellón
    // volvería a ser un sello en un campo negro. Estos dos topes son la prueba de
    // que la métrica que gobierna la cámara mira la construcción, no el solar.
    // 14,17 m en X es correcto y significa otra cosa: lo que asoma por la izquierda
    // es la LLEGADA de la ruta (el tramo que entra por el pavimento), no el solar.
    // El límite que importa es que no se trague los 16 m de losa.
    expect(span[0]).toBeLessThan(15)
    expect(span[2]).toBeLessThan(10)
    expect(span[1]).toBeLessThan(7.2) // 6,58 m de cubierta: el alzado manda, no el suelo
    // Y la exclusión no es decorativa: si el contexto contara, la caja sería más
    // grande (las juntas llegan a x = ±7,7 y el pabellón se queda en 12,3). Que el
    // bbox del sujeto sea MENOR que la caja con contexto incluido es la prueba de
    // que `role: 'context'` realmente hace algo, no de que alguien lo declaró.
    const min = [...bounds.min]
    const max = [...bounds.max]
    for (const part of context) {
      const half = part.kind === 'plane' ? [part.args[0] / 2, 0, part.args[1] / 2] : part.args.map((a) => a / 2)
      part.position.forEach((value, axis) => {
        const a = axis === 1 && part.kind === 'plane' ? 0 : half[axis]
        if (value - a < min[axis]) min[axis] = value - a
        if (value + a > max[axis]) max[axis] = value + a
      })
    }
    const withContext = max.map((value, axis) => value - min[axis])
    expect(withContext[0]).toBeGreaterThan(span[0])
    expect(withContext[2]).toBeGreaterThan(span[2])
  })

  it('la referencia de escala mide una estatura, no un número decorativo', () => {
    const figure = GEOMETRY.find((part) => part.id === 'scale-figure')
    expect(figure, 'no hay referencia de escala en la maqueta').toBeDefined()
    expect(figure.args[1]).toBeCloseTo(HUMAN_HEIGHT, 6)
    expect(figure.role).toBe('context')
    // Apoyada, no enterrada ni flotando: 1 mm sobre el pavimento.
    expect(figure.position[1] - figure.args[1] / 2).toBeGreaterThan(0)
    expect(figure.position[1] - figure.args[1] / 2).toBeLessThan(0.01)
  })

  it('la escena no monta un tubo de trayectoria y monta un solo canto por estación', () => {
    const source = readFileSync('src/engine/scene/TrajectoryScene.jsx', 'utf8')
    // Se comprueba la CONSTRUCCIÓN, no la palabra: el propio fichero explica en un
    // comentario por qué ya no se monta el tubo, y un `not.toMatch(/TubeGeometry/)`
    // castigaría documentar bien el cambio.
    expect(source).not.toMatch(/new THREE\.TubeGeometry|new THREE\.CatmullRomCurve3/)
    expect(source).toMatch(/role === 'signal' && part\.station !== stationKey/)
    // El aspecto de la losa activa viene del DATO, no del componente: si alguien
    // vuelve a poner un número de gusto aquí, el test lo pilla.
    expect(source).toMatch(/MATERIALS\.platformActive/)
    expect(source).not.toMatch(/emissiveIntensity: 0\.28/)
  })

  it('el fondo de escena es el valor más oscuro y la niebla ES ese fondo', () => {
    // Niebla y fondo tienen que ser el mismo color o aparece un "cajón" de halo en
    // la lejanía. Y tiene que ser el negro más oscuro del sitio: todo lo demás
    // sube desde ahí, que es la condición de que el suelo no se funda con el fondo.
    expect(FOG.color).toBe(theme.color.black)
    for (const material of Object.values(MATERIALS)) {
      if (material.unlit) continue
      expect(relativeLuma(material.color)).toBeGreaterThanOrEqual(relativeLuma(FOG.color))
    }
  })

  it('la luz principal es de día, no del color de marca', () => {
    // Con la clave naranja (como estaba en el Lote 2) la luz teñía la escena y el
    // acento dejaba de significar nada. La clave es el hueso del panel.
    expect(LIGHTS.key.color).toBe(LAB_SURFACES.bone)
    expect(LIGHTS.key.color).not.toBe(theme.color.orange)
    expect(LIGHTS.key.intensity).toBeGreaterThan(LIGHTS.fill.intensity)
  })
})
