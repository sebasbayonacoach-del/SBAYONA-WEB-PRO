import { test, expect } from '@playwright/test'

const CLIPS = [
  'broll-rio', 'movimiento-pov', 'skyline-espana', 'entorno-abierto',
  'ruta-urbana', 'arquitectura-deportiva', 'movimiento-entorno', 'campo-abierto',
]

test('WEB 4.0: ocho capítulos con posters independientes y vídeo bajo demanda', async ({ page }) => {
  await page.goto('/')
  const block = page.locator('#archivo-real')
  await expect(block.getByRole('heading', { name: /VIDA REAL.*EN MOVIMIENTO/s })).toBeVisible()
  await expect(block.locator('.bayona-real-archive__photo')).toHaveCount(0)
  await expect(block.locator('.bayona-real-archive__launch')).toHaveCount(8)
  await expect(block.locator('video')).toHaveCount(0)
  const posters = await block.locator('.bayona-real-archive__launch img')
    .evaluateAll((nodes) => nodes.map((img) => img.getAttribute('src')))
  expect(posters).toEqual(CLIPS.map((id) => `/images/bayona-authentic/${id}.webp`))
  expect(new Set(posters).size).toBe(8)

  await block.getByRole('button', { name: /Reproducir LA RUTA/i }).click()
  await expect(block.locator('video')).toHaveCount(1)
  await expect(block.locator('video')).toHaveAttribute('src', '/videos/bayona-authentic/broll-rio.mp4')
  await block.getByRole('button', { name: /Reproducir OTRA ALTURA/i }).click()
  await expect(block.locator('video')).toHaveCount(1)
  await expect(block.locator('video')).toHaveAttribute('src', '/videos/bayona-authentic/movimiento-pov.mp4')
})

test('WEB 4.0: vídeos y portadas responden desde el sitio', async ({ request }) => {
  for (const name of CLIPS) {
    const img = await request.get('/images/bayona-authentic/' + name + '.webp')
    expect(img.ok(), name + ' poster').toBe(true)
    const media = await request.get('/videos/bayona-authentic/' + name + '.mp4')
    expect(media.ok(), name + ' video').toBe(true)
    expect(media.headers()['content-type']).toContain('video/mp4')
  }
})

test('Móvil: galería navegable sin desbordamiento ni sonido al reproducir', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const archive = page.locator('#archivo-real')
  await expect(archive.locator('.bayona-real-archive__launch')).toHaveCount(8)
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1)
  await archive.getByRole('button', { name: /Reproducir LA RUTA/i }).click()
  await expect(archive.locator('video')).toHaveCount(1)
  expect(await archive.locator('video').evaluate((el) => el.muted)).toBe(true)
})

test('Nosotros no atribuye retratos no confirmados', async ({ page }) => {
  await page.goto('/about')
  await expect(page.locator('.about-founder__visual img')).toHaveAttribute('src', '/images/bayona-authentic/broll-rio.webp')
  await page.goto('/')
  await page.getByRole('button', { name: /O habla con Sebastián/i }).click()
  await expect(page.locator('.bayona-coach__portrait img')).toHaveCount(0)
  await expect(page.locator('.bayona-coach__portrait-brand')).toHaveText('SB')
})

test('El enlace directo lleva al archivo audiovisual', async ({ page }) => {
  await page.goto('/#archivo-real')
  await expect(page.locator('#archivo-real')).toBeVisible()
  await expect.poll(async () => page.locator('#archivo-real').evaluate((el) => el.getBoundingClientRect().top)).toBeLessThan(170)
})
