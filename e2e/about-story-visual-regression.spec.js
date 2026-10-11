import { expect, test } from '@playwright/test'

// Reproduce el fallo aportado por el usuario: .about-vertical-word se ocultaba
// pero su rejilla reservaba 34 px, colapsando el titular y un párrafo a 34 px.
for (const width of [390, 768, 1024, 1440, 1700]) {
  test(`Recorrido ${width}px: jerarquía editorial, fotografía real y texto sin columnas fantasma`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/about', { waitUntil: 'networkidle' })
    const section = page.locator('.about-story-scene')
    const photo = section.locator('.about-story-heading__art img')
    await photo.scrollIntoViewIfNeeded()
    await expect.poll(() => photo.evaluate((img) => img.complete && img.naturalWidth > 1000)).toBe(true)
    const sizes = await section.evaluate((el) => {
      const rect = (selector) => {
        const r = el.querySelector(selector).getBoundingClientRect()
        return { x: r.x, width: r.width, height: r.height }
      }
      return {
        heading: rect('.about-story-heading'),
        copyContainer: rect('.about-story-heading > div'),
        title: rect('#about-story-title'),
        paragraph: rect('.about-story-heading .about-problem-copy'),
        art: rect('.about-story-heading__art'),
        sectionHeight: el.getBoundingClientRect().height,
        pageOverflow: document.documentElement.scrollWidth - innerWidth,
      }
    })
    expect(sizes.copyContainer.width, 'La columna editorial no puede volver a 34 px').toBeGreaterThan(260)
    expect(sizes.paragraph.width, 'El texto principal debe tener ancho de lectura').toBeGreaterThan(260)
    expect(sizes.title.width, 'El título debe conservar jerarquía visual').toBeGreaterThan(260)
    expect(sizes.art.width).toBeGreaterThan(250)
    expect(sizes.art.width).toBeLessThanOrEqual(width - 28)
    expect(sizes.sectionHeight).toBeLessThan(2650)
    expect(sizes.pageOverflow).toBeLessThanOrEqual(3)
    if (width >= 761) expect(sizes.art.x).toBeGreaterThan(sizes.copyContainer.x + sizes.copyContainer.width - 6)
    await expect(page.getByRole('heading', { name: /DEL PRIMER SALTO.*A UN MÉTODO CON DIRECCIÓN/i })).toBeVisible()
  })
}

test('Recorrido desktop animado: las cuatro etapas ocupan el ancho completo del escenario', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/about', { waitUntil: 'networkidle' })
  const stage = page.locator('.about-timeline--stage')
  await stage.scrollIntoViewIfNeeded()
  const sizes = await page.evaluate(() => ({
    outer: document.querySelector('.about-timeline--stage').getBoundingClientRect().width,
    entry: document.querySelector('.about-timeline-entry--active').getBoundingClientRect().width,
  }))
  expect(sizes.entry).toBeGreaterThan(sizes.outer * .8)
  await expect(stage.locator('.about-timeline-entry--stage')).toHaveCount(4)
})

test('Recorrido escritorio con movimiento reducido: cuatro hitos compactos, no cuatro pantallas', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/about', { waitUntil: 'networkidle' })
  await expect(page.locator('.about-timeline--stage.sticky-stage--static .sticky-stage-frame')).toHaveCount(4)
  const height = await page.locator('.about-timeline--stage').evaluate((el) => el.getBoundingClientRect().height)
  expect(height).toBeLessThan(950)
})
