// Scene_Presets - presets del sistema 3D del Design System (Fase 3).
//
// Capa de DATOS PUROS que completa el sistema 3D existente sin tocarlo:
//   - sceneRegistry/resolveSceneConfig siguen resolviendo QUE escena monta
//     cada ruta y con que degradacion por capacidades.
//   - LightingRig.lightingPlan(caps) sigue siendo la capa de iluminacion
//     por capacidades (desktop rico con sombras / mobile reducido).
//   - Estos presets anaden el COMO visual reutilizable: camara, material,
//     profundidad de capas y parametros de movimiento. Las escenas futuras
//     (Fases de pagina) los consumen en lugar de inventar valores.
//
// Ningun color se inventa: todos salen de `theme.color` (misma paleta que
// shaders e iluminacion). La Fase 3 no anade escenas a ninguna ruta.

import { theme } from './theme.js'

/**
 * Presets de camara: posicion [x, y, z], campo de vision y punto de mira.
 * @type {Record<string, {position:[number,number,number], fov:number, lookAt:[number,number,number]}>}
 */
export const cameraPresets = Object.freeze({
  /** Frontal ligeramente elevada: heroes y aperturas. */
  hero: Object.freeze({ position: [0, 0.4, 6], fov: 42, lookAt: [0, 0, 0] }),
  /** Mas cerca y cerrada: retrato de una pieza unica. */
  portrait: Object.freeze({ position: [0, 0.2, 4.2], fov: 35, lookAt: [0, 0.1, 0] }),
  /** Picado amplio: contexto y composicion completa. */
  overview: Object.freeze({ position: [0, 2.6, 7.5], fov: 50, lookAt: [0, -0.2, 0] }),
  /** Tres cuartos: volumen y profundidad lateral. */
  lateral: Object.freeze({ position: [3.4, 0.6, 4.8], fov: 45, lookAt: [0, 0, 0] }),
})

/**
 * Presets de material para mallas estandar. Colores de la paleta de marca.
 */
export const materialPresets = Object.freeze({
  /** Mate oscuro: geometria de fondo, casi sin reflejo. */
  matte: Object.freeze({
    color: theme.color.black3,
    roughness: 0.85,
    metalness: 0.1,
  }),
  /** Satinado: superficie principal con reflejo suave. */
  satin: Object.freeze({
    color: theme.color.mediterranean,
    roughness: 0.45,
    metalness: 0.35,
  }),
  /** Brasa: calidez emisiva tenue (nunca neon saturado, R9.4). */
  ember: Object.freeze({
    color: theme.color.orangeDeep,
    emissive: theme.color.orangeFire,
    emissiveIntensity: 0.22,
    roughness: 0.5,
    metalness: 0.2,
  }),
  /** Acento: el naranja de marca encendido. */
  accent: Object.freeze({
    color: theme.color.orange,
    emissive: theme.color.orange,
    emissiveIntensity: 0.35,
    roughness: 0.35,
    metalness: 0.3,
  }),
})

/**
 * Capas de profundidad (eje Z) para componer fondo / plano / primer plano.
 */
export const depthLayers = Object.freeze({
  background: -4,
  midground: 0,
  foreground: 2.5,
})

/**
 * Parametros de movimiento de escena. Velocidades por segundo, amplitudes
 * en unidades de mundo: valores contenidos para un movimiento de fondo,
 * nunca protagonista.
 */
export const sceneMotion = Object.freeze({
  /** Rotacion lenta de deriva (rad/s). */
  driftSpeed: Object.freeze({ idle: 0.02, active: 0.06 }),
  /** Amplitud de flotacion vertical. */
  floatAmplitude: Object.freeze({ idle: 0.05, active: 0.12 }),
  /** Factor de parallax por capa (0 = quieto, 1 = sigue al puntero). */
  parallaxFactor: Object.freeze({ background: 0.2, foreground: 0.6 }),
})

/**
 * Resuelve un preset de camara por nombre. Nunca lanza: ante un nombre
 * desconocido devuelve el preset `hero` (fallo seguro).
 *
 * @param {string} [name]
 * @returns {{position:[number,number,number], fov:number, lookAt:[number,number,number]}}
 */
export function resolveCameraPreset(name) {
  return cameraPresets[name] ?? cameraPresets.hero
}

/**
 * Resuelve un preset de material por nombre. Nunca lanza: ante un nombre
 * desconocido devuelve el preset `matte` (el mas neutro y barato).
 *
 * @param {string} [name]
 * @returns {{color:string, roughness:number, metalness:number, emissive?:string, emissiveIntensity?:number}}
 */
export function resolveMaterialPreset(name) {
  return materialPresets[name] ?? materialPresets.matte
}
