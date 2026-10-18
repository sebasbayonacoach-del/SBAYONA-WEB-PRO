import { test, expect } from '@playwright/test'

const steps = [
  ['Ganar fuerza', '/about'],
  ['Voy a empezar', '/community'],
  ['No sé cómo organizarme', '/resources'],
  ['3–4 días por semana', '/programs'],
  ['Online, desde donde esté', '/programs'],
  ['Ajustes y apoyo cada semana', '/movimiento-adaptado'],
  ['Entiendo, quiero ver la propuesta', '/programs'],
]

for (const [device, width, height] of [['desktop',1440,900],['mobile',390,844]]) {
  test('Sebastián acompaña entre páginas y propone un plan sin transmitir datos / ' + device, async ({page}) => {
    await page.setViewportSize({width,height})
    await page.goto('/')
    await page.getByRole('button', {name:/CONOCE A TU ENTRENADOR/i}).click()
    const dialog = page.getByRole('dialog', {name:/Qué te gustaría conseguir/i})
    await expect(dialog).toBeVisible()
    await expect(page.locator('html')).toHaveClass(/bayona-coach-visit-active/)
    await expect(page.getByRole('button', {name:'CONTINUAR'})).toBeDisabled()
    for(const [index, [answer, route]] of steps.entries()){
      await page.getByRole('dialog').getByRole('button',{name:answer,exact:true}).click()
      await expect(page.getByRole('button',{name:'CONTINUAR'})).toBeEnabled()
      await page.getByRole('button',{name:'CONTINUAR'}).click()
      await expect(page).toHaveURL(new RegExp(route.replaceAll('/','\\/')+'$'))
      await expect(page.locator('.bayona-coach__eyebrow')).toContainText(String(index+2).padStart(2,'0')+' / 08')
    }
    await expect(page.getByTestId('coach-result')).toContainText('FUERZA')
    await expect(page.getByTestId('coach-result')).toContainText('3–4 días por semana')
    await expect(page.getByTestId('coach-result')).toContainText('No se ha creado ninguna ficha')
    await page.getByLabel(/CÓMO TE GUSTARÍA QUE TE LLAME/i).fill('Ana')
    const whatsapp=page.getByTestId('coach-result').getByRole('link',{name:/ABRIR WHATSAPP CON MI RESUMEN/i})
    await expect(whatsapp).toHaveAttribute('href',/wa.me/)
    await expect(whatsapp).toHaveAttribute('href',/Ana/)
    await expect(whatsapp).toHaveAttribute('href',/FUERZA/)
    await page.getByRole('dialog').getByRole('button',{name:'SEGUIR EXPLORANDO'}).click()
    await expect(page.getByTestId('guided-coach-overlay')).toHaveCount(0)
    await expect(page.locator('html')).not.toHaveClass(/bayona-coach-visit-active/)
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1)
    await page.reload()
    await expect(page.getByTestId('guided-coach-overlay')).toHaveCount(0)
  })
}

test('Se puede regresar o salir de la visita en cualquier momento',async({page})=>{
  await page.goto('/')
  await page.getByRole('button',{name:/CONOCE A TU ENTRENADOR/i}).click()
  await page.getByRole('dialog').getByRole('button',{name:'Ganar fuerza'}).click()
  await page.getByRole('button',{name:'CONTINUAR'}).click()
  await expect(page).toHaveURL(/\/about$/)
  await page.getByRole('dialog').getByRole('button',{name:/ANTERIOR/}).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('dialog').getByRole('button',{name:'Ganar fuerza'})).toHaveAttribute('aria-pressed','true')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.locator('html')).not.toHaveClass(/bayona-coach-visit-active/)
})

test('Navegar Atrás en el navegador no queda bloqueado por la visita',async({page})=>{
  await page.goto('/')
  await page.getByRole('button',{name:/CONOCE A TU ENTRENADOR/i}).click()
  await page.getByRole('dialog').getByRole('button',{name:'Ganar fuerza'}).click()
  await page.getByRole('button',{name:'CONTINUAR'}).click()
  await expect(page).toHaveURL(/\/about$/)
  await page.goBack()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('dialog')).toHaveCount(0,{timeout:4000})
})

test('Reglas de orientación distinguen los cuatro planes sin preguntas médicas',async({page})=>{
  await page.goto('/')
  await page.getByRole('button',{name:/CONOCE A TU ENTRENADOR/i}).click()
  await expect(page.getByRole('dialog')).not.toContainText('diagnóstico personal')
  await expect(page.getByRole('dialog')).toContainText('Nada se envía automáticamente')
})
