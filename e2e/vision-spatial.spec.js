import { expect, test } from '@playwright/test'

// La galería reutiliza diez activos locales únicos y la cámara avanza con el scroll.
test('VisionShift: diez imágenes distintas, recorrido 3D y CTA de continuidad', async ({ page }) => {
  await page.setViewportSize({ width: 726, height: 950 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  const stage = page.locator('.vision-shift-stage--spatial')
  const gallery = stage.locator('[data-spatial-gallery="10"]')
  await expect(gallery).toBeAttached()
  const imgs = gallery.locator('.vision-spatial-frame img')
  await expect(imgs).toHaveCount(10)
  const paths = await imgs.evaluateAll((elements) => elements.map((img) => img.getAttribute('src')))
  expect(new Set(paths).size).toBe(10)
  for (const path of paths) {
    expect(path).toMatch(/^\/images\/burst\/.+-960\.webp$/)
    const response = await page.request.get(path)
    expect(response.status(), path).toBe(200)
  }

  const start = await stage.evaluate((element) => element.getBoundingClientRect().top + window.scrollY)
  const height = await stage.evaluate((element) => element.getBoundingClientRect().height)
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start + height * 0.18)
  await page.waitForTimeout(550)
  const firstTransform = await gallery.locator('.vision-spatial-frame').nth(4).evaluate((element) => getComputedStyle(element).transform)
  const pinned = await stage.locator('.sticky-stage-viewport').evaluate((element) => element.getBoundingClientRect().height)
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start + (height - pinned) * 0.95)
  await page.waitForTimeout(650)
  const lastTransform = await gallery.locator('.vision-spatial-frame').nth(4).evaluate((element) => getComputedStyle(element).transform)
  expect(firstTransform).not.toBe(lastTransform)
  await expect(stage.locator('.vision-shift-copy')).toContainText('Dejas de vivir reiniciando.')
  const action = stage.getByRole('link', { name: /DESCUBRE TU PROGRAMA/i })
  await expect(action).toBeVisible()
  await expect(action).toHaveAttribute('href', '/programs')
  const actionBox = await action.boundingBox()
  expect(actionBox).not.toBeNull()
  expect(actionBox.y).toBeGreaterThanOrEqual(66)
  expect(actionBox.y + actionBox.height).toBeLessThanOrEqual(950)
  expect(errors).toEqual([])
  await page.screenshot({ path: 'test-results/playwright/vision-spatial/continuidad-726.png' })
})

test('VisionShift: móvil sin desbordamiento y alternativa estática accesible', async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const stage = page.locator('.vision-shift-stage--spatial.sticky-stage--static')
    await expect(stage.locator('.sticky-stage-frame')).toHaveCount(5)
    await expect(stage.locator('.vision-spatial-frame')).toHaveCount(0)
    const last = stage.locator('.sticky-stage-frame').last()
    await expect(last).toContainText('Dejas de vivir reiniciando.')
    await expect(last.getByRole('link', { name: /DESCUBRE TU PROGRAMA/i })).toHaveAttribute('href', '/programs')
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2)
    expect(overflow).toBe(false)
  }
})
