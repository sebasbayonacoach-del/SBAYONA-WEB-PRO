/**
 * BAYONA · DATOS ESTRUCTURADOS (schema.org / JSON-LD)
 * ---------------------------------------------------------------------------
 * Genera el grafo de datos estructurados a partir de las fuentes reales del
 * proyecto (offerings.js, faqContent.js, site.config.js). Nada se escribe a
 * mano dos veces: si cambia un precio en offerings.js, cambia aquí.
 *
 * Decisiones deliberadas:
 * · NO se emite `aggregateRating` ni `review`: no hay reseñas verificadas y
 *   el modelo editorial del proyecto prohíbe publicar evidencia no verificable.
 *   Inventarlas además incumpliría las políticas de Google.
 * · NO se emite `SearchAction`: el sitio no tiene página de búsqueda.
 * · Los planes se modelan como `Product` porque schema.org define Product como
 *   "cualquier producto o servicio ofrecido", y llevan precio publicado.
 * · `priceCurrency` es COP, la moneda real de facturación. EUR y USD son
 *   aproximaciones no contractuales y por eso no entran en el grafo.
 */

import { membershipPlans } from '../../config/offerings.js'
import { faqEntries } from '../../config/faqContent.js'
import {
  BRAND,
  DEFAULT_OG_IMAGE,
  SITE_URL,
  WHATSAPP_DISPLAY,
  absoluteAsset,
  absoluteUrl,
  siteSameAs,
} from '../../config/site.config.js'

const ORGANIZATION_ID = `${SITE_URL}/#organization`
const WEBSITE_ID = `${SITE_URL}/#website`
const FOUNDER_ID = `${SITE_URL}/#founder`
const LOGO_ID = `${SITE_URL}/#logo`

/** Nodo Organization. Ancla de identidad de todo el grafo. */
export function organizationNode() {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: BRAND.name,
    legalName: BRAND.legalName,
    url: `${SITE_URL}/`,
    slogan: BRAND.tagline,
    description: BRAND.tagline,
    logo: {
      '@type': 'ImageObject',
      '@id': LOGO_ID,
      url: absoluteAsset(DEFAULT_OG_IMAGE.path),
      width: DEFAULT_OG_IMAGE.width,
      height: DEFAULT_OG_IMAGE.height,
    },
    image: { '@id': LOGO_ID },
    founder: { '@id': FOUNDER_ID },
    areaServed: { '@type': 'Country', name: 'España' },
    sameAs: siteSameAs(),
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        telephone: WHATSAPP_DISPLAY,
        availableLanguage: ['es'],
        url: `https://wa.me/${WHATSAPP_DISPLAY.replace(/[^\d]/g, '')}`,
      },
    ],
  }
}

/** Nodo Person del fundador. */
export function founderNode() {
  return {
    '@type': 'Person',
    '@id': FOUNDER_ID,
    name: BRAND.founder,
    jobTitle: 'Entrenador y fundador',
    worksFor: { '@id': ORGANIZATION_ID },
    url: absoluteUrl('/about'),
    sameAs: siteSameAs(),
  }
}

/** Nodo WebSite. */
export function webSiteNode() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: BRAND.name,
    description: BRAND.tagline,
    inLanguage: BRAND.lang,
    publisher: { '@id': ORGANIZATION_ID },
  }
}

/** Nodo WebPage de la ruta actual, enlazado al sitio y a la marca. */
export function webPageNode({ url, name, description }) {
  return {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: BRAND.lang,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORGANIZATION_ID },
    primaryImageOfPage: { '@id': LOGO_ID },
  }
}

/** Slug de plan usado en las rutas /plan/:slug (sin tildes). */
function planSlug(planId) {
  return String(planId).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * Nodo Product + Offer de un plan de membresía.
 * El precio es mensual: se declara con UnitPriceSpecification para que quede
 * explícito que 149.000 COP es por mes y no un pago único.
 */
export function planProductNode(plan) {
  const url = absoluteUrl(`/plan/${planSlug(plan.id)}`)

  return {
    '@type': 'Product',
    '@id': `${url}#product`,
    name: `Plan ${plan.name}`,
    url,
    category: 'Entrenamiento personal y acompañamiento de movimiento',
    description: plan.shortDescription,
    brand: { '@id': ORGANIZATION_ID },
    audience: { '@type': 'Audience', audienceType: plan.audience },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'COP',
      price: String(plan.priceCop),
      availability: 'https://schema.org/InStock',
      seller: { '@id': ORGANIZATION_ID },
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: String(plan.priceCop),
        priceCurrency: 'COP',
        /** UnitCode MON = mes (UN/CEFACT). Deja claro que es una cuota mensual. */
        referenceQuantity: { '@type': 'QuantitativeValue', value: '1', unitCode: 'MON' },
      },
    },
  }
}

/** Lista ordenada de planes, para la página de programas. */
export function planItemListNode() {
  return {
    '@type': 'ItemList',
    '@id': `${absoluteUrl('/programs')}#planes`,
    name: 'Planes de membresía BAYONA',
    numberOfItems: membershipPlans.length,
    itemListElement: membershipPlans.map((plan, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `Plan ${plan.name}`,
      url: absoluteUrl(`/plan/${planSlug(plan.id)}`),
    })),
  }
}

/** Nodo FAQPage construido desde el contenido real de la página de FAQ. */
export function faqPageNode() {
  return {
    '@type': 'FAQPage',
    '@id': `${absoluteUrl('/faq')}#faq`,
    mainEntity: faqEntries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    })),
  }
}

/**
 * Nodo BreadcrumbList. Siempre arranca en Inicio.
 * `trail` es un array de pares [nombre, ruta].
 */
export function breadcrumbNode(trail = []) {
  if (!Array.isArray(trail) || trail.length === 0) return null

  const items = [['Inicio', '/'], ...trail]

  return {
    '@type': 'BreadcrumbList',
    '@id': `${absoluteUrl(trail[trail.length - 1][1])}#breadcrumb`,
    itemListElement: items.map(([name, path], index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: absoluteUrl(path),
    })),
  }
}

/**
 * Ensambla el grafo JSON-LD completo de una ruta.
 * Devuelve un único objeto `@graph` para que los nodos compartidos
 * (Organization, WebSite, Person) se declaren una sola vez.
 */
export function buildStructuredData(meta) {
  const url = absoluteUrl(meta.canonicalPath ?? meta.path ?? '/')
  const graph = [
    organizationNode(),
    founderNode(),
    webSiteNode(),
    webPageNode({ url, name: meta.fullTitle ?? meta.title, description: meta.description }),
  ]

  const breadcrumb = breadcrumbNode(meta.breadcrumb)
  if (breadcrumb) graph.push(breadcrumb)

  const canonicalPath = meta.canonicalPath ?? meta.path ?? '/'

  if (canonicalPath === '/faq') {
    graph.push(faqPageNode())
  }

  if (canonicalPath === '/programs') {
    graph.push(planItemListNode())
    membershipPlans.forEach((plan) => graph.push(planProductNode(plan)))
  }

  if (meta.planId) {
    const plan = membershipPlans.find((entry) => entry.id === meta.planId)
    if (plan) graph.push(planProductNode(plan))
  }

  return { '@context': 'https://schema.org', '@graph': graph }
}
