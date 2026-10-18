import {test,expect} from '@playwright/test'

test('La misión sigue el capítulo sin botones ni clics y anuncia el cambio de escena',async({page})=>{
 await page.goto('/programs')
 const hud=page.getByTestId('bayona-mission-hud')
 await expect(hud).toContainText('MISIÓN EN CURSO')
 await expect(hud).toContainText('DESCUBRE TU PLAN')
 const sections=page.locator('.bayona-cinema-chapter')
 await expect.poll(()=>sections.count(),{timeout:12000}).toBeGreaterThanOrEqual(3)
 const total=await sections.count()
 await expect(hud).toContainText('01 / '+String(total).padStart(2,'0'))
 await sections.nth(1).scrollIntoViewIfNeeded()
 await expect(hud).toContainText('02 / '+String(total).padStart(2,'0'))
 const notification=page.getByTestId('bayona-mission-toast')
 await expect(notification).toContainText('NUEVO CAPÍTULO')
 await expect(notification).toHaveAttribute('aria-hidden','true')
 await expect(notification).toHaveCount(0,{timeout:5000})
 await expect(page.locator('.bayona-mission-hud button')).toHaveCount(0)
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1)
})

test('Móvil: HUD compacto y no bloquea el contenido ni el contacto',async({page})=>{
 await page.setViewportSize({width:390,height:844})
 await page.goto('/programs')
 const hud=page.getByTestId('bayona-mission-hud')
 await page.locator('.bayona-cinema-chapter').nth(1).scrollIntoViewIfNeeded()
 await expect(hud).toBeVisible()
 const design=await hud.evaluate(element=>({height:element.getBoundingClientRect().height,
  width:element.getBoundingClientRect().width,pointerEvents:getComputedStyle(element).pointerEvents}))
 expect(design.height).toBeLessThan(108)
 expect(design.width).toBeLessThan(196)
 expect(design.pointerEvents).toBe('none')
 const card=page.locator('.services-path-card').first()
 await expect(card).toHaveAttribute('href',/\S+/)
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1)
})

test('Recepción de Sebastián continúa automática y la misión nunca se superpone',async({page})=>{
 await page.goto('/')
 const guide=page.getByRole('dialog')
 await expect(guide.getByRole('heading',{name:'¿Cómo te llamas?'})).toBeVisible()
 await expect(page.getByTestId('bayona-mission-hud')).not.toBeVisible()
 await expect(page.getByTestId('bayona-mission-toast')).toHaveCount(0)
 await guide.getByRole('button',{name:'Salir de la visita guiada'}).click()
 await page.locator('.bayona-cinema-chapter').nth(1).scrollIntoViewIfNeeded()
 await expect(page.getByTestId('bayona-mission-hud')).toBeVisible()
})

test('Checkout privado y de pago no incorpora la narración gamificada',async({page})=>{
 await page.goto('/checkout')
 await expect(page.getByTestId('bayona-mission-hud')).toHaveCount(0)
 await expect(page.getByTestId('bayona-mission-toast')).toHaveCount(0)
})

test('La presentación clara de Servicios mantiene un contraste de lectura suficiente',async({page})=>{
 await page.goto('/programs')
 const section=page.locator('section.services-overview.bayona-cinema-chapter--light')
 await expect(section).toBeAttached()
 const colors=await section.locator('.services-paths-heading > p').last().evaluate(node=>({text:getComputedStyle(node).color,surface:getComputedStyle(node.closest('.services-overview')).backgroundColor}))
 expect(colors.text).toBe('rgb(72, 60, 50)')
 expect(colors.surface).toBe('rgb(241, 236, 227)')
})
