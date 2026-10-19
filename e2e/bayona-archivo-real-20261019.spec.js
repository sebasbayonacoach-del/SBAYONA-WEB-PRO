import {test,expect} from '@playwright/test'

test('BAYONA muestra solo fotos del archivo original, no retratos ficticios',async({page})=>{
 await page.goto('/')
 const block=page.locator('#archivo-real')
 await expect(block).toBeVisible()
 await expect(block.getByRole('heading',{name:/VIDA REAL.*MOVIMIENTO REAL/s})).toBeVisible()
 await expect(block.locator('figure img')).toHaveCount(3)
 for(const img of await block.locator('figure img').all()){
  const loaded=await img.evaluate(el=>{
   el.loading='eager'
   return el.decode().then(()=>el.naturalWidth>0).catch(()=>false)
  })
  expect(loaded).toBe(true)
  await expect(img).toHaveAttribute('src',/\/images\/bayona-authentic\//)
 }
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
test('Nosotros y el asistente enlazan a la misma foto original verificada',async({page})=>{
 await page.goto('/about')
 await expect(page.locator('.about-founder__visual img')).toHaveAttribute('src','/images/bayona-authentic/selfie-exterior-2026-04-11.jpg')
 await page.goto('/')
 await page.getByRole('button',{name:/O habla con Sebastián/i}).click()
 await expect(page.locator('.bayona-coach__portrait img')).toHaveAttribute('src','/images/bayona-authentic/selfie-exterior-2026-04-11.jpg')
})
test('El enlace directo salta a la galería auténtica, también con carga diferida',async({page})=>{
 await page.goto('/#archivo-real')
 await expect(page.locator('#archivo-real')).toBeVisible()
 await expect.poll(async()=>page.locator('#archivo-real').evaluate(x=>x.getBoundingClientRect().top)).toBeLessThan(170)
})
