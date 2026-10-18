import {expect,test} from '@playwright/test'

test('checkout prepara un enlace seguro de WhatsApp sin cobrar ni enviar mensajes automáticamente',async({page})=>{
 await page.goto('/checkout',{waitUntil:'domcontentloaded'})
 await expect(page.getByText(/Sin pago, inscripción ni reserva automática/i)).toBeVisible()
 await page.locator('#checkout-name').fill('Cliente Prueba')
 await expect(page.locator('#checkout-email')).toHaveCount(0)
 await expect(page.locator('#checkout-whatsapp')).toHaveCount(0)
 const contact=page.getByRole('link',{name:'Abrir solicitud en WhatsApp'})
 await expect(contact).toHaveAttribute('target','_blank')
 await expect(contact).toHaveAttribute('rel','noopener noreferrer')
 const url=new URL(await contact.getAttribute('href'))
 expect(url.host).toBe('wa.me')
 expect(url.searchParams.get('text')).toContain('Cliente Prueba')
 expect(url.searchParams.get('text')).toContain('Plan base: RAÍZ')
 expect(url.searchParams.get('text')).toContain('no constituye pago, pedido, inscripción')
 expect(await page.evaluate(()=>localStorage.getItem('bayona:pending-lead:v1'))).toBeNull()
})
