import { chromium } from '@playwright/test'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
function fb(){const c=join(process.env.LOCALAPPDATA||'','ms-playwright');for(const b of readdirSync(c).filter(d=>d.startsWith('chromium-')).sort().reverse()){const e=join(c,b,'chrome-win64','chrome.exe');if(existsSync(e))return e}return null}
const br=await chromium.launch({executablePath:fb(),headless:true})
const pg=await br.newPage({viewport:{width:1280,height:900}})
await pg.goto('http://localhost:4173/',{waitUntil:'domcontentloaded'}); await pg.waitForTimeout(2600)
const d=await pg.evaluate(()=>{const t=document.body.innerText;return [...t.matchAll(/.{0,70}(valencia|safor|comunitat|castellano|espana|españa|madrid|barcelona|colombia|bogot)[^\s]{0,20}/gi)].map(m=>m[0].replace(/\s+/g,' ')).slice(0,10)})
d.forEach(x=>console.log('  ...'+x))
await br.close()
