/**
 * Lote 2 · controlador de cámara — lógica pura, sin WebGL.
 *
 * Lo que se verifica aquí es lo que un navegador no perdona: que la cámara
 * arranca donde está de verdad (no en el origen), que re-encuadrar a mitad de
 * viaje no teletransporta, que converge y se queda quieta (sin respiración), y
 * que la duración sale del vocabulario de motion del motor en vez de ser un
 * número suelto. Si esto estuviera en el componente, quedaría sin probar hasta
 * que alguien mueve la ventana.
 */

import { describe, expect, it } from 'vitest'
import { motionTokens, tierDuration } from '../config/motionTokens.js'
import {
  MIN_TRAVEL_DURATION,
  SETTLE_EPSILON,
  TRAVEL_DURATION,
  applyCameraView,
  createCameraTravel,
  cubicBezierEase,
  distance3,
  isSettled,
  readCameraPosition,
  travelDurationFor,
} from './trajectoryCamera.js'

const FROM = { position: [10, 5, 12], target: [0, 1, 0], fov: 40 }
const TO = { position: [2, 2, 6], target: [0, 1.5, -1], fov: 46 }

describe('trajectoryCamera · easing', () => {
  it('los extremos son exactos y el recorrido es monotónico', () => {
    const ease = cubicBezierEase(motionTokens.ease.travel)
    expect(ease(0)).toBe(0)
    expect(ease(1)).toBe(1)
    let previous = -1
    for (let i = 0; i <= 50; i += 1) {
      const value = ease(i / 50)
      expect(value).toBeGreaterThanOrEqual(previous - 1e-9)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThanOrEqual(1)
      previous = value
    }
  })

  it('degenera con elegancia ante curvas raras en vez de devolver NaN', () => {
    const ease = cubicBezierEase()
    expect(ease(0.5)).toBeGreaterThanOrEqual(0)
    expect(ease(0.5)).toBeLessThanOrEqual(1)
    expect(Number.isFinite(ease(NaN))).toBe(true)
    expect(ease(-3)).toBe(0)
    expect(ease(9)).toBe(1)
  })
})

describe('trajectoryCamera · trayecto', () => {
  it('arranca en el estado actual real de la cámara', () => {
    const travel = createCameraTravel({ from: FROM, to: TO })
    const first = travel.sample(0)
    expect(first.position).toEqual(FROM.position)
    expect(first.target).toEqual(FROM.target)
    expect(first.fov).toBe(FROM.fov)
    expect(first.done).toBe(false)
  })

  it('converge al objetivo exacto y se queda allí (sin deriva ni respiración)', () => {
    const travel = createCameraTravel({ from: FROM, to: TO })
    const atEnd = travel.sample(travel.duration)
    expect(atEnd.done).toBe(true)
    expect(atEnd.position).toEqual(TO.position)
    expect(atEnd.target).toEqual(TO.target)
    expect(atEnd.fov).toBe(TO.fov)
    // Muestrear más allá del final NO introduce desplazamiento residual.
    expect(travel.sample(travel.duration * 4).position).toEqual(TO.position)
    expect(travel.sample(travel.duration * 4).fov).toBe(TO.fov)
  })

  it('usa la duración del motor y la respeta como contrato', () => {
    expect(TRAVEL_DURATION).toBe(tierDuration('emphasis'))
    expect(MIN_TRAVEL_DURATION).toBe(tierDuration('micro'))
    const travel = createCameraTravel({ from: FROM, to: TO })
    expect(travel.duration).toBe(motionTokens.duration.slow)
  })

  it('el progreso avanza y nunca sale de [0,1]', () => {
    const travel = createCameraTravel({ from: FROM, to: TO, duration: 1 })
    expect(travel.sample(0).progress).toBe(0)
    expect(travel.sample(0.5).progress).toBeCloseTo(0.5, 5)
    expect(travel.sample(2).progress).toBe(1)
    expect(travel.sample(-1).progress).toBe(0)
  })

  it('acepta entradas basura sin inventarse posiciones imposibles', () => {
    const travel = createCameraTravel({ from: {}, to: null, duration: 0 })
    expect(travel.duration).toBe(TRAVEL_DURATION)
    expect(travel.sample(NaN).done).toBe(true)
    expect(travel.sample(0).position.every(Number.isFinite)).toBe(true)
    const partial = createCameraTravel({ from: { position: [1, 2] }, to: TO })
    expect(partial.from.position).toEqual([1, 2, 5]) // relleno por defecto del <Canvas>
  })

  it('isDone se vuelve verdadero al cumplir la duración', () => {
    const travel = createCameraTravel({ from: FROM, to: TO, duration: 0.5 })
    expect(travel.isDone(0.2)).toBe(false)
    expect(travel.isDone(0.5)).toBe(true)
    expect(travel.isDone(undefined)).toBe(true) // sin reloj no hay viaje
  })
})

describe('trajectoryCamera · re-objetivo y distancias', () => {
  it('re-orientar desde el punto intermedio parte de ahí, no del origen', () => {
    const first = createCameraTravel({ from: FROM, to: TO, duration: 1 })
    const mid = first.sample(0.5)
    const retarget = createCameraTravel({
      from: { position: mid.position, target: mid.target, fov: mid.fov },
      to: FROM,
      duration: 1,
    })
    expect(retarget.sample(0).position).toEqual(mid.position)
    expect(distance3(retarget.sample(0).position, FROM.position)).toBeGreaterThan(0)
  })

  it('una distancia corta acorta la duración dentro del rango del motor', () => {
    const far = travelDurationFor([10, 5, 12], [-4, 2, 9])
    const near = travelDurationFor([10, 5, 12], [10.6, 5, 12])
    const same = travelDurationFor([1, 1, 1], [1, 1, 1])
    expect(far).toBeLessThanOrEqual(TRAVEL_DURATION)
    expect(near).toBeGreaterThanOrEqual(MIN_TRAVEL_DURATION)
    expect(near).toBeLessThan(far)
    expect(same).toBe(MIN_TRAVEL_DURATION)
  })

  it('distance3 tolera valores no numéricos', () => {
    expect(distance3([0, 0, 0], [3, 4, 0])).toBeCloseTo(5, 6)
    expect(distance3([NaN, 0, 0], [0, 0, 0])).toBeCloseTo(0, 6)
    expect(distance3(null, [1, 2, 3])).toBe(0)
  })

  it('isSettled compara por componente con la tolerancia', () => {
    expect(isSettled([1, 2, 3], [1, 2, 3])).toBe(true)
    expect(isSettled([1, 2, 3 + SETTLE_EPSILON / 2], [1, 2, 3])).toBe(true)
    expect(isSettled([1, 2, 3], [1, 2, 4])).toBe(false)
    expect(isSettled([1, 2], [1, 2, 9])).toBe(true) // lo que no existe no puede temblar
    expect(isSettled(null, [1, 2, 3])).toBe(true)
  })
})

describe('trajectoryCamera · interfaz con la cámara de Three', () => {
  function fakeCamera() {
    const calls = []
    return {
      position: { x: 10, y: 5, z: 12, set(x, y, z) { this.x = x; this.y = y; this.z = z; calls.push(['set', x, y, z]) } },
      fov: 40,
      lookAt(...args) { calls.push(['lookAt', ...args]) },
      updateProjectionMatrix() { calls.push(['updateProjectionMatrix']) },
      calls,
    }
  }

  it('leer la posición no depende de que existan todos los campos', () => {
    expect(readCameraPosition(undefined)).toEqual({ position: [0, 0, 5], fov: 45 })
    const cam = fakeCamera()
    expect(readCameraPosition(cam)).toEqual({ position: [10, 5, 12], fov: 40 })
  })

  it('aplicar un encuadre cambia posición, mira y proyección', () => {
    const cam = fakeCamera()
    applyCameraView(cam, TO)
    expect(cam.position.x).toBe(TO.position[0])
    expect(cam.fov).toBe(TO.fov)
    expect(cam.calls.some((c) => c[0] === 'lookAt')).toBe(true)
    expect(cam.calls.some((c) => c[0] === 'updateProjectionMatrix')).toBe(true)
  })

  it('un fov idéntico no fuerza una recomposición de proyección', () => {
    const cam = fakeCamera()
    cam.fov = TO.fov
    applyCameraView(cam, { ...TO, fov: TO.fov })
    expect(cam.calls.some((c) => c[0] === 'updateProjectionMatrix')).toBe(false)
  })

  it('cámara o encuadre ausentes: no lanza (la escena puede desmontar a mitad)', () => {
    expect(() => applyCameraView(undefined, TO)).not.toThrow()
    expect(() => applyCameraView(fakeCamera(), null)).not.toThrow()
  })
})
