import { expect, test } from '@playwright/test'

for (const viewport of [
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet', width: 726, height: 950 },
  { name: 'desktop', width: 1440, height: 900 },
]) {
  test(`BAYONA: formatos de dispositivos y contraste real — ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    const stage = page.locator('.vision-shift-stage--spatial')
    await stage.scrollIntoViewIfNeeded()
    const types = await stage.locator('.vision-spatial-frame').evaluateAll((frames) =>
      frames.reduce((result, el) => {
        result[el.dataset.device] = (result[el.dataset.device] || 0) + 1
        return result
      }, {}),
    )
    expect(types).toEqual({ phone: 5, coach: 3, desktop: 2 })
    await expect(stage.locator('.vision-spatial-frame img')).toHaveCount(10)
    await expect(stage.locator('.vision-spatial-phone-bar')).toHaveCount(5)
    await expect(stage.locator('.vision-spatial-keyboard')).toHaveCount(2)
    await expect(stage.locator('.vision-spatial-frame--coach')).toHaveCount(3)

    const intro = page.locator('.pain-unlock-intro')
    await intro.scrollIntoViewIfNeeded()
    const colors = await intro.evaluate((el) => ({
      heading: getComputedStyle(el.querySelector('h2')).color,
      body: getComputedStyle(el.querySelector('span')).color,
    }))
    expect(colors.heading).toBe('rgb(247, 247, 243)')
    expect(colors.body).toBe('rgba(247, 247, 243, 0.78)')
    const overflows = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2)
    expect(overflows).toBe(false)
    expect(errors).toEqual([])
    await page.screenshot({ path: `test-results/playwright/vision-devices/contrast-${viewport.name}.png` })
  })
}

test('modo calma mantiene los cinco capítulos sin requerir galería animada', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const stage = page.locator('.vision-shift-stage--spatial.sticky-stage--static')
  await expect(stage.locator('.sticky-stage-frame')).toHaveCount(5)
  await expect(stage.locator('.vision-spatial-frame')).toHaveCount(0)
  await expect(stage.locator('a[href="/programs"]')).toBeVisible()
})
