import { expect, test } from '@playwright/test'

const services = [
  ['personal', 'Entrenamiento personal', '/programs#servicios-clases'],
  ['online', 'Entrenamiento online', '/programs#membresias'],
  ['parkour', 'Parkour y rendimiento', '/parkour-academy'],
  ['recovery', 'Movilidad y recuperación', '/programs#servicios-recuperación'],
]

for (const width of [390, 768, 1440]) {
  test(`Servicios BAYONA: jerarquía editorial, imágenes y sin cortes a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/', { waitUntil: 'networkidle' })
    const section = page.locator('#servicios.gym-home-services')
    await expect(section.getByRole('heading', { level: 2 })).toHaveText(/TU OBJETIVO.*TU FORMA DE MOVERTE/s)
    await expect(section.locator('.gym-service-card')).toHaveCount(4)

    const dimensions = []
    for (const [id, heading, href] of services) {
      const card = section.locator(`.gym-service-card--${id}`)
      await expect(card).toHaveAttribute('href', href)
      await expect(card.getByRole('heading', { level: 3 })).toHaveText(heading)
      await expect(card.getByText('DESCUBRIR EL SERVICIO')).toBeVisible()
      await card.scrollIntoViewIfNeeded()
      await expect.poll(() => card.locator('img').evaluate(img => img.complete && img.naturalWidth >= 1000)).toBe(true)
      await expect(card.locator('.gym-service-card__veil')).toHaveCSS('background-image', /linear-gradient/)
      const box = await card.evaluate(el => {
        const rect = el.getBoundingClientRect()
        return { width: rect.width, height: rect.height, y: rect.top + window.scrollY }
      })
      dimensions.push(box)
    }

    if (width >= 1000) {
      expect(dimensions[0].width).toBeGreaterThan(dimensions[1].width + 150)
      expect(dimensions[3].width).toBeGreaterThan(dimensions[2].width + 150)
    } else if (width <= 650) {
      expect(Math.abs(dimensions[0].width - dimensions[1].width)).toBeLessThan(3)
      expect(dimensions[0].y).toBeLessThan(dimensions[1].y)
      expect(dimensions[1].y).toBeLessThan(dimensions[2].y)
    } else {
      expect(Math.abs(dimensions[0].width - dimensions[1].width)).toBeLessThan(3)
      expect(dimensions[0].y).toBe(dimensions[1].y)
    }

    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 3)).toBe(false)
  })
}

test('Servicios: contraste en ambos temas y navegación específica a parkour', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  for (const theme of ['night', 'day']) {
    const active = await page.locator('html').getAttribute('data-bayona-theme')
    if (active !== theme) await page.getByRole('button', { name: 'Modo día' }).click()
    const probe = await page.locator('.gym-service-card--parkour').evaluate(el => ({
      image: el.querySelector('img').currentSrc,
      title: getComputedStyle(el.querySelector('h3')).color,
      callToAction: getComputedStyle(el.querySelector('.gym-service-card__bottom')).color,
    }))
    expect(probe.image).toContain('/parkour-hero-1600.webp')
    expect(probe.title).toBe('rgb(255, 255, 255)')
    expect(probe.callToAction).toBe('rgb(255, 255, 255)')
  }

  await page.locator('.gym-service-card--parkour').click()
  await expect(page).toHaveURL(/\/parkour-academy$/)
})

test('Servicios: movilidad dirige a Recuperación y la membresía online a sus planes', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.locator('.gym-service-card--recovery').click()
  await expect(page).toHaveURL(/\/programs#servicios-recuperaci%C3%B3n$/i)
  await expect(page.locator('[id="servicios-recuperación"]')).toBeAttached()

  await page.goto('/', { waitUntil: 'networkidle' })
  await page.locator('.gym-service-card--online').click()
  await expect(page).toHaveURL(/\/programs#membresias$/)
  await expect(page.locator('#membresias')).toBeAttached()
})

test('Servicios: accesibilidad de enlaces y movimientos reducidos', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/', { waitUntil: 'networkidle' })
  const card = page.locator('.gym-service-card--personal')
  await card.focus()
  await expect(card).toBeFocused()
  const transition = await card.locator('img').evaluate(img => getComputedStyle(img).transitionDuration)
  expect(transition.split(',').every(x => Number.parseFloat(x) < 0.02)).toBe(true)
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/programs#servicios-clases$/)
})

