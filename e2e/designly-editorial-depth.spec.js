import { expect, test } from '@playwright/test'

test('Comunidad: el argumento y sus tres valores comparten el encuadre editorial de escritorio', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/community', { waitUntil: 'networkidle' })
  const positions = await page.evaluate(() => {
    const find = (selector) => document.querySelector(selector).getBoundingClientRect()
    return { title: find('.community-why .community-section-header'), list: find('.community-why .community-identity-points'), figure: find('.community-why .community-figure--why') }
  })
  expect(positions.title.right).toBeLessThan(positions.list.left)
  expect(Math.abs(positions.title.top - positions.list.top)).toBeLessThan(80)
  expect(positions.figure.bottom).toBeLessThan(positions.title.top)
})

test('Comunidad móvil: título íntegro, sin partición de palabras', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/community', { waitUntil: 'networkidle' })
  const headline = page.locator('.community-why h2')
  await expect(headline).toHaveCSS('hyphens', 'none')
  const metrics = await headline.evaluate((node) => ({
    width: node.getBoundingClientRect().width,
    height: node.getBoundingClientRect().height,
    scrollWidth: document.documentElement.scrollWidth,
    viewport: innerWidth,
  }))
  expect(metrics.width).toBeGreaterThan(290)
  expect(metrics.height).toBeLessThan(220)
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.viewport + 3)
})

test('Nosotros: declaración legible y sin ocupación de pantalla innecesaria', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/about', { waitUntil: 'networkidle' })
  const h2 = page.locator('.about-problem-heading h2')
  const metrics = await h2.evaluate((node) => ({ width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height }))
  expect(metrics.width).toBeGreaterThan(650)
  expect(metrics.height).toBeLessThan(240)
})
