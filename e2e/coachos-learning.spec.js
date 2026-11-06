import { test, expect } from '@playwright/test'

test('Catálogo de Coach OS es real y sus recursos descargables existen', async ({ request }) => {
  const catalogResponse = await request.get('/mi-app/academy/catalog.json')
  expect(catalogResponse.status()).toBe(200)
  const model = await catalogResponse.json()
  expect(model.courses).toHaveLength(6)
  expect(model.resources).toHaveLength(10)
  expect(model.courses.filter(c => c.sampleLesson)).toHaveLength(3)
  for (const course of model.courses) {
    expect(course.modules.length).toBeGreaterThanOrEqual(6)
    expect(course.status).toBe('En preparación')
    if (course.sampleLesson) {
      const r = await request.get(course.sampleLesson)
      expect(r.status(), course.id).toBe(200)
      const html = await r.text()
      expect(html).toContain('<main class="lesson-content">')
      expect(html.length).toBeGreaterThan(4000)
      expect(html).not.toMatch(/<script/)
    }
  }
  for (const resource of model.resources) {
    const r = await request.get(resource.href)
    expect(r.status(),resource.href).toBe(200)
    expect(r.headers()['content-type'], resource.href).toContain('application/pdf')
    expect((await r.body()).length,resource.href).toBeGreaterThan(4000)
  }
})

test('Recursos de Coach OS conservan restricciones de permiso de entrenador', async ({ page }) => {
  await page.goto('/mi-app/index.html?nosw=1')
  await page.evaluate(async () => {
    const { S } = await import('/mi-app/js/state.js')
    S.init()
    await import('/mi-app/js/ui/coach-content.js')
    const { openSection } = await import('/mi-app/js/ui/shared.js')
    document.body.classList.add('entered')
    document.body.dataset.entryRole = 'athlete'
    openSection('academy')
  })
  // El rol se verifica en el módulo Supabase, no mediante dataset del navegador.
  await expect(page.locator('#drawer')).toHaveAttribute('data-section','hoy')
  await page.evaluate(async () => {
    const { openSection } = await import('/mi-app/js/ui/shared.js')
    openSection('resources')
  })
  await expect(page.locator('#drawer')).toHaveAttribute('data-section','hoy')
})

async function mockVerifiedCoach(page) {
  // Aprobación ficticia SOLAMENTE en la instancia Playwright. No cambia el servidor.
  await page.route('**/mi-app/js/sync/supabase.js*', async route => {
    const response = await route.fetch()
    const source = await response.text()
    const original = 'return uid && uid === verifiedCoachId ? "coach" : "athlete";'
    if (!source.includes(original)) throw Error('Verificación de rol del servidor cambió; no modificar la prueba sin revisión')
    await route.fulfill({response,body:source.replace(original,'return "coach";')})
  })
  await page.goto('/mi-app/index.html?nosw=1')
  await page.evaluate(async () => {
    const { S } = await import('/mi-app/js/state.js')
    S.init()
    await import('/mi-app/js/ui/coach-content.js')
    const { openSection } = await import('/mi-app/js/ui/shared.js')
    document.body.classList.add('entered','fitness-app')
    document.body.dataset.entryRole='coach'
    openSection('academy')
  })
}

test('Academia dentro del Coach OS: búsqueda, filtro y lectura completa', async ({ page }) => {
  await mockVerifiedCoach(page)
  await expect(page.locator('#drawer')).toHaveAttribute('data-section','academy')
  await expect(page.locator('.co-course')).toHaveCount(6)
  await expect(page.getByText('6 FORMACIONES',{exact:true})).toBeVisible()
  const box = page.locator('.co-learning__search input')
  await box.fill('Parkour')
  await expect(page.locator('.co-course')).toHaveCount(1)
  await expect(page.locator('.co-course h4')).toHaveText('PARKOUR LAB · BASES')
  await page.locator('.co-course details summary').click()
  await expect(page.locator('.co-course__syllabus li')).toHaveCount(8)
  await page.locator('.co-course__buttons button').click()
  await expect(page.locator('.co-reader__frame')).toHaveAttribute('src','/mi-app/academy/lessons/parkour-lab.html')
  const frame=page.frameLocator('.co-reader__frame')
  await expect(frame.getByRole('heading',{name:/PARKOUR LAB/})).toBeVisible()
  await expect(frame.getByText('Rúbrica', { exact:false }).first()).toBeVisible()
  await page.getByRole('button',{name:'MARCAR COMO LEÍDA'}).click()
  await expect(page.getByRole('button',{name:/LEÍDA/ })).toBeVisible()
  await page.getByRole('button',{name:/VOLVER A ACADEMIA/}).click()
  await expect(page.locator('.co-course')).toHaveCount(6)
})

test('Mi Centro de Recursos: 10 documentos, favoritos y PROPLAYER', async ({page}) => {
  await mockVerifiedCoach(page)
  await page.locator('.co-learning__switch [data-co-go=resources]').click()
  await expect(page.locator('#drawer')).toHaveAttribute('data-section','resources')
  await expect(page.locator('.co-resource')).toHaveCount(10)
  await expect(page.locator('.co-learning__intro')).toContainText('10 DOCUMENTOS')
  await page.locator('.co-learning__search input').fill('Registro de 30 días')
  await expect(page.locator('.co-resource')).toHaveCount(1)
  await expect(page.locator('.co-resource h4')).toHaveText('Registro de 30 días')
  await page.getByRole('button',{name:'☆ GUARDAR'}).click()
  await expect(page.getByRole('button',{name:'★ GUARDADO'})).toBeVisible()
  await page.locator('.co-learning__search input').fill('')
  await page.getByRole('button',{name:'FAVORITOS'}).click()
  await expect(page.locator('.co-resource')).toHaveCount(1)
  await expect(page.locator('.co-resource a[href$=".pdf"]')).toHaveAttribute('href','/downloads/bayona-editorial/registro-30-dias.pdf')
  await page.getByRole('button',{name:/ABRIR PROPLAYER/}).click()
  await expect(page.locator('#drawer')).toHaveAttribute('data-section','library')
})

test('PWA muestra enlaces reales a la academia y módulos descargables', async ({request}) => {
  const html=await (await request.get('/mi-app/index.html')).text()
  expect(html).toContain('css/coach-content.css')
  const worker=await (await request.get('/mi-app/sw.js')).text()
  expect(worker).toContain('bayona-shell-v46')
  expect(worker).toContain('./js/ui/coach-content.js')
  expect(worker).toContain('./academy/catalog.json')
  expect(worker).toContain('./academy/lessons/movimiento-360.html')
  const ui=await (await request.get('/mi-app/js/ui/one.js')).text()
  expect(ui).toContain('["academy", "Academia"')
  expect(ui).toContain('["resources", "Recursos"')
})

for (const width of [320,390,837,1440]) {
  test('Coach OS academia y biblioteca legibles sin scroll horizontal a '+width+'px', async ({page})=>{
    await page.setViewportSize({width,height:850})
    await mockVerifiedCoach(page)
    await expect(page.locator('.co-course')).toHaveCount(6)
    const academyOverflow = await page.locator('#drawer-body').evaluate(el=>el.scrollWidth-el.clientWidth)
    expect(academyOverflow).toBeLessThanOrEqual(1)
    await page.locator('.co-learning__switch [data-co-go=resources]').click()
    await expect(page.locator('.co-resource')).toHaveCount(10)
    const resourcesOverflow = await page.locator('#drawer-body').evaluate(el=>el.scrollWidth-el.clientWidth)
    expect(resourcesOverflow).toBeLessThanOrEqual(1)
  })
}
