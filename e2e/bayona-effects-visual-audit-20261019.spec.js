import {test,expect} from '@playwright/test'

const scenes=[
 ['/community','aurora-flow'],
 ['/parkour-academy','riso-dither'],
 ['/resources','halftone'],
 ['/about','fluted-glass'],
 ['/shop','holo-foil'],
 ['/','mesh-gradient'],
]
for(const [route,effect] of scenes){
 test('Visual audit: '+effect+' sits behind content and stays bounded',async({page})=>{
  await page.goto(route)
  const canvas=page.locator('canvas[data-bayona-effect="'+effect+'"]')
  await expect(canvas).toBeAttached()
  const data=await canvas.evaluate(el=>{
   const layer=el.getBoundingClientRect(),section=el.parentElement.getBoundingClientRect()
   const style=getComputedStyle(el)
   return {layerW:layer.width,layerH:layer.height,sectionW:section.width,
    topLayer:layer.top,topSection:section.top,opacity:Number(style.opacity),
    stack:style.zIndex,interaction:style.pointerEvents}
  })
  expect(data.layerW).toBeLessThanOrEqual(701)
  expect(data.layerH).toBeLessThanOrEqual(541)
  expect(data.layerW).toBeLessThan(data.sectionW)
  expect(data.stack).toBe('-1')
  expect(data.interaction).toBe('none')
  expect(data.opacity).toBeLessThanOrEqual(.33)
 })
}
test('Desktop HUD is compact and does not cover a large part of section',async({page})=>{
 await page.setViewportSize({width:1280,height:850})
 await page.goto('/community')
 await page.locator('.bayona-cinema-chapter').nth(1).scrollIntoViewIfNeeded()
 const hud=page.getByTestId('bayona-mission-hud')
 await expect(hud).toBeVisible()
 const size=await hud.evaluate(el=>({
  w:el.getBoundingClientRect().width,
  h:el.getBoundingClientRect().height,
  pointer:getComputedStyle(el).pointerEvents,
 }))
 expect(size.w).toBeLessThanOrEqual(240)
 expect(size.h).toBeLessThanOrEqual(120)
 expect(size.pointer).toBe('none')
})
test('Mobile: effects cannot cover text, buttons or viewport width',async({page})=>{
 await page.setViewportSize({width:390,height:844})
 await page.goto('/community')
 const layers=page.locator('canvas[data-bayona-effect]')
 await expect(layers).toHaveCount(3)
 for(const layer of await layers.all()){
  const v=await layer.evaluate(el=>({z:getComputedStyle(el).zIndex,
   opacity:Number(getComputedStyle(el).opacity),
   w:el.getBoundingClientRect().width,
   interaction:getComputedStyle(el).pointerEvents}))
  expect(v.z).toBe('-1')
  expect(v.opacity).toBeLessThanOrEqual(.2)
  expect(v.w).toBeLessThanOrEqual(390)
  expect(v.interaction).toBe('none')
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1)
})
