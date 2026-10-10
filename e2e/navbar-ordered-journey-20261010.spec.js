import { expect, test } from '@playwright/test'

const ordered = [
  ['Nosotros','/about'],
  ['Servicios','/programs'],
  ['Parkour','/parkour-academy'],
  ['Comunidad','/community'],
  ['BAYONA+','/app'],
  ['Tienda','/shop'],
  ['Recursos','/resources'],
]

for (const width of [1440,1280,1180,1100,1024,390]) {
  test(`Cabecera ordenada y sin superposición (${width}px)`,async({page})=>{
    await page.setViewportSize({width,height:width===390?844:900})
    await page.goto('/about',{waitUntil:'networkidle'})
    const nav=page.locator('nav.gym-primary-nav')
    const links=nav.locator('a')
    await expect(links).toHaveCount(ordered.length)
    for (const [i,[name,route]] of ordered.entries()) {
      await expect(links.nth(i)).toHaveText(name)
      await expect(links.nth(i)).toHaveAttribute('href',route)
    }
    const metrics=await page.evaluate(()=>{
      const rect=(selector)=>document.querySelector(selector).getBoundingClientRect()
      const nav=rect('.gym-primary-nav'),brand=rect('.navbar .brand'),theme=rect('.navbar .site-theme-toggle'),menu=rect('.navbar .menu-button')
      return {desktopVisible:getComputedStyle(document.querySelector('.gym-primary-nav')).display!=='none',navRight:nav.right,brandRight:brand.right,navLeft:nav.left,themeLeft:theme.left,themeRight:theme.right,menuLeft:menu.left,overflow:document.documentElement.scrollWidth-innerWidth}
    })
    expect(metrics.overflow).toBeLessThanOrEqual(3)
    if(width>1180){
      expect(metrics.desktopVisible).toBe(true)
      expect(metrics.navLeft).toBeGreaterThan(metrics.brandRight+10)
      expect(metrics.navRight).toBeLessThan(metrics.themeLeft-10)
    } else {
      expect(metrics.desktopVisible).toBe(false)
      const menu=page.getByRole('button',{name:'Abrir menú'})
      await menu.click()
      const mobile=page.getByRole('navigation',{name:'Navegación móvil'})
      await expect(mobile).toBeVisible()
      await expect(mobile.locator('.gym-mobile-nav-list a')).toHaveCount(9)
      await expect(mobile.locator('.gym-mobile-nav-list a').first()).toHaveAttribute('href','/')
      await expect(mobile.locator('.gym-mobile-nav-list a').last()).toHaveAttribute('href','/faq')
      await mobile.locator('.gym-mobile-nav-list a').last().scrollIntoViewIfNeeded()
      await expect(mobile.locator('.gym-mobile-nav-list a').last()).toBeInViewport()
    }
  })
}

test('Marcador de página actual sigue al destino correcto',async({page})=>{
  await page.setViewportSize({width:1440,height:900})
  for(const [name,route] of ordered){
    await page.goto(route,{waitUntil:'domcontentloaded'})
    const nav=page.getByRole('navigation',{name:'Navegación principal'})
    await expect(nav.getByRole('link',{name})).toHaveAttribute('aria-current','page')
    const count=await nav.locator('a.active').count()
    expect(count).toBe(1)
  }
})
