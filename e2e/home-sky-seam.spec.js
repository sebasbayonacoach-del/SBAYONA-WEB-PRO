import { expect, test } from '@playwright/test'

const VIEWPORTS = [
  { id: 'phone-390', width: 390, height: 844 },
  { id: 'tablet-686', width: 686, height: 920 },
  { id: 'desktop-1440', width: 1440, height: 900 },
]

for (const viewport of VIEWPORTS) {
  test('Home V2 hero fotográfico entrega el primer bloque sin corte ni overflow — ' + viewport.id, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto('/', { waitUntil: 'networkidle' })

    const hero = page.locator('.gym-home-hero')
    const services = page.locator('.gym-home-services')
    await expect(hero).toBeVisible()
    await expect(services).toBeAttached()

    const heroStyle = await hero.evaluate((el) => {
      const rect = el.getBoundingClientRect()
      return {
        backgroundImage: getComputedStyle(el).backgroundImage,
        width: rect.width,
        height: rect.height,
      }
    })
    expect(heroStyle.backgroundImage).not.toBe('none')
    expect(heroStyle.width).toBeGreaterThanOrEqual(viewport.width - 2)
    expect(heroStyle.height).toBeGreaterThan(480)

    const geometry = await page.evaluate(() => {
      const hero = document.querySelector('.gym-home-hero').getBoundingClientRect()
      const services = document.querySelector('.gym-home-services').getBoundingClientRect()
      return { heroBottom: hero.bottom + scrollY, servicesTop: services.top + scrollY }
    })
    expect(Math.abs(geometry.servicesTop - geometry.heroBottom)).toBeLessThanOrEqual(4)
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 3)).toBe(false)
  })
}

test('Reduced motion conserva hero, servicios y primer CTA', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/', { waitUntil: 'networkidle' })

  await expect(page.getByRole('heading', { level: 1, name: 'ENTRENA CON DIRECCIÓN.' })).toBeVisible()
  await expect(page.getByRole('link', { name: /EMPIEZA GRATIS/i })).toHaveAttribute('href', '#empieza')
  await expect(page.locator('.gym-service-card')).toHaveCount(4)
})
