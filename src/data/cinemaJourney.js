/** Route-specific editorial story. No profiles, forms, tracking, or health inference. */
export const CINEMA_ROUTES = Object.freeze({
  '/': { name:'ENTRA EN BAYONA',label:'EL COMIENZO',line:'Cada cuerpo tiene una historia.',image:'/images/bayona-generated/home-hero-1600.webp' },
  '/about': { name:'CONOCE A SEBASTIÁN',label:'EL ENTRENADOR',line:'Primero te escucho. Después entrenamos.',image:'/images/bayona-generated/about-hero-1600.webp' },
  '/programs': { name:'ENTRENA CON DIRECCIÓN',label:'TU ENTRENAMIENTO',line:'El servicio correcto empieza contigo.',image:'/images/bayona-generated/programs-hero-1600.webp' },
  '/movimiento-adaptado': { name:'MOVERSE CON CRITERIO',label:'TU CUERPO IMPORTA',line:'El ejercicio se adapta a tu realidad.',image:'/images/bayona-generated/home-method-1600.webp' },
  '/parkour-academy': { name:'APRENDE A MOVERTE',label:'PARKOUR ACADEMY',line:'El siguiente movimiento empieza aquí.',image:'/images/bayona-generated/parkour-hero-1600.webp' },
  '/app': { name:'SIGUE TU PROCESO',label:'BAYONA APP',line:'Tu entrenamiento continúa contigo.',image:'/images/bayona-generated/app-hero-1600.webp' },
  '/community': { name:'CRECEMOS JUNTOS',label:'COMUNIDAD',line:'No tienes que recorrerlo todo solo.',image:'/images/bayona-generated/community-hero-1600.webp' },
  '/resources': { name:'APRENDE A TU RITMO',label:'RECURSOS',line:'Llévate algo que puedas aplicar.',image:'/images/bayona-generated/resources-hero-1600.webp' },
  '/faq': { name:'DECIDE CON CLARIDAD',label:'TUS PREGUNTAS',line:'Quiero que entiendas antes de elegir.',image:'/images/bayona-generated/about-hero-1600.webp' },
  '/shop': { name:'MUÉVETE CON BAYONA',label:'COLECCIONES',line:'Una identidad dentro y fuera del entrenamiento.',image:'/images/bayona-generated/shop-hero-1600.webp' },
})
const PLAN_CINEMA_ROUTE = Object.freeze({
  name:'TU PROPUESTA',label:'PLAN BAYONA',line:'Saber qué incluye es parte de elegir bien.',
  image:'/images/bayona-generated/home-method-1600.webp',
})
export function getCinemaRoute(pathname) {
  if (pathname.startsWith('/plan/')) return PLAN_CINEMA_ROUTE
  return CINEMA_ROUTES[pathname] || null
}
