import { test, expect } from '@playwright/test'

for (const [mode, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
  test('Inicio responde las preguntas esenciales sin seleccionar tarjetas / ' + mode, async ({ page }) => {
    await page.setViewportSize({ width, height })
    await page.goto('/')

    const hero = page.locator('.gym-home-hero')
    const cta = hero.getByRole('link', { name: /HABLAR CON SEBASTIÁN/i })
    await expect(cta).toBeVisible()
    await expect(cta).toHaveAttribute('href', /^(https:\/\/|http:\/\/)/)
    await expect(hero.getByRole('link', { name: /VER CÓMO TE AYUDO/i })).toHaveAttribute('href', '#servicios')

    const guidance = page.locator('#tu-ruta')
    await expect(guidance.locator('article.bayona-discovery__focus-card')).toHaveCount(3)
    await expect(guidance.locator('input, button')).toHaveCount(0)

    const services = page.locator('#servicios')
    await expect(services.locator('article.gym-service-card')).toHaveCount(4)
    await expect(services.locator('a.gym-service-card')).toHaveCount(0)
    await expect(services.locator('.bayona-service-static__detail')).toHaveCount(4)

    const plans = page.locator('.bayona-plan-open')
    await expect(plans.locator('article.bayona-plan-open__card')).toHaveCount(4)
    await expect(plans.locator('.bayona-plan-open__included li')).toHaveCount(12)
    for (const name of ['RAÍZ', 'FUERZA', 'RENDIMIENTO', 'ELITE']) {
      await expect(plans.getByRole('heading', { name, exact: true })).toBeVisible()
    }
    await expect(plans.locator('button, [hidden]')).toHaveCount(0)
    await expect(plans.getByRole('link', { name: /prestaciones y exclusiones completas/i })).toBeVisible()

    const conditions = page.locator('#movimiento-adaptado')
    await expect(conditions.locator('.bayona-home-contexts__group')).toHaveCount(12)
    await expect(conditions.locator('.bayona-home-contexts__group li')).toHaveCount(36)
    await expect(conditions.getByText('Parkinson', { exact: true })).toBeVisible()
    await expect(conditions.getByText('Diabetes tipo 2', { exact: true })).toBeVisible()
    await expect(conditions.locator('input, button')).toHaveCount(0)

    const gifts = page.locator('#regalos .gym-gift-card')
    await expect(gifts).toHaveCount(3)
    for (const href of await gifts.evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))) {
      expect(href).toMatch(/^\/downloads\/bayona-editorial\/.*\.pdf$/)
      const response = await page.request.get(href)
      expect(response.status()).toBe(200)
    }

    const result = await page.evaluate(() => ({
      horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
      sectionOrder: ['tu-ruta','servicios','movimiento-adaptado','regalos','empieza'].map(id => document.querySelector('#'+id).getBoundingClientRect().top+scrollY),
      totalHeight: document.documentElement.scrollHeight,
    }))
    expect(result.horizontalOverflow).toBeLessThanOrEqual(1)
    expect(result.sectionOrder).toEqual([...result.sectionOrder].sort((a, b) => a - b))
    console.log(mode, 'page height:', result.totalHeight)
  })
}
