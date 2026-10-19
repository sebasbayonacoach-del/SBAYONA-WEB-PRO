import { test, expect } from '@playwright/test'

test('BAYONA reproduce un solo clip seleccionado sin autoplay', async ({ page }) => {
  await page.goto('/')
  const archive = page.locator('#archivo-real')
  await expect(archive.getByRole('heading', { name: /VIDA REAL.*MOVIMIENTO REAL/s })).toBeVisible()
  await expect(archive.locator('video')).toHaveCount(1)
  await expect(archive.locator('video')).toHaveAttribute('src', '/videos/bayona-authentic/broll-rio.mp4')
  await expect(archive.getByRole('button', { name: /Seleccionar vídeo 01/ })).toHaveAttribute('aria-pressed', 'true')
  await archive.getByRole('button', { name: /Seleccionar vídeo 03/ }).click()
  await expect(archive.locator('video')).toHaveAttribute('src', '/videos/bayona-authentic/movimiento-pov.mp4')
  await expect(archive.getByRole('button', { name: /Seleccionar vídeo 03/ })).toHaveAttribute('aria-pressed', 'true')
  expect(await archive.locator('video').evaluate(v => ({ muted: v.muted, autoplay: v.autoplay, preload: v.preload })))
    .toEqual({ muted: true, autoplay: false, preload: 'none' })
})

test('Cada imagen y vídeo del archivo se sirve desde recursos propios', async ({ request }) => {
  for (const name of ['broll-rio', 'movimiento-entorno', 'movimiento-pov']) {
    const poster = await request.get('/images/bayona-authentic/' + name + '.webp')
    expect(poster.ok(), name + ' poster').toBe(true)
    const clip = await request.get('/videos/bayona-authentic/' + name + '.mp4')
    expect(clip.ok(), name + ' video').toBe(true)
    expect(clip.headers()['content-type']).toContain('video/mp4')
  }
  const landscape = await request.get('/images/bayona-authentic/recorrido-montana-2026-02-23.jpg')
  expect(landscape.ok()).toBe(true)
})

test('No se presenta como fundador el retrato descartado', async ({ page }) => {
  await page.goto('/about')
  await expect(page.locator('.about-founder__monogram')).toHaveText('SB.')
  await expect(page.locator('.about-founder__visual img')).toHaveCount(0)
  await page.goto('/')
  await page.getByRole('button', { name: /O habla con Sebastián/i }).click()
  await expect(page.locator('.bayona-coach__portrait-brand')).toHaveText('SB')
  await expect(page.locator('.bayona-coach__portrait img')).toHaveCount(0)
  await expect(page.locator('img[src*="selfie-exterior-2026-04-11"]')).toHaveCount(0)
})

test('Móvil: selección usable sin desbordamiento ni reproducción automática', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const archive = page.locator('#archivo-real')
  await expect(archive.getByRole('button', { name: /Seleccionar vídeo 02/ })).toBeAttached()
  await archive.getByRole('button', { name: /Seleccionar vídeo 02/ }).click()
  await expect(archive.locator('video')).toHaveAttribute('src', '/videos/bayona-authentic/movimiento-entorno.mp4')
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1)
})

test('El enlace profundo al archivo real mantiene el salto al bloque', async ({ page }) => {
  await page.goto('/#archivo-real')
  await expect(page.locator('#archivo-real')).toBeVisible()
  await expect.poll(async () => page.locator('#archivo-real').evaluate(el => el.getBoundingClientRect().top)).toBeLessThan(170)
})
