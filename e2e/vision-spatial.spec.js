import { expect, test } from '@playwright/test'

test('Home V2 no necesita WebGL y conserva toda la conversión', async ({ page }) => {
  await page.setViewportSize({ width: 726, height: 950 })
  const threeRequests = []
  page.on('request', (request) => {
    if (/Scene3D|react-three|three\.js|postprocessing/i.test(request.url())) threeRequests.push(request.url())
  })
  await page.goto('/', { waitUntil: 'networkidle' })

  await expect(page.locator('.gym-service-card')).toHaveCount(4)
  await expect(page.locator('.gym-process-grid > li')).toHaveCount(3)
  await expect(page.locator('.gym-gift-card')).toHaveCount(3)
  await expect(page.locator('#empieza')).toBeAttached()
  await expect(page.locator('canvas')).toHaveCount(0)
  expect(threeRequests).toEqual([])
})

test('Home V2 móvil mantiene alternativa completamente DOM', async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/', { waitUntil: 'networkidle' })
    await expect(page.locator('.gym-process-grid > li')).toHaveCount(3)
    await expect(page.locator('.gym-service-card img')).toHaveCount(4)
    await expect(page.locator('.gym-gift-card img')).toHaveCount(3)
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2)).toBe(false)
  }
})
