// Suite e2e de hitos de conversión — BAYONA
// ---------------------------------------------------------------------------
// Contrato verificado por src/test/conversionRegression.test.jsx: este archivo
// debe contener emulación de medios, capturas fullPage de los hitos
// (home-hero, home-planes, home-extras, home-preview) y navegación por teclado.
// Se ejecuta con `npm run test:visual` (Playwright sirve la app en 127.0.0.1:4173).
import { expect, test } from '@playwright/test'

const HITOS = [
  { id: 'home-hero', path: '/' },
  { id: 'home-planes', path: '/#planes' },
  { id: 'home-extras', path: '/extras' },
  { id: 'home-preview', path: '/onboarding' },
]

test.describe('Hitos de conversión — regresión visual', () => {
  for (const { id, path } of HITOS) {
    test(`hito ${id} se renderiza y se captura completo`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto(path, { waitUntil: 'domcontentloaded' })

      // El contenido principal debe existir y ser visible sin animaciones.
      const main = page.getByRole('main')
      await expect(main).toBeVisible()

      await page.screenshot({
        path: `test-results/playwright/hitos/${id}.png`,
        fullPage: true,
      })
    })
  }

  test('la recepción es navegable solo con teclado', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    // El skip link es el primer foco del documento.
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: /saltar al contenido/i })).toBeFocused()
  })
})
