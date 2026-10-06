import { expect, test } from '@playwright/test'

for (const viewport of [
  { width: 390, height: 844 },
  { width: 726, height: 950 },
  { width: 1440, height: 900 },
]) {
  test(`real imagery and consistent chapter handoff at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    const errors = [], broken = []
    page.on('pageerror', e => errors.push(e.message))
    page.on('response', r => {
      if (r.request().resourceType() === 'image' && r.status() >= 400) broken.push(r.url())
    })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    // Capturar la experiencia lista, después de la salida del overlay inicial.
    await expect(page.getByRole('progressbar')).toHaveCount(0)
    await expect(page.locator('.hero-tour-cta')).toBeVisible()

    await page.screenshot({ path: `test-results/playwright/home-visual-audit/hero-${viewport.width}.png` })

    for (const [selector, imageSelector] of [
      ['.immersive-method-stage', '.bayona-voyage-photographic-layer'],
      ['.proof-process-stage', '.photo-story-background'],
      ['.home-about-bridge', '.bayona-final-visual img'],
    ]) {
      const stage = page.locator(selector)
      await stage.scrollIntoViewIfNeeded()
      const image = stage.locator(imageSelector).first()
      await expect(image).toBeAttached()
      await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true)
      const display = await image.evaluate(img => {
        const r = img.getBoundingClientRect()
        const opacity = Number(getComputedStyle(img).opacity)
        return { width: r.width, height: r.height, opacity }
      })
      expect(display.width).toBeGreaterThanOrEqual(viewport.width - 2)
      expect(display.height).toBeGreaterThan(500)
      expect(display.opacity).toBe(1)
      const surface = await stage.locator('.sticky-stage-viewport').count() ? stage.locator('.sticky-stage-viewport') : stage.locator('.sticky-stage-frame').first()
      if (await surface.count()) await surface.screenshot({ path: `test-results/playwright/home-visual-audit/${selector.slice(1)}-${viewport.width}.png` })
    }

    const benefits = page.locator('.benefits-orbit-stage')
    await benefits.scrollIntoViewIfNeeded()
    const photographicBackground = benefits.locator('.bayona-benefits-photographic-layer').first()
    await expect(photographicBackground).toBeAttached()
    const background = await photographicBackground.evaluate(el => getComputedStyle(el).backgroundImage)
    expect(background).toContain('/images/bayona-generated/')
    expect(background).toContain('.webp')
    // The design contract intentionally forbids <img> tags in this benefits section.
    await expect(benefits.locator('img')).toHaveCount(0)
    const imageUrl = background.match(/url\(["']?(.*?)["']?\)/)?.[1]?.replace(/["']/g, '')
    expect(imageUrl).toBeTruthy()
    expect((await page.request.get(imageUrl)).ok()).toBe(true)

    const offers = page.locator('.home-memberships-section')
    await offers.scrollIntoViewIfNeeded()
    expect(await offers.evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(16, 19, 16)')
    const offerHeading = offers.locator('#home-offer-heading')
    await expect(offerHeading).toBeAttached()
    expect(await offerHeading.evaluate(el => getComputedStyle(el).color)).toBe('rgb(247, 247, 243)')

    const proof = page.locator('.proof-section')
    await expect(proof).toHaveAttribute('data-evidence-gate', 'empty')
    await expect(proof.getByText('DOCUMENTO ILUSTRATIVO · NO EVIDENCIA DE RESULTADOS').first()).toBeAttached()

    const closing = page.locator('.home-about-bridge')
    await closing.scrollIntoViewIfNeeded()
    await expect(closing.getByRole('heading', { name: /TU PRÓXIMA SEMANA/i })).toBeVisible()
    await expect(closing.locator('.journey-gift-form')).toBeVisible()
    await expect(closing.getByRole('button', { name: /PREPARAR MI PUNTO DE PARTIDA/i })).toBeVisible()
    await expect(closing.getByRole('link', { name: /CONTINUAR CON MI RECORRIDO/i })).toHaveAttribute('href', '/onboarding')
    await expect(closing.getByRole('link', { name: /COMPARAR PROGRAMAS/i })).toHaveAttribute('href', '/programs')
    await expect(closing.locator('a[download][href$="dossier-punto-de-partida.pdf"]')).toBeAttached()

    const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2)
    expect(horizontalOverflow).toBe(false)
    expect(broken).toEqual([])
    expect(errors).toEqual([])
    await page.screenshot({ path: `test-results/playwright/home-visual-audit/final-${viewport.width}.png` })
  })
}

test('30 day resource has its own photographic presentation and real PDF', async ({ page }) => {
  await page.setViewportSize({ width: 726, height: 950 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const library = page.locator('.journey-library')
  await library.scrollIntoViewIfNeeded()
  const card = library.locator('.journey-library-entry[data-piece="reto"]')
  await expect(card).toBeVisible()
  const photo = card.locator('.journey-library-preview img')
  await expect.poll(() => photo.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true)
  await expect(card.locator('.journey-library-preview-sheet')).toContainText('30 días, por escrito.')
  await expect(card).toHaveAttribute('href', '/downloads/bayona-editorial/registro-30-dias.pdf')
  await expect(card).toHaveAttribute('download', '')
})

for (const width of [390, 1440]) {
  test(`four distinct resource presentations remain readable with reduced motion at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    const library = page.locator('.journey-library')
    await library.scrollIntoViewIfNeeded()
    const cards = library.locator('.journey-library-entry')
    await expect(cards).toHaveCount(4)

    const expectedDownloads = [
      '/downloads/bayona-editorial/primera-semana.pdf',
      '/downloads/bayona-editorial/registro-30-dias.pdf',
      '/downloads/bayona-editorial/movilidad-y-habitos.pdf',
      '/downloads/bayona-editorial/dossier-punto-de-partida.pdf',
    ]
    const sources = new Set()

    for (let i = 0; i < 4; i++) {
      const card = cards.nth(i)
      await card.scrollIntoViewIfNeeded()
      const photo = card.locator('.journey-library-preview img')
      await expect.poll(() => photo.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true)
      sources.add(await photo.getAttribute('src'))
      const imageBox = await photo.boundingBox()
      expect(imageBox.width).toBeGreaterThan(100)
      expect(imageBox.height).toBeGreaterThan(120)
      const sheet = card.locator('.journey-library-preview-sheet')
      await expect(sheet).toBeVisible()
      const title = await sheet.locator('strong').boundingBox()
      expect(title.x).toBeGreaterThanOrEqual(0)
      expect(title.x + title.width).toBeLessThanOrEqual(width + 1)
      await expect(card).toHaveAttribute('href', expectedDownloads[i])
      await expect(card).toHaveAttribute('download', '')
      await card.screenshot({ path: `test-results/playwright/home-visual-audit/resource-${i}-${width}.png` })
    }

    expect(sources.size).toBe(4)
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2)).toBe(false)

    const stage = page.locator('.free-dossier-stage')
    if (width > 768) {
      await expect(stage).toHaveClass(/sticky-stage--static/)
      await expect(stage.locator('.sticky-stage-frame')).toHaveCount(4)
    } else {
      await expect(stage).toHaveCount(0)
    }
  })
}
