import { test, expect } from '@playwright/test'

test('Home presenta el titular de visión con anchura editorial en tablet', async ({ page }) => {
  await page.setViewportSize({ width: 726, height: 950 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const intro = page.locator('.vision-shift-intro')
  await expect(intro).toBeVisible()
  const bounds = await intro.evaluate((el) => {
    const heading = el.querySelector('h2')
    return { heading: heading.getBoundingClientRect().width, container: el.getBoundingClientRect().width }
  })
  expect(bounds.heading / bounds.container).toBeGreaterThan(0.75)
  const staticStage = page.locator('.vision-shift-stage.sticky-stage--static')
  await expect(staticStage.locator('.sticky-stage-frame')).toHaveCount(5)
  const firstRow = staticStage.locator('.sticky-stage-frame').first()
  const rowHeight = await firstRow.evaluate((node) => node.getBoundingClientRect().height)
  expect(rowHeight, 'la secuencia estática no debe reservar una fila visual vacía').toBeLessThan(260)
  const frames = await staticStage.locator('.sticky-stage-frame').evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect()
    const copy = node.querySelector('.vision-shift-copy').getBoundingClientRect()
    return { top: rect.top, bottom: rect.bottom, copyTop: copy.top, copyBottom: copy.bottom }
  }))
  for (let i = 0; i < frames.length; i++) {
    expect(frames[i].copyTop).toBeGreaterThanOrEqual(frames[i].top - 2)
    expect(frames[i].copyBottom).toBeLessThanOrEqual(frames[i].bottom + 2)
    if (i > 0) expect(frames[i].top).toBeGreaterThanOrEqual(frames[i - 1].bottom - 2)
  }
  await intro.scrollIntoViewIfNeeded()
  await page.screenshot({ path: 'test-results/playwright/vision-elite/vision-726.png' })
})

test('Home conserva una secuencia editorial legible en móvil y escritorio', async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const intro = page.locator('.vision-shift-intro')
    await expect(intro.locator('h2')).toContainText('PROGRESAS MEJOR')
    await expect(intro.getByRole('link', { name: /VAMOS A VER CÓMO FUNCIONA/i })).toHaveAttribute('href', '#problemas')
    const staticStage = page.locator('.vision-shift-stage.sticky-stage--static')
    await expect(staticStage.locator('.vision-shift-visual:visible')).toHaveCount(0)
    await expect(staticStage.locator('.vision-shift-copy')).toHaveCount(5)
    const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2)
    expect(horizontalOverflow).toBe(false)
    await intro.scrollIntoViewIfNeeded()
    await page.screenshot({ path: `test-results/playwright/vision-elite/vision-${width}.png` })
  }
})
