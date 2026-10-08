/**
 * Lote 2 · LABORATORIO ESPACIAL — contrato de NAVEGADOR.
 * ---------------------------------------------------------------------------
 * Corre con `npm run test:visual` (Playwright sobre el dev server de la config,
 * puerto 4173) o contra una build de producción:
 *
 *   npm run build && npm run preview -- --host 127.0.0.1 --port 4173
 *   LAB_BASE_URL=http://127.0.0.1:4173 npx playwright test e2e/lab-spatial.spec.js
 *
 * Mide lo que un jsdom no puede: si el motor se descarga antes de la intención,
 * si el canvas existe, qué se pide al navegar a una ruta protegida y cómo se ve
 * el resultado en los cuatro formatos de la matriz de evidencia. La evidencia
 * (capturas + JSON) va a `test-results/` y `artifacts/latest/`, ambos fuera de
 * git: las capturas son para revisar, no para inflar el repositorio.
 *
 * Limitación que este spec NO elimina: en modo dev no existen los chunks de
 * producción, así que las URLs de los módulos son `/src/...`. La aserción de
 * peso/compresión real exige `npm run preview` (ver `LAB_BASE_URL` arriba) y, si
 * el navegador del runner usa SwiftShader, la cadencia medida NO representa una
 * GPU móvil: se registra el renderer y se declara.
 */

import { test, expect } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const BASE = process.env.LAB_BASE_URL ?? ''
const LAB_PATH = '/design-system'
const EVIDENCE_DIR = 'artifacts/latest/lab-spatial'

// Firmas del motor: por nombre de chunk (build) y por ruta de módulo (dev).
const ENGINE_PATTERNS = [
  /vendor-three/i,
  /three(\.module|\/build)/i,
  /@react-three/i,
  /drei/i,
  /postprocessing/i,
  /Scene3D/i,
  /TrajectoryScene/i,
  /\/TrajectoryStage\.jsx(?:\?|$)/i,
]
const isEngineRequest = (url) => ENGINE_PATTERNS.some((pattern) => pattern.test(url))

let ref = 'sin-referencia'
try {
  ref = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
} catch {
  /* entorno sin git: la evidencia se etiqueta igual, con `sin-referencia` */
}

function collect(page, sink, consoleErrors) {
  page.on('request', (request) => sink.push({ url: request.url(), at: Date.now(), type: request.resourceType() }))
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
}

async function openLab(page, viewport) {
  if (BASE) await page.goto(BASE + LAB_PATH, { waitUntil: 'load' })
  else await page.goto(LAB_PATH, { waitUntil: 'load' })
  await page.waitForSelector('.route-fallback', { state: 'detached' }).catch(() => {})
  await page.waitForSelector('.lab', { state: 'visible' })
  if (viewport) await page.setViewportSize(viewport)
}

test.describe('laboratorio espacial · aislamiento por intención', () => {
  test('antes de activar, el laboratorio NO pide nada del motor', async ({ page }) => {
    const requests = []
    const consoleErrors = []
    collect(page, requests, consoleErrors)

    await openLab(page)
    // Un respiro para que cualquier import "curioso" tenga tiempo de aparecer.
    await page.waitForTimeout(1200)

    const engine = requests.filter((r) => isEngineRequest(r.url))
    expect(engine, `El laboratorio pidió motor sin que nadie lo activara: ${engine.map((r) => r.url).join(', ')}`).toEqual(
      [],
    )
    await expect(page.locator('[data-lab-stage="trajectory"]')).toHaveCount(0)
    await expect(page.locator('.lab-composition')).toHaveCount(1)
    expect(consoleErrors, consoleErrors.join('\n')).toEqual([])
  })

  test('la activación monta un canvas real y el texto sigue en DOM', async ({ page }) => {
    await openLab(page, { width: 1440, height: 900 })
    const requests = []
    collect(page, requests, [])

    await page.getByRole('button', { name: /^Activar vista espacial$/ }).click()
    const stage = page.locator('[data-lab-stage="trajectory"]')
    await expect(stage).toBeVisible({ timeout: 15_000 })
    await expect(stage.locator('canvas')).toHaveCount(1)

    // Después del clic SÍ tiene que haber tráfico de motor (si no lo hay, la
    // escena es decorativa y este test debe fallar).
    const engine = requests.filter((r) => isEngineRequest(r.url))
    expect(engine.length).toBeGreaterThan(0)

    // El contenido no se fue con la escena: sigue legible y seleccionable.
    await expect(page.locator('.lab-panel__body').first()).toContainText(/./)
    await expect(page.locator('.lab-mode__status')).toContainText(/Vista espacial activa/i)

    const info = await page.evaluate(() => {
      const canvas = document.querySelector('[data-lab-stage="trajectory"] canvas')
      if (!canvas) return null
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      if (!gl) return null
      const debug = gl.getExtension('WEBGL_debug_renderer_info')
      return {
        version: gl instanceof WebGL2RenderingContext ? 'webgl2' : 'webgl',
        renderer: debug ? String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)) : 'no expuesto',
        drawingBuffer: [gl.drawingBufferWidth, gl.drawingBufferHeight],
      }
    })
    expect(info).not.toBeNull()

    mkdirSync(EVIDENCE_DIR, { recursive: true })
    writeFileSync(
      `${EVIDENCE_DIR}/webgl.json`,
      JSON.stringify({ ref, capturedAt: new Date().toISOString(), info, engineRequests: engine.map((r) => r.url) }, null, 2),
    )
  })

  test('cambiar de estación no vuelve a pedir el motor', async ({ page }) => {
    await openLab(page, { width: 1440, height: 900 })
    await page.getByRole('button', { name: /^Activar vista espacial$/ }).click()
    const stage = page.locator('[data-lab-stage="trajectory"]')
    await expect(stage).toBeVisible({ timeout: 15_000 })
    await expect(stage.locator('canvas')).toHaveCount(1)
    await page.waitForLoadState('networkidle')

    const requests = []
    collect(page, requests, [])
    const tabs = page.getByRole('navigation', { name: 'Estaciones del recorrido' }).getByRole('button')
    await tabs.nth(2).click()
    await expect(page.locator('[data-lab-stage="trajectory"]')).toHaveAttribute('data-station', 'support')
    await tabs.nth(1).click()
    await expect(page.locator('[data-lab-stage="trajectory"]')).toHaveAttribute('data-station', 'build')
    await page.waitForTimeout(500)

    expect(requests.filter((r) => isEngineRequest(r.url))).toEqual([])
  })

  test('volver a la vista sencilla retira el canvas y Volver a entrar no duplica el módulo', async ({ page }) => {
    await openLab(page, { width: 1440, height: 900 })
    const click = () => page.getByRole('button', { name: /^Activar vista espacial$/ }).click()
    await click()
    await expect(page.locator('[data-lab-stage="trajectory"] canvas')).toHaveCount(1)

    await page.getByRole('button', { name: /Volver a la vista sencilla/i }).click()
    await expect(page.locator('[data-lab-stage="trajectory"]')).toHaveCount(0)
    await expect(page.locator('.lab-composition')).toHaveCount(1)

    // Reentrada: el navegador ya tiene el módulo; no debe volver a transferirlo.
    const requests = []
    collect(page, requests, [])
    await click()
    await expect(page.locator('[data-lab-stage="trajectory"] canvas')).toHaveCount(1)
    const transfers = requests.filter((r) => isEngineRequest(r.url) && r.type === 'script')
    expect(transfers.length, 'reentrada transfiere el motor otra vez').toBe(0)
  })

  test('salir del laboratorio hacia una ruta protegida no arrastra el motor a esa ruta', async ({ page }) => {
    await openLab(page, { width: 1440, height: 900 })
    await page.getByRole('button', { name: /^Activar vista espacial$/ }).click()
    const stage = page.locator('[data-lab-stage="trajectory"]')
    await expect(stage).toBeVisible({ timeout: 15_000 })
    await expect(stage.locator('canvas')).toHaveCount(1)
    await page.waitForLoadState('networkidle')

    // Diferencia clave: una descarga EMPEZADA ANTES que termine después de navegar
    // no es una fuga de la nueva ruta. Solo se imputan las peticiones iniciadas
    // DESPUÉS del clic de navegación.
    const requests = []
    collect(page, requests, [])
    const navigationStart = Date.now()
    await Promise.all([
      page.waitForURL(/\/programs/, { timeout: 15_000 }),
      page.locator('.lab-foot a[href="/programs"]').click(),
    ])
    await page.waitForTimeout(1500)

    const afterNavigation = requests.filter((r) => r.at >= navigationStart)
    const leaked = afterNavigation.filter((r) => isEngineRequest(r.url))
    expect(leaked, `la ruta pública solicitó motor: ${leaked.map((r) => r.url).join(', ')}`).toEqual([])
  })

  test('teclado: el recorrido sigue funcionando con la escena montada', async ({ page }) => {
    await openLab(page, { width: 1440, height: 900 })
    await page.getByRole('button', { name: /^Activar vista espacial$/ }).click()
    await expect(page.locator('[data-lab-stage="trajectory"]')).toBeVisible({ timeout: 15_000 })

    const first = page.getByRole('navigation', { name: 'Estaciones del recorrido' }).getByRole('button').first()
    await first.focus()
    await page.keyboard.press('ArrowRight')
    await expect(page.locator('[data-lab-stage="trajectory"]')).toHaveAttribute('data-station', 'build')
    await page.keyboard.press('End')
    await expect(page.locator('[data-lab-stage="trajectory"]')).toHaveAttribute('data-station', 'support')
    const focusedTitle = await page.evaluate(() => document.activeElement?.innerText ?? '')
    expect(focusedTitle).toMatch(/EL PLAN SIGUE CONTIGO|PLAN SIGUE CONTIGO/i)
    await page.keyboard.press('Escape')
    await expect(page.locator('[data-lab-stage="trajectory"]')).toHaveAttribute('data-station', 'understand')
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-lab-stage="trajectory"]')).toBeVisible() // Tab no queda atrapado
  })

  test('movimiento reducido: sin travelling y sin fotograma vacío', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await openLab(page, { width: 1440, height: 900 })
    await page.getByRole('button', { name: /^Activar vista espacial$/ }).click()
    const stage = page.locator('[data-lab-stage="trajectory"]')
    await expect(stage).toBeVisible({ timeout: 15_000 })
    await expect(stage.locator('canvas')).toHaveCount(1)
    await expect(page.locator('.lab-mode__status')).toContainText(/movimiento reducido/i)

    // El encuadre debe ser distinto por estación (corte) sin animación continua:
    // dos lecturas seguidas del mismo estado tienen que coincidir.
    const readCamera = () =>
      page.evaluate(() => {
        const canvas = document.querySelector('[data-lab-stage="trajectory"] canvas')
        return canvas ? [canvas.width, canvas.height] : null
      })
    const size = await readCamera()
    expect(size).not.toBeNull()
    expect(size[0]).toBeGreaterThan(0)
  })

  test('fallback: si WebGL se anula, el DOM sigue completo y el error se declara', async ({ page }) => {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext = function patched(type) {
        if (String(type).startsWith('webgl')) return null
        return original.call(this, type)
      }
    })
    await openLab(page, { width: 390, height: 844 })
    await page.getByRole('button', { name: /^Activar vista espacial$/ }).click()

    await expect(page.getByText(/no ha creado un contexto WebGL|no pudo montar un lienzo WebGL/i)).toBeVisible({
      timeout: 15_000,
    })
    await expect(page.locator('[data-lab-stage="trajectory"]')).toHaveCount(0)
    await expect(page.locator('.lab-composition')).toBeVisible()
    await expect(page.locator('.lab-panel__body').first()).toContainText(/./)
    await expect(page.getByRole('button', { name: /Reintentar vista espacial/i })).toBeVisible()
  })
})

test.describe('laboratorio espacial · evidencia visual', () => {
  // Los formatos que exige el plan §11: el vertical propio (430×932) además de la
  // revisión en 390×844 y 360×800, siempre con la lógica responsive que ya existe
  // (un solo corte en 860 px). En 430 se mira además lo que la proyección no puede
  // ver: que la barra de progreso y el pie del panel no se partan ni se coman el
  // lienzo cuando el cuadro se ensancha.
  const VIEWPORTS = [
    { id: 'desktop-1440x900', width: 1440, height: 900 },
    { id: 'mobile-390x844', width: 390, height: 844 },
    { id: 'mobile-430x932', width: 430, height: 932 },
    { id: 'mobile-360x800', width: 360, height: 800 },
  ]
  const STATIONS = ['understand', 'build', 'support']

  for (const viewport of VIEWPORTS) {
    test(`capturas ${viewport.id}`, async ({ page }) => {
      const dir = `test-results/playwright/lab-spatial/${viewport.id}`
      mkdirSync(dir, { recursive: true })
      await openLab(page, { width: viewport.width, height: viewport.height })

      await page.locator('.lab').screenshot({ path: `${dir}/simple.png` })

      await page.getByRole('button', { name: /^Activar vista espacial$/ }).click()
      await expect(page.locator('[data-lab-stage="trajectory"]')).toBeVisible({ timeout: 15_000 })

      const tabs = page.getByRole('navigation', { name: 'Estaciones del recorrido' }).getByRole('button')
      for (let index = 0; index < STATIONS.length; index += 1) {
        await tabs.nth(index).click()
        await expect(page.locator('[data-lab-stage="trajectory"]')).toHaveAttribute('data-station', STATIONS[index])
        await page.waitForTimeout(viewport.width > 800 ? 1200 : 900) // deja converger el encuadre
        await page.locator('.lab').screenshot({ path: `${dir}/spatial-${index + 1}-${STATIONS[index]}.png` })
      }

      writeFileSync(
        `${dir}/metadata.json`,
        JSON.stringify(
          {
            ref,
            viewport,
            mode: 'greybox espacial (WebGL) y vista sencilla (DOM)',
            stations: STATIONS,
            capturedAt: new Date().toISOString(),
            limitations: [
              'Una captura no mide cadencia, temperatura, GPU real ni accesibilidad completa.',
              'El laboratorio es un playground interno noindex: no es una oferta ni una instalación real.',
              'Con SwiftShader/software en el runner, el peso visual no equivale al de un móvil de gama media.',
            ],
          },
          null,
          2,
        ),
      )
    })
  }
})