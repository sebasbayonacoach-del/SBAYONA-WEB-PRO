import { expect, test } from '@playwright/test'

for (const viewport of [
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet', width: 726, height: 950 },
  { name: 'desktop', width: 1440, height: 900 },
]) {
  test('Home V2 mantiene fotografía y contraste — ' + viewport.name, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto('/', { waitUntil: 'networkidle' })

    const hero = page.locator('.gym-home-hero')
    await expect(hero).toBeVisible()
    const heroImage = await hero.evaluate((el) => getComputedStyle(el).backgroundImage)
    expect(heroImage).not.toBe('none')

    const service = page.locator('.gym-service-card').first()
    await service.scrollIntoViewIfNeeded()
    await expect(service).toBeVisible()
    await expect(service.locator('img')).toBeVisible()
    const text = await service.evaluate((el) => ({
      heading: getComputedStyle(el.querySelector('h3')).color,
      copy: getComputedStyle(el.querySelector('p')).color,
    }))
    expect(text.heading).toBe('rgb(255, 255, 255)')
    expect(text.copy).not.toBe('rgba(0, 0, 0, 0)')

    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2)).toBe(false)
  })
}

test('modo calma conserva todos los capítulos comerciales de Home', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/', { waitUntil: 'networkidle' })
  await expect(page.locator('.gym-service-card')).toHaveCount(4)
  await expect(page.locator('.gym-process-grid > li')).toHaveCount(3)
  await expect(page.locator('.gym-gift-card')).toHaveCount(3)
  await expect(page.locator('#empieza')).toBeAttached()
})
