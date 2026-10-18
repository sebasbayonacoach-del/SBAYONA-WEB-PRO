import { test, expect } from '@playwright/test'

const ROUTES = ['/', '/about', '/programs', '/parkour-academy', '/community', '/app', '/shop', '/resources', '/faq']
const EXPECTED = ['Nosotros', 'Servicios', 'Parkour', 'Comunidad', 'BAYONA+', 'Tienda', 'Recursos']

for (const route of ROUTES) {
  test('navegación coherente en ' + route, async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 })
    await page.goto(route)
    await expect(page.locator('.desktop-nav')).toBeVisible()
    await expect(page.locator('.menu-button')).toBeHidden()
    const titles = await page.locator('.desktop-nav a').allTextContents()
    const footerTitles = await page.locator('.footer-column').first().locator('a').allTextContents()
    expect(titles.map(x => x.trim().toLowerCase())).toEqual(EXPECTED.map(x => x.toLowerCase()))
    expect(footerTitles.map(x => x.trim())).toEqual(EXPECTED)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
    expect(overflow).toBeLessThanOrEqual(1)
  })
}
test('menú compacto sin duplicación', async ({ page }) => {
  await page.setViewportSize({width: 390, height: 844})
  await page.goto('/resources')
  await expect(page.locator('.desktop-nav')).toBeHidden()
  const toggle = page.getByRole('button', {name: /Abrir menú/i})
  await expect(toggle).toBeVisible()
  await toggle.click()
  await expect(page.getByRole('navigation', {name: 'Navegación móvil'})).toBeVisible()
  await expect(page.getByRole('navigation', {name: 'Navegación móvil'}).getByRole('link', {name: /Parkour/i})).toBeVisible()
})
