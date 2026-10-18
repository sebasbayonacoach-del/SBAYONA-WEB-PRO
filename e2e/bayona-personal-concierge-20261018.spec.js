import { test, expect } from '@playwright/test'

for (const [mode,width,height] of [['desktop',1440,900],['mobile',390,844]]) {
  test('Un recorrido más breve, con objetivos y servicios visibles / '+mode, async ({page}) => {
    await page.setViewportSize({width,height})
    await page.goto('/')
    const guidance=page.locator('#tu-ruta')
    await expect(guidance.getByRole('heading',{name:/PRIMERO TE ESCUCHO/i})).toBeVisible()
    await expect(guidance.locator('.bayona-discovery__focus-card')).toHaveCount(3)
    await expect(guidance.locator('.bayona-moment__answers button')).toHaveCount(2)
    await expect(guidance.locator('input')).toHaveCount(0)

    const service=page.locator('#servicios')
    await expect(service.locator('article.gym-service-card')).toHaveCount(4)
    for (const name of ['Entrenamiento personal','Entrenamiento online','Parkour y rendimiento','Movilidad y recuperación']){
      await expect(service.getByRole('heading',{name,exact:true})).toBeVisible()
    }
    await expect(service.locator('a.gym-service-card')).toHaveCount(0)

    const plans=page.locator('.bayona-plan-open')
    await expect(plans.locator('article.bayona-plan-open__card')).toHaveCount(4)
    await expect(plans.locator('button')).toHaveCount(0)

    const stats=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth}))
    expect(stats.overflow).toBeLessThanOrEqual(1)
  })

  test('Rutas mantienen guía no intrusiva / '+mode,async({page})=>{
    await page.setViewportSize({width,height})
    for(const [path,title] of [['/programs','SERVICIOS A LA VISTA'],['/resources','RECURSOS SIN PRESIÓN'],['/movimiento-adaptado','MOVIMIENTO CON CRITERIO']]){
      await page.goto(path)
      const note=page.locator('.bayona-journey-inline')
      await expect(note).toBeAttached()
      await expect(note.getByRole('heading',{name:title})).toBeVisible()
      await expect(note).toContainText('No recogemos datos de salud')
      await expect(note.locator('button')).toHaveCount(0)
    }
  })
}
