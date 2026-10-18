import { test, expect } from '@playwright/test'

const ROUTES = [
  ['/', 8], ['/about', 7], ['/programs', 5], ['/movimiento-adaptado', 3],
  ['/parkour-academy', 7], ['/app', 8], ['/community', 7],
  ['/resources', 6], ['/faq', 3], ['/shop', 5],
]

for (const [path, count] of ROUTES) {
  test('Cada sección presenta una microinteracción accesible: ' + path, async ({ page }) => {
    await page.goto(path)
    const moments = page.locator('.bayona-moment')
    await expect(moments).toHaveCount(count)
    for (const index of [0, count-1]) {
      const card = moments.nth(index)
      const first = card.locator('.bayona-moment__answers button').first()
      await first.click()
      await expect(first).toHaveAttribute('aria-pressed', 'true')
      await expect(card.getByText(/TOMADO EN CUENTA/i)).toBeVisible()
      await first.click()
      await expect(first).toHaveAttribute('aria-pressed', 'false')
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1)
    await expect(page.locator('.bayona-moment button[required]')).toHaveCount(0)
  })
}

test('Las decisiones de una sección guían la siguiente y se borran de forma reversible', async ({ page }) => {
  await page.goto('/')
  await page.locator('.bayona-moment[data-moment-key="formato"]')
    .getByRole('button', { name: 'A mi propio ritmo' }).click()
  await expect(page.locator('.gym-service-card.bayona-service-static--relevant')).toContainText('Entrenamiento online')
  await expect(page.locator('.bayona-moment[data-moment-key="planes"]')).toHaveCount(0)
  await page.locator('.bayona-moment[data-moment-key="apoyo"]')
    .getByRole('button', { name: 'Una base sencilla' }).click()
  await expect(page.locator('.bayona-plan-open__card--suggested')).toContainText('RAÍZ')
  await expect(page.locator('.bayona-compass')).toContainText('2 ELECCIONES')
  await expect(page.locator('.bayona-moment__memory').first()).toBeVisible()
  await expect(page.locator('.bayona-moment[data-moment-key="contacto"]')
    .getByRole('link', { name: /ABRIR WHATSAPP CON MI RESUMEN/i }))
    .toHaveAttribute('href', /A%20mi%20propio%20ritmo/)

  await page.locator('.bayona-moment[data-moment-key="apoyo"]').getByRole('button', { name: /Borrar elecciones/i }).click()
  await expect(page.locator('.gym-service-card.bayona-service-static--relevant')).toHaveCount(0)
  await expect(page.locator('.bayona-plan-open__card--suggested')).toHaveCount(0)
})

test('Las selecciones no persisten al recargar la página ni bloquean la navegación', async ({ page }) => {
  await page.goto('/')
  await page.locator('.bayona-moment[data-moment-key="formato"]').getByRole('button', { name: 'Con acompañamiento cercano' }).click()
  await page.locator('header a[href="/programs"]').first().click()
  await expect(page).toHaveURL(/\/programs$/)
  await expect(page.locator('.bayona-moment[data-moment-key="formato"] button[aria-pressed="true"]')).toHaveCount(1)
  await page.reload()
  await expect(page.locator('.bayona-moment[data-moment-key="formato"] button[aria-pressed="true"]')).toHaveCount(0)
})

test('En móvil los controles de Inicio y Servicios son accesibles por teclado y tacto', async ({ page }) => {
  await page.setViewportSize({width:390,height:844})
  await page.goto('/')
  const first = page.locator('.bayona-moment').first()
  const button = first.locator('button').first()
  await button.click()
  await expect(button).toHaveAttribute('aria-pressed','true')
  await page.locator('#planes .bayona-moment__answers button').first().click()
  await expect(page.locator('.bayona-compass')).toContainText('ELECCIONES')
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1)
})
