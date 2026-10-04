import { expect, test } from '@playwright/test'

for (const {width,height,minHeight} of [
  {width:390,height:844,minHeight:360},
  {width:726,height:950,minHeight:460},
  {width:1440,height:900,minHeight:600},
]) {
  test(`teléfono protagonista realista, lectura y CTA — ${width}px`,async({page})=>{
    await page.setViewportSize({width,height})
    await page.emulateMedia({reducedMotion:'no-preference'})
    const pageErrors=[]
    page.on('pageerror',error=>pageErrors.push(error.message))
    await page.goto('/',{waitUntil:'domcontentloaded'})
    const stage=page.locator('.vision-shift-stage--spatial')
    await stage.scrollIntoViewIfNeeded()
    const {top,distance}=await stage.evaluate(el=>({
      top:el.getBoundingClientRect().top+scrollY,
      distance:el.getBoundingClientRect().height-el.querySelector('.sticky-stage-viewport').getBoundingClientRect().height,
    }))
    await page.evaluate(y=>scrollTo(0,y),top+distance*.95)
    await expect(stage.locator('[data-vision-step="5"]')).toBeAttached({timeout:17000})
    const phone=stage.locator('.vision-spatial-frame--phone[data-frame="continuidad"]')
    await expect(phone).toBeAttached()
    const figure=await phone.evaluate(el=>{
      const r=el.getBoundingClientRect()
      const visual=el.closest('.vision-shift-viewport').querySelector('.vision-shift-visual').getBoundingClientRect()
      const heading=el.closest('.vision-shift-viewport').querySelector('.vision-shift-copy h3').getBoundingClientRect()
      return {width:r.width,height:r.height,radius:getComputedStyle(el).borderRadius,
        opacity:+getComputedStyle(el).opacity,visualBottom:visual.bottom,headingTop:heading.top,
        visualRight:visual.right,headingLeft:heading.left}
    })
    expect(figure.height).toBeGreaterThan(minHeight)
    expect(figure.height/figure.width).toBeGreaterThan(1.85)
    expect(figure.height/figure.width).toBeLessThan(2.45)
    expect(figure.radius).not.toBe('0px')
    expect(figure.opacity).toBeGreaterThan(.95)
    if(width<=760)expect(figure.headingTop-figure.visualBottom).toBeGreaterThanOrEqual(12)
    else expect(figure.headingLeft-figure.visualRight).toBeGreaterThanOrEqual(24)
    const cta=stage.getByRole('link',{name:/DESCUBRE TU PROGRAMA/})
    await expect(cta).toBeVisible()
    await expect(cta).toHaveAttribute('href','/programs')
    const ctaBox=await cta.boundingBox()
    expect(ctaBox.y).toBeGreaterThan(60)
    expect(ctaBox.y+ctaBox.height).toBeLessThanOrEqual(height)
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2)).toBe(false)
    expect(pageErrors).toEqual([])
    await page.screenshot({path:`test-results/playwright/vision-phone-hero/final-${width}.png`})
  })
}

test('modo reducido mantiene los cinco pasos con enlace accesible',async({page})=>{
  await page.setViewportSize({width:390,height:844})
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.goto('/',{waitUntil:'domcontentloaded'})
  const stage=page.locator('.vision-shift-stage--spatial.sticky-stage--static')
  await expect(stage.locator('.sticky-stage-frame')).toHaveCount(5)
  await expect(stage.locator('.vision-spatial-frame')).toHaveCount(0)
  await expect(stage.locator('.sticky-stage-frame').last().getByRole('link',{name:/DESCUBRE TU PROGRAMA/})).toBeVisible()
})
