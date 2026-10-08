import { expect, test } from '@playwright/test'

for (const viewport of [
  { width: 390, height: 844 },
  { width: 726, height: 950 },
  { width: 1440, height: 900 },
]) {
  test('Home V2 usa fotografía real y jerarquía consistente a ' + viewport.width + 'px', async ({ page }) => {
    await page.setViewportSize(viewport)
    const errors = []
    const broken = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('response', (response) => {
      if (response.request().resourceType() === 'image' && response.status() >= 400) broken.push(response.url())
    })

    await page.goto('/', { waitUntil: 'networkidle' })

    const serviceImages = page.locator('.gym-service-card img')
    const giftImages = page.locator('.gym-gift-card img')
    await expect(serviceImages).toHaveCount(4)
    await expect(giftImages).toHaveCount(3)

    for (const image of [serviceImages.first(), giftImages.first()]) {
      await image.scrollIntoViewIfNeeded()
      await expect.poll(() => image.evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true)
      const box = await image.boundingBox()
      expect(box.width).toBeGreaterThan(100)
      expect(box.height).toBeGreaterThan(100)
    }

    await expect(page.locator('.home-memberships-section .plan-explorer')).toBeVisible()
    await expect(page.locator('.gym-home-gifts')).toBeVisible()
    await expect(page.locator('#empieza')).toBeAttached()

    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 3)).toBe(false)
    expect(broken).toEqual([])
    expect(errors).toEqual([])
  })
}

test('Los tres recursos de inicio llevan a la captación y se entregan después del formulario', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/', { waitUntil: 'networkidle' })

  const gifts = page.locator('.gym-gift-card')
  await expect(gifts).toHaveCount(3)
  for (const href of await gifts.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')))) {
    expect(href).toBe('#empieza')
  }

  const lead = page.locator('#empieza')
  await lead.scrollIntoViewIfNeeded()
  await lead.getByLabel(/Nombre/i).fill('Ana')
  await lead.getByLabel(/Correo o WhatsApp/i).fill('ana@example.com')
  await lead.getByRole('button', { name: /RECIBIR MIS RECURSOS/i }).click()

  const status = lead.getByRole('status')
  await expect(status.getByRole('link', { name: /DESCARGAR/i })).toHaveCount(3)
  const hrefs = await status.getByRole('link', { name: /DESCARGAR/i }).evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('href')),
  )
  expect(hrefs).toEqual([
    '/downloads/bayona-editorial/primera-semana.pdf',
    '/downloads/bayona-editorial/registro-30-dias.pdf',
    '/downloads/bayona-editorial/dossier-punto-de-partida.pdf',
  ])
})
