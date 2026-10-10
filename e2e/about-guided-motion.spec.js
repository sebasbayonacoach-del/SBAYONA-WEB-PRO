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

test('Atlas GSAP recorre las diez historias completas sin un solo fotograma vacío', async ({page}) => {
  await page.setViewportSize({width:1440,height:900})
  await page.emulateMedia({reducedMotion:'no-preference'})
  await page.goto('/about', {waitUntil:'networkidle'})
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior='auto'
    document.body.style.scrollBehavior='auto'
  })
  const stage = page.locator('.globe-testimonials-stage')
  await stage.scrollIntoViewIfNeeded()
  await expect.poll(() => stage.evaluate(el => Boolean(el.closest('.globe-atlas-runway')))).toBe(true)
  const pinned = await stage.evaluate(el => {
    const r = el.closest('.globe-atlas-runway').getBoundingClientRect()
    return { start: r.top + window.scrollY - 78, length: r.height - window.innerHeight - 78 }
  })
  const seen=[]
  for(let index=0;index<12;index++) {
    const destination = pinned.start + pinned.length * ((index+.5)/12)
    await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),destination)
    await page.waitForTimeout(75)
    const state=await stage.evaluate(el=>({
      id:el.dataset.storyId,
      visible:[...el.querySelectorAll('.globe-scroll-story__chapter')]
        .filter(card=>getComputedStyle(card).visibility==='visible' && Number(getComputedStyle(card).opacity)>.95)
        .map(card=>card.dataset.storyId),
    }))
    expect(state.visible).toEqual([state.id])
    const geometry = await stage.evaluate(el => {
      const scene=el.getBoundingClientRect()
      const card=el.querySelector(`.globe-scroll-story__chapter[data-story-id="${el.dataset.storyId}"]`).getBoundingClientRect()
      return {sceneTop:scene.top,sceneBottom:scene.bottom,cardTop:card.top,cardBottom:card.bottom}
    })
    expect(geometry.sceneTop).toBeGreaterThanOrEqual(65)
    expect(geometry.sceneTop).toBeLessThanOrEqual(95)
    expect(geometry.cardTop).toBeGreaterThanOrEqual(65)
    expect(geometry.cardBottom).toBeLessThanOrEqual(900)
    seen.push(state.id)
  }
  expect(seen).toEqual(['intro',...Array.from({length:10},(_,i)=>`story-${i}`),'outro'])
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(3)
})

test('Móvil y movimiento reducido conservan las doce escenas legibles sin fijar la pantalla', async ({page})=>{
  for (const [width,motion] of [[390,'no-preference'],[1440,'reduce']]) {
    await page.setViewportSize({width,height:width===390?844:900})
    await page.emulateMedia({reducedMotion:motion})
    await page.goto('/about',{waitUntil:'networkidle'})
    const chapters=page.locator('.globe-scroll-story__chapter')
    await expect(chapters).toHaveCount(12)
    for (let i=0;i<12;i++) await expect(chapters.nth(i)).toBeVisible()
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)
    expect(overflow).toBeLessThanOrEqual(3)
    await expect(page.locator('.globe-testimonials-stage')).not.toHaveAttribute('data-story-step',/\d/)
  }
})
