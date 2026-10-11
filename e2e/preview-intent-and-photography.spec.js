import { expect, test } from '@playwright/test'

test('desktop: los CTA de Home navegan directamente sin paneles intermedios', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/', { waitUntil: 'networkidle' })

  await expect(page.locator('.bayona-preview-panel')).toHaveCount(0)
  await expect(page.getByRole('link', { name: /EMPIEZA GRATIS/i })).toHaveAttribute('href', '#empieza')
  await expect(page.getByRole('link', { name: /^VER SERVICIOS/i }).first()).toHaveAttribute('href', '/programs')
  await expect(page.locator('.gym-home-reward')).toHaveAttribute('href', '#regalos')
})

test('móvil: empezar gratis baja al formulario, no abre modal ni onboarding', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/', { waitUntil: 'networkidle' })

  const cta = page.getByRole('link', { name: /EMPIEZA GRATIS/i })
  await cta.click()
  await expect(page).toHaveURL(/#empieza$/)
  await expect(page.getByRole('dialog', { name: /Vista previa del destino/i })).toHaveCount(0)
  await expect(page.locator('#empieza')).toBeAttached()
})

test('recursos y servicios apuntan a destinos reales', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/', { waitUntil: 'networkidle' })

  await expect(page.locator('.gym-service-card')).toHaveCount(4)
  await expect(page.locator('.gym-gift-card')).toHaveCount(3)
  await expect(page.getByRole('link', { name: /EXPLORAR TODOS LOS SERVICIOS/i })).toHaveAttribute('href', '/programs')

  const giftHrefs = await page.locator('.gym-gift-card').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')))
  expect(giftHrefs).toEqual(['#empieza', '#empieza', '#empieza'])
})

test('Home V2 permanece funcional sin WebGL', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 950 })
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (/^(webgl2?|experimental-webgl)$/.test(type)) return null
      return getContext.call(this, type, ...args)
    }
  })

  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/', { waitUntil: 'networkidle' })

  await expect(page.getByRole('heading', { level: 1, name: 'ENTRENA CON DIRECCIÓN.' })).toBeVisible()
  await expect(page.locator('.gym-service-card')).toHaveCount(4)
  await expect(page.locator('.home-memberships-section .plan-explorer')).toBeVisible()
  await expect(page.locator('.gym-gift-card')).toHaveCount(3)
  await expect(page.locator('#empieza')).toBeAttached()
  await expect(page.locator('canvas')).toHaveCount(0)
  expect(errors).toEqual([])
})
