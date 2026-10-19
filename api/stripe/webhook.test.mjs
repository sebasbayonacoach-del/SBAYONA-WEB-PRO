import test from 'node:test'
import assert from 'node:assert/strict'
import {createHmac} from 'node:crypto'
import webhook,{verifyStripeSignature} from './webhook.js'
const previous={...process.env}
const secret='whsec_test-signing-secret-for-qa'
function configure(){Object.assign(process.env,{
 STRIPE_SECRET_KEY:'sk_test_dummy',
 BAYONA_STRIPE_SANDBOX_ENABLED:'true',
 BAYONA_STRIPE_RETURN_ORIGIN:'https://staging.bayona.example',
 STRIPE_WEBHOOK_SECRET:secret,
})}
const event={id:'evt_test123456',livemode:false,type:'checkout.session.completed',
 data:{object:{id:'cs_test_abcdef1234567890',payment_status:'paid'}}}
function signed(body,time=Math.floor(Date.now()/1000)){
 const v1=createHmac('sha256',secret).update(time+'.'+body).digest('hex')
 return 't='+time+',v1='+v1
}
async function send({evt=event,signature,raw,method='POST'}={}){
 const text=raw??JSON.stringify(evt)
 const request=new Request('https://staging.bayona.example/api/stripe/webhook',{
  method,headers:{'Stripe-Signature':signature??signed(text),'Content-Type':'application/json'},
  body:method==='POST'?text:undefined,
 })
 const response=await webhook.fetch(request)
 return {status:response.status,body:await response.json()}
}
test.after(()=>{process.env=previous})
test('webhook disabled by default, no event processing',async()=>{
 configure();process.env.BAYONA_STRIPE_SANDBOX_ENABLED='false'
 assert.equal((await send()).status,503)
 configure();process.env.STRIPE_SECRET_KEY='sk_live_notallowed'
 assert.equal((await send()).status,503)
})
test('HMAC verification rejects tampering and old timestamps',async()=>{
 configure()
 const original=JSON.stringify(event)
 assert.equal(verifyStripeSignature(original,signed(original),secret),true)
 assert.equal(verifyStripeSignature(original+' ',signed(original),secret),false)
 assert.equal(verifyStripeSignature(original,signed(original,Math.floor(Date.now()/1000)-1000),secret),false)
 assert.equal((await send({raw:original+' ',signature:signed(original)})).status,400)
 assert.equal((await send({raw:original,signature:signed(original,Math.floor(Date.now()/1000)-1000)})).status,400)
})
test('valid signed completed-payment event is not acknowledged without durable idempotency',async()=>{
 configure()
 const r=await send()
 assert.equal(r.status,503)
 assert.equal(r.body.error,'DURABLE_EVENT_STORAGE_REQUIRED')
 assert.equal(r.body.accessActivated,false)
})
test('irrelevant events can be acknowledged but never create sales',async()=>{
 configure()
 const r=await send({evt:{...event,type:'customer.created'}})
 assert.equal(r.status,200)
 assert.deepEqual(r.body,{received:true,livemode:false,accessActivated:false})
})
test('live-looking events are rejected even if signed with valid test webhook secret',async()=>{
 configure()
 const r=await send({evt:{...event,livemode:true}})
 assert.equal(r.status,400)
 assert.equal(r.body.error,'NOT_A_SANDBOX_EVENT')
})
