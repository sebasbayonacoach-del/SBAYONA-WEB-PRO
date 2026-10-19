import test from 'node:test'
import assert from 'node:assert/strict'
import statusHandler from './session-status.js'

const envBackup={...process.env}
const fetchBackup=globalThis.fetch
const sessionId='cs_test_abcdefghijklmnopqrst1234567890'
const baseline={
 id:sessionId,livemode:false,metadata:{environment:'test',bayona_plan:'FUERZA',billing_mode:'once'},
 mode:'payment',status:'complete',payment_status:'paid',currency:'cop',amount_total:29900000,
}
const items={data:[{quantity:1,amount_total:29900000,price:{id:'price_1US60nDe5lykCn8xJhWTTjUF'}}],has_more:false}
function configure(){Object.assign(process.env,{
  STRIPE_SECRET_KEY:'sk_test_dummy',BAYONA_STRIPE_SANDBOX_ENABLED:'true',
  BAYONA_STRIPE_RETURN_ORIGIN:'https://staging.bayona.example',
})}
function mock(session=baseline,lineItems=items){
 globalThis.fetch=async url=>{
  const data=String(url).includes('/line_items?')?lineItems:session
  return {ok:true,json:async()=>data}
 }
}
async function call(url='/api/stripe/session-status?session_id='+sessionId,method='GET'){
 const state={statusCode:200,data:null,headers:{}}
 const res={
  setHeader(k,v){state.headers[k]=v},
  set statusCode(value){state.statusCode=value},get statusCode(){return state.statusCode},
  end(text){state.data=JSON.parse(text)}
 }
 await statusHandler({method,url},res)
 return state
}
test.after(()=>{process.env=envBackup;globalThis.fetch=fetchBackup})
test('sandbox disabled and invalid identifiers never ask Stripe',async()=>{
 configure();process.env.BAYONA_STRIPE_SANDBOX_ENABLED='false'
 let x=await call();assert.equal(x.statusCode,503)
 configure();x=await call('/api/stripe/session-status?session_id=cs_live_fake');assert.equal(x.statusCode,400)
 x=await call('/api/stripe/session-status?session_id='+sessionId+'&session_id='+sessionId);assert.equal(x.statusCode,400)
 x=await call(undefined,'POST');assert.equal(x.statusCode,405)
})
test('returns paid_test ONLY when paid state is verified server-to-server',async()=>{
 configure();mock()
 const result=await call()
 assert.equal(result.statusCode,200)
 assert.deepEqual(result.data,{
  status:'paid_test',livemode:false,planId:'FUERZA',billingMode:'once',
  currency:'COP',paymentVerifiedInSandbox:true,accessActivated:false,fulfillment:'disabled'
 })
 assert.equal(result.headers['Cache-Control'],'private, no-store')
})
test('unpaid session is never confirmed as payment',async()=>{
 configure();mock({...baseline,payment_status:'unpaid',status:'open'})
 const result=await call()
 assert.equal(result.statusCode,200)
 assert.equal(result.data.status,'pending_test')
 assert.equal(result.data.paymentVerifiedInSandbox,false)
 assert.equal(result.data.accessActivated,false)
})
test('refuses live sessions, mismatched plans, wrong amount or prices',async()=>{
 configure()
 for(const modified of [
  {...baseline,livemode:true},
  {...baseline,metadata:{...baseline.metadata,environment:'production'}},
  {...baseline,amount_total:1},
  {...baseline,metadata:{...baseline.metadata,bayona_plan:'ELITE'}},
 ]){
  mock(modified)
  assert.equal((await call()).statusCode,422)
 }
 mock(baseline,{...items,data:[{quantity:1,amount_total:29900000,price:{id:'price_FAKE'}}]})
 assert.equal((await call()).statusCode,422)
 mock(baseline,{...items,has_more:true})
 assert.equal((await call()).statusCode,422)
})
test('Stripe network errors do not pretend payment succeeded',async()=>{
 configure()
 globalThis.fetch=async()=>({ok:false})
 const r=await call()
 assert.equal(r.statusCode,502)
 assert.equal(r.data.error,'STRIPE_SANDBOX_UNAVAILABLE')
})
