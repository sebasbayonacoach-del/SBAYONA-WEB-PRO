import {test,expect} from '@playwright/test'
for (const [mode,width,height] of [['desktop',1440,900],['mobile',390,844]]) {
  test('Patologías visibles sin acordeones / '+mode,async({page})=>{
    await page.setViewportSize({width,height})
    await page.goto('/movimiento-adaptado')
    const catalog=page.locator('.bayona-adapted__catalog')
    await expect(catalog.locator('.bayona-adapted__group')).toHaveCount(12)
    await expect(catalog.locator('.bayona-adapted__group button')).toHaveCount(0)
    await expect(catalog.getByText('Escoliosis',{exact:true})).toBeVisible()
    await expect(catalog.getByText('Parkinson',{exact:true})).toBeVisible()
    await expect(catalog.getByText('Diabetes tipo 2',{exact:true})).toBeVisible()
    await expect(catalog.getByText('EPOC',{exact:true})).toBeVisible()
    await expect(catalog).toContainText('no significa que BAYONA trate esa patología')
    const totals=await page.evaluate(()=>({
      examples:document.querySelectorAll('.bayona-adapted__group li').length,
      overflow:document.documentElement.scrollWidth-innerWidth,
    }))
    expect(totals.examples).toBeGreaterThanOrEqual(100)
    expect(totals.overflow).toBeLessThanOrEqual(1)
  })
}
