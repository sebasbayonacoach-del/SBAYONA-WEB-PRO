import { expect, test } from '@playwright/test'

for (const v of [{ w: 390, h: 844 }, { w: 726, h: 950 }, { w: 1440, h: 900 }]) {
  test(`gallery and editorial narrative have separate real estate at ${v.w}px`, async ({ page }) => {
    await page.setViewportSize({ width: v.w, height: v.h })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const stage = page.locator('.vision-shift-stage--spatial')
    await stage.scrollIntoViewIfNeeded()
    const layout = await stage.evaluate((element) => ({
      start: element.getBoundingClientRect().top + window.scrollY,
      travel: element.getBoundingClientRect().height - element.querySelector('.sticky-stage-viewport').getBoundingClientRect().height,
    }))
    for (const fraction of [.18, .38, .57, .75, .95]) {
      await page.evaluate(y => window.scrollTo(0, y), layout.start + layout.travel * fraction)
      await page.waitForTimeout(330)
      const geometry = await stage.evaluate((element) => {
        const visual = element.querySelector('.vision-shift-visual').getBoundingClientRect()
        const heading = element.querySelector('.vision-shift-copy h3').getBoundingClientRect()
        const copy = element.querySelector('.vision-shift-copy').getBoundingClientRect()
        const cta = element.querySelector('.vision-spatial-cta')?.getBoundingClientRect()
        return { visualBottom: visual.bottom, visualRight: visual.right, headingTop: heading.top, headingLeft: heading.left, copyBottom: copy.bottom, ctaTop: cta?.top }
      })
      if (v.w <= 760) {
        expect(geometry.headingTop - geometry.visualBottom, `spacing at ${v.w}px, fraction ${fraction}`).toBeGreaterThanOrEqual(12)
      } else {
        expect(geometry.headingLeft - geometry.visualRight).toBeGreaterThanOrEqual(24)
      }
      if (geometry.ctaTop != null) expect(geometry.ctaTop - geometry.copyBottom).toBeGreaterThanOrEqual(16)
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2)
    expect(overflow).toBe(false)
    await page.screenshot({ path: `test-results/playwright/vision-gallery-no-overlap/${v.w}.png` })
  })
}
