/**
 * BAYONA · «TRAYECTORIA» — CONTROLADOR DE CÁMARA (GREYBOX) · LÓGICA PURA
 * -------------------------------------------------------------------------
 * Lote 2. Mantiene el ENCUADRE vivo de la maqueta: dado el estado actual de la
 * cámara y el encuadre objetivo de una estación, produce la trayectoria
 * interpolada. Está AQUÍ y no dentro del componente R3F por tres razones:
 *
 *   1. Se puede verificar SIN WebGL ni navegador (los tests unitarios cubren
 *      arranque, re-objetivo, convergencia y ausencia de deriva).
 *   2. La escena solo aplica lo que este módulo decide: el componente no es a
 *      la vez política de movimiento y ejecutor.
 *   3. Reutiliza el vocabulario de motion del motor (`motionTokens`) en vez de
 *      inventar una duración y una curva sueltas.
 *
 * Reglas que este módulo garantiza (Lote 2 §15):
 *   - La transición arranca SIEMPRE en la posición actual real, nunca en el
 *     origen ni en un valor de reposo.
 *   - Cambiar de objetivo a mitad de viaje re-origina desde el estado muestreado
 *     y acorta la duración: respuesta inmediata sin salto.
 *   - Duración consistente: el mismo `tier` para los tres trayectos.
 *   - Sin respiración continua ni oscilación: cuando converge, devuelve el
 *     objetivo EXACTO para siempre (no hay término de tiempo libre).
 *   - Sin `scroll` ni puntero: el movimiento de cámara lo pide la UI por
 *     intención explícita, no por scroll-jacking.
 */

import { motionTokens, tierDuration } from '../config/motionTokens.js'

/** Nivel de duración del motor para un desplazamiento amplio. */
export const TRAVEL_DURATION = tierDuration('emphasis') // 0.8 s
/** Duración mínima tras un re-objetivo: un retarget no puede quedar lento. */
export const MIN_TRAVEL_DURATION = tierDuration('micro') // 0.2 s
/** Criterio de convergencia (metros / grados). */
export const SETTLE_EPSILON = 1e-4

/**
 * Curva de Bezier 1D normalizada (x1,y1,x2,y2) → función de easing.
 * Misma convención que las `cubicBezier` de CSS/Framer: tiempo normalizado
 * dentro, valor normalizado fuera. Newton-Raphson con bisección de respaldo.
 *
 * @param {[number, number, number, number]} curve
 * @returns {(t:number)=>number}
 */
export function cubicBezierEase([x1, y1, x2, y2] = [0.4, 0, 0.2, 1]) {
  const cx = 3 * x1
  const bx = 3 * (x2 - x1) - cx
  const ax = 1 - cx - bx
  const cy = 3 * y1
  const by = 3 * (y2 - y1) - cy
  const ay = 1 - cy - by

  const sampleX = (t) => ((ax * t + bx) * t + cx) * t
  const sampleY = (t) => ((ay * t + by) * t + cy) * t
  const sampleDx = (t) => (3 * ax * t + 2 * bx) * t + cx

  return function ease(t) {
    if (!Number.isFinite(t) || t <= 0) return 0
    if (t >= 1) return 1
    let guess = t
    for (let i = 0; i < 8; i += 1) {
      const dx = sampleX(guess) - t
      if (Math.abs(dx) < 1e-6) return sampleY(guess)
      const slope = sampleDx(guess)
      if (Math.abs(slope) < 1e-6) break
      guess -= dx / slope
    }
    // Bisección estable cuando la derivada se aplana.
    let lo = 0
    let hi = 1
    let mid = t
    for (let i = 0; i < 20; i += 1) {
      mid = (lo + hi) / 2
      if (sampleX(mid) < t) lo = mid
      else hi = mid
    }
    return sampleY(mid)
  }
}

/** Easing del motor para desplazamientos: simétrico, sin overshoot. */
export const travelEase = cubicBezierEase(motionTokens.ease.travel)

const lerp = (a, b, t) => a + (b - a) * t

function readVec3(value, fallback) {
  const src = Array.isArray(value) ? value : []
  const safe = Array.isArray(fallback) ? fallback : []
  return [0, 1, 2].map((i) => {
    const n = src[i]
    if (Number.isFinite(n)) return n
    return Number.isFinite(safe[i]) ? safe[i] : 0
  })
}

function readFov(value, fallback) {
  return Number.isFinite(value) ? value : fallback
}

/**
 * Crea un trayecto de cámara.
 *
 * @param {Object} state
 * @param {number[]} state.from.position   Estado actual de la cámara (nunca un
 *   valor de reposo: quien llama pasa la cámara real).
 * @param {number[]} state.from.target
 * @param {number}   state.from.fov
 * @param {{position:number[],target:number[],fov:number}} state.to  Encuadre objetivo.
 * @param {number}   [state.duration]  Segundos; `TRAVEL_DURATION` por defecto.
 * @returns {{sample:(elapsed:number)=>Object, isDone:(elapsed:number)=>boolean, duration:number}}
 */
export function createCameraTravel({ from, to, duration = TRAVEL_DURATION }) {
  const fromPosition = readVec3(from?.position, [0, 0, 5])
  const fromTarget = readVec3(from?.target, [0, 0, 0])
  const fromFov = readFov(from?.fov, 45)
  const toPosition = readVec3(to?.position, fromPosition)
  const toTarget = readVec3(to?.target, fromTarget)
  const toFov = readFov(to?.fov, fromFov)
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : TRAVEL_DURATION

  return {
    from: { position: fromPosition, target: fromTarget, fov: fromFov },
    to: { position: toPosition, target: toTarget, fov: toFov },
    duration: safeDuration,

    /**
     * Muestra el estado de cámara en un instante del trayecto.
     * @param {number} elapsed  Segundos desde el inicio (fuera de rango se
     *   comporta como 0 o como convergido: nunca devuelve basura).
     */
    sample(elapsed) {
      const raw = Number.isFinite(elapsed) ? elapsed / safeDuration : 1
      if (raw <= 0) {
        return {
          position: [...fromPosition],
          target: [...fromTarget],
          fov: fromFov,
          progress: 0,
          done: false,
        }
      }
      if (raw >= 1) {
        return {
          position: [...toPosition],
          target: [...toTarget],
          fov: toFov,
          progress: 1,
          done: true,
        }
      }
      const t = travelEase(raw)
      return {
        position: [
          lerp(fromPosition[0], toPosition[0], t),
          lerp(fromPosition[1], toPosition[1], t),
          lerp(fromPosition[2], toPosition[2], t),
        ],
        target: [
          lerp(fromTarget[0], toTarget[0], t),
          lerp(fromTarget[1], toTarget[1], t),
          lerp(fromTarget[2], toTarget[2], t),
        ],
        fov: lerp(fromFov, toFov, t),
        progress: raw,
        done: false,
      }
    },

    isDone(elapsed) {
      return !Number.isFinite(elapsed) || elapsed / safeDuration >= 1
    },
  }
}

/**
 * Distancia de un trayecto (metros). Sirve para acortar la duración cuando el
 * re-objetivo es pequeño: el retarget se percibe como respuesta, no como animación.
 *
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number}
 */
export function distance3(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return 0
  const sum = a.reduce((acc, n, i) => {
    const d = (Number.isFinite(n) ? n : 0) - (Number.isFinite(b[i]) ? b[i] : 0)
    return acc + d * d
  }, 0)
  return Math.sqrt(sum)
}

/**
 * Duración efectiva de un trayecto entre dos encuadres, en segundos.
 * Proporcional a la distancia de cámara respecto al trayecto completo del
 * recorrido (≈11 m), recortada al rango [MIN, TRAVEL].
 *
 * @param {number[]} fromPosition
 * @param {number[]} toPosition
 * @param {number} [fullSpan]
 * @returns {number}
 */
export function travelDurationFor(fromPosition, toPosition, fullSpan = 11) {
  const d = distance3(fromPosition, toPosition)
  if (!(d > 0)) return MIN_TRAVEL_DURATION
  const ratio = Math.min(1, d / fullSpan)
  const scaled = TRAVEL_DURATION * ratio
  return Math.min(TRAVEL_DURATION, Math.max(MIN_TRAVEL_DURATION, scaled))
}

/**
 * Lee el estado de cámara que interesa a un trayecto, sin exponer objetos de
 * Three al componente. Vive aquí (y no dentro del `useEffect`) para que la
 * lectura de un objeto mutable no se cuele en las dependencias de React.
 *
 * @param {{position?:{x:number,y:number,z:number},fov?:number}} camera
 * @returns {{position:number[],fov:number}}
 */
export function readCameraPosition(camera) {
  const p = camera?.position
  return {
    position: [p?.x ?? 0, p?.y ?? 0, p?.z ?? 5],
    fov: Number.isFinite(camera?.fov) ? camera.fov : 45,
  }
}

/**
 * Aplica un encuadre a la cámara: posición, punto de mira y FOV (con su matriz
 * de proyección, que es lo que hace que el encuadre sea EL de la estación y no
 * una posición correcta con un cuadro equivocado).
 *
 * @param {Object} camera  Cámara del <Canvas>.
 * @param {{position:number[],target:number[],fov:number}} view
 * @returns {void}
 */
export function applyCameraView(camera, view) {
  if (!camera || !view) return
  camera.position?.set?.(view.position[0], view.position[1], view.position[2])
  camera.lookAt?.(view.target[0], view.target[1], view.target[2])
  if (Number.isFinite(view.fov) && Number.isFinite(camera.fov) && Math.abs(camera.fov - view.fov) > 1e-3) {
    camera.fov = view.fov
    camera.updateProjectionMatrix?.()
  }
}

/**
 * ¿Está el trayecto convergido dentro de la tolerancia? Comparación por
 * componente con epsilon: la escena deja de pedir fotogramas cuando es true.
 *
 * @param {number[]} current
 * @param {number[]} goal
 * @param {number} [epsilon]
 * @returns {boolean}
 */
export function isSettled(current, goal, epsilon = SETTLE_EPSILON) {
  if (!Array.isArray(current) || !Array.isArray(goal)) return true
  return current.every((n, i) => Math.abs((Number.isFinite(n) ? n : 0) - (goal[i] ?? 0)) <= epsilon)
}
