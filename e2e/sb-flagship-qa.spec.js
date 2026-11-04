import { test, expect } from '@playwright/test'

test('SB+ presenta la interfaz real y una acción válida', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  const flagship = page.locator('#bayona-plus')
  await expect(flagship).toBeVisible()
  await expect(flagship.getByRole('heading', { name: /UN ESTUDIO.*QUE VA.*CONTIGO/s })).toBeVisible()
  await expect(flagship.getByRole('link', { name: /DESCUBRIR SB/ })).toHaveAttribute('href', '/app')
  await expect(flagship.locator('.sb-flagship__device-screen img')).toHaveAttribute('src', /role-selection-desktop-20261104.png/)
  expect(await flagship.locator('.sb-flagship__device-screen img').evaluate(x => x.complete && x.naturalWidth > 0)).toBe(true)
  expect(errors).toEqual([])
})

test('SB+ alterna entre capturas reales de escritorio y móvil', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const flagship = page.locator('#bayona-plus')
  const desktop = flagship.getByRole('button', { name: /ESCRITORIO/ })
  const mobile = flagship.getByRole('button', { name: /MÓVIL/ })
  await expect(desktop).toHaveAttribute('aria-pressed', 'true')
  await mobile.click()
  await expect(mobile).toHaveAttribute('aria-pressed', 'true')
  await expect(flagship.locator('.sb-flagship__device-screen img')).toHaveAttribute('src', /role-picker-mobile-20261104/)
  await desktop.click()
  await expect(desktop).toHaveAttribute('aria-pressed', 'true')
  await expect(flagship.locator('.sb-flagship__device-screen img')).toHaveAttribute('src', /role-selection/)
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1)
})

for (const width of [320, 390, 837, 1440]) {
  test('SB+ sin recortes ni error visual a ' + width + 'px', async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/')
    const flagship = page.locator('#bayona-plus')
    await flagship.scrollIntoViewIfNeeded()
    await expect(flagship.getByRole('heading')).toBeVisible()
    const image = flagship.locator('.sb-flagship__device-screen img')
    expect(await image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true)
    await expect(flagship.getByRole('button', { name: width <= 600 ? /MÓVIL/ : /ESCRITORIO/ })).toHaveAttribute('aria-pressed','true')
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1)
  })
}

test('La estética pública no pinta misión, tótems o cortinas de recorrido', async ({ page }) => {
  for (const route of ['/programs', '/community', '/shop', '/about']) {
    await page.goto(route)
    await expect(page.locator('.bayona-mission-hud,.bayona-mission-toast,.bayona-cinema-track')).toHaveCount(0)
    expect(await page.getByText('MISIÓN EN CURSO', { exact: true }).count()).toBe(0)
  }
})

test('Experiencias conserva contraste de texto en secciones claras y oscuras', async ({ page }) => {
  await page.goto('/programs')
  await expect(page.locator('.services-overview .services-heading h2 span')).toBeVisible()
  await expect(page.locator('.services-memberships h3').first()).toBeVisible()
  const check = await page.evaluate(() => {
    const fg = sel => getComputedStyle(document.querySelector(sel)).color
    return {
      paperCopy: fg('.services-overview .services-heading p'),
      paperAccent: fg('.services-overview .services-heading h2 span'),
      darkSectionHeading: fg('.services-memberships .services-heading h2'),
      planHeading: fg('.services-memberships h3'),
    }
  })
  expect(check.paperCopy).toBe('rgb(87, 79, 71)')
  expect(check.paperAccent).toBe('rgb(152, 100, 61)')
  expect(check.darkSectionHeading).toBe('rgb(246, 241, 231)')
  expect(check.planHeading).toBe('rgb(246, 241, 231)')
})

test('Nueve páginas principales sin imágenes rotas al recorrerlas', async ({ page }) => {
  for(const route of ['/','/about','/programs','/parkour-academy','/community','/app','/shop','/resources','/faq']) {
    await page.goto(route)
    await page.evaluate(() => {
      document.querySelectorAll('img[loading="lazy"]').forEach(img => { img.loading = 'eager' })
    })
    await page.waitForTimeout(120)
    const bad = await page.locator('img').evaluateAll(images => images.filter(img => img.complete && img.naturalWidth === 0).map(img => img.getAttribute('src')))
    expect(bad, route).toEqual([])
  }
})
