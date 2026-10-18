import { test, expect } from '@playwright/test'

function rgb(str) {
  const parts = String(str).match(/[\d.]+/g)?.map(Number) || []
  return parts.slice(0, 3)
}
function luminance(c) {
  return c.map(v => {
    const n = v / 255
    return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4
  }).reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0)
}
function contrast(a, b) {
  const [l, r] = [luminance(rgb(a)), luminance(rgb(b))].sort((x, y) => y-x)
  return (l + .05) / (r + .05)
}
for (const width of [390, 1440]) {
  test('community social content is readable at ' + width, async ({page}) => {
    await page.setViewportSize({width,height:900})
    await page.goto('/community')
    await expect(page.locator('.community-social-title').first()).toBeVisible({ timeout: 15000 })
    const values = await page.evaluate(() => {
      const sample = sel => {
        const el = document.querySelector(sel)
        return { color: getComputedStyle(el).color, size: parseFloat(getComputedStyle(el).fontSize) }
      }
      const cards = [...document.querySelectorAll('.community-social-card')]
      return {
        bg: getComputedStyle(document.querySelector('.community-live')).backgroundColor,
        title: sample('.community-live .community-title'),
        intro: sample('.community-live .community-section-subtitle'),
        heading: sample('.community-social-title'),
        date: sample('.community-live-date'),
        cards:cards.map(n=>{
          const card=n.getBoundingClientRect(), action=n.querySelector('.community-social-link').getBoundingClientRect()
          return { visible: action.bottom<=card.bottom+1, height:action.height, cardHeight:card.height }
        })
      }
    })
    for (const item of ['title','intro','heading','date']) {
      expect(contrast(values[item].color, values.bg),item).toBeGreaterThanOrEqual(4.5)
    }
    for (const card of values.cards) {
      expect(card.visible).toBe(true)
      expect(card.height).toBeGreaterThanOrEqual(44)
      if (width === 390) expect(card.cardHeight).toBeLessThan(360)
    }
  })
  test('FAQ has legible foreground and no image wash at '+width, async({page})=>{
    await page.setViewportSize({width,height:900})
    await page.goto('/faq')
    await expect(page.locator('.faq-accordion').first()).toBeVisible({ timeout: 15000 })
    const result=await page.evaluate(()=>{
      const q=sel=>getComputedStyle(document.querySelector(sel)).color
      const cat=document.querySelector('.faq-section')
      return {
        pseudo:getComputedStyle(cat,'::before').display,
        title:q('.faq-category-title'),
        question:q('.faq-question-text'),
        bg:getComputedStyle(document.querySelector('.faq-accordion')).backgroundColor,
        categoryMargin:getComputedStyle(document.querySelector('.faq-category')).marginBottom,
      }
    })
    expect(result.pseudo).toBe('none')
    if (width === 390) expect(result.categoryMargin).toBe('0px')
    expect(contrast(result.title,'rgb(241, 236, 227)')).toBeGreaterThan(4.5)
    expect(contrast(result.question,result.bg)).toBeGreaterThan(4.5)
  })
}
