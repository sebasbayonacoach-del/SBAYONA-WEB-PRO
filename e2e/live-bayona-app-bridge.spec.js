import { test, expect } from '@playwright/test'

const ENTRY = 'https://bayona-app-one.vercel.app/?source=pwa'

for (const width of [1440, 390]) {
  test(`Home y BAYONA+ enlazan la aplicación real sin iframes en ${width}px`, async ({page}) => {
    await page.setViewportSize({width, height: width < 600 ? 844 : 900})
    for (const route of ['/', '/app']) {
      await page.goto(route, {waitUntil:'networkidle'})
      const showcase=page.locator('.bayona-live-app')
      await expect(showcase).toHaveCount(1)
      await showcase.scrollIntoViewIfNeeded()
      await expect(showcase.getByRole('heading',{level:3,name:'Tu espacio personal'})).toBeVisible()
      await expect(showcase.getByRole('heading',{level:3,name:'Tu espacio de entrenador'})).toBeVisible()
      await expect(showcase.locator('iframe')).toHaveCount(0)
      await expect(showcase.getByRole('link',{name:/ABRIR LA APP REAL/i})).toHaveAttribute('href',ENTRY)
      await expect(showcase.getByRole('link',{name:/ABRIR LA APP REAL/i})).toHaveAttribute('target','_blank')
      await expect.poll(async () => showcase.locator('img').evaluate(img=>img.complete && img.naturalWidth>300)).toBe(true)
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)
      expect(overflow).toBeLessThanOrEqual(3)
    }
  })
}

test('Home conecta a /app y /app distingue versión web de roadmap futuro',async({page})=>{
  await page.goto('/',{waitUntil:'networkidle'})
  await page.locator('#bayona-app-real-home').getByRole('link',{name:/DESCUBRIR BAYONA APP/i}).click()
  await expect(page).toHaveURL(/\/app$/)
  await expect(page.getByRole('heading',{name:/YA NO ES SOLO UNA IDEA/i})).toBeVisible()
  await expect(page.getByText(/APP WEB PUBLICADA · INTEGRACIONES EN DESARROLLO/i)).toHaveCount(1)
  await expect(page.locator('.app-mockup-caption')).toContainText(/conceptual/i)
})
