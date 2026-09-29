/**
 * BAYONA · Lote 2 — PROYECCIÓN GEOMÉTRICA DEL GREYBOX (sin navegador)
 * -------------------------------------------------------------------------
 * Qué es, dicho sin adornos: toma los MISMOS datos que monta
 * `TrajectoryScene.jsx` (`src/engine/scene/trajectoryStage.js`) y los proyecta
 * con la matemática de cámara de `three` (`PerspectiveCamera` +
 * `updateProjectionMatrix` + `project`), que es JS puro: los NÚMEROS de encuadre
 * son los que vería el runtime. Sobre esa proyección pinta un SVG con difuso
 * lambertiano de la luz clave y niebla por distancia, y lo rasteriza con
 * ImageMagick cuando el host tiene delegate.
 *
 * Lo que SÍ vale como evidencia:
 *   · composición, escala relativa y silueta del pabellón en los 9 viewports
 *     que declara `VIEWPORTS` (3 estaciones × 9 formatos = 27 proyecciones),
 *   · que el sujeto de cada estación quepa EN cuadro con margen,
 *   · que el cuadro esté lleno de arquitectura (un encuadre que cabe pero ocupa
 *     el 4 % de la pantalla no es un encuadre: es un diagrama),
 *   · que la línea de visión no atraviese geometría (segmento–AABB),
 *   · cuántas caras reciben luz (si la dirección de la luz no lee, sale aquí).
 *
 * Lo que NO vale, y no hay que llamarlo de otra manera:
 *   · NO es un render WebGL: sin PBR, specular, sombras, tone mapping, DPR, R3F
 *     ni antialiasing. Los cilindros se aproximan por su caja envolvente.
 *   · NO mide cadencia, GPU, memoria ni temperatura.
 *   · La validación visual con navegador real es `e2e/lab-spatial.spec.js`.
 *
 * Uso:
 *   node scripts/lab-greybox-projection.mjs [--out DIR]   comprobar y pintar
 *   node scripts/lab-greybox-projection.mjs --solve        proponer distancia/FOV
 *
 * Salida: 0 encuadres válidos · 1 hay que corregir · 2 error de entorno.
 */

import { execSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import * as THREE from 'three'

import {
  FOG,
  GEOMETRY,
  HUMAN_HEIGHT,
  LIGHTS,
  MATERIALS,
  NARROW_ASPECT_MAX,
  STATIONS_KEYS,
  TRAJECTORY_CURVE,
  VIEWS,
  relativeLuma,
  stageBounds,
  viewFor,
} from '../src/engine/scene/trajectoryStage.js'
import { theme } from '../src/engine/config/theme.js'

const argv = process.argv
const OUT = argv.includes('--out') ? argv[argv.indexOf('--out') + 1] : 'artifacts/latest/lab-greybox'

/**
 * `--with-route` superpone la curva de `TRAJECTORY_CURVE` en el SVG. Por defecto NO:
 * desde el Lote 3A la escena no monta un tubo de trayectoria (la progresión la
 * cuentan los peldaños), y dibujar en la proyección algo que el navegador no monta
 * falsea la lectura de líneas cruzando el cuadro.
 */
const DRAW_ROUTE = argv.includes('--with-route')
const SOLVE = argv.includes('--solve')

/**
 * Matriz de formatos revisados. No es un inventario de dispositivos: son los
 * tamaños con los que el plan §11 compromete el laboratorio — el vertical propio
 * (430×932) además de la revisión en 390×844 y 360×800, con la lógica responsive
 * que ya existe (`@media (max-width: 860px)` en el CSS y el corte de familia por
 * aspecto en `viewFor`).
 *
 * Qué aporta cada entrada vertical, dicho sin exagerar: 430×932 (aspecto 0,4614)
 * y 390×844 (0,4621) caen en la MISMA familia y difieren un 0,15 % de aspecto, así
 * que la cámara no cambia — `viewFor` selecciona por familia de aspecto, no por
 * píxeles. Lo que se comprueba aquí es otra cosa y es legítima: que los criterios
 * (margen, llenado, coherencia del recorte) siguen cumpliéndose en un cuadro más
 * alto y más ancho de lo que se venía midiendo, y que el eje largo del pabellón —no
 * un encogido al 70 %— es lo que sostiene el encuadre en ese formato. El 360×800
 * sí añade información de encuadre: su aspecto (0,4500) recorta más en horizontal
 * que el de 390, y es donde un margen de 0,05 deja de ser decorativo.
 */
const VIEWPORTS = [
  { id: 'desktop-1440x900', width: 1440, height: 900 },
  { id: 'laptop-1280x800', width: 1280, height: 800 },
  { id: 'horizontal-844x390', width: 844, height: 390 },
  { id: 'cuadrado-768x768', width: 768, height: 768 },
  { id: 'tablet-834x1112', width: 834, height: 1112 },
  { id: 'movil-390x844', width: 390, height: 844 },
  { id: 'movil-alto-430x932', width: 430, height: 932 },
  { id: 'movil-360x800', width: 360, height: 800 },
  { id: 'movil-estrecho-320x568', width: 320, height: 568 },
]

/**
 * Criterios de encuadre. Viven aquí y se citan en el JSON de evidencia, para que
 * «el encuadre pasa» no dependa de una impresión.
 *
 * · `marginMin` — que el sujeto respire: sin margen, un píxel de resize recorta.
 * · `fillMin` — el cuadro debe estar lleno de arquitectura, medido sobre TODO lo
 *   dibujado y no sobre el sujeto: un plano medio puede recortar una losa a
 *   propósito y seguir siendo un plano medio.
 * · `fovRange` — rango de lente creíble para arquitectura. Sin este tope el
 *   buscador «soluciona» cualquier encuadre con un ojo de pez a 74°, que cumple
 *   la aritmética y no cumple la mirada.
 * · `coherentRatioWide/Narrow` — qué fracción de las caras dibujadas cae en
 *   cuadro. El umbral es distinto por familia de aspecto porque en vertical el
 *   recorte es la herramienta; medir lo mismo con un solo listón empujaba a la
 *   cámara a 26 m y producía un pabellón del 4 % del alto.
 */
const CRITERIA = Object.freeze({
  marginMin: 0.05,
  fillMin: 0.3,
  coherentRatioWide: 0.62,
  coherentRatioNarrow: 0.5,
  fovRange: [34, 58],
  preferredFov: 46,
})

/**
 * Tonos base por material: un greybox se juzga por valor, no por color.
 *
 * Lote 3A: la tabla espejo que había aquí estaba ESCRITA A MANO con los valores
 * del Lote 2, así que en cuanto la escena cambió de materiales el script proyectaba
 * una escena que ya no existía. Se elimina la duplicación: la luminancia se calcula
 * sobre el hex que declara `MATERIALS`, y el tinte sobre si ese hex es o no el
 * acento de marca. Un solo dueño de los números.
 */
const BASE_LUMA = Object.freeze(
  Object.fromEntries(Object.entries(MATERIALS).map(([name, spec]) => [name, relativeLuma(spec.color)])),
)
const ACCENT_HEXES = new Set([theme.color.orange, theme.color.orangeFire].map((c) => String(c).toLowerCase()))
const isTinted = (material) => ACCENT_HEXES.has(String(MATERIALS[material]?.color ?? '').toLowerCase())

const clamp = (n, min, max) => Math.min(max, Math.max(min, n))
const insideNdc = (n) => n[0] > -1 && n[0] < 1 && n[1] > -1 && n[1] < 1

const CORNER_SIGNS = [
  [-1, -1, -1],
  [1, -1, -1],
  [1, 1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
  [1, -1, 1],
  [1, 1, 1],
  [-1, 1, 1],
]
const FACE_INDEX = [
  [0, 1, 2, 3],
  [5, 4, 7, 6],
  [4, 0, 3, 7],
  [1, 5, 6, 2],
  [4, 5, 1, 0],
  [3, 2, 6, 7],
]
const FACE_NORMALS = [
  [0, 0, -1],
  [0, 0, 1],
  [-1, 0, 0],
  [1, 0, 0],
  [0, -1, 0],
  [0, 1, 0],
]

/**
 * Qué partes entran en un encuadre, y con qué material.
 *
 * `TrajectoryScene` solo monta la señal de la estación activa y pinta SU losa con
 * `platformActive`. Si la proyección dibujase las tres señales a la vez, el SVG
 * mentiría sobre cuánta superficie saturada ve el usuario — y juzgar la
 * composición sobre otra escena es justo lo que este lote viene a corregir.
 */
/**
 * Qué partes se dibujan. La restricción por estación es SOLO para las señales: las
 * losas también llevan `station`, pero la suya es la marca de «qué estación resaltar»,
 * no de «cuándo existe». Filtrarlas por estación producía un modelo fantasma en el
 * que cada encuadre dibujaba una sola losa y el veredicto decía «faltan sujetos»
 * (detectado al mirar la proyección rasterizada, no el número).
 */
const partVisibleFor = (part, station) =>
  !station || part.role !== 'signal' || !part.station || part.station === station
const effectiveMaterial = (part, station) =>
  part.role === 'platform' && part.station === station ? 'platformActive' : part.material

const boxesOf = (station) =>
  GEOMETRY.filter((part) => part.kind === 'box' && partVisibleFor(part, station)).map((part) => {
    const [hx, hy, hz] = part.args.map((a) => a / 2)
    const [cx, cy, cz] = part.position
    return {
      id: part.id,
      material: effectiveMaterial(part, station),
      min: [cx - hx, cy - hy, cz - hz],
      max: [cx + hx, cy + hy, cz + hz],
    }
  })

const boxCorners = (box) => {
  const center = [0, 1, 2].map((i) => (box.min[i] + box.max[i]) / 2)
  const half = [0, 1, 2].map((i) => (box.max[i] - box.min[i]) / 2)
  return CORNER_SIGNS.map(([sx, sy, sz]) => [center[0] + sx * half[0], center[1] + sy * half[1], center[2] + sz * half[2]])
}

/** Caja envolvente de un cilindro, rotada igual que la pieza. */
/**
 * Caja envolvente de un cilindro, rotada igual que la pieza.
 *
 * DEFECTO CORREGIDO EN EL LOTE 3A — y se documenta porque invalida evidencia
 * anterior del propio lote. `CylinderGeometry` de Three tiene el eje a lo largo de
 * **Y**; aquí la caja se construía acostada sobre X y DESPUÉS se le aplicaba la
 * rotación de la pieza. Como la barra se acuesta con `rotation: [0, 0, π/2]`, el
 * orden inverso convertía la barra en un poste vertical de 10,5 m pinchado en el
 * techo. Ese era el «palo naranja que cruza el encuadre» de las proyecciones del
 * Lote 2: NO era un defecto de la escena (el motor la dibujaba tumbada y correcta),
 * era el instrumento mintiendo. El eje local es Y y la rotación hace su trabajo.
 */
function cylinderEnvelope(part) {
  const radius = part.args[0]
  const length = part.args[2]
  const euler = new THREE.Euler(...(part.rotation ?? [0, 0, 0]))
  const [hx, hy, hz] = [radius, length / 2, radius]
  const local = [
    [-hx, -hy, -hz],
    [hx, -hy, -hz],
    [hx, hy, -hz],
    [-hx, hy, -hz],
    [-hx, -hy, hz],
    [hx, -hy, hz],
    [hx, hy, hz],
    [-hx, hy, hz],
  ]
  return { euler, local }
}

function planeCorners(part) {
  const [w, h] = part.args
  const [cx, cy, cz] = part.position
  const euler = new THREE.Euler(...(part.rotation ?? [0, 0, 0]))
  return [
    [-w / 2, -h / 2, 0],
    [w / 2, -h / 2, 0],
    [w / 2, h / 2, 0],
    [-w / 2, h / 2, 0],
  ].map((p) => {
    const v = new THREE.Vector3(...p).applyEuler(euler)
    return [v.x + cx, v.y + cy, v.z + cz]
  })
}

function segmentHitsBox(from, to, box, slack = 0.05) {
  let t0 = 0
  let t1 = 1
  for (let axis = 0; axis < 3; axis += 1) {
    const delta = to[axis] - from[axis]
    const min = box.min[axis] + slack
    const max = box.max[axis] - slack
    if (Math.abs(delta) < 1e-9) {
      if (from[axis] < min || from[axis] > max) return false
      continue
    }
    let ta = (min - from[axis]) / delta
    let tb = (max - from[axis]) / delta
    if (ta > tb) [ta, tb] = [tb, ta]
    t0 = Math.max(t0, ta)
    t1 = Math.min(t1, tb)
    if (t0 > t1) return false
  }
  return true
}

function makeCamera(view, width, height) {
  const camera = new THREE.PerspectiveCamera(view.fov, width / height, 0.1, 240)
  camera.position.set(...view.position)
  camera.lookAt(new THREE.Vector3(...view.target))
  camera.updateMatrixWorld(true)
  camera.updateProjectionMatrix()
  return camera
}

/**
 * Proyecta un polígono con el PLANO CERCANO recortado de verdad
 * (Sutherland–Hodgman en espacio de cámara, antes de dividir por w).
 *
 * No es un detalle: el suelo del pabellón es un plano de 24 × 11 m y en varios
 * encuadres la cámara cae justo sobre su borde. Si se descarta la cara porque un
 * vértice queda detrás de la cámara, el polígono proyectado se convierte en una
 * astilla del tamaño de un canto y la cobertura del cuadro se lee 0,15 cuando el
 * render real pinta el suelo ocupando media pantalla. Y si se proyecta sin
 * recortar, las coordenadas de un punto detrás de la cámara salen invertidas
 * (NDC y = 8,6 para un vértice del suelo). Ambas cosas daban falsos «falta el
 * suelo» y falsos «cuadro vacío».
 */
function projectPolygon(camera, width, height, worldPoints, near = 0.25) {
  const view = worldPoints.map((p) => new THREE.Vector3(...p).applyMatrix4(camera.matrixWorldInverse))
  const inside = (v) => -v.z >= near
  const clip = (input) => {
    if (!input.length) return []
    const out = []
    for (let i = 0; i < input.length; i += 1) {
      const current = input[i]
      const next = input[(i + 1) % input.length]
      const currentIn = inside(current)
      const nextIn = inside(next)
      if (currentIn) out.push(current)
      if (currentIn !== nextIn) {
        const dz = next.z - current.z
        const t = (-near - current.z) / (dz === 0 ? 1e-9 : dz)
        out.push(current.clone().lerp(next, t))
      }
    }
    return out
  }
  const clipped = clip(view)
  if (clipped.length < 3) return null

  const tanHalfY = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
  const aspect = width / height
  return clipped.map((v) => ({
    ndc: [v.x / (-v.z * tanHalfY * aspect), v.y / (-v.z * tanHalfY)],
    viewZ: -v.z,
    x: (v.x / (-v.z * tanHalfY * aspect) * 0.5 + 0.5) * width,
    y: (-v.y / (-v.z * tanHalfY) * 0.5 + 0.5) * height,
  }))
}

const hexToRgb = (hex) => {
  const clean = String(hex).replace('#', '')
  return [0, 2, 4].map((i) => parseInt(clean.slice(i, i + 2), 16) || 0)
}

/** Caras frontales de la maqueta desde un encuadre dado, con su luma aproximada. */
function collectFaces({ view, width, height, station }) {
  const camera = makeCamera(view, width, height)
  const lightDir = new THREE.Vector3(...LIGHTS.key.position).normalize()
  const cameraPoint = new THREE.Vector3(...view.position)
  const faces = []
  const twoSidedFor = (material) => Boolean(MATERIALS[material]?.doubleSided)

  const pushFace = (corners, material, normalWorld, id) => {
    const front = projectPolygon(camera, width, height, corners)
    if (!front) return // la cara está entera detrás del plano cercano

    const centroid = new THREE.Vector3()
    corners.forEach((c) => centroid.add(new THREE.Vector3(...c)))
    centroid.divideScalar(corners.length)

    const normal = new THREE.Vector3(...normalWorld).normalize()
    const toCamera = cameraPoint.clone().sub(centroid).normalize()
    if (!twoSidedFor(material) && normal.dot(toCamera) <= 0) return // cara de espaldas

    const xs = front.map((p) => p.ndc[0])
    const ys = front.map((p) => p.ndc[1])
    const box = {
      x: [Math.min(...xs), Math.max(...xs)],
      y: [Math.min(...ys), Math.max(...ys)],
      z: [-1, -0.001], // ya recortado contra el near; el lejos lo acota la niebla
    }
    const inFront = true
    const overlapsFrame = inFront && box.x[1] > -1 && box.x[0] < 1 && box.y[1] > -1 && box.y[0] < 1
    const fullyInside =
      inFront &&
      box.x[0] > -1 + CRITERIA.marginMin &&
      box.x[1] < 1 - CRITERIA.marginMin &&
      box.y[0] > -1 + CRITERIA.marginMin &&
      box.y[1] < 1 - CRITERIA.marginMin

    const centroidViewZ = front.reduce((acc, p) => acc + p.viewZ, 0) / front.length
    const diffuse = Math.max(0, normal.dot(lightDir)) * LIGHTS.key.intensity * 0.16
    const ambient = LIGHTS.fill.intensity * 0.12
    const fogT = clamp((centroidViewZ - FOG.near) / (FOG.far - FOG.near), 0, 1)
    const luma = ((BASE_LUMA[material] ?? 0.1) + diffuse + ambient) * (1 - fogT * 0.75) + fogT * 0.02

    faces.push({
      id,
      material,
      box,
      // «Se ve» ≠ «sus esquinas caen dentro»: una traviesa de 11 m cruza el cuadro
      // sin que ningún vértice entre. Contar vértices obligaba a retroceder para
      // «ver» la barra — la métrica empujando el encuadre al absurdo.
      overlapsFrame,
      fullyInside,
      points: front.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '),
      depth: centroidViewZ,
      luma: clamp(luma, 0.02, 0.98),
      ndc: front.map((p) => p.ndc),
      lit: diffuse > 0.02,
    })
  }

  for (const box of boxesOf(station)) {
    const corners = boxCorners(box)
    FACE_INDEX.forEach((indices, faceIndex) =>
      pushFace(
        indices.map((i) => corners[i]),
        box.material,
        FACE_NORMALS[faceIndex],
        box.id,
      ),
    )
  }

  for (const part of GEOMETRY.filter((p) => p.kind === 'cylinder' && partVisibleFor(p, station))) {
    const { euler, local } = cylinderEnvelope(part)
    const rotated = local.map((p) => {
      const v = new THREE.Vector3(...p).applyEuler(euler)
      return [v.x + part.position[0], v.y + part.position[1], v.z + part.position[2]]
    })
    FACE_INDEX.forEach((indices, faceIndex) => {
      const normal = new THREE.Vector3(...FACE_NORMALS[faceIndex]).applyEuler(euler).toArray()
      pushFace(
        indices.map((i) => rotated[i]),
        effectiveMaterial(part, station),
        normal,
        part.id,
      )
    })
  }

  for (const part of GEOMETRY.filter((p) => p.kind === 'plane' && partVisibleFor(p, station))) {
    const normal = new THREE.Vector3(0, 0, 1).applyEuler(new THREE.Euler(...(part.rotation ?? [0, 0, 0]))).toArray()
    pushFace(planeCorners(part), effectiveMaterial(part, station), normal, part.id)
  }

  const curve = new THREE.CatmullRomCurve3(
    TRAJECTORY_CURVE.points.map((p) => new THREE.Vector3(...p)),
    false,
    'catmullrom',
    0.5,
  )
  const curvePoints = curve.getPoints(72).map((v) => [v.x, v.y, v.z])
  const tanHalfY = Math.tan(THREE.MathUtils.degToRad(view.fov / 2))
  const viewCurve = curvePoints
    .map((p) => new THREE.Vector3(...p).applyMatrix4(camera.matrixWorldInverse))
    .filter((v) => -v.z > 0.25)
    .map((v) => ({
      ndc: [v.x / (-v.z * tanHalfY * (width / height)), v.y / (-v.z * tanHalfY)],
      x: 0,
      y: 0,
      viewZ: -v.z,
    }))
  for (const p of viewCurve) {
    p.x = (p.ndc[0] * 0.5 + 0.5) * width
    p.y = (-p.ndc[1] * 0.5 + 0.5) * height
  }
  const projectedCurve = viewCurve
  const inside = projectedCurve.filter((p) => insideNdc(p.ndc)).length
  const visible = projectedCurve

  return {
    faces,
    curveInsideRatio: projectedCurve.length ? inside / projectedCurve.length : 0,
    // La ruta NO se dibuja por defecto: desde el Lote 3A la escena no monta el
    // tubo (los peldaños cuentan la progresión). `--with-route` la superpone como
    // auditoría de la relación peldaño ↔ curva.
    curvePath: DRAW_ROUTE
      ? visible.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
      : null,
  }
}

function pointInPolygonNdc(point, ndcPoints) {
  if (ndcPoints.length < 3) return false
  const [px, py] = point
  const xLo = Math.min(...ndcPoints.map((n) => n[0]))
  const xHi = Math.max(...ndcPoints.map((n) => n[0]))
  const yLo = Math.min(...ndcPoints.map((n) => n[1]))
  const yHi = Math.max(...ndcPoints.map((n) => n[1]))
  if (px < xLo || px > xHi || py < yLo || py > yHi) return false
  let inside = false
  for (let i = 0, j = ndcPoints.length - 1; i < ndcPoints.length; j = i, i += 1) {
    const [xi, yi] = ndcPoints[i]
    const [xj, yj] = ndcPoints[j]
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

function metricsOf({ faces, curveInsideRatio }, view) {
  const byId = new Map()
  for (const face of faces) {
    if (!byId.has(face.id)) byId.set(face.id, [])
    byId.get(face.id).push(face)
  }

  // Caja del conjunto de sujetos que deben CABER: unión de todas sus caras.
  const ids = view.mustInclude ?? []
  const list = ids.flatMap((id) => byId.get(id) ?? [])
  const box = list.length
    ? {
        x: [Math.min(...list.map((f) => f.box.x[0])), Math.max(...list.map((f) => f.box.x[1]))],
        y: [Math.min(...list.map((f) => f.box.y[0])), Math.max(...list.map((f) => f.box.y[1]))],
      }
    : null

  const anyInView = (id) =>
    id === 'trajectory' ? curveInsideRatio > 0.2 : (byId.get(id) ?? []).some((f) => f.overlapsFrame)

  const absent = (view.mustBeVisible ?? [])
    .filter((id) => !anyInView(id))
    .concat(ids.filter((id) => id !== 'trajectory' && !byId.has(id)))

  // «¿Está el cuadro lleno?» no se puede responder con una caja: un plano de 15 m
  // desborda el fotograma y su caja da 26,0, un número sin significado. Se mide
  // cobertura: qué fracción de una rejilla 9×9 del cuadro cae sobre algún polígono
  // frontal. El aire negativo es intencionado en arquitectura; lo que no lo es es
  // un encuadre donde la maqueta es un grano.
  const subjectIds = new Set([...(view.mustInclude ?? []), ...(view.mustBeVisible ?? [])])
  const subjectFaces = faces.filter((f) => subjectIds.has(f.id))

  const grid = []
  const N = 9
  for (let gy = 0; gy < N; gy += 1) {
    for (let gx = 0; gx < N; gx += 1) {
      grid.push([-1 + (2 * (gx + 0.5)) / N, -1 + (2 * (gy + 0.5)) / N])
    }
  }
  let covered = 0
  for (const point of grid) {
    if (faces.some((f) => pointInPolygonNdc(point, f.ndc))) covered += 1
  }
  const coverage = covered / grid.length

  return {
    coverage,
    facesDrawn: faces.length,
    litFaces: faces.filter((f) => f.lit).length,
    // Coherencia = qué fracción de las caras de los SUJETOS DECLARADOS cae en
    // cuadro. Antes se dividía entre TODAS las caras dibujadas, y eso dejó de ser
    // una medida de composición cuando el modelo pasó de 8 piezas a 21: el
    // pavimento (6 juntas) y los cantos de señal existen para ser recortados, así
    // que un encuadre cercano y correcto sacaba un 0,20 y se leía «composición
    // floja». Medir sobre los sujetos es medir lo que se quería medir; la
    // alternativa —alejarse hasta que todas las caras entren— es exactamente la
    // cámara de 26 m que el Lote 2 produjo y las capturas devolvieron vacía.
    visibleFaceRatio: subjectFaces.length
      ? subjectFaces.filter((f) => f.overlapsFrame).length / subjectFaces.length
      : faces.length
        ? faces.filter((f) => f.overlapsFrame).length / faces.length
        : 0,
    absent: [...new Set(absent)],
    marginX: box ? Math.min(1 + box.x[0], 1 - box.x[1]) : -1,
    marginY: box ? Math.min(1 + box.y[0], 1 - box.y[1]) : -1,
    heightFraction: box ? (box.y[1] - box.y[0]) / 2 : 0,
    widthFraction: box ? (box.x[1] - box.x[0]) / 2 : 0,
    curveInsideRatio,
  }
}

function verdictOf(metrics, view, aspect) {
  const coherentRatio = aspect < NARROW_ASPECT_MAX ? CRITERIA.coherentRatioNarrow : CRITERIA.coherentRatioWide
  const fits = metrics.marginX > CRITERIA.marginMin && metrics.marginY > CRITERIA.marginMin
  const fills = metrics.coverage >= CRITERIA.fillMin
  const complete = metrics.absent.length === 0 && Boolean(view.mustInclude?.length)
  const coherent = metrics.visibleFaceRatio > coherentRatio
  const reasons = []
  if (!fits) reasons.push('sujeto recortado')
  if (!fills) reasons.push('cuadro vacío')
  if (!complete) reasons.push('faltan sujetos')
  if (!coherent) reasons.push('composición floja')
  return { ok: fits && fills && complete && coherent, coherent, reasons }
}

function renderSvg({ faces, curvePath, width, height }) {
  const sorted = [...faces].sort((a, b) => b.depth - a.depth) // pintor: lejos → cerca
  const body = sorted
    .map((face) => {
      const base = hexToRgb(MATERIALS[face.material]?.color ?? '#111111')
      const color = isTinted(face.material)
        ? `rgb(${base.map((c) => Math.round(c * 0.92)).join(',')})`
        : `rgb(${Math.round(face.luma * 255)},${Math.round(face.luma * 255)},${Math.round(face.luma * 242)})`
      return `  <polygon points="${face.points}" fill="${color}" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>`
    })
    .join('\n')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${FOG.color}"/>
${body}
  ${
    curvePath
      ? `  <path d="${curvePath}" fill="none" stroke="${MATERIALS.joint.color}" stroke-width="${Math.max(
          1,
          Math.round(height / 300),
        )}" stroke-linecap="round" opacity="0.95" stroke-dasharray="16 10"/>`
      : ''
  }
</svg>
`
}

/**
 * Búsqueda de encuadre: deja fijo el EJE que elige el autor (la dirección
 * cámara→objetivo) y solo ajusta distancia y FOV. Es deliberado: «más lejos» no
 * es una decisión de encuadre, y un buscador libre produciría cámaras raras que
 * nadie firmaría. Si aquí no hay solución, lo que hay que cambiar es el ángulo.
 */
/**
 * Búsqueda de encuadre sobre una FAMILIA de formatos, no sobre uno solo.
 *
 * La primera versión probaba contra `movil-390x844`. Con la matriz ampliada a los
 * cuatro verticales del plan §11 eso dejó de servir: un encuadre que respira en
 * 390 puede recortar el sujeto en 360, y el buscador lo habría propuesto igual.
 * Un candidato solo se acepta si cumple en TODOS los formatos de su familia, y se
 * puntúa por la peor cobertura de la familia (la mejor no compensa un recorte).
 */
function solveView(station, which, family) {
  const base = VIEWS[station][which]
  const target = base.target
  const direction = new THREE.Vector3(...base.position).sub(new THREE.Vector3(...target)).normalize()
  const [fovMin, fovMax] = CRITERIA.fovRange
  let best = null

  for (let fov = fovMin; fov <= fovMax; fov += 2) {
    for (let d = 3; d <= 22; d += 0.4) {
      const position = new THREE.Vector3(...target)
        .add(direction.clone().multiplyScalar(d))
        .toArray()
        .map((n) => Number(n.toFixed(2)))
      const view = { ...base, position, target, fov }
      let coverage = Infinity
      let rejected = false
      for (const viewport of family) {
        const aspect = viewport.width / viewport.height
        const collected = collectFaces({ view, width: viewport.width, height: viewport.height, station })
        const metrics = metricsOf(collected, view)
        if (!verdictOf(metrics, view, aspect).ok) {
          rejected = true
          break
        }
        coverage = Math.min(coverage, metrics.coverage)
      }
      if (rejected) continue
      // Objetivo: lente natural y cuadro aprovechado, prefiriendo el plano MÁS
      // CERRADO que cumple. «Alejarse» siempre cumple y siempre aburre.
      const score = Math.abs(fov - CRITERIA.preferredFov) * 0.6 + Math.abs(coverage - 0.55) * 40 + d * 0.6
      if (!best || score < best.score) best = { d, fov, position, score, coverage }
    }
  }
  return best
}

function main() {
  mkdirSync(OUT, { recursive: true })

  if (SOLVE) {
    console.log('\nBúsqueda de encuadre (eje fijo; solo distancia y FOV)\n')
    const suggestions = []
    for (const station of STATIONS_KEYS) {
      for (const which of ['wide', 'narrow']) {
        // Familia de formatos = la partición que usa el runtime (`viewFor`): misma
        // regla del corte por aspecto, así que lo que el buscador propone es lo que
        // el navegador va a montar en CUALQUIERA de esos formatos.
        const family = VIEWPORTS.filter((item) => {
          const aspect = item.width / item.height
          return which === 'wide' ? aspect >= NARROW_ASPECT_MAX : aspect < NARROW_ASPECT_MAX
        })
        if (!family.length) throw new Error(`VIEWPORTS no tiene formatos de familia ${which}`)
        const best = solveView(station, which, family)
        if (!best) {
          console.log(`  ${station}.${which}: SIN solución ≤22 m con este eje → cambiar el ángulo`)
          suggestions.push({ station, which, solved: false })
          continue
        }
        console.log(
          `  ${station}.${which}: d=${best.d.toFixed(1)} m · fov=${best.fov} · cobertura ${best.coverage.toFixed(
            2,
          )} en el peor de ${family.length} formatos · position=[${best.position.map((n) => n.toFixed(2)).join(', ')}]`,
        )
        suggestions.push({ station, which, solved: true, d: best.d, fov: best.fov, position: best.position })
      }
    }
    writeFileSync(join(OUT, 'solve.json'), JSON.stringify({ criteria: CRITERIA, suggestions }, null, 2))
    console.log(`\npropuesta (no aplicada): ${OUT}/solve.json`)
    return
  }

  const bounds = stageBounds()
  // Sin estación de referencia: el buscador de oclusores necesita TODO el volumen construido.
  const boxes = boxesOf(null)
  const results = []

  console.log('\nProyección geométrica del greybox (los mismos datos que monta la escena)')
  console.log(
    `Criterios: margen NDC > ${CRITERIA.marginMin} · cubierta el ${CRITERIA.fillMin * 100}% del cuadro · sin ausentes · ` +
      `caras en cuadro > ${CRITERIA.coherentRatioWide} (apaisado) / ${CRITERIA.coherentRatioNarrow} (vertical) · ` +
      `lente ${CRITERIA.fovRange[0]}º–${CRITERIA.fovRange[1]}º · encuadre estrecho si aspecto < ${NARROW_ASPECT_MAX}`,
  )
  console.log('\nEstación  viewport              sujeto        cuadro  luz     curva  veredicto\n')

  for (const station of STATIONS_KEYS) {
    for (const viewport of VIEWPORTS) {
      const aspect = viewport.width / viewport.height
      const view = viewFor(station, aspect)
      const collected = collectFaces({ view, width: viewport.width, height: viewport.height, station })
      const metrics = metricsOf(collected, view)
      const verdict = verdictOf(metrics, view, aspect)

      const target = GEOMETRY.find((part) => part.role === 'platform' && part.station === station)
      const aim = [
        (target?.position[0] ?? 0) * 0.6,
        (target?.position[1] ?? 1) + 0.5,
        (target?.position[2] ?? 0) * 0.6,
      ]
      const occluders = boxes
        .filter((box) => box.id !== target?.id)
        .filter((box) => segmentHitsBox(view.position, aim, box))
        .map((box) => box.id)

      const svgPath = join(OUT, `${station}--${viewport.id}.svg`)
      writeFileSync(svgPath, renderSvg({ ...collected, width: viewport.width, height: viewport.height }))
      let png = null
      try {
        png = svgPath.replace(/\.svg$/, '.png')
        execSync(`convert ${JSON.stringify(svgPath)} ${JSON.stringify(png)}`, { stdio: 'pipe' })
      } catch {
        png = null // sin delegate SVG: el SVG sigue siendo evidencia legible
      }

      results.push({
        station,
        viewport,
        framing: aspect < NARROW_ASPECT_MAX ? 'narrow' : 'wide',
        view,
        ok: verdict.ok && occluders.length === 0,
        reasons: [
          ...verdict.reasons,
          ...(occluders.length ? [`visión tapada por ${occluders.join(',')}`] : []),
        ],
        // Cuáles faltan y cuáles tapan: sin estos dos campos el veredicto dice
        // «faltan sujetos» y hay que adivinar el sujeto. Lo que se persigue aquí es
        // composición, no approvede un número: el dato tiene que ser accionable.
        absent: metrics.absent,
        occluders: [...new Set(occluders ?? [])],

        margins: { x: Number(metrics.marginX.toFixed(4)), y: Number(metrics.marginY.toFixed(4)) },
        subject: {
          heightFraction: Number(metrics.heightFraction.toFixed(4)),
          widthFraction: Number(metrics.widthFraction.toFixed(4)),
        },
        coverage: Number(metrics.coverage.toFixed(4)),
        visibleFaceRatio: Number(metrics.visibleFaceRatio.toFixed(3)),
        curveInsideRatio: Number(metrics.curveInsideRatio.toFixed(3)),
        facesDrawn: metrics.facesDrawn,
        litFaces: metrics.litFaces,
        svg: svgPath,
        png,
      })

      console.log(
        `${station.padEnd(10)} ${viewport.id.padEnd(22)} alto ${(metrics.heightFraction * 100).toFixed(0).padStart(3)}%  ` +
          `ancho ${(metrics.widthFraction * 100).toFixed(0).padStart(3)}%  m ${metrics.marginX.toFixed(2)}/${metrics.marginY.toFixed(
            2,
          )}  cubrim ${metrics.coverage.toFixed(2)}  ${String(metrics.litFaces).padStart(2)}/${String(
            metrics.facesDrawn,
          ).padEnd(3)}  dentro ${metrics.curveInsideRatio.toFixed(2)}  ` +
          `${verdict.ok && occluders.length === 0 ? 'ok' : [...verdict.reasons, ...(occluders.length ? [`visión tapada (${occluders.join(',')})`] : [])].join(' + ')}`,
      )
    }
  }

  const ref = (() => {
    try {
      return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
    } catch {
      return 'sin-referencia'
    }
  })()

  writeFileSync(
    join(OUT, 'projection.json'),
    JSON.stringify(
      {
        ref,
        generatedAt: new Date().toISOString(),
        method:
          'PerspectiveCamera de three (matemática pura, la misma que usa el runtime) sobre src/engine/scene/trajectoryStage.js; difuso lambertiano de la luz clave y niebla por distancia; rasterizado con ImageMagick cuando hay delegate.',
        criteria: CRITERIA,
        narrowAspectMax: NARROW_ASPECT_MAX,
        stageBounds: bounds,
        humanHeightReference: HUMAN_HEIGHT,
        results,
        limitations: [
          'NO es un render WebGL: sin PBR, specular, sombras, tone mapping, DPR, R3F ni antialiasing.',
          'Los cilindros se aproximan por su caja envolvente (vale para encuadre y silueta gruesa).',
          'No mide cadencia, GPU, memoria ni temperatura.',
          'La validación visual con navegador corresponde a e2e/lab-spatial.spec.js.',
          'Mide el encuadre del sujeto, no la legibilidad tipográfica del panel.',
        ],
      },
      null,
      2,
    ),
  )

  const invalid = results.filter((r) => !r.ok)
  console.log(`\n${results.length} combinaciones · inválidas: ${invalid.length}`)
  for (const item of invalid) console.log(`  · ${item.station} / ${item.viewport.id}: ${item.reasons.join(' · ')}`)
  console.log(`Evidencia: ${OUT}/ (fuera de git)`)
  if (invalid.length) process.exit(1)
}

try {
  main()
} catch (error) {
  console.error(`\nERROR: ${error?.stack ?? error}`)
  process.exit(2)
}
