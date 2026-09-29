import { burstWebpSrcSet, mediaAtWidth, mediaHeroUrls, mediaSrcSet, SCENE_WIDTH_2X } from '../config/siteMedia.js'

function cssUrl(value) {
  const escaped = String(value).replace(/(["\\])/g, '\\$1')
  return `url("${escaped}")`
}

function cssUrlWithType(value) {
  return String(value).endsWith('.webp') ? `${cssUrl(value)} type("image/webp")` : cssUrl(value)
}

/**
 * Fondo decorativo con dos resoluciones vía `image-set()`.
 *
 * Los fondos de héroe son el LCP de casi todas las páginas y se pedían siempre
 * a 1600 px, incluso en un móvil de 390 px. `image-set()` deja que el navegador
 * elija según densidad de pantalla, y el `url()` suelto queda como respaldo
 * para navegadores sin soporte. Donde hay variantes WebP en disco (lote Fase 1
 * de >500 KB + lote Fase 2 de 200-500 KB referenciadas), el `image-set()` las prefiere con `type("image/webp")` y el JPG
 * queda como respaldo: mismo encuadre, solo cambia el peso.
 */
function responsiveBackground(media) {
  const { standard, retina } = mediaHeroUrls(media)

  if (standard === retina) return cssUrl(media.src)

  return `image-set(${cssUrlWithType(standard)} 1x, ${cssUrlWithType(retina)} 2x)`
}

/**
 * Attaches a decorative image to an existing element. The image is painted by
 * the `.scene-bg` pseudo-element, so this helper never adds DOM or affects flow.
 */
export function sceneBackgroundProps(media, {
  className = '',
  style,
  variant = 'subtle',
  pseudo = 'before',
  position = 'center',
  opacity,
  overlay,
  blur,
  motion = false,
} = {}) {
  if (!media?.src) return { className, style }

  const classes = [
    className,
    'scene-bg',
    `scene-bg--${variant}`,
    pseudo === 'after' && 'scene-bg--after',
    motion && 'scene-bg--motion',
  ].filter(Boolean).join(' ')

  return {
    className: classes,
    style: {
      /**
       * Se publican las dos variantes y media-scenes.css elige:
       * `--scene-image-set` si el navegador soporta image-set(), y
       * `--scene-image-url` como respaldo. Los consumidores siguen leyendo
       * `--scene-image`, así que ningún CSS existente cambia.
       */
      /**
       * El respaldo apunta al ancho 2x, no al nativo: 1600 px basta de sobra
       * para un fondo a pantalla completa y así el navegador sin image-set()
       * reutiliza uno de los candidatos que ya se han precargado.
       */
      // El fallback debe ser uno de los mismos candidatos que usa image-set().
      // En el banco BAYONA, mediaAtWidth() devuelve el PNG original porque no
      // tiene query width=; eso hacía que Chromium descargara PNG + WebP.
      // Reutilizar el candidato retina elimina la descarga duplicada y conserva
      // el mismo encuadre/calidad incluso en navegadores sin image-set().
      '--scene-image-url': cssUrl(mediaHeroUrls(media).retina || mediaAtWidth(media, SCENE_WIDTH_2X)),
      '--scene-image-set': responsiveBackground(media),
      '--scene-position': position,
      ...(opacity == null ? {} : { '--scene-opacity': String(opacity) }),
      ...(overlay == null ? {} : { '--scene-overlay': overlay }),
      ...(blur == null ? {} : { '--scene-blur': typeof blur === 'number' ? `${blur}px` : blur }),
      ...style,
    },
    'data-media-key': media.key,
    'data-media-source': media.source,
    'data-media-role': 'decorative',
  }
}

export function StockImage({
  media,
  className = '',
  priority = false,
  sizes = '(max-width: 680px) 92vw, (max-width: 1100px) 45vw, 28vw',
}) {
  if (!media?.src) return null

  /**
   * `srcSet` es lo que le da sentido a `sizes`. Antes solo estaba `sizes`, así
   * que el navegador no tenía candidatos y bajaba siempre la imagen al máximo
   * ancho, para pintarla en una tarjeta de 300–400 px.
   */
  const srcSet = mediaSrcSet(media)

  /**
   * WebP donde hay variantes reales en disco (Fase 1 + Fase 2):
   * `<picture>` con `image/webp` primero y el JPG original como respaldo.
   * Mismo `sizes`, `loading`, `alt`, `decoding` y clases: cero cambio visual.
   * Sin variantes, se devuelve el `<img>` de siempre, byte a byte igual.
   */
  const webpSrcSet = burstWebpSrcSet(media)

  const img = (
    <img
      className={className}
      src={media.src}
      srcSet={srcSet ?? undefined}
      alt={media.description ?? ''}
      width={media.width ?? 1000}
      height={media.height ?? 1250}
      loading={priority ? 'eager' : 'lazy'}
      /* React 18 pasa este atributo en minúscula tal cual al DOM. */
      fetchpriority={priority ? 'high' : 'auto'}
      decoding="async"
      referrerPolicy="strict-origin-when-cross-origin"
      sizes={srcSet ? sizes : undefined}
      data-media-key={media.key}
      data-media-source={media.source}
      data-media-role="product"
    />
  )

  if (!webpSrcSet) return img

  return (
    <picture>
      <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
      {img}
    </picture>
  )
}
