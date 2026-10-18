import {test,expect} from '@playwright/test'

test('Portada: entrada automática, guías sin formulario y consulta de venta real',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message))
 await page.goto('/')
 const coach=page.getByRole('dialog')
 await expect(coach.getByRole('heading',{name:'¿Cómo te llamas?'})).toBeVisible()
 await coach.getByRole('button',{name:'Salir de la visita guiada'}).click()
 await page.locator('.gym-home-lead').scrollIntoViewIfNeeded()
 await expect(page.getByRole('heading',{name:'Te escucho.',exact:true})).toBeVisible()
 await expect(page.locator('.bayona-direct-contact__download')).toHaveCount(3)
 await expect(page.locator('.bayona-direct-contact form')).toHaveCount(0)
 await expect(page.locator('.bayona-direct-contact__whatsapp')).toHaveAttribute('href',/wa\.me\/.+text=/)
 await expect(page.locator('.bayona-cinema-track.is-visible')).toHaveCount(0)
 const personalData=await page.evaluate(()=>localStorage.getItem('bayona_leads'))
 expect(personalData).toBeNull()
 expect(errors).toEqual([])
})

test('Móvil: contacto completo y sin elementos que tapen la venta',async({page})=>{
 await page.setViewportSize({width:390,height:844})
 await page.goto('/')
 const coach=page.getByRole('dialog')
 await expect(coach).toBeVisible()
 await coach.getByRole('button',{name:'Salir de la visita guiada'}).click()
 await page.locator('.bayona-direct-contact__whatsapp').scrollIntoViewIfNeeded()
 await expect(page.locator('.bayona-direct-contact__whatsapp')).toBeVisible()
 await expect(page.locator('.bayona-cinema-track.is-visible')).toHaveCount(0)
 const viewport=await page.evaluate(()=>{
  const x=document.querySelector('.bayona-direct-contact__whatsapp').getBoundingClientRect()
  return {left:x.left,right:x.right,width:innerWidth,overflow:document.documentElement.scrollWidth-innerWidth}
 })
 expect(viewport.left).toBeGreaterThanOrEqual(0)
 expect(viewport.right).toBeLessThanOrEqual(viewport.width+1)
 expect(viewport.overflow).toBeLessThanOrEqual(1)
})

test('Recursos: descargas reales y conversación explícita',async({page,request})=>{
 await page.goto('/resources')
 await expect(page.locator('.bayona-direct-contact__download')).toHaveCount(3)
 const downloads=page.locator('.bayona-direct-contact__download')
 for(let i=0;i<3;i++){
  const href=await downloads.nth(i).getAttribute('href')
  expect(href).toMatch(/\.pdf$/)
  const response=await request.get(href)
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toContain('application/pdf')
 }
 await expect(page.locator('.bayona-direct-contact form')).toHaveCount(0)
 await expect(page.locator('.bayona-direct-contact__whatsapp')).toHaveAttribute('target','_blank')
})

test('Ofertas: precios verificables y canales de contacto',async({page})=>{
 await page.goto('/programs')
 const plans=page.locator('.services-memberships .bayona-plan-open__card')
 await expect(plans).toHaveCount(4)
 for(let i=0;i<4;i++){
  const a=plans.nth(i).locator('a.bayona-plan-open__contact')
  await expect(a).toHaveAttribute('href',/https:\/\/wa\.me\//)
  await expect(plans.nth(i).locator('.bayona-plan-open__price')).toContainText('COP')
 }
 await expect(page.locator('.services-catalog-details[open]')).toHaveCount(3)
})
