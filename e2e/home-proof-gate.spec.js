import { expect, test } from '@playwright/test'

// Sin testimonios aprobados, Home debe enseñar el proceso real.
// Esta prueba protege la sección visible y la separación entre proceso y evidencia.
for (const viewport of [
  { id: 'mobile-390', width: 390, height: 844 },
  { id: 'desktop-1440', width: 1440, height: 900 },
]) {
  test(`Home muestra EXPERIENCIA sin testimonios falsos (${viewport.id})`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    const proof = page.locator('[data-evidence-gate="empty"]')
    await expect(proof).toBeVisible()
    await expect(proof.locator('.proof-process-immersive')).toBeVisible()
    await expect(proof.locator('.proof-process-list > li')).toHaveCount(3)
    await expect(proof.locator('.evidence-list')).toHaveCount(0)

    const box = await proof.boundingBox()
    expect(box, 'La sección debe ocupar espacio visible, no 1 px de sr-only').not.toBeNull()
    expect(box.height).toBeGreaterThan(100)

    await proof.scrollIntoViewIfNeeded()
    await page.screenshot({
      path: `test-results/playwright/proof/proof-${viewport.id}.jpg`,
      type: 'jpeg',
      quality: 68,
    })
  })
}

test('Home: las fotografías de proceso ocupan el fondo y los pasos permanecen legibles', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  const stage = page.locator('[data-evidence-gate="empty"] .proof-process-stage')
  await expect(stage).toHaveClass(/sticky-stage--static/)
  const frames = stage.locator('.sticky-stage-frame')
  await expect(frames).toHaveCount(3)

  for (let index = 0; index < 3; index += 1) {
    const frame = frames.nth(index)
    await expect(frame.locator('.proof-process-visual')).toBeVisible()
    const image = frame.locator('.photo-story-background')
    await expect(image).toBeVisible()
    expect((await image.boundingBox()).width).toBeGreaterThanOrEqual(388)
    await expect(frame.locator('.proof-process-copy')).toBeVisible()
    const title = await frame.locator('.proof-process-copy h3').boundingBox()
    expect(title).not.toBeNull()
    expect(title.width).toBeGreaterThan(160)
    expect(title.x).toBeGreaterThanOrEqual(0)
    expect(title.x + title.width).toBeLessThanOrEqual(390)
  }
})

test('Home: el texto introductorio no pisa el primer paso en móvil', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  const proof = page.locator('[data-evidence-gate="empty"]')
  const intro = await proof.locator('.proof-process-intro > span').boundingBox()
  const firstTitle = await proof.locator('.proof-process-copy h3').first().boundingBox()
  expect(intro).not.toBeNull()
  expect(firstTitle).not.toBeNull()
  expect(firstTitle.y, `intro bottom=${intro.y + intro.height}, title top=${firstTitle.y}`)
    .toBeGreaterThanOrEqual(intro.y + intro.height + 8)
})

test('Home: móvil sin reducción de movimiento también utiliza la pila legible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  const stage = page.locator('[data-evidence-gate="empty"] .proof-process-stage')
  await expect(stage).toHaveClass(/sticky-stage--static/)
  await expect(stage.locator('.sticky-stage-frame')).toHaveCount(3)
})
