import { test, expect } from '@playwright/test'

const cases = [
  ['desktop',1440,900],
  ['laptop',1180,820],
  ['tablet',768,1024],
  ['mobile',390,844],
  ['small-mobile',320,700],
]

for (const [label,width,height] of cases) {
  test('Servicios Prime / ' + label, async ({page}) => {
    await page.setViewportSize({width,height})
    await page.goto('/')
    await expect(page.locator('#servicios')).toBeAttached({timeout:15000})
    const section=page.locator('#servicios')
    const cards=section.locator('a.bayona-services-prime__card')
    await expect(cards).toHaveCount(4)
    await expect(section.getByRole('heading',{level:2})).toContainText('TU OBJETIVO.')
    const expected=[
      ['/programs#servicios-clases','Entrenamiento personal'],
      ['/programs#membresias','Entrenamiento online'],
      ['/parkour-academy','Parkour y rendimiento'],
      ['/programs#servicios-recuperación','Movilidad y recuperación'],
    ]
    for(let i=0;i<expected.length;i++){
      await expect(cards.nth(i)).toHaveAttribute('href',expected[i][0])
      await expect(cards.nth(i).getByRole('heading',{level:3})).toHaveText(expected[i][1])
    }
    const metrics=await page.evaluate(()=>{
      const box=n=>n.getBoundingClientRect()
      const cards=[...document.querySelectorAll('#servicios .bayona-services-prime__card')]
      return{
        overflow:document.documentElement.scrollWidth-innerWidth,
        rows:getComputedStyle(document.querySelector('#servicios .gym-service-grid')).gridTemplateRows,
        cards:cards.map(c=>{
          const card=box(c),top=box(c.querySelector('.gym-service-card__top')),body=box(c.querySelector('.gym-service-card__body')),footer=box(c.querySelector('.gym-service-card__bottom'))
          return{height:card.height,width:card.width,topInside:top.top>=card.top-1,bodyInside:body.top>=card.top-1&&body.bottom<=card.bottom+1,gap:body.top-top.bottom,footerInside:footer.bottom<=card.bottom+1,start:card.top,end:card.bottom}
        })
      }
    })
    expect(metrics.overflow).toBeLessThanOrEqual(1)
    for(const c of metrics.cards){
      expect(c.height).toBeGreaterThanOrEqual(420)
      expect(c.topInside).toBe(true)
      expect(c.bodyInside).toBe(true)
      expect(c.footerInside).toBe(true)
      expect(c.gap).toBeGreaterThan(20)
    }
    if(width>1100){
      expect(Math.abs(metrics.cards[2].start-metrics.cards[0].end)).toBeLessThan(32)
    }
  })
}

test('Servicios Prime keeps accessible links and palette in day/night',async({page})=>{
  await page.goto('/')
  const section=page.locator('#servicios')
  for(const theme of ['day','night']){
    await page.evaluate(t=>document.documentElement.setAttribute('data-bayona-theme',t),theme)
    const state=await section.evaluate(e=>{
      const card=e.querySelector('.bayona-services-prime__card')
      return{bg:getComputedStyle(e).backgroundColor,photo:getComputedStyle(card.querySelector('img')).display,top:getComputedStyle(card.querySelector('.gym-service-card__top')).zIndex,body:getComputedStyle(card.querySelector('.gym-service-card__body')).zIndex}
    })
    expect(state.bg).not.toBe('rgba(0, 0, 0, 0)')
    expect(state.photo).not.toBe('none')
    expect(Number(state.body)).toBeGreaterThan(1)
  }
})
