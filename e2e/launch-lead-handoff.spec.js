import { expect, test } from '@playwright/test'

test('el checkout informa que no hay cobro y entrega un enlace de WhatsApp sin enviar mensajes', async ({ page }) => {
  await page.addInitScript(() => {
    window.__simulatedWhatsAppOpens = []
    window.open = (url) => {
      window.__simulatedWhatsAppOpens.push(url)
      return { closed: false, focus() {} }
    }
  })
  await page.goto('/checkout', { waitUntil: 'networkidle' })
  await expect(page.getByText('No hay cobro aquí.')).toBeVisible()
  await page.locator('#checkout-name').fill('Cliente Prueba')
  await page.locator('#checkout-email').fill('cliente.prueba@example.test')
  await page.locator('#checkout-whatsapp').fill('+34 600 000 000')
  await page.getByRole('button', { name: 'Solicitar detalles por WhatsApp' }).click()
  await expect(page.locator('.checkout-handoff')).toContainText('Solicitud abierta en WhatsApp')
  const urls = await page.evaluate(() => window.__simulatedWhatsAppOpens)
  expect(urls).toHaveLength(1)
  expect(urls[0]).toMatch(/^https:\/\/wa\.me\/\d+\?text=/)
  const message = new URL(urls[0]).searchParams.get('text')
  expect(message).toContain('Cliente Prueba')
})
