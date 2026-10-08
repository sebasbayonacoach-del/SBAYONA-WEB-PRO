import { expect, test } from '@playwright/test'

const photographicHeroes = [
  ['/shop', '.shop-hero', 'shop-hero-1600.webp'],
  ['/app', '.app-hero', 'app-hero-1600.webp'],
  ['/community', '.community-hero', 'community-hero-1600.webp'],
]

test('fotografías de marca visibles en las tres cabeceras nocturnas', async ({ page }) => {
  for (const [route, selector, asset] of photographicHeroes) {
    await page.goto(route, { waitUntil: 'networkidle' })
    await expect(page.locator('html')).toHaveAttribute('data-bayona-theme', 'night')
    const hero = page.locator(selector).first()
    await expect(hero).toHaveCSS('background-image', new RegExp(asset.replace('.', '\\.')))
    expect((await page.request.get(`/images/bayona-generated/${asset}`)).ok()).toBe(true)
  }
})

test('Comunidad y Recursos muestran títulos sin guiones de partición automáticos', async ({ page }) => {
  for (const [route, selector] of [
    ['/community', '.community-hero-title'],
    ['/resources', '.resources-hero-copy h1'],
  ]) {
    await page.goto(route, { waitUntil: 'networkidle' })
    await expect(page.locator(selector)).toHaveCSS('hyphens', 'none')
    const width = await page.locator(selector).evaluate(el => el.getBoundingClientRect().width)
    expect(width, `${route} must have a meaningful editorial headline width`).toBeGreaterThan(500)
  }
})

test('la tienda conserva logo, selector de tema, carrito y menú en una sola barra móvil', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/shop', { waitUntil: 'networkidle' })
  const metrics = await page.evaluate(() => {
    const navbar = document.querySelector('.navbar').getBoundingClientRect()
    const controls = ['.brand', '.site-theme-toggle', '.nav-cart-button', '.menu-button']
      .map(selector => document.querySelector(`.navbar ${selector}`).getBoundingClientRect())
    const heading = document.querySelector('.shop-hero h1').getBoundingClientRect()
    return { navbarBottom: navbar.bottom, controlBottoms: controls.map(r => r.bottom), titleTop: heading.top, overflow: document.documentElement.scrollWidth > innerWidth + 3 }
  })
  expect(metrics.controlBottoms.every(bottom => bottom <= metrics.navbarBottom + 2)).toBe(true)
  expect(metrics.titleTop).toBeGreaterThan(125)
  expect(metrics.overflow).toBe(false)
})
