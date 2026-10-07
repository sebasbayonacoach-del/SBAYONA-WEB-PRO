import { expect, test } from '@playwright/test'

const VIEWPORTS = [
  { id: 'mobile-390', width: 390, height: 844 },
  { id: 'desktop-1440', width: 1440, height: 900 },
]

for (const viewport of VIEWPORTS) {
  test('Home V2 explica confianza sin fabricar prueba social (' + viewport.id + ')', async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto('/', { waitUntil: 'networkidle' })

    const trust = page.locator('.gym-home-trust')
    await expect(trust).toBeVisible()
    await expect(trust.getByRole('heading', { name: /SABES QUÉ HACES Y POR QUÉ/i })).toBeVisible()
    await expect(trust.locator('li')).toHaveCount(4)

    const copy = await page.locator('.gym-home').innerText()
    expect(copy).not.toMatch(/personas transformadas|casos de éxito|resultados garantizados|AÚN NO HAY TESTIMONIOS/i)
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 3)).toBe(false)
  })
}

test('Home V2 mantiene tres pasos de inicio legibles en móvil', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/', { waitUntil: 'networkidle' })

  const process = page.locator('.gym-home-process')
  await process.scrollIntoViewIfNeeded()
  await expect(process.locator('.gym-process-grid > li')).toHaveCount(3)

  const boxes = await process.locator('.gym-process-grid > li').evaluateAll((nodes) =>
    nodes.map((node) => {
      const rect = node.getBoundingClientRect()
      return { left: rect.left, right: rect.right, width: rect.width }
    }),
  )

  for (const box of boxes) {
    expect(box.width).toBeGreaterThan(200)
    expect(box.left).toBeGreaterThanOrEqual(-1)
    expect(box.right).toBeLessThanOrEqual(391)
  }
})

test('Home V2 mantiene el proceso completo con reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/', { waitUntil: 'networkidle' })

  await expect(page.locator('.gym-process-grid > li')).toHaveCount(3)
  await expect(page.locator('.gym-service-card')).toHaveCount(4)
  await expect(page.locator('.gym-gift-card')).toHaveCount(3)
})
