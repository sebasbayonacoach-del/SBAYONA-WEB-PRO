import {test,expect} from '@playwright/test'

test('BAYONA no atribuye retratos personales sin confirmar',async({page})=>{
 await page.goto('/')
 const block=page.locator('#archivo-real')
 await expect(block.getByRole('heading',{name:/IMÁGENES DEL.*ARCHIVO REAL/s})).toBeVisible()
 await expect(block.locator('.bayona-real-archive__photo')).toHaveCount(0)
 await expect(block.locator('video')).toHaveCount(3)
 const sources=await block.locator('video').evaluateAll(nodes=>nodes.map(el=>el.getAttribute('src')))
 for(const source of sources)expect(source).toMatch(/^\/videos\/bayona-authentic\/.+\.mp4$/)
})

test('Los clips originales y sus portadas responden desde el sitio',async({request})=>{
 for(const name of ['broll-rio','movimiento-entorno','movimiento-pov']){
  const img=await request.get('/images/bayona-authentic/'+name+'.webp')
  expect(img.ok(),name).toBe(true)
  const media=await request.get('/videos/bayona-authentic/'+name+'.mp4')
  expect(media.ok(),name).toBe(true)
  expect(media.headers()['content-type']).toContain('video/mp4')
 }
})
test('Móvil: archivo real sin desbordamiento horizontal ni videos sonoros automáticos',async({page})=>{
 await page.setViewportSize({width:390,height:844})
 await page.goto('/')
 await expect(page.locator('#archivo-real')).toBeAttached()
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1)
 for(const vid of await page.locator('#archivo-real video').all()){
  expect(await vid.evaluate(x=>({muted:x.muted,defaultMuted:x.defaultMuted}))).toMatchObject({muted:true})
 }
})
test('Nosotros utiliza un paisaje y el asistente un monograma, nunca la persona cuestionada',async({page})=>{
 await page.goto('/about')
 await expect(page.locator('.about-founder__visual img')).toHaveAttribute('src','/images/bayona-authentic/broll-rio.webp')
 await expect(page.locator('.about-founder__image-marker')).toContainText('DEL ARCHIVO AL MOVIMIENTO')
 await page.goto('/')
 await page.getByRole('button',{name:/O habla con Sebastián/i}).click()
 await expect(page.locator('.bayona-coach__portrait img')).toHaveCount(0)
 await expect(page.locator('.bayona-coach__portrait-brand')).toHaveText('SB')
})

test('El enlace directo salta a la galería auténtica, también con carga diferida',async({page})=>{
 await page.goto('/#archivo-real')
 await expect(page.locator('#archivo-real')).toBeVisible()
 await expect.poll(async()=>page.locator('#archivo-real').evaluate(x=>x.getBoundingClientRect().top)).toBeLessThan(170)
})
