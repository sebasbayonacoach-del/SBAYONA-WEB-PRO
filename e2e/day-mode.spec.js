import { expect, test } from '@playwright/test'

test('el modo noche es el predeterminado y cambiar a día ilumina Home', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await expect(page.locator('html')).toHaveAttribute('data-bayona-theme', 'night')

  await page.getByRole('button', { name: 'Activar modo día' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-bayona-theme', 'day')
  await expect(page.getByRole('button', { name: 'Activar modo noche' })).toHaveAttribute('aria-pressed', 'true')

  const colors = await page.evaluate(() => ({
    sheet: getComputedStyle(document.querySelector('.gym-home')).backgroundColor,
    process: getComputedStyle(document.querySelector('.gym-home-process')).backgroundColor,
    hero: getComputedStyle(document.querySelector('.gym-home-hero')).backgroundColor,
  }))
  expect(colors.sheet).toBe('rgb(247, 243, 235)')
  expect(colors.process).toBe('rgb(239, 233, 223)')
  expect(colors.hero).toBe('rgb(8, 7, 6)')
})

test('el día persiste al recargar y navegar; noche restaura el tema original', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Activar modo día' }).click()

  await page.reload({ waitUntil: 'networkidle' })
  await expect(page.locator('html')).toHaveAttribute('data-bayona-theme', 'day')
  expect(await page.evaluate(() => localStorage.getItem('bayona-site-theme'))).toBe('day')

  await page.goto('/shop', { waitUntil: 'networkidle' })
  await expect(page.locator('html')).toHaveAttribute('data-bayona-theme', 'day')
  await expect(page.locator('.shop-page')).toHaveCSS('background-color', 'rgb(247, 243, 235)')

  await page.getByRole('button', { name: 'Activar modo noche' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-bayona-theme', 'night')
  await page.reload({ waitUntil: 'networkidle' })
  await expect(page.locator('html')).toHaveAttribute('data-bayona-theme', 'night')
})

test('el selector está disponible en móvil y convive con el menú', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/', { waitUntil: 'networkidle' })
  const toggle = page.getByRole('button', { name: 'Activar modo día' })
  await expect(toggle).toBeVisible()
  const box = await toggle.boundingBox()
  expect(box.width).toBeGreaterThanOrEqual(44)
  expect(box.height).toBeGreaterThanOrEqual(44)

  await toggle.click()
  await page.getByRole('button', { name: 'Abrir menú' }).click()
  await expect(page.getByRole('navigation', { name: 'Navegación móvil' })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('data-bayona-theme', 'day')
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 3)).toBe(false)
})

test('el modo día no oculta la fotografía de los servicios ni los regalos', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Activar modo día' }).click()

  for (const selector of ['.gym-service-card img', '.gym-gift-card img']) {
    const image = page.locator(selector).first()
    await image.scrollIntoViewIfNeeded()
    await expect(image).toBeVisible()
    await expect.poll(() => image.evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true)
  }
  await expect(page.locator('.gym-home-hero h1')).toBeVisible()
  await expect(page.locator('#empieza')).toBeAttached()
})
