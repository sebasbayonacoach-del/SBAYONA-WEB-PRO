import { expect, test } from '@playwright/test'

const screenSet = [
  {width:390,height:844},
  {width:726,height:950},
  {width:1440,height:900},
]

for (const view of screenSet) {
  test(`narrative chapters responsive ${view.width}px`, async ({page}) => {
    await page.setViewportSize(view)
    await page.emulateMedia({reducedMotion:'no-preference'})
    const exceptions=[]
    page.on('pageerror',e=>exceptions.push(e.message))
    await page.goto('/',{waitUntil:'domcontentloaded'})

    const checkpoints = [
      ['.pain-unlock-stage','.pain-navigation-stop',4],
      ['.community-immersive-stage','.community-interface',1],
      ['.immersive-method-stage','.bayona-voyage',1],
      ['.benefits-orbit-stage','.bayona-noise-field',1],
      ['.experience-story__stage','.bayona-experience-film__slide',2],
      ['.free-dossier-stage','.free-dossier-viewport',1],
    ]
    for (const [stageSelector,target,count] of checkpoints) {
      const stage=page.locator(stageSelector)
      await expect(stage).toBeAttached()
      await stage.scrollIntoViewIfNeeded({timeout:25000})
      await expect(stage.locator(target)).toHaveCount(count,{timeout:25000})
      const issue=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3)
      expect(issue,`horizontal overflow at ${stageSelector} on ${view.width}px`).toBe(false)
    }
    await expect(page.locator('.pain-unlock-stage .pain-unlock-lock')).toHaveCount(0)
    await expect(page.getByText('CONVERSACIÓN ILUSTRATIVA')).toBeAttached()
    await expect(page.locator('.bayona-offer-gate__plinth')).toBeAttached()
    expect(exceptions).toEqual([])
    await page.screenshot({path:`test-results/playwright/cinematic-home-journey/${view.width}.png`})
  })
}

test('reto 30 días proyectado en cine y llamada a recurso',async({page})=>{
 await page.setViewportSize({width:726,height:950})
 await page.goto('/',{waitUntil:'domcontentloaded'})
 const stage=page.locator('.free-dossier-stage')
 await stage.scrollIntoViewIfNeeded()
 const pos=await stage.evaluate(el=>({start:el.getBoundingClientRect().top+scrollY,dist:el.getBoundingClientRect().height-el.querySelector('.sticky-stage-viewport').getBoundingClientRect().height}))
 await page.evaluate(y=>scrollTo(0,y),pos.start+pos.dist*.39)
 await expect(stage.locator('.free-dossier-viewport[data-piece="reto"]')).toBeAttached()
 await expect(stage.locator('.bayona-challenge-theater')).toBeVisible()
 await expect(stage.getByRole('link',{name:/VER CONDICIONES/i})).toHaveAttribute('href','/resources')
 await page.screenshot({path:'test-results/playwright/cinematic-home-journey/reto-cinema.png'})
})

test('prefers reduced motion still shows chapters, no moving layers',async({page})=>{
 await page.setViewportSize({width:390,height:844})
 await page.emulateMedia({reducedMotion:'reduce'})
 await page.goto('/',{waitUntil:'domcontentloaded'})
 await expect(page.locator('.pain-unlock-stage.sticky-stage--static .sticky-stage-frame')).toHaveCount(4)
 await expect(page.locator('.immersive-method-stage.sticky-stage--static .sticky-stage-frame')).toHaveCount(3)
 await expect(page.locator('.free-dossier-stage.sticky-stage--static .sticky-stage-frame')).toHaveCount(4)
 await expect(page.locator('.bayona-noise-field')).toHaveCount(0)
 await expect(page.getByRole('link',{name:/CONOCER EL GRUPO/i})).toBeAttached()
})

test('capítulo 05 aproxima la cámara según scroll y respeta modo calma', async ({ page }) => {
  await page.setViewportSize({ width: 726, height: 950 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const gate = page.locator('.bayona-offer-gate')
  const metrics = await gate.evaluate(el => ({ top: el.getBoundingClientRect().top + scrollY, height: el.getBoundingClientRect().height }))
  await page.evaluate(y => scrollTo(0, y), metrics.top - 950 * .8)
  await page.waitForTimeout(450)
  const approach = await gate.locator('.bayona-offer-gate__stage').evaluate(el => getComputedStyle(el).transform)
  expect(approach).not.toBe('none')

  await page.evaluate(y => scrollTo(0, y), metrics.top + metrics.height * .78)
  await page.waitForTimeout(450)
  const settled = await gate.locator('.bayona-offer-gate__stage').evaluate(el => getComputedStyle(el).transform)
  expect(settled).toBe('none')
  await expect(page.locator('#home-offer-heading')).toBeAttached()

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.waitForTimeout(250)
  expect(await gate.locator('.bayona-offer-gate__stage').evaluate(el => getComputedStyle(el).transform)).toBe('none')
  expect(await gate.locator('.bayona-offer-gate__dive').evaluate(el => getComputedStyle(el).display)).toBe('none')
})
