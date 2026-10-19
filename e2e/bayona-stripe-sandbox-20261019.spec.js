import { test,expect } from '@playwright/test'
const sandbox=(page)=>page.getByTestId('stripe-sandbox-preview')

test('Stripe sandbox: ofrece suscripción mensual por defecto y compra de un mes',async({page})=>{
 await page.goto('/checkout?plan=FUERZA')
 const preview=sandbox(page)
 await expect(preview).toBeVisible()
 await expect(preview).toContainText('PRUEBAS · NO COBROS REALES')
 await expect(preview).toContainText('$299.000 COP')
 const open=preview.getByRole('link',{name:/Abrir Stripe de prueba/})
 await expect(open).toHaveAttribute('href','https://buy.stripe.com/test_28EcN5aFL9k24J531dgQE02')
 await preview.getByRole('radio',{name:/UN MES/}).check()
 await expect(open).toHaveAttribute('href','https://buy.stripe.com/test_7sYeVd8xDcwe3F145hgQE03')
 await preview.getByRole('radio',{name:/MES A MES/}).check()
 await expect(open).toHaveAttribute('href','https://buy.stripe.com/test_28EcN5aFL9k24J531dgQE02')
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1)
})

test('Precio y enlace de sandbox cambian con el plan, pero no reciben nombres privados',async({page})=>{
 await page.goto('/checkout?plan=RAIZ')
 const preview=sandbox(page)
 await expect(preview.getByRole('link',{name:/Abrir Stripe de prueba/})).toHaveAttribute('href','https://buy.stripe.com/test_14A3cv9BHeEmcbx8lxgQE00')
 await page.getByRole('radio',{name:/ELITE/i}).check()
 await expect(preview).toContainText('$899.000 COP')
 const link=preview.getByRole('link',{name:/Abrir Stripe de prueba/})
 await expect(link).toHaveAttribute('href','https://buy.stripe.com/test_aFafZhbJPfIq1wT31dgQE06')
 await page.getByRole('textbox',{name:/nombre/i}).fill('Persona Privada')
 expect(await link.getAttribute('href')).not.toContain('Privada')
})

test('Bloqueo: con extras en el presupuesto no se permite pagar menos en Stripe',async({page})=>{
 await page.goto('/checkout?plan=FUERZA')
 const preview=sandbox(page)
 await expect(preview.getByRole('link',{name:/Abrir Stripe de prueba/})).toBeVisible()
 await page.getByRole('checkbox',{name:/masaje deportivo/i}).check()
 await expect(preview.getByRole('link',{name:/Abrir Stripe de prueba/})).toHaveCount(0)
 await expect(preview).toContainText('Esta prueba cubre solo la membresía')
 await page.getByRole('checkbox',{name:/masaje deportivo/i}).uncheck()
 await expect(preview.getByRole('link',{name:/Abrir Stripe de prueba/})).toBeVisible()
})

test('Móvil: pago de prueba legible, sin scroll horizontal',async({page})=>{
 await page.setViewportSize({width:390,height:844})
 await page.goto('/checkout?plan=FUERZA')
 const preview=sandbox(page)
 await preview.scrollIntoViewIfNeeded()
 await expect(preview).toBeVisible()
 const dimensions=await preview.evaluate(el=>{
  const r=el.getBoundingClientRect()
  return {left:r.left,right:r.right,screen:innerWidth,overflow:document.documentElement.scrollWidth-innerWidth}
 })
 expect(dimensions.left).toBeGreaterThanOrEqual(0)
 expect(dimensions.right).toBeLessThanOrEqual(dimensions.screen+1)
 expect(dimensions.overflow).toBeLessThanOrEqual(1)
})
