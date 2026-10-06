import { expect, test } from '@playwright/test'

for (const width of [390, 768, 1440]) {
  for (const reducedMotion of ['no-preference', 'reduce']) {
    test(`luxury commercial chapters and selections at ${width}px (${reducedMotion})`, async ({ page }) => {
      await page.setViewportSize({ width, height: 950 })
      await page.emulateMedia({ reducedMotion })
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      await page.goto('/', { waitUntil: 'domcontentloaded' })

      for (const name of ['luxury-offer-intro', 'luxury-configurator-intro', 'luxury-closing']) {
        const chapter = page.locator(`.${name}`)
        await chapter.scrollIntoViewIfNeeded()
        await expect(chapter).toHaveAttribute('data-motion', reducedMotion === 'reduce' ? 'reduced' : 'cinematic')
        const photo = chapter.locator('.luxury-chapter-photo img')
        await expect.poll(() => photo.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true)
        const box = await chapter.boundingBox()
        expect(box.width).toBeGreaterThanOrEqual(width - 2)
        const title = await chapter.locator('h2').boundingBox()
        expect(title.x).toBeGreaterThanOrEqual(0)
        expect(title.x + title.width).toBeLessThanOrEqual(width + 1)
        expect(title.y + title.height).toBeLessThanOrEqual(box.y + box.height)
        if (reducedMotion === 'reduce') {
          expect(await chapter.locator('.luxury-chapter-photo').evaluate(el => getComputedStyle(el).transform)).toBe('none')
        }
        await chapter.screenshot({ path: `test-results/playwright/luxury/${name}-${width}-${reducedMotion}.png` })
      }

      const showroom = page.locator('.home-memberships-section .plan-explorer')
      const fuerza = showroom.getByRole('button', { name: 'Ver plan FUERZA' })
      await fuerza.click()
      await expect(fuerza).toHaveAttribute('aria-pressed', 'true')
      await expect(showroom.locator('.plan-showroom-preview')).toHaveAttribute('data-plan-id', 'FUERZA')
      await expect(showroom.getByRole('link', { name: 'Ver presentación de FUERZA' })).toHaveAttribute('href', '/plan/fuerza')
      await expect(showroom.locator('.plan-showroom-signature')).toBeVisible()
      await expect(showroom.locator('.plan-price')).toHaveCSS('color', 'rgb(247, 247, 243)')
      await showroom.locator('.plan-showroom-preview').screenshot({ path: `test-results/playwright/luxury/plan-${width}-${reducedMotion}.png` })

      const configurator = page.locator('.home-services-configurator')
      const fuerzaRadio = configurator.getByRole('radio', { name: /FUERZA/ })
      const raizRadio = configurator.getByRole('radio', { name: /RAÍZ/ })
      await fuerzaRadio.click({ force: true })
      await expect(fuerzaRadio).toBeChecked()
      await expect(configurator.locator('.persistent-summary-totals').getByText('FUERZA', { exact: true })).toBeVisible()
      await configurator.getByRole('button', { name: /^Revisar mensaje exacto$/i }).click()
      await expect(configurator.locator('.request-preview')).toHaveAttribute('data-preview-state', 'reviewed')
      await raizRadio.click({ force: true })
      await expect(raizRadio).toBeChecked()
      await expect(configurator.locator('.request-preview')).toHaveAttribute('data-preview-state', 'pending')
      await expect(page.locator('.final-doors').getByRole('link', { name: /CONTINUAR CON MI RECORRIDO/i })).toHaveAttribute('href', '/onboarding')
      await expect(page.locator('.final-doors').getByRole('link', { name: /COMPARAR PROGRAMAS/i })).toHaveAttribute('href', '/programs')
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2)).toBe(false)
      expect(errors).toEqual([])
    })
  }
}
