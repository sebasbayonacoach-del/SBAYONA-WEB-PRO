/**
 * BAYONA · IDIOMA DEL VISITANTE
 * ---------------------------------------------------------------------------
 * QUÉ RESUELVE
 *
 * La web está en español y su mercado es hispanohablante (Colombia, España,
 * Argentina, EEUU), pero recibe visitas de gente cuyo navegador no está en
 * español. A esa persona hay que ofrecerle una salida.
 *
 * LO QUE NO SE PUEDE HACER, Y CONVIENE SABERLO
 *
 * No existe ninguna API que permita activar el traductor integrado de Chrome,
 * Safari o Edge desde JavaScript. No es una limitación de este código: no se
 * puede, por diseño del navegador. Cualquier solución que lo prometa está
 * inyectando un widget de terceros.
 *
 * LO QUE SÍ SE HACE, Y POR QUÉ ES MEJOR
 *
 * 1. `<html lang="es">` está correctamente declarado (index.html y RouteSeo).
 *    Eso es justo lo que hace que Chrome y Safari OFREZCAN traducir por su
 *    cuenta. La primera vía es la nativa, y ya funciona.
 * 2. Se detecta el idioma del navegador y, si no entiende español, se ofrece un
 *    enlace directo a la versión traducida de la página actual.
 *
 * No se embebe ningún script de terceros. El widget clásico de Google Translate
 * está descontinuado para sitios web, inyecta seguimiento —lo que obligaría a
 * pedir consentimiento antes de mostrarlo— y reescribe el DOM, con lo que puede
 * romper la maquetación. Un enlace no tiene ninguno de esos problemas.
 */

/** Idiomas que no necesitan traducción: el contenido ya está en español. */
const NATIVE_LANGUAGES = new Set(['es'])

/**
 * Idiomas para los que se ofrece la traducción con su nombre en su propia
 * lengua. Se muestra el NOMBRE DEL IDIOMA, nunca una bandera: una bandera
 * representa un país, no una lengua, y en un mercado como el latinoamericano
 * eso genera fricción real en lugar de ayudar.
 */
export const OFFERED_LANGUAGES = Object.freeze({
  en: 'English',
  pt: 'Português',
  fr: 'Français',
  it: 'Italiano',
  de: 'Deutsch',
  ca: 'Català',
  eu: 'Euskara',
  gl: 'Galego',
  nl: 'Nederlands',
  ru: 'Русский',
  ar: 'العربية',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  hi: 'हिन्दी',
  tr: 'Türkçe',
  pl: 'Polski',
  ro: 'Română',
  sv: 'Svenska',
})

/** Etiqueta del enlace, en el idioma de destino. */
const VIEW_IN_LABEL = Object.freeze({
  en: 'Read in English',
  pt: 'Ler em português',
  fr: 'Lire en français',
  it: 'Leggi in italiano',
  de: 'Auf Deutsch lesen',
  ca: 'Llegir en català',
  eu: 'Euskaraz irakurri',
  gl: 'Ler en galego',
  nl: 'Lees in het Nederlands',
  ru: 'Читать по-русски',
  ar: 'اقرأ بالعربية',
  zh: '用中文阅读',
  ja: '日本語で読む',
  ko: '한국어로 읽기',
  hi: 'हिन्दी में पढ़ें',
  tr: "Türkçe'de oku",
  pl: 'Czytaj po polsku',
  ro: 'Citește în română',
  sv: 'Läs på svenska',
})

/** Código de idioma base, sin región: 'en-US' → 'en'. */
export function baseLanguage(tag) {
  if (typeof tag !== 'string' || tag.trim() === '') return ''
  return tag.trim().toLowerCase().split(/[-_]/)[0]
}

/**
 * Idiomas que declara el navegador, en orden de preferencia.
 * Se leen todos, no solo el primero: alguien puede tener el sistema en inglés
 * y el español como segunda lengua, y en ese caso no hace falta ofrecer nada.
 */
export function visitorLanguages(nav = typeof navigator !== 'undefined' ? navigator : null) {
  if (!nav) return []

  const declared = Array.isArray(nav.languages) && nav.languages.length > 0
    ? nav.languages
    : [nav.language].filter(Boolean)

  return [...new Set(declared.map(baseLanguage).filter(Boolean))]
}

/**
 * Decide si se ofrece traducción y a qué idioma.
 *
 * Devuelve null cuando no hay nada que ofrecer, que es el caso mayoritario:
 * · si el visitante entiende español en cualquier posición de su lista
 * · si su idioma no está entre los contemplados
 *
 * @returns {{code: string, name: string, label: string}|null}
 */
export function resolveTranslationOffer(nav = typeof navigator !== 'undefined' ? navigator : null) {
  const languages = visitorLanguages(nav)
  if (languages.length === 0) return null

  /** Entiende español: no se le molesta. */
  if (languages.some((code) => NATIVE_LANGUAGES.has(code))) return null

  const target = languages.find((code) => OFFERED_LANGUAGES[code])
  if (!target) return null

  return {
    code: target,
    name: OFFERED_LANGUAGES[target],
    label: VIEW_IN_LABEL[target] ?? `Read in ${OFFERED_LANGUAGES[target]}`,
  }
}

/**
 * URL de la página actual traducida.
 *
 * Se usa el proxy de traducción de Google porque no requiere cargar nada en
 * esta página: es un enlace que se abre en otra pestaña. La alternativa
 * (embeber su widget) implicaría script de terceros, consentimiento previo y
 * reescritura del DOM.
 */
export function translatedUrl(targetLanguage, currentUrl) {
  const url = currentUrl ?? (typeof window !== 'undefined' ? window.location.href : '')
  if (!url) return ''

  const params = new URLSearchParams({
    sl: 'es',
    tl: targetLanguage,
    u: url,
    /** `_x_tr_hist` desactivado: no se necesita historial de traducción. */
    hl: targetLanguage,
  })

  return `https://translate.google.com/translate?${params.toString()}`
}
