import {test,expect} from '@playwright/test'

test('Solicitud desde FUERZA conserva precio, no exige datos y se abre con un enlace seguro',async({page})=>{
 await page.goto('/checkout?plan=FUERZA')
 const card=page.locator('.order-summary')
 await expect(card).toContainText('BAYONA FUERZA')
 await expect(card).toContainText('$299.000 COP')
 const name=page.getByRole('textbox',{name:/nombre/i})
 await expect(name).not.toHaveAttribute('required')
 await expect(page.getByRole('textbox',{name:/^email$/i})).toHaveCount(0)
 await expect(page.getByRole('textbox',{name:/^whatsapp$/i})).toHaveCount(0)
 const link=page.getByRole('link',{name:'Abrir solicitud en WhatsApp'})
 await expect(link).toHaveAttribute('target','_blank')
 await expect(link).toHaveAttribute('rel','noopener noreferrer')
 let url=new URL(await link.getAttribute('href'))
 expect(url.host).toBe('wa.me')
 expect(url.searchParams.get('text')).toContain('Plan base: FUERZA — $299.000 COP')
 await name.fill('Ana')
 url=new URL(await link.getAttribute('href'))
 expect(url.searchParams.get('text')).toContain('Nombre: Ana')
 expect(url.searchParams.get('text')).not.toContain('Email:')
 expect(url.searchParams.get('text')).not.toContain('WhatsApp:')
 expect(await page.evaluate(()=>localStorage.getItem('bayona:pending-lead:v1'))).toBeNull()
})

test('El catálogo conserva los cuatro precios canónicos al seleccionarlos',async({page})=>{
 await page.goto('/checkout')
 const prices=[['RAÍZ','$149.000'],['FUERZA','$299.000'],['RENDIMIENTO','$499.000'],['ELITE','$899.000']]
 for(const [name,amount] of prices){
  await page.getByRole('radio',{name:new RegExp(name,'i')}).check()
  const href=await page.getByRole('link',{name:'Abrir solicitud en WhatsApp'}).getAttribute('href')
  const text=new URL(href).searchParams.get('text')
  expect(text).toContain(amount+' COP')
  await expect(page.locator('.summary-total-price')).toContainText(amount+' COP')
 }
})

test('En móvil el pago no es ficticio y la acción comercial queda accesible',async({page})=>{
 await page.setViewportSize({width:390,height:844})
 const errors=[];page.on('pageerror',e=>errors.push(e.message))
 await page.goto('/checkout')
 const action=page.getByRole('link',{name:'Abrir solicitud en WhatsApp'})
 await action.scrollIntoViewIfNeeded()
 await expect(action).toBeVisible()
 const rect=await action.boundingBox()
 expect(rect.x).toBeGreaterThanOrEqual(0)
 expect(rect.x+rect.width).toBeLessThanOrEqual(391)
 await expect(page.getByText(/Sin pago, inscripción ni reserva automática/i)).toBeVisible()
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1)
 expect(errors).toEqual([])
})
