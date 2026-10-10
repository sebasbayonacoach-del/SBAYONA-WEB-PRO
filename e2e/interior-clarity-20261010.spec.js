import { expect, test } from '@playwright/test'

const routes=['/','/about','/programs','/shop','/parkour-academy','/community','/resources','/faq','/app']

for(const width of [1440,390]) {
  test(`Footer y navegación de rutas sin solapamientos a ${width}px`,async({page})=>{
    await page.setViewportSize({width,height:width===390?844:900})
    await page.emulateMedia({reducedMotion:'reduce'})
    for(const route of routes){
      await page.goto(route,{waitUntil:'domcontentloaded'})
      await expect(page.locator('footer.gym-footer')).toBeAttached()
      const result=await page.evaluate(()=>{
        const f=document.querySelector('footer.gym-footer')
        const brand=f.querySelector('.footer-mark').getBoundingClientRect()
        const nav=f.querySelector('.footer-columns').getBoundingClientRect()
        const xOverlap=Math.min(brand.right,nav.right)-Math.max(brand.left,nav.left)
        const yOverlap=Math.min(brand.bottom,nav.bottom)-Math.max(brand.top,nav.top)
        return {overlap:xOverlap>3 && yOverlap>3,overflow:document.documentElement.scrollWidth-innerWidth,
          brand:Math.round(brand.width),nav:Math.round(nav.width),footerGrid:getComputedStyle(f).gridTemplateAreas}
      })
      expect(result.overlap,`${route} footer solapado`).toBe(false)
      expect(result.overflow,`${route} overflow`).toBeLessThanOrEqual(3)
      expect(result.brand,`${route} marca ilegible`).toBeGreaterThan(80)
      expect(result.nav,`${route} sin navegación`).toBeGreaterThan(180)
      expect(result.footerGrid).toContain('categories')
    }
  })
}

test('Catálogo Tienda y acceso a otros capítulos tienen categorías claras',async({page})=>{
  await page.setViewportSize({width:1440,height:900})
  await page.goto('/shop',{waitUntil:'networkidle'})
  const categories=page.getByRole('group',{name:'Categorías principales de tienda'})
  await expect(categories).toBeVisible()
  await expect(categories.getByRole('button').first()).toBeVisible()
  await expect(page.getByRole('navigation',{name:'Otras páginas de BAYONA'})).toBeAttached()
  const directory=await page.locator('.editorial-outro__destinations').evaluate(el=>getComputedStyle(el).gridTemplateColumns)
  expect(directory.trim().split(' ').length).toBeGreaterThanOrEqual(3)
})
