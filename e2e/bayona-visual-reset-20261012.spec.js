import { test, expect } from '@playwright/test'

const routes = [
  ['home', '/'],
  ['about', '/about'],
  ['services', '/programs'],
  ['parkour', '/parkour-academy'],
  ['community', '/community'],
  ['app', '/app'],
  ['shop', '/shop'],
  ['resources', '/resources'],
  ['faq', '/faq'],
  ['404', '/visual-reset-404-check'],
]

for (const [name, path] of routes) {
  for (const viewport of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844 },
  ]) {
    test(`${name} / ${viewport.name}: render estable y sin overflow`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.addInitScript(() => {
        localStorage.setItem('bayona-site-theme', 'night')
        localStorage.setItem('bayona-language-banner-dismissed', '1')
      })
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      await page.goto(path, { waitUntil: 'domcontentloaded' })
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 })
      await page.waitForTimeout(250)

      const state = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - innerWidth,
        viteOverlay: Boolean(document.querySelector('vite-error-overlay')),
        footer: Boolean(document.querySelector('.footer')),
      }))

      expect(errors).toEqual([])
      expect(state.viteOverlay).toBe(false)
      expect(state.overflow).toBeLessThanOrEqual(1)
      expect(state.footer).toBe(true)
    })
  }
}

test('Servicios: membresías con contraste oscuro real', async ({ page }) => {
  await page.goto('/programs')
  await expect(page.locator('.services-memberships')).toBeVisible()
  const result = await page.locator('.services-memberships').evaluate(section => {
    const preview = section.querySelector('.plan-showroom-preview')
    const before = getComputedStyle(section, '::before')
    const after = getComputedStyle(section, '::after')
    return {
      before: before.display,
      after: after.display,
      previewBackground: getComputedStyle(preview).backgroundImage,
      previewColor: getComputedStyle(preview).color,
    }
  })
  expect(result.before).toBe('none')
  expect(result.after).toBe('none')
  expect(result.previewBackground).toBe('none')
  expect(result.previewColor).not.toBe('rgb(255, 255, 255)')
})

test('About móvil: testimonios dejan de usar runway kilométrico', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/about')
  await expect(page.locator('.about-globe-section')).toBeVisible()
  const state = await page.evaluate(() => ({
    runway: Math.round(document.querySelector('.globe-atlas-runway')?.getBoundingClientRect().height || 0),
    stage: Math.round(document.querySelector('.globe-testimonials-stage')?.getBoundingClientRect().height || 0),
    markers: document.querySelectorAll('.globe-testimonials-location-index button').length,
  }))
  expect(state.runway).toBeLessThan(5000)
  expect(state.stage).toBeGreaterThan(200)
  expect(state.stage).toBeLessThan(1200)
  expect(state.markers).toBeGreaterThan(0)
})

test('Home móvil: comparador elimina la columna ornamental', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await expect(page.locator('.gym-home-plans')).toBeVisible()
  const signature = page.locator('.gym-home-plans .plan-showroom-signature')
  await expect(signature).toBeHidden()
  const stageHeight = await page.locator('.gym-home-plans .plan-showroom-stage').evaluate(
    node => Math.round(node.getBoundingClientRect().height),
  )
  expect(stageHeight).toBeLessThan(1600)
})
