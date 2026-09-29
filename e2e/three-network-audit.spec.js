// Auditoría de red del coste 3D — Fase 7A, Bloque E.
//
// PROPÓSITO: demostrar por OBSERVACIÓN DE RED, no por grep, qué rutas de BAYONA
// solicitan chunks de Three.js / R3F / drei / postprocessing.
//
// Este spec NO es solo una medición: es un CONTRATO. Si en el futuro alguien
// monta una escena en una ruta sin pasar por el gate de admisión, este test se
// pone rojo. Esa es su función principal.
//
// La detección es DOBLE, a propósito:
//   1) por NOMBRE de chunk (vendor-three, SignatureScene, Scene3D)
//   2) por TAMAÑO anómalo de cualquier JS (un chunk >150 kB que no esté en la
//      lista blanca conocida es sospechoso y hay que mirarlo)
// Auditar solo por nombre es frágil: si cambia la política de manualChunks,
// Three.js puede acabar en un chunk con otro nombre y volverse invisible.
//
// Fase 7B: la fuga 7A-01 (entry importando vendor-three estáticamente vía
// Loader→drei) fue ERRADICADA. La aserción dura está reactivada como contrato
// permanente: ninguna ruta puede solicitar chunks 3D sin registro de admisión
// aprobado en 3D-ADMISSION-RECORD.md.

import { test, expect } from '@playwright/test'
import { writeFileSync, mkdirSync } from 'node:fs'

const ROUTES = [
  '/',
  '/about',
  '/programs',
  '/parkour-academy',
  '/plan/raiz',
  '/plan/fuerza',
  '/plan/rendimiento',
  '/plan/elite',
  '/resources',
  '/shop',
  '/app',
  '/community',
  '/onboarding',
  '/checkout',
  '/faq',
  '/order-confirmation',
  '/design-system',
  '/ruta-que-no-existe',
]

// Firmas de chunk 3D por nombre.
const THREE_NAME_PATTERNS = [
  /vendor-three/i,
  /SignatureScene/i,
  /Scene3D/i,
  /three/i,
  /react-three/i,
  /drei/i,
  /postprocessing/i,
]

// Umbral de sospecha por tamaño (bytes transferidos de un solo JS).
const SUSPICIOUS_JS_BYTES = 150 * 1024

const evidence = []

for (const route of ROUTES) {
  test(`red: ${route} — inventario de chunks 3D`, async ({ page }) => {
    const requests = []
    const responses = []

    page.on('request', (req) => {
      requests.push({ url: req.url(), type: req.resourceType(), method: req.method() })
    })

    page.on('response', async (res) => {
      const req = res.request()
      let bytes = null
      try {
        const h = res.headers()
        bytes = h['content-length'] ? Number(h['content-length']) : null
      } catch { /* noop */ }
      responses.push({
        url: req.url(),
        type: req.resourceType(),
        status: res.status(),
        bytes,
        encoding: (res.headers()['content-encoding'] ?? 'none'),
      })
    })

    const consoleErrors = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })
    const pageErrors = []
    page.on('pageerror', (err) => pageErrors.push(String(err?.message ?? err)))

    await page.goto(route, { waitUntil: 'networkidle' })

    // Recorre la página entera: una escena podría montarse por scroll,
    // no solo al cargar. Si no bajas, no lo ves.
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.8
      const total = document.body.scrollHeight
      for (let y = 0; y < total; y += step) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 120))
      }
      window.scrollTo(0, 0)
      await new Promise((r) => setTimeout(r, 200))
    })
    await page.waitForLoadState('networkidle')

    const js = responses.filter((r) => r.type === 'script' || /\.js(\?|$)/.test(r.url))
    const css = responses.filter((r) => r.type === 'stylesheet' || /\.css(\?|$)/.test(r.url))

    const threeByName = js.filter((r) => THREE_NAME_PATTERNS.some((p) => p.test(r.url)))
    const bigUnknown = js.filter((r) => (r.bytes ?? 0) > SUSPICIOUS_JS_BYTES)

    const external = responses.filter((r) => {
      try {
        const u = new URL(r.url)
        return !['localhost', '127.0.0.1'].includes(u.hostname)
      } catch { return false }
    })

    evidence.push({
      route,
      totalRequests: requests.length,
      jsCount: js.length,
      cssCount: css.length,
      jsBytes: js.reduce((s, r) => s + (r.bytes ?? 0), 0),
      cssBytes: css.reduce((s, r) => s + (r.bytes ?? 0), 0),
      threeByName: threeByName.map((r) => ({ url: r.url, bytes: r.bytes })),
      bigUnknown: bigUnknown.map((r) => ({ url: r.url, bytes: r.bytes })),
      external: external.map((r) => ({ url: r.url, status: r.status, bytes: r.bytes })),
      consoleErrors,
      pageErrors,
      jsUrls: js.map((r) => r.url),
    })

    // CONTRATO ACTIVO (Fase 7B): con la fuga 7A-01 erradicada (Loader sin drei,
    // barrel sin escenas, manualChunks por función), NINGUNA ruta puede solicitar
    // chunks 3D. Si este test se pone rojo en el futuro, es porque alguien montó
    // o arrastró una escena/dependencia 3D sin pasar por el gate de admisión:
    // buscar su 3D-ADMISSION-RECORD.md o la cadena de imports estática nueva.
    expect(
      threeByName,
      `La ruta ${route} solicitó chunks 3D: ${JSON.stringify(threeByName, null, 2)}`,
    ).toHaveLength(0)

    // La página no debe reventar en ninguna ruta.
    expect(
      pageErrors,
      `Errores de página en ${route}: ${pageErrors.join(' | ')}`,
    ).toHaveLength(0)
  })
}

// ESCRITURA DE EVIDENCIA (gobernanza 9.2-C): artifacts/fase7a está CONGELADO
// como evidencia histórica de Fase 7A (fuga 7A-01 viva, 18/18 rutas, restaurada
// desde 438ba3b). Cada corrida "latest" escribe en artifacts/latest/ (scratch,
// gitignored) y SOLO se promue a namespace de fase con EVIDENCE_NAMESPACE=<dir>
// (p. ej. EVIDENCE_NAMESPACE=artifacts/fase9/9.2-b npx playwright test -c
// playwright.f7a.config.js). Sin la env-var, ninguna corrida toca evidencia
// histórica — el freeze de fase7a es verificable en fase7aSceneGovernance.
const EVIDENCE_DIR = process.env.EVIDENCE_NAMESPACE || 'artifacts/latest'

test.afterAll(() => {
  mkdirSync(EVIDENCE_DIR, { recursive: true })
  writeFileSync(
    `${EVIDENCE_DIR}/network-audit.json`,
    JSON.stringify(evidence, null, 2),
    'utf8',
  )
})
