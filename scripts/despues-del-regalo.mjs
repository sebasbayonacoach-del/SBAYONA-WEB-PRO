import { chromium } from '@playwright/test'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
function fb(){const c=join(process.env.LOCALAPPDATA||'','ms-playwright');for(const b of readdirSync(c).filter(d=>d.startsWith('chromium-')).sort().reverse()){const e=join(c,b,'chrome-win64','chrome.exe');if(existsSync(e))return e}return null}
const BASE=process.argv[2]||'http://localhost:4173'
const br=await chromium.launch({executablePath:fb(),headless:true})
const pg=await br.newPage({viewport:{width:1280,height:900}})
await pg.addInitScript(()=>{window.__opened=[];window.open=(u)=>{window.__opened.push(String(u));return null}})
await pg.goto(BASE+'/onboarding',{waitUntil:'domcontentloaded'}); await pg.waitForTimeout(2400)
await pg.getByText('EMPEZAR EL RECORRIDO',{exact:false}).first().click(); await pg.waitForTimeout(1200)
await pg.locator('input:visible').first().fill('Ana'); await pg.waitForTimeout(300)
await pg.getByText('SEGUIR',{exact:false}).first().click(); await pg.waitForTimeout(1200)
for(const t of ['VOY CON PRISA','ESPAÑA','QUE ESTO DURE','ARRANCO DE CERO','1 O 2 DÍAS','EL TIEMPO']){
  await pg.getByText(t,{exact:false}).first().click().catch(()=>console.log('no vi',t)); await pg.waitForTimeout(900)
  const seguir=pg.getByText('SEGUIR',{exact:false}).first(); if(await seguir.count()) await seguir.click().catch(()=>{})
  await pg.waitForTimeout(700)
}
const dump=async(etq)=>{const d=await pg.evaluate(()=>({url:location.pathname,tit:(document.querySelector('h1,h2,h3')||{}).textContent||'',enl:[...new Set([...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')).filter(h=>/wa\.me|tel:|mailto:|whatsapp/i.test(h||'')))],bot:[...new Set([...document.querySelectorAll('button,[role=button],a[href]')].map(b=>(b.textContent||'').trim()).filter(t=>t&&t.length<46))].slice(0,18),abiertos:window.__opened}));console.log('\n###',etq,'|',d.url,'|',d.tit.slice(0,50));console.log('  enlaces contacto:',JSON.stringify(d.enl));console.log('  botones:',JSON.stringify(d.bot));return d}
const g=await dump('pantalla del regalo')
await pg.getByText('VER MI RUTA',{exact:false}).first().click().catch(e=>console.log('VER MI RUTA no clico:',e.message.slice(0,50)))
await pg.waitForTimeout(2200)
const r=await dump('despues de VER MI RUTA')
await pg.screenshot({path:join('artifacts','latest','viewport','regalo-ruta-final.png')})
console.log('\nventanas abiertas por JS:',JSON.stringify(r.abiertos))
await br.close()
