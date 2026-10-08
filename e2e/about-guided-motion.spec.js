import { test, expect } from '@playwright/test'

const chapterIds = ['about-purpose-title','la-persona','el-recorrido','el-mundo','nuestros-valores','el-metodo','empezar']

test('El recorrido de Nosotros tiene siete capítulos accesibles y ordenados', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/about', {waitUntil:'networkidle'})
  const links = page.getByRole('navigation', { name: 'Recorrido de Nosotros' }).getByRole('link')
  await expect(links).toHaveCount(7)
  const positions = []
  for (const [index,id] of chapterIds.entries()) {
    await expect(links.nth(index)).toHaveAttribute('href', `#${id}`)
    const element = page.locator(`#${id}`)
    await expect(element).toHaveCount(1)
    positions.push(await element.evaluate(e => e.getBoundingClientRect().top + window.scrollY))
  }
  expect(positions.every((x, i) => i === 0 || x >= positions[i - 1] - 5)).toBe(true)
  await links.nth(3).click()
  await expect(page).toHaveURL(/#el-mundo$/)
  await expect(page.locator('.globe-testimonials-canvas')).toBeVisible()
})

test('Globo documental de GSAP permanece fijado y narra cuatro etapas al avanzar', async ({ page }) => {
  await page.setViewportSize({width:1440,height:900})
  await page.emulateMedia({reducedMotion:'no-preference'})
  await page.goto('/about', {waitUntil:'networkidle'})
  await expect(page.locator('.globe-scroll-story__chapter')).toHaveCount(4)
  const stage = page.locator('.globe-testimonials-stage')
  await stage.scrollIntoViewIfNeeded()
  await expect.poll(() => stage.evaluate(el => Boolean(el.closest('.pin-spacer')))).toBe(true)
  const pinned = await stage.evaluate(el => {
    const r = el.closest('.pin-spacer').getBoundingClientRect()
    return {top:r.top + scrollY, height:r.height}
  })
  const steps = []
  for (const fraction of [.16,.36,.64,.84]) {
    await page.evaluate(y=>window.scrollTo(0,y), pinned.top + pinned.height * fraction)
    await page.waitForTimeout(900)
    steps.push(await stage.getAttribute('data-story-step'))
  }
  expect(new Set(steps.filter(Boolean)).size).toBeGreaterThanOrEqual(2)
  await expect(page.locator('.globe-scroll-story__chapter').last()).toBeAttached()
  const noOverflow = await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)
  expect(noOverflow).toBeLessThanOrEqual(3)
})

test('Móvil y movimiento reducido conservan las cuatro escenas legibles sin fijar la pantalla', async ({page})=>{
  for (const [width,motion] of [[390,'no-preference'],[1440,'reduce']]) {
    await page.setViewportSize({width,height:width===390?844:900})
    await page.emulateMedia({reducedMotion:motion})
    await page.goto('/about',{waitUntil:'networkidle'})
    const chapters=page.locator('.globe-scroll-story__chapter')
    await expect(chapters).toHaveCount(4)
    for (let i=0;i<4;i++) await expect(chapters.nth(i)).toBeVisible()
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)
    expect(overflow).toBeLessThanOrEqual(3)
    await expect(page.locator('.globe-testimonials-stage')).not.toHaveAttribute('data-story-step',/\d/)
  }
})
