import { test, expect } from '@playwright/test'

const routes = [
  ['/', 'EL ARTE', 'Inicio'],
  ['/about', 'UNA VIDA EN MOVIMIENTO', 'La Historia'],
  ['/programs', 'TU SIGUIENTE EVOLUCIÓN', 'Experiencias'],
  ['/parkour-academy', 'LEE EL ESPACIO', 'Parkour Lab'],
  ['/community', 'UN CÍRCULO', 'El Círculo'],
  ['/app', 'TU CUERPO', 'SB+'],
  ['/shop', 'PIEZAS PARA', 'La Colección'],
  ['/resources', 'EL CONOCIMIENTO', 'La Biblioteca'],
  ['/faq', 'FAQ', 'Preguntas'],
]
for (const [path, heading] of routes) {
  test(`Marca y ruta pública: ${path}`, async ({ page }) => {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(path)
    await expect(page.locator('.navbar .brand strong')).toHaveText('SEBASTIAN BAYONA')
    await expect(page.locator('h1').first()).toContainText(heading)
    expect(await page.title()).toContain('SEBASTIAN BAYONA')
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1)
    expect(errors).toEqual([])
  })
}
test('Menú móvil: nuevas secciones y sin desbordamientos', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/programs')
  const menu = page.getByRole('button',{name:'Abrir menú'})
  await expect(menu).toBeVisible()
  await menu.click()
  await expect(page.getByRole('navigation',{name:'Navegación móvil'})).toBeVisible()
  for (const name of ['La Historia','Experiencias','Parkour Lab','El Círculo','SB+','La Colección','La Biblioteca']) {
    await expect(page.getByRole('navigation',{name:'Navegación móvil'}).getByText(name,{exact:true})).toBeVisible()
  }
  await page.getByRole('button',{name:'Cerrar menú'}).click()
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1)
})
test('Tienda conserva sus controles y rutas sin cobrar sin verificación', async ({ page }) => {
  await page.goto('/shop')
  await expect(page.locator('.shop-product-card').first()).toBeAttached()
  await expect(page.locator('.shop-add-to-cart').first()).toBeAttached()
  await expect(page.locator('.nav-cart-button')).toBeVisible()
  await expect(page.locator('.navbar .brand strong')).toHaveText('SEBASTIAN BAYONA')
})
