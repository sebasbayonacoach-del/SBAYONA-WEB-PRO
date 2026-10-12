import { test, expect } from '@playwright/test'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const APP_ENTRY = '/mi-app/index.html?source=pwa'

for (const viewport of [{ name: 'desktop', width: 1440, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
  test('integrated app ' + viewport.name, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    const pageErrors = []
    page.on('pageerror', (error) => pageErrors.push(error.message))
    await page.goto(APP_ENTRY, { waitUntil: 'domcontentloaded' })
    await expect(page.locator('#bayona-auth-gate')).toBeVisible({ timeout: 15000 })
    await expect(page.getByRole('heading', { name: /donde lo dejaste/i })).toBeVisible()
    const state = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth - innerWidth, emailHeight: Math.round(document.querySelector('#auth-email')?.getBoundingClientRect().height || 0), passwordHeight: Math.round(document.querySelector('#auth-password')?.getBoundingClientRect().height || 0), forgotHeight: Math.round(document.querySelector('[data-auth-action="forgot"]')?.getBoundingClientRect().height || 0), googleHeight: Math.round(document.querySelector('[data-auth-action="google"]')?.getBoundingClientRect().height || 0) }))
    expect(pageErrors).toEqual([])
    expect(state.overflow).toBeLessThanOrEqual(1)
    expect(state.emailHeight).toBeGreaterThanOrEqual(44)
    expect(state.passwordHeight).toBeGreaterThanOrEqual(44)
    expect(state.forgotHeight).toBeGreaterThanOrEqual(44)
    expect(state.googleHeight).toBeGreaterThanOrEqual(44)
  })
}

test('integrated service worker scope', async ({ page }) => { await page.goto(APP_ENTRY); const scope = await page.evaluate(async () => { const registration = await navigator.serviceWorker.register('./sw.js'); const result = registration.scope; await registration.unregister(); return result }); expect(new URL(scope).pathname).toBe('/mi-app/') })

for (const legacy of ['/entrar', '/panel']) { test(legacy + ' forwards to integrated app', async ({ page }) => { await page.goto(legacy); await page.waitForURL(/\/mi-app\/index\.html\?source=pwa/, { timeout: 15000 }); await expect(page.locator('#bayona-auth-gate')).toBeVisible({ timeout: 15000 }) }) }

test('/app opens integrated product in same tab', async ({ page }) => { await page.goto('/app'); const primary = page.getByRole('link', { name: /ABRIR MI APP/i }).first(); await expect(primary).toHaveAttribute('href', APP_ENTRY); await expect(primary).not.toHaveAttribute('target', '_blank'); await expect(page.locator('.nav-app-entry')).toHaveAttribute('href', APP_ENTRY) })

test('integrated PWA uses explicit entries', async () => { const root = process.cwd(); const manifest = JSON.parse(readFileSync(join(root, 'public/mi-app/manifest.webmanifest'), 'utf8')); const source = JSON.parse(readFileSync(join(root, 'public/mi-app/BAYONA_APP_SOURCE.json'), 'utf8')); expect(manifest.start_url).toBe('./index.html?source=pwa'); expect(manifest.scope).toBe('./'); expect(source.mount).toBe('/mi-app/index.html'); expect(source.commit).toMatch(/^[a-f0-9]{40}$/) })

test('integrated static package excludes private local files', async () => { const root = join(process.cwd(), 'public/mi-app'); for (const file of ['.env', '.env.local', 'keystore.properties', 'mobile/android/bayona-release.keystore', '.git/config']) { expect(existsSync(join(root, file)), file).toBe(false) } })


test('header cambia de desktop a compacto sin colisiones', async ({ page }) => {
  await page.setViewportSize({ width: 1180, height: 800 })
  await page.goto('/')
  const tablet = await page.evaluate(() => {
    const brand = document.querySelector('.brand')?.getBoundingClientRect()
    const menu = document.querySelector('.menu-button')?.getBoundingClientRect()
    const app = getComputedStyle(document.querySelector('.nav-app-entry')).display
    return {
      brandWidth: Math.round(brand?.width || 0),
      overlap: Boolean(brand && menu && brand.right > menu.left && menu.right > brand.left),
      app,
    }
  })
  expect(tablet.brandWidth).toBeLessThan(200)
  expect(tablet.overlap).toBe(false)
  expect(tablet.app).toBe('none')

  await page.setViewportSize({ width: 1280, height: 800 })
  await page.reload()
  await expect(page.locator('.nav-app-entry')).toBeVisible()
  await expect(page.locator('.menu-button')).toBeHidden()
})
