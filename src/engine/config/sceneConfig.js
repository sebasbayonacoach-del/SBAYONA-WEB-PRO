// Scene_Config - logica PURA de resolucion de escena (Requirements 25.2-25.5, 22.3-22.7).
//
// resolveSceneConfig() toma la declaracion de escena de una ruta (Scene_Config)
// y las capacidades del dispositivo (Capabilities) y devuelve un ResolvedScene
// listo para montar: parametros con defaults aplicados, degradacion por modo
// (Mobile <= Desktop en particulas/instancias/post-proceso), DPR acotado por
// DPR_Limit y toggles independientes por ruta.
//
// Modulo PURO (sin React/Three) para poder verificarlo con property tests
// (Propiedades 2, 6, 8, 9, 10). Nunca lanza: ante entradas raras degrada seguro.

import { sceneRegistry } from './sceneRegistry.js'
import { dprLimit } from '../providers/capabilities.js'

// Techos mobile-safe para la degradacion progresiva (R22.4, 4.5, 5.3).
export const MOBILE_MAX_PARTICLES = 400
export const MOBILE_MAX_INSTANCES = 8

/**
 * @typedef {import('./sceneRegistry.js').SceneParams} SceneParams
 */

/**
 * Escena resuelta lista para montar por el host 3D.
 *
 * @typedef {Object} ResolvedScene
 * @property {React.ComponentType|null} component  Componente R3F de la variante.
 * @property {SceneParams & {dpr:number, dof:boolean, chromaticAberration:boolean}} params
 *   Parametros efectivos: defaults + overrides, con degradacion por modo y DPR acotado.
 * @property {boolean} particles       Toggle de sistema de particulas (default true).
 * @property {boolean} postProcessing  Toggle de post-proceso (default true).
 * @property {boolean} parallax        Toggle de parallax (default true).
 */

/**
 * Acota el DPR efectivo al DPR_Limit del dispositivo (Property 2, R22.3).
 *
 * @param {number} devicePixelRatio  DPR reportado por el entorno.
 * @param {number} limit             DPR_Limit del modo actual.
 * @returns {number} min(devicePixelRatio, limit); `limit` si el DPR no es finito o <= 0.
 */
export function clampDpr(devicePixelRatio, limit) {
  if (!Number.isFinite(devicePixelRatio) || devicePixelRatio <= 0) {
    return limit
  }
  return Math.min(devicePixelRatio, limit)
}

/**
 * Resuelve la configuracion efectiva de una escena para el dispositivo actual.
 * Funcion PURA que nunca lanza (R25.2-25.5, 22.3, 22.4, 22.7).
 *
 * @param {{variant:string, params?:Object, enabled?:boolean, particles?:boolean, postProcessing?:boolean, parallax?:boolean}} config
 *   Scene_Config declarado por la ruta.
 * @param {{mode?:'desktop'|'mobile', devicePixelRatio?:number}} caps
 *   Capacidades del dispositivo (de Capability_Manager).
 * @returns {ResolvedScene|null} Escena resuelta, o null si la variante no existe
 *   o la escena esta deshabilitada.
 */
export function resolveSceneConfig(config, caps) {
  // Variante inexistente o config ausente: fallo seguro con log (R25.5).
  if (!config || !Object.prototype.hasOwnProperty.call(sceneRegistry, config.variant)) {
    console.error(`resolveSceneConfig: variante de escena desconocida: "${config?.variant}"`)
    return null
  }

  // Escena explicitamente deshabilitada para esta ruta (R22.7).
  if (config.enabled === false) {
    return null
  }

  const variant = sceneRegistry[config.variant]

  // Defaults del registro + overrides de la ruta; los omitidos usan default (R25.3).
  const merged = { ...variant.defaults, ...(config.params ?? {}) }

  // Degradacion por modo: Mobile aplica Math.min sobre el MISMO valor mergeado,
  // por lo que Mobile <= Desktop en particulas/instancias y en carga de
  // post-proceso (invariante Property 6; R22.4, 4.5, 5.3, 6.6). Cualquier modo
  // que no sea 'desktop' se trata como Mobile (fallback mobile-safe).
  const isMobile = caps?.mode !== 'desktop'

  const particleCount = isMobile
    ? Math.min(merged.particleCount, MOBILE_MAX_PARTICLES)
    : merged.particleCount
  const instanceCount = isMobile
    ? Math.min(merged.instanceCount, MOBILE_MAX_INSTANCES)
    : merged.instanceCount

  // Post-proceso: Mobile desactiva DoF y aberracion cromatica (conserva
  // bloom/vignette, que pasan por ...merged); Desktop activa ambos.
  const dof = !isMobile
  const chromaticAberration = !isMobile

  // DPR efectivo acotado por DPR_Limit del modo; nunca supera el limite (R22.3).
  const limit = dprLimit(caps?.mode)
  const rawDpr =
    caps?.devicePixelRatio ??
    (typeof window !== 'undefined' ? window.devicePixelRatio : 1)
  const dpr = clampDpr(rawDpr, limit)

  // Toggles independientes por ruta, default true (R25.4).
  const particles = config.particles !== false
  const postProcessing = config.postProcessing !== false
  const parallax = config.parallax !== false

  return {
    component: variant.component,
    params: { ...merged, particleCount, instanceCount, dpr, dof, chromaticAberration },
    particles,
    postProcessing,
    parallax,
  }
}
