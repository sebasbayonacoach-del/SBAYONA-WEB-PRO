import { test, expect } from '@playwright/test'

test('SB+ PWA: identidad visual, acceso y metadatos reales', async ({ page, request }) => {
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  await page.goto('/mi-app/index.html?source=pwa')
  await expect(page).toHaveTitle(/SB\+/)
  await expect(page.locator('.auth-brand strong')).toContainText('SEBASTIAN BAYONA')
  await expect(page.getByRole('button', {name:'Continuar con Google'})).toBeVisible()
  const manifest = await (await request.get('/mi-app/manifest.webmanifest')).json()
  expect(manifest.short_name).toBe('SB+')
  expect(manifest.name).toContain('SEBASTIAN BAYONA')
  expect(errors).toEqual([])
})

test('El escaparate SB+ y su presentación muestran capturas nuevas de identidad real', async ({ page, request }) => {
  await page.goto('/')
  const section = page.locator('#bayona-plus')
  await expect(section.locator('.sb-flagship__device-screen img')).toHaveAttribute('src',/role-selection-desktop-20261104.png/)
  await section.getByRole('button',{name:/MÓVIL/}).click()
  await expect(section.locator('.sb-flagship__device-screen img')).toHaveAttribute('src',/role-picker-mobile-20261104.png/)
  await page.goto('/app')
  await expect(page.locator('.bayona-launch__hero-device img')).toHaveAttribute('src',/role-selection-desktop-20261104.png/)
  for(const path of ['/images/sb-plus/role-selection-desktop-20261104.png','/images/sb-plus/role-picker-mobile-20261104.png']) {
    const response = await request.get(path)
    expect(response.ok()).toBe(true)
    expect(response.headers()['content-type']).toMatch(/image\/png/)
  }
})

test('La colección no presenta el carrito como pago confirmado', async ({page}) => {
  await page.goto('/shop')
  await expect(page.locator('.shop-product-card').first()).toBeAttached()
  await expect(page.getByText(/disponibilidad, talla y entrega se confirman/i).first()).toBeVisible()
  await expect(page.locator('button.shop-add-to-cart').first()).toBeAttached()
  await page.goto('/checkout')
  await expect(page.getByRole('heading',{name:/PREPARA TU SOLICITUD/})).toBeVisible()
  await expect(page.getByText('SEBASTIAN BAYONA · SOLICITUD PERSONAL', {exact:true})).toContainText('SEBASTIAN BAYONA')
  await expect(page.getByText(/antes de enviarnos tu solicitud/i)).toBeVisible()
})
