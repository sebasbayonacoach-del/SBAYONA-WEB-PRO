/**
 * BAYONA · PLUGIN DE VITE — HTML POR RUTA, SITEMAP Y ROBOTS
 * ---------------------------------------------------------------------------
 * Problema que resuelve:
 *
 * La web es una SPA. Los metadatos por ruta los aplica react-helmet-async en
 * cliente, y eso le sirve a Google (ejecuta JavaScript), pero NO a los bots
 * que generan las previsualizaciones al compartir un enlace: WhatsApp,
 * Facebook, Instagram, Twitter/X, LinkedIn y Telegram no ejecutan JavaScript.
 * Leen el HTML crudo y se van.
 *
 * En un negocio donde el 100 % de la conversión pasa por compartir enlaces de
 * WhatsApp, eso significaba que cualquier página compartida (un plan, la
 * tienda, la comunidad) mostraba el título y la descripción de la home.
 *
 * Qué hace este plugin en `vite build`:
 * · Genera un `index.html` por ruta indexable, con su propio <title>,
 *   description, canonical, Open Graph, Twitter Card y JSON-LD.
 * · Genera `sitemap.xml` desde el registro de rutas, para que no haya que
 *   mantenerlo a mano cuando se añada una página.
 * · Genera `robots.txt` apuntando al sitemap.
 *
 * No es SSR: el HTML sigue llevando el mismo `<div id="root">` y la misma SPA.
 * Solo cambia la cabecera, que es lo que leen los bots.
 *
 * Hosting: Vercel resuelve el sistema de archivos antes que los rewrites, así
 * que `/programs` sirve `programs/index.html` si existe y, si no, cae al
 * rewrite hacia `/index.html` (ver vercel.json).
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { absoluteAsset, absoluteUrl, BRAND, DEFAULT_OG_IMAGE, SITE_URL } from '../src/config/site.config.js'
import { mediaHeroUrls, siteMedia } from '../src/config/siteMedia.js'
import { indexableRoutes, resolveRouteMeta } from '../src/lib/seo/routeMeta.js'
import { buildStructuredData } from '../src/lib/seo/structuredData.js'

/**
 * Imagen que domina la primera pantalla de cada ruta, es decir su LCP.
 * Se declara aquí, derivada de siteMedia, para no duplicar ninguna URL.
 */
const LCP_MEDIA_BY_ROUTE = {
  '/': siteMedia.home?.hero,
  '/about': siteMedia.about?.hero,
  '/programs': siteMedia.programs?.hero,
  '/parkour-academy': siteMedia.parkourAcademy?.hero,
  '/shop': siteMedia.shop?.hero,
  '/app': siteMedia.app?.hero,
  '/community': siteMedia.community?.hero,
  '/faq': siteMedia.faq?.hero,
  '/resources': siteMedia.resources?.hero,
  '/onboarding': siteMedia.onboarding?.threshold,
  '/plan/raiz': siteMedia.plans?.RAIZ?.hero,
  '/plan/fuerza': siteMedia.plans?.FUERZA?.hero,
  '/plan/rendimiento': siteMedia.plans?.RENDIMIENTO?.hero,
  '/plan/elite': siteMedia.plans?.ELITE?.hero,
}

const SEO_BLOCK_PATTERN = /<!--seo-->[\s\S]*?<!--\/seo-->/

/** Escapa lo que va dentro de un atributo HTML. */
function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/** Escapa lo que va como texto entre etiquetas. */
function escapeText(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Evita que un `</script>` dentro del JSON-LD cierre la etiqueta antes de hora.
 * Es la vía clásica de inyección al serializar JSON dentro de <script>.
 */
function safeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

/**
 * Preload de la imagen que domina la primera pantalla.
 *
 * Los fondos de héroe se pintan con `background-image` desde una custom
 * property, así que el navegador no los descubre hasta que ha descargado y
 * aplicado el CSS: son el LCP y arrancan tarde. Declararlos aquí los pone en
 * cola desde el primer parseo del HTML.
 *
 * `imagesrcset` replica la escalera de `image-set()` para que el preload y el
 * fondo real resuelvan a la misma URL y no se descargue la imagen dos veces.
 */
function renderLcpPreload(routePath) {
  const media = LCP_MEDIA_BY_ROUTE[routePath]
  if (!media?.src) return ''

  /**
   * Debe resolver a las MISMAS urls que `image-set()` en SceneBackground:
   * si difieren, el navegador precarga un formato y luego pinta otro,
   * descargando el héroe dos veces. `mediaHeroUrls()` es la fuente única.
   */
  const { standard, retina } = mediaHeroUrls(media)

  /**
   * Descriptores de densidad (1x / 2x), no de ancho (960w / 1600w).
   * `image-set()` resuelve solo por densidad de pantalla; si aquí se usaran
   * descriptores de ancho con `imagesizes`, en un monitor 1x de 1440 px el
   * preload elegiría 1600 y el CSS pintaría 960: dos descargas del héroe.
   */
  const attrs = [
    'rel="preload"',
    'as="image"',
    `href="${escapeAttribute(standard)}"`,
    standard === retina
      ? ''
      : `imagesrcset="${escapeAttribute(`${standard} 1x, ${retina} 2x`)}"`,
    'fetchpriority="high"',
  ].filter(Boolean)

  return `\n    <link ${attrs.join(' ')} />`
}

/** Construye el bloque SEO completo de una ruta. */
function renderSeoBlock(meta) {
  const canonical = absoluteUrl(meta.canonicalPath)
  const ogImage = absoluteAsset(DEFAULT_OG_IMAGE.path)
  const title = escapeText(meta.fullTitle)
  const titleAttr = escapeAttribute(meta.fullTitle)
  const description = escapeAttribute(meta.description)
  const robots = meta.noindex
    ? 'noindex, follow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'

  return `<!--seo-->
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${escapeAttribute(canonical)}" />
    <meta name="robots" content="${robots}" />
    <meta name="author" content="${escapeAttribute(BRAND.founder)}" />${renderLcpPreload(meta.canonicalPath)}

    <meta property="og:site_name" content="${escapeAttribute(BRAND.name)}" />
    <meta property="og:type" content="${escapeAttribute(meta.ogType)}" />
    <meta property="og:locale" content="${escapeAttribute(BRAND.locale)}" />
    <meta property="og:url" content="${escapeAttribute(canonical)}" />
    <meta property="og:title" content="${titleAttr}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${escapeAttribute(ogImage)}" />
    <meta property="og:image:width" content="${DEFAULT_OG_IMAGE.width}" />
    <meta property="og:image:height" content="${DEFAULT_OG_IMAGE.height}" />
    <meta property="og:image:type" content="${DEFAULT_OG_IMAGE.type}" />
    <meta property="og:image:alt" content="${escapeAttribute(DEFAULT_OG_IMAGE.alt)}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${titleAttr}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${escapeAttribute(ogImage)}" />
    <meta name="twitter:image:alt" content="${escapeAttribute(DEFAULT_OG_IMAGE.alt)}" />

    <script type="application/ld+json">${safeJsonLd(buildStructuredData(meta))}</script>
    <!--/seo-->`
}

/** Ruta del fichero HTML que representa a una ruta de la SPA. */
function htmlFileNameFor(routePath) {
  if (routePath === '/') return 'index.html'
  return `${routePath.replace(/^\//, '')}/index.html`
}

function renderSitemap(routes, lastmod) {
  const urls = routes
    .map((routePath) => {
      /** La home es la prioridad máxima; el resto queda por debajo. */
      const priority = routePath === '/' ? '1.0' : routePath.startsWith('/plan/') ? '0.8' : '0.7'
      return [
        '  <url>',
        `    <loc>${absoluteUrl(routePath)}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <priority>${priority}</priority>`,
        '  </url>',
      ].join('\n')
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

function renderRobots() {
  return `# BAYONA · robots.txt
# Generado en build por vite/emitRouteHtml.js

User-agent: *
Allow: /

# Pasos del embudo: no aportan nada en resultados de búsqueda.
Disallow: /checkout
Disallow: /order-confirmation

# Página interna del sistema visual: solo para el equipo.
Disallow: /design-system

Sitemap: ${SITE_URL}/sitemap.xml
`
}

/**
 * @returns {import('vite').Plugin}
 */
export function emitRouteHtml() {
  let outDir = 'dist'

  return {
    name: 'bayona:emit-route-html',
    apply: 'build',

    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },

    /**
     * Se usa `writeBundle` y no `generateBundle` a propósito: el HTML final lo
     * produce el plugin interno `vite:build-html`, y en `generateBundle` todavía
     * no está en el bundle. `writeBundle` corre con los archivos ya escritos en
     * disco, así que index.html existe con sus rutas de assets ya hasheadas.
     */
    writeBundle() {
      const indexPath = join(outDir, 'index.html')

      let baseHtml
      try {
        baseHtml = readFileSync(indexPath, 'utf8')
      } catch {
        this.error(`No se pudo leer ${indexPath}: no se generó el HTML por ruta.`)
        return
      }

      if (!SEO_BLOCK_PATTERN.test(baseHtml)) {
        this.error(
          'index.html no contiene los marcadores de bloque SEO. ' +
          'Sin ellos no se pueden generar metadatos por ruta.',
        )
        return
      }

      const routes = indexableRoutes()

      const writeHtml = (fileName, meta) => {
        const target = join(outDir, fileName)
        mkdirSync(dirname(target), { recursive: true })
        writeFileSync(target, baseHtml.replace(SEO_BLOCK_PATTERN, renderSeoBlock(meta)), 'utf8')
      }

      // La home se reescribe en sitio para que también incluya su JSON-LD.
      writeHtml('index.html', resolveRouteMeta('/'))

      routes
        .filter((routePath) => routePath !== '/')
        .forEach((routePath) => writeHtml(htmlFileNameFor(routePath), resolveRouteMeta(routePath)))

      const lastmod = new Date().toISOString().slice(0, 10)
      writeFileSync(join(outDir, 'sitemap.xml'), renderSitemap(routes, lastmod), 'utf8')
      writeFileSync(join(outDir, 'robots.txt'), renderRobots(), 'utf8')

      this.info?.(`SEO: ${routes.length} rutas con HTML propio, sitemap.xml y robots.txt generados.`)
    },
  }
}
