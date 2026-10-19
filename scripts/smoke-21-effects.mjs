import {chromium} from '@playwright/test'
const b=await chromium.launch({headless:true,args:['--no-sandbox']})
const paths=['/','/about','/programs','/movimiento-adaptado','/parkour-academy','/community','/resources','/shop','/app','/checkout']
for(const path of paths){
 const page=await b.newPage({viewport:{width:1280,height:850}})
 const errors=[];page.on('pageerror',e=>errors.push(e.message))
 await page.goto('http://127.0.0.1:4187'+path,{waitUntil:'domcontentloaded'})
 await page.waitForTimeout(850)
 const a=await page.evaluate(()=>({
  effects:[...document.querySelectorAll('canvas[data-bayona-effect]')].map(c=>c.dataset.bayonaEffect),
  overflow:document.documentElement.scrollWidth-innerWidth,
  total:document.querySelectorAll('canvas[data-bayona-effect]').length,
 }))
 console.log('CHECK',path,JSON.stringify({...a,errors}))
 await page.close()
}
await b.close()
