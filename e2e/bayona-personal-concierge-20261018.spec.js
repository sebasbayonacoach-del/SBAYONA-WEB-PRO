import { test, expect } from '@playwright/test'

for (const [mode,width,height] of [['desktop',1440,900],['mobile',390,844]]) {
  test('Inicio muestra todos los objetivos sin preguntas ocultas / '+mode,async({page})=>{
    await page.setViewportSize({width,height})
    await page.goto('/')
    const a=page.locator('#servicios .bayona-services-conversation')
    await expect(a).toBeVisible()
    await expect(a.locator('.bayona-services-conversation__match')).toHaveCount(5)
    for(const title of ['Ganar fuerza','Moverme mejor','Volver a entrenar','Tener más energía','Aprender parkour']){
      await expect(a.getByText(title,{exact:true})).toBeVisible()
    }
    await expect(a).toContainText('Entrenamiento personal')
    await expect(a).toContainText('Movilidad y entrenamiento adaptado')
    await expect(a).toContainText('Entrenamiento online')
    await expect(a).toContainText('Parkour y rendimiento')
    await expect(a.locator('button')).toHaveCount(0)
    await expect(page.locator('.bayona-care')).toHaveCount(0)
    await expect(page.locator('#servicios .gym-service-card')).toHaveCount(4)
    await expect(page.locator('#servicios .gym-service-card.is-for-you')).toHaveCount(0)
    const stats=await page.evaluate(()=>({
      overflow:document.documentElement.scrollWidth-innerWidth,
      cardTypes:[...document.querySelectorAll('#servicios .gym-service-card')].map(e=>e.className)
    }))
    expect(stats.overflow).toBeLessThanOrEqual(1)
  })

  test('Los 3 aspectos están expuestos sin hacer clic / '+mode,async({page})=>{
    await page.setViewportSize({width,height})
    await page.goto('/')
    const orient=page.locator('#tu-ruta')
    await expect(orient).toBeVisible()
    await expect(orient.locator('.bayona-discovery__allstep')).toHaveCount(3)
    await expect(orient.getByRole('heading',{name:'QUÉ QUIERES MEJORAR'})).toBeVisible()
    await expect(orient.getByRole('heading',{name:'DESDE DÓNDE EMPIEZAS'})).toBeVisible()
    await expect(orient.getByRole('heading',{name:'CÓMO TE ACOMPAÑAMOS'})).toBeVisible()
    await expect(orient).toContainText('valorarlas los profesionales sanitarios')
    await expect(orient.locator('button')).toHaveCount(0)
    await expect(orient.locator('input')).toHaveCount(0)
    await expect(orient).toContainText('No tienes que completar un cuestionario')
    const stats=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth}))
    expect(stats.overflow).toBeLessThanOrEqual(1)
  })

  test('Rutas muestran orientación sin panel flotante / '+mode,async({page})=>{
    await page.setViewportSize({width,height})
    for(const [path,title] of [['/programs','SERVICIOS A LA VISTA'],['/resources','RECURSOS SIN PRESIÓN'],['/movimiento-adaptado','MOVIMIENTO CON CRITERIO']]){
      await page.goto(path)
      const note=page.locator('.bayona-journey-inline')
      await expect(note).toBeAttached()
      await expect(note.getByRole('heading',{name:title})).toBeVisible()
      await expect(note).toContainText('No recogemos datos de salud')
      await expect(note.locator('button')).toHaveCount(0)
      await expect(page.locator('.bayona-care')).toHaveCount(0)
    }
  })
}
