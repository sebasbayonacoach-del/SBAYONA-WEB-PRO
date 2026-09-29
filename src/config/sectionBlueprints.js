/**
 * Registro anti-repetición de secciones (brief §50 y §51).
 *
 * El brief exige que ninguna sección repita la estructura de su vecina y pide
 * «un registro interno de diseños utilizados». Este módulo es la única fuente de
 * dos cosas:
 *
 *  1. `LAYOUTS`, el vocabulario CERRADO de estructuras narrativas. Una sección
 *     no puede declararse con un layout que no esté aquí: eso obliga a elegir de
 *     verdad una forma distinta en vez de renombrar la misma.
 *  2. `classifyLayout`, el mapeo de las clases reales del DOM a ese vocabulario,
 *     para que la medición se haga sobre lo que hay en pantalla y no sobre lo
 *     que alguien declaró en un JSON.
 *
 * La medición la hace scripts/measure-section-repetition.mjs sobre el preview
 * construido. Aquí solo vive lógica pura, para que sea comprobable sin navegador.
 *
 * GOBERNANZA: la diferenciación NUNCA puede declararse como «otro color / otro
 * gradiente / otro tema». Por eso `THEME_WORDS` bloquea ese tipo de nombres.
 */

export const LAYOUTS = Object.freeze({
  FULLSCREEN: 'fullscreen',
  CINEMATIC: 'cinematic',
  EDITORIAL: 'editorial',
  SPLIT: 'split',
  HORIZONTAL: 'horizontal',
  SCROLL_STORY: 'scroll-story',
  DATA: 'data',
  MAP: 'map',
  TIMELINE: 'timeline',
  PRODUCT: 'product',
  COMMUNITY: 'community',
  CONFIGURATOR: 'configurator',
  DASHBOARD: 'dashboard',
  INTERACTIVE: 'interactive',
  IMMERSIVE_3D: 'immersive-3d',
  BRIDGE: 'bridge',
  CLOSING: 'closing',
})

/** Palabras que jamás pueden servir para justificar que una sección es distinta. */
export const THEME_WORDS = Object.freeze([
  'theme',
  'dark',
  'light',
  'gradient',
  'color',
  'colour',
  'tint',
  'palette',
])

/**
 * Clases del DOM → layout del vocabulario.
 *
 * El orden importa: se prueba de arriba abajo y gana la primera coincidencia,
 * así que las firmas más específicas van primero. Una clase no listada cae en
 * `UNCLASSIFIED`, que el guard trata como deuda: no se puede contar como
 * diferencia lo que nadie supo nombrar.
 */
const LAYOUT_BY_CLASS = Object.freeze([
  // El check-in del Protocolo es la única planta DASHBOARD del sitio: cuadrícula
  // de hábitos por día, gobernada por el estado. No existe nada igual al lado.
  ['protocolo-checkin', LAYOUTS.DASHBOARD],

  ['hero-module', LAYOUTS.FULLSCREEN],
  ['academy-hero', LAYOUTS.FULLSCREEN],
  ['community-hero', LAYOUTS.FULLSCREEN],
  ['resources-hero', LAYOUTS.FULLSCREEN],
  ['shop-hero', LAYOUTS.FULLSCREEN],
  ['page-hero', LAYOUTS.FULLSCREEN],

  ['home-passage', LAYOUTS.SCROLL_STORY],
  ['about-story', LAYOUTS.SCROLL_STORY],
  ['programs-visualization', LAYOUTS.SCROLL_STORY],

  ['home-editorial', LAYOUTS.EDITORIAL],
  ['faq-section', LAYOUTS.EDITORIAL],
  ['about-values', LAYOUTS.EDITORIAL],
  ['community-why', LAYOUTS.EDITORIAL],
  ['academy-method', LAYOUTS.EDITORIAL],

  ['cb-bridge', LAYOUTS.BRIDGE],
  ['about-bridge', LAYOUTS.BRIDGE],

  ['video-section', LAYOUTS.CINEMATIC],
  ['shop-feature', LAYOUTS.CINEMATIC],
  ['academy-levels', LAYOUTS.CINEMATIC],

  ['mechanism-section', LAYOUTS.DATA],
  ['programs-method', LAYOUTS.DATA],
  ['about-method', LAYOUTS.DATA],
  ['community-week', LAYOUTS.TIMELINE],
  ['shop-process', LAYOUTS.TIMELINE],
  ['academy-logistics', LAYOUTS.TIMELINE],

  ['about-globe', LAYOUTS.MAP],
  // Bug de clasificación, no de diseño: la clase `experience-proof-section`
  // contiene la cadena `proof-section`, así que la entrada de abajo la capturaba
  // primero y le asignaba MAP. La sección nunca fue un mapa —es una página de
  // citas sobre plano hueso, interactiva—; era el substring. Se declara antes
  // para que gane la coincidencia correcta, igual que con community-manifest.
  ['experience-proof', LAYOUTS.INTERACTIVE],
  ['proof-section', LAYOUTS.MAP],

  ['free-value', LAYOUTS.PRODUCT],
  ['lead-magnet', LAYOUTS.PRODUCT],
  ['shop-collections', LAYOUTS.PRODUCT],
  ['shop-catalog', LAYOUTS.PRODUCT],
  ['resources', LAYOUTS.PRODUCT],

  ['offer-section', LAYOUTS.SPLIT],
  ['memberships', LAYOUTS.SPLIT],
  ['programs-offer', LAYOUTS.SPLIT],
  ['programs-comparison', LAYOUTS.DATA],
  ['programs-pain', LAYOUTS.SPLIT],
  ['pain-section', LAYOUTS.SPLIT],
  ['about-problem', LAYOUTS.SPLIT],

  ['calculator-section', LAYOUTS.CONFIGURATOR],
  ['services-configurator', LAYOUTS.CONFIGURATOR],
  ['programs-calculator', LAYOUTS.CONFIGURATOR],
  // Corrección de mapa, no de número. `programs-services` estaba declarado
  // CONFIGURATOR por estar junto al configurador de verdad, pero no configura
  // nada: es un `program-service-showroom-shell` —un `<nav>` de categorías con
  // su contador y un panel de fichas con precio y «añadir al carrito»—. Esa es
  // la misma planta que el catálogo de la tienda, PRODUCT, y no hay ningún total
  // que calcular. El único configurador de la ruta es `programs-calculator`, que
  // es justo el que está debajo; declararlos distintos es describir el sitio.
  ['programs-services', LAYOUTS.PRODUCT],

  // «una persona BAYONA» dejó de ser una rejilla de tarjetas y es un manifiesto
  // numerado. Va antes que community-person porque el clasificador gana la
  // primera coincidencia y ambas clases siguen en el elemento.
  ['community-manifest-section', LAYOUTS.EDITORIAL],
  ['community-feeling', LAYOUTS.COMMUNITY],
  ['community-person', LAYOUTS.COMMUNITY],
  // «lo último, en movimiento» es ahora un raíl horizontal que sangra por el
  // borde. Antes que community-live en la lista: el clasificador gana la primera
  // coincidencia y ambas clases siguen presentes.
  ['community-rail-section', LAYOUTS.HORIZONTAL],
  // HISTORIAS dejó de ser un carrusel horizontal con las fichas duplicadas: ahora
  // es una página partida —la regla a la izquierda, el índice a la derecha—, así
  // que su planta es SPLIT y no la retícula de fichas de antes.
  ['community-stories', LAYOUTS.SPLIT],
  ['community-live', LAYOUTS.COMMUNITY],
  ['community-group', LAYOUTS.COMMUNITY],
  ['community-access', LAYOUTS.COMMUNITY],
  // ENTRAR volvió a enseñar los números que el CSS ya le reservaba y el hilo que
  // los une: tres pasos leídos de arriba abajo son una línea de tiempo, no una
  // retícula de comunidad.
  ['community-entry', LAYOUTS.TIMELINE],

  ['cta-stack', LAYOUTS.CLOSING],
  // «share-invite» estaba etiquetada como cierre por su posición, no por su
  // naturaleza: es el único bloque del cascarón que HACE algo —abre la hoja de
  // compartir del sistema o copia el enlace y cambia de estado—, y desde la fase
  // 5 abre con el testigo dibujado. La etiqueta era un resto viejo, y su coste
  // era real: aparecía como segundo cierre consecutivo en tres rutas.
  ['share-invite', LAYOUTS.INTERACTIVE],
  ['academy-closing', LAYOUTS.CLOSING],
  // La antigua «community-closing» se despidió dos veces seguidas: ella y
  // «share-invite», planta CLOSING las dos. Se le añadió la banda de imagen que
  // enseña el grupo y desde entonces hace de puente (entrega a WhatsApp y a
  // /programs). El único cierre de la ruta es «PÁSALO. NO CUESTA NADA.».
  ['community-closing', LAYOUTS.BRIDGE],
  ['academy-paths', LAYOUTS.HORIZONTAL],
  ['academy-safety', LAYOUTS.DATA],
  ['academy-faq', LAYOUTS.EDITORIAL],
  // El bloque de contacto del FAQ no es interactivo —lo interactivo de /faq es
  // el acordeón de arriba—: son tres maneras de ir a hablar con una persona.
  ['faq-contact', LAYOUTS.BRIDGE],
  ['solution-section', LAYOUTS.SPLIT],
])

export const UNCLASSIFIED = 'unclassified'

/**
 * Devuelve el nombre de layout que corresponde a una lista de clases.
 * @param {string[]} classes
 * @returns {string}
 */
export function classifyLayout(classes) {
  const joined = classes.join(' ').toLowerCase()
  for (const [needle, layout] of LAYOUT_BY_CLASS) {
    if (joined.includes(needle)) return layout
  }
  return UNCLASSIFIED
}

/**
 * Repeticiones contiguas: dos secciones seguidas con el mismo layout. Es la
 * violación literal de «si una sección utilizó X, la siguiente no debe».
 * @param {{layout: string}[]} entries
 * @returns {{index: number, layout: string}[]}
 */
export function adjacentRepeats(entries) {
  const repeats = []
  for (let i = 1; i < entries.length; i += 1) {
    if (entries[i].layout !== UNCLASSIFIED && entries[i].layout === entries[i - 1].layout) {
      repeats.push({ index: i, layout: entries[i].layout })
    }
  }
  return repeats
}

/**
 * Secciones que nadie supo nombrar. Cuentan como deuda: sin nombre no hay
 * decisión de diseño registrada.
 * @param {{layout: string}[]} entries
 */
export function unclassified(entries) {
  return entries.filter(({ layout }) => layout === UNCLASSIFIED)
}

/** ¿El nombre intenta colar una diferencia de tema en vez de estructura? */
export function isThemeClaim(name) {
  const lower = String(name).toLowerCase()
  return THEME_WORDS.some((word) => lower.includes(word))
}

/**
 * Techos de deuda por ruta. SOLO PUEDEN BAJAR.
 *
 * Valores MEDIDOS el 2026-09-19 con scripts/measure-section-repetition.mjs sobre
 * el preview construido a 1440px. No son una aspiración: son la foto de lo que
 * hay hoy en pantalla. Subir cualquiera de estos números rompe la build.
 *
 * El total del sitio es 10 repeticiones contiguas. /community concentra 6: diez
 * secciones seguidas comparten la misma planta (`community-section
 * community-reveal`) y solo cambia la tercera clase. Bajar de ahí exige rediseñar
 * esas secciones, no reclasificarlas — mover el mapa de clases para que el número
 * baje sería medir el medidor en vez de medir la web.
 */
export const REPEAT_CEILING = Object.freeze({
  // 1 → 0. No es un rediseño: era un falso positivo del propio mapa. La clase
  // `experience-proof-section` contiene la cadena `proof-section`, así que la
  // entrada de MAP la ganaba por primera coincidencia y le prestaba una planta
  // que nunca tuvo —la sección es una página de citas sobre plano hueso, y su
  // entrada INTERACTIVE ya estaba declarada debajo, inalcanzable. Se corrigió el
  // orden, no el número. El caso análogo (community-manifest) está anotado en el
  // mapa. Lo que queda en /programs sí es una repetición real y se deja.
  '/': 0,
  '/about': 0,
  // 2 → 1: el par de cierres consecutivas era del cascarón, no de la ruta (ver
  // la nota de «share-invite» en el mapa de plantas).
  // 1 → 0: era la última del sitio, y tampoco era un rediseño — era una etiqueta
  // mala. `programs-services` estaba en CONFIGURATOR por vecindad, pero es un
  // showroom de categorías con fichas y precio, planta PRODUCT como el catálogo
  // de la tienda. Corregida la descripción, la ruta queda con nueve plantas
  // distintas sobre doce secciones. Ver la nota en el mapa.
  '/programs': 0,
  // 1 → 0 por el mismo motivo.
  '/parkour-academy': 0,
  '/shop': 0,
  // 6 → 5 → 3 → 0. El último tramo no se hizo tocando el mapa: la secuencia de
  // entrada volvió a enseñar los números que su CSS ya reservaba (y el hilo que
  // los une), las historias cambiaron el carrusel duplicado por una página
  // partida, y la que se despidió dos veces pasó a ser un puente con banda de
  // imagen. Ocho plantas distintas sobre doce secciones.
  '/community': 0,
  '/resources': 0,
  '/faq': 0,
})

/** Máximo de secciones sin layout nombrado admitidas por ruta. Mismo ratchet. */
export const UNCLASSIFIED_CEILING = Object.freeze({
  '/': 0,
  '/about': 0,
  '/programs': 1,
  '/parkour-academy': 0,
  '/shop': 0,
  '/community': 0,
  '/resources': 0,
  '/faq': 0,
})
