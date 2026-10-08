import { expect, test } from '@playwright/test'
import { editorialServices } from '../src/config/offerings.js'
import { shopProducts } from '../src/config/shopProducts.js'

const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
]

async function expectNoHorizontalOverflow(page, context) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(metrics.scrollWidth, context).toBeLessThanOrEqual(metrics.clientWidth + 2)
}

for (const viewport of VIEWPORTS) {
  test(`Gym Funnel V2 · Home responsive ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/', { waitUntil: 'networkidle' })

    await expect(page.getByRole('heading', { level: 1, name: 'ENTRENA CON DIRECCIÓN.' })).toBeVisible()
    await expect(page.locator('.gym-home > section')).toHaveCount(7)
    await expect(page.locator('.gym-service-card')).toHaveCount(4)
    await expect(page.locator('.gym-gift-card')).toHaveCount(3)
    await expect(page.locator('.gym-gift-card[download]')).toHaveCount(0)
    await expect(page.locator('.gym-gift-card[href="#empieza"]')).toHaveCount(3)
    await expect(page.locator('.home-memberships-section .plan-showroom')).toBeVisible()
    await expect(page.locator('#empieza')).toBeAttached()
    await expect(page.getByText(/BIENVENIDO A BAYONA|UNIVERSO|ECOSISTEMA/i)).toHaveCount(0)

    const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight)
    expect(pageHeight, 'la Home no debe volver a convertirse en una página interminable').toBeLessThan(
      viewport.width < 600 ? 14000 : 12000,
    )
    await expectNoHorizontalOverflow(page, `Home ${viewport.width}px`)
  })
}

test('Gym Funnel V2 · menú móvil ocupa solo el viewport disponible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Abrir menú' }).click()

  const mobile = page.getByRole('navigation', { name: 'Navegación móvil' })
  await expect(mobile).toBeVisible()
  await expect(mobile.locator('.gym-mobile-nav-list a')).toHaveCount(8)
  await expect(mobile.getByRole('link', { name: /EMPIEZA GRATIS/i })).toBeVisible()

  const box = await mobile.boundingBox()
  expect(box).not.toBeNull()
  expect(box.y).toBeGreaterThanOrEqual(0)
  expect(box.y + box.height).toBeLessThanOrEqual(845)
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe('hidden')
  await expectNoHorizontalOverflow(page, 'menú móvil')
})

test('Gym Funnel V2 · Servicios funciona como una sola jerarquía comercial', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/programs', { waitUntil: 'networkidle' })

  await expect(page.getByRole('heading', { level: 1, name: 'NUESTROS SERVICIOS.' })).toBeVisible()
  await expect(page.locator('.services-overview-card')).toHaveCount(3)
  await expect(page.locator('.services-memberships .plan-showroom')).toHaveCount(1)
  await expect(page.locator('.services-card')).toHaveCount(editorialServices.length)
  await expect(page.getByText(/COMPARAR PROGRAMAS|ENTRA GRATIS ANTES DE PAGAR/i)).toHaveCount(0)
  await expectNoHorizontalOverflow(page, 'Servicios desktop')
})

test('Gym Funnel V2 · Tienda entra por categorías y usa fotografía de producto', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/shop', { waitUntil: 'networkidle' })

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  const shortcuts = page.getByRole('group', { name: 'Categorías principales de tienda' })
  await expect(shortcuts.getByRole('button')).toHaveCount(6)
  await expect(page.locator('.shop-product-card')).toHaveCount(shopProducts.length)
  await expect(page.locator('.shop-product-card .shop-product-image')).toHaveCount(shopProducts.length)
  await expect(page.getByText(/MOSTRADOR DE SERVICIOS|CRÉDITO BAYONA|RECLAMAR MI PASE/i)).toHaveCount(0)
  await expectNoHorizontalOverflow(page, 'Tienda desktop')
})

test('Gym Funnel V2 · captación entrega los tres regalos y una salida a valoración', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#empieza', { waitUntil: 'networkidle' })

  const lead = page.locator('#empieza')
  await lead.scrollIntoViewIfNeeded()
  await lead.getByLabel(/Nombre/i).fill('Ana')
  await lead.getByLabel(/Correo o WhatsApp/i).fill('ana@example.com')
  await lead.getByRole('button', { name: /RECIBIR MIS RECURSOS/i }).click()

  const status = lead.getByRole('status')
  await expect(status).toContainText('Listo, Ana')
  await expect(status.getByRole('link', { name: /DESCARGAR/i })).toHaveCount(3)
  await expect(status.getByRole('link', { name: /AGENDAR VALORACIÓN/i })).toHaveAttribute('href', /wa\.me/)
  await expect(status.getByRole('link', { name: /VER SERVICIOS/i })).toHaveAttribute('href', '/programs')
})

test('Gym Funnel V2 · reduced motion conserva toda la información', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/', { waitUntil: 'networkidle' })

  await expect(page.getByRole('heading', { level: 1, name: 'ENTRENA CON DIRECCIÓN.' })).toBeVisible()
  await expect(page.locator('.gym-service-card')).toHaveCount(4)
  await expect(page.locator('.gym-gift-card')).toHaveCount(3)
  await expect(page.locator('#empieza')).toBeAttached()
  await expectNoHorizontalOverflow(page, 'Home reduced motion')
})
