/**
 * BAYONA · LABORATORIO ESPACIAL — SONDA WEBGL (Lote 2)
 * -------------------------------------------------------------------------
 * Funciones PEQUEÑAS y SIN dependencias: ni React, ni Three, ni el motor. Se
 * usan ANTES de prometer una descarga, para no pedir 240 kB de librería
 * gráfica a un navegador que no va a poder montar un contexto.
 *
 * Qué comprueba y qué NO:
 *   · Comprueba que el navegador Sabe crear un contexto WebGL y en qué versión.
 *   · NO comprueba rendimiento, ni GPU real, ni temperatura, ni que la escena
 *     se vea bien. Un `true` aquí significa «se puede intentar», nada más.
 *   · El renderer (`UNMASKED_RENDERER_WEBGL`) se expone como texto para que el
 *     diagnóstico sea legible: si dice `SwiftShader`/`llvmpipe`/`Software`, el
 *     entorno renderiza por CPU y las capturas no valen como medición de GPU.
 */

/** Criterios de software detectados en la cadena del renderer. */
const SOFTWARE_RENDERER_HINTS = ['swiftshader', 'llvmpipe', 'software', 'mesa offscreen']

/**
 * Crea un contexto de prueba mínimo y devuelve el diagnóstico.
 * @returns {{ok:boolean, version:'webgl2'|'webgl'|null, renderer:string|null, software:boolean}}
 */
export function probeWebGL(doc) {
  const document_ = doc ?? (typeof document === 'undefined' ? null : document)
  const none = { ok: false, version: null, renderer: null, software: true }
  if (!document_ || typeof document_.createElement !== 'function') return none

  const canvas = document_.createElement('canvas')
  let context = null
  let version = null
  try {
    context = canvas.getContext('webgl2')
    if (context) version = 'webgl2'
    else {
      context = canvas.getContext('webgl')
      if (context) version = 'webgl'
    }
  } catch {
    return none
  }
  if (!context) return none

  let renderer = null
  try {
    const debug = context.getExtension('WEBGL_debug_renderer_info')
    if (debug) renderer = String(context.getParameter(debug.UNMASKED_RENDERER_WEBGL) ?? '') || null
  } catch {
    renderer = null
  }
  // El contexto de prueba se suelta: el <Canvas> de R3F creará el suyo propio.
  try {
    context.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    /* sin extensión: nada que liberar explícitamente */
  }

  const lower = (renderer ?? '').toLowerCase()
  return {
    ok: true,
    version,
    renderer,
    // Sin cadena de renderer NO se afirma hardware: se marca como software
    // dudoso y se declara en el diagnóstico (mejor pesimista que falso).
    software: renderer ? SOFTWARE_RENDERER_HINTS.some((hint) => lower.includes(hint)) : true,
  }
}

/**
 * ¿El `<canvas>` ya montado por el motor tiene contexto WebGL vivo? Se usa como
 * VERIFICACIÓN POST-MONTAJE: el boundary del motor puede estar tragándose un
 * fallo y dejar un hueco silencioso; esto lo convierte en un estado visible.
 *
 * @param {HTMLCanvasElement|null} canvas
 * @returns {boolean}
 */
export function hasLiveWebGLContext(canvas) {
  if (!canvas || typeof canvas.getContext !== 'function') return false
  try {
    // Mismo atributo que usó el creador: `getContext` sobre un canvas ya
    // inicializado devuelve el contexto existente (no crea un segundo).
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
  } catch {
    return false
  }
}

/** Mensaje único del laboratorio para el fallo de WebGL. */
export const WEBGL_UNAVAILABLE_MESSAGE =
  'Tu navegador no ha creado un contexto WebGL en este momento, así que no se ha descargado el motor gráfico. El recorrido de texto sigue completo.'
