// BAYONA · sandbox-only Vercel function. Never activates paid access.
const PRICES=Object.freeze({
 RAIZ:{monthly:'price_1US60NDe5lykCn8xydfpiiL5',once:'price_1US60iDe5lykCn8xEXQBsvj0'},
 FUERZA:{monthly:'price_1US60kDe5lykCn8x0hNgvYOa',once:'price_1US60nDe5lykCn8xJhWTTjUF'},
 RENDIMIENTO:{monthly:'price_1US60pDe5lykCn8x6KPYZaAt',once:'price_1US60rDe5lykCn8xJqsWKus1'},
 ELITE:{monthly:'price_1US60sDe5lykCn8x7QNAG3G8',once:'price_1US60uDe5lykCn8xgZUE3kYP'},
})
const json=(res,status,data)=>{
 res.statusCode=status
 res.setHeader('Content-Type','application/json; charset=utf-8')
 res.setHeader('Cache-Control','no-store')
 return res.end(JSON.stringify(data))
}
export function sandboxOrigin(env){
 if(env.BAYONA_STRIPE_SANDBOX_ENABLED!=='true'||!String(env.STRIPE_SECRET_KEY||'').startsWith('sk_test_'))return null
 try{
  const url=new URL(env.BAYONA_STRIPE_RETURN_ORIGIN)
  const local=url.hostname==='localhost'||url.hostname==='127.0.0.1'
  if(url.username||url.password||url.search||url.hash||url.pathname!=='/'||
    (url.protocol!=='https:'&&!(local&&url.protocol==='http:')))return null
  return url.origin
 }catch{return null}
}
async function readBody(req){
 if(req.body!=null){
  if(typeof req.body==='string')return JSON.parse(req.body)
  if(Buffer.isBuffer(req.body))return JSON.parse(req.body.toString('utf8'))
  return req.body
 }
 let raw=''
 for await(const part of req){raw+=part.toString();if(raw.length>4096)throw Error('too long')}
 return JSON.parse(raw)
}
export default async function handler(req,res){
 if(req.method!=='POST'){res.setHeader('Allow','POST');return json(res,405,{error:'METHOD_NOT_ALLOWED'})}
 const origin=sandboxOrigin(process.env)
 if(!origin)return json(res,503,{error:'SANDBOX_NOT_CONFIGURED'})
 if(req.headers?.origin!==origin||!/^application\/json\b/i.test(req.headers?.['content-type']||''))return json(res,403,{error:'REQUEST_NOT_ALLOWED'})
 let body;try{body=await readBody(req)}catch{return json(res,400,{error:'INVALID_REQUEST'})}
 if(!body||typeof body!=='object'||Array.isArray(body)||
   Object.keys(body).some(k=>!['planId','billingMode'].includes(k)))return json(res,400,{error:'INVALID_REQUEST'})
 const {planId,billingMode}=body
 if(typeof planId!=='string'||typeof billingMode!=='string'||
   !Object.hasOwn(PRICES,planId)||!['monthly','once'].includes(billingMode))return json(res,400,{error:'UNKNOWN_PLAN_OR_MODE'})
 const priceId=PRICES[planId][billingMode]
 const params=new URLSearchParams({
  mode:billingMode==='monthly'?'subscription':'payment',
  'line_items[0][price]':priceId,'line_items[0][quantity]':'1',
  success_url:origin+'/checkout?stripe_test_return=1&session_id={CHECKOUT_SESSION_ID}',
  cancel_url:origin+'/checkout?plan='+encodeURIComponent(planId)+'&stripe_test_cancelled=1',
  'metadata[bayona_plan]':planId,'metadata[billing_mode]':billingMode,'metadata[environment]':'test',
 })
 try{
  const response=await fetch('https://api.stripe.com/v1/checkout/sessions',{
   method:'POST',
   headers:{Authorization:'Bearer '+process.env.STRIPE_SECRET_KEY,
     'Content-Type':'application/x-www-form-urlencoded'},
   body:params,signal:AbortSignal.timeout(12000),
  })
  if(!response.ok)return json(res,502,{error:'STRIPE_SANDBOX_UNAVAILABLE'})
  const session=await response.json()
  let url;try{url=new URL(session.url)}catch{return json(res,502,{error:'INVALID_STRIPE_RESPONSE'})}
  if(session.livemode!==false||url.protocol!=='https:'||url.hostname!=='checkout.stripe.com')
   return json(res,502,{error:'INVALID_STRIPE_RESPONSE'})
  return json(res,200,{url:url.toString(),mode:billingMode,livemode:false})
 }catch{return json(res,502,{error:'STRIPE_SANDBOX_UNAVAILABLE'})}
}
