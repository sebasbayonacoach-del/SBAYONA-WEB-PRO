/**
 * BAYONA PRIME / missions.
 * In-app storytelling only: never claims paid credits, athletic XP or earned rewards.
 * All mission labels reflect a real public route and point to existing content.
 */
export const BAYONA_MISSIONS = Object.freeze({
 '/': {name:'ENCUENTRA TU RUTA',objective:'Descubre cómo puedes empezar'},
 '/about': {name:'CONOCE A TU ENTRENADOR',objective:'Descubre quién te acompaña'},
 '/programs': {name:'DESCUBRE TU PLAN',objective:'Compara los servicios y precios'},
 '/movimiento-adaptado': {name:'CONOCE TUS OPCIONES',objective:'Explora el ejercicio adaptado'},
 '/parkour-academy': {name:'DOMINA TU MOVIMIENTO',objective:'Conoce la progresión de parkour'},
 '/app': {name:'DESCUBRE LA APP',objective:'Explora las herramientas de BAYONA'},
 '/community': {name:'ÚNETE AL MOVIMIENTO',objective:'Conoce la comunidad'},
 '/resources': {name:'ACTIVA TU CONOCIMIENTO',objective:'Encuentra tus recursos gratuitos'},
 '/faq': {name:'RESUELVE TUS DUDAS',objective:'Consulta respuestas antes de elegir'},
 '/shop': {name:'EXPLORA LA COLECCIÓN',objective:'Descubre los productos disponibles'},
})
export const PLAN_MISSION = Object.freeze({name:'ESTUDIA TU PLAN',objective:'Comprueba precio y condiciones'})
export function missionFor(pathname){
 if(pathname.startsWith('/plan/'))return PLAN_MISSION
 return BAYONA_MISSIONS[pathname]||null
}
export function formatMissionStep(index,total){
 const max=Math.max(1,Number(total)||1)
 return String(Math.min(max,Math.max(1,Number(index)+1))).padStart(2,'0')
}
