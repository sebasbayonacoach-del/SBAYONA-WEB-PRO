import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (...parts) => readFileSync(join(ROOT, ...parts), 'utf8')

const appSource = read('App.jsx')
const routeSceneCyclerSource = read('components', 'RouteSceneCycler.jsx')
const homeSource = read('pages', 'Home.jsx')
const aboutSource = read('pages', 'About.jsx')
const planSource = read('pages', 'PlanPresentation.jsx')
const homeCss = read('styles', 'home.css')
const experienceCss = read('styles', 'ds-experience.css')

describe('Propagación de la capa de experiencia (FASE 4 · 4.2 y 4.5)', () => {
  it('el marco del sistema se monta en el shell, así que lo reciben todas las rutas', () => {
    expect(appSource).toMatch(/className="ds-frame"/)
    expect(appSource).toMatch(/data-experience-scope=\{experienceScope\}/)
    expect(appSource).toMatch(/data-experience-mode=\{showEditorialChrome \? 'editorial' : 'product'\}/)
    expect(experienceCss).toMatch(/\.ds-frame\s*\{/)
  })

  it('HOME declara las cuatro capas y ninguna de ellas es WebGL', () => {
    const layers = [...homeSource.matchAll(/data-experience-layer="([^"]+)"/g)]
      .flatMap(([, value]) => value.split(/\s+/))

    for (const layer of ['editorial', 'motion', 'spatial', 'commercial']) {
      expect(layers, `capa ${layer} sin declarar en HOME`).toContain(layer)
    }
    expect(layers).not.toContain('webgl')
    expect(homeSource).not.toMatch(/from ['"]three|@react-three|WebGLRenderer/)
  })

  it('el método es un patrón compartido, no un adorno de una página', () => {
    for (const [name, source] of [['/about', aboutSource], ['/plan', planSource]]) {
      expect(source, `${name} no usa el patrón compartido`).toContain('components/method/MethodSequence.jsx')
    }

    // Home conserva su recorrido espacial (StickyStage) pero habla el mismo
    // idioma: número como figura y señal naranja en el paso activo.
    const fase4 = homeCss.slice(homeCss.indexOf('FASE 4 · 4.3'), homeCss.indexOf('FASE 4B · 4.3'))

    expect(fase4).toContain('--bayona-type-figure-soft')
    expect(fase4).toContain('--bayona-warm')
    expect(fase4).toContain('--bayona-hairline')
    expect(fase4).not.toMatch(/!important\s*;/)
  })

  it('las superficies y el ritmo de la portada salen del sistema', () => {
    const fase4 = homeCss.slice(homeCss.indexOf('FASE 4 · 4.3'), homeCss.indexOf('FASE 4B · 4.3'))

    expect(fase4).toMatch(/background:\s*var\(--bayona-surface-1\)/)
    expect(fase4).toMatch(/background:\s*var\(--bayona-surface-0\)/)
    expect(fase4).toMatch(/padding-block:\s*var\(--bayona-gap-section\)/)
  })

  it('el laboratorio y el playground quedan fuera de la propagación (3A congelado)', () => {
    expect(appSource).toMatch(/const SYSTEM_ROUTES = Object.freeze\(\['\/design-system'\]\)/)
    expect(experienceCss.match(/data-experience-scope='brand'/g).length).toBeGreaterThanOrEqual(3)
  })

  it('las rutas de producto no montan chrome editorial global', () => {
    expect(appSource).toMatch(/const PRODUCT_ROUTES = Object.freeze\(\[/)
    for (const route of ['/app', '/entrar', '/checkout', '/order-confirmation', '/onboarding']) {
      expect(appSource).toContain(`'${route}'`)
    }
    expect(appSource).toContain('const showEditorialChrome = !isProductRoute && !isSystemRoute')
    expect(appSource).toMatch(/\{showEditorialChrome \? <WhatsAppButton \/> : null\}/)
    expect(appSource).toMatch(/\{showEditorialChrome \? <ArrivalBonusCard \/> : null\}/)

    /*
      EXCEPCIÓN DECLARADA, 2026-09-22 · pie de página en el centro de mando.

      El brief de 70 anotaciones (comentarios 62 y 63, y §7 del documento
      `docs/BAYONA_DIRECCION_PRODUCTO_UX_2026-09-22.md`) pide que la cuenta sea
      «la continuación natural del recorrido» y «conserve la identidad visual,
      header/footer y sensación de casa BAYONA». El pie es justo lo que ancla el
      mando a la casa: era la única pieza que faltaba, porque el navbar ya se
      montaba fuera de esta decisión.

      Esto NO afloja la invariante: la estrecha. El resto del chrome editorial
      —bono de llegada, WhatsApp flotante, compartir, siguiente parada,
      acompañante y el cycler 3D— sigue prohibido en todas las rutas de
      producto, y el pie sigue vetado en caja, confirmación y recepción, que son
      flujos con foco donde un enlace de márketing es una salida antes de
      tiempo. Se fija la lista a mano para que nadie la amplíe de rondón: si
      alguien añade una ruta a `FOOTER_ROUTES`, este test se rompe y tiene que
      pasar por aquí.
    */
    const footerRoutes = appSource.match(/const FOOTER_ROUTES = Object\.freeze\(\[([^\]]*)\]/)
    expect(footerRoutes, 'FOOTER_ROUTES debe existir y ser una lista congelada').not.toBeNull()
    expect(footerRoutes[1].match(/'[^']+'/g)).toEqual(["'/panel'"])
    expect(appSource).toMatch(
      /\{showSiteFooter \? <Footer \/> : null\}|\{showEditorialChrome \? <Footer \/> : null\}/,
    )
    // Y el pie no se cuela por otra vía en las rutas transaccionales.
    expect(appSource).not.toMatch(/'<\/checkout>'[^]*FOOTER_ROUTES/)
  })

  it('el WebGL narrativo global no se monta en móvil ni con reduced motion', () => {
    expect(routeSceneCyclerSource).toContain("import { useCapabilities } from '../engine/hooks/useCapabilities.js'")
    expect(routeSceneCyclerSource).toContain("caps.mode === 'desktop' && caps.reducedMotion === false")
    expect(routeSceneCyclerSource).toMatch(/if \(!canRunNarrativeWebGL\) \{\s*setSteps\(\[\]\)/)
    expect(routeSceneCyclerSource).toMatch(/if \(!canRunNarrativeWebGL \|\| !steps\.length\) return null/)
  })

  it('la capa nueva no abre peticiones ni dependencias: es CSS y DOM', () => {
    expect(experienceCss).not.toMatch(/@import/)
    expect(experienceCss).not.toMatch(/url\(/)
    expect(experienceCss).not.toMatch(/linear-gradient\([^)]*url/)
    // Tres curvas vivas, ni una más: si alguien añade una cuarta, el sistema
    // empieza a tener acentos de movimiento distintos por página.
    expect([...experienceCss.matchAll(/--bayona-ease-[a-z-]+:/g)]).toHaveLength(3)
  })
})

describe('FASE 4B · propagación selectiva a las rutas comerciales', () => {
  const sheetBlock = (source, marker, endMarker = 'FASE 4C') => {
    const index = source.indexOf(marker)
    expect(index, `falta el bloque ${marker}`).toBeGreaterThan(-1)
    const end = endMarker ? source.indexOf(endMarker, index + marker.length) : -1
    if (endMarker) expect(end, `falta el fin de ${marker}`).toBeGreaterThan(index)
    const block = source.slice(index, endMarker ? end : undefined)
    // Se descarta la cabecera comentada: se auditan declaraciones, no prosa.
    const close = block.indexOf('*/')

    return close >= 0 ? block.slice(close + 2) : block
  }

  it('Programs adopta el dispositivo compartido y conserva su media real', () => {
    expect(aboutSource).toContain('MethodSequence')
    const programs = read('pages', 'Programs.jsx')

    expect(programs).toContain('method-pillars ds-sequence')
    // El refinamiento no puede pagarse con contenido: las imágenes del método
    // siguen montándose desde siteMedia.
    expect(programs).toContain('siteMedia.programs.pillars')
  })

  it('las hojas de ruta aliasan el sistema en vez de re-declarar la marca', () => {
    const shop = sheetBlock(read('styles', 'shop.css'), 'FASE 4B')
    const parkour = sheetBlock(read('styles', 'parkour-academy.css'), 'FASE 4B')

    expect(shop).toMatch(/--shop-orange:\s*var\(--bayona-warm\)/)
    expect(shop).toMatch(/--shop-black:\s*var\(--bayona-surface-0\)/)
    expect(shop).toMatch(/--shop-panel:\s*var\(--bayona-surface-1\)/)
    expect(parkour).toMatch(/--academy-orange:\s*var\(--bayona-warm\)/)
  })

  it('ningún bloque de la fase define colores nuevos, !important ni canvas', () => {
    const blocks = [
      // Escenas inmersivas posteriores tienen otra política de cascada.
      ['home.css', sheetBlock(homeCss, 'FASE 4B · 4.3', 'BAYONA IMMERSIVE CHAPTERS')],
      ['programs.css', sheetBlock(read('styles', 'programs.css'), 'FASE 4B')],
      ['shop.css', sheetBlock(read('styles', 'shop.css'), 'FASE 4B')],
      ['about.css', sheetBlock(read('styles', 'about.css'), 'FASE 4B')],
      ['plan-presentation.css', sheetBlock(read('styles', 'plan-presentation.css'), 'FASE 4B')],
      ['faq.css', sheetBlock(read('styles', 'faq.css'), 'FASE 4B')],
      ['resources.css', sheetBlock(read('styles', 'resources.css'), 'FASE 4B')],
      ['parkour-academy.css', sheetBlock(read('styles', 'parkour-academy.css'), 'FASE 4B')],
    ]

    const declarations = (block) => block.replace(/\/\*[\s\S]*?\*\//g, '')

    for (const [name, raw] of blocks) {
      const block = declarations(raw)
      expect(block, `${name}: color crudo fuera de var()`).not.toMatch(/:\s*#[0-9a-f]{3,8}\s*[;}]/i)
      expect(block, `${name}: !important`).not.toMatch(/!important\s*;/)
      expect(block, `${name}: WebGL no autorizado en ruta comercial`).not.toMatch(/canvas|three\.js/)
      // Y el dispositivo numerado de la fase sale del sistema, no de un tamaño suelto.
      if (name === 'programs.css') expect(block).not.toMatch(/font-size:\s*\d/)
    }
  })

  it('la figura numerada de ruta es un paso del sistema, no un tamaño nuevo', () => {
    expect(experienceCss).toMatch(/--bayona-type-figure-inline:\s*var\(--ds-fs-h3\)/)
    expect(read('styles', 'v2-typography.css')).toMatch(/--fs-h3:\s*clamp/)
    // El bloque único de reduced motion sigue siendo único tras la fase.
    const blocks = experienceCss.match(/@media \(prefers-reduced-motion: reduce\)/g) || []

    expect(blocks).toHaveLength(1)
  })
})
