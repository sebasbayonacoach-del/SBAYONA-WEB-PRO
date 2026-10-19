import {test,expect} from '@playwright/test'

test('BAYONA App es un producto real con un acceso principal y recorrido visual corto',async({page,request})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message))
 await page.goto('/app')
 const launch=page.getByTestId('bayona-app-launch')
 await expect(launch.getByRole('heading',{level:1,name:/TU VIDA.*TU RITMO.*TU APP/s})).toBeVisible()
 await expect(launch.locator('.bayona-launch__mission')).toHaveCount(3)
 await expect(launch.locator('.bayona-launch__role')).toHaveCount(2)
 await expect(launch.getByRole('heading',{name:/TODA LA EXPERIENCIA.*EN TU MÓVIL/s})).toBeAttached()
 const links=launch.locator('a[href*="/mi-app/index.html"]')
 expect(await links.count()).toBeGreaterThanOrEqual(4)
 for(const element of await links.all()){
  await expect(element).toHaveAttribute('href','/mi-app/index.html?source=pwa')
 }
 expect(await page.locator('main [data-testid="app-bridge-cinematic"]').count()).toBe(0)
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1)
 const app=await request.get('/mi-app/index.html?source=pwa')
 expect(app.status()).toBe(200)
 expect((await app.text())).toContain('manifest.webmanifest')
 const manifest=await request.get('/mi-app/manifest.webmanifest')
 expect(manifest.status()).toBe(200)
 const info=await manifest.json()
 expect(info.display).toBe('standalone')
 expect(info.scope).toBe('./')
 expect(errors).toEqual([])
})

test('En móvil BAYONA App comunica instalación PWA, sin inventar APK disponible',async({page})=>{
 await page.setViewportSize({width:390,height:844})
 await page.goto('/app')
 const launch=page.getByTestId('bayona-app-launch')
 await expect(launch.getByRole('link',{name:/ABRIR PARA INSTALAR/})).toHaveAttribute('href','/mi-app/index.html?source=pwa')
 await expect(launch).toContainText('La instalación depende del navegador')
 await expect(launch).toContainText('No anunciamos una APK')
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1)
 const broken=await launch.locator('img').evaluateAll(nodes=>nodes.filter(x=>x.complete&&x.naturalWidth===0).length)
 expect(broken).toBe(0)
})

for(const path of ['/about','/programs','/movimiento-adaptado','/parkour-academy','/community','/resources','/faq','/shop']){
 test('Recorrido cinematográfico conduce a app real desde '+path,async({page})=>{
  await page.setViewportSize({width:390,height:844})
  const errors=[];page.on('pageerror',e=>errors.push(e.message))
  await page.goto(path)
  const bridge=page.getByTestId('app-bridge-cinematic')
  await expect(bridge).toHaveCount(1)
  await expect(bridge.locator('h2')).toBeAttached()
  await expect(bridge.getByRole('link',{name:/ABRIR BAYONA APP/})).toHaveAttribute('href','/mi-app/index.html?source=pwa')
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1)
  expect(errors).toEqual([])
 })
}
test('Inicio muestra BAYONA App antes de Servicios, sin duplicarla',async({page})=>{
 await page.goto('/')
 await expect(page.getByRole('dialog')).toHaveCount(0)
 const position=await page.evaluate(()=>({
   app:document.querySelector('.bayona-live-app--home')?.getBoundingClientRect().top+scrollY,
   services:document.querySelector('#servicios')?.getBoundingClientRect().top+scrollY,
   total:document.querySelectorAll('.bayona-live-app--home').length,
 }))
 expect(position.total).toBe(1)
 expect(position.app).toBeLessThan(position.services)
})

test('Instalación: Android e iPhone reciben instrucciones correctas y el enlace directo funciona',async({browser})=>{
 const profiles=[
  {device:'ANDROID',ua:'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36',hint:'Instalar aplicación'},
  {device:'IPHONE / IPAD',ua:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',hint:'Añadir a pantalla de inicio'},
 ]
 for(const profile of profiles){
  const context=await browser.newContext({userAgent:profile.ua,viewport:{width:390,height:844},isMobile:true,hasTouch:true})
  const page=await context.newPage()
  await page.goto('/app#instalar-app',{waitUntil:'domcontentloaded'})
  await expect(page.getByRole('heading',{name:/TODA LA EXPERIENCIA.*EN TU MÓVIL/s})).toBeVisible()
  const copy=page.locator('.bayona-launch__device-hint')
  await expect(copy).toContainText(profile.device)
  await expect(copy).toContainText(profile.hint)
  const top=await page.locator('#instalar-app').evaluate(el=>el.getBoundingClientRect().top)
  expect(top).toBeGreaterThanOrEqual(40)
  expect(top).toBeLessThanOrEqual(200)
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1)
  await context.close()
 }
})
