/**
 * Read-only Stripe TEST checkout verification.
 * Never trusts redirect query arguments as evidence that a payment happened.
 * Does not create or fulfill membership or sales. No PII is returned.
 */
import {PRICES,sandboxOrigin} from './create-checkout.js'

const reply=(res,status,data)=>{
  res.statusCode=status
  res.setHeader('Content-Type','application/json; charset=utf-8')
  res.setHeader('Cache-Control','private, no-store')
  res.setHeader('X-Content-Type-Options','nosniff')
  return res.end(JSON.stringify(data))
}
const testSessionId=id=>typeof id==='string' && /^cs_test_[A-Za-z0-9]{10,170}$/.test(id)
const validPlanAndMode=(plan,mode)=>typeof plan==='string'&&Object.hasOwn(PRICES,plan)&&['monthly','once'].includes(mode)
async function stripeGet(path,key){
 const response=await fetch('https://api.stripe.com/v1/'+path,{
   headers:{Authorization:'Bearer '+key},signal:AbortSignal.timeout(12000)
 })
 if(!response.ok)throw Error('stripe_unavailable')
 return response.json()
}
export default async function handler(req,res){
 if(req.method!=='GET'){
  res.setHeader('Allow','GET')
  return reply(res,405,{error:'METHOD_NOT_ALLOWED'})
 }
 if(!sandboxOrigin(process.env))return reply(res,503,{error:'SANDBOX_NOT_CONFIGURED'})
 const params=new URL(req.url||'/',process.env.BAYONA_STRIPE_RETURN_ORIGIN).searchParams
 const ids=params.getAll('session_id')
 if(ids.length!==1||!testSessionId(ids[0]))return reply(res,400,{error:'INVALID_SESSION_ID'})
 const id=ids[0]
 let session,lineItems
 try{
  session=await stripeGet('checkout/sessions/'+encodeURIComponent(id),process.env.STRIPE_SECRET_KEY)
  lineItems=await stripeGet('checkout/sessions/'+encodeURIComponent(id)+'/line_items?limit=2',process.env.STRIPE_SECRET_KEY)
 }catch{return reply(res,502,{error:'STRIPE_SANDBOX_UNAVAILABLE'})}
 const plan=session.metadata?.bayona_plan
 const mode=session.metadata?.billing_mode
 const match=validPlanAndMode(plan,mode)
 const item=lineItems?.data?.[0]
 const expected=match?PRICES[plan][mode]:null
 const amounts={RAIZ:14900000,FUERZA:29900000,RENDIMIENTO:49900000,ELITE:89900000}
 const expectedAmount=match?amounts[plan]:null
 if(session.id!==id||session.livemode!==false||session.metadata?.environment!=='test'||
   !match||session.mode!==(mode==='monthly'?'subscription':'payment')||
   session.currency!=='cop'||lineItems?.has_more!==false||lineItems?.data?.length!==1||
   item?.price?.id!==expected||item?.quantity!==1||
   session.amount_total!==expectedAmount||item?.amount_total!==expectedAmount){
  return reply(res,422,{error:'NOT_BAYONA_SANDBOX_SESSION'})
 }
 const verified=session.status==='complete'&&session.payment_status==='paid'
 const status=verified?'paid_test':session.status==='expired'?'expired_test':'pending_test'
 return reply(res,200,{
  status,livemode:false,planId:plan,billingMode:mode,
  currency:'COP',paymentVerifiedInSandbox:verified,
  accessActivated:false,fulfillment:'disabled',
 })
}
