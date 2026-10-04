import { expect, test } from '@playwright/test'

// Regresión BAYONA: el hero oscuro entra en el primer cielo sin corte duro.
// La transición es un recorte óptico del propio fotograma, no una capa fija
// que tape botones ni un solape que desplace contenido.
for (const viewport of [
  { id: 'phone-390', width: 390, height: 844 },
  { id: 'tablet-686', width: 686, height: 920 },
  { id: 'desktop-1440', width: 1440, height: 900 },
]) {
  test(`Home funde hero con cielo — ${viewport.id}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    const hero = page.locator('.hero-module')
    const film = page.locator('[data-scroll-story="home-intro"]')
    const firstFrame = film.locator('.scroll-film__frame').first()
    await expect(hero).toBeVisible()
    await expect(film).toBeAttached()
    await expect(firstFrame).toBeAttached()
    await expect(firstFrame).toHaveCSS('mask-image', /linear-gradient/)
    await expect(film).toHaveCSS('background-color', 'rgb(5, 5, 5)')
    await expect(film.locator('.scroll-film__calm')).toHaveText('MODO CALMA')

    const top = await film.evaluate((element) => element.getBoundingClientRect().top + window.scrollY)
    await page.evaluate((scrollTop) => window.scrollTo({ top: scrollTop - 180, behavior: 'instant' }), top)
    await page.waitForTimeout(500)
    await page.screenshot({
      path: `test-results/playwright/home-sky-seam/${viewport.id}.png`,
    })
  })
}
