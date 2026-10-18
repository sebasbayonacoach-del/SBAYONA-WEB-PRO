import { test, expect } from '@playwright/test'
import { COACH_VISIT_STEPS } from '../src/data/coachVisit.js'

const choices = [
 ['Ganar fuerza','/community'],
 ['No sé cómo organizarme','/about'],
 ['Voy a empezar','/resources'],
 ['3–4 días','/resources'],
 ['45–60 minutos','/programs'],
 ['Desde casa u online','/programs'],
 ['Un plan claro','/programs'],
 ['Revisión cada semana','/movimiento-adaptado'],
 ['Entiendo, sigamos','/programs'],
]
async function intro(page){
 await page.goto('/')
 const dialog=page.getByRole('dialog')
 await expect(dialog.getByRole('heading',{name:'¿Cómo te llamas?'})).toBeVisible()
 return dialog
}
async function choose(page,label,path){
 const dialog=page.getByRole('dialog')
 await dialog.getByRole('button',{name:label,exact:true}).click()
 await expect(page).toHaveURL(new RegExp(path.replaceAll('/','\\/')+'$'))
}
for(const [device,width,height] of [['desktop',1440,900],['mobile',390,844]]){
 test('Inicio automático y plan tras una respuesta por pantalla / '+device,async({page})=>{
  await page.setViewportSize({width,height})
  const dialog=await intro(page)
  await expect(dialog.getByRole('button',{name:'SIGUIENTE'})).toHaveCount(0)
  await dialog.getByLabel(/TU NOMBRE/).fill('Ana')
  await expect(dialog.getByRole('heading',{name:'¿Qué quieres conseguir?'})).toBeVisible({timeout:5000})
  for(const [label,path] of choices)await choose(page,label,path)
  await expect(page.getByTestId('coach-result')).toContainText('FUERZA')
  await expect(page.locator('.services-memberships .bayona-plan-open__card--suggested')).toContainText('FUERZA')
  await expect(page.getByTestId('coach-result')).toContainText('Ana')
  await expect(page.getByTestId('coach-result')).toContainText('Entrenamiento personal u online')
  const link=page.getByTestId('coach-result').getByRole('link',{name:/HABLAR CON SEBASTIÁN/i})
  await expect(link).toHaveAttribute('href',/wa.me/)
  await expect(link).toHaveAttribute('href',/Ana/)
  await expect(link).toHaveAttribute('href',/FUERZA/)
  await dialog.getByRole('button',{name:'EXPLORAR LA WEB'}).click()
  await expect(dialog).toHaveCount(0)
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1)
 })
}

test('Ni rueda, ni teclas ni el motor Lenis avanzan sin responder',async({page})=>{
 const dialog=await intro(page)
 await page.waitForTimeout(1000)
 const before=await page.evaluate(()=>scrollY)
 await page.mouse.move(200,300)
 for(let i=0;i<5;i++)await page.mouse.wheel(0,700)
 await page.keyboard.press('PageDown')
 await page.keyboard.press('ArrowDown')
 await page.waitForTimeout(450)
 expect(await page.evaluate(()=>scrollY)).toBe(before)
 await expect(dialog.getByRole('heading',{name:'¿Cómo te llamas?'})).toBeVisible()
 await expect(dialog.getByRole('button',{name:'SIGUIENTE'})).toHaveCount(0)
 await dialog.getByLabel(/TU NOMBRE/).fill('Luis')
 await expect(dialog.getByRole('heading',{name:'¿Qué quieres conseguir?'})).toBeVisible({timeout:5000})
 await page.mouse.wheel(0,600)
 await page.waitForTimeout(250)
 await expect(dialog.getByRole('heading',{name:'¿Qué quieres conseguir?'})).toBeVisible()
 expect(await page.evaluate(()=>scrollY)).toBe(before)
 await choose(page,'Ganar fuerza','/community')
 await expect(dialog.getByRole('heading',{name:'¿Qué te está frenando?'})).toBeVisible()
 expect(await page.evaluate(()=>scrollY)).toBe(before)
})

test('En móvil el gesto táctil no puede saltar la pregunta',async({page})=>{
 await page.setViewportSize({width:390,height:844})
 await page.goto('/')
 const dialog=page.getByRole('dialog')
 await expect(dialog.getByRole('heading',{name:'¿Cómo te llamas?'})).toBeVisible()
 await page.evaluate(()=>{
  const a=document.querySelector('.bayona-coach__content')
  const touch=(type,y)=>a.dispatchEvent(new TouchEvent(type,{bubbles:true,cancelable:true,touches:[new Touch({identifier:1,target:a,clientX:130,clientY:y})]}))
  touch('touchstart',700);touch('touchmove',160)
 })
 await page.waitForTimeout(450)
 expect(await page.evaluate(()=>scrollY)).toBe(0)
 await expect(dialog.getByRole('heading',{name:'¿Cómo te llamas?'})).toBeVisible()
})

test('Nombre opcional, salida real y visita limpia al recargar',async({page})=>{
 const dialog=await intro(page)
 await dialog.getByRole('button',{name:/Continuar sin nombre/i}).click()
 await expect(dialog.getByRole('heading',{name:'¿Qué quieres conseguir?'})).toBeVisible()
 await dialog.getByRole('button',{name:'VOLVER'}).click()
 await expect(dialog.getByRole('heading',{name:'¿Cómo te llamas?'})).toBeVisible()
 await page.keyboard.press('Escape')
 await expect(dialog).toHaveCount(0)
 await page.mouse.wheel(0,450)
 await page.waitForTimeout(300)
 expect(await page.evaluate(()=>scrollY)).toBeGreaterThan(0)
 await page.reload()
 await expect(page.getByRole('dialog').getByRole('heading',{name:'¿Cómo te llamas?'})).toBeVisible()
 await expect(page.getByLabel(/TU NOMBRE/)).toHaveValue('')
})

test('Voz sintética desactivada de forma predeterminada; salir mediante Atrás',async({page})=>{
 const dialog=await intro(page)
 const voice=dialog.getByRole('button',{name:/Activar voz sintética/i})
 if(await voice.count())await expect(voice).toHaveAttribute('aria-pressed','false')
 await dialog.getByLabel(/TU NOMBRE/).fill('Jorge')
 await expect(dialog.getByRole('heading',{name:'¿Qué quieres conseguir?'})).toBeVisible({timeout:5000})
 await choose(page,'Ganar fuerza','/community')
 await page.goBack()
 await expect(dialog).toHaveCount(0)
})
