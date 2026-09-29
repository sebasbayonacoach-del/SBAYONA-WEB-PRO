// Capability_Manager - logica PURA de deteccion de capacidades (Requirement 23).
//
// Este modulo NO depende de React: contiene solo funciones puras y un lector de
// entorno (`readCapabilities`) que consulta `matchMedia`/viewport. Al no importar
// React ni Three, es la ubicacion importable por los property tests (Property 2
// "DPR <= DPR_Limit" y Property 4 "Cursor/hover solo Desktop").
//
// El React `CapabilityProvider` consume estas funciones y expone el estado vivo
// por contexto; aqui vive toda la regla de negocio para poder verificarla aislada.

/**
 * @typedef {Object} Capabilities
 * @property {'desktop'|'mobile'} mode  Desktop = canHover && finePointer && width>768 (R23.1).
 * @property {boolean} reducedMotion    prefers-reduced-motion: reduce (R23.1).
 * @property {boolean} canHover         (hover: hover).
 * @property {boolean} finePointer      (pointer: fine).
 * @property {number}  dprLimit         DPR_Limit: 2 desktop / 1.5 mobile (R22.3).
 */

// Ancho de viewport (px) por encima del cual se considera Desktop_Mode.
export const DESKTOP_MIN_WIDTH = 768

// DPR_Limit por modo (R22.3): 2 en Desktop, 1.5 en Mobile.
export const DPR_LIMIT_DESKTOP = 2
export const DPR_LIMIT_MOBILE = 1.5

/**
 * Deriva el modo de dispositivo a partir de las flags de media query y el ancho
 * de viewport. Funcion PURA (R23.1).
 *
 * Desktop_Mode <=> (hover: hover) Y (pointer: fine) Y viewport > 768px.
 * Cualquier otro caso es Mobile_Mode (fallback seguro).
 *
 * @param {{canHover:boolean, finePointer:boolean, width:number}} q
 * @returns {'desktop'|'mobile'}
 */
export function resolveMode({ canHover, finePointer, width } = {}) {
  return canHover && finePointer && width > DESKTOP_MIN_WIDTH ? 'desktop' : 'mobile'
}

/**
 * DPR_Limit configurado para un modo dado. Funcion PURA (R22.3).
 * @param {'desktop'|'mobile'} mode
 * @returns {number} 2 en Desktop, 1.5 en el resto.
 */
export function dprLimit(mode) {
  return mode === 'desktop' ? DPR_LIMIT_DESKTOP : DPR_LIMIT_MOBILE
}

/**
 * Indica si deben activarse los efectos dependientes del puntero (Custom_Cursor,
 * tilt/hover 3D, magnetico). Funcion PURA (R23.4).
 *
 * Verdadero SII el modo es Desktop y NO hay movimiento reducido.
 *
 * @param {Capabilities} caps
 * @returns {boolean}
 */
export function pointerEffectsEnabled(caps) {
  return Boolean(caps) && caps.mode === 'desktop' && caps.reducedMotion === false
}

// Defaults mobile-safe: se usan como valor inicial del contexto y como fallback
// cuando no hay `matchMedia` disponible (SSR o entornos sin DOM).
export const DEFAULT_CAPABILITIES = Object.freeze({
  mode: 'mobile',
  reducedMotion: false,
  canHover: false,
  finePointer: false,
  dprLimit: DPR_LIMIT_MOBILE,
})

/**
 * Lee las capacidades vivas del entorno (matchMedia + ancho de viewport).
 * SSR-safe: devuelve los defaults mobile-safe si `window`/`matchMedia` no existen.
 *
 * @returns {Capabilities}
 */
export function readCapabilities() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return { ...DEFAULT_CAPABILITIES }
  }

  const canHover = window.matchMedia('(hover: hover)').matches
  const finePointer = window.matchMedia('(pointer: fine)').matches
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const width = typeof window.innerWidth === 'number' ? window.innerWidth : 0
  const mode = resolveMode({ canHover, finePointer, width })

  return { mode, reducedMotion, canHover, finePointer, dprLimit: dprLimit(mode) }
}
