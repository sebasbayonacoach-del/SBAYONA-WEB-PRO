const BURST_CDN = 'https://burst.shopifycdn.com/photos'
const BURST_PAGE = 'https://www.shopify.com/stock-photos/photos'
const FOODIES_PAGE = 'https://foodiesfeed.com/free-food-photo'

const BURST_FILE_OVERRIDES = Object.freeze({
  // El recurso local usa este orden; la clave pública del registro se conserva.
  'woman-jumping-workout': 'woman-workout-jumping',
  'close-up-of-mother-board': 'close-up-of-motherboard',
  'female-athlete-tying-her-shoes': 'woman-athlete-tying-shoes',
  'running-on-a-cloudy-day': 'running-cloudy-day',
  'woman-wearing-athletic-leggings': 'womens-athletic-leggings',
  'working-out-with-chalk': 'Working-Out-With-Chalk',
  'massage-therapy-on-upper-back': 'massage-therapy-upper-back',
  'laptop-in-an-empty-room': 'laptop-in-empty-room',
  'business-team-meeting-in-boardroom': 'business-team-meeting-boardroom',
})

// Keep public media keys stable while replacing imagery that does not belong to BAYONA's
// physical world. Every replacement points to a Burst asset already used and verified in
// this registry; the original slug is retained as a cache variant so URLs remain unique.
const CURATED_BURST_MEDIA = Object.freeze({
  'home-transformation-tire': ['man-lifts-tire-exercise', 'Atleta construyendo fuerza funcional en una escena de alto impacto'],
  'home-ninety-days-runner': ['runner-stretching-arms-in-sun', 'Atleta recuperando energía y dirección bajo la luz del amanecer'],
  'rock-stack-on-log-by-water': ['person-stretching-in-fitness-clothing', 'Atleta recuperando movilidad después de entrenar'],
  'frustrated-man-on-computer': ['woman-strong-band-exercise', 'Mujer entrenando fuerza con una banda de resistencia'],
  'working-at-night': ['runner-stretching-arms-in-sun', 'Corredor recuperando energía bajo la luz del amanecer'],
  'beach-at-sunset-in-teal-and-orange': ['woman-athlete-tying-shoes', 'Atleta preparando sus zapatillas antes de comenzar'],
  'close-up-of-mother-board': ['working-out-with-chalk', 'Manos con magnesio antes de un trabajo de fuerza'],
  'students-working-on-project': ['strong-ladies', 'Mujeres fuertes aprendiendo y progresando juntas'],
  'kids-fashion-boy': ['woman-and-boy-muscle', 'Adulto y niño celebrando un cuerpo activo'],
  'designer-working-on-laptop': ['fitness-workout', 'Atleta practicando una progresión física con control'],
  'beautiful-beach-in-portugal': ['a-person-mid-jump-on-a-country-road', 'Atleta suspendido en pleno salto durante su evolución'],
  'tech-meeting-flatlay': ['gym-weights', 'Material de fuerza dispuesto para una sesión precisa'],
  'fistbump-over-desk': ['strong-women-planking', 'Compañeras sosteniendo juntas una progresión exigente'],
  'dancing-with-temples-in-the-orange-mist': ['woman-jumping-workout', 'Atleta en movimiento bajo una luz cálida y cinematográfica'],
  'prairie-woman-at-sunset': ['young-woman-doing-yoga-outside', 'Mujer iniciando su camino de movimiento al aire libre'],
  'mens-fashion-loose-cotton-shirt': ['person-stretching-in-fitness-clothing', 'Prenda técnica acompañando una sesión de movilidad'],
  'young-man-in-bright-fashion': ['fitness-man-chin-ups', 'Sudadera de entrenamiento en una progresión de tracción'],
  'young-man-leans-on-wall': ['weight-lifting-man', 'Prenda premium durante una sesión de fuerza'],
  'mens-fashion-stonewash-jeans-and-boots': ['man-running-at-the-track', 'Pantalón de movimiento durante una carrera en pista'],
  'young-woman-in-hat': ['female-athlete-tying-her-shoes', 'Accesorio deportivo junto a una atleta preparando su sesión'],
  'woman-in-jean-jacket': ['running-on-a-cloudy-day', 'Capa exterior ligera durante un entrenamiento al aire libre'],
  'person-sits-cross-legged-in-summer-fashion': ['restorative-yoga', 'Conjunto cómodo durante una sesión de recuperación'],
  'getting-business-finances-in-order': ['fitness-tracker', 'Dispositivo de seguimiento corporal y rendimiento'],
  'portrait-of-illuminated-laptop': ['rooftopper-looking-down', 'Atleta urbano leyendo una ruta desde las alturas'],
  'startup-desktop': ['jogger-laces-up', 'Atleta preparando el primer movimiento del día'],
  'man-pointing-at-laptop-screen-analytics': ['weighted-squat-exercise', 'Atleta ejecutando una progresión medible de fuerza'],
  'man-in-video-meeting': ['woman-lifts-free-weights', 'Mujer siguiendo una sesión guiada con pesos libres'],
  'women-work-office': ['strong-women-planking', 'Comunidad de mujeres avanzando bajo una misma estructura'],
  'mobile-phone-and-gimbal-in-hand': ['man-running-at-the-track', 'Movimiento atlético registrado durante una carrera'],
  'laptop-in-an-empty-room': ['resting-on-basketball-court', 'Deportista detenido antes de recuperar dirección'],
  'finger-pointing-at-javascript-code': ['intense-exercise', 'Atleta saturado por entrenar sin una progresión clara'],
  'office-computer-screen': ['exercise-stretching', 'Persona recuperando conexión corporal mediante movilidad'],
  'iphone-photography-landscape': ['cross-fit-rope-workout', 'Sesión guiada de acondicionamiento con cuerdas'],
  'organized-workspace': ['core-strength-fitness', 'Progresión ordenada de estabilidad y fuerza central'],
  'black-coffee-and-phone-flatlay': ['restorative-yoga', 'Pausa de recuperación integrada en una rutina real'],
  'tattood-man-using-creative-technology': ['one-arm-push-up', 'Atleta dominando una habilidad de fuerza corporal'],
  'tidy-desk-in-window-light': ['young-woman-doing-yoga-outside', 'Rutina de movilidad bajo luz natural'],
  'drawing-in-notebook': ['ladies-stretch-circle', 'Grupo aprendiendo mediante una práctica de movilidad'],
  'woman-in-fur-under-neon': ['woman-lifts-free-weights', 'Mujer entrenando fuerza en un entorno de alto rendimiento'],
  'fog-on-dark-waters-edge': ['sunset-hike-to-the-summit', 'Comunidad alcanzando una nueva cota al atardecer'],
  'sports-stadium-crowds': ['strong-ladies', 'Grupo de atletas celebrando su progreso compartido'],
  'leather-bound-journal-and-mobile-phone': ['jogger-laces-up', 'Primer paso práctico para activar una semana de movimiento'],
  'office-work-tools-on-the-white-desk': ['weighted-squat-exercise', 'Respuesta práctica convertida en una progresión de fuerza'],
  'carved-stone-buddhas-adorn-ornate-wooden-doorway': ['seated-meditation', 'Atleta entrenando atención y respiración'],
  'loft-chic-living-with-puppy': ['massage-therapy-on-upper-back', 'Recuperación muscular aplicada después del esfuerzo'],
  'business-team-meeting-in-boardroom': ['strong-women-planking', 'Equipo sosteniendo una sesión de fuerza conjunta'],
  'making-a-budget-tracking-finances': ['exercise-free-weights', 'Pesos preparados para planificar una progresión real'],
  'couple-on-coffee-date': ['three-laughing-women', 'Personas reforzando vínculos después de entrenar'],
  'computer-security-lock-and-payment': ['fitness-tracker', 'Datos corporales convertidos en decisiones de entrenamiento'],
  'colorful-work-space': ['workout-fitness-center', 'Entorno completo dedicado a entrenar y evolucionar'],
  'motivation-near-window': ['one-arm-push-up', 'Atleta entrenando fuerza corporal con control'],
  'cave-of-wonder-and-lights': ['rooftopper-looking-down', 'Atleta urbano observando el siguiente obstáculo'],
})

function burst(slug, description, { width = 1600, height = 1000 } = {}) {
  const curated = CURATED_BURST_MEDIA[slug]
  const mediaSlug = curated?.[0] ?? slug
  const mediaDescription = curated?.[1] ?? description
  const fileSlug = BURST_FILE_OVERRIDES[mediaSlug] ?? mediaSlug
  const cacheVariant = curated ? `&v=${encodeURIComponent(slug)}` : ''

  return Object.freeze({
    key: `burst:${slug}`,
    // Las fotos se sirven desde el propio sitio (public/images/burst/):
    // el CDN externo de Shopify se cuelga para algunos visitantes y
    // dejaba media tienda sin imágenes. Sin query de ancho, StockImage
    // usa un único src (sin srcset), suficiente a estos tamaños.
    src: `/images/burst/${fileSlug}.jpg?v=${encodeURIComponent(slug)}&w=${width}`,
    description: mediaDescription,
    source: 'Burst by Shopify',
    sourceUrl: `${BURST_PAGE}/${mediaSlug}`,
    width,
    height,
  })
}

function burstProduct(slug, description) {
  return burst(slug, description, { width: 1000, height: 1250 })
}

/** Escalera de anchos por defecto. Cubre móvil, tablet, escritorio y retina. */
export const MEDIA_WIDTH_LADDER = Object.freeze([320, 480, 640, 960, 1280, 1600])

/**
 * Anchos de los fondos de escena a 1x y 2x.
 *
 * Los comparten `image-set()` en SceneBackground y el `<link rel="preload">`
 * que genera vite/emitRouteHtml.js. Deben ser los mismos dos valores en los
 * dos sitios: si difieren, el navegador precarga un ancho y luego pinta otro,
 * descargando la imagen del héroe dos veces.
 */
export const SCENE_WIDTH_1X = 960
export const SCENE_WIDTH_2X = 1600
/**
 * Variantes WebP reales en disco (`public/images/burst/<slug>-<ancho>.webp`,
 * q80). Precedente: `testimonialVariant()` en `src/config/testimonials.js`.
 *
 * Integración 2026-09-17: mapa restaurado TAL CUAL desde producción
 * (`a77f27d`). Describe exactamente los 55 ficheros WebP que siguen en
 * `public/images/burst/` (6 slugs con par 960+1600 = 12 ficheros, 43 slugs
 * con 960 = 43 ficheros). Sin él, la entrega responsiva WebP de producción
 * se perdía: `mediaSrcSet` devuelve `null` para los ficheros locales (su
 * `src` usa `&w=`, no `width=`), así que este mapa es la única vía por la
 * que el navegador recibe WebP en vez del JPG completo.
 *
 * Se indexa por SLUG DE FICHERO, no por key del registro: `burst()` puede
 * servir otro fichero vía `CURATED_BURST_MEDIA` y `BURST_FILE_OVERRIDES`.
 */
const BURST_WEBP_WIDTHS = Object.freeze({
  'a-person-mid-jump-on-a-country-road': Object.freeze([960, 1600]),
  'cave-of-wonder-and-lights': Object.freeze([960, 1600]),
  'beach-sunset-silhouettes': Object.freeze([960, 1600]),
  'hiking-though-giants': Object.freeze([960]),
  'fresh-thyme-and-kitchen-scissors': Object.freeze([960]),
  'woman-meditates-cross-legged-under-a-tree': Object.freeze([960]),
  'friends-backpacking-together': Object.freeze([960]),
  'close-up-of-some-running-shoes': Object.freeze([960]),
  'rooftopper-looking-down': Object.freeze([960, 1600]),
  'young-woman-doing-yoga-outside': Object.freeze([960, 1600]),
  'intense-exercise': Object.freeze([960, 1600]),
  'a-person-smiles-holding-a-water-bottle-and-a-yoga-mat': Object.freeze([960]),
  'beige-trainers-in-front-of-yellow-beam': Object.freeze([960]),
  'black-and-white-sneakers-against-purple-and-white': Object.freeze([960]),
  'black-gold-fashion-backpack': Object.freeze([960]),
  'boxing-gym-workout': Object.freeze([960]),
  'core-strength-fitness': Object.freeze([960]),
  'core-strength-workout': Object.freeze([960]),
  'cross-fit-rope-workout': Object.freeze([960]),
  'exercise-stretching': Object.freeze([960]),
  'find-balance': Object.freeze([960, 1600]),
  'fitness-ball': Object.freeze([960]),
  'geometric-socks': Object.freeze([960]),
  'gym-weight-lifting': Object.freeze([960]),
  'jogger-laces-up': Object.freeze([960]),
  'kicking-workout': Object.freeze([960]),
  'ladies-leggings-legs': Object.freeze([960]),
  'ladies-stretch-circle': Object.freeze([960]),
  'ladies-yoga-stretch': Object.freeze([960]),
  'man-running-at-the-track': Object.freeze([960]),
  'meditation-flow': Object.freeze([960]),
  'one-arm-push-up': Object.freeze([960]),
  'person-stretching-in-fitness-clothing': Object.freeze([960, 1600]),
  'purple-yoga-mat-partially-rolled-on-a-wooden-floor': Object.freeze([960]),
  'resting-on-basketball-court': Object.freeze([960]),
  'squatting-exercise': Object.freeze([960]),
  'stretching-on-tire': Object.freeze([960]),
  'strong-ladies': Object.freeze([960]),
  'strong-women-planking': Object.freeze([960]),
  'sunset-hike-to-the-summit': Object.freeze([960, 1600]),
  'taking-care-and-practicing-yoga': Object.freeze([960]),
  'three-laughing-women': Object.freeze([960, 1600]),
  'weighted-squat-exercise': Object.freeze([960]),
  'woman-and-boy-muscle': Object.freeze([960]),
  'woman-does-bridge-pose-yoga-on-path': Object.freeze([960]),
  'woman-strong-band-exercise': Object.freeze([960]),
  'womens-athletic-leggings': Object.freeze([960]),
  // PE-007: derivados generados del JPG 1600px (q80) + mapa completado.
  'woman-lifts-free-weights': Object.freeze([960, 1600]),
  'man-lifts-tire-exercise': Object.freeze([960, 1600]),
  'Working-Out-With-Chalk': Object.freeze([960]),
  'workout-fitness-center': Object.freeze([960]),
})

/**
 * Qué archivo local pide realmente un media, sin la query de caché.
 *
 * Antes esto se llamaba `burstFileSlug()` y solo reconocía
 * `/images/burst/<slug>.jpg`. Con el banco propio ya en 104 huecos y cada PNG
 * pesando ~1,8 MB, medir el peso solo de Burst dejaba fuera lo que de verdad
 * abulta: `/resources` pedía 41,2 MB de imágenes (medido en el build con
 * `probe-imagenes-que-cargan.mjs`). La función ahora devuelve también la
 * carpeta, que es lo que necesita el paso WebP para saber dónde mirar.
 */
function archivoDeMedio(media) {
  if (!media?.src || typeof media.src !== 'string') return null
  const match = media.src.match(/\/images\/([a-z0-9-]+)\/([^/?#]+)\.(?:png|jpe?g|webp)/i)
  if (!match) return null
  return { carpeta: match[1], slug: match[2] }
}

/** Anchos WebP que existen en disco para un archivo del banco propio. */
const BANCO_WEBP_PARES = Object.freeze(['bayona-generated'])
const BANCO_WEBP_ANCHOS = Object.freeze([1600, 1672])

/**
 * Anchos WebP derivados de un media, o `null` si no hay variantes.
 *
 * Dos fuentes, cada una con su criterio, y las dos comprobadas por test:
 *  · `burst/`  -> el mapa explícito `BURST_WEBP_WIDTHS`, porque ahí solo se
 *    derivaron algunos slugs y unos pocos llegaron a 1600.
 *  · `bayona-generated/` -> REGLA, no lista: los 111 PNG tienen par 1600+1672
 *    los generados por `scripts/derivar-webp-banco.py`. Una lista de 111
 *    nombres se desincroniza sola; la regla la vigila
 *    `imageSourceGovernance.test.js`, que falla si alguien añade un PNG sin
 *    derivar.
 */
function webpAnchosDe(media) {
  const archivo = archivoDeMedio(media)
  if (!archivo) return null
  if (BANCO_WEBP_PARES.includes(archivo.carpeta)) return BANCO_WEBP_ANCHOS
  if (archivo.carpeta === 'burst') return BURST_WEBP_WIDTHS[archivo.slug] ?? null
  return null
}

/** URL WebP de un media a un ancho dado. */
function webpUrl(media, ancho) {
  const archivo = archivoDeMedio(media)
  return `/images/${archivo.carpeta}/${archivo.slug}-${ancho}.webp`
}

/** Slug del fichero JPG que realmente sirve un media (`?v=` es solo caché). */
function burstFileSlug(media) {
  const archivo = archivoDeMedio(media)
  return archivo?.carpeta === 'burst' ? archivo.slug : null
}



/**
 * Construye el `srcset` de una imagen del registro.
 *
 * El CDN de Burst redimensiona con `?width=`, pero hasta ahora todas las
 * imágenes se pedían a su ancho máximo (1600 px, o 1000 px en producto) y se
 * mostraban en tarjetas de 300–400 px. `StockImage` incluso declaraba `sizes`
 * sin `srcset`, así que ese `sizes` no servía para nada: el navegador no tenía
 * alternativas entre las que elegir.
 *
 * Con esto, cada hueco recibe el ancho que le toca: menos bytes en móvil y
 * más nitidez en pantallas retina, donde antes se escalaba hacia arriba.
 *
 * Devuelve `null` si la fuente no admite redimensionado (FoodiesFeed sirve
 * archivos fijos), para no anunciar anchos que el CDN no va a respetar.
 */
export function mediaSrcSet(media, widths = MEDIA_WIDTH_LADDER) {
  if (!media?.src || typeof media.src !== 'string') return null
  if (!media.src.includes('width=')) return null

  const maxWidth = Number(media.width) || Math.max(...widths)
  const usable = widths.filter((width) => width <= maxWidth)
  if (usable.length === 0) return null

  /** Se incluye siempre el ancho nativo para no perder el tope de calidad. */
  const ladder = [...new Set([...usable, maxWidth])].sort((a, b) => a - b)

  return ladder
    .map((width) => `${media.src.replace(/width=\d+/, `width=${width}`)} ${width}w`)
    .join(', ')
}

/** Variante de una imagen a un ancho concreto (para preload del LCP). */
export function mediaAtWidth(media, width) {
  if (!media?.src || typeof media.src !== 'string') return media?.src ?? ''
  if (!media.src.includes('width=')) return media.src
  return media.src.replace(/width=\d+/, `width=${Math.round(width)}`)
}

/**
 * Pareja 1x/2x para fondos (`image-set`) y preload del LCP.
 * La consumen `SceneBackground.jsx` (`responsiveBackground`) y el
 * `<link rel="preload">` que genera `vite/emitRouteHtml.js`.
 *
 * Integración 2026-09-17: se restaura la preferencia por los ficheros WebP
 * de producción cuando el slug tiene el par 960+1600 en disco; si no, cae al
 * JPG original con el comportamiento de respaldo intacto. Debe seguir siendo
 * la ÚNICA fuente de esta pareja: si el preload y lo que pinta el CSS
 * difieren, el navegador descarga la imagen del héroe dos veces.
 *
 * 2026-09-22: ampliado al banco propio. OJO con los anchos elegidos, porque
 * `image-set()` selecciona por DENSIDAD y no por ancho de caja: un 1x de 960
 * en un portátil de 1440 px se ve blando. Por eso el banco usa 1600 de 1x y
 * 1672 de 2x (el ancho nativo), no el par 960/1600 de Burst.
 */
export function mediaHeroUrls(media) {
  const widths = webpAnchosDe(media)
  if (widths && widths.length >= 2) {
    const [standard, retina] = [...widths].sort((a, b) => a - b)
    return { standard: webpUrl(media, standard), retina: webpUrl(media, retina) }
  }
  return {
    standard: mediaAtWidth(media, SCENE_WIDTH_1X),
    retina: mediaAtWidth(media, SCENE_WIDTH_2X),
  }
}

/**
 * `srcset` WebP de un media, o `null` si no tiene variantes en disco.
 * Las URLs son ficheros reales (sin query virtual `?w=`). Lo consume
 * `StockImage` en `SceneBackground.jsx` para el `<picture>` con `image/webp`
 * primero y el JPG original como respaldo.
 *
 * Integración 2026-09-17: se restaura la implementación de producción. Antes
 * delegaba en `mediaSrcSet`, que devuelve `null` para los ficheros locales
 * (su `src` usa `&w=`, no `width=`), así que el `<picture>` nunca llegaba a
 * ofrecer WebP y se servía siempre el JPG completo.
 */
export function burstWebpSrcSet(media) {
  const widths = webpAnchosDe(media)
  if (!widths) return null
  return widths.map((width) => `${webpUrl(media, width)} ${width}w`).join(', ')
}

function foodies(slug, src, description) {
  return Object.freeze({
    key: `foodiesfeed:${slug}`,
    src,
    description,
    source: 'FoodiesFeed',
    sourceUrl: `${FOODIES_PAGE}/${slug}`,
    width: 1600,
    height: 1000,
  })
}

const food = Object.freeze({
  /*
   * 2026-09-22 · solo sobreviven las seis entradas que consume `shop.products`.
   * Estaban declaradas once fotos de FoodiesFeed; cinco (`salmonBowl`,
   * `falafelBowl`, `breakfast`, `yogurtBowl`, `greens`) no leía a nadie:
   * `food` no se exporta y únicamente se accede por propiedad explícita en la
   * línea del shop. Se borran para que el guard `imageSourceGovernance` no
   * cuente como «enlace caliente» algo que el sitio nunca pide.
   *
   * Las seis que quedan son fotos de producto de la tienda y siguen dependiendo
   * de un host ajeno (`pub-…r2.dev`). No se sustituyen por una escena de parkour
   * porque sería mentir dos veces: el comprador vería un salto al muro en lugar
   * del bote que compra. Van en la lista de excepciones nombradas del guard, a
   * la espera de fotos propias o de regenerar el producto.
   */
  berrySmoothie: foodies(
    'fresh-smoothie-with-berries',
    'https://pub-aaa82e9851064d22b954c3ebbafc9ae6.r2.dev/legacy/masters/fresh-smoothie-with-berries-oVzwlyxZn6V9J_WgdEdZV.jpg',
    'Batido fresco acompañado de frutos rojos',
  ),
  proteinBrunch: foodies(
    'high-protein-brunch-with-poached-eggs-beans-and-bacon',
    'https://pub-aaa82e9851064d22b954c3ebbafc9ae6.r2.dev/legacy/masters/high-protein-brunch-with-poached-eggs-beans-and-bacon-DKRP6A53Y9evKXYOaTwIu.jpg',
    'Brunch alto en proteína con huevos y legumbres',
  ),
  blueberrySmoothie: foodies(
    'blueberry-smoothie',
    'https://pub-aaa82e9851064d22b954c3ebbafc9ae6.r2.dev/legacy/masters/blueberry-smoothie-h9j79L9hWbMWBLTR6-zXX.jpg',
    'Batido cremoso de arándanos',
  ),
  chickpeaSalad: foodies(
    'mediterranean-chickpea-salad',
    'https://pub-aaa82e9851064d22b954c3ebbafc9ae6.r2.dev/legacy/masters/mediterranean-chickpea-salad-FQXZ4JsOxxfAd1cbn7-CE.jpg',
    'Ensalada mediterránea de garbanzos',
  ),
  vegetables: foodies(
    'fresh-vegetables-in-midair',
    'https://pub-aaa82e9851064d22b954c3ebbafc9ae6.r2.dev/generated/masters/fresh-vegetables-in-midair-AbIlPiCnkYVL-XB8EQm18.jpg',
    'Vegetales frescos suspendidos sobre un fondo limpio',
  ),
  yogurtParfait: foodies(
    'delicious-yogurt-parfait-with-fresh-berries',
    'https://pub-aaa82e9851064d22b954c3ebbafc9ae6.r2.dev/legacy/masters/delicious-yogurt-parfait-with-fresh-berries-cJtBJzkV30_dBilB8RL6B.jpg',
    'Parfait de yogur con frutos rojos frescos',
  ),
})

/**
 * Escenas cinemáticas propias (BAYONA, 1792x1024, JPEG q88 en public/images/scenes).
 * El fondo de lujo pedido por el propietario: playa, casa al aire libre,
 * mansión con vista al mar y parque privado. Reciben el mismo velo carbón +
 * ámbar que el resto de escenas: la diferenciación está en el encuadre y la
 * luz, nunca en un tema de color distinto por página.
 */
export const bayonaScenes = Object.freeze({
  playa: Object.freeze({
    key: 'scene:playa',
    src: '/images/scenes/escena-playa.webp',
    description: 'Playa privada al anochecer con tapete y kettlebell bajo un horizonte ámbar',
    source: 'BAYONA',
    sourceUrl: '',
    width: 1792,
    height: 1024,
  }),
  casa: Object.freeze({
    key: 'scene:casa',
    src: '/images/scenes/escena-casa-terraza.webp',
    description: 'Terraza de entrenamiento al aire libre en una casa minimalista al amanecer',
    source: 'BAYONA',
    sourceUrl: '',
    width: 1792,
    height: 1024,
  }),
  mansion: Object.freeze({
    key: 'scene:mansion',
    src: '/images/scenes/escena-mansion-mar.webp',
    description: 'Interior con vista al mar y tapete listo para entrenar bajo luz dorada',
    source: 'BAYONA',
    sourceUrl: '',
    width: 1792,
    height: 1024,
  }),
  parque: Object.freeze({
    key: 'scene:parque',
    src: '/images/scenes/escena-parque.webp',
    description: 'Parque privado entre niebla y rayos de sol con tapete y kettlebells',
    source: 'BAYONA',
    sourceUrl: '',
    width: 1792,
    height: 1024,
  }),
  problema: Object.freeze({
    key: 'scene:problema',
    src: '/images/scenes/escena-problema-amanecer.webp',
    description: 'Dormitorio premium abriéndose a un gimnasio privado al amanecer: cansancio convertido en decisión',
    source: 'BAYONA',
    sourceUrl: '',
    width: 1792,
    height: 1024,
  }),
  metodo: Object.freeze({
    key: 'scene:metodo',
    src: '/images/scenes/escena-metodo-decision.webp',
    description: 'Mesa de decisión con anatomía, tablet y equipo de entrenamiento para planificar con criterio',
    source: 'BAYONA',
    sourceUrl: '',
    width: 1792,
    height: 1024,
  }),
  appDashboard: Object.freeze({
    key: 'scene:app-dashboard',
    src: '/images/scenes/escena-app-dashboard.webp',
    description: 'Dashboard fitness premium en dispositivos dentro de una suite privada frente al mar',
    source: 'BAYONA',
    sourceUrl: '',
    width: 1792,
    height: 1024,
  }),
  comunidadRooftop: Object.freeze({
    key: 'scene:comunidad-rooftop',
    src: '/images/scenes/escena-comunidad-rooftop.webp',
    description: 'Círculo de entrenamiento en rooftop premium al atardecer con sensación de pertenencia',
    source: 'BAYONA',
    sourceUrl: '',
    width: 1792,
    height: 1024,
  }),
  coachAnonimo: Object.freeze({
    key: 'scene:coach-anonimo',
    src: '/images/scenes/escena-coach-anonimo-terraza.webp',
    description: 'Entrenador de espaldas guiando a una clienta en una terraza privada de lujo frente al mar',
    source: 'BAYONA',
    sourceUrl: '',
    width: 1792,
    height: 1024,
  }),
  nutricionLujo: Object.freeze({
    key: 'scene:nutricion-lujo',
    src: '/images/scenes/escena-nutricion-lujo.webp',
    description: 'Nutrición fitness de lujo con comida real, proteína, vegetales, smoothie y luz mediterránea',
    source: 'BAYONA',
    sourceUrl: '',
    width: 1792,
    height: 1024,
  }),
  longevidadPremium: Object.freeze({
    key: 'scene:longevidad-premium',
    src: '/images/scenes/escena-longevidad-premium.webp',
    description: 'Mujer mayor entrenando fuerza y movilidad con acompañamiento discreto en una terraza premium',
    source: 'BAYONA',
    sourceUrl: '',
    width: 1792,
    height: 1024,
  }),
  parkourGandiaHero: Object.freeze({
    key: 'scene:parkour-gandia-hero',
    src: '/images/scenes/escena-parkour-gandia-hero.webp',
    description: 'Atleta de parkour volando sobre un muro bajo del paseo marítimo de Gandía al amanecer',
    source: 'BAYONA',
    sourceUrl: '',
    width: 1792,
    height: 1024,
  }),
  parkourGandiaTecnica: Object.freeze({
    key: 'scene:parkour-gandia-tecnica',
    src: '/images/scenes/escena-parkour-gandia-tecnica.webp',
    description: 'Precisión técnica de parkour en el puerto y paseo marítimo de Gandía con coach discreto',
    source: 'BAYONA',
    sourceUrl: '',
    width: 1792,
    height: 1024,
  }),
  parkourGandiaSeguridad: Object.freeze({
    key: 'scene:parkour-gandia-seguridad',
    src: '/images/scenes/escena-parkour-gandia-seguridad.webp',
    description: 'Entrenamiento seguro de aterrizaje en Gandía con colchoneta, mar y palmeras de fondo',
    source: 'BAYONA',
    sourceUrl: '',
    width: 1792,
    height: 1024,
  }),
  parkourGandiaCierre: Object.freeze({
    key: 'scene:parkour-gandia-cierre',
    src: '/images/scenes/escena-parkour-gandia-cierre.webp',
    description: 'Atleta mirando el horizonte de la playa de Gandía tras dominar el entorno',
    source: 'BAYONA',
    sourceUrl: '',
    width: 1792,
    height: 1024,
  }),
  procesoGandiaReal: Object.freeze({
    key: 'scene:proceso-gandia-real',
    src: '/images/scenes/escena-proceso-freelance-gandia.webp',
    description: 'Coach freelance premium en Gandía con portátil, libreta, cámara, nutrición y equipo portable para revisar progreso real',
    source: 'BAYONA',
    sourceUrl: '',
    width: 1792,
    height: 1024,
  }),
  /**
   * Escena que ya estaba en disco sin usar. Se registra porque el kit gratuito
   * de la home pedía un fondo con razón de ser, y
   * `BAYONA_DIRECCION_PRODUCTO_UX_2026-09-22.md` §2.2 vetaba seguir montando
   * cajas sueltas sobre negro.
   */
  mesaMateriales: Object.freeze({
    key: 'scene:mesa-materiales',
    src: '/images/scenes/escena-proceso-datos-premium.webp',
    description: 'Mesa de trabajo premium con tablet, libreta, cinta y kettlebell: el material BAYONA antes de la primera sesión',
    source: 'BAYONA',
    sourceUrl: '',
    width: 1672,
    height: 941,
  }),
})

const GENERATED_BAYONA_SCENES = new Set([
  'home-hero',
  'home-ninety-days',
  'home-method',
  'home-community',
  'home-proof',
  'home-free-kit',
  'home-problem-fatigue',
  'home-problem-no-results',
  'home-problem-body-signals',
  'home-problem-no-time',
  'home-pillar-read',
  'home-pillar-build',
  'home-pillar-track',
  'about-hero',
  'about-story',
  'about-value-criterio',
  'about-value-humanidad',
  'about-value-tecnologia',
  'about-value-exigencia',
  'about-timeline-movement',
  'about-timeline-parkour',
  'about-timeline-formation',
  'about-timeline-bayona',
  'programs-hero',
  'programs-audience-kids',
  'programs-audience-youth',
  'programs-audience-adults',
  'programs-audience-athletes',
  'programs-audience-senior',
  'programs-pillar-decisions',
  'programs-pillar-progress',
  'programs-pillar-support',
  'programs-ninety-days',
  'programs-community',
  'plan-raiz-hero',
  'plan-raiz-poster',
  'plan-fuerza-hero',
  'plan-fuerza-poster',
  'plan-rendimiento-hero',
  'plan-rendimiento-poster',
  'plan-elite-hero',
  'plan-elite-poster',
  'shop-hero',
  'shop-origins',
  'shop-movement',
  'shop-strength',
  'shop-recovery',
  'app-hero',
  'app-vision-system',
  'app-vision-coach',
  'app-vision-ritual',
  'app-vision-community',
  'app-vision-motion',
  'app-pain-chaos',
  'app-pain-no-plan',
  'app-pain-flat-app',
  'app-feature-program',
  'app-feature-habits',
  'app-feature-progress',
  'app-feature-dashboard',
  'app-feature-client',
  'community-hero',
  'community-feeling-belonging',
  'community-feeling-learning',
  'community-feeling-advance',
  'community-feeling-grow',
  'community-tier-open',
  'community-tier-active',
  'community-tier-private',
  'community-stories',
  'community-entry',
  /*
   * `community-entry.png` estaba en el banco sin ningún hueco que lo pidiera
   * (huerfano de la auditoría) y `community-group` era el único hueco de
   * Comunidad sin imagen propia, tirando de la escena de respaldo que ya usa
   * otra sección. Se copia el original al nombre exacto del hueco y se conserva
   * el archivo de origen. Queda declarado: no es la escena de grupo que pide el
   * texto («Grupo premium conectado por ritual, movimiento y dirección»), es una
   * sola persona leyendo el entorno al atardecer; mientras no se pueda generar
   * una nueva, es preferible a repetir la foto de otra sección.
   */
  'community-group',
  'resources-hero',
  'resources-challenge',
  'resources-step-start',
  'resources-step-train',
  'resources-step-register',
  'resources-step-blocks',
  'resources-step-thirty',
  'resources-step-recover',
  'resources-fresh-week',
  'resources-fresh-care',
  /*
   * Huecos que estaban sin imagen de la generación nueva (22-09-2026). Cada uno
   * se cubre con una fotografía del banco inclusivo que ya cumplía las reglas del
   * brief —dos personas máximo (entrenador + entrenado, o abuelo + nieto),
   * obstáculo bajo, técnica creíble, sin texto ni logos, 1672×941 (16:9)— y se
   * copia con el nombre exacto del hueco. El archivo `bank-*` original se
   * conserva: el banco sigue siendo fuente reutilizable.
   *
   *   parkour-hero          <- bank-teen-landing          recepción controlada
   *   parkour-levels        <- bank-child-supported-vault vault acompañado
   *   parkour-safety        <- bank-senior-woman-step     paso controlado asistido
   *   parkour-closing       <- bank-grandfather-child-vault dos generaciones, mismo gesto
   *   onboarding-threshold  <- bank-child-precision-jump  el primer salto
   *   faq-hero              <- bank-senior-man-balance    equilibrio, duda resuelta
   */
  'parkour-hero',
  'parkour-levels',
  'parkour-safety',
  'parkour-closing',
  'onboarding-threshold',
  'faq-hero',
  /*
   * Seis huecos de `/resources` que estaban en la generación anterior, sacados
   * del lote de `public/images/bayona-visuals/` (1792×1024). Ese lote lleva una
   * capa translúcida que cruza el encuadre en una franja horizontal: medido
   * columna a columna, el salto de brillo aparece en el 97-100 % de las columnas
   * de estas seis, o sea es una capa uniforme y no un recorte de otra foto, y
   * por eso se puede quitar restando el escalón por debajo de la línea (con un
   * fundido de 26 filas para no dejar corte nuevo). Después se recortan a la
   * geometría del banco, 1672×941.
   *
   * Criterio de elección: entra solo la que le gana a la escena que estaba
   * compartiendo. Se quedaron fuera `resources-topic-nutrition` y
   * `resources-topic-motivation` (la escena de respaldo —nutrición de lujo y
   * horizonte de playa— cuenta mejor ese mensaje), y cuatro que incumplen reglas
   * de contenido por muy limpias que queden: `topic-mindset` (cuatro piernas sin
   * cara), `topic-data` (seis personas en una terraza), `topic-security`
   * (periódico con titulares legibles) y `topic-relationship` / `topic-training`
   * (en estas dos la franja sí es un recorte de otra foto: no reparable).
   *
   * Trazabilidad: origen, fila de la costura y magnitud del escalón en
   * `docs/IMAGENES-REPARADAS.md`. Revertir = borrar estos seis PNG y sus seis
   * nombres aquí; el JPG de origen sigue intacto en `bayona-visuals/`.
   */
  'resources-fresh-nutrition',
  'resources-magazine',
  'resources-topic-rest',
  'resources-topic-health',
  'resources-topic-business',
  'resources-topic-creativity',
  /*
   * Las dos últimas que admitían reparación limpia: el escalón aparece en el
   * 99 % de las columnas (capa uniforme, no recorte) y el contenido no incumple
   * ninguna regla. Antes de esto se estaban sirviendo desde el lote con
   * costura, en producción.
   */
  'resources-topic-nutrition',
  'resources-topic-motivation',
  /*
   * Colocada el 22-09-2026 desde `public/images/scenes/`, que es fotografía
   * propia de BAYONA y NO la misma imagen que ningún PNG del banco (comparada
   * por miniatura: la más parecida es `home-pillar-track.png` con una
   * diferencia media de 38 sobre 255). Era la última original del proyecto que
   * no pintaba ninguna de las dos bocas.
   *
   * El hueco estaba servido con `escena-comunidad-rooftop.jpg`: un grupo de
   * unas ocho personas sobre la terraza. El brief prohíbe multitudes y grupos
   * decorativos y fija dos personas como máximo, así que era un incumplimiento
   * de contenido, no una preferencia estética.
   */
  'resources-topic-relationship',
  /*
   * 22-09-2026 · los cinco últimos huecos con nombre propio.
   *
   * Cada uno de estos ya mostraba una fotografía propia de BAYONA, pero servida
   * desde `public/images/scenes/` con el nombre de la escena, no con el del
   * hueco. El brief pide las dos cosas a la vez —«todos los huecos tienen su PNG
   * correspondiente» y «una imagen diferente en cada sección»—, y la forma de
   * cumplirlas sin mover un píxel de la pantalla es copiar ESA MISMA foto al
   * banco con el nombre exacto del hueco, conservando el original curated.
   * Procedimiento y comprobaciones en `scripts/colocar-desde-curated.py`.
   *
   * Coste real y declarado: un PNG del banco pesa entre 1,2 y 2,1 MB frente a
   * los ~300 KB del JPG del que viene. Estos cinco suman 7,9 MB en `/resources`.
   * Es el precio de servir PNG con el nombre del hueco; el resto del banco ya lo
   * hace en 96 archivos. Si algún día se sirve con WebP desde `bayona-generated`
   * (hoy solo lo tiene `burst/`), esto se recorta a la tercera parte.
   *
   * `resources-topic-data` es la única que estaba ya duplicada de antes: su
   * escena, `escena-app-dashboard.jpg`, la pinta también el configurador de
   * servicios de `/`. Convertirla no añade una aparición, mantiene las dos.
   */
  'resources-topic-training',
  'resources-topic-mindset',
  'resources-topic-data',
  'resources-topic-meditation',
  'resources-topic-security',
  /*
   * Y los tres paneles de «Servicios sueltos», por el mismo procedimiento: la
   * escena curated ya era la correcta (parkour de Gandía, dos personas como
   * máximo, sin gimnasio de fondo), solo faltaba el archivo con el nombre del
   * hueco. Ninguna de esas tres curated la pide otro canal, así que no se
   * duplica ninguna fotografía al convertirla.
   */
  'programs-service-tecnica',
  'programs-service-recuperacion',
  'programs-service-rendimiento',
])

function cinematicScene(scene, slot, description, { width = 1792, height = 1024 } = {}) {
  const isOriginalGeneration = GENERATED_BAYONA_SCENES.has(slot)
  return Object.freeze({
    ...scene,
    key: `scene:${slot}`,
    /*
     * Dos estados, y el segundo cambió el 22-09-2026.
     *
     * Registrado  -> su PNG de `bayona-generated/`.
     * Sin registrar -> la escena curated que llega como primer argumento.
     *
     * Antes, sin registrar caía a `/images/bayona-visuals/<slot>.jpg`. Ese lote
     * está retirado: medido fila a fila, casi todos sus fotogramas llevan una
     * capa translúcida cruzando el encuadre, y varios incumplen reglas de
     * contenido del brief (multitud, texto legible, más de dos personas). Se
     * estaba sirviendo en producción en seis huecos de `/resources`. Volver a la
     * escena curated es lo que había antes de aquel lote: correcto para el
     * mensaje y sin defecto visible.
     */
    src: isOriginalGeneration ? `/images/bayona-generated/${slot}.png` : scene.src,
    description,
    source: isOriginalGeneration ? 'BAYONA original generation' : 'BAYONA escena curated',
    sourceUrl: '',
    width,
    height,
  })
}

/*
 * Nota 2026-09-22 · por qué NO hay un helper de «reutilizar PNG del banco».
 *
 * Al retirar las fotos de banco externo se intentó apuntar dos secciones a la
 * misma imagen propia. El invariante del final de este fichero
 * (`siteMediaInventory` → URL duplicada) lo cortó de raíz, y tiene razón:
 * duplicar una URL —o copiar el mismo PNG con otro nombre— engorda el inventario
 * de duplicados sin aportar una fotografía nueva. Cuando el banco se queda sin
 * originals libres (95 de 102 en uso, los 7 restantes asignados a CSS) la salida
 * correcta es la escena curated propia de BAYONA en `public/images/scenes/`, que
 * también es original del proyecto y aún tiene doce fotogramas sin colocar.
 */

export const siteMedia = Object.freeze({
  home: Object.freeze({
    hero: cinematicScene(bayonaScenes.playa, 'home-hero', 'Playa privada BAYONA con luz ámbar, kettlebell y profundidad cinematográfica'),
    ninetyDays: cinematicScene(bayonaScenes.coachAnonimo, 'home-ninety-days', 'Coach anónimo guiando una sesión privada: el plan de 90 días se vuelve tangible'),
    method: cinematicScene(bayonaScenes.mansion, 'home-method', 'Suite fitness premium con método, control y vista al mar'),
    community: cinematicScene(bayonaScenes.comunidadRooftop, 'home-community', 'Salud a largo plazo: fuerza, movilidad y acompañamiento real en cada etapa'),
    proof: cinematicScene(bayonaScenes.procesoGandiaReal, 'home-proof', 'Proceso freelance real en Gandía: datos, libreta, cámara y equipo portable sin prometer instalaciones falsas'),
    /** Fondo del kit gratuito: los materiales que se entregan, ya sobre la mesa. */
    freeKit: cinematicScene(bayonaScenes.mesaMateriales, 'home-free-kit', 'El kit de entrada BAYONA sobre una mesa de trabajo premium: libreta, tablet y equipo listos'),
    problems: Object.freeze([
      cinematicScene(bayonaScenes.problema, 'home-problem-fatigue', 'Cansancio matutino convertido en una invitación a recuperar dirección'),
      cinematicScene(bayonaScenes.parque, 'home-problem-no-results', 'Entrenar sin resultados requiere lectura, no más improvisación'),
      cinematicScene(bayonaScenes.nutricionLujo, 'home-problem-body-signals', 'Señales del cuerpo respondidas con entrenamiento, comida real y cuidado inteligente'),
      cinematicScene(bayonaScenes.appDashboard, 'home-problem-no-time', 'Tiempo limitado organizado por una interfaz clara y premium'),
    ]),
    pillars: Object.freeze([
      cinematicScene(bayonaScenes.metodo, 'home-pillar-read', 'Valoración visual del punto de partida antes de entrenar'),
      cinematicScene(bayonaScenes.longevidadPremium, 'home-pillar-build', 'Construcción del plan con guía privada, técnica visible y entorno premium'),
      cinematicScene(bayonaScenes.appDashboard, 'home-pillar-track', 'Seguimiento premium para ajustar sin perder el hilo'),
    ]),
  }),
  about: Object.freeze({
    hero: cinematicScene(bayonaScenes.mansion, 'about-hero', 'Origen BAYONA contado desde una mansión fitness frente al mar'),
    story: cinematicScene(bayonaScenes.casa, 'about-story', 'Terraza de alto rendimiento donde tecnología y cuerpo se encuentran'),
    values: Object.freeze([
      cinematicScene(bayonaScenes.metodo, 'about-value-criterio', 'Criterio técnico convertido en decisiones visibles'),
      cinematicScene(bayonaScenes.coachAnonimo, 'about-value-humanidad', 'Humanidad y acompañamiento uno a uno sin convertir al coach en protagonista'),
      cinematicScene(bayonaScenes.appDashboard, 'about-value-tecnologia', 'Tecnología al servicio del proceso corporal'),
      cinematicScene(bayonaScenes.longevidadPremium, 'about-value-exigencia', 'Exigencia premium sin ruido ni promesas vacías'),
    ]),
    timeline: Object.freeze([
      cinematicScene(bayonaScenes.parque, 'about-timeline-movement', 'Movimiento como origen en un espacio natural de disciplina'),
      cinematicScene(bayonaScenes.playa, 'about-timeline-parkour', 'Lectura del entorno y adaptación frente a un horizonte abierto'),
      cinematicScene(bayonaScenes.procesoGandiaReal, 'about-timeline-formation', 'Formación aplicada en planificación visual y práctica'),
      cinematicScene(bayonaScenes.comunidadRooftop, 'about-timeline-bayona', 'Nacimiento de BAYONA como sistema de entrenamiento premium'),
    ]),
  }),
  programs: Object.freeze({
    hero: cinematicScene(bayonaScenes.parque, 'programs-hero', 'Programa premium preparado en un parque privado con niebla y luz dorada'),
    audiences: Object.freeze([
      cinematicScene(bayonaScenes.comunidadRooftop, 'programs-audience-kids', 'Niños y familias como pertenencia, juego y confianza guiada'),
      cinematicScene(bayonaScenes.nutricionLujo, 'programs-audience-youth', 'Jóvenes aprendiendo energía, hábitos y nutrición sin extremos'),
      cinematicScene(bayonaScenes.coachAnonimo, 'programs-audience-adults', 'Adultos recuperando fuerza con corrección técnica y acompañamiento premium'),
      cinematicScene(bayonaScenes.metodo, 'programs-audience-athletes', 'Deportistas con planificación, técnica y criterio'),
      cinematicScene(bayonaScenes.longevidadPremium, 'programs-audience-senior', 'Senior con movilidad, autonomía y fuerza en una experiencia cuidada de alto nivel'),
    ]),
    pillars: Object.freeze([
      cinematicScene(bayonaScenes.mesaMateriales, 'programs-pillar-decisions', 'Decisiones explicadas mediante lectura, plan y contexto'),
      cinematicScene(bayonaScenes.appDashboard, 'programs-pillar-progress', 'Progreso revisable en sesiones privadas donde cada repetición tiene intención'),
      cinematicScene(bayonaScenes.longevidadPremium, 'programs-pillar-support', 'Acompañamiento visible para sostener salud, fuerza y autonomía con los años'),
    ]),
    ninetyDays: cinematicScene(bayonaScenes.casa, 'programs-ninety-days', 'Sistema de 90 días conectado a una experiencia tecnológica de entrenamiento'),
    services: Object.freeze([
      /*
       * 2026-09-22 · eran tres fotos de Shopify Burst (`boxing-gym-workout`,
       * `restorative-yoga`, `gym-weight-lifting`): banco externo y gimnasio
       * lleno, las dos cosas que el brief prohíbe expresamente. Son las únicas
       * tres escenas EDITORIALES que quedaban en Burst; los otros 37 archivos
       * de esa carpeta son fotos de producto de la tienda y se tratan aparte.
       *
       * Se resuelven con la escena curated propia de BAYONA que corresponde a
       * cada mensaje, sin registrar: el invariante del final de este fichero
       * exige una URL distinta por sección, y el banco de PNG ya no tiene
       * originals libres (95 de 102 en uso, los 7 restantes asignados a CSS).
       * Duplicar un PNG con otro nombre habría engordado el inventario de
       * duplicados sin aportar una sola fotografía nueva.
       */
      cinematicScene(bayonaScenes.parkourGandiaTecnica, 'programs-service-tecnica', 'Sesión guiada: precisión técnica sobre muro bajo con el coach leyendo el gesto'),
      cinematicScene(bayonaScenes.parkourGandiaSeguridad, 'programs-service-recuperacion', 'Práctica suave de aterrizaje y movilidad con colchoneta, sin prisa y sin multitud'),
      cinematicScene(bayonaScenes.parkourGandiaHero, 'programs-service-rendimiento', 'Rendimiento sobre muro bajo en el paseo marítimo: potencia controlada, sin gimnasio de fondo'),
    ]),
    community: cinematicScene(bayonaScenes.procesoGandiaReal, 'programs-community', 'Ritual de salud que une entrenamiento, nutrición y estilo de vida'),
  }),
  plans: Object.freeze({
    RAIZ: Object.freeze({
      hero: cinematicScene(bayonaScenes.longevidadPremium, 'plan-raiz-hero', 'Base RAÍZ para empezar con salud, movilidad y fuerza sostenible'),
      poster: cinematicScene(bayonaScenes.nutricionLujo, 'plan-raiz-poster', 'Preview RAÍZ con comida real, energía limpia y hábitos sostenibles'),
    }),
    FUERZA: Object.freeze({
      hero: cinematicScene(bayonaScenes.metodo, 'plan-fuerza-hero', 'FUERZA como acompañamiento técnico privado con lujo, control y precisión'),
      poster: cinematicScene(bayonaScenes.casa, 'plan-fuerza-poster', 'Preview FUERZA con tecnología, mancuernas y luz de amanecer'),
    }),
    RENDIMIENTO: Object.freeze({
      hero: cinematicScene(bayonaScenes.mansion, 'plan-rendimiento-hero', 'RENDIMIENTO junto al mar con tensión atlética y horizonte de avance'),
      poster: cinematicScene(bayonaScenes.playa, 'plan-rendimiento-poster', 'Preview RENDIMIENTO con playa privada, reflejos y potencia'),
    }),
    ELITE: Object.freeze({
      hero: cinematicScene(bayonaScenes.coachAnonimo, 'plan-elite-hero', 'ÉLITE como experiencia privada de transformación con coach discreto y entorno de lujo'),
      poster: cinematicScene(bayonaScenes.mansion, 'plan-elite-poster', 'Preview ÉLITE con interior de lujo, precisión y profundidad'),
    }),
  }),
  shop: Object.freeze({
    hero: cinematicScene(bayonaScenes.mansion, 'shop-hero', 'Tienda premium integrada en una suite fitness de lujo'),
    collections: Object.freeze({
      origins: cinematicScene(bayonaScenes.parque, 'shop-origins', 'Colección Origins sobre piedra húmeda, niebla y calma premium'),
      movement: cinematicScene(bayonaScenes.playa, 'shop-movement', 'Colección Movement con energía costera y reflejos cinematográficos'),
      strength: cinematicScene(bayonaScenes.casa, 'shop-strength', 'Colección Strength en terraza de alto rendimiento'),
      recovery: cinematicScene(bayonaScenes.problema, 'shop-recovery', 'Colección Recovery en suite privada de descanso y control'),
    }),
    products: Object.freeze({
      'tank-top-performance': burstProduct('womens-tshirts', 'Camisetas deportivas sin mangas en exposición'),
      'short-tecnico-bayona': burstProduct('ladies-leggings-legs', 'Prenda técnica deportiva para entrenamiento'),
      'legging-pro-mujer': burstProduct('woman-wearing-athletic-leggings', 'Leggings deportivos de ajuste técnico'),
      'camiseta-manga-larga': burstProduct('arm-workout', 'Camiseta de manga larga en una escena de entrenamiento de tren superior'),
      'top-deportivo-mujer': burstProduct('color-matched-workout-clothes', 'Conjunto deportivo coordinado para entrenamiento'),
      'camiseta-compresion': burstProduct('person-stretching-in-fitness-clothing', 'Camiseta técnica ajustada durante una sesión de movilidad'),
      'hoodie-origins': burstProduct('young-man-in-bright-fashion', 'Sudadera urbana de silueta contemporánea'),
      'hoodie-premium': burstProduct('young-man-leans-on-wall', 'Sudadera premium de estilo urbano'),
      'camiseta-origins': burstProduct('tshirts', 'Camisetas básicas de estilo minimalista'),
      'pantalon-jogger-premium': burstProduct('mens-fashion-stonewash-jeans-and-boots', 'Pantalón casual de corte urbano'),
      'gorra-bayona': burstProduct('young-woman-in-hat', 'Gorra casual de estilo contemporáneo'),
      'chaqueta-windstopper': burstProduct('woman-in-jean-jacket', 'Chaqueta ligera para uso exterior'),
      'sudadero-recovery': burstProduct('upward-dog-pose', 'Conjunto cómodo durante movilidad suave y recuperación activa'),
      'calcetines-compresion-pack-3': burstProduct('geometric-socks', 'Calcetines deportivos con diseño geométrico'),
      'zapatillas-move': burstProduct('beige-trainers-in-front-of-yellow-beam', 'Zapatillas de entrenamiento de perfil ligero'),
      'zapatillas-trainer-pro': burstProduct('close-up-of-some-running-shoes', 'Zapatillas técnicas vistas en primer plano'),
      'zapatillas-parkour-free': burstProduct('black-and-white-sneakers-against-purple-and-white', 'Zapatillas urbanas con suela de agarre'),
      'chanclas-recovery': burstProduct('sandals-in-sand', 'Sandalias ligeras para descanso'),
      'bandas-resistencia-set-5': burstProduct('woman-strong-band-exercise', 'Bandas elásticas durante un ejercicio de resistencia'),
      'mancuernas-ajustables': burstProduct('exercise-free-weights', 'Pesos libres preparados para entrenamiento'),
      'kit-reboot': burstProduct('core-strength-workout', 'Equipo esencial dispuesto para una sesión funcional'),
      'foam-roller-pro': burstProduct('spinal-twist-yoga-wheel', 'Accesorio cilíndrico usado en movilidad y recuperación'),
      'pelota-suiza': burstProduct('fitness-ball', 'Pelota de ejercicio para estabilidad y movilidad'),
      'kettlebell-pro': burstProduct('working-out-with-chalk', 'Peso funcional durante un entrenamiento de fuerza'),
      'barra-dominadas-portatil': burstProduct('man-reaching-for-bar', 'Barra elevada utilizada para ejercicios de tracción'),
      'esterilla-premium': burstProduct('purple-yoga-mat-partially-rolled-on-a-wooden-floor', 'Esterilla de entrenamiento parcialmente enrollada'),
      'guantes-parkour': burstProduct('hands-tightly-grip-a-purple-rope', 'Manos protegidas durante un ejercicio de agarre'),
      'mochila-bayona': burstProduct('black-gold-fashion-backpack', 'Mochila deportiva negra de diseño limpio'),
      'botella-smart-bayona': burstProduct('a-person-smiles-holding-a-water-bottle-and-a-yoga-mat', 'Botella reutilizable junto a una esterilla deportiva'),
      'pistola-masaje-pro': burstProduct('massage-therapy-on-upper-back', 'Herramienta de recuperación aplicada sobre la espalda'),
      'reloj-inteligente-bayona': burstProduct('fitness-tracker', 'Reloj de actividad para seguimiento del entrenamiento'),
      'banda-resistencia-inteligente': burstProduct('stationary-bike-workout', 'Tecnología de seguimiento integrada en una sesión deportiva'),
      'bascula-inteligente': burstProduct('arm-back-muscles', 'Lectura corporal y composición física con foco en progreso medible'),
      'whey-protein-bayona': Object.freeze({ ...food.berrySmoothie, width: 1000, height: 1250 }),
      'creatina-monohidrato': Object.freeze({ ...food.proteinBrunch, width: 1000, height: 1250 }),
      'pre-workout-elite': Object.freeze({ ...food.blueberrySmoothie, width: 1000, height: 1250 }),
      'omega-3-premium': Object.freeze({ ...food.chickpeaSalad, width: 1000, height: 1250 }),
      'multivitaminico-elite': Object.freeze({ ...food.vegetables, width: 1000, height: 1250 }),
      'colageno-hidrolizado': Object.freeze({ ...food.yogurtParfait, width: 1000, height: 1250 }),
      'parkour-mastery': burstProduct('one-arm-push-up', 'Atleta dominando una habilidad de fuerza corporal'),
      'elite-fitness': burstProduct('cross-fit-tire-lift', 'Programa visualizado como entrenamiento funcional avanzado'),
      'mindful-warrior': burstProduct('seated-meditation', 'Práctica de concentración y atención corporal'),
      'pack-transformacion-total': burstProduct('workout-fitness-center', 'Espacio completo de entrenamiento y transformación'),
    }),
  }),
  app: Object.freeze({
    hero: cinematicScene(bayonaScenes.appDashboard, 'app-hero', 'App BAYONA como cabina tecnológica de entrenamiento premium'),
    vision: Object.freeze([
      cinematicScene(bayonaScenes.mesaMateriales, 'app-vision-system', 'Panel digital para organizar rutina, recuperación y progreso'),
      cinematicScene(bayonaScenes.coachAnonimo, 'app-vision-coach', 'La app traduce una guía privada real en decisiones simples para el cliente'),
      cinematicScene(bayonaScenes.playa, 'app-vision-ritual', 'Seguimiento diario con horizonte, calma y disciplina'),
      cinematicScene(bayonaScenes.comunidadRooftop, 'app-vision-community', 'Comunidad conectada dentro de un mismo entorno visual'),
      cinematicScene(bayonaScenes.casa, 'app-vision-motion', 'Tecnología móvil integrada a una rutina de movimiento'),
    ]),
    pain: Object.freeze([
      cinematicScene(bayonaScenes.problema, 'app-pain-chaos', 'El caos diario aparece cuando el cuerpo no tiene contexto'),
      cinematicScene(bayonaScenes.metodo, 'app-pain-no-plan', 'La rutina genérica se reemplaza por lectura y criterio'),
      cinematicScene(bayonaScenes.appDashboard, 'app-pain-flat-app', 'Una app plana se transforma en una experiencia de seguimiento premium'),
    ]),
    features: Object.freeze([
      cinematicScene(bayonaScenes.mesaMateriales, 'app-feature-program', 'Constructor de rutina sobre una placa tecnológica premium'),
      cinematicScene(bayonaScenes.longevidadPremium, 'app-feature-habits', 'Hábitos diarios pensados para sostener energía, movilidad y autonomía'),
      cinematicScene(bayonaScenes.mansion, 'app-feature-progress', 'Progreso físico con horizonte claro y luz cinematográfica'),
      cinematicScene(bayonaScenes.procesoGandiaReal, 'app-feature-dashboard', 'Dashboard conectado a sesiones privadas, técnica y seguimiento del cuerpo real'),
      cinematicScene(bayonaScenes.metodo, 'app-feature-client', 'Experiencia del cliente unificada entre tecnología, lectura y entrenamiento'),
    ]),
  }),
  community: Object.freeze({
    hero: cinematicScene(bayonaScenes.comunidadRooftop, 'community-hero', 'Comunidad BAYONA reunida alrededor de un ritual premium de movimiento'),
    feelings: Object.freeze([
      cinematicScene(bayonaScenes.comunidadRooftop, 'community-feeling-belonging', 'Pertenecer a un círculo que sostiene el proceso'),
      cinematicScene(bayonaScenes.metodo, 'community-feeling-learning', 'Aprender con criterio, notas visuales y estructura'),
      cinematicScene(bayonaScenes.playa, 'community-feeling-advance', 'Avanzar hacia un horizonte claro con energía colectiva'),
      cinematicScene(bayonaScenes.longevidadPremium, 'community-feeling-grow', 'Crecer también significa moverte mejor, más fuerte y con más años por delante'),
    ]),
    tiers: Object.freeze([
      cinematicScene(bayonaScenes.parque, 'community-tier-open', 'Acceso abierto para empezar desde salud, calma y movimiento sostenible'),
      cinematicScene(bayonaScenes.coachAnonimo, 'community-tier-active', 'Acompañamiento activo con corrección, accountability y una experiencia cercana'),
      cinematicScene(bayonaScenes.mansion, 'community-tier-private', 'Ambiente privado de alto nivel para acompañamiento premium'),
    ]),
    stories: cinematicScene(bayonaScenes.problema, 'community-stories', 'Historias reales: del cansancio a una decisión sostenida'),
    group: cinematicScene(bayonaScenes.comunidadRooftop, 'community-group', 'Grupo premium conectado por ritual, movimiento y dirección'),
  }),
  resources: Object.freeze({
    hero: cinematicScene(bayonaScenes.procesoGandiaReal, 'resources-hero', 'Biblioteca premium de entrenamiento, nutrición, cuerpo y decisiones diarias'),
    challenge: cinematicScene(bayonaScenes.comunidadRooftop, 'resources-challenge', 'Reto visualizado como ritual colectivo frente al horizonte'),
    steps: Object.freeze([
      cinematicScene(bayonaScenes.problema, 'resources-step-start', 'Primer paso: dejar de improvisar y preparar el entorno'),
      cinematicScene(bayonaScenes.casa, 'resources-step-train', 'Sesión del día en un espacio claro y premium'),
      cinematicScene(bayonaScenes.appDashboard, 'resources-step-register', 'Registro visual de evidencia, carga y sensación'),
      cinematicScene(bayonaScenes.mesaMateriales, 'resources-step-blocks', 'Bloques progresivos explicados con criterio'),
      cinematicScene(bayonaScenes.coachAnonimo, 'resources-step-thirty', 'Llegar a 30 días con comunidad y responsabilidad'),
      cinematicScene(bayonaScenes.longevidadPremium, 'resources-step-recover', 'Recuperación, movilidad y fuerza como inversión en tu futuro físico'),
    ]),
    fresh: Object.freeze([
      cinematicScene(bayonaScenes.metodo, 'resources-fresh-week', 'Estructurar la semana desde un tablero de decisiones'),
      cinematicScene(bayonaScenes.problema, 'resources-fresh-care', 'Pasar de castigarte a cuidarte con un entorno claro'),
      cinematicScene(bayonaScenes.nutricionLujo, 'resources-fresh-nutrition', 'Nutrición sin extremos: comida real que se ve rica, premium y sostenible'),
    ]),
    magazine: cinematicScene(bayonaScenes.mansion, 'resources-magazine', 'Editorial BAYONA con tecnología, luz dorada y sistema'),
    topics: Object.freeze([
      cinematicScene(bayonaScenes.casa, 'resources-topic-training', 'Entrenamiento dinámico con estética de rendimiento premium'),
      cinematicScene(bayonaScenes.nutricionLujo, 'resources-topic-nutrition', 'Nutrición fitness de lujo: proteína, color, saciedad y deseo de cuidarte'),
      cinematicScene(bayonaScenes.parque, 'resources-topic-mindset', 'Mentalidad y respiración en un espacio natural controlado'),
      cinematicScene(bayonaScenes.longevidadPremium, 'resources-topic-rest', 'Descanso, movilidad y fuerza para rendir sin romper el cuerpo'),
      cinematicScene(bayonaScenes.metodo, 'resources-topic-business', 'Decisiones de alto nivel aplicadas al cuerpo'),
      cinematicScene(bayonaScenes.appDashboard, 'resources-topic-data', 'Datos convertidos en lectura útil, no ruido'),
      cinematicScene(bayonaScenes.procesoGandiaReal, 'resources-topic-relationship', 'Mesa de trabajo con portátil, libreta y equipo frente a los tejados de Gandía: quien contesta al otro lado', { width: 1672, height: 941 }),
      cinematicScene(bayonaScenes.mansion, 'resources-topic-meditation', 'Atención y calma para sostener el entrenamiento'),
      cinematicScene(bayonaScenes.procesoGandiaReal, 'resources-topic-health', 'Salud visible en hábitos que combinan movimiento, comida real y energía'),
      cinematicScene(bayonaScenes.playa, 'resources-topic-motivation', 'Motivación convertida en horizonte y acción'),
      cinematicScene(bayonaScenes.mesaMateriales, 'resources-topic-security', 'Tecnología y datos con sensación de control'),
      cinematicScene(bayonaScenes.coachAnonimo, 'resources-topic-creativity', 'Creatividad aplicada a diseñar una vida entrenable'),
    ]),
  }),
  parkourAcademy: Object.freeze({
    hero: cinematicScene(bayonaScenes.parkourGandiaHero, 'parkour-hero', 'Parkour en Gandía: lectura del espacio, costa mediterránea y potencia controlada', { width: 1800, height: 1125 }),
    levels: cinematicScene(bayonaScenes.parkourGandiaTecnica, 'parkour-levels', 'Niveles técnicos en el paseo y puerto de Gandía: precisión antes que espectáculo', { width: 1801, height: 1126 }),
    safety: cinematicScene(bayonaScenes.parkourGandiaSeguridad, 'parkour-safety', 'Seguridad y preparación real en Gandía: aterrizajes, control y progresión', { width: 1802, height: 1127 }),
    closing: cinematicScene(bayonaScenes.parkourGandiaCierre, 'parkour-closing', 'Cierre aspiracional en la playa de Gandía: dominar el entorno sin perder el control', { width: 1803, height: 1128 }),
  }),
  faq: Object.freeze({
    hero: cinematicScene(bayonaScenes.parque, 'faq-hero', 'Preguntas importantes resueltas en una atmósfera serena y premium'),
  }),
  onboarding: Object.freeze({
    threshold: cinematicScene(bayonaScenes.casa, 'onboarding-threshold', 'Entrada al sistema BAYONA desde una terraza tecnológica de lujo'),
  }),
})

function collectMedia(value, result = []) {
  if (!value || typeof value !== 'object') return result
  if (typeof value.src === 'string' && typeof value.key === 'string') {
    result.push(value)
    return result
  }
  Object.values(value).forEach((item) => collectMedia(item, result))
  return result
}

export const siteMediaInventory = Object.freeze(collectMedia(siteMedia))

const uniqueSources = new Set(siteMediaInventory.map(({ src }) => src))
if (uniqueSources.size !== siteMediaInventory.length) {
  throw new Error(`El registro multimedia contiene ${siteMediaInventory.length - uniqueSources.size} URL duplicadas.`)
}
