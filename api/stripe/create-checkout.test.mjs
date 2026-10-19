import test from 'node:test'
import assert from 'node:assert/strict'
import handler,{sandboxOrigin} from './create-checkout.js'

const original={...process.env}
const originalFetch=globalThis.fetch
function env(overrides={}){
 Object.assign(process.env,{
  BAYONA_STRIPE_SANDBOX_ENABLED:'true',
  STRIPE_SECRET_KEY:'sk_test_mock_secret',
  BAYONA_STRIPE_RETURN_ORIGIN:'https://staging.bayona.example',
 },overrides)
}
function request(body={planId:'FUERZA',billingMode:'monthly'},opts={}){
 const state={statusCode:200,headers:{},body:null}
 const res={
  setHeader(name,value){state.headers[name.toLowerCase()]=value},
  end(data){state.body=JSON.parse(data)},
  get statusCode(){return state.statusCode},set statusCode(value){state.statusCode=value},
 }
 const req={method:opts.method||'POST',headers:{
  origin:opts.origin||'https://staging.bayona.example',
  'content-type':'application/json',
 },body}
 return {req,res,state}
}
async function run(body,opts){const x=request(body,opts);await handler(x.req,x.res);return x.state}
test.after(()=>{process.env={...original};globalThis.fetch=originalFetch})
test('feature switch and secret fail closed',async()=>{
 env({BAYONA_STRIPE_SANDBOX_ENABLED:'false'})
 assert.equal((await run({planId:'FUERZA',billingMode:'monthly'})).statusCode,503)
 env({BAYONA_STRIPE_SANDBOX_ENABLED:'true',STRIPE_SECRET_KEY:'sk_live_fake'})
 assert.equal((await run({planId:'FUERZA',billingMode:'monthly'})).statusCode,503)
 assert.equal(sandboxOrigin(process.env),null)
})
test('requires exact origin and whitelisted pricing',async()=>{
 env()
 assert.equal((await run({planId:'FUERZA',billingMode:'monthly'},{origin:'https://evil.example'})).statusCode,403)
 assert.equal((await run({planId:'FUERZA',billingMode:'monthly',unit_amount:1})).statusCode,400)
 assert.equal((await run({planId:'INVENTADO',billingMode:'monthly'})).statusCode,400)
 assert.equal((await run({planId:'FUERZA',billingMode:'annual'})).statusCode,400)
 assert.equal((await run({planId:'__proto__',billingMode:'monthly'})).statusCode,400)
 assert.equal((await run({planId:'FUERZA',billingMode:'monthly'},{method:'GET'})).statusCode,405)
})
test('monthly creates only the verified subscription price from server',async()=>{
 env()
 globalThis.fetch=async(url,opts)=>{
  assert.equal(url,'https://api.stripe.com/v1/checkout/sessions')
  const form=new URLSearchParams(opts.body)
  assert.equal(form.get('mode'),'subscription')
  assert.equal(form.get('line_items[0][price]'),'price_1US60kDe5lykCn8x0hNgvYOa')
  assert.equal(form.get('line_items[0][quantity]'),'1')
  assert.equal(form.get('metadata[environment]'),'test')
  assert.equal(form.get('success_url').includes('stripe_test_return=1'),true)
  return {ok:true,json:async()=>({livemode:false,url:'https://checkout.stripe.com/c/pay/cs_test_example'})}
 }
 const response=await run({planId:'FUERZA',billingMode:'monthly'})
 assert.equal(response.statusCode,200)
 assert.equal(response.body.livemode,false)
 assert.equal(response.body.mode,'monthly')
})
test('one-month payment uses distinct price without recurring billing',async()=>{
 env()
 globalThis.fetch=async(_,opts)=>{
  const form=new URLSearchParams(opts.body)
  assert.equal(form.get('mode'),'payment')
  assert.equal(form.get('line_items[0][price]'),'price_1US60nDe5lykCn8xJhWTTjUF')
  return {ok:true,json:async()=>({livemode:false,url:'https://checkout.stripe.com/c/pay/cs_test_once'})}
 }
 assert.equal((await run({planId:'FUERZA',billingMode:'once'})).statusCode,200)
})
test('rejects an untrusted checkout URL or any live response',async()=>{
 env()
 globalThis.fetch=async()=>({ok:true,json:async()=>({livemode:false,url:'https://malicious.example/pay'})})
 assert.equal((await run({planId:'RAIZ',billingMode:'once'})).statusCode,502)
 globalThis.fetch=async()=>({ok:true,json:async()=>({livemode:true,url:'https://checkout.stripe.com/c/pay/cs_live'})})
 assert.equal((await run({planId:'RAIZ',billingMode:'once'})).statusCode,502)
})
