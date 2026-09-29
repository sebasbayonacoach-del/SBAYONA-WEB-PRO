// Capturas visuales del Design System 2.0 — BAYONA (Fase 3)
// ---------------------------------------------------------------------------
// Captura la ruta interna /design-system en los dos viewports de referencia
// (desktop 1440×900 y mobile 390×844) con movimiento reducido.
//
// A diferencia de e2e/baseline-visual.spec.js (34 capturas históricas de las
// 17 rutas públicas, que se conservan como referencia), este spec solo
// captura el playground del sistema y guarda en su propia carpeta:
// test-results/playwright/design-system/. Así cada fase del rediseño puede
// comparar el sistema contra sí mismo sin tocar la baseline pública.
import { expect, test } from '@playwright/test'

const VIEWPORTS = [
  { id: 'desktop-1440x900', width: 1440, height: 900 },
  { id: 'mobile-390x844', width: 390, height: 844 },
]

for (const viewport of VIEWPORTS) {
  test.describe(`Design System visual ${viewport.id}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } })

    test('playground /design-system se captura completo', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto('/design-system', { waitUntil: 'domcontentloaded' })

      const main = page.getByRole('main')
      await expect(main).toBeVisible()
      // La ruta es lazy: esperar a que RouteFallback desaparezca.
      await page.waitForSelector('.route-fallback', { state: 'detached' })
      // El playground declara su condición de ruta interna.
      await expect(page.getByText('Ruta interna · no indexable · fuera del sitemap')).toBeVisible()

      await page.screenshot({
        path: `test-results/playwright/design-system/${viewport.id}/design-system.png`,
        fullPage: true,
      })
    })
  })
}
