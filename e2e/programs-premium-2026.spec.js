import { expect, test } from '@playwright/test'

const services = [
  ['personal', 'Entrenamiento personal', '#servicios-clases'],
  ['online', 'Entrenamiento online', '#membresias'],
  ['parkour', 'Parkour y rendimiento', '/parkour-academy'],
  ['recovery', 'Movilidad y recuperación', '#servicios-recuperación'],
]

for (const width of [390, 768, 1440]) {
  test(`Página de servicios: cuatro opciones, fotografías y diseño a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 860 })
    await page.goto('/programs', { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { level: 1, name: 'NUESTROS SERVICIOS.' })).toBeVisible()
    await expect(page.locator('.services-path-card')).toHaveCount(4)

    const rects = []
    for (const [id, name, destination] of services) {
      const card = page.locator(`.services-path-card--${id}`)
      await expect(card).toHaveAttribute('href', destination)
      await expect(card.getByRole('heading', { level: 3 })).toHaveText(name)
      await card.scrollIntoViewIfNeeded()
      await expect.poll(() => card.locator('img').evaluate(img => img.complete && img.naturalWidth > 1000)).toBe(true)
      await expect(card.locator('img')).toHaveCSS('display', 'block')
      rects.push(await card.evaluate(el => ({ width: el.getBoundingClientRect().width, top: el.getBoundingClientRect().top + scrollY })))
    }

    if (width === 1440) {
      expect(rects[0].width).toBeGreaterThan(rects[1].width + 140)
      expect(rects[3].width).toBeGreaterThan(rects[2].width + 140)
    } else if (width === 390) {
      expect(rects[0].top).toBeLessThan(rects[1].top)
      expect(rects[1].top).toBeLessThan(rects[2].top)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 3)).toBe(false)
  })
}

test('Servicios: catálogo secundario con nombres comprensibles, precios reales y desplegables', async ({ page }) => {
  await page.goto('/programs', { waitUntil: 'networkidle' })
  const titles = await page.locator('.services-catalog-summary__name strong').allInnerTexts()
  expect(titles).toEqual(['Sesiones guiadas', 'Movilidad y recuperación', 'Parkour y preparación'])
  await expect(page.locator('.services-card')).toHaveCount(16)
  await expect(page.locator('.services-catalog-details[open]')).toHaveCount(1)

  const mobility = page.locator('#servicios-recuperación details')
  await mobility.locator('summary').click()
  await expect(mobility).toHaveAttribute('open', '')
  await expect(mobility.getByRole('heading', { name: 'Yoga y movilidad guiada' })).toBeVisible()
  await expect(mobility.locator('.services-card__top strong').first()).toContainText('COP')

  const parkour = page.locator('#servicios-rendimiento details')
  await parkour.locator('summary').click()
  await expect(parkour.getByRole('heading', { name: 'Hábitos para el rendimiento' })).toBeVisible()
  await expect(page.getByText('Biohacking', { exact: true })).toHaveCount(0)
})

test('Servicios: enlaces de la Home activan el grupo correcto y el destino de parkour', async ({ page }) => {
  await page.goto('/programs#servicios-recuperaci%C3%B3n', { waitUntil: 'networkidle' })
  await expect(page.locator('#servicios-recuperación details')).toHaveAttribute('open','')
  await page.goto('/programs', { waitUntil: 'networkidle' })
  await page.locator('.services-path-card--online').click()
  await expect(page).toHaveURL(/\/programs#membresias$/)
  await expect(page.locator('#membresias')).toBeAttached()
  await page.locator('.services-path-card--parkour').click()
  await expect(page).toHaveURL(/\/parkour-academy$/)
})

test('Servicios: modo día respeta contraste y abre consulta con el nombre publicado', async ({ page }) => {
  await page.goto('/programs', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Modo día' }).click()
  await expect(page.locator('.services-page .services-overview')).toHaveCSS('background-color', 'rgb(247, 243, 235)')
  await expect(page.locator('.services-card').first().locator('p')).toHaveCSS('color', 'rgb(100, 88, 78)')
  await expect(page.locator('.services-scope-note')).toHaveCSS('color', 'rgb(100, 88, 78)')
  const url = await page.locator('.services-card').first().locator('a').getAttribute('href')
  expect(decodeURIComponent(url)).toContain('Entrenamiento individual online')
  expect(url).toMatch(/^https:\/\/wa\.me\//)
})
