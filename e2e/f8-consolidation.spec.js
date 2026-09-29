// Verificación de consolidación Fase 8 (auditoría de continuidad, prompt de
// consolidación premium): confirma en EJECUCIÓN REAL (build + preview) que los
// cuatro lenguajes narrativos existen en el DOM servido, no solo en el código
// fuente. Es de lectura: nada de assertions de snapshot.

import { test, expect } from '@playwright/test'

const CHECKS = [
  {
    route: '/',
    name: 'H — el hero respira (partículas + drift)',
    selector: '.hero-particles span',
    css: 'hero-particle-drift',
  },
  {
    route: '/',
    name: 'E — el método se recorre (sticky stage)',
    selector: '.mechanism-steps--stage',
    css: null,
  },
  {
    route: '/parkour-academy',
    name: 'F — la escalera (sticky vertical)',
    selector: '.academy-level-grid--stage',
    css: null,
  },
  {
    route: '/about',
    name: 'G — la línea de vida (sello de año)',
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

// Auditoría de ritmo mobile: los 3 sticky degradan a pila estática (clase
// .sticky-stage--static) en viewport móvil — verificar que la degradación
// existe de verdad en el DOM móvil, no solo en teoría.
test('consolidación: móvil degrada los sticky a pila estática (sin altura artificial)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const staticMode = await page.locator('.sticky-stage--static').count()
  expect(staticMode, 'En móvil el StickyStage debería renderizar la pila estática legible').toBeGreaterThan(0)
})

// ─────────────────────────────────────────────────────────────────────────────
// FASE 9.0-A — CONTRATO DE CARDINALIDAD DEL FALLBACK MÓVIL (regresión del
// hallazgo del arquitecto: duplicación N×N). Antes del fix, cada frame
// estático pintaba TODOS los estados: Home 3×3=9, Parkour 3×3=9, About
// 4×4=16 bloques VISIBLES en 390px. El contrato isStatic de StickyStage
// (isStatic=true => el frame pinta SOLO su estado) es lo que este test
// protege: exactamente N elementos por página, jamás N×N.
// ─────────────────────────────────────────────────────────────────────────────
const CARDINALITY = [
  { route: '/', selector: '.mechanism-step--stage', expected: 3, label: 'pasos del método' },
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
