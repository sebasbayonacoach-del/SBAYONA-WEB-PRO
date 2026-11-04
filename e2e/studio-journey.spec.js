import { test, expect } from '@playwright/test'

const chapters = [
  ['/', 'El Estudio', '/about'],
  ['/about', 'La Historia', '/programs'],
  ['/programs', 'Experiencias', '/parkour-academy'],
  ['/parkour-academy', 'Parkour Lab', '/community'],
  ['/community', 'El Círculo', '/app'],
  ['/app', 'SB+', '/shop'],
  ['/shop', 'La Colección', '/resources'],
  ['/resources', 'La Biblioteca', '/faq'],
  ['/faq', 'Respuestas', '/checkout'],
]

test('Los nueve capítulos presentan un siguiente paso concreto', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  for(const [path, title, next] of chapters) {
    const response = await page.goto(path)
    expect(response.status(), path).toBe(200)
    const guide = page.getByRole('navigation', { name: 'Recorrido guiado del estudio' })
    await expect(guide).toContainText(title)
    await expect(guide.getByRole('link', { name: /SIGUIENTE:|SOLICITAR PROPUESTA/ })).toHaveAttribute('href', next)
    const closure = page.locator('.sj-outro')
    await expect(closure.getByRole('link', { name: /CONOCER|EXPLORAR|DESCUBRIR|ENTRAR|VISITAR|ABRIR|RESOLVER|PREPARAR/ })).toHaveAttribute('href', next)
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), path).toBeLessThanOrEqual(1)
  }
  expect(errors).toEqual([])
})

test('Inicio ofrece recursos gratuitos y mantiene el recorrido entre capítulos', async ({ page }) => {
  await page.goto('/')
  const home = page.locator('.atelier-hero')
  const primary = home.getByRole('link', { name: /LLÉVATE LOS EBOOKS GRATIS/ })
  await expect(primary).toHaveAttribute('href', '#regalos-gratis')
  await expect(home.getByRole('link', { name: /CREAR MI PLAN DE 30 DÍAS/ })).toHaveAttribute('href', '#plan-30-dias')
  await primary.click()
  await expect(page).toHaveURL(/#regalos-gratis$/)
  await expect(page.locator('.lv-book__cta')).toHaveCount(2)
  await page.locator('.sj-outro__primary').click()
  await expect(page).toHaveURL(/\/about$/)
  await expect(page.locator('.sj-header__chapter')).toContainText('ETAPA 02')
  await expect(page.locator('.sj-outro__primary')).toHaveAttribute('href', '/programs')
})

test('Progreso real: una etapa solo se registra al alcanzar el cierre y persiste', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.sj-header__details summary')).toContainText('0 EXPLORADAS')
  await page.locator('.sj-outro__primary').scrollIntoViewIfNeeded()
  await expect(page.locator('.sj-header__details summary')).toContainText('1 EXPLORADAS')
  await page.locator('.sj-outro__primary').click()
  await expect(page).toHaveURL(/\/about$/)
  await page.locator('.sj-outro__primary').scrollIntoViewIfNeeded()
  await expect(page.locator('.sj-header__details summary')).toContainText('2 EXPLORADAS')
  await page.reload()
  await expect(page.locator('.sj-header__details summary')).toContainText('2 EXPLORADAS')
  const visited = await page.evaluate(() => JSON.parse(localStorage.getItem('sb:studio-journey:v1')))
  expect(visited).toEqual(expect.arrayContaining(['/','/about']))
})

test('El mapa desplegable permite elegir cualquier etapa sin bloqueo', async ({ page }) => {
  await page.setViewportSize({width:390,height:844})
  await page.goto('/programs')
  const navigation=page.getByRole('navigation',{name:'Recorrido guiado del estudio'})
  await navigation.locator('summary').click()
  const map = navigation.getByRole('list',{name:'Todas las etapas del recorrido'})
  await expect(map.getByRole('link')).toHaveCount(9)
  await expect(map.getByRole('link',{name:/Experiencias/})).toHaveAttribute('aria-current','step')
  await map.getByRole('link',{name:/La Biblioteca/}).click()
  await expect(page).toHaveURL(/\/resources$/)
  await expect(page.locator('.sj-header__chapter')).toContainText('ETAPA 08')
})

test('Tras las preguntas, la propuesta conduce al formulario y no a un cobro', async ({page}) => {
  await page.goto('/faq')
  const primary=page.locator('.sj-outro__primary')
  await expect(primary).toContainText('PREPARAR MI PROPUESTA')
  await primary.click()
  await expect(page).toHaveURL(/\/checkout$/)
  await expect(page.getByRole('heading',{name:'PREPARA TU SOLICITUD.'})).toBeVisible()
  await expect(page.locator('.sj-header')).toHaveCount(0)
  await expect(page.locator('.sj-outro')).toHaveCount(0)
})

for(const width of [320,390,837,1440]) {
  test('Recorrido responsive y accesible a ' + width + 'px', async ({page}) => {
    await page.setViewportSize({width,height:844})
    await page.goto('/shop')
    const nav=page.locator('.sj-header')
    await expect(nav).toBeVisible()
    const bottom=await page.locator('.navbar').evaluate(el=>el.getBoundingClientRect().bottom)
    const top=await nav.evaluate(el=>el.getBoundingClientRect().top)
    expect(top).toBeGreaterThanOrEqual(bottom-2)
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1)
    await nav.locator('summary').click()
    await expect(nav.getByRole('link', {name:/El Estudio/})).toBeVisible()
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1)
  })
}

test('Acceso principal siempre disponible si alguien prefiere ir directamente', async ({page}) => {
  await page.goto('/about')
  await expect(page.locator('.sj-outro__secondary')).toHaveAttribute('href', /^https:\/\//)
  await expect(page.locator('.sj-outro__secondary')).toContainText('PREFIERO HABLAR AHORA')
})
