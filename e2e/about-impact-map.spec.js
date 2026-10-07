import { expect, test } from '@playwright/test'

test('mapa de impacto muestra solo historias publicadas y trayectoria real', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/about', { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', {
    name: /DE COLOMBIA A ESPAÑA\.\s*HISTORIAS QUE SIGUEN\./i,
  })).toBeVisible()

  const section = page.locator('.about-globe-testimonials-section')
  await section.scrollIntoViewIfNeeded()

  await expect(section.locator('.globe-impact-stat')).toHaveCount(3)
  await expect(section.locator('.globe-impact-stat').nth(0)).toContainText('10')
  await expect(section.locator('.globe-impact-stat').nth(0)).toContainText(/historias publicadas/i)
  await expect(section.locator('.globe-impact-stat').nth(1)).toContainText('4')
  await expect(section.locator('.globe-impact-stat').nth(2)).toContainText('5')
  await expect(section.locator('.globe-trajectory-stop')).toHaveCount(3)
  await expect(section.locator('.globe-testimonials-world-point')).toHaveCount(10)

  const mapCopy = await section.innerText()
  expect(mapCopy).not.toMatch(/Chapinero|Usaquén|Suba|Engativá|Teusaquillo|Fontibón|Kennedy|Bosa|San Cristóbal/i)
  expect(mapCopy).not.toMatch(/15 puntos/i)

  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 3)).toBe(false)
})

test('la trayectoria abre historias de Colombia, España e internacional', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/about', { waitUntil: 'domcontentloaded' })

  const section = page.locator('.about-globe-testimonials-section')
  await section.scrollIntoViewIfNeeded()
  const stops = section.locator('.globe-trajectory-stop')

  await stops.nth(0).click()
  let dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText(/Bogotá · Colombia/i)
  await expect(section.locator('.globe-testimonials-map-focus')).toContainText(/Colombia/i)
  await dialog.getByRole('button', { name: /Cerrar testimonio/i }).click()

  await stops.nth(1).click()
  dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText(/España/i)
  await dialog.getByRole('button', { name: /Cerrar testimonio/i }).click()

  await stops.nth(2).click()
  dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText(/Miami · EEUU|Buenos Aires · Argentina/i)
  await expect(dialog).toContainText(/Lo que destaca:/i)
})

test('mapa móvil conserva lectura, puntos y overlay sin overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/about', { waitUntil: 'domcontentloaded' })

  const section = page.locator('.about-globe-testimonials-section')
  await section.scrollIntoViewIfNeeded()

  await expect(section.locator('.globe-impact-stat')).toHaveCount(3)
  await expect(section.locator('.globe-trajectory-stop')).toHaveCount(3)
  await expect(section.locator('.globe-testimonials-world-point')).toHaveCount(10)

  await section.locator('.globe-trajectory-stop').nth(1).click()
  await expect(page.getByRole('dialog')).toBeVisible()

  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 3)).toBe(false)

  await page.screenshot({
    path: 'test-results/playwright/about-impact-map/mobile.png',
    fullPage: false,
  })
})

test('reduced motion mantiene todo el mapa funcional', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/about', { waitUntil: 'domcontentloaded' })

  const section = page.locator('.about-globe-testimonials-section')
  await section.scrollIntoViewIfNeeded()

  await expect(section.locator('.globe-testimonials-world-point')).toHaveCount(10)
  await section.locator('.globe-trajectory-stop').first().click()
  await expect(page.getByRole('dialog')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 3)).toBe(false)
})
