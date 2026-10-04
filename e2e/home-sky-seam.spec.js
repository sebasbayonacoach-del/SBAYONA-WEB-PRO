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
    // El sistema global de capítulos no puede dibujar su filete de 1px sobre el cielo.
    const chapterRule = await film.evaluate((el) => ({
      content: getComputedStyle(el, '::after').content,
      height: getComputedStyle(el, '::after').height,
    }))
    expect(chapterRule.content, `no debe existir la línea superior (${chapterRule.height})`).toBe('none')
    await expect(film).toHaveCSS('padding-top', '0px')
    await expect(film).toHaveCSS('padding-bottom', '0px')
    await expect(film.locator('.scroll-film__calm')).toHaveText('MODO CALMA')

    const top = await film.evaluate((element) => element.getBoundingClientRect().top + window.scrollY)
    await page.evaluate((scrollTop) => window.scrollTo({ top: scrollTop - 180, behavior: 'instant' }), top)
    await page.waitForTimeout(500)
    await page.screenshot({
      path: `test-results/playwright/home-sky-seam/${viewport.id}.png`,
    })
  })
}

test('Modo calma mantiene el cielo integrado sin filetes decorativos', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const film = page.locator('[data-scroll-story="home-intro"]')
  const filmY = await film.evaluate(el => el.getBoundingClientRect().top + window.scrollY)
  await page.evaluate(y => window.scrollTo(0, y + 100), filmY)
  await page.locator('.scroll-film__calm').click()
  await expect(film).toHaveClass(/scroll-film--static/)
  await expect(film.locator('.scroll-film__static-frame')).toHaveCount(3)
  await expect(film.locator('.scroll-film__static-frame img').first()).toHaveCSS('mask-image', /linear-gradient/)
  const lineContent = await film.evaluate(el => getComputedStyle(el, '::after').content)
  expect(lineContent).toBe('none')
})
