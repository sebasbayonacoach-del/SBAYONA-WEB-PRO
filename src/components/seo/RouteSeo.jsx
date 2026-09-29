/**
 * BAYONA · SEO POR RUTA
 * ---------------------------------------------------------------------------
 * Un único componente montado en App.jsx resuelve el <head> de las 17 rutas.
 * Antes todas compartían el <head> estático de index.html: mismo título,
 * misma descripción y ningún canonical.
 *
 * Qué emite en cada navegación:
 * · <title> y meta description propios de la ruta
 * · <link rel="canonical"> (los alias apuntan a su ruta real)
 * · robots noindex en los pasos de embudo y en el 404
 * · Open Graph y Twitter Card con la URL e imagen correctas
 * · JSON-LD schema.org con el grafo de la ruta
 */

import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import { BRAND, DEFAULT_OG_IMAGE, absoluteAsset, absoluteUrl } from '../../config/site.config.js'
import { resolveRouteMeta } from '../../lib/seo/routeMeta.js'
import { buildStructuredData } from '../../lib/seo/structuredData.js'

export default function RouteSeo() {
  const { pathname } = useLocation()
  const meta = resolveRouteMeta(pathname)
  const canonical = absoluteUrl(meta.canonicalPath)
  const ogImage = absoluteAsset(DEFAULT_OG_IMAGE.path)
  const structuredData = buildStructuredData(meta)

  return (
    <Helmet defer={false} prioritizeSeoTags>
      <html lang={BRAND.lang} />
      <title>{meta.fullTitle}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={canonical} />

      {meta.noindex ? (
        <meta name="robots" content="noindex, follow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Open Graph */}
      <meta property="og:site_name" content={BRAND.name} />
      <meta property="og:type" content={meta.ogType} />
      <meta property="og:locale" content={BRAND.locale} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={meta.fullTitle} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content={String(DEFAULT_OG_IMAGE.width)} />
      <meta property="og:image:height" content={String(DEFAULT_OG_IMAGE.height)} />
      <meta property="og:image:type" content={DEFAULT_OG_IMAGE.type} />
      <meta property="og:image:alt" content={DEFAULT_OG_IMAGE.alt} />

      {/* Twitter Card — con `name`, que es lo que especifica la documentación */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.fullTitle} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={DEFAULT_OG_IMAGE.alt} />

      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Helmet>
  )
}
