import { test, expect } from '@playwright/test'

test('FAQ / filtros reales, contador accesible y recuperación completa', async ({ page }) => {
  await page.goto('/faq')
  const search = page.getByRole('searchbox', { name: 'ENCUENTRA TU RESPUESTA' })
  await expect(search).toBeVisible()

  const questions = page.locator('.faq-accordion')
  const total = await questions.count()
  expect(total).toBeGreaterThan(5)

  await search.fill('pago')
  await expect(page.locator('#faq-search-count')).toContainText('respuesta')
  const filtered = await questions.count()
  expect(filtered).toBeGreaterThan(0)
  expect(filtered).toBeLessThan(total)

  const toggle = questions.first().locator('button[aria-expanded]')
  const previouslyOpen = await toggle.getAttribute('aria-expanded')
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', previouslyOpen === 'true' ? 'false' : 'true')

  await search.fill('este-texto-no-existe-bayona-xyz-2026')
  await expect(questions).toHaveCount(0)
  await expect(page.locator('.faq-search__empty')).toBeVisible()

  await page.getByRole('button', { name: 'Limpiar búsqueda' }).click()
  await expect(questions).toHaveCount(total)
  await expect(search).toHaveValue('')
})

const sections = [
  ['/programs', '.services-path-card'],
  ['/about', '.about-chronicle-mobile__item'],
  ['/shop', '.shop-category-shortcuts button'],
  ['/app', '.app-features-grid'],
  ['/community', '.community-live-card'],
  ['/resources', '.resources-hero-library-card'],
  ['/parkour-academy', '.academy-progression__card'],
]

for (const [path, selector] of sections) {
  test(`21st.dev / patrón renderiza en ${path}`, async ({ page }) => {
    await page.goto(path)
    await expect(page.locator(selector).first()).toBeAttached()
    const hasTheme = await page.locator('.ds-frame[data-experience-scope="brand"]').evaluate(
      node => getComputedStyle(node).getPropertyValue('--c21-accent').trim() !== '',
    )
    expect(hasTheme).toBe(true)
  })
}
