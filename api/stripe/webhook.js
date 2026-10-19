/**
 * BAYONA · Stripe webhook signature verification, test environment only.
 * Fail closed until durable, idempotent storage is configured.
 * Vercel Web-standard handler preserves the exact raw request body.
 */
import {createHmac,timingSafeEqual} from 'node:crypto'
import {sandboxOrigin} from './create-checkout.js'

const trackedTypes=new Set([
 'checkout.session.completed','checkout.session.async_payment_succeeded',
 'checkout.session.async_payment_failed','invoice.paid',
 'invoice.payment_failed','customer.subscription.deleted',
])
const respond=(status,body)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}})
export function verifyStripeSignature(raw,header,secret,now=Math.floor(Date.now()/1000)){
 if(typeof raw!=='string'||typeof header!=='string'||
   typeof secret!=='string'||!secret.startsWith('whsec_'))return false
 const tokens=header.split(',').map(x=>x.trim())
 const ts=tokens.find(x=>/^t=\d{9,12}$/.test(x))
 const signatures=tokens.filter(x=>/^v1=[a-f0-9]{64}$/i.test(x))
 if(!ts||signatures.length===0)return false
 const timestamp=Number(ts.slice(2))
 if(!Number.isSafeInteger(timestamp)||Math.abs(now-timestamp)>300)return false
 const expected=createHmac('sha256',secret).update(timestamp+'.'+raw).digest()
 return signatures.some(sig=>{
  const supplied=Buffer.from(sig.slice(3),'hex')
  return supplied.length===expected.length&&timingSafeEqual(supplied,expected)
 })
}
export default {
 async fetch(request){
  if(request.method!=='POST')return respond(405,{error:'METHOD_NOT_ALLOWED'})
  if(!sandboxOrigin(process.env)||
    !String(process.env.STRIPE_WEBHOOK_SECRET||'').startsWith('whsec_'))
    return respond(503,{error:'WEBHOOK_NOT_CONFIGURED'})
  let raw
  try{raw=await request.text()}catch{return respond(400,{error:'INVALID_PAYLOAD'})}
  if(raw.length>262144)return respond(413,{error:'PAYLOAD_TOO_LARGE'})
  if(!verifyStripeSignature(raw,request.headers.get('stripe-signature'),
    process.env.STRIPE_WEBHOOK_SECRET))return respond(400,{error:'INVALID_SIGNATURE'})
  let event
  try{event=JSON.parse(raw)}catch{return respond(400,{error:'INVALID_PAYLOAD'})}
  if(!/^evt_[a-zA-Z0-9]+$/.test(event?.id||'')||
    event?.livemode!==false||typeof event?.type!=='string'||
    !event?.data?.object)return respond(400,{error:'NOT_A_SANDBOX_EVENT'})
  // No persistence exists yet. Stripe must retry meaningful payment events.
  // NEVER acknowledge completed transactions as fulfilled or grant access.
  if(trackedTypes.has(event.type)){
   return respond(503,{error:'DURABLE_EVENT_STORAGE_REQUIRED',accessActivated:false})
  }
  return respond(200,{received:true,livemode:false,accessActivated:false})
 }
}
