import {chromium} from '@playwright/test'
const b=await chromium.launch({headless:true,args:['--no-sandbox']})
for(const [route,effect] of [['/','mesh-gradient'],['/community','aurora-flow'],['/shop','holo-foil'],['/app','liquid-glass']]){
 const p=await b.newPage({viewport:{width:1280,height:820}})
 await p.goto('http://127.0.0.1:4187'+route,{waitUntil:'domcontentloaded'})
 const canvas=p.locator('canvas[data-bayona-effect="'+effect+'"]')
 await canvas.waitFor({timeout:10000})
 await canvas.scrollIntoViewIfNeeded()
 await p.waitForTimeout(600)
 const info=await canvas.evaluate(c=>{
  const ctx=c.getContext('2d'),data=ctx.getImageData(0,0,c.width,c.height).data
  let hits=0,max=0;for(let i=3;i<data.length;i+=137*4){if(data[i]>4)hits++;max=Math.max(max,data[i])}
  return {w:c.width,h:c.height,nonemptySamples:hits,maxAlpha:max,visible:getComputedStyle(c).opacity,pointer:getComputedStyle(c).pointerEvents}
 })
 console.log('VISUAL',route,effect,JSON.stringify(info))
 await p.screenshot({path:'/tmp/bayona-effects-'+effect+'.png',animations:'disabled'})
 await p.close()
}
await b.close()
