import { test, expect } from '@playwright/test'

const routes = [
  ['home','/'],
  ['about','/about'],
  ['programs','/programs'],
  ['shop','/shop'],
  ['community','/community'],
  ['resources','/resources'],
  ['app','/app'],
  ['parkour','/parkour-academy'],
  ['faq','/faq'],
  ['404','/audit-v4-route-not-found'],
]

for (const width of [390, 1440]) {
  test(`V4 / sin overflow en 10 rutas · ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 })
    await page.addInitScript(() => localStorage.setItem('bayona-site-theme','day'))
    for (const [,path] of routes) {
      await page.goto(path)
      await page.waitForLoadState('domcontentloaded')
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
      expect(overflow, path).toBeLessThanOrEqual(1)
    }
  })
}

test('V4 / Home usa retícula 2x2 y jerarquía de portada', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await expect(page.locator('.gym-service-card')).toHaveCount(4)
  const result = await page.evaluate(() => {
    const grid = document.querySelector('.gym-service-grid')
    const hero = document.querySelector('.gym-home-hero')
    return {
      columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
      heroHeight: Math.round(hero.getBoundingClientRect().height),
      h1Size: parseFloat(getComputedStyle(document.querySelector('.gym-home-hero h1')).fontSize),
    }
  })
  expect(result.columns).toBe(2)
  expect(result.heroHeight).toBeLessThanOrEqual(900)
  expect(result.h1Size).toBeGreaterThan(60)
})

test('V4 / Servicios corrige membresías y mantiene contraste oscuro', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.addInitScript(() => localStorage.setItem('bayona-site-theme','day'))
  await page.goto('/programs')
  await expect(page.locator('.services-memberships')).toBeAttached()
  await expect(page.locator('.services-memberships .plan-showroom-stage')).toBeAttached()
  const result = await page.evaluate(() => {
    const section = document.querySelector('.services-memberships')
    const explorer = document.querySelector('.services-memberships .plan-explorer')
    const selector = document.querySelector('.services-memberships .plan-comparison-list')
    const stage = document.querySelector('.services-memberships .plan-showroom-stage')
    const primary = document.querySelector('.services-memberships .plan-showroom-primary')
    const copy = primary?.querySelector('p, .plan-summary-value, .plan-summary-jtbd') || primary
    return {
      bg: getComputedStyle(section).backgroundColor,
      display: getComputedStyle(explorer).display,
      selectorW: selector.getBoundingClientRect().width,
      stageW: stage.getBoundingClientRect().width,
      copyColor: copy ? getComputedStyle(copy).color : '',
    }
  })
  expect(result.bg).toBe('rgb(28, 30, 26)')
  expect(result.display).toBe('grid')
  expect(result.stageW).toBeGreaterThan(result.selectorW * 2)
  expect(result.copyColor).not.toBe('rgb(17, 18, 15)')
})

test('V4 / Tienda ordena colecciones y productos', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/shop')
  await expect(page.locator('.shop-collection-groups')).toBeAttached()
  await expect(page.locator('.shop-product-card').first()).toBeAttached()
  const result = await page.evaluate(() => {
    const groups = document.querySelector('.shop-collection-groups')
    const cards = [...document.querySelectorAll('.shop-product-card')]
    return {
      groupsDisplay: getComputedStyle(groups).display,
      count: cards.length,
      firstWidth: cards[0]?.getBoundingClientRect().width || 0,
    }
  })
  expect(result.groupsDisplay).toBe('block')
  expect(result.count).toBeGreaterThan(3)
  expect(result.firstWidth).toBeLessThan(500)
})

test('V4 / Recursos elimina velo y BAYONA+ usa 3 columnas', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/resources')
  await expect(page.locator('.resources-game')).toBeAttached()
  const resources = await page.evaluate(() => {
    const game = document.querySelector('.resources-game')
    return {
      bg: getComputedStyle(game).backgroundColor,
      after: getComputedStyle(game,'::after').display,
    }
  })
  expect(resources.bg).toBe('rgb(242, 237, 229)')
  expect(resources.after).toBe('none')

  await page.goto('/app')
  await expect(page.locator('.app-features-grid > .app-feature').first()).toBeAttached()
  const app = await page.evaluate(() => {
    const grid = document.querySelector('.app-features-grid')
    const first = grid.children[0]
    return {
      columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
      width: first.getBoundingClientRect().width,
    }
  })
  expect(app.columns).toBe(3)
  expect(app.width).toBeGreaterThan(300)
})

test('V4 / FAQ es legible y 404 recupera navegación', async ({ page }) => {
  await page.goto('/faq')
  const card = page.locator('.faq-accordion').first()
  await expect(card).toBeVisible()
  const faqBackground = await card.evaluate(el => getComputedStyle(el).backgroundColor)
  expect(['rgb(255, 250, 244)', 'rgb(249, 237, 224)']).toContain(faqBackground)

  await page.goto('/audit-v4-route-not-found')
  await expect(page.locator('.bayona-lost-world__number')).toContainText('404')
  await expect(page.locator('.bayona-lost-world__orbit')).toBeAttached()
  await expect(page.locator('.bayona-lost-world__route')).toHaveCount(4)
})
