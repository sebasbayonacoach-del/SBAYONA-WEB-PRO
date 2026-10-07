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
      ['.community-immersive-stage','.journey-phone',1],
      ['.immersive-method-stage','.immersive-method-viewport',1],
      ['.benefits-orbit-stage','.benefits-orbit-viewport',1],
      ['.experience-story__stage','.bayona-experience-film__slide',2],
    ]
    for (const [stageSelector,target,count] of checkpoints) {
      const stage=page.locator(stageSelector)
      await expect(stage).toBeAttached()
      await stage.scrollIntoViewIfNeeded({timeout:25000})
      await expect(stage.locator(target)).toHaveCount(count,{timeout:25000})
      const issue=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3)
      expect(issue,`horizontal overflow at ${stageSelector} on ${view.width}px`).toBe(false)
    }
    if (view.width >= 1024) {
      const freeStage=page.locator('.free-dossier-stage')
      await expect(freeStage).toBeAttached()
      await expect(freeStage.locator('.free-dossier-viewport')).toHaveCount(1)
    } else {
      const freeValue=page.locator('.free-value')
      await expect(freeValue.locator('.free-dossier-stage')).toHaveCount(0)
      await expect(freeValue.locator('.journey-library-entry')).toHaveCount(4)
    }
    await expect(page.locator('.pain-unlock-stage .pain-unlock-lock')).toHaveCount(0)
    await expect(page.getByText(/Conversación ilustrativa/i)).toBeAttached()
    await expect(page.locator('.home-memberships-section .plan-showroom')).toBeAttached()
    expect(exceptions).toEqual([])
    await page.screenshot({path:`test-results/playwright/cinematic-home-journey/${view.width}.png`})
  })
}

test('reto 30 días proyectado como workbook y descarga real',async({page})=>{
 await page.setViewportSize({width:1440,height:900})
 await page.goto('/',{waitUntil:'domcontentloaded'})
 const stage=page.locator('.free-dossier-stage')
 await stage.scrollIntoViewIfNeeded()
 const pos=await stage.evaluate(el=>({start:el.getBoundingClientRect().top+scrollY,dist:el.getBoundingClientRect().height-el.querySelector('.sticky-stage-viewport').getBoundingClientRect().height}))
 await page.evaluate(y=>scrollTo(0,y),pos.start+pos.dist*.39)
 await expect(stage.locator('.free-dossier-viewport[data-piece="reto"]')).toBeAttached()
 await expect(stage.locator('.free-dossier-viewport[data-piece="reto"] .journey-dossier')).toBeVisible()
 await expect(stage.getByRole('link',{name:/DESCARGAR EL WORKBOOK/i})).toHaveAttribute('href','/downloads/bayona-editorial/registro-30-dias.pdf')
 await page.screenshot({path:'test-results/playwright/cinematic-home-journey/reto-cinema.png'})
})

test('prefers reduced motion still shows chapters, no moving layers',async({page})=>{
 await page.setViewportSize({width:390,height:844})
 await page.emulateMedia({reducedMotion:'reduce'})
 await page.goto('/',{waitUntil:'domcontentloaded'})
 await expect(page.locator('.pain-unlock-stage.sticky-stage--static .sticky-stage-frame')).toHaveCount(4)
 await expect(page.locator('.immersive-method-stage.sticky-stage--static .sticky-stage-frame')).toHaveCount(3)
 await expect(page.locator('.free-dossier-stage')).toHaveCount(0)
 await expect(page.locator('.free-value .journey-library-entry')).toHaveCount(4)
 await expect(page.locator('.bayona-noise-field')).toHaveCount(0)
 await expect(page.getByRole('link',{name:/CONOCER LA COMUNIDAD/i})).toBeAttached()
})

test('capítulo 05 mantiene el showroom estable y alcanzable', async ({ page }) => {
  await page.setViewportSize({ width: 726, height: 950 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const offer = page.locator('.home-memberships-section')
  await offer.scrollIntoViewIfNeeded({ timeout: 25000 })
  await expect(offer.locator('#home-offer-heading')).toBeVisible()
  await expect(offer.locator('.plan-showroom-selector')).toBeVisible()
  await expect(offer.locator('.plan-showroom-preview')).toHaveCount(1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 3)).toBe(false)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(offer.locator('.plan-showroom-preview')).toBeVisible()
})
