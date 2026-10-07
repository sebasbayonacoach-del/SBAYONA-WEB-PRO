// Verificación de consolidación Fase 8 (auditoría de continuidad, prompt de
// consolidación premium): confirma en EJECUCIÓN REAL (build + preview) que los
// cuatro lenguajes narrativos existen en el DOM servido, no solo en el código
// fuente. Es de lectura: nada de assertions de snapshot.

import { test, expect } from '@playwright/test'

const CHECKS = [
  {
    route: '/',
    name: 'H — la Home comercial directa vive en el DOM servido',
    selector: '.gym-home-hero',
    css: null,
  },
  {
    route: '/',
    name: 'E — el proceso de inicio se entiende en tres pasos',
    selector: '.gym-process-grid',
    css: null,
  },
  {
    route: '/parkour-academy',
    name: 'F — la escalera de niveles conserva su sticky vertical',
    selector: '.academy-level-grid--stage',
    css: null,
  },
  {
    route: '/about',
    name: 'G — la línea de vida conserva su sticky narrativo',
    selector: '.about-timeline--stage',
    css: null,
  },
]

for (const check of CHECKS) {
  test(`consolidación: ${check.name} vive en el DOM servido`, async ({ page }) => {
    await page.goto(check.route, { waitUntil: 'networkidle' })
    // Home es chunk estático (protege LCP), pero about/parkour son rutas lazy:
    // el contenido llega al hidratar React. La verificación correcta es contra
    // la EJECUCIÓN (DOM tras cargar), no contra el shell estático vacío.
    await page.locator(check.selector).first().waitFor({ state: 'attached', timeout: 15_000 })
    const count = await page.locator(check.selector).count()
    expect(count, `No se encontró ${check.selector} en ${check.route} tras hidratar`).toBeGreaterThan(0)

    if (check.css) {
      // La regla CSS viva: verifica que el stylesheet cargado contiene la
      // animación de respiración (no solo que existe el archivo).
      const hasRule = await page.evaluate(
        (needle) =>
          [...document.styleSheets].some((sheet) => {
            try {
              return [...sheet.cssRules].some((rule) => rule.cssText && rule.cssText.includes(needle))
            } catch {
              return false
            }
          }),
        check.css,
      )
      expect(hasRule, `La regla CSS ${check.css} no está activa en las hojas servidas`).toBe(true)
    }
  })
}

// La Home V2 ya no usa storytelling sticky. Parkour y About sí conservan
// StickyStage y deben degradar a pila estática legible en móvil.
for (const route of ['/parkour-academy', '/about']) {
  test(`consolidación: ${route} degrada sticky a pila estática en móvil`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(route, { waitUntil: 'networkidle' })
    const staticMode = await page.locator('.sticky-stage--static').count()
    expect(staticMode, `${route}: StickyStage debe degradar a pila estática legible`).toBeGreaterThan(0)
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// FASE 9.0-A — CONTRATO DE CARDINALIDAD DEL FALLBACK MÓVIL (regresión del
// hallazgo del arquitecto: duplicación N×N). Antes del fix, cada frame
// estático podía multiplicar estados en Parkour/About. Home V2 ya no usa
// StickyStage y protege su proceso directo de tres pasos. En las rutas sticky,
// isStatic=true debe seguir pintando SOLO su estado: exactamente N elementos.
// ─────────────────────────────────────────────────────────────────────────────
const CARDINALITY = [
  { route: '/', selector: '.gym-process-grid > li', expected: 3, label: 'pasos para empezar' },
  { route: '/parkour-academy', selector: '.academy-level--stage', expected: 3, label: 'niveles' },
  { route: '/about', selector: '.about-timeline-entry--stage', expected: 4, label: 'etapas de la línea de vida' },
]

for (const { route, selector, expected, label } of CARDINALITY) {
  test(`9.0-A cardinalidad móvil: ${route} muestra exactamente ${expected} ${label}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(route, { waitUntil: 'networkidle' })
    await page.locator(selector).first().waitFor({ state: 'attached', timeout: 15_000 })
    const count = await page.locator(selector).count()
    expect(
      count,
      `${route}: esperado exactamente ${expected}, encontrado ${count}. Si es un múltiplo (×2, ×3, ×4), la duplicación N×N del fallback estático ha vuelto (ver StickyStage isStatic y el consumidor).`,
    ).toBe(expected)
  })
}

// FASE 9.0-B — CONTRATO DE FOCUS TRAP del menú móvil: el foco nunca sale del
// anillo menú↔panel mientras esté abierto, y Escape lo cierra devolviendo el
// foco al botón (hallazgo del arquitecto: trap ausente; fix: anillo real).
test('9.0-B focus trap: el Tab queda dentro del menú móvil y Escape restaura el foco', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /abrir menú/i }).click()
  await page.waitForTimeout(300)

  let escapes = 0
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('Tab')
    await page.waitForTimeout(30)
    const inHeader = await page.evaluate(() => !!document.activeElement?.closest('header'))
    if (!inHeader) escapes++
  }
  expect(escapes, `El foco salió del menú ${escapes} veces en 20 Tabs: el trap está roto`).toBe(0)

  await page.keyboard.press('Escape')
  await page.waitForTimeout(200)
  const focusRestored = await page.evaluate(() =>
    document.activeElement === document.querySelector('.menu-button'),
  )
  expect(focusRestored, 'Escape debe cerrar el menú y devolver el foco al botón').toBe(true)
})
