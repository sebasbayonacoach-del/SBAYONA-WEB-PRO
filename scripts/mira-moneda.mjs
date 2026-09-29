import { chromium } from '@playwright/test'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
function fb(){const c=join(process.env.LOCALAPPDATA||'','ms-playwright');for(const b of readdirSync(c).filter(d=>d.startsWith('chromium-')).sort().reverse()){const e=join(c,b,'chrome-win64','chrome.exe');if(existsSync(e))return e}return null}
const br=await chromium.launch({executablePath:fb(),headless:true})
for(const ruta of ['/plan/elite','/shop','/']){
  const pg=await br.newPage({viewport:{width:1280,height:900}})
  await pg.goto('http://localhost:4173'+ruta,{waitUntil:'domcontentloaded'}); await pg.waitForTimeout(2400)
  const d=await pg.evaluate(()=>{
    const t=document.body.innerText
    const idxs=[...t.matchAll(/€\s?\d[\d.,]*/g)].map(m=>m.index)
    const euros=idxs.slice(0,3).map(i=>t.slice(Math.max(0,i-90),i+18).replace(/\s+/g,' '))
    const gandia=[...t.matchAll(/.{0,60}gand[ií]a.{0,60}/gi)].map(m=>m[0].replace(/\s+/g,' '))
    const valencia=/valencia|safor|comunitat|castell[oó]n/i.test(t)
    return {euros:euros.slice(0,3),gandia:gandia.slice(0,3),nGandia:gandia.length,valencia}
  })
  console.log('\n###',ruta)
  console.log('  contexto de los €:'); d.euros.forEach(e=>console.log('    ...'+e))
  console.log('  menciones de Gandia:',d.nGandia); d.gandia.forEach(g=>console.log('    ...'+g))
  console.log('  menciona Valencia/Safor/comunitat/castellano:',d.valencia)
  await pg.close()
}
await br.close()
