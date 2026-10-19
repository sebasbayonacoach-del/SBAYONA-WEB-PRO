import {test,expect} from '@playwright/test'

test('La recepción se inicia sola y puede reabrirse desde un botón real',async({page})=>{
 await page.goto('/')
 await expect(page.getByRole('dialog')).toBeVisible()
 await page.getByRole('button',{name:'Salir de la visita guiada'}).click()
 await expect(page.getByRole('dialog')).toHaveCount(0)
 const reopen=page.getByRole('button',{name:/Hablar con Sebastián, entrenador digital de BAYONA/i})
 await expect(reopen).toBeVisible()
 await reopen.click()
 await expect(page.getByRole('dialog')).toBeVisible()
 await page.keyboard.press('Escape')
 await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('Selector de idioma sin solapamiento con marca y tema entre 320 y 950px',async({browser})=>{
 test.setTimeout(60000)
 for(const width of [320,390,520,521,600,760,950]){
  const page=await browser.newPage({viewport:{width,height:844},locale:'en-GB'})
  await page.goto('/')
  const offer=page.locator('.translate-offer')
  await expect(offer).toBeVisible()
  const state=await page.evaluate(()=>{
   const rect=selector=>document.querySelector(selector).getBoundingClientRect()
   const brand=rect('.navbar .brand'),lang=rect('.translate-offer'),theme=rect('.navbar .site-theme-toggle')
   const horizontalGap=(a,b)=>b.left-a.right
   const link=rect('.translate-offer-action')
   return {brandGap:horizontalGap(brand,lang),themeGap:horizontalGap(lang,theme),
     visibleText:getComputedStyle(document.querySelector('.translate-offer-code')).display,
     tapWidth:link.width,tapHeight:link.height,scrollOverflow:document.documentElement.scrollWidth-innerWidth}
  })
  expect(state.brandGap,JSON.stringify({width,state})).toBeGreaterThanOrEqual(0)
  expect(state.themeGap,JSON.stringify({width,state})).toBeGreaterThanOrEqual(0)
  expect(state.visibleText).not.toBe('none')
  expect(state.tapWidth).toBeGreaterThanOrEqual(44)
  expect(state.tapHeight).toBeGreaterThanOrEqual(44)
  expect(state.scrollOverflow).toBeLessThanOrEqual(1)
  await page.close()
 }
})
test('La interfaz de traducción no compite con el menú móvil',async({page})=>{
 await page.setViewportSize({width:390,height:844})
 await page.goto('/')
 await page.getByRole('button',{name:'Salir de la visita guiada'}).click()
 const offer=page.locator('.translate-offer')
 await expect(offer).toBeVisible()
 await page.getByRole('button',{name:'Abrir menú'}).click()
 await expect(offer).toBeHidden()
 await expect(page.getByRole('navigation',{name:'Navegación móvil'})).toBeVisible()
 await page.getByRole('button',{name:'Cerrar menú'}).click()
 await expect(offer).toBeVisible()
})
test('Los accesos secundarios de BAYONA App cumplen 44px',async({page})=>{
 await page.setViewportSize({width:390,height:844})
 await page.goto('/app')
 const links=page.locator('.bayona-launch__role-link,.bayona-launch__scroll,.bayona-launch__final-secondary')
 await expect(links.first()).toBeVisible()
 expect(await links.count()).toBeGreaterThan(0)
 for(const item of await links.all()){
  const size=await item.evaluate(x=>({height:x.getBoundingClientRect().height,width:x.getBoundingClientRect().width}))
  expect(size.height).toBeGreaterThanOrEqual(44)
  expect(size.width).toBeGreaterThanOrEqual(44)
 }
})
