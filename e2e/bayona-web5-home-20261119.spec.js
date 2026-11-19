import { test, expect } from '@playwright/test'

test('la portada identifica a Sebastián Bayona y ofrece dos recursos de valor inmediato', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'SEBASTIÁN BAYONA.' })).toBeVisible()
  await expect(page.locator('.atelier-hero__subhead')).toHaveText('EL ARTE DE MOVERTE')
  await expect(page.locator('#regalos-gratis')).toHaveCount(1)
  await expect(page.locator('#plan-30-dias')).toHaveCount(1)
  await expect(page.locator('.atelier-experience img').first()).toHaveAttribute('loading', 'lazy')
  expect(errors).toEqual([])
})

test('navegación principal: etiquetas oficiales y dos destinos digitales diferentes', async ({ page }) => {
  await page.goto('/')
  const nav = page.getByRole('navigation', { name: 'Navegación principal' })
  const routes = [
    ['Nosotros', '/about'],
    ['Experiencias', '/programs'],
    ['Parkour Lab', '/parkour-academy'],
    ['El Círculo', '/community'],
    ['BAYONA+', '/app'],
    ['Tienda', '/shop'],
    ['Recursos', '/resources'],
  ]
  for (const [name, href] of routes) {
    await expect(nav.getByRole('link', { name, exact: true })).toHaveAttribute('href', href)
  }
  await expect(page.locator('a.nav-app-entry')).toHaveAttribute('href', '/mi-app/index.html?source=pwa')
  await expect(page.locator('a.nav-app-entry')).toContainText('MI APP')
  // En escritorio la barra compacta oculta su CTA secundario por diseño.
  // La invitación visible del hero debe llegar al mismo contenido gratuito.
  await expect(page.locator('a.nav-cta')).toHaveAttribute('href', '/#regalos-gratis')
  await page.locator('.atelier-hero__actions a[href="#regalos-gratis"]').click()
  await expect(page).toHaveURL(/#regalos-gratis$/)
  await expect(page.locator('#regalos-gratis')).toBeVisible()
})

test('la navegación móvil conserva acceso a academia y contacto sin solaparse', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Abrir menú' }).click()
  const nav = page.getByRole('navigation', { name: 'Navegación móvil' })
  await expect(nav).toBeVisible()
  await expect(nav.getByRole('link', { name: /Academia/ })).toHaveAttribute('href', '/academia')
  await expect(nav.locator('a.gym-mobile-nav-app')).toContainText('ABRIR MI APP')
  await nav.getByRole('link', { name: /Recursos/ }).click()
  await expect(page).toHaveURL(/\/resources$/)
  await expect(nav).toHaveCount(0)
})

test('los ebooks gratuitos son PDF reales, no enlaces vacíos', async ({ request }) => {
  for (const path of [
    '/downloads/sebastian-bayona/tu-primer-mes-de-movimiento.pdf',
    '/downloads/sebastian-bayona/moverte-cada-dia.pdf',
    '/downloads/bayona-editorial/primera-semana.pdf',
  ]) {
    const response = await request.get(path)
    expect(response.status(), path).toBe(200)
    expect(response.headers()['content-type'], path).toMatch(/pdf/i)
  }
})

test('portada legible sin desbordamiento horizontal en móviles', async ({ page }) => {
  for (const width of [360, 390]) {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1, name: 'SEBASTIÁN BAYONA.' })).toBeVisible()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow, `desbordamiento a ${width}px`).toBeLessThanOrEqual(1)
  }
})
