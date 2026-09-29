// recipes - recetario de movimiento del Motion Engine 2.0 (Fase 5).
//
// Ocho recetas reutilizables. Cada una es DATO declarativo: proposito,
// intensidad, componentes del engine que la resuelven, tokens implicados y
// contraindicaciones. Las paginas futuras (Fase 8) eligen receta en su
// contrato de movimiento; este archivo es la fuente unica de la oferta.
//
// Regla de oro del recetario: una receta puede no usarse nunca, y ningun
// componente esta obligado a moverse. El movimiento responde siempre a una
// pregunta: que acaba de pasar, por que, que ensena y donde debe mirar el
// usuario. Si la respuesta no existe, la receta no se aplica.

import { motionTokens } from '../config/motionTokens.js'

/**
 * @typedef {Object} MotionRecipe
 * @property {string} id Identificador estable (kebab-case).
 * @property {string} name Nombre editorial.
 * @property {string} purpose Que resuelve.
 * @property {'quiet'|'balanced'|'immersive'} intensity Intensidad recomendada.
 * @property {string[]} components Componentes del engine que la implementan.
 * @property {string} distance Nivel de distancia (near/medium/far) que usa.
 * @property {string} tier Nivel de duracion (micro/standard/emphasis/cinematic).
 * @property {string} useWhen Cuando aporta.
 * @property {string} avoidWhen Contraindicaciones.
 * @property {string} mobile Comportamiento en movil.
 * @property {string} reducedMotion Fallback con movimiento reducido.
 */

/** @type {Record<string, MotionRecipe>} */
export const MOTION_RECIPES = Object.freeze({
  editorialReveal: Object.freeze({
    id: 'editorial-reveal',
    name: 'Editorial Reveal',
    purpose: 'El contenido emerge con calma al ritmo de la lectura.',
    intensity: 'quiet',
    components: ['Reveal', 'TextMask'],
    distance: 'near',
    tier: 'standard',
    useWhen: 'Bloques de texto, datos y fichas donde la lectura manda.',
    avoidWhen: 'Contenido que ya anima la capa CSS v2-scroll-motion (doble animacion).',
    mobile: 'Igual, con recorridos near.',
    reducedMotion: 'Contenido visible al instante, sin animacion.',
  }),
  editorialSlide: Object.freeze({
    id: 'editorial-slide',
    name: 'Editorial Slide',
    purpose: 'Una linea o dato entra de lado: senala direccion y progreso.',
    intensity: 'balanced',
    components: ['Reveal', 'useSectionProgress'],
    distance: 'medium',
    tier: 'standard',
    useWhen: 'Etiquetas, reglas horizontales, indices de seccion.',
    avoidWhen: 'Parrafos largos: el texto corrido no se desliza.',
    mobile: 'Amplitud reducida (near).',
    reducedMotion: 'Elemento estatico en su posicion final.',
  }),
  compactRail: Object.freeze({
    id: 'compact-rail',
    name: 'Compact Rail',
    purpose: 'Informacion compacta en rail horizontal: etiquetas, metricas, numeros.',
    intensity: 'balanced',
    components: ['Marquee'],
    distance: 'near',
    tier: 'standard',
    useWhen: 'Contenido repetitivo decorativo: lineas editoriales, datos de ambiente.',
    avoidWhen: 'Informacion critica o unica: el bucle es decoracion, no lectura.',
    mobile: 'Rail estatico con scroll manual y snap.',
    reducedMotion: 'Rail estatico desplazable, sin bucle.',
  }),
  cinematicStage: Object.freeze({
    id: 'cinematic-stage',
    name: 'Cinematic Stage',
    purpose: 'Un escenario fijo evoluciona por estados (A -> B -> C) mientras el usuario scrollea.',
    intensity: 'immersive',
    components: ['StickyStage', 'useSectionProgress'],
    distance: 'far',
    tier: 'emphasis',
    useWhen: 'Un unico momento narrativo por pagina que justifica detener el tiempo.',
    avoidWhen: 'Mas de un escenario por pagina; paginas de lectura o decision.',
    mobile: 'Secuencia estatica apilada, sin fijacion.',
    reducedMotion: 'Estados apilados como seccion normal.',
  }),
  dataCascade: Object.freeze({
    id: 'data-cascade',
    name: 'Data Cascade',
    purpose: 'Los datos aparecen en cascada moderada: jerarquia sin ruido.',
    intensity: 'quiet',
    components: ['Reveal'],
    distance: 'near',
    tier: 'standard',
    useWhen: 'Listas de metricas, tablas compactas, stacks de informacion.',
    avoidWhen: 'Stagger que retrase datos criticos mas de un segundo.',
    mobile: 'Stagger mas corto.',
    reducedMotion: 'Todos los datos visibles a la vez.',
  }),
  imageDrift: Object.freeze({
    id: 'image-drift',
    name: 'Image Drift',
    purpose: 'Una imagen deriva suave respecto al contenido: profundidad sin mareo.',
    intensity: 'balanced',
    components: ['Parallax'],
    distance: 'medium',
    tier: 'emphasis',
    useWhen: 'Imagenes de apoyo grandes, fondos de seccion narrativa.',
    avoidWhen: 'Mas de una capa de parallax simultanea en movil.',
    mobile: 'Factor 0.4 (ya integrado en Parallax).',
    reducedMotion: 'Imagen fija (factor 0).',
  }),
  horizontalPassage: Object.freeze({
    id: 'horizontal-passage',
    name: 'Horizontal Passage',
    purpose: 'El usuario baja y el contenido avanza en horizontal: progreso espacial.',
    intensity: 'immersive',
    components: ['HorizontalPassage', 'useSectionProgress'],
    distance: 'far',
    tier: 'emphasis',
    useWhen: 'Secuencias de 3-6 vagones con narrativa propia (metodo, historia, comparativa).',
    avoidWhen: 'Contenido que debe leerse rapido; mas de un pasaje por pagina.',
    mobile: 'Pila vertical convencional.',
    reducedMotion: 'Pila vertical convencional.',
  }),
  quietTransition: Object.freeze({
    id: 'quiet-transition',
    name: 'Quiet Transition',
    purpose: 'Entrada/salida serena entre bloques: continuidad sin teatro.',
    intensity: 'quiet',
    components: ['Reveal', 'PageTransition'],
    distance: 'near',
    tier: 'standard',
    useWhen: 'Cierres de seccion y aperturas del siguiente capitulo.',
    avoidWhen: 'Transiciones que retrasen el CTA primario.',
    mobile: 'Igual.',
    reducedMotion: 'Corte limpio, sin cortina.',
  }),
})

/** Lista de recetas en orden editorial. @type {MotionRecipe[]} */
export const RECIPE_LIST = Object.freeze(Object.values(MOTION_RECIPES))

/**
 * Resuelve una receta por clave (camelCase) o por id (kebab-case).
 * Fail-safe: devuelve `null` si no existe; el consumidor decide el fallback
 * (nunca se inventa una receta).
 *
 * @param {string} id
 * @returns {MotionRecipe|null}
 */
export function resolveRecipe(id) {
  if (MOTION_RECIPES[id]) return MOTION_RECIPES[id]
  return RECIPE_LIST.find((recipe) => recipe.id === id) ?? null
}

/**
 * Invariante del recetario: toda receta declara distancias y tiers que
 * existen en motionTokens. Util para tests y para el debug de desarrollo.
 *
 * @returns {boolean}
 */
export function recipesUseKnownTokens() {
  return RECIPE_LIST.every(
    (recipe) =>
      motionTokens.distance[recipe.distance] !== undefined &&
      motionTokens.tier[recipe.tier] !== undefined,
  )
}
