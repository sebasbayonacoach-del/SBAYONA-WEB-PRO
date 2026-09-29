// Baseline visual de las 17 rutas públicas — BAYONA (Fase 1, plan 1.25)
// ---------------------------------------------------------------------------
// Captura cada ruta pública en 390, 768, 1024 y 1440px de ancho
// con movimiento reducido, para tener una referencia objetiva con la
// que comparar cada fase del rediseño. No es un test de regresión con
// snapshots de Playwright: es una carpeta de artefactos (test-results/,
// ignorada por git) que se regenera cuando se quiera fijar una nueva base.
// La lista de rutas es la misma que fija src/test/baselineContract.test.js.
import { expect, test } from '@playwright/test'

const RUTAS = [
  { id: 'home', path: '/' },
  { id: 'about', path: '/about' },
  { id: 'programs', path: '/programs' },
  { id: 'parkour-academy', path: '/parkour-academy' },
  { id: 'plan-raiz', path: '/plan/raiz' },
  { id: 'plan-fuerza', path: '/plan/fuerza' },
  { id: 'plan-rendimiento', path: '/plan/rendimiento' },
  { id: 'plan-elite', path: '/plan/elite' },
  { id: 'shop', path: '/shop' },
  { id: 'app', path: '/app' },
  { id: 'community', path: '/community' },
  { id: 'resources', path: '/resources' },
  { id: 'faq', path: '/faq' },
  { id: 'checkout', path: '/checkout' },
  { id: 'order-confirmation', path: '/order-confirmation' },
  { id: 'onboarding', path: '/onboarding' },
  { id: 'entrar', path: '/entrar' },
]

const VIEWPORTS = [
  { id: 'desktop-1440x900', width: 1440, height: 900 },
  { id: 'mobile-390x844', width: 390, height: 844 },
  { id: 'tablet-768x1024', width: 768, height: 1024 },
  { id: 'desktop-1024x900', width: 1024, height: 900 },
]

for (const viewport of VIEWPORTS) {
  test.describe(`Baseline visual ${viewport.id}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } })

    for (const { id, path } of RUTAS) {
      test(`ruta ${path} se captura completa`, async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' })
        await page.goto(path, { waitUntil: 'domcontentloaded' })

        const main = page.getByRole('main')
        await expect(main).toBeVisible()
        // Las rutas lazy muestran RouteFallback mientras baja su chunk: esperar a
        // que desaparezca para no capturar el estado intermedio de carga.
        await page.waitForSelector('.route-fallback', { state: 'detached' })

        await page.screenshot({
          path: `test-results/playwright/baseline/${viewport.id}/${id}.png`,
          fullPage: true,
        })
      })
    }
  })
}
