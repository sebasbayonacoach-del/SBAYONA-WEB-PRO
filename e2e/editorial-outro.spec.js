import { expect, test } from '@playwright/test'

const destinations = [
  ['/', '/about'],
  ['/about', '/programs'],
  ['/programs', '/parkour-academy'],
  ['/parkour-academy', '/community'],
  ['/community', '/app'],
  ['/app', '/shop'],
  ['/shop', '/resources'],
  ['/resources', '/faq'],
  ['/faq', '/'],
]

test('cada página editorial cierra con una puerta fotográfica hacia la siguiente y enlaces al resto', async ({ page }) => {
  for (const [current, next] of destinations) {
    await page.goto(current, { waitUntil: 'networkidle' })
    const outro = page.getByRole('complementary', { name: 'Descubre más de BAYONA' })
    await expect(outro).toBeVisible()
    await expect(outro.locator('.editorial-outro__feature')).toHaveAttribute('href', next)
    await expect(outro.getByRole('navigation', { name: 'Otras páginas de BAYONA' }).getByRole('link')).toHaveCount(7)
    await outro.locator('img').scrollIntoViewIfNeeded()
    await expect.poll(async () => outro.locator('img').evaluate((img) => img.complete && img.naturalWidth > 0), { message: `imagen de la puerta en ${current}` }).toBe(true)
    const image = await outro.locator('img').evaluate((img) => ({ width: img.naturalWidth }))
    expect(image.width).toBeGreaterThan(600)
  }
})

test('el cierre funciona desde un móvil sin desbordar ni sustituir el footer', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/', { waitUntil: 'networkidle' })
  await expect(page.locator('.editorial-outro__feature')).toHaveAttribute('href', '/about')
  const width = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, viewport: innerWidth }))
  expect(width.page).toBeLessThanOrEqual(width.viewport + 3)
  await expect(page.locator('.gym-footer')).toBeVisible()
  await page.locator('.editorial-outro__feature').click()
  await expect(page).toHaveURL(/\/about$/)
  await expect(page.locator('.editorial-outro__feature')).toHaveAttribute('href', '/programs')
})

test('no interrumpe los recorridos comerciales ni el panel o rutas no disponibles', async ({ page }) => {
  for (const route of ['/checkout', '/order-confirmation', '/entrar', '/no-existe']) {
    await page.goto(route, { waitUntil: 'networkidle' })
    await expect(page.locator('.editorial-outro')).toHaveCount(0)
  }
})
