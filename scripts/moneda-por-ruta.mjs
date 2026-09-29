import { chromium } from '@playwright/test'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
function fb(){const c=join(process.env.LOCALAPPDATA||'','ms-playwright');for(const b of readdirSync(c).filter(d=>d.startsWith('chromium-')).sort().reverse()){const e=join(c,b,'chrome-win64','chrome.exe');if(existsSync(e))return e}return null}
const BASE=process.argv[2]||'http://localhost:4173'
const RUTAS=(process.argv[3]||'/').split(',')
const br=await chromium.launch({executablePath:fb(),headless:true})
let copTotal=0, eurTotal=0
for(const ruta of RUTAS){
  const pg=await br.newPage({viewport:{width:1280,height:900}})
  await pg.goto(BASE+ruta,{waitUntil:'domcontentloaded'}); await pg.waitForTimeout(2400)
  const d=await pg.evaluate(()=>{
    const t=document.body.innerText
    const cop=[...t.matchAll(/\$\s?[\d.]{3,}\s?(COP)?/g)].map(m=>m[0].trim())
    const eur=[...t.matchAll(/€\s?\d[\d.,]*|\d[\d.,]*\s?€/g)].map(m=>m[0].trim())
    const mencionaCOP=/\bCOP\b/.test(t)
    const mencionaGandia=/gand[ií]a/i.test(t)
    return {cop,eur,mencionaCOP,mencionaGandia}
  })
  copTotal+=d.cop.length; eurTotal+=d.eur.length
  console.log(`${ruta.padEnd(20)} precios $: ${String(d.cop.length).padStart(2)} ${d.cop.slice(0,3).join(' , ')}   | precios €: ${String(d.eur.length).padStart(2)} ${d.eur.slice(0,3).join(' , ')}  | dice COP: ${d.mencionaCOP?'si':'no'} | menciona Gandia: ${d.mencionaGandia?'si':'no'}`)
  await pg.close()
}
console.log(`\nTOTAL en lo recorrido -> $: ${copTotal} · €: ${eurTotal}`)
await br.close()
