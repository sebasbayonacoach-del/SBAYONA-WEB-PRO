import { expect, test } from '@playwright/test'

const destinations = [
  ['Servicios', '/programs'],
  ['Parkour', '/parkour-academy'],
  ['Tienda', '/shop'],
  ['La app', '/app'],
  ['Comunidad', '/community'],
  ['Recursos', '/resources'],
  ['Nosotros', '/about'],
]

test('La barra de escritorio ofrece todas las páginas públicas sin menús duplicados', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/', { waitUntil: 'networkidle' })
  const nav = page.getByRole('navigation', { name: 'Navegación principal' })
  await expect(nav).toBeVisible()
  await expect(page.getByRole('button', { name: 'Abrir menú' })).toBeHidden()
  await expect(nav.locator('a')).toHaveCount(destinations.length)

  for (const [name, href] of destinations) {
    await expect(nav.getByRole('link', { name, exact: true })).toHaveAttribute('href', href)
  }
  await expect(page.locator('header.navbar').getByRole('link', { name: 'BAYONA, ir al inicio' })).toHaveAttribute('href', '/')
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 3)).toBe(false)
})

for (const width of [390, 1100]) {
  test(`El menú a ${width}px incluye Inicio y las siete páginas sin anidamientos`, async ({ page }) => {
    await page.setViewportSize({ width, height: 850 })
    await page.goto('/', { waitUntil: 'networkidle' })
    const open = page.getByRole('button', { name: 'Abrir menú' })
    await open.click()
    const menu = page.getByRole('navigation', { name: 'Navegación móvil' })
    await expect(menu).toBeVisible()
    const links = menu.locator('.gym-mobile-nav-list a')
    await expect(links).toHaveCount(8)
    await expect(links.first()).toHaveAttribute('href', '/')

    for (const [name, href] of destinations) {
      await expect(menu.getByRole('link', { name, exact: true })).toHaveAttribute('href', href)
    }

    await expect(menu).toContainText('Cada opción abre una página. Sin submenús.')
    const box = await menu.boundingBox()
    expect(box.y).toBeGreaterThanOrEqual(0)
    expect(box.y + box.height).toBeLessThanOrEqual(852)
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 3)).toBe(false)

    await menu.getByRole('link', { name: 'Comunidad', exact: true }).click()
    await expect(page).toHaveURL(/\/community$/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute('aria-expanded', 'false')
  })
}

test('La app y Comunidad son páginas públicas accesibles directamente', async ({ page }) => {
  for (const path of ['/app', '/community', '/programs', '/resources', '/about']) {
    await page.goto(path, { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).not.toContainText('NO EXISTE.')
  }
})

test('Una URL de preview copiada con /** vuelve a Inicio; otros errores siguen siendo 404', async ({ page }) => {
  await page.goto('/**', { waitUntil: 'networkidle' })
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('ENTRENA CON DIRECCIÓN.')

  await page.goto('/una-pagina-que-no-existe', { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { level: 1 })).toContainText('NO EXISTE.')
  await expect(page).toHaveURL('/una-pagina-que-no-existe')
})

test('El pie también permite explorar la app, comunidad y cuenta sin anidar las páginas', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  const footer = page.getByRole('contentinfo')
  const nav = footer.getByRole('navigation', { name: 'Explorar BAYONA' })
  for (const [name, href] of destinations) {
    await expect(nav.getByRole('link', { name, exact: true })).toHaveAttribute('href', href)
  }
  await expect(footer.getByRole('link', { name: 'Acceso clientes' })).toHaveAttribute('href', '/entrar')
})

