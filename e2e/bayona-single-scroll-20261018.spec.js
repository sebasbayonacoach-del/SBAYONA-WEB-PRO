import { test, expect } from '@playwright/test'

for (const [mode, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
  test('Toda la orientación comercial y adaptada está en Inicio sin abrir tarjetas / ' + mode, async ({ page }) => {
    await page.setViewportSize({ width, height })
    await page.goto('/')
    const services = page.locator('#servicios')
    await expect(services.locator('article.gym-service-card')).toHaveCount(4)
    await expect(services.locator('a.gym-service-card')).toHaveCount(0)
    await expect(services.getByText('DETALLES A LA VISTA · SIN ABRIR')).toHaveCount(4)
    await expect(page.locator('#tu-ruta .bayona-discovery__allstep')).toHaveCount(3)

    const contexts = page.locator('#movimiento-adaptado')
    await expect(contexts.locator('.bayona-home-contexts__group')).toHaveCount(12)
    await expect(contexts.locator('.bayona-home-contexts__group li')).toHaveCount(104)
    await expect(contexts.getByText('Parkinson', { exact: true })).toBeVisible()
    await expect(contexts.getByText('Diabetes tipo 2', { exact: true })).toBeVisible()
    await expect(contexts.locator('button, input, a')).toHaveCount(0)

    const plans = page.locator('.bayona-plan-open')
    await expect(plans.locator('article.bayona-plan-open__card')).toHaveCount(4)
    for (const name of ['RAÍZ', 'FUERZA', 'RENDIMIENTO', 'ELITE']) {
      await expect(plans.getByRole('heading', { name, exact: true })).toBeVisible()
    }
    await expect(plans.locator('button')).toHaveCount(0)
    await expect(plans.locator('[hidden]')).toHaveCount(0)
    await expect(plans.locator('.bayona-plan-open__included li').first()).toBeVisible()

    const downloads = page.locator('#regalos .gym-gift-card')
    await expect(downloads).toHaveCount(3)
    for (const href of await downloads.evaluateAll(nodes => nodes.map(n => n.getAttribute('href')))) {
      expect(href).toMatch(/^\/downloads\/bayona-editorial\/.*\.pdf$/)
      const response = await page.request.get(href)
      expect(response.status()).toBe(200)
      expect(response.headers()['content-type']).toContain('application/pdf')
    }

    const measurements = await page.evaluate(() => ({
      pageOverflow: document.documentElement.scrollWidth - window.innerWidth,
      contextsVisible: getComputedStyle(document.querySelector('#movimiento-adaptado')).display !== 'none',
      planCards: [...document.querySelectorAll('.bayona-plan-open__card')].map(node => ({
        displayed: getComputedStyle(node).display,
        height: node.getBoundingClientRect().height,
      })),
    }))
    expect(measurements.pageOverflow).toBeLessThanOrEqual(1)
    expect(measurements.contextsVisible).toBe(true)
    expect(measurements.planCards.every(c => c.displayed !== 'none' && c.height > 200)).toBe(true)
  })
}
