import { expect, test } from '@playwright/test'

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  for (const mode of ['night', 'day']) {
    test(`Inicio guiado · lectura y contraste ${viewport.width}px / ${mode}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      await page.goto('/', { waitUntil: 'networkidle' })
      await page.evaluate(theme => { document.documentElement.dataset.bayonaTheme = theme }, mode)
      const section = page.locator('.gym-home-process.start-journey')
      await expect(section.getByRole('heading', { name: /TRES PASOS PARA EMPEZAR/i })).toBeAttached()
      const steps = section.locator('.gym-process-grid > li')
      await expect(steps).toHaveCount(3)
      await expect(section.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1')
      await expect(section.locator('.start-journey__progress-points button')).toHaveCount(3)
      for (const name of ['Cuéntanos qué buscas','Recibe tu punto de partida','Agenda y empieza']) {
        await expect(steps.getByRole('heading', { name })).toHaveCount(1)
      }
      await section.scrollIntoViewIfNeeded()
      await page.waitForTimeout(150)
      const geometry = await section.evaluate(node => {
        const intro = node.querySelector('.start-journey__intro')
        const cards = [...node.querySelectorAll('.start-journey__step')]
        const g = cards.map(card => { const b=card.getBoundingClientRect();return {left:b.left,right:b.right,width:b.width,height:b.height,top:b.top} })
        return { sticky:getComputedStyle(intro).position, columns:getComputedStyle(node.querySelector('.start-journey__layout')).gridTemplateColumns, cards:g,
          overflow:document.documentElement.scrollWidth-innerWidth }
      })
      expect(geometry.overflow).toBeLessThanOrEqual(3)
      const ink = await steps.first().evaluate(el=>({
        title:getComputedStyle(el.querySelector('h3')).color,
        copy:getComputedStyle(el.querySelector('p')).color,
      }))
      expect(ink.title).toBe('rgb(255, 246, 236)')
      expect(ink.copy).toBe(mode === 'day' ? 'rgb(240, 232, 221)' : 'rgb(238, 224, 209)')
      for(const rect of geometry.cards){expect(rect.width).toBeGreaterThan(240);expect(rect.left).toBeGreaterThanOrEqual(-1);expect(rect.right).toBeLessThanOrEqual(viewport.width + 2)}
      if(viewport.width>950){expect(geometry.sticky).toBe('sticky');expect(Math.abs(geometry.cards[0].top-geometry.cards[2].top)).toBeGreaterThan(150)}
      else {expect(geometry.sticky).toBe('static');expect(geometry.cards[0].top).toBeLessThan(geometry.cards[2].top)}
      await page.screenshot({ path: `/tmp/bayona-start-journey-${viewport.width}-${mode}.png` })
      expect(errors).toEqual([])
    })
  }
}

test('La lectura sigue 01 → 02 → 03, activa CTA y permite navegar por los puntos',async({page})=>{
  await page.setViewportSize({width:1440,height:900})
  await page.goto('/', { waitUntil:'networkidle' })
  await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';document.body.style.scrollBehavior='auto'})
  const section=page.locator('.start-journey')
  const steps=section.locator('.start-journey__step')
  for(let i=0;i<3;i++){
    await page.evaluate(index=>{const el=document.querySelectorAll('.start-journey__step')[index]; const top=el.getBoundingClientRect().top + window.scrollY - window.innerHeight*.5; window.scrollTo({top,behavior:'instant'})},i)
    await expect(section).toHaveAttribute('data-active-step',String(i+1),{timeout:7000})
    await expect(steps.nth(i)).toHaveAttribute('aria-current','step')
    await expect(section.getByRole('progressbar')).toHaveAttribute('aria-valuenow',String(i+1))
  }
  await expect(section).toHaveClass(/is-complete/)
  await expect(section.getByRole('link',{name:/QUIERO EMPEZAR/i})).toHaveAttribute('href','#empieza')
  await section.getByRole('button',{name:/Ir al paso 01/i}).click()
  await expect(section).toHaveAttribute('data-active-step','1')
})

test('Movimiento reducido: los tres pasos permanecen íntegros sin animación ni ocultación',async({page})=>{
  await page.setViewportSize({width:390,height:844})
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.goto('/',{waitUntil:'networkidle'})
  const section=page.locator('.start-journey')
  await expect(section.locator('.start-journey__step')).toHaveCount(3)
  const cards=await section.locator('.start-journey__step').evaluateAll(nodes=>nodes.map(node=>({opacity:getComputedStyle(node).opacity,transition:getComputedStyle(node).transitionDuration})))
  expect(cards.every(card=>card.opacity==='1')).toBe(true)
  expect(cards.every(card=>card.transition==='0s')).toBe(true)
  await expect(section.getByRole('link',{name:/QUIERO EMPEZAR/i})).toBeVisible()
})
