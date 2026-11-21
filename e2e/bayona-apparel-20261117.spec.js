import { test, expect } from '@playwright/test'

test('DROP 01 muestra seis prendas consultables sin pagos', async ({ page }) => {
  const errors = []
  page.on('pageerror', (err) => errors.push(err.message))

  await page.goto('/shop')
  const launch = page.locator('#bayona-ropa')
  await expect(launch.getByRole('heading', { name: /EL UNIFORME.*DEL MOVIMIENTO/s })).toBeVisible()
  await expect(launch.locator('.bayona-clothing__piece')).toHaveCount(6)
  await expect(launch.locator('.bayona-clothing__piece a')).toHaveCount(6)
  await expect(launch).toContainText('no acepta pagos')

  const links = await launch.locator('.bayona-clothing__piece a').all()
  for (const link of links) {
    await expect(link).toHaveAttribute('href', /(?:wa\.me|whatsapp)/i)
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  }
  expect(errors).toEqual([])
})

test('una camiseta no homologada tiene consulta, no precio ni botón de cobro', async ({ page }) => {
  await page.goto('/shop?product=camiseta-origins')
  const card = page.locator('[data-product-id="camiseta-origins"]')
  await expect(card).toBeVisible()
  await expect(card.locator('.shop-product-price')).toContainText('PRECIO EN PREPARACIÓN')
  await expect(card.locator('.shop-add-to-cart')).toBeDisabled()
  await expect(card.getByRole('img', { name: /todavía no es una fotografía/ })).toBeVisible()
  await expect(card.getByRole('link', { name: /Consultar disponibilidad/i })).toHaveAttribute('href', /(?:wa\.me|whatsapp)/i)
})

test('las cinco prendas sin pruebas técnicas no aparecen en el escaparate', async ({ page }) => {
  await page.goto('/shop')
  const blocked = [
    'camiseta-compresion',
    'chaqueta-windstopper',
    'calcetines-compresion-pack-3',
    'zapatillas-trainer-pro',
    'zapatillas-parkour-free',
  ]
  const search = page.getByRole('button', { name: 'Abrir búsqueda de productos' })
  await search.click()
  for (const id of blocked) {
    await expect(page.locator(`[data-product-id="${id}"]`)).toHaveCount(0)
  }
  await page.getByRole('searchbox', { name: 'Buscar producto' }).fill('zapatillas parkour free')
  await expect(page.locator('[data-product-id="zapatillas-parkour-free"]')).toHaveCount(0)
})

test('móvil: ninguna capa de la colección ensancha la página', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/shop')
  await expect(page.locator('#bayona-ropa .bayona-clothing__piece')).toHaveCount(6)
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1)
})
