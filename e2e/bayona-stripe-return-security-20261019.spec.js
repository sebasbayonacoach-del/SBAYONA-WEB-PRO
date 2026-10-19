import {test,expect} from '@playwright/test'

const path='/checkout?plan=FUERZA&stripe_test_return=1&session_id=cs_test_abcdefghijklmnop123456'
const fixture={status:'paid_test',livemode:false,planId:'FUERZA',billingMode:'once',
 currency:'COP',paymentVerifiedInSandbox:true,accessActivated:false,fulfillment:'disabled'}

test('A real backend-verified sandbox payment may be labeled TEST, never a real sale',async({page})=>{
 await page.route('**/api/stripe/session-status?*',route=>route.fulfill({
  status:200,headers:{'content-type':'application/json'},
  body:JSON.stringify(fixture),
 }))
 await page.goto(path)
 const status=page.getByTestId('stripe-return-status')
 await expect(status).toContainText('pago de PRUEBA')
 await expect(status).toContainText('No se ha cobrado dinero real')
 await expect(status).toContainText('ni activado una membresía')
 await expect(page.getByTestId('stripe-sandbox-preview')).toBeVisible()
})
test('An unpaid test checkout never displays payment confirmation',async({page})=>{
 await page.route('**/api/stripe/session-status?*',route=>route.fulfill({
  status:200,headers:{'content-type':'application/json'},
  body:JSON.stringify({...fixture,status:'pending_test',paymentVerifiedInSandbox:false}),
 }))
 await page.goto(path)
 await expect(page.getByTestId('stripe-return-status')).toContainText('sigue pendiente')
 await expect(page.getByTestId('stripe-return-status')).not.toContainText('ha confirmado un pago')
})
test('A disconnected sandbox API cannot generate a false success message',async({page})=>{
 await page.route('**/api/stripe/session-status?*',route=>route.fulfill({
  status:503,headers:{'content-type':'application/json'},
  body:JSON.stringify({error:'SANDBOX_NOT_CONFIGURED'}),
 }))
 await page.goto(path)
 await expect(page.getByTestId('stripe-return-status')).toContainText('no se pudo verificar ningún pago')
 await expect(page.getByTestId('stripe-return-status')).toContainText('No se ha activado una membresía')
})
