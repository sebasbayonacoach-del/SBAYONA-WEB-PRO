import { expect, test } from '@playwright/test'

for (const width of [390, 768, 1440]) {
  for (const reducedMotion of ['no-preference', 'reduce']) {
    test('Home V2 mantiene conversión premium a ' + width + 'px (' + reducedMotion + ')', async ({ page }) => {
      await page.setViewportSize({ width, height: 950 })
      await page.emulateMedia({ reducedMotion })
      const errors = []
      page.on('pageerror', (error) => errors.push(error.message))
      await page.goto('/', { waitUntil: 'networkidle' })

      await expect(page.getByRole('link', { name: /EMPIEZA GRATIS/i })).toHaveAttribute('href', '#empieza')
      await expect(page.getByRole('link', { name: /^VER SERVICIOS/i }).first()).toHaveAttribute('href', '/programs')

      const showroom = page.locator('.home-memberships-section .plan-explorer')
      await showroom.scrollIntoViewIfNeeded()
      const fuerza = showroom.getByRole('button', { name: 'Ver plan FUERZA' })
      await fuerza.click()
      await expect(fuerza).toHaveAttribute('aria-pressed', 'true')
      await expect(showroom.locator('.plan-showroom-preview')).toHaveAttribute('data-plan-id', 'FUERZA')
      await expect(showroom.getByRole('link', { name: 'Ver presentación de FUERZA' })).toHaveAttribute('href', '/plan/fuerza')
      await expect(showroom.locator('.plan-showroom-signature')).toBeVisible()

      await expect(page.locator('.gym-gift-card')).toHaveCount(3)
      await expect(page.locator('#empieza')).toBeAttached()
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 3)).toBe(false)
      expect(errors).toEqual([])
    })
  }
}
