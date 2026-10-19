import {test,expect} from '@playwright/test'
import {EFFECT_PLACEMENTS,ALL_EFFECT_SLUGS} from '../src/components/effects/effectRegistry.js'

for(const [route,placements] of Object.entries(EFFECT_PLACEMENTS)){
 test('Capas procedurales originales, ruta '+route,async({page})=>{
  const errors=[];page.on('pageerror',err=>errors.push(err.message))
  await page.goto(route)
  const layers=page.locator('canvas[data-bayona-effect]')
  await expect(layers).toHaveCount(placements.length)
  expect(await layers.evaluateAll(nodes=>nodes.map(x=>x.dataset.bayonaEffect)))
   .toEqual(placements.map(x=>x.effect))
  for(const layer of await layers.all()){
   const values=await layer.evaluate(el=>({
    width:el.width,height:el.height,pointerEvents:getComputedStyle(el).pointerEvents,
    ariaHidden:el.getAttribute('aria-hidden'),label:el.dataset.effectName,
   }))
   expect(values.width).toBeGreaterThan(50)
   expect(values.height).toBeGreaterThan(50)
   expect(values.pointerEvents).toBe('none')
   expect(values.ariaHidden).toBe('true')
   expect(values.label).toBeTruthy()
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1)
  expect(errors).toEqual([])
 })
}

test('Homepage film photo remains readable and is NOT obscured by an effect',async({page})=>{
 await page.setViewportSize({width:390,height:844})
 await page.goto('/')
 await expect(page.locator('#inicio canvas[data-bayona-effect]')).toHaveCount(0)
 await expect(page.getByRole('heading',{name:'Muévete a tu manera'})).toBeVisible()
 await expect(page.getByRole('dialog')).toHaveCount(0)
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1)
})
test('No animated effects inside checkout/payment or private application',async({page})=>{
 for(const route of ['/checkout?plan=FUERZA','/order-confirmation']){
  await page.goto(route)
  await expect(page.locator('canvas[data-bayona-effect]')).toHaveCount(0)
 }
})
test('Reduced motion: single still visual, no blocking overlays or forced effects',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'})
 await page.goto('/community')
 const layer=page.locator('canvas[data-bayona-effect="aurora-flow"]')
 await expect(layer).toBeAttached()
 await layer.scrollIntoViewIfNeeded()
 const color=await layer.evaluate(el=>({
  alpha:Number(getComputedStyle(el).opacity),
  interaction:getComputedStyle(el).pointerEvents,
 }))
 expect(color.alpha).toBeLessThan(.4)
 expect(color.interaction).toBe('none')
})
test('No duplicated effect IDs across the full editorial site',async()=>{
 const actual=Object.values(EFFECT_PLACEMENTS).flatMap(x=>x.map(t=>t.effect))
 expect(actual.sort()).toEqual([...ALL_EFFECT_SLUGS].sort())
})
