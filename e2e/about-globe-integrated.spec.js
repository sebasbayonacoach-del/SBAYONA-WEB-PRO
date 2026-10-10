import { test, expect } from '@playwright/test'

test('globo unificado: la cartografía y las historias viven en una sola escena', async ({ page }) => {
  await page.goto('/about', { waitUntil: 'networkidle' })
  const atlas = page.locator('.globe-testimonials-canvas')
  await expect(atlas).toBeVisible()
  await expect(atlas.locator('.globe-testimonials-world-point')).toHaveCount(10)
  await expect(page.locator('.about-globe-webgl')).toHaveCount(0)
  await expect(page.locator('.globe-trajectory-stop')).toHaveCount(3)
  await page.locator('.globe-trajectory-stop').first().click()
  await expect(page.getByRole('dialog')).toContainText(/Bogotá.*Colombia/i)
  const photo = page.locator('.globe-testimonials-media-visual')
  await expect(photo).toHaveAttribute('loading','eager')
  await expect.poll(async () => photo.evaluate(img => img.naturalWidth > 0), {timeout:15000}).toBe(true)
})

test('globo accesible y móvil: modos con o sin WebGL no rompen la lectura', async ({ page }) => {
  await page.setViewportSize({ width:390,height:844 })
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.goto('/about', {waitUntil:'networkidle'})
  await expect(page.locator('.globe-impact-stat')).toHaveCount(3)
  await expect(page.locator('.globe-testimonials-world-point')).toHaveCount(10)
  if (await page.locator('.globe-is-three-ready').count()) {
    await expect(page.locator('.globe-testimonials-world')).toHaveAttribute('aria-hidden','true')
    await expect(page.locator('.globe-testimonials-world-point').first()).toHaveAttribute('tabindex','-1')
  }
  await page.locator('.globe-trajectory-stop').nth(1).click()
  await expect(page.getByRole('dialog')).toContainText(/España/i)
  const scroll = await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)
  expect(scroll).toBeLessThanOrEqual(3)
})

test('la información editorial de Nosotros queda visible sin slides gigantes',async({page})=>{
 await page.setViewportSize({width:1440,height:900})
 await page.goto('/about',{waitUntil:'networkidle'})
 await expect(page.locator('.about-values-stage__card')).toHaveCount(4)
 await expect(page.locator('.about-decision-stage__step')).toHaveCount(3)
 await expect(page.locator('.about-values-stage__sticky')).toHaveCount(0)
 await expect(page.locator('.about-decision-stage__sticky')).toHaveCount(0)
})

test('sin WebGL, el mapa plano recupera sus puntos y sigue funcionando',async({page})=>{
 await page.addInitScript(()=>{
   const original=HTMLCanvasElement.prototype.getContext
   HTMLCanvasElement.prototype.getContext=function(kind,...args){
     if(kind==='webgl'||kind==='webgl2'||kind==='experimental-webgl')return null
     return original.call(this,kind,...args)
   }
 })
 await page.goto('/about',{waitUntil:'networkidle'})
 const map=page.locator('.globe-testimonials-world')
 await expect(map).toHaveAttribute('aria-hidden','false')
 await expect(map.locator('button')).toHaveCount(10)
 await map.locator('button').first().click()
 await expect(page.getByRole('dialog')).toContainText(/Bogotá/i)
})
