import { test, expect } from '@playwright/test'

test('Home V2 presenta una jerarquía editorial clara en tablet', async ({ page }) => {
  await page.setViewportSize({ width: 726, height: 950 })
  await page.goto('/', { waitUntil: 'networkidle' })

  const hero = page.locator('.gym-home-hero__content')
  await expect(hero).toBeVisible()
  const h1 = hero.locator('h1')
  await expect(h1).toHaveText('ENTRENA CON DIRECCIÓN.')
  const box = await h1.boundingBox()
  expect(box.width).toBeLessThanOrEqual(726)

  await expect(page.locator('.gym-process-grid > li')).toHaveCount(3)
  await expect(page.locator('.home-memberships-section .plan-explorer')).toBeAttached()
})

test('Home V2 conserva una secuencia comercial legible en móvil y escritorio', async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/', { waitUntil: 'networkidle' })

    await expect(page.getByRole('heading', { level: 2, name: /TU OBJETIVO.*TU FORMA DE MOVERTE/i })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: /TRES PASOS PARA EMPEZAR/i })).toBeAttached()
    await expect(page.getByRole('heading', { level: 2, name: /PRIMERO RECIBES VALOR/i })).toBeAttached()
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2)).toBe(false)
  }
})
