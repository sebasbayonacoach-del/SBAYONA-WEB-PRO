import { expect, test } from '@playwright/test'
import { shopCollections, shopProducts } from '../src/config/shopProducts.js'

const mobileGroupedCount = shopCollections.reduce((sum, collection) => {
  const count = shopProducts.filter((product) => product.collectionId === collection.id).length
  return sum + Math.min(count, 3)
}, 0)

for (const viewport of [
  { name: 'mobile-390', width: 390, height: 844, expected: mobileGroupedCount },
  { name: 'desktop-1440', width: 1440, height: 900, expected: shopProducts.length },
]) {
  test('tienda gym-first con fotografía real (' + viewport.name + ')', async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/shop', { waitUntil: 'networkidle' })

    const cards = page.locator('.shop-product-card')
    await expect(cards).toHaveCount(viewport.expected)
    await expect(cards.first()).toBeVisible()

    const images = cards.locator('.shop-product-image')
    await expect(images).toHaveCount(viewport.expected)
    const firstImage = images.first()
    await firstImage.scrollIntoViewIfNeeded()
    await expect(firstImage).toBeVisible()
    await expect.poll(() => firstImage.evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true)

    await expect(cards.first().getByRole('button', { name: /Añadir .* al carrito/i })).toBeVisible()
    await expect(cards.first().getByRole('link', { name: /Lo quiero/i })).toBeVisible()

    if (viewport.width <= 660) {
      const filterPosition = await page.locator('.shop-filter-bar').evaluate((node) => getComputedStyle(node).position)
      expect(filterPosition).not.toBe('sticky')
    }

    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2)).toBe(false)
  })
}

test('el lenguaje visual se comparte entre las rutas de marca', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  const colors = []
  for (const route of ['/about', '/programs', '/community', '/shop']) {
    await page.goto(route, { waitUntil: 'networkidle' })
    const frame = page.locator('.ds-frame').first()
    await expect(frame).toBeVisible()
    colors.push(await page.evaluate(() => getComputedStyle(document.body).backgroundColor))
  }
  expect(new Set(colors).size).toBe(1)
})
