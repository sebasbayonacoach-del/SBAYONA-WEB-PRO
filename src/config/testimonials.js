/**
 * BAYONA · EXPERIENCIAS PUBLICADAS
 * ---------------------------------------------------------------------------
 * Extraído de components/GlobeTestimonials.jsx para que sea dato puro.
 *
 * Motivo: estos testimonios son el activo de prueba social más fuerte de la
 * marca, pero vivían dentro de un componente 3D de 43 kB, así que solo podían
 * usarse donde se montara el globo (una única página). Como dato suelto, el
 * recorrido de la home puede mostrarlos sin arrastrar three.js.
 *
 * MARCO EDITORIAL — importante:
 * No son "evidencia verificada" ni métricas. Son experiencias publicadas con
 * autorización, y así deben presentarse siempre. El `evidenceRegistry` sigue
 * siendo la única puerta para claims de tipo `evidence`, y sigue vacío a
 * propósito. `result` es la síntesis editorial de un testimonio, nunca un
 * resultado garantizado ni extrapolable.
 */

export const TESTIMONIALS = Object.freeze([
  Object.freeze({
    id: 0,
    countryCode: 'CO',
    country: 'Colombia',
    city: 'Bogotá',
    lat: 4.71,
    lng: -74.07,
    name: 'Andrea',
    age: 38,
    role: 'Empresaria',
    quote: 'Tenía malos hábitos y cero energía. El ejercicio cambió mi cuerpo, mi mente y mi empresa.',
    result: 'Hábitos transformados',
    image: '/images/testimonials/andrea-empresaria.jpg',
  }),
  Object.freeze({
    id: 1,
    countryCode: 'CO',
    country: 'Colombia',
    city: 'Bogotá',
    lat: 4.71,
    lng: -74.07,
    name: 'Carlos',
    age: 45,
    role: 'Administrador',
    quote: 'Recuperé mi energía y dejé el dolor de espalda que me limitaba en el trabajo.',
    result: 'Más energía, menos dolor',
    image: '/images/testimonials/carlos-administrador.jpg',
  }),
  Object.freeze({
    id: 2,
    countryCode: 'CO',
    country: 'Colombia',
    city: 'Bogotá',
    lat: 4.71,
    lng: -74.07,
    name: 'Mai',
    age: 34,
    role: 'Madre y emprendedora',
    quote: 'Después de ser mamá sentí que había perdido mi cuerpo. Lo recuperé con el método correcto.',
    result: 'Cuerpo recuperado',
    image: '/images/testimonials/mai-madre.jpg',
  }),
  Object.freeze({
    id: 3,
    countryCode: 'CO',
    country: 'Colombia',
    city: 'Bogotá',
    lat: 4.71,
    lng: -74.07,
    name: 'Sebastián',
    age: 14,
    role: 'Joven atleta',
    quote: 'El parkour me enseñó disciplina y confianza. Ahora enfrento cualquier obstáculo.',
    result: 'Disciplina y confianza',
    image: '/images/testimonials/sebastian-atleta.jpg',
  }),
  Object.freeze({
    id: 4,
    countryCode: 'CO',
    country: 'Colombia',
    city: 'Bogotá',
    lat: 4.71,
    lng: -74.07,
    name: 'Paola',
    age: 42,
    role: 'Empresaria',
    quote: 'Pensé que no tenía tiempo. El método encajó en mi vida real y todo cambió.',
    result: 'Constancia real',
    image: '/images/testimonials/paola-empresaria.jpg',
  }),
  Object.freeze({
    id: 5,
    countryCode: 'ES',
    country: 'España',
    city: 'Valencia',
    lat: 39.47,
    lng: -0.38,
    name: 'Familia Rusa',
    age: null,
    role: 'Madre con 2 hijos',
    quote: 'Mis hijos encontraron pasión, disciplina y confianza. El movimiento transformó a toda mi familia.',
    result: 'Familia transformada',
    image: '/images/testimonials/familia-rusa.jpg',
  }),
  Object.freeze({
    id: 6,
    countryCode: 'ES',
    country: 'España',
    city: 'Valencia',
    lat: 39.47,
    lng: -0.38,
    name: 'Néstor',
    age: 40,
    role: 'Profesional',
    quote: 'Recuperé la confianza en mi cuerpo. Cada sesión me deja más fuerte.',
    result: 'Confianza recuperada',
    image: '/images/testimonials/nestor-profesional.jpg',
  }),
  Object.freeze({
    id: 7,
    countryCode: 'ES',
    country: 'España',
    city: 'Madrid',
    lat: 40.42,
    lng: -3.7,
    name: 'Laura',
    age: 29,
    role: 'Profesional del bienestar',
    quote: 'El rigor del método me impresionó. No es improvisación, es ciencia aplicada.',
    result: 'Método validado',
    image: '/images/testimonials/laura-bienestar.jpg',
  }),
  Object.freeze({
    id: 8,
    countryCode: 'US',
    country: 'EEUU',
    city: 'Miami',
    lat: 25.76,
    lng: -80.19,
    name: 'Valeria',
    age: 33,
    role: 'Emprendedora',
    quote: 'Mi cuerpo necesitaba más que apariencia: necesitaba fuerza, dirección y un método real.',
    result: 'Fuerza y dirección',
    image: '/images/testimonials/valeria-emprendedora.jpg',
  }),
  Object.freeze({
    id: 9,
    countryCode: 'AR',
    country: 'Argentina',
    city: 'Buenos Aires',
    lat: -34.61,
    lng: -58.38,
    name: 'Martín',
    age: 50,
    role: 'Abogado',
    quote: 'A los 50 me muevo mejor que a los 40. Nunca es tarde para empezar.',
    result: 'Longevidad en movimiento',
    image: '/images/testimonials/martin-abogado.jpg',
  }),
])

/** Anchos disponibles en public/images/testimonials para cada retrato. */
const TESTIMONIAL_VARIANT_WIDTHS = Object.freeze([256, 960])

/**
 * Devuelve la variante redimensionada de una foto de testimonio.
 *
 * Los originales son 1920x1080 (entre 190 y 600 kB cada uno). Si el ancho
 * pedido no existe, se devuelve el original para no romper nunca la imagen.
 */
export function testimonialVariant(imagePath, width) {
  if (typeof imagePath !== 'string' || imagePath === '') return imagePath
  if (!TESTIMONIAL_VARIANT_WIDTHS.includes(width)) return imagePath

  return imagePath.replace(/\.jpg$/i, `-${width}.jpg`)
}

/**
 * Selección para el recorrido de la home: cuatro voces deliberadamente
 * distintas entre sí, para que quien lee se reconozca en alguna.
 *
 * Mai (maternidad) · Carlos (dolor de espalda y trabajo) ·
 * Martín (50 años) · Paola (falta de tiempo)
 *
 * Son las cuatro objeciones que más aparecen antes de contratar. El globo
 * completo con las diez sigue siendo exclusivo de /about.
 */
export const HOME_TESTIMONIAL_IDS = Object.freeze([2, 1, 9, 4])

export const homeTestimonials = Object.freeze(
  HOME_TESTIMONIAL_IDS.map((id) => TESTIMONIALS.find((entry) => entry.id === id)).filter(Boolean),
)
