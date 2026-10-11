import { test, expect } from '@playwright/test'

const routes = ['/', '/about', '/programs', '/parkour-academy', '/shop', '/app', '/community', '/resources', '/faq', '/entrar', '/plan/raiz', '/checkout']

for (const width of [390, 768, 1440]) {
  test(`Designly: integridad de contenido visible a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    for (const route of routes) {
      await page.goto(route, { waitUntil: 'domcontentloaded' })
      await page.locator('main').waitFor()
      await page.locator('main h1, main [role="heading"][aria-level="1"]').first().waitFor({ state: 'attached', timeout: 12000 })
      const defects = await page.evaluate(() => {
        const issues = []
        if (document.documentElement.scrollWidth > window.innerWidth + 3) issues.push('desbordamiento horizontal')
        for (const img of document.querySelectorAll('main img')) {
          const rect = img.getBoundingClientRect()
          if (rect.width > 32 && rect.height > 32 && img.complete && img.naturalWidth === 0) issues.push(`imagen rota: ${img.currentSrc || img.src}`)
        }
        const title = document.querySelector('main h1, main [role="heading"][aria-level="1"]')
        if (!title) issues.push('sin título principal')
        else if (!title.textContent.trim()) issues.push('título vacío')
        return issues
      })
      expect(defects, `${route} @ ${width}px`).toEqual([])
    }
  })
}
