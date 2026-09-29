import { chromium } from '@playwright/test'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
function fb(){const c=join(process.env.LOCALAPPDATA||'','ms-playwright');for(const b of readdirSync(c).filter(d=>d.startsWith('chromium-')).sort().reverse()){const e=join(c,b,'chrome-win64','chrome.exe');if(existsSync(e))return e}return null}
const br=await chromium.launch({executablePath:fb(),headless:true})
for(const r of ['/programs','/plan/raiz','/']){
  const pg=await br.newPage({viewport:{width:1280,height:900}})
  await pg.goto('http://localhost:4173'+r,{waitUntil:'domcontentloaded'}); await pg.waitForTimeout(2400)
  const d=await pg.evaluate(()=>{const t=document.body.innerText;return {
    badge:/GARANT[IÍ]A PUBLICADA/i.test(t),
    promesa:/te devolvemos el importe/i.test(t),
    sinPreguntas:/sin preguntas y sin trabas/i.test(t),
    trozos:[...t.matchAll(/[^.\n]{0,60}(?:GARANT[IÍ]A|devolvemos)[^.\n]{0,80}/gi)].map(m=>m[0].replace(/\s+/g,' ').trim()).slice(0,4)}})
  console.log(r,'->',JSON.stringify({badge:d.badge,promesa:d.promesa,sinPreguntas:d.sinPreguntas}))
  d.trozos.forEach(x=>console.log('      ·',x))
  await pg.close()
}
await br.close()
