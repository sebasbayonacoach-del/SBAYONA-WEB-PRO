import { expect, test } from '@playwright/test'

// Verificación de BAYONA PRIME: las fichas usan el mismo lenguaje editorial,
// sin fotografías incrustadas ni filas horizontales que escondan productos.
for (const viewport of [
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'desktop-1440', width: 1440, height: 900 },
]) {
  test(`tienda editorial sin imágenes (${viewport.name})`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/shop', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('.shop-product-card').first()).toBeVisible({ timeout: 20000 })

    const cards = page.locator('.shop-product-card')
    await expect(cards).toHaveCount(39)
    await expect(cards.locator('img, picture, video, canvas')).toHaveCount(0)
    await expect(cards.first().locator('.shop-product-visual svg')).toBeVisible()
    await expect(cards.first().locator('> p')).toBeVisible()
    await expect(cards.first().locator('.shop-product-price small')).toBeVisible()
    await expect(cards.first().locator('.shop-product-actions a')).toBeVisible()

    if (viewport.width <= 660) {
      const filterPosition = await page.locator('.shop-filter-bar').evaluate((node) => getComputedStyle(node).position)
      expect(filterPosition).not.toBe('sticky')
    }

    const firstCard = cards.first()
    const firstCardBox = await firstCard.boundingBox()
    expect(firstCardBox.width).toBeGreaterThan(230)
    expect(firstCardBox.width).toBeLessThanOrEqual(viewport.width)
    expect(firstCardBox.x).toBeGreaterThanOrEqual(-1)
    expect(firstCardBox.x + firstCardBox.width).toBeLessThanOrEqual(viewport.width + 1)

    const backgroundUrl = await page.locator('.shop-collection-stage__backdrop').first().evaluate(
      (node) => getComputedStyle(node).backgroundImage,
    )
    expect(backgroundUrl).not.toContain('url(')

    await firstCard.scrollIntoViewIfNeeded()
    await page.screenshot({
      path: `test-results/playwright/shop-unified/${viewport.name}.jpg`,
      type: 'jpeg', quality: 75,
    })
  })
}

test('el lenguaje visual se comparte entre las rutas de marca', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const colors = []
  for (const route of ['/about', '/programs', '/community', '/shop']) {
    await page.goto(route, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('.route-fallback', { state: 'detached' })
    const frame = page.locator('.ds-frame').first()
    await expect(frame).toBeVisible()
    colors.push(await page.evaluate(() => getComputedStyle(document.body).backgroundColor))
  }
  expect(new Set(colors).size).toBe(1)
})
