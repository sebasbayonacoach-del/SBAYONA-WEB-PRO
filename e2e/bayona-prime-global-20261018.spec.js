import {test,expect} from '@playwright/test'
const routes=['/about','/programs','/movimiento-adaptado','/parkour-academy','/app','/community','/resources','/faq','/shop','/plan/fuerza']

for(const path of routes){
 test('BAYONA PRIME mantiene un lenguaje cinematográfico en '+path, async({page})=>{
  await page.goto(path)
  await expect(page.locator('body')).toHaveAttribute('data-bayona-cinema-route',path)
  await expect(page.locator('.bayona-cinema-chapter').first()).toBeAttached()
  await expect(page.locator('.bayona-cinema-track')).toBeAttached()
  const width=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)
  expect(width).toBeLessThanOrEqual(1)
  await page.evaluate(()=>scrollTo(0,900))
  await expect(page.locator('.bayona-cinema-track.is-visible')).toBeVisible()
 })
}
test('La portada es libre y la recepción solo se abre si se solicita',async({page})=>{
 await page.goto('/')
 const coach=page.getByRole('dialog')
 await expect(coach).toHaveCount(0)
 await page.getByRole('button',{name:/O habla con Sebastián/i}).click()
 await expect(coach.getByRole('heading',{name:'¿Cómo te llamas?'})).toBeVisible()
 await page.getByRole('button',{name:'Salir de la visita guiada'}).click()
 await expect(coach).toHaveCount(0)
 await expect(page.locator('.bayona-cinema-chapter')).toHaveCount(9)
 await page.evaluate(()=>scrollTo(0,900))
 await expect(page.locator('.bayona-cinema-track.is-visible')).toBeVisible()
})
test('La tienda utiliza imágenes existentes y texto legible en categorías',async({page})=>{
 await page.setViewportSize({width:390,height:844})
 await page.goto('/shop')
 const tiles=page.locator('.shop-category-shortcuts button')
 await expect(tiles).toHaveCount(6)
 const valid=await tiles.evaluateAll(nodes=>nodes.every(node=>getComputedStyle(node).backgroundImage.includes('url(')))
 expect(valid).toBe(true)
 const p=page.locator('.shop-categories-head > p').last()
 const rgb=await p.evaluate(el=>getComputedStyle(el).color)
 expect(rgb).not.toBe('rgb(238, 228, 215)')
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1)
})

test('Los cuatro planes y todas las familias de servicios están abiertos sin seleccionar pestañas',async({page})=>{
 await page.goto('/programs')
 await expect(page.locator('.bayona-plan-open__card')).toHaveCount(4)
 await expect(page.locator('.plan-explorer')).toHaveCount(0)
 await expect(page.locator('.services-catalog-details[open]')).toHaveCount(3)
 await expect(page.locator('.bayona-plan-open__heading h3')).toHaveCount(4)
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1)
})
