import { expect, test } from '@playwright/test'

test('Nosotros es el segundo capítulo y conserva continuidad hacia Servicios', async ({ page }) => {
  await page.goto('/about', { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { level: 1, name: 'DETRÁS DEL MOVIMIENTO.' })).toBeVisible()
  await expect(page.getByText('CAPÍTULO 02 · NOSOTROS')).toBeVisible()
  await expect(page.getByRole('link', { name: /CONOCE QUIÉN ESTÁ DETRÁS/i })).toHaveAttribute('href', '#la-persona')
  await expect(page.locator('#la-persona')).toHaveCount(1)
  await expect(page.getByRole('link', { name: /CONOCE CÓMO TRABAJAMOS/i })).toHaveAttribute('href', '/programs')
  await expect(page.locator('.editorial-outro__feature')).toHaveAttribute('href', '/programs')
})

test('Nosotros escritorio: fotografía, fundador y valores conservan sus secciones', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/about', { waitUntil: 'networkidle' })
  await expect(page.locator('.about-founder__visual img')).toBeVisible()
  await expect.poll(async () => page.locator('.about-founder__visual img').evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true)
  await expect(page.getByRole('heading', { level: 2, name: /UNA MARCA.*UNA PERSONA REAL/i })).toBeVisible()
  for (const id of ['about-purpose-title', 'about-story-title', 'about-values-title', 'about-globe-title', 'about-method-title']) {
    await expect(page.locator(`#${id}`)).toHaveCount(1)
  }
  await expect(page.locator('.about-timeline--stage')).toBeVisible()
  await expect(page.locator('.about-chronicle-mobile')).toBeHidden()
})

test('Nosotros móvil: los cuatro hitos son legibles y no hay desbordamiento horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/about', { waitUntil: 'networkidle' })
  const timeline = page.locator('.about-chronicle-mobile')
  await expect(timeline).toBeVisible()
  await expect(timeline.locator('li')).toHaveCount(4)
  await expect(page.locator('.about-timeline--stage')).toBeHidden()
  const pageSize = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: innerWidth, height: document.documentElement.scrollHeight }))
  expect(pageSize.width).toBeLessThanOrEqual(pageSize.viewport + 3)
  expect(pageSize.height).toBeLessThan(11500)
  await page.getByRole('link', { name: /CONOCE QUIÉN ESTÁ DETRÁS/i }).click()
  await expect(page).toHaveURL(/#la-persona$/)
})
