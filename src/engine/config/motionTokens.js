// Motion_Tokens - fuente UNICA de duraciones y curvas del Motion_System
// (Requirement 10.3).
//
// Todo el Experience_Engine (variantes de Framer Motion, springs, transiciones
// de pagina, magnetic/tilt) deriva sus valores de este objeto. No debe existir
// ninguna duracion ni curva de easing/resorte duplicada fuera de aqui (R10.4);
// la Property 7 del diseno verifica esa invariante.

export const motionTokens = {
  // Duraciones en segundos.
  duration: {
    fast: 0.2, // micro-interacciones (hover, tap)
    base: 0.4, // reveals y transiciones estandar
    slow: 0.8, // movimientos amplios / enfasis
    curtain: 0.82, // cortina de Page_Transition
  },

  // Curvas de easing cubic-bezier (R10.1): [x1, y1, x2, y2].
  ease: {
    standard: [0.4, 0, 0.2, 1], // easing general
    entrance: [0.16, 1, 0.3, 1], // entradas con overshoot suave
    curtain: [0.76, 0, 0.24, 1], // cortina de transicion de pagina
    // Fase 5: curvas narrativas del Motion Engine 2.0. No alteran las tres
    // originales; Property 7 sigue verificando que toda curva usada en
    // variantes pertenezca a este objeto.
    exit: [0.4, 0, 1, 1], // salidas: acelera al irse, sin despedirse
    travel: [0.45, 0, 0.55, 1], // desplazamiento horizontal / scrub simetrico
    transform: [0.65, 0, 0.35, 1], // cambios de escala/forma durante el scroll
  },

  // Animacion basada en resortes (R10.2): rigidez y amortiguacion.
  spring: {
    soft: { stiffness: 120, damping: 18 }, // reveals / respuesta suave
    magnetic: { stiffness: 220, damping: 22 }, // CTAs magneticas / tilt
  },

  // Fase 5: escala de DISTANCIAS de desplazamiento (px) para reveals,
  // desplazamientos y parallax. El movimiento pide la INTENCION
  // (near/medium/far) y no un numero de pixles suelto. Recorridos cortos a
  // proposito: lo que se percibe es el ritmo, no el viaje.
  distance: {
    near: 16, // micro-desplazamientos: etiquetas, reglas, microcopia
    medium: 48, // reveals de bloque y desplazamientos de componente
    far: 120, // movimientos amplios: capas, parallax, pasos narrativos
  },

  // Niveles semanticos del Design System 2.0 (Fase 3). No anaden valores:
  // aliasan las claves anteriores para que el codigo de las paginas pida la
  // INTENCION (micro/standard/emphasis/cinematic) y no la clave tecnica.
  // Su espejo CSS vive en ds-tokens.css (--ds-dur-* / --ds-ease-*).
  tier: {
    micro: 'fast', // hover, tap, foco
    standard: 'base', // reveals y transiciones de componente
    emphasis: 'slow', // movimientos amplios, entradas de seccion
    cinematic: 'curtain', // cortina de transicion de pagina
  },
}

/**
 * Resuelve la duracion (segundos) de un nivel semantico.
 *
 * @param {'micro'|'standard'|'emphasis'|'cinematic'} level Nivel pedido.
 * @returns {number} Duracion en segundos; `duration.base` si el nivel no existe.
 */
export function tierDuration(level) {
  const key = motionTokens.tier[level] ?? 'base'
  return motionTokens.duration[key]
}

/**
 * Resuelve la curva de easing de un nivel semantico.
 * micro/standard usan la curva estandar; emphasis la de entrada;
 * cinematic la de cortina.
 *
 * @param {'micro'|'standard'|'emphasis'|'cinematic'} level Nivel pedido.
 * @returns {number[]} Curva cubic-bezier [x1, y1, x2, y2].
 */
export function tierEase(level) {
  if (level === 'emphasis') return motionTokens.ease.entrance
  if (level === 'cinematic') return motionTokens.ease.curtain
  return motionTokens.ease.standard
}

/**
 * Resuelve la distancia de desplazamiento (px) de un nivel de la escala
 * near/medium/far (Fase 5).
 *
 * @param {'near'|'medium'|'far'} level Distancia pedida.
 * @returns {number} Distancia en pixeles; `distance.medium` si el nivel no existe.
 */
export function distancePx(level) {
  return motionTokens.distance[level] ?? motionTokens.distance.medium
}
