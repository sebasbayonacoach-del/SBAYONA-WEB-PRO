import { expect, test } from '@playwright/test'

for (const v of [{ w: 390, h: 844 }, { w: 726, h: 950 }, { w: 1440, h: 900 }]) {
  test('tarjetas de servicios separan fotografía y copy sin desbordar a ' + v.w + 'px', async ({ page }) => {
    await page.setViewportSize({ width: v.w, height: v.h })
    await page.goto('/', { waitUntil: 'networkidle' })

    const cards = page.locator('.gym-service-card')
    await expect(cards).toHaveCount(4)
    for (let i = 0; i < 4; i++) {
      const card = cards.nth(i)
      await card.scrollIntoViewIfNeeded()
      const geometry = await card.evaluate((el) => {
        const card = el.getBoundingClientRect()
        const copy = el.querySelector('div').getBoundingClientRect()
        return { cardLeft: card.left, cardRight: card.right, copyLeft: copy.left, copyRight: copy.right }
      })
      expect(geometry.copyLeft).toBeGreaterThanOrEqual(geometry.cardLeft - 1)
      expect(geometry.copyRight).toBeLessThanOrEqual(geometry.cardRight + 1)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2)).toBe(false)
  })
}
