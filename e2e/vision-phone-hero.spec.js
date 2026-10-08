import { expect, test } from '@playwright/test'

for (const { width, height } of [
  { width: 390, height: 844 },
  { width: 726, height: 950 },
  { width: 1440, height: 900 },
]) {
  test('hero gimnasio-first, lectura y CTA — ' + width + 'px', async ({ page }) => {
    await page.setViewportSize({ width, height })
    await page.goto('/', { waitUntil: 'networkidle' })

    const hero = page.locator('.gym-home-hero')
    await expect(hero).toBeVisible()
    await expect(hero.getByRole('heading', { level: 1, name: 'ENTRENA CON DIRECCIÓN.' })).toBeVisible()
    await expect(hero.getByRole('link', { name: /EMPIEZA GRATIS/i })).toHaveAttribute('href', '#empieza')
    await expect(hero.getByRole('link', { name: /^VER SERVICIOS/i })).toHaveAttribute('href', '/programs')

    const box = await hero.boundingBox()
    expect(box.width).toBeGreaterThanOrEqual(width - 2)
    expect(box.height).toBeGreaterThan(480)
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2)).toBe(false)
  })
}

test('modo reducido mantiene CTA y contenido completo', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/', { waitUntil: 'networkidle' })
  await expect(page.getByRole('link', { name: /EMPIEZA GRATIS/i })).toHaveAttribute('href', '#empieza')
  await expect(page.locator('.gym-service-card')).toHaveCount(4)
  await expect(page.locator('.gym-gift-card')).toHaveCount(3)
})
