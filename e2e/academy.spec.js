import { test, expect } from '@playwright/test'

test('Academia incluye seis formaciones y no finge matrículas', async ({page}) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  const response = await page.goto('/academia')
  expect(response.status()).toBe(200)
  await expect(page.getByRole('heading', {name:/APRENDE.*APLICA.*EVOLUCIONA/s})).toBeVisible()
  await expect(page.locator('.academy-course')).toHaveCount(6)
  await expect(page.getByText('Programas en preparación')).toBeVisible()
  await expect(page.getByText(/No se aceptan pagos ni matrículas todavía/)).toBeVisible()
  await expect(page.locator('.academy-course__action')).toHaveCount(6)
  for(const href of await page.locator('.academy-course__action').evaluateAll(items=>items.map(x=>x.getAttribute('href')))) {
    expect(href).toMatch(/^https:\/\/wa\.me\//)
  }
  expect(errors).toEqual([])
})

test('Filtrar por profesionales y desplegar el temario de Coach Studio IA', async ({page}) => {
  await page.goto('/academia')
  const filter = page.getByRole('button', {name:'PROFESIONALES', exact:true})
  await filter.click()
  await expect(filter).toHaveAttribute('aria-pressed','true')
  await expect(page.locator('.academy-course')).toHaveCount(1)
  const coach = page.locator('#curso-coach-studio-ai')
  await expect(coach.getByRole('heading',{name:'COACH STUDIO IA'})).toBeVisible()
  const expand = coach.getByRole('button',{name:/VER TEMARIO COMPLETO/})
  await expand.click()
  await expect(coach.locator('.academy-course__curriculum li')).toHaveCount(10)
  await expect(coach).toContainText('Onboarding')
  await expect(coach).toContainText('PROYECTO DE FINALIZACIÓN')
  await coach.getByRole('button',{name:/OCULTAR TEMARIO/}).click()
  await expect(coach.locator('.academy-course__curriculum')).toHaveCount(0)
})

test('Conexión desde menú, tienda y SB+ a /academia', async ({page}) => {
  await page.goto('/academia')
  await expect(page.getByRole('navigation',{name:'Navegación principal'}).getByRole('link',{name:'Academia'})).toHaveAttribute('href','/academia')
  await page.goto('/shop')
  await expect(page.getByRole('link',{name:/FORMACIONES DIGITALES/})).toHaveAttribute('href','/academia')
  await page.goto('/mi-app/index.html')
  await expect(page.locator('.sb-academy-app-link')).toHaveAttribute('href','/academia')
  await expect(page.locator('.sb-academy-dashboard-link')).toHaveAttribute('href','/academia')
})

test('Lección inicial gratuita enlaza a ebooks y plan', async ({page}) => {
  await page.goto('/academia')
  await expect(page.locator('.academy-free__offer a[href="/#regalos-gratis"]')).toHaveCount(1)
  await expect(page.locator('.academy-free__offer a[href="/#plan-30-dias"]')).toHaveCount(1)
  await expect(page.locator('.academy-course__price')).toHaveCount(6)
  await expect(page.locator('.academy-finish')).toContainText('no regladas')
})

for (const width of [320,390,768,1440]) {
  test('Academia responsive sin desbordamiento a '+width+' px', async ({page}) => {
    await page.setViewportSize({width,height:850})
    const errors = []
    page.on('pageerror',e=>errors.push(e.message))
    await page.goto('/academia')
    for (const section of ['.academy-hero','.academy-free','.academy-catalog','.academy-pro','.academy-finish']) {
      await page.locator(section).scrollIntoViewIfNeeded()
      expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),section).toBeLessThanOrEqual(1)
    }
    const course = page.locator('.academy-course').first()
    await course.getByRole('button',{name:/VER TEMARIO COMPLETO/}).click()
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1)
    expect(errors).toEqual([])
  })
}

test('SEO y contraste editorial sin estilos heredados que oculten el texto', async ({page}) => {
  await page.setViewportSize({width:390,height:844})
  await page.goto('/academia')
  await expect(page).toHaveTitle(/Academia.*Movimiento.*Parkour.*IA/)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',/\/academia$/)
  const palette = await page.evaluate(() => ({
    finishBackground: getComputedStyle(document.querySelector('.academy-finish')).backgroundColor,
    finishTitle: getComputedStyle(document.querySelector('.academy-finish h2')).color,
    taglineCase: getComputedStyle(document.querySelector('.academy-course__tagline')).textTransform,
    actionBackground: getComputedStyle(document.querySelector('.academy-course__action')).backgroundColor,
  }))
  expect(palette.finishBackground).toBe('rgb(241, 236, 226)')
  expect(palette.finishTitle).toBe('rgb(37, 53, 42)')
  expect(palette.taglineCase).toBe('none')
  expect(palette.actionBackground).toBe('rgb(35, 58, 42)')
})
