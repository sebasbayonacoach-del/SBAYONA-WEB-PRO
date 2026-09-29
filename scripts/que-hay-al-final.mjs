import { chromium } from '@playwright/test'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
function fb(){const c=join(process.env.LOCALAPPDATA||'','ms-playwright');for(const b of readdirSync(c).filter(d=>d.startsWith('chromium-')).sort().reverse()){const e=join(c,b,'chrome-win64','chrome.exe');if(existsSync(e))return e}return null}
const BASE=process.argv[2]||'http://localhost:4173'
const br=await chromium.launch({executablePath:fb(),headless:true})
const pg=await br.newPage({viewport:{width:1280,height:900}})
await pg.goto(BASE+'/',{waitUntil:'domcontentloaded'}); await pg.waitForTimeout(2600)
await pg.getByText('QUIERO MI PRIMERA RUTINA',{exact:false}).first().click({timeout:4000}).catch(e=>console.log('click fallo',e.message.slice(0,60)))
await pg.waitForTimeout(1800)
const r=await pg.evaluate(()=>{
  const y=scrollY+innerHeight*0.35
  const secs=[...document.querySelectorAll('section,div')].filter(s=>{const b=s.getBoundingClientRect();return b.height>200}).map(s=>({top:s.getBoundingClientRect().top+scrollY,t:(s.querySelector('h1,h2,h3')||{}).textContent||'',wa:[...s.querySelectorAll('a[href*="wa.me"],button')].length}))
  const cerca=secs.filter(s=>s.top<=y).sort((a,b)=>b.top-a.top)[0]
  return {y:Math.round(y),seccion:cerca?{top:Math.round(cerca.top),titulo:cerca.t.slice(0,70),elementosClic:cerca.wa}:null,
          visible:document.body.innerText.split('\n').filter(l=>l.trim()).slice(0,0),
          viewportText:(()=>{const els=[...document.querySelectorAll('h1,h2,h3')].filter(h=>{const b=h.getBoundingClientRect();return b.top>0&&b.bottom<innerHeight});return els.map(h=>h.textContent.trim().slice(0,60))})()}
})
console.log(JSON.stringify(r,null,1))
await br.close()
