// Motion_Profile - contrato central y verificable del movimiento reducido (R23).
//
// Este modulo es la UNICA representacion, pura y comprobable, de que efectos con
// movimiento estan activos segun las capacidades del dispositivo. No decide como
// se anima cada capa: cada capa (escena/uTime, particulas, post-proceso,
// parallax, smooth scroll, page transition, text reveal, cursor, magnetico,
// tilt) ya honra `reducedMotion`/`mode` en su propia implementacion. Aqui se
// centraliza el contrato para poder verificarlo de forma aislada con property
// tests (Property 1: "Reduced_Motion desactiva movimiento").
//
// Al ser logica PURA (sin React ni Three) es importable por los tests y por
// cualquier capa que quiera consultar el perfil sin duplicar la regla.

import { pointerEffectsEnabled } from '../providers/capabilities.js'

/**
 * @typedef {Object} MotionProfile
 * @property {boolean} sceneAnimated          uTime / idle de la escena 3D (R2.6).
 * @property {boolean} particlesAnimated      Campo de particulas animado (R4, R23.2).
 * @property {boolean} postProcessingAnimated Efectos por-fotograma del post-proceso (R6.7).
 * @property {boolean} parallax               Capas de parallax por scroll (R18.3).
 * @property {boolean} scrollInertia          Inercia de scroll (Lenis) activa (R19.3).
 * @property {boolean} pageTransitionAnimated Cortina animada entre rutas (R12.4).
 * @property {boolean} textRevealAnimated     Split/entrada animada de texto (R21.3).
 * @property {boolean} customCursor           Cursor personalizado (R14.4).
 * @property {boolean} magnetic               Botones magneticos (R15.4).
 * @property {boolean} tilt                   Tilt 3D de tarjetas/mockup (R8.4).
 */

/**
 * Resuelve el perfil de movimiento a partir de las capacidades detectadas.
 * Funcion PURA y total: nunca lanza y siempre devuelve un objeto de banderas
 * booleanas (R23.2, R23.3).
 *
 * Reglas del contrato:
 *  - Con `prefers-reduced-motion` (reducedMotion === true) TODAS las banderas de
 *    movimiento quedan en `false`: cada capa debe ofrecer una alternativa
 *    estatica equivalente (R23.2/R23.3).
 *  - El movimiento "de escena/scroll" (sceneAnimated, particlesAnimated,
 *    postProcessingAnimated, parallax, scrollInertia, pageTransitionAnimated,
 *    textRevealAnimated) depende SOLO de que no haya movimiento reducido: el
 *    Mobile_Mode tambien anima (a menor coste), no se apaga por ser movil.
 *  - Los efectos dependientes del puntero (customCursor, magnetic, tilt) se
 *    activan SII Desktop_Mode y sin movimiento reducido, via
 *    `pointerEffectsEnabled` (R14.4/R15.4/R8.4).
 *  - Con `caps` undefined/null se asume el fallback mobile-safe con movimiento
 *    reducido implicito (accesibilidad primero): todas las banderas en `false`.
 *
 * @param {import('../providers/capabilities.js').Capabilities} [caps]
 * @returns {MotionProfile}
 */
export function resolveMotionProfile(caps) {
  // `reducedMotion` efectivo: si no conocemos las capacidades (caps null/
  // undefined) asumimos movimiento reducido como fallback seguro, de modo que
  // ninguna capa con movimiento se active.
  const reducedMotion = caps?.reducedMotion ?? true

  // Movimiento por-fotograma / desplazamiento permitido solo cuando NO hay
  // preferencia de movimiento reducido. Independiente de desktop/mobile.
  const motionAllowed = !reducedMotion

  // Efectos de puntero (cursor, magnetico, tilt): SII desktop y sin movimiento
  // reducido. `pointerEffectsEnabled` ya tolera `caps` undefined (=> false).
  const pointer = pointerEffectsEnabled(caps)

  return {
    sceneAnimated: motionAllowed,
    particlesAnimated: motionAllowed,
    postProcessingAnimated: motionAllowed,
    parallax: motionAllowed,
    scrollInertia: motionAllowed,
    pageTransitionAnimated: motionAllowed,
    textRevealAnimated: motionAllowed,
    customCursor: pointer,
    magnetic: pointer,
    tilt: pointer,
  }
}
