import { describe, expect, it } from 'vitest'
import packageManifest from '../../package.json'
import indexSource from '../../index.html?raw'
import playwrightConfigSource from '../../playwright.config.js?raw'
import browserSuiteSource from '../../e2e/conversion-milestones.spec.js?raw'
import appSource from '../App.jsx?raw'
import requestPreviewSource from '../components/conversion/RequestPreview.jsx?raw'
import {
  homeContentModel,
} from '../config/conversionContent.js'
import { evidenceRegistry } from '../config/evidenceRegistry.js'
import {
  buildExperienceWhatsAppUrl,
  editorialServices,
  membershipPlans,
  WHATSAPP_NUMBER,
} from '../config/offerings.js'
import homeSource from '../pages/Home.jsx?raw'
import checkoutSource from '../pages/Checkout.jsx?raw'
import {
  INTERNAL_ROUTES,
  PUBLIC_ROUTES,
  VISUAL_QA_MOTION_MODES,
  VISUAL_QA_VIEWPORTS,
} from './conversionRegression.config.js'

const allProductSources = import.meta.glob(
  [
    '../App.jsx',
    '../components/**/*.{js,jsx}',
    '../pages/**/*.{js,jsx}',
  ],
  { query: '?raw', import: 'default', eager: true },
)
const productSources = Object.entries(allProductSources)
  .filter(([path]) => !path.includes('.test.') && !path.includes('.spec.'))

// Mismo barrido, más ancho: también `lib/` y `config/`, donde vive el modelo del
// pedido. Se usa SOLO en la guarda del precio recurrente, para que un «después
// 1 €/mes» escrito en un comentario de adaptación no se aprenda como si fuera
// inofensivo — así vivió justo ese defecto.
const commercialSources = Object.entries(
  import.meta.glob(['../lib/**/*.{js,jsx}', '../config/**/*.{js,jsx}'], {
    query: '?raw',
    import: 'default',
    eager: true,
  }),
).filter(([path]) => !path.includes('.test.') && !path.includes('.spec.'))

function collectDeclaredRoutes(source) {
  return [...source.matchAll(/<Route\s+path=["']([^"']+)["']/g)]
    .map(([, path]) => path)
}

function collectLiteralDestinations(source) {
  const propDestinations = [...source.matchAll(
    /\b(?:href|to)\s*=\s*(?:\{\s*)?["'`]([^"'`]+)["'`](?:\s*\})?/g,
  )].map(([, destination]) => destination)
  const tupleDestinations = [...source.matchAll(
    /\[\s*["'][^"']+["']\s*,\s*["']((?:\/|#)[^"']*)["']\s*\]/g,
  )].map(([, destination]) => destination)

  return [...propDestinations, ...tupleDestinations]
    .filter((destination) => !destination.includes('${'))
}

function collectLiteralIds(source) {
  return [...source.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)]
    .map(([, id]) => id)
}

function normalisePathname(pathname) {
  if (!pathname || pathname === '/') return '/'
  return pathname.replace(/\/+$/, '') || '/'
}

function expectOfficialWhatsApp(urlValue, expectedContext) {
  const url = new URL(urlValue)
  const message = url.searchParams.get('text')

  expect(url.origin).toBe('https://wa.me')
  expect(url.pathname).toBe(`/${WHATSAPP_NUMBER}`)
  expect(message).toEqual(expect.any(String))
  expect(message.length).toBeGreaterThan(20)
  expect(message).toContain(expectedContext)

  return message
}

function visibleModelCopy(model) {
  return [
    model.h1,
    ...model.blocks.flatMap((block) => [
      block.heading,
      block.body,
      block.boundary,
      ...(block.items ?? []).flatMap(({ title, body }) => [title, body]),
    ]),
    model.primaryAction.label,
    model.primaryAction.consequence,
  ].filter(Boolean).join(' ')
}

// Baseline acumulativo: cada Page_Milestone debe ampliar estos contratos, no sustituirlos.
// Validates: Requirements 3.4, 3.10, 3.11, 3.12, 13.5, 13.13, 14.7–14.13,
// 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 17.8, 17.9, 17.10, 17.11

describe('Regression_Gate acumulativo de conversión', () => {
  it('conserva el inventario exacto de rutas públicas y un único wildcard', () => {
    const declaredRoutes = collectDeclaredRoutes(appSource)
    const concreteRoutes = declaredRoutes.filter(
      (path) => path !== '*' && !INTERNAL_ROUTES.includes(path),
    )

    expect(concreteRoutes).toHaveLength(PUBLIC_ROUTES.length)
    expect(new Set(concreteRoutes)).toEqual(new Set(PUBLIC_ROUTES))
    // Las rutas internas también quedan inventariadas: ni una más ni una menos.
    expect(
      declaredRoutes.filter((path) => INTERNAL_ROUTES.includes(path)),
    ).toEqual([...INTERNAL_ROUTES])
    expect(declaredRoutes.filter((path) => path === '*')).toEqual(['*'])
    expect(new Set(declaredRoutes).size).toBe(declaredRoutes.length)
  })

  it('resuelve destinos internos literales y anchors declarados por el producto', () => {
    const knownRoutes = new Set(PUBLIC_ROUTES.map(normalisePathname))
    const knownIds = new Set(productSources.flatMap(([, source]) => collectLiteralIds(source)))
    const unresolved = []

    for (const [sourcePath, source] of productSources) {
      for (const destination of collectLiteralDestinations(source)) {
        if (!destination.startsWith('/') && !destination.startsWith('#')) continue

        const url = new URL(destination, 'https://bayona.test/')
        const pathname = destination.startsWith('#') ? '/' : normalisePathname(url.pathname)
        const looksLikeAsset = /\/[^/]+\.[a-z0-9]{2,8}$/i.test(pathname)

        if (!looksLikeAsset && !knownRoutes.has(pathname)) {
          unresolved.push(`${sourcePath}: ruta ${destination}`)
          continue
        }

        if (url.hash) {
          let targetId = url.hash.slice(1)
          try {
            targetId = decodeURIComponent(targetId)
          } catch {
            // El fragmento sin decodificar se reportará como no resuelto.
          }
          if (targetId && !knownIds.has(targetId)) {
            unresolved.push(`${sourcePath}: anchor ${destination}`)
          }
        }
      }
    }

    expect(unresolved).toEqual([])
  })

  it('mantiene Playwright fijado solo como dependencia de desarrollo y un script finito', () => {
    expect(packageManifest.devDependencies['@playwright/test']).toBe('1.61.1')
    expect(packageManifest.dependencies['@playwright/test']).toBeUndefined()
    expect(packageManifest.scripts['test:visual']).toBe('playwright test')
    expect(playwrightConfigSource).toContain('webServer:')
    expect(playwrightConfigSource).toContain('reuseExistingServer: false')
    expect(playwrightConfigSource).toContain('--strictPort')
  })

  it('fija la matriz 375/768/1440, ambos modos de movimiento y screenshots de estados Home', () => {
    expect(VISUAL_QA_VIEWPORTS.map(({ width, height }) => [width, height])).toEqual([
      [375, 812],
      [768, 1024],
      [1440, 900],
    ])
    expect(VISUAL_QA_MOTION_MODES.map(({ reducedMotion }) => reducedMotion)).toEqual([
      'no-preference',
      'reduce',
    ])
    expect(browserSuiteSource).toContain('page.emulateMedia')
    expect(browserSuiteSource).toContain('page.screenshot')
    expect(browserSuiteSource).toContain("fullPage: true")
    expect(browserSuiteSource).toContain('home-hero')
    expect(browserSuiteSource).toContain('home-planes')
    expect(browserSuiteSource).toContain('home-extras')
    expect(browserSuiteSource).toContain('home-preview')
    expect(browserSuiteSource).toContain("page.keyboard.press('Tab')")
  })

  it('conserva Canonical_Plan y Official_WhatsApp con contexto y preview seguro', () => {
    expect(WHATSAPP_NUMBER).toBe('34641698332')
    expect(membershipPlans.map(({ id, name, priceCop, priceDisplay }) => ({
      id,
      name,
      priceCop,
      priceDisplay,
    }))).toEqual([
      { id: 'RAIZ', name: 'RAÍZ', priceCop: 149000, priceDisplay: '$149.000' },
      { id: 'FUERZA', name: 'FUERZA', priceCop: 299000, priceDisplay: '$299.000' },
      { id: 'RENDIMIENTO', name: 'RENDIMIENTO', priceCop: 499000, priceDisplay: '$499.000' },
      { id: 'ELITE', name: 'ELITE', priceCop: 899000, priceDisplay: '$899.000' },
    ])

    for (const plan of membershipPlans) {
      const message = expectOfficialWhatsApp(plan.cta, `con ${plan.name}`)
      expect(message).toContain(plan.priceDisplay)
    }

    for (const service of editorialServices) {
      const message = expectOfficialWhatsApp(service.cta, service.label)
      expect(message).toContain(service.priceDisplay)
    }

    const experienceUrl = buildExperienceWhatsAppUrl({
      planId: 'RENDIMIENTO',
      serviceQuantities: { 'presencial-bogota-1to1': 1 },
      extraIds: ['masaje-deportivo'],
    })
    const experienceMessage = expectOfficialWhatsApp(experienceUrl, 'Plan base: RENDIMIENTO')

    expect(experienceMessage).toContain('ubicación cuando aplique')
    expect(experienceMessage).toContain(
      'no constituye pago, pedido, inscripción, disponibilidad ni acceso confirmados',
    )
    expect(requestPreviewSource).toMatch(/buildExperienceWhatsAppUrl\(selection\)/)
    expect(requestPreviewSource).toContain('Abrir WhatsApp de BAYONA en una pestaña nueva')
    expect(requestPreviewSource).toContain('rel="noopener noreferrer"')
  })

  it('mantiene Home en español y sin plazo, prueba ficticia, urgencia ni claims médicos afirmativos', () => {
    const modelCopy = visibleModelCopy(homeContentModel)
    const reviewedHomeCopy = `${modelCopy} ${homeSource} ${requestPreviewSource}`

    expect(indexSource).toMatch(/<html\s+lang="es">/)
    // Pin del titular: actualizado a la reescritura de copy del 2026-09-22
    // («actúa como experto en ventas»). Lo que este gate vigila de verdad son las
    // líneas de abajo —idioma, ausencia de plazo, de prueba ficticia, de urgencia
    // y de claims médicos—, y ninguna se ha tocado.
    expect(homeContentModel.h1).toBe('ENTRENA CON DIRECCIÓN. HAZTE MÁS FUERTE.')
    expect(modelCopy).toContain('no diagnostica, trata ni sustituye la atención de profesionales sanitarios')
    expect(requestPreviewSource).toContain('Revisa tu solicitud antes de abrir WhatsApp')
    expect(requestPreviewSource).toContain('Datos que se incluirán')
    expect(evidenceRegistry).toEqual({})

    // El plazo ya no se anuncia en la portada: la escena de visión habla de lo
    // que la persona va a notar, no de una cuenta atrás. Se siguen vetando las
    // variantes que convierten el plazo en garantía.
    expect(reviewedHomeCopy).not.toMatch(/en\s+90\s*d[ií]as|90\s*d[ií]as\s+de\s+garant[ií]a|transformaci[oó]n\s+en\s+90/i)
    expect(reviewedHomeCopy).not.toMatch(
      /\+8\b|clientes atendidos|formaci[oó]n europea|testimonio de|resultado comprobado/i,
    )
    expect(reviewedHomeCopy).not.toMatch(
      /[uú]ltimas plazas|plazas limitadas|solo hoy|ahora o nunca|cuenta atr[aá]s|date prisa/i,
    )
    const affirmativeClaimsCopy = reviewedHomeCopy.replace(
      /\bsin\s+(?:un\s+)?resultado garantizado\b/gi,
      '',
    )
    expect(affirmativeClaimsCopy).not.toMatch(
      /diagnosticamos|prescribimos|curamos|tratamos el dolor|cura garantizada|resultado garantizado/i,
    )
    // Gym Funnel V2: Home ya no necesita canvas narrativo. La fotografía y el
    // DOM son la capa primaria, así que tampoco necesita lazy/Suspense para 3D.
    expect(homeSource).not.toMatch(/SceneMount|<canvas\b|from ['"]three|@react-three/i)
    expect(homeSource).not.toMatch(/lazy\s*\(\s*\(\s*\)\s*=>\s*import|Suspense/)
  })
})

/*
 * PRECIO RECURRENTE · escrito por el modelo del pedido o no escrito.
 *
 * Por qué existe esta guarda. El 22-09-2026 se encontró un defecto de anuncio
 * engañoso con la suite entera en verde: `ZERO_FIRST_MONTH_OFFER` llevaba
 * `thenAmountEur: 1`, de modo que un plan de 70 €/mes se ofertaba como
 * «primer mes €0 · después €1/mes» en la pasarela, en el resumen y en el texto
 * que Stripe y PayPal enviaban al banco. Lo pineaba un test. Se arreglaron
 * `plans.js`, `order.js`, los dos adaptadores y el cartel de `PlanPresentation`.
 *
 * Al cerrarlo quedó un hueco: `Checkout.jsx` seguía diciendo a mano «después
 * €1/mes en la pasarela». Mismo mensaje, misma pantalla de pago, otra fuente.
 * Un arreglo de una capa no arregla el anuncio si nadie mira el resto.
 *
 * La regla que deja esta guarda: en ninguna pantalla de producto se escribe una
 * cifra recurrente detrás de un «después». El número sale del pedido
 * (`order.recurringEur`) o del plan (`plan.priceDisplay`), o no se dice.
 * «después de 3 meses» sigue siendo legal: lo que se veta es un euro pegado.
 *
 * Al primer lanzamiento pitó en `plans.js`, y era el comentario que explica el
 * propio defecto: citaba el rótulo retirado literal, con su cifra. No se aflojó
 * la guarda ni se declaró una excepción —un comentario que reproduce la promesa
 * es un comentario que invita a volver a escribirla—; se reescribió el
 * comentario para que cuente el hecho sin copiar el número.
 */
describe('Honestidad · el precio recurrente no se escribe a mano en una pantalla', () => {
  const PRECIO_A_MANO = [/despu[eé]s\s+[^\n]{0,14}€\s*\d+/i, /despu[eé]s\s+[^\n]{0,14}\d+\s*\/\s*mes/i]

  it('ninguna fuente de producto promete un «después» con importe fijo', () => {
    const culpables = [...productSources, ...commercialSources]
      .filter(([, source]) => PRECIO_A_MANO.some((re) => re.test(source)))
      .map(([path]) => path)
    expect(culpables).toEqual([])
  })

  it('el paso de pago enlaza el después con el precio publicado, no con una cifra propia', () => {
    expect(checkoutSource).toMatch(/despu[eé]s,\s*el precio publicado del plan/i)
    expect(checkoutSource).not.toMatch(PRECIO_A_MANO[0])
  })

  /*
    Guarda de la guarda. «0 culpables» no vale nada si el patrón no caza el caso
    real que originó la regla — aquí sí lo pinita, con el texto exacto que estaba
    en pantalla. Sin esto, un `despu[eé]s` mal acentuado o un `{0,14}` recortado
    dejaría la comprobación vacía y seguiría en verde.
  */
  it('el patrón detecta el anuncio que provocó la regla y no pita con el resto', () => {
    const caza = (texto) => PRECIO_A_MANO.some((re) => re.test(texto))
    expect(caza('Primer mes €0 · después €1/mes en la pasarela')).toBe(true)
    expect(caza('PRIMER MES SIN COSTE · después 1/mes')).toBe(true)
    expect(caza('después {plan.priceDisplay}')).toBe(false)
    expect(caza('Después sigue el precio publicado del plan, que verás en el resumen.')).toBe(false)
    expect(caza('después de 3 meses entrenando')).toBe(false)
  })
})
