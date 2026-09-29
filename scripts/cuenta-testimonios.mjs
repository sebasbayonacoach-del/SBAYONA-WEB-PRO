import { chromium } from '@playwright/test'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
function fb(){const c=join(process.env.LOCALAPPDATA||'','ms-playwright');for(const b of readdirSync(c).filter(d=>d.startsWith('chromium-')).sort().reverse()){const e=join(c,b,'chrome-win64','chrome.exe');if(existsSync(e))return e}return null}
const RUTAS=['/','/about','/programs','/community','/parkour-academy','/faq','/shop','/plan/raiz']
const br=await chromium.launch({executablePath:fb(),headless:true})
for(const ruta of RUTAS){
  const pg=await br.newPage({viewport:{width:1280,height:900}})
  await pg.goto('http://localhost:4173'+ruta,{waitUntil:'domcontentloaded'}); await pg.waitForTimeout(2400)
  const d=await pg.evaluate(()=>{
    const t=document.body.innerText
    const ciudades=[...new Set([...t.matchAll(/(BOGOT[AÁ]A|GANDI[AÁ]A|VALENCIA|MADRID|BARCELONA|MEDELL[IÍ]N|BARRANQUILLA|CALI)[, ]*(COLOMBIA)?/gi)].map(m=>m[0].toUpperCase()))]
    const perfiles=[...new Set([...t.matchAll(/\b\d{2} A[NÑ]OS/gi)].map(m=>m[0].toUpperCase()))]
    const imgs=[...document.querySelectorAll('img[src*="testimonio"],img[src*="testimonial"]')].map(i=>i.getAttribute('src'))
    return {nImg:imgs.length, imgs:imgs.slice(0,4), ciudades, perfiles, diceTestimonio:/testimonio|lo que dicen|historias reales|experiencias/i.test(t)}
  })
  console.log(`${ruta.padEnd(20)} imgs testimonio:${String(d.nImg).padStart(2)} | ciudades:${d.ciudades.join(', ')||'-'} | perfiles edad:${d.perfiles.length} | bloque testimonios:${d.diceTestimonio?'si':'no'}`)
  if(d.imgs.length) console.log('      ',d.imgs.join(' , '))
  await pg.close()
}
await br.close()
