import { test, expect } from '@playwright/test'

for (const width of [390,1440]) for (const theme of ['night','day']) {
 test(`BAYONA: nuevo copy empático visible y legible ${width}px ${theme}`,async({page})=>{
  await page.setViewportSize({width,height:width===390?844:900})
  await page.emulateMedia({reducedMotion:'reduce'})
  const errors=[];page.on('pageerror',e=>errors.push(e.message))
  await page.goto('/',{waitUntil:'networkidle'})
  await page.evaluate(theme=>{document.documentElement.dataset.bayonaTheme=theme},theme)
  await expect(page.locator('.gym-home-hero__lead')).toContainText('Tu cuerpo tiene una historia')
  await expect(page.getByRole('heading',{name:/EMPIEZA A TU RITMO. YO TE ACOMPAÑO./i})).toBeAttached()
  const final=page.locator('.gym-home-lead')
  await final.scrollIntoViewIfNeeded()
  await expect(final.getByRole('heading',{name:/Tu primer paso ya cuenta/i})).toBeVisible()
  await expect(final.getByRole('button',{name:/QUIERO MIS TRES RECURSOS/i})).toBeVisible()
  await expect(final.getByText(/no necesitas tenerlo todo resuelto/i)).toBeAttached()
  await expect(final.getByRole('textbox',{name:/NOMBRE/i})).toBeVisible()
  await expect(final.getByRole('textbox',{name:/CORREO O WHATSAPP/i})).toBeVisible()
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(3)
  expect(errors).toEqual([])
  await page.screenshot({path:`/tmp/bayona-voice-final-${width}-${theme}.png`})
 })
}

test('Página de Servicios explica opciones sin presionar ni cambiar precios',async({page})=>{
 await page.goto('/programs',{waitUntil:'networkidle'})
 await expect(page.getByText(/Cada persona llega con una historia/i)).toBeAttached()
 await expect(page.getByText(/Tres recursos gratuitos para comenzar con calma/i)).toBeAttached()
 await expect(page.getByRole('heading',{name:/CONÓCENOS. DESCUBRE. Y TÚ DECIDES./i})).toBeAttached()
})

test('Nosotros y comunidad refuerzan escucha y acompañamiento',async({page})=>{
 await page.goto('/about',{waitUntil:'networkidle'})
 await expect(page.getByText(/primero escucharte, después entender tu punto de partida/i)).toBeAttached()
 await page.goto('/community',{waitUntil:'networkidle'})
 await expect(page.getByText(/preguntar sin miedo, aprender de otras personas/i)).toBeAttached()
})
