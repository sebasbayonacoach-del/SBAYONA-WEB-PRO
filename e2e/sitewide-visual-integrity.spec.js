import { expect, test } from '@playwright/test'

const publicRoutes = [
  '/', '/about', '/programs', '/parkour-academy', '/shop',
  '/app', '/community', '/resources', '/faq', '/entrar',
  '/plan/raiz', '/checkout',
]

test('los doce recorridos públicos funcionan sin desbordamiento con ambas apariencias en móvil', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const findings = []
  for (const theme of ['day', 'night']) {
    await page.addInitScript(next => localStorage.setItem('bayona-site-theme', next), theme)
    for (const route of publicRoutes) {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' })
      await expect(page.locator('html')).toHaveAttribute('data-bayona-theme', theme)
      await expect(page.locator('main')).toBeAttached()
      await page.locator('main h1, main h2').first().waitFor({ state: 'attached', timeout: 15000 })
      const layout = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth + 3,
        width: document.documentElement.scrollWidth,
        hasContent: Boolean(document.querySelector('main h1, main h2')),
      }))
      if (!response?.ok() || layout.overflow || !layout.hasContent) {
        findings.push({ theme, route, status: response?.status(), ...layout })
      }
    }
  }
  expect(findings).toEqual([])
})

test('la tienda en modo día tiene encabezados oscuros sobre un catálogo claro', async ({ page }) => {
  await page.goto('/shop', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Modo día' }).click()
  const category = page.locator('.shop-categories')
  await category.scrollIntoViewIfNeeded()
  await expect(category).toHaveCSS('background-color', 'rgb(247, 243, 235)')
  await expect(category.locator('h2')).toHaveCSS('color', 'rgb(32, 27, 23)')
  await expect(category.locator('.shop-categories-head > p:last-child')).toHaveCSS('color', 'rgb(100, 88, 78)')
  await expect(category.getByRole('button', { name: /ropa entreno/i })).toBeVisible()
})

test('BAYONA+ mantiene texto legible sobre paneles oscuros en modo día', async ({ page }) => {
  await page.goto('/app', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Modo día' }).click()
  for (const selector of ['.app-concept', '.app-program-connection']) {
    const section = page.locator(selector)
    await section.scrollIntoViewIfNeeded()
    await expect(section.locator('.app-section-content')).toHaveCSS('background-color', 'rgb(8, 8, 8)')
    await expect(section.locator('.app-section-title')).toHaveCSS('color', 'rgb(247, 245, 241)')
    await expect(section.locator('.app-section-subtitle')).toHaveCSS('color', 'rgb(215, 206, 197)')
  }
  await expect(page.locator('.navbar')).toHaveCSS('background-color', 'rgb(247, 243, 235)')
})

test('planes muestran contraste correcto entre método oscuro y límites claros', async ({ page }) => {
  await page.goto('/plan/raiz', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Modo día' }).click()
  await expect(page.locator('.plan-presentation-method .ds-method-step__title').first())
    .toHaveCSS('color', 'rgb(247, 245, 241)')
  const excluded = page.locator('.plan-presentation-not-included')
  await expect(excluded).toHaveCSS('background-color', 'rgb(237, 230, 218)')
  await expect(excluded.locator('h3')).toHaveCSS('color', 'rgb(32, 27, 23)')
})

test('los héroes diurnos de Nosotros, Parkour y Comunidad usan imágenes sin perder lectura', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Modo día' }).click()

  const cases = [
    ['/about', '.page-hero-backdrop', 'about-hero-1600.webp'],
    ['/parkour-academy', '.academy-hero', 'parkour-hero-1600.webp'],
    ['/community', '.community-hero', 'community-hero-1600.webp'],
  ]
  for (const [route, selector, filename] of cases) {
    await page.goto(route, { waitUntil: 'networkidle' })
    const hero = page.locator(selector).first()
    await expect(hero).toBeVisible()
    await expect.poll(() => hero.evaluate(el => getComputedStyle(el).backgroundImage))
      .toContain(filename)
    expect((await page.request.get('/images/bayona-generated/' + filename)).ok()).toBe(true)
  }

  await page.goto('/parkour-academy', { waitUntil: 'networkidle' })
  const heroTitleHeight = await page.locator('.academy-hero h1').evaluate(el => el.getBoundingClientRect().height)
  expect(heroTitleHeight).toBeLessThan(240)
  await expect(page.locator('.breadcrumb-item [aria-current="page"]'))
    .toHaveCSS('color', 'rgb(32, 27, 23)')
})
