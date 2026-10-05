import { expect, test } from '@playwright/test'

test('desktop preview opens on focus/hover but the destination remains navigable',async({page})=>{
  await page.setViewportSize({width:1440,height:900})
  await page.goto('/',{waitUntil:'domcontentloaded'})
  const first = page.locator('.hero-tour-cta')
  await first.scrollIntoViewIfNeeded()
  await first.hover()
  const preview=page.locator('.bayona-preview-panel')
  await expect(preview).toBeVisible()
  await expect(preview).toContainText('EMPIEZA CON DIRECCIÓN')
  await expect(preview).toContainText('TU CONTEXTO')
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2)).toBe(false)
  await first.click()
  await expect(page).toHaveURL(/\/onboarding/)
})

test('mobile CTA opens accessible sheet before real navigation',async({page})=>{
  await page.setViewportSize({width:390,height:844})
  await page.goto('/',{waitUntil:'domcontentloaded'})
  const link=page.locator('.hero-tour-cta')
  await link.scrollIntoViewIfNeeded()
  await link.click()
  const modal=page.getByRole('dialog',{name:'Vista previa del destino'})
  await expect(modal).toBeVisible()
  await expect(page).toHaveURL(/\/$/)
  await expect(modal.getByRole('link',{name:/ABRIR DESTINO/})).toHaveAttribute('href','/onboarding')
  await page.keyboard.press('Escape')
  await expect(modal).toHaveCount(0)
  await link.click()
  await modal.getByRole('link',{name:/ABRIR DESTINO/}).click()
  await expect(page).toHaveURL(/\/onboarding/)
})

test('chapter CTAs and downloadable resources point to real destinations',async({page})=>{
  await page.setViewportSize({width:390,height:844})
  await page.goto('/',{waitUntil:'domcontentloaded'})
  await expect(page.getByRole('progressbar')).toHaveCount(0)

  await expect(page.locator('.hero-tour-cta')).toHaveAttribute('href','/onboarding')
  await expect(page.locator('.final-doors .cta-primary')).toHaveAttribute('href','/onboarding')
  await expect(page.locator('.final-doors .cta-secondary')).toHaveAttribute('href','/programs')

  const downloads=page.locator('.journey-library a[download]')
  await expect(downloads).toHaveCount(4)
  const hrefs=await downloads.evaluateAll(nodes=>nodes.map(node=>node.getAttribute('href')))
  expect(hrefs).toEqual([
    '/downloads/bayona-editorial/primera-semana.pdf',
    '/downloads/bayona-editorial/registro-30-dias.pdf',
    '/downloads/bayona-editorial/movilidad-y-habitos.pdf',
    '/downloads/bayona-editorial/dossier-punto-de-partida.pdf',
  ])
})

test('photographic method remains readable without WebGL', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 950 })
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (/^(webgl2?|experimental-webgl)$/.test(type)) return null
      return getContext.call(this, type, ...args)
    }
  })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const stage = page.locator('.immersive-method-stage')
  await stage.scrollIntoViewIfNeeded()
  const range = await stage.evaluate(el => ({
    top: el.getBoundingClientRect().top + scrollY,
    travel: el.getBoundingClientRect().height - el.querySelector('.sticky-stage-viewport').getBoundingClientRect().height,
  }))
  await page.evaluate(y => scrollTo(0, y), range.top + range.travel * .52)
  const photo = stage.locator('.bayona-voyage-photographic-layer')
  await expect.poll(() => photo.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true)
  await expect(stage.locator('.immersive-method-act__copy h3')).toBeVisible()
  const box = await photo.boundingBox()
  expect(box.width).toBeGreaterThanOrEqual(1438)
  expect(box.height).toBeGreaterThan(500)
  await page.locator('.luxury-closing').scrollIntoViewIfNeeded()
  await expect(page.locator('.final-doors').getByRole('link', { name: /CONTINUAR CON MI RECORRIDO/i })).toBeVisible()
  await expect(page.locator('.journey-gift-form')).toBeVisible()
  await expect(page.locator('canvas')).toHaveCount(0)
  expect(errors).toEqual([])
})
