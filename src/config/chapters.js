/**
 * BAYONA · EL RECORRIDO COMO CAPÍTULOS
 * ---------------------------------------------------------------------------
 * La intención de la v1 era que al terminar de leer una página apareciera una
 * vista previa de la siguiente, de forma que la web se recorriera como un
 * itinerario y no como un menú.
 *
 * Estaba a medias: algunas páginas tenían un `Bridge`, otras un enlace suelto,
 * seis no tenían nada y casi todas apuntaban a /programs. El resultado era una
 * estrella con /programs en el centro, no un recorrido.
 *
 * Este mapa define el orden del itinerario y qué se anuncia al final de cada
 * página. Una sola fuente, así que el recorrido es coherente por construcción.
 *
 * Criterio del orden: va de menor a mayor compromiso, y la última parada
 * siempre deja una salida gratuita a mano.
 */

export const CHAPTER_ORDER = Object.freeze([
  '/',
  '/about',
  '/programs',
  '/parkour-academy',
  '/community',
  '/app',
  '/shop',
  '/resources',
  '/faq',
  '/entrar',
])

/**
 * Qué se enseña de cada capítulo cuando se anuncia desde el anterior.
 * `teaser` responde a "qué me llevo si entro aquí".
 */
export const CHAPTERS = Object.freeze({
  '/': Object.freeze({
    label: 'INICIO',
    title: 'EL MÉTODO',
    teaser: 'Por qué entrenar con dirección cambia el resultado, y cómo se aplica.',
  }),
  '/about': Object.freeze({
    label: 'NOSOTROS',
    title: 'QUIÉN ESTÁ DETRÁS',
    teaser: 'La historia de Sebastián y diez experiencias reales en el mapa.',
  }),
  '/programs': Object.freeze({
    label: 'PROGRAMAS',
    title: 'LOS CUATRO NIVELES',
    teaser: 'Compara acompañamiento, sesiones y seguimiento. Precios publicados.',
  }),
  '/parkour-academy': Object.freeze({
    label: 'ACADEMIA',
    title: 'PARKOUR',
    teaser: 'Progresiones técnicas por edad y nivel, del primer salto al control.',
  }),
  '/app': Object.freeze({
    label: 'BAYONA+',
    title: 'ACCESO PRIORITARIO',
    teaser: 'La visión del centro de mando: plan, registro, recursos y comunidad en un mismo lugar.',
  }),
  '/community': Object.freeze({
    label: 'COMUNIDAD',
    title: 'ENTRENA ACOMPAÑADO',
    teaser: 'Acceso abierto y gratuito. No necesitas contratar ningún plan.',
  }),
  '/resources': Object.freeze({
    label: 'RECURSOS',
    title: 'EMPIEZA GRATIS',
    teaser: 'Guías, Reto 30 días y Protocolo 7 días. Sin pagar y sin cuenta.',
  }),
  '/shop': Object.freeze({
    label: 'TIENDA',
    title: 'SESIÓN, SERVICIO O EQUIPO',
    teaser: 'Elige una clase, una evaluación, una consulta o una pieza para empezar con intención.',
  }),
  '/faq': Object.freeze({
    label: 'PREGUNTAS',
    title: 'ANTES DE DECIDIR',
    teaser: 'Precios, lesiones, presencialidad, garantía y BAYONA+. Sin rodeos.',
  }),
  '/entrar': Object.freeze({
    label: 'CUENTA',
    title: 'TU CENTRO DE MANDO',
    teaser: 'Guarda lo que reclamaste, recupera tus recursos y continúa desde tu espacio BAYONA.',
  }),
})

/** Normaliza un pathname al formato de las claves del mapa. */
function normalize(pathname) {
  const raw = typeof pathname === 'string' && pathname.trim() !== '' ? pathname.trim() : '/'
  const clean = raw.split('#')[0].split('?')[0]
  const withSlash = `/${clean}`.replace(/\/{2,}/g, '/')
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, '') : '/'
}

/**
 * Siguiente capítulo del itinerario.
 *
 * · Ya no cierra el círculo: la cuenta es la puerta final del recorrido. Desde
 *   ahí el usuario guarda recursos, créditos y compras en su centro de mando.
 * · Las rutas que no están en el itinerario (planes, embudo, 404) devuelven
 *   null y deciden su propio cierre.
 */
export function nextChapter(pathname) {
  const path = normalize(pathname)
  const index = CHAPTER_ORDER.indexOf(path)
  if (index === -1) return null

  if (index >= CHAPTER_ORDER.length - 1) return null

  const nextPath = CHAPTER_ORDER[index + 1]
  const chapter = CHAPTERS[nextPath]
  if (!chapter) return null

  return {
    ...chapter,
    href: nextPath,
    /** Posición humana dentro del itinerario, para orientar sin numerar rutas. */
    step: index + 2,
    total: CHAPTER_ORDER.length,
  }
}
