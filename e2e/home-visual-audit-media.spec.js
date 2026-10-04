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

    for (const [selector, imageSelector] of [
      ['.immersive-method-stage', '.bayona-voyage-photographic-layer'],
      ['.proof-process-stage', '.proof-process-photo img'],
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
      expect(display.width).toBeGreaterThan(50)
      expect(display.height).toBeGreaterThan(50)
      expect(display.opacity).toBeGreaterThan(0)
    }

    const benefits = page.locator('.benefits-orbit-stage')
    await benefits.scrollIntoViewIfNeeded()
    const photographicBackground = benefits.locator('.bayona-benefits-photographic-layer').first()
    await expect(photographicBackground).toBeAttached()
    const background = await photographicBackground.evaluate(el => getComputedStyle(el).backgroundImage)
    expect(background).toContain('/images/burst/')
    expect(background).toContain('.webp')
    // The design contract intentionally forbids <img> tags in this benefits section.
    await expect(benefits.locator('img')).toHaveCount(0)
    const imageUrl = background.match(/url\(["']?(.*?)["']?\)/)?.[1]?.replace(/["']/g, '')
    expect(imageUrl).toBeTruthy()
    expect((await page.request.get(imageUrl)).ok()).toBe(true)

    const offers = page.locator('.home-memberships-section')
    await offers.scrollIntoViewIfNeeded()
    expect(await offers.evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(8, 9, 12)')
    const offerHeading = offers.locator('#home-offer-heading')
    await expect(offerHeading).toBeAttached()
    expect(await offerHeading.evaluate(el => getComputedStyle(el).color)).toBe('rgb(247, 247, 243)')

    const proof = page.locator('.proof-section')
    await expect(proof).toHaveAttribute('data-evidence-gate', 'empty')
    await expect(proof.getByText('PROCESO ILUSTRADO · NO EVIDENCIA DE RESULTADOS').first()).toBeAttached()

    const closing = page.locator('.home-about-bridge')
    await closing.scrollIntoViewIfNeeded()
    const paragraph = closing.locator('.bayona-final-narrative > .offer-intro')
    await expect(paragraph).toBeVisible()
    expect(await paragraph.evaluate(el => getComputedStyle(el).opacity)).toBe('1')
    await page.evaluate(() => scrollBy(0, -300))
    await page.waitForTimeout(100)
    expect(await paragraph.evaluate(el => getComputedStyle(el).opacity)).toBe('1')
    await expect(closing.getByRole('link', { name: /COMPARAR PROGRAMAS/i })).toHaveAttribute('href', '/programs')

    const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2)
    expect(horizontalOverflow).toBe(false)
    expect(broken).toEqual([])
    expect(errors).toEqual([])
    await page.screenshot({ path: `test-results/playwright/home-visual-audit/final-${viewport.width}.png` })
  })
}

test('cinematic 30 day challenge displays a real image without hiding its resources action', async ({ page }) => {
  await page.setViewportSize({ width: 726, height: 950 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const stage = page.locator('.free-dossier-stage')
  await stage.scrollIntoViewIfNeeded()
  const metrics = await stage.evaluate(el => ({
    start: el.getBoundingClientRect().top + scrollY,
    travel: el.getBoundingClientRect().height - el.querySelector('.sticky-stage-viewport').getBoundingClientRect().height,
  }))
  await page.evaluate(y => scrollTo(0, y), metrics.start + metrics.travel * .39)
  const photo = stage.locator('.free-dossier-viewport[data-piece="reto"] .bayona-challenge-screen__hero')
  await expect(photo).toBeAttached()
  await expect.poll(() => photo.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true)
  await expect(stage.getByRole('link', { name: /VER CONDICIONES/i })).toHaveAttribute('href', '/resources')
})
