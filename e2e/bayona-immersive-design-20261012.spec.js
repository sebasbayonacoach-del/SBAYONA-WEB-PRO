import { test, expect } from '@playwright/test'

test('Inicio: manifiesto editorial, cartas reales y acciones visibles', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await expect(page.locator('.bayona-manifesto-band')).toBeVisible()
  await expect(page.locator('.bayona-hero-coordinates')).toBeAttached()
  await expect(page.locator('.bayona-service-card-giant')).toHaveCount(4)
  await expect(page.locator('.gym-service-card')).toHaveCount(4)
  const dimensions = await page.evaluate(() => ({
    heroHeight: Math.round(document.querySelector('.gym-home-hero').getBoundingClientRect().height),
    ctaTop: Math.round(document.querySelector('.gym-home-hero__actions').getBoundingClientRect().top),
    overflow: document.documentElement.scrollWidth - innerWidth,
  }))
  expect(dimensions.heroHeight).toBeLessThan(1100)
  expect(dimensions.ctaTop).toBeLessThan(880)
  expect(dimensions.overflow).toBeLessThanOrEqual(1)
  await page.locator('.bayona-manifesto-band a').click()
  await expect(page).toHaveURL(/#servicios$/)
})

for (const width of [390, 1440]) {
  for (const theme of ['day','night']) {
    test(`404: movimiento, rutas reales y tema ${width}/${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 850 })
      await page.addInitScript(value => localStorage.setItem('bayona-site-theme',value), theme)
      await page.goto('/esta-ruta-no-existe-bayona')
      await expect(page.getByRole('heading', { name: /PERDER EL RUMBO/i })).toBeVisible()
      await expect(page.locator('.bayona-lost-world__number')).toHaveText(/404/)
      await expect(page.locator('.bayona-lost-world__orbit')).toBeAttached()
      const routes = page.locator('.bayona-lost-world__route')
      await expect(routes).toHaveCount(4)
      await expect(page.locator('.bayona-lost-world__pathname code')).toHaveText('/esta-ruta-no-existe-bayona')
      await expect(page.getByRole('link', {name: /VOLVER AL INICIO/i})).toHaveAttribute('href','/')
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1)
      await routes.first().click()
      await expect(page).toHaveURL(/\/programs$/)
    })
  }
}

const covers=[
 ['/about','.about-page .page-hero-content'],
 ['/shop','.shop-page .shop-hero-content'],
 ['/community','.community-page .community-hero-copy'],
 ['/resources','.resources-page .resources-hero-copy'],
 ['/app','.app-page .app-hero-content'],
 ['/parkour-academy','.parkour-academy .academy-hero-copy'],
]
for(const [path,sel] of covers){
  test(`BAYONA / portada editorial propia ${path}`, async ({page}) => {
    await page.goto(path)
    await expect(page.locator(sel).first()).toBeAttached()
    const result=await page.locator(sel).first().evaluate(node=>({
      marker:getComputedStyle(node,'::before').content,
      border:getComputedStyle(node).borderLeftWidth,
      overflow:document.documentElement.scrollWidth-innerWidth,
    }))
    expect(result.marker).not.toBe('none')
    expect(result.marker.length).toBeGreaterThan(6)
    expect(result.border).toBe('2px')
    expect(result.overflow).toBeLessThanOrEqual(1)
  })
}
