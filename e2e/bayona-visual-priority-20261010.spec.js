import { test, expect } from '@playwright/test'

const styles = async (page, selector) => page.locator(selector).first().evaluate((el) => {
  const r=el.getBoundingClientRect(), st=getComputedStyle(el)
  return { width:r.width,height:r.height,left:r.left,right:r.right,top:r.top,bottom:r.bottom,bg:st.backgroundColor,color:st.color,opacity:st.opacity }
})

for (const width of [1440,390]) {
  test(`Parkour 3 niveles en retícula legible sin etapas vacías (${width}px)`,async({page})=>{
    await page.setViewportSize({width,height:width===390?844:900})
    await page.emulateMedia({reducedMotion:'reduce'})
    await page.goto('/parkour-academy',{waitUntil:'networkidle'})
    const cards=page.locator('.academy-progression__cards > li')
    await expect(cards).toHaveCount(3)
    await expect(page.locator('.academy-level-preview')).toHaveCount(0)
    await expect(page.locator('.academy-level-grid--stage')).toHaveCount(0)
    for (const name of ['BASE','FLUJO','RENDIMIENTO']) await expect(cards.getByRole('heading',{name})).toBeVisible()
    const rects=await cards.evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return{left:r.left,top:r.top,width:r.width,height:r.height}}))
    expect(rects.every(r=>r.width>250&&r.height>350)).toBe(true)
    if (width===1440) expect(rects[0].top).toBeCloseTo(rects[2].top,0)
    else expect(rects[0].top).toBeLessThan(rects[2].top)
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(3)
  })
  test(`Nosotros método muestra las 3 decisiones contrastadas (${width}px)`,async({page})=>{
    await page.setViewportSize({width,height:width===390?844:900})
    await page.emulateMedia({reducedMotion:'reduce'})
    await page.goto('/about',{waitUntil:'networkidle'})
    const steps=page.locator('.about-decision-stage__step')
    await expect(steps).toHaveCount(3)
    for (const name of ['VALORAR','PLANIFICAR','AJUSTAR']) await expect(steps.getByRole('heading',{name})).toBeVisible()
    const heading=await styles(page,'.about-method-heading h2')
    const card=await styles(page,'.about-decision-stage__step')
    expect(heading.width).toBeGreaterThan(270)
    expect(card.width).toBeGreaterThan(width===390?300:350)
    expect(card.bg).not.toBe('rgba(0, 0, 0, 0)')
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(3)
  })
  test(`Servicios visible y con panel de planes contrastado (${width}px)`,async({page})=>{
    await page.setViewportSize({width,height:width===390?844:900})
    await page.emulateMedia({reducedMotion:'reduce'})
    await page.goto('/programs',{waitUntil:'networkidle'})
    await expect(page.locator('.plan-explorer')).toBeVisible()
    const css=await styles(page,'.services-memberships')
    expect(css.bg).toBe('rgb(30, 36, 35)')
    await expect(page.locator('.services-memberships .plan-showroom-tab').first()).toBeVisible()
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(3)
  })
}

test('Day mode conserves warm paper with readable ink in Services',async({page})=>{
  await page.goto('/programs',{waitUntil:'networkidle'})
  await page.evaluate(()=>document.documentElement.dataset.bayonaTheme='day')
  const css=await styles(page,'.services-memberships')
  expect(css.bg).toBe('rgb(232, 223, 210)')
  const heading=await styles(page,'.services-memberships .services-heading h2')
  expect(heading.color).toBe('rgb(37, 33, 28)')
})
