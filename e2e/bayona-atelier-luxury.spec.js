import { test, expect } from '@playwright/test'

test('SEBASTIAN BAYONA Atelier: inicio editorial accesible y sin estadísticas inventadas', async ({ page }) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /EL ARTE.*DE MOVERTE/s })).toBeVisible()
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.locator('.atelier-experience')).toHaveCount(3)
  await expect(page.locator('.bayona-mission-toast')).toHaveCount(0)
  await expect(page.locator('.bayona-mission-hud')).toHaveCount(0)
  await expect(page.locator('body')).toHaveClass(/bayona-luxury-active/)
  await expect(page.locator('.atelier-experience').nth(0)).toHaveAttribute('href', '/programs')
  await expect(page.locator('.atelier-experience').nth(1)).toHaveAttribute('href', '/parkour-academy')
  await expect(page.locator('.sb-flagship__primary')).toHaveAttribute('href', '/app')
  await expect(page.locator('.atelier-contact__actions a').first()).toHaveAttribute('href', /wa\.me\/34\d{9}/)
  expect((await page.locator('body').innerText()).includes('2.814')).toBe(false)
  expect(errors).toEqual([])
})

test('BAYONA Atelier: recursos reales y galería documental funcionan', async ({ page, request }) => {
  await page.goto('/')
  await expect(page.locator('.atelier-resource')).toHaveCount(3)
  const hrefs = await page.locator('.atelier-resource').evaluateAll((items) => items.map((item) => item.getAttribute('href')))
  for (const href of hrefs) {
    const result = await request.get(href)
    expect(result.ok(), href).toBe(true)
    expect(result.headers()['content-type']).toContain('application/pdf')
  }
  await expect(page.locator('#archivo-real .bayona-real-archive__launch')).toHaveCount(8)
  await expect(page.locator('#archivo-real video')).toHaveCount(0)
  await page.locator('#archivo-real .bayona-real-archive__launch').first().click()
  await expect(page.locator('#archivo-real video')).toHaveCount(1)
  expect(await page.locator('#archivo-real video').evaluate((video) => video.muted)).toBe(true)
})

for (const width of [320, 360, 390, 768, 1440]) {
  test(`BAYONA Atelier responsive: ${width}px sin desbordamiento`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /EL ARTE.*DE MOVERTE/s })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1)
    await page.locator('#experiencias').scrollIntoViewIfNeeded()
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1)
    await page.locator('#bayona-plus').scrollIntoViewIfNeeded()
    await expect(page.locator('.sb-flagship__device-screen img')).toHaveJSProperty('complete', true)
    expect(await page.locator('.sb-flagship__device-screen img').evaluate((img) => img.naturalWidth)).toBeGreaterThan(0)
  })
}

test('Navegación real: programas, parkour y aplicación responden', async ({ request }) => {
  for (const path of ['/programs', '/parkour-academy', '/app']) {
    const response = await request.get(path)
    expect(response.ok(), path).toBe(true)
  }
})
