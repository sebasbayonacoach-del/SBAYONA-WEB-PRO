// scrollHandoff - interfaz scroll -> 3D para la Fase 7 (Fase 5).
//
// Prepara la conexion del Scroll Storytelling con las futuras escenas 3D SIN
// montar ninguna escena todavia: una API pequena y estable que la escena
// consumira dentro de su `useFrame` para derivar camara/objetos/luz/material
// del estado del scroll.
//
// Contrato de datos (lo que recibira una escena en Fase 7):
//   progress      numero 0..1     progreso de pagina (fuente unica del engine)
//   velocity      numero (px)     desplazamiento por evento de scroll
//   direction     -1 | 0 | 1      subiendo / reposo / bajando
//   viewport      {width, height} tamano de ventana en px
//   reducedMotion boolean         preferencia de movimiento reducido
//   mode          'desktop'|'mobile'
//   dprLimit      numero          limite de DPR por capacidades (R22.3)
//
// La escena decidira SU mapeo (progress -> camara, velocity -> inercia, etc.);
// este modulo solo garantiza que los datos llegan normalizados y seguros.

import { useMemo } from 'react'
import { useCapabilities } from '../hooks/useCapabilities.js'
import { useEngineScroll, useScrollState } from '../providers/ExperienceProvider.jsx'

/**
 * Restringe un numero al rango [0, 1]; valores no finitos se tratan como 0.
 * @param {number} value
 * @returns {number}
 */
function clamp01(value) {
  if (!Number.isFinite(value)) return 0
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

/**
 * Lee el tamano del viewport de forma segura (SSR/jsdom incluido).
 * @returns {{width: number, height: number}}
 */
export function readViewport() {
  if (typeof window === 'undefined') return { width: 0, height: 0 }
  return {
    width: Number.isFinite(window.innerWidth) ? window.innerWidth : 0,
    height: Number.isFinite(window.innerHeight) ? window.innerHeight : 0,
  }
}

/**
 * Construye un snapshot PLANO y serializable del estado de scroll para una
 * escena 3D. Funcion PURA y total: valida y normaliza cada campo; cualquier
 * entrada degradada produce un snapshot seguro (movimiento reducido por
 * defecto, modo mobile), nunca lanza.
 *
 * @param {object} [input]
 * @param {number} [input.progress=0]
 * @param {number} [input.velocity=0]
 * @param {number} [input.direction=0]
 * @param {{width?: number, height?: number}} [input.viewport]
 * @param {boolean} [input.reducedMotion=true]
 * @param {string} [input.mode='mobile']
 * @param {number} [input.dprLimit=1.5]
 * @returns {{
 *   progress: number, velocity: number, direction: -1|0|1,
 *   viewport: {width: number, height: number},
 *   reducedMotion: boolean, mode: 'desktop'|'mobile', dprLimit: number,
 * }}
 */
export function createHandoffSnapshot({
  progress = 0,
  velocity = 0,
  direction = 0,
  viewport,
  reducedMotion = true,
  mode = 'mobile',
  dprLimit = 1.5,
} = {}) {
  const width = Number.isFinite(viewport?.width) ? Math.max(0, viewport.width) : 0
  const height = Number.isFinite(viewport?.height) ? Math.max(0, viewport.height) : 0

  return Object.freeze({
    progress: clamp01(progress),
    velocity: Number.isFinite(velocity) ? velocity : 0,
    direction: direction > 0 ? 1 : direction < 0 ? -1 : 0,
    viewport: Object.freeze({ width, height }),
    reducedMotion: Boolean(reducedMotion),
    mode: mode === 'desktop' ? 'desktop' : 'mobile',
    dprLimit: Number.isFinite(dprLimit) ? dprLimit : 1.5,
  })
}

/**
 * Hook de handoff scroll -> 3D. Compone las fuentes vivas del engine
 * (progreso, velocidad, direccion y capacidades) en un objeto estable que las
 * escenas de Fase 7 consumiran dentro de `useFrame` llamando a `snapshot()`.
 *
 * Fuera del `ExperienceProvider` los valores de scroll son `null` y
 * `snapshot()` degrada a un estado seguro (progreso 0, movimiento reducido):
 * el sistema nunca rompe por montar una escena fuera del provider.
 *
 * @returns {{
 *   progress: import('framer-motion').MotionValue<number>|null,
 *   velocity: import('framer-motion').MotionValue<number>|null,
 *   direction: import('framer-motion').MotionValue<number>|null,
 *   capabilities: {mode: string, reducedMotion: boolean, dprLimit: number},
 *   readViewport: () => {width: number, height: number},
 *   snapshot: () => ReturnType<typeof createHandoffSnapshot>,
 * }}
 */
export function useScrollHandoff() {
  const progress = useEngineScroll()
  const state = useScrollState()
  const caps = useCapabilities()

  return useMemo(() => {
    const snapshot = () =>
      createHandoffSnapshot({
        progress: progress ? progress.get() : 0,
        velocity: state ? state.velocity.get() : 0,
        direction: state ? state.direction.get() : 0,
        viewport: readViewport(),
        reducedMotion: caps.reducedMotion,
        mode: caps.mode,
        dprLimit: caps.dprLimit,
      })

    return {
      progress,
      velocity: state ? state.velocity : null,
      direction: state ? state.direction : null,
      capabilities: {
        mode: caps.mode,
        reducedMotion: caps.reducedMotion,
        dprLimit: caps.dprLimit,
      },
      readViewport,
      snapshot,
    }
  }, [progress, state, caps])
}
