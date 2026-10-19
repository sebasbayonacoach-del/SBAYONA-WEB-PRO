import { test, expect } from '@playwright/test'

for (const [screen,width,height] of [['desktop',1440,900],['mobile',390,844]]) {
  test('Experiencia de cristal: personalización reversible sin bloquear el recorrido / ' + screen, async ({ page }) => {
    await page.setViewportSize({ width, height })
    await page.goto('/')
    const intake = page.locator('.bayona-glass-entry')
    await expect(intake).toBeVisible()
    await expect(intake.getByRole('heading', { name: /QUÉ TE MUEVE HOY/i })).toBeVisible()
    await expect(intake.locator('.bayona-glass-entry__goals button')).toHaveCount(5)
    await expect(intake.getByText('EXPLORACIÓN LIBRE')).toBeVisible()
    await expect(page.locator('.bayona-service-static--relevant')).toHaveCount(0)
    await expect(page.locator('.gym-service-card')).toHaveCount(4)

    await intake.getByRole('button', { name: 'Ganar fuerza' }).click()
    await expect(intake.getByRole('button', { name: 'Ganar fuerza' })).toHaveAttribute('aria-pressed', 'true')
    await expect(intake.getByText('Entrenamiento personal', { exact:true })).toBeVisible()
    await expect(page.locator('.bayona-service-static--relevant')).toHaveCount(1)
    await expect(page.locator('.bayona-service-static--relevant')).toContainText('Entrenamiento personal')
    await expect(page.locator('.gym-service-card')).toHaveCount(4)
    await expect(page.locator('.gym-home-hero .bayona-home-quiet-hero__coach')).toHaveText(/O habla con Sebastián/)

    await intake.getByRole('button', { name: 'Aprender parkour' }).click()
    await expect(page.locator('.bayona-service-static--relevant')).toContainText('Parkour y rendimiento')
    await intake.getByRole('button', { name: 'Aprender parkour' }).click()
    await expect(intake.getByText('EXPLORACIÓN LIBRE')).toBeVisible()
    await expect(page.locator('.bayona-service-static--relevant')).toHaveCount(0)

    await page.locator('#servicios').scrollIntoViewIfNeeded()
    await expect(page.locator('.bayona-compass.is-visible')).toBeVisible()
    await expect(page.locator('.bayona-compass__middle')).toContainText('TU FORMA DE ENTRENAR')
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow).toBeLessThanOrEqual(1)
  })

  test('Objetivo general acompaña rutas internas y desaparece al recargar / ' + screen, async ({ page }) => {
    await page.setViewportSize({ width, height })
    await page.goto('/')
    await page.getByRole('button', { name: 'Moverme mejor' }).click()
    await page.locator('#movimiento-adaptado a[href="/movimiento-adaptado"]').click()
    await expect(page).toHaveURL(/\/movimiento-adaptado$/)
    await expect(page.locator('.bayona-journey-inline__chosen')).toContainText('Moverme mejor')
    await expect(page.locator('.bayona-compass__middle')).toContainText('Moverte mejor')
    await expect(page.locator('.bayona-compass')).toBeVisible()
    await page.reload()
    await expect(page.locator('.bayona-journey-inline__chosen')).toHaveCount(0)
    await expect(page.locator('.bayona-compass__middle')).toContainText('DESCUBRE A TU RITMO')
  })
}
