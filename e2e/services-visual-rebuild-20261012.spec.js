import { test, expect } from '@playwright/test'

test('Servicios: arquitectura, anclas y comparación real de planes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/programs')
  await expect(page.getByRole('heading', { name: /NUESTROS SERVICIOS\./ })).toBeVisible()
  await expect(page.locator('.services-path-card')).toHaveCount(4)
  await expect(page.locator('.services-wayfinder a')).toHaveCount(3)
  await expect(page.locator('.services-overview-card')).toHaveCount(3)

  await page.locator('.services-wayfinder a[href="#membresias"]').click()
  await expect(page).toHaveURL(/#membresias$/)
  await expect(page.locator('.plan-showroom-stage')).toBeVisible()

  const rects = await page.evaluate(() => ({
    stage: document.querySelector('.services-memberships .plan-showroom-stage').getBoundingClientRect().width,
    menu: document.querySelector('.services-memberships .plan-comparison-list').getBoundingClientRect().width,
    overlay: getComputedStyle(document.querySelector('.services-memberships'), '::after').display,
    horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
  }))
  expect(rects.stage).toBeGreaterThan(rects.menu * 1.4)
  expect(rects.overlay).toBe('none')
  expect(rects.horizontalOverflow).toBeLessThanOrEqual(1)

  const tabs = page.locator('.services-memberships .plan-showroom-tab')
  const next = tabs.nth(2)
  await next.click()
  await expect(next).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.services-memberships .plan-showroom-stage')).toHaveAttribute('data-active-plan', /.+/)
})

for (const theme of ['day', 'night']) {
  test(`Servicios: alto contraste y responsive 390px (${theme})`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.addInitScript((value) => {
      localStorage.setItem('bayona-site-theme', value)
    }, theme)
    await page.goto('/programs')
    await expect(page.locator('.services-path-card')).toHaveCount(4)
    const result = await page.evaluate(() => {
      const s = document.querySelector('.services-memberships')
      const plan = document.querySelector('.services-memberships .plan-showroom-preview')
      const title = document.querySelector('.services-memberships .plan-showroom-tab-copy strong')
      return {
        overflow: document.documentElement.scrollWidth - innerWidth,
        overlay: getComputedStyle(s,'::before').display,
        background: getComputedStyle(plan).backgroundColor,
        title: getComputedStyle(title).color,
      }
    })
    expect(result.overflow).toBeLessThanOrEqual(1)
    expect(result.overlay).toBe('none')
    expect(result.background).toBe('rgb(37, 38, 34)')
    expect(result.title).toBe('rgb(244, 238, 229)')
    await expect(page.locator('.services-wayfinder')).toBeVisible()
  })
}
