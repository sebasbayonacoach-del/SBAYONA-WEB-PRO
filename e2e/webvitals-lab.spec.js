// Web Vitals de LABORATORIO — Fase 7A, Bloque E2.
//
// AVISO METODOLÓGICO OBLIGATORIO: estos números son de laboratorio, en un
// navegador headless, en esta máquina, con esta red. NO son datos de campo
// (CrUX) y NO son sustituto de Lighthouse. Sirven para COMPARAR antes/después
// dentro de la misma sesión. Nada más. Etiquetarlos "MEDIDO (laboratorio)".

import { test, expect } from '@playwright/test'
import { writeFileSync, mkdirSync } from 'node:fs'

const ROUTES = ['/', '/about', '/programs', '/parkour-academy', '/checkout']
const results = []

for (const route of ROUTES) {
  test(`vitals lab: ${route}`, async ({ page }) => {
    await page.addInitScript(() => {
      window.__vitals = { lcp: null, cls: 0, shifts: [], longTasks: [], fcp: null }

      try {
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) window.__vitals.lcp = e.startTime
        }).observe({ type: 'largest-contentful-paint', buffered: true })
      } catch { /* noop: observer no soportado aqui */ }

      try {
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            if (!e.hadRecentInput) {
              window.__vitals.cls += e.value
              window.__vitals.shifts.push({ value: e.value, time: e.startTime })
            }
          }
        }).observe({ type: 'layout-shift', buffered: true })
      } catch { /* noop: observer no soportado aqui */ }

      try {
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            window.__vitals.longTasks.push({ dur: e.duration, start: e.startTime })
          }
        }).observe({ type: 'longtask', buffered: true })
      } catch { /* noop: observer no soportado aqui */ }

      try {
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            if (e.name === 'first-contentful-paint') window.__vitals.fcp = e.startTime
          }
        }).observe({ type: 'paint', buffered: true })
      } catch { /* noop: observer no soportado aqui */ }
    })

    await page.goto(route, { waitUntil: 'networkidle' })

    // Scroll completo: CLS y LCP pueden cambiar al recorrer la página.
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.8
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 150))
      }
    })
    await page.waitForTimeout(500)

    const v = await page.evaluate(() => window.__vitals)
    const nav = await page.evaluate(() => {
      const [n] = performance.getEntriesByType('navigation')
      return n ? { domContentLoaded: n.domContentLoadedEventEnd, load: n.loadEventEnd, transfer: n.transferSize, decoded: n.decodedBodySize } : null
    })

    results.push({ route, ...v, nav })

    // No se asertan umbrales: esta fase MIDE, no impone presupuesto de vitals.
    expect(v).toBeTruthy()
  })
}

// ESCRITURA DE EVIDENCIA (gobernanza 9.2-C): artifacts/fase7a está CONGELADO
// como evidencia histórica de Fase 7A (restaurada desde 438ba3b). Cada corrida
// "latest" escribe en artifacts/latest/ (scratch, gitignored) y SOLO se promue
// a namespace de fase con EVIDENCE_NAMESPACE=<dir> (p. ej. EVIDENCE_NAMESPACE=
// artifacts/fase9/9.2-b). Sin la env-var, ninguna corrida toca evidencia
// histórica — el freeze de fase7a es verificable en fase7aSceneGovernance.
const EVIDENCE_DIR = process.env.EVIDENCE_NAMESPACE || 'artifacts/latest'

test.afterAll(() => {
  mkdirSync(EVIDENCE_DIR, { recursive: true })
  writeFileSync(`${EVIDENCE_DIR}/webvitals-lab.json`, JSON.stringify(results, null, 2), 'utf8')
})
