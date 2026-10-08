import { expect, test } from '@playwright/test'

test('el modo noche es el predeterminado y cambiar a día ilumina Home', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await expect(page.locator('html')).toHaveAttribute('data-bayona-theme', 'night')

  await page.getByRole('button', { name: 'Modo día' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-bayona-theme', 'day')
  await expect(page.getByRole('button', { name: 'Modo día' })).toHaveAttribute('aria-pressed', 'true')

  const colors = await page.evaluate(() => ({
    sheet: getComputedStyle(document.querySelector('.gym-home')).backgroundColor,
    process: getComputedStyle(document.querySelector('.gym-home-process')).backgroundColor,
    hero: getComputedStyle(document.querySelector('.gym-home-hero')).backgroundColor,
  }))
  expect(colors.sheet).toBe('rgb(247, 243, 235)')
  expect(colors.process).toBe('rgb(239, 233, 223)')
  expect(colors.hero).toBe('rgb(8, 7, 6)')
})

test('el día persiste al recargar y navegar; noche restaura el tema original', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Modo día' }).click()

  await page.reload({ waitUntil: 'networkidle' })
  await expect(page.locator('html')).toHaveAttribute('data-bayona-theme', 'day')
  expect(await page.evaluate(() => localStorage.getItem('bayona-site-theme'))).toBe('day')

  await page.goto('/shop', { waitUntil: 'networkidle' })
  await expect(page.locator('html')).toHaveAttribute('data-bayona-theme', 'day')
  await expect(page.locator('.shop-page')).toHaveCSS('background-color', 'rgb(247, 243, 235)')

  await page.getByRole('button', { name: 'Modo día' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-bayona-theme', 'night')
  await page.reload({ waitUntil: 'networkidle' })
  await expect(page.locator('html')).toHaveAttribute('data-bayona-theme', 'night')
})

test('el selector está disponible en móvil y convive con el menú', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/', { waitUntil: 'networkidle' })
  const toggle = page.getByRole('button', { name: 'Modo día' })
  await expect(toggle).toBeVisible()
  const box = await toggle.boundingBox()
  expect(box.width).toBeGreaterThanOrEqual(44)
  expect(box.height).toBeGreaterThanOrEqual(44)

  await toggle.click()
  await page.getByRole('button', { name: 'Abrir menú' }).click()
  await expect(page.getByRole('navigation', { name: 'Navegación móvil' })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('data-bayona-theme', 'day')
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 3)).toBe(false)
})

test('el modo día no oculta la fotografía de los servicios ni los regalos', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Modo día' }).click()

  for (const selector of ['.gym-service-card img', '.gym-gift-card img']) {
    const image = page.locator(selector).first()
    await image.scrollIntoViewIfNeeded()
    await expect(image).toBeVisible()
    await expect.poll(() => image.evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true)
  }
  await expect(page.locator('.gym-home-hero h1')).toBeVisible()
  await expect(page.locator('#empieza')).toBeAttached()
})

test('las cinco rutas editoriales adoptan papel claro sin desbordamiento', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Modo día' }).click()

  const failures = []
  for (const [route, selector] of [
    ['/programs', '.services-page'],
    ['/about', '.about-page'],
    ['/resources', '.resources-page'],
    ['/community', '.community-page'],
    ['/app', '.app-experience'],
  ]) {
    await page.goto(route, { waitUntil: 'networkidle' })
    const visualState = await page.evaluate((target) => ({
      theme: document.documentElement.dataset.bayonaTheme,
      background: getComputedStyle(document.querySelector(target)).backgroundColor,
      overflow: document.documentElement.scrollWidth > innerWidth + 3,
    }), selector)
    if (visualState.theme !== 'day' || visualState.background !== 'rgb(247, 243, 235)' || visualState.overflow) {
      failures.push({ route, ...visualState })
    }
  }
  expect(failures).toEqual([])
})

test('modo día conserva contraste en catálogos oscuros y secciones BAYONA+', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Modo día' }).click()

  await page.goto('/programs', { waitUntil: 'networkidle' })
  await expect(page.locator('.services-catalog-group').first()).toHaveCSS('color', 'rgb(247, 245, 241)')
  await expect(page.locator('.services-catalog-group h3').first()).toHaveCSS('color', 'rgb(255, 255, 255)')
  await expect(page.locator('.services-card > p').first()).toHaveCSS('color', 'rgba(247, 245, 241, 0.78)')

  await page.goto('/app', { waitUntil: 'networkidle' })
  await expect(page.locator('.app-experience .app-section').first()).toHaveCSS('background-color', 'rgb(238, 230, 218)')
  await expect(page.locator('.app-experience .app-section-title').first()).toHaveCSS('color', 'rgb(32, 27, 23)')

  await page.goto('/ruta-que-no-existe', { waitUntil: 'networkidle' })
  await expect(page.locator('.not-found-page h1')).toHaveCSS('color', 'rgb(255, 255, 255)')
})

test('el menú modo día es legible también en tablet y portátil pequeño', async ({ page }) => {
  for (const width of [1000, 1100]) {
    await page.setViewportSize({ width, height: 860 })
    await page.goto('/', { waitUntil: 'networkidle' })
    if (await page.locator('html').getAttribute('data-bayona-theme') !== 'day') {
      await page.getByRole('button', { name: 'Modo día' }).click()
    }
    await page.getByRole('button', { name: 'Abrir menú' }).click()
    const menu = page.getByRole('navigation', { name: 'Navegación móvil' })
    await expect(menu).toBeVisible()
    const appearance = await menu.evaluate((el) => ({
      color: getComputedStyle(el).color,
      background: getComputedStyle(el).backgroundImage,
    }))
    expect(appearance.color).toBe('rgb(32, 27, 23)')
    expect(appearance.background).toContain('rgb(247, 243, 235)')
  }
})

test('modo día mantiene contraste en conversión, tienda y secciones editoriales', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Modo día' }).click()
  await expect(page.locator('.gym-home-lead .lead-magnet-inner')).toHaveCSS('background-color', 'rgb(17, 16, 15)')
  await expect(page.locator('.lead-magnet-inner h2')).toHaveCSS('color', 'rgb(245, 241, 232)')
  await expect(page.locator('.gym-home-plans .plan-showroom')).toHaveCSS('color', 'rgb(245, 241, 232)')
  await expect(page.locator('.gym-gift-card strong').first()).toHaveCSS('color', 'rgb(145, 69, 27)')

  await page.goto('/shop', { waitUntil: 'networkidle' })
  await expect(page.locator('.shop-feature h2')).toHaveCSS('color', 'rgb(255, 255, 255)')
  await expect(page.locator('.shop-product-card > p').first()).toHaveCSS('color', 'rgb(81, 72, 63)')

  await page.goto('/community', { waitUntil: 'networkidle' })
  await expect(page.locator('.community-access h2')).toHaveCSS('color', 'rgb(255, 255, 255)')

  await page.goto('/resources', { waitUntil: 'networkidle' })
  await expect(page.locator('.resources-section:nth-child(even)').first()).toHaveCSS('background-color', 'rgb(238, 229, 217)')
  await expect(page.locator('.resources-section:nth-child(even) h2').first()).toHaveCSS('color', 'rgb(32, 27, 23)')

  await page.goto('/about', { waitUntil: 'networkidle' })
  await expect(page.locator('.about-method-scene h2')).toHaveCSS('color', 'rgb(255, 255, 255)')

  await page.goto('/parkour-academy', { waitUntil: 'networkidle' })
  await expect(page.locator('.academy-levels h2')).toHaveCSS('color', 'rgb(32, 27, 23)')
  await expect(page.locator('.academy-closing h2')).toHaveCSS('color', 'rgb(32, 27, 23)')
})

test('las pantallas internas y los planes mantienen paneles oscuros legibles', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Modo día' }).click()

  await page.goto('/plan/raiz', { waitUntil: 'networkidle' })
  await expect(page.locator('.plan-presentation-guarantee-box')).toHaveCSS('background-color', 'rgb(12, 12, 13)')
  await expect(page.locator('.plan-presentation-guarantee-box h2')).toHaveCSS('color', 'rgb(247, 245, 241)')
  await expect(page.locator('.plan-presentation-final-summary')).toHaveCSS('background-color', 'rgb(12, 12, 13)')

  await page.goto('/checkout', { waitUntil: 'networkidle' })
  await expect(page.locator('.checkout-page')).toHaveCSS('background-color', 'rgb(5, 5, 5)')
  await expect(page.locator('.checkout-page')).toHaveCSS('color', 'rgb(255, 255, 255)')
})

test('el pie claro y BAYONA OS privado mantienen su contraste incluso en capas antiguas', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Modo día' }).click()

  await page.evaluate(() => document.body.classList.add('award-mode'))
  await expect(page.locator('.footer.gym-footer')).toHaveCSS('background-color', 'rgb(233, 223, 209)')
  await expect(page.locator('.footer.gym-footer')).toHaveCSS('color', 'rgb(32, 27, 23)')

  await page.evaluate(() => {
    document.body.classList.remove('award-mode')
    const shell = document.createElement('div')
    shell.id = 'os-theme-regression-fixture'
    shell.className = 'os-shell'
    shell.innerHTML = '<span id="os-theme-ink" style="color:var(--ds-color-ink)">BAYONA OS</span>'
    document.querySelector('main.ds-frame').append(shell)
  })
  await expect(page.locator('#os-theme-regression-fixture')).toHaveCSS('background-color', 'rgb(5, 5, 5)')
  await expect(page.locator('#os-theme-regression-fixture')).toHaveCSS('color', 'rgb(247, 245, 241)')
  await expect(page.locator('#os-theme-ink')).toHaveCSS('color', 'rgb(247, 245, 241)')
  await expect(page.locator('main.ds-frame')).toHaveCSS('background-color', 'rgb(5, 5, 5)')
})
