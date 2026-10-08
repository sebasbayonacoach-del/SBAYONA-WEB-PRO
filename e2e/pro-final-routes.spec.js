import { expect, test } from '@playwright/test'

const ROUTES = [
  { path: '/', name: 'Home', desktopMax: 12000, mobileMax: 12500 },
  { path: '/about', name: 'Nosotros', desktopMax: 13000, mobileMax: 11500 },
  { path: '/programs', name: 'Servicios', desktopMax: 10000, mobileMax: 12500 },
  { path: '/parkour-academy', name: 'Parkour', desktopMax: 12000, mobileMax: 12500 },
  { path: '/shop', name: 'Tienda', desktopMax: 13500, mobileMax: 12500 },
  { path: '/app', name: 'BAYONA+', desktopMax: 12000, mobileMax: 13000 },
  { path: '/community', name: 'Comunidad', desktopMax: 11000, mobileMax: 9000 },
  { path: '/resources', name: 'Recursos', desktopMax: 13500, mobileMax: 11500 },
  { path: '/faq', name: 'FAQ', desktopMax: 7000, mobileMax: 8000 },
  { path: '/entrar', name: 'Entrar', desktopMax: 3000, mobileMax: 4200 },
  { path: '/ruta-que-no-existe', name: '404', desktopMax: 2500, mobileMax: 3200 },
]

const FORBIDDEN_COPY = /VIDEO PRÓXIMAMENTE|COMPARAR PROGRAMAS|VER PROGRAMAS|ENTRA EN EL ECOSISTEMA|AÚN NO HAY TESTIMONIOS|SOLO 10 CUPOS|MÁXIMO 10 CUPOS/i

async function inspectRoute(page, route, viewport, heightLimit) {
  await page.setViewportSize(viewport)
  const pageErrors = []
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto(route.path, { waitUntil: 'networkidle' })

  const metrics = await page.evaluate(() => {
    const visible = (element) => {
      const rect = element.getBoundingClientRect()
      const style = getComputedStyle(element)
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden'
    }

    return {
      scrollHeight: document.documentElement.scrollHeight,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      h1: [...document.querySelectorAll('h1')].filter(visible).map((node) => node.textContent.trim()),
      brokenImages: [...document.images]
        .filter((img) => img.complete && img.naturalWidth === 0)
        .map((img) => img.currentSrc || img.src),
      text: document.body.innerText,
      disabledVideoButtons: document.querySelectorAll('.video-section__play:disabled').length,
    }
  })

  expect(metrics.h1, `${route.name}: debe existir un único H1 visible`).toHaveLength(1)
  expect(metrics.scrollWidth, `${route.name}: overflow horizontal`).toBeLessThanOrEqual(metrics.clientWidth + 3)
  expect(metrics.scrollHeight, `${route.name}: la ruta volvió a crecer demasiado`).toBeLessThan(heightLimit)
  expect(metrics.brokenImages, `${route.name}: imágenes rotas`).toEqual([])
  expect(metrics.text, `${route.name}: copy heredado`).not.toMatch(FORBIDDEN_COPY)
  expect(metrics.disabledVideoButtons, `${route.name}: reproductor falso deshabilitado`).toBe(0)
  expect(pageErrors, `${route.name}: errores JS`).toEqual([])
}

for (const route of ROUTES) {
  test(`PRO FINAL desktop · ${route.name}`, async ({ page }) => {
    await inspectRoute(page, route, { width: 1440, height: 900 }, route.desktopMax)
  })
}

for (const route of ROUTES) {
  test(`PRO FINAL móvil · ${route.name}`, async ({ page }) => {
    await inspectRoute(page, route, { width: 390, height: 844 }, route.mobileMax)
  })
}

test('PRO FINAL · Comunidad conserva seis capítulos continuos', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/community', { waitUntil: 'networkidle' })

  await expect(page.locator('.community-section[data-section-number]')).toHaveCount(6)
  const numbers = await page.locator('.community-section[data-section-number]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-section-number')))

  expect(numbers).toEqual(['01', '02', '03', '04', '05', '06'])
  await expect(page.getByText(/IMAGINA ESTO|UNA PERSONA BAYONA|ENTRAR ES SIMPLE/i)).toHaveCount(0)
})

test('PRO FINAL · Recursos cierra directo en captación', async ({ page }) => {
  await page.goto('/resources', { waitUntil: 'networkidle' })

  await expect(page.locator('.resources-channels')).toHaveCount(0)
  await expect(page.locator('.resources-decision')).toHaveCount(0)
  await expect(page.locator('#resources-lead')).toBeVisible()
})

test('PRO FINAL · BAYONA+ conserva nueve módulos en seis capítulos', async ({ page }) => {
  await page.goto('/app', { waitUntil: 'networkidle' })

  await expect(page.locator('section.app-section')).toHaveCount(6)
  await expect(page.getByRole('list', { name: 'Funciones conceptuales en evaluación para BAYONA+' }).getByRole('listitem')).toHaveCount(9)
  await expect(page.getByText(/MUCHOS DATOS\.\s*POCO CONTEXTO|LO QUE ESTAMOS EXPLORANDO|LO QUE ENTRA\s*CON Y SIN PLAN/i)).toHaveCount(0)
})
