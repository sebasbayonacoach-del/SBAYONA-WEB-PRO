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

async function begin(page){
 await page.goto('/')
 await page.getByRole('button',{name:/SEBASTIÁN TE DA LA BIENVENIDA/}).click()
 return page.getByRole('dialog')
}
async function chooseAndContinue(page,label,route){
 const dialog=page.getByRole('dialog')
 await dialog.getByRole('button',{name:label,exact:true}).click()
 await expect(dialog.getByRole('button',{name:/SIGUIENTE/})).toBeEnabled()
 await dialog.getByRole('button',{name:/SIGUIENTE/}).click()
 await expect(page).toHaveURL(new RegExp(route.replaceAll('/','\\/')+'$'))
}
for(const [device,width,height] of [['desktop',1440,900],['mobile',390,844]]){
 test('Recepción personal con nombre primero y plan al final / '+device,async({page})=>{
  await page.setViewportSize({width,height})
  const dialog=await begin(page)
  await expect(dialog.getByRole('heading',{name:'¿Cómo te llamas?'})).toBeVisible()
  await expect(dialog.getByRole('button',{name:/SIGUIENTE/})).toBeDisabled()
  await dialog.getByLabel(/TU NOMBRE/i).fill('Ana')
  await expect(dialog.getByRole('button',{name:/SIGUIENTE/})).toBeEnabled()
  await dialog.getByRole('button',{name:/SIGUIENTE/}).click()
  await expect(dialog.getByRole('heading',{name:'¿Qué quieres conseguir?'})).toBeVisible()
  for(const [index,[label,route]] of choices.entries()){
   await chooseAndContinue(page,label,route)
   await expect(page.locator('.bayona-coach__eyebrow')).toContainText(String(index+3).padStart(2,'0')+' / '+String(COACH_VISIT_STEPS.length).padStart(2,'0'))
  }
  await expect(page.getByTestId('coach-result')).toContainText('FUERZA')
  await expect(page.getByTestId('coach-result')).toContainText('Ana')
  await expect(page.getByTestId('coach-result')).toContainText('Entrenamiento personal u online')
  const link=page.getByTestId('coach-result').getByRole('link',{name:/HABLAR CON SEBASTIÁN/i})
  await expect(link).toHaveAttribute('href',/wa.me/)
  await expect(link).toHaveAttribute('href',/Ana/)
  await expect(link).toHaveAttribute('href',/FUERZA/)
  await page.getByRole('dialog').getByRole('button',{name:'TERMINAR'}).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1)
 })
}

test('El scroll está cerrado sin respuesta y se desbloquea al elegir',async({page})=>{
 await begin(page)
 const current=()=>page.locator('.bayona-coach__eyebrow')
 await page.mouse.wheel(0,650)
 await expect(current()).toContainText('01 / 11')
 await expect(page.getByRole('heading',{name:'¿Cómo te llamas?'})).toBeVisible()
 await page.getByLabel(/TU NOMBRE/).fill('Luis')
 await page.mouse.wheel(0,650)
 await expect(page.getByRole('dialog').getByRole('heading',{name:'¿Qué quieres conseguir?'})).toBeVisible()
 await page.mouse.wheel(0,650)
 await expect(page.getByRole('dialog').getByRole('heading',{name:'¿Qué quieres conseguir?'})).toBeVisible()
 await page.getByRole('dialog').getByRole('button',{name:'Ganar fuerza'}).click()
 await page.waitForTimeout(1000)
 await page.mouse.wheel(0,650)
 await expect(page.getByRole('heading',{name:'¿Qué te está frenando?'})).toBeVisible()
 await expect(page).toHaveURL(/\/community$/)
})

test('El nombre se puede omitir, borrar y no persiste tras recargar',async({page})=>{
 await begin(page)
 await page.getByRole('dialog').getByRole('button',{name:'Prefiero seguir sin decirlo'}).click()
 await page.getByRole('dialog').getByRole('button',{name:/SIGUIENTE/}).click()
 await expect(page.getByRole('dialog').getByRole('heading',{name:'¿Qué quieres conseguir?'})).toBeVisible()
 await page.getByRole('dialog').getByRole('button',{name:'VOLVER'}).click()
 await expect(page.getByRole('heading',{name:'¿Cómo te llamas?'})).toBeVisible()
 await page.keyboard.press('Escape')
 await expect(page.getByRole('dialog')).toHaveCount(0)
 await page.reload()
 await expect(page.getByRole('dialog')).toHaveCount(0)
 await page.getByRole('button',{name:/SEBASTIÁN TE DA LA BIENVENIDA/}).click()
 await expect(page.getByLabel(/TU NOMBRE/)).toHaveValue('')
})

test('El botón Atrás del navegador permite salir; la voz es voluntaria',async({page})=>{
 await begin(page)
 const voice=page.getByRole('button',{name:/Activar voz sintética/i})
 if(await voice.count()){
  await expect(voice).toHaveAttribute('aria-pressed','false')
  // No activar sonido durante la prueba; el botón existe y su estado es explícito.
 }
 await page.getByLabel(/TU NOMBRE/).fill('Jorge')
 await page.getByRole('dialog').getByRole('button',{name:/SIGUIENTE/}).click()
 await page.getByRole('dialog').getByRole('button',{name:'Ganar fuerza'}).click()
 await page.getByRole('dialog').getByRole('button',{name:/SIGUIENTE/}).click()
 await expect(page).toHaveURL(/\/community$/)
 await page.goBack()
 await expect(page.getByRole('dialog')).toHaveCount(0)
})
