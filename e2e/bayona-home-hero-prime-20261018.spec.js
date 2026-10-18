import { test, expect } from '@playwright/test'

const viewports = [
  { name: 'wide', width: 1600, height: 900 },
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'laptop', width: 1180, height: 820 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'small', width: 320, height: 700 },
]

for (const viewport of viewports) {
  test(`home hero editorial / ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Entrena con dirección' })).toBeVisible()
    const hero = page.locator('.gym-home-hero')
    const first = page.locator('.gym-home-hero .bayona-hero-prime__line').first()
    const emphasis = page.locator('.gym-home-hero .bayona-hero-prime__line em')
    await expect(first).toHaveText('ENTRENA')
    await expect(emphasis).toHaveText('DIRECCIÓN.')

    const a = hero.getByRole('link', { name: /EMPIEZA A TU RITMO/i })
    const b = hero.getByRole('link', { name: /EXPLORA LOS SERVICIOS/i })
    const c = hero.getByRole('link', { name: /Un comienzo sin coste/i })
    const discover = hero.getByRole('link', { name: /DESCUBRE TU CAMINO/i })
    await expect(a).toHaveAttribute('href', '#empieza')
    await expect(b).toHaveAttribute('href', '/programs')
    await expect(c).toHaveAttribute('href', '#regalos')
    await expect(discover).toHaveAttribute('href', '#servicios')

    const measures = await page.evaluate(() => {
      const hero = document.querySelector('.gym-home-hero').getBoundingClientRect()
      const content = document.querySelector('.gym-home-hero__content').getBoundingClientRect()
      const heading = document.querySelector('#home-hero-title').getBoundingClientRect()
      const line = document.querySelector('.bayona-hero-prime__line--direction')
      const r = document.createRange(); r.selectNodeContents(line)
      const titleText = r.getBoundingClientRect()
      const button = document.querySelector('.gym-primary-button').getBoundingClientRect()
      const secondButton = document.querySelector('.gym-secondary-button').getBoundingClientRect()
      const gift = document.querySelector('.gym-home-reward').getBoundingClientRect()
      const foot = document.querySelector('.bayona-hero-prime__footer').getBoundingClientRect()
      return {
        overflow: document.documentElement.scrollWidth - innerWidth,
        heading: heading.width,
        textRight: titleText.right,
        heroRight: hero.right,
        contentRight: content.right,
        buttons: [button.height, secondButton.height],
        giftHeight: gift.height,
        footBottom: foot.bottom,
        heroBottom: hero.bottom,
        colors: {
          first: getComputedStyle(document.querySelector('.bayona-hero-prime__line')).color,
          emphasis: getComputedStyle(document.querySelector('.bayona-hero-prime__line em')).color,
        },
      }
    })
    expect(measures.overflow).toBeLessThanOrEqual(1)
    expect(measures.textRight).toBeLessThanOrEqual(viewport.width + 1)
    expect(measures.footBottom).toBeLessThanOrEqual(measures.heroBottom + 3)
    for (const height of measures.buttons) expect(height).toBeGreaterThanOrEqual(44)
    expect(measures.giftHeight).toBeGreaterThanOrEqual(36)
    expect(measures.colors.first).not.toBe(measures.colors.emphasis)
  })
}

test('home hero stays readable in day and night modes', async ({page}) => {
  await page.goto('/')
  for (const theme of ['day', 'night']) {
    await page.evaluate(t => document.documentElement.setAttribute('data-bayona-theme',t),theme)
    const data = await page.evaluate(() => {
      const hero=document.querySelector('.gym-home-hero')
      const a=getComputedStyle(hero,'::after')
      return {
        first: getComputedStyle(document.querySelector('.bayona-hero-prime__line')).color,
        direction: getComputedStyle(document.querySelector('.bayona-hero-prime__line em')).color,
        background: a.backgroundImage,
        opacity: a.opacity,
      }
    })
    expect(data.first).not.toBe(data.direction)
    expect(data.background).toContain('bayona-home-cinematic')
    expect(Number(data.opacity)).toBeGreaterThan(.8)
  }
})
