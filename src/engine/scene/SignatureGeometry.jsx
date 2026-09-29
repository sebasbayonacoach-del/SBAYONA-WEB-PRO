// SignatureGeometry - geometria insignia de la escena 3D
// (Requirements 1.1, 1.2, 1.3, 1.4, 2.4, 2.5, 2.6).
//
// Malla organica generada a partir de un ICOSAEDRO SUBDIVIDIDO (geodesica) cuyos
// vertices se deforman continuamente por ruido simplex en el vertex shader
// (R1.1, R1.3). Se descarta explicitamente la primitiva de nudo toroidal
// procedural (R1.2): la forma debe percibirse organica y viva, no un nudo
// procedural generico.
//
// El material es un THREE.ShaderMaterial ensamblado por COMPOSICION de los
// snippets GLSL del engine (tarea 8.1):
//   - NOISE_GLSL   -> `snoise(vec3)` (desplazamiento de vertices).
//   - AURORA_GLSL  -> `auroraColor(...)` degradado dorado -> naranja (color base).
//   - GLOW_GLSL    -> `fresnelGlow(...)` halo fresnel en la silueta (R2.3).
//   - DISSOLVE_GLSL-> `dissolveAlpha(...)` disolucion por umbral de ruido (R2.2).
// Encima se anade un acabado metalico dorado con un termino especular/fresnel
// suave (R1.4).
//
// Adaptacion por dispositivo (R2.5): en Desktop la subdivision del icosaedro es
// alta (silueta fluida) y en Mobile baja (menor coste de vertices).
//
// Movimiento (R2.4 / R2.6 / R7.1):
//   - Sin movimiento reducido: `uTime` avanza en `useFrame` (deformacion y aurora
//     animadas) y la malla tiene un giro idle sutil.
//   - Con `reducedMotion`: `uTime` NO avanza (estado estatico) y no hay giro idle.
//   - El progreso de scroll SIEMPRE orienta la geometria, en ambos modos (R7.1).
//
// El material se libera al desmontar via `useDisposable` (R22.5). La geometria,
// al ser declarativa (`<icosahedronGeometry>`), la libera React Three Fiber.
//
// NOTA: componente interno de la escena; no se exporta en el barrel del engine.

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { NOISE_GLSL, AURORA_GLSL, auroraUniforms } from '../shaders/aurora.glsl.js'
import { DISSOLVE_GLSL, dissolveUniforms } from '../shaders/dissolve.glsl.js'
import { GLOW_GLSL, glowUniforms } from '../shaders/glow.glsl.js'
import { useDisposable } from '../hooks/useDisposable.js'
import { readScroll } from '../hooks/useScrollProgress.js'

// Radio del icosaedro base (unidades de escena).
const GEOMETRY_RADIUS = 1.4

// Nivel de subdivision del icosaedro por modo (R2.5): alto en Desktop para una
// silueta fluida, bajo en Mobile para reducir el numero de vertices.
const DESKTOP_DETAIL = 20
const MOBILE_DETAIL = 8

// Velocidad del giro idle (rad/s) cuando el movimiento esta permitido.
const IDLE_SPEED = 0.15

// Vertex shader: antepone NOISE_GLSL y desplaza cada vertice a lo largo de su
// normal segun el ruido simplex, generando una deformacion organica continua
// (R1.3). Exporta hacia el fragment: normal (espacio de vista), posicion de
// vista y el valor de ruido normalizado 0..1.
//
// Los uniforms/attributes integrados de three (position, normal, normalMatrix,
// modelViewMatrix, projectionMatrix) los inyecta el propio ShaderMaterial: NO se
// redeclaran aqui para evitar errores de "redefinition".
const VERTEX_SHADER = /* glsl */ `
${NOISE_GLSL}

uniform float uTime;
uniform float uDisplaceAmp;
uniform float uDisplaceFreq;
uniform float uSpeed;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vNoise;

void main() {
  // Ruido simplex sobre la posicion escalada, avanzado en el tiempo -> flujo continuo.
  float n = snoise(position * uDisplaceFreq + uTime * uSpeed);

  // Normalizamos el ruido de ~[-1, 1] a 0..1 para reutilizarlo en el fragment
  // (color aurora y umbral de disolucion).
  vNoise = n * 0.5 + 0.5;

  // Desplazamiento a lo largo de la normal: infla/hunde la superficie (R1.3).
  vec3 displaced = position + normal * n * uDisplaceAmp;

  // Normal en espacio de vista para el fresnel/especular del fragment.
  vNormal = normalMatrix * normal;

  // Posicion en espacio de vista; la direccion de vista es su opuesto.
  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  vViewPosition = -mvPosition.xyz;

  gl_Position = projectionMatrix * mvPosition;
}
`

// Fragment shader: antepone AURORA_GLSL, GLOW_GLSL y DISSOLVE_GLSL. Calcula el
// color base tipo aurora, le suma un acabado metalico dorado (especular + rim,
// R1.4) y el halo fresnel (R2.3), y finalmente descarta los fragmentos por
// debajo del umbral de disolucion (R2.2).
const FRAGMENT_SHADER = /* glsl */ `
${AURORA_GLSL}
${GLOW_GLSL}
${DISSOLVE_GLSL}

uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uTime;
uniform float uDissolve;
uniform vec3 uGlowColor;
uniform float uGlowIntensity;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vNoise;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);

  // Color base: degradado dorado -> naranja modulado por ruido y tiempo.
  vec3 color = auroraColor(vNoise, uColorA, uColorB, uTime);

  // Acabado metalico dorado (R1.4): especular suave (Blinn-Phong) con una luz
  // cenital fija + un realce fresnel tenue en el borde. El especular hereda el
  // tono del color base para dar sensacion de metal pulido.
  vec3 lightDir = normalize(vec3(0.4, 0.8, 0.6));
  vec3 halfVec = normalize(lightDir + viewDir);
  float specular = pow(max(dot(normal, halfVec), 0.0), 48.0);
  float rim = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
  color += color * specular * 0.35;
  color += uGlowColor * rim * 0.12;

  // Halo fresnel dorado alrededor de la silueta (R2.3).
  color += fresnelGlow(vNormal, viewDir, uGlowColor, uGlowIntensity) * 0.5;

  // Disolucion por ruido: descarta lo que quede por debajo del umbral (R2.2).
  if (dissolveAlpha(vNoise, uDissolve) < 0.5) discard;

  // Control de rango: evita que la suma de terminos sobreexponga a blanco puro.
  color = clamp(color, 0.0, 1.0);

  gl_FragColor = vec4(color, 1.0);
}
`

/**
 * Convierte un color en formato `[r, g, b]` (0..1) a un `THREE.Color`.
 * @param {[number, number, number]} rgb
 * @returns {THREE.Color}
 */
function toColor(rgb) {
  return new THREE.Color().setRGB(rgb[0], rgb[1], rgb[2])
}

/**
 * Geometria insignia deformada por ruido con material metalico dorado.
 *
 * @param {Object} props
 * @param {import('../config/sceneConfig.js').ResolvedScene['params']} [props.params]
 *   Parametros de escena resueltos. Se leen `dissolve` (0..1) y `glowIntensity`
 *   como overrides de los uniforms por defecto de los shaders.
 * @param {number|import('framer-motion').MotionValue<number>} [props.scrollProgress=0]
 *   Progreso de scroll normalizado 0..1 (numero o MotionValue) que orienta
 *   SIEMPRE la geometria (R7.1). Se lee con `readScroll` en el `useFrame`.
 * @param {import('../providers/capabilities.js').Capabilities} [props.caps]
 *   Capacidades vivas: `mode` fija el nivel de subdivision (R2.5) y
 *   `reducedMotion` congela la animacion temporal (R2.6).
 * @returns {JSX.Element}
 */
export function SignatureGeometry({ params, scrollProgress = 0, caps }) {
  // Referencia a la malla para orientar/animar en cada fotograma.
  const meshRef = useRef(null)
  // Acumulador del giro idle: separado del scroll para poder sumarlos sin que el
  // control por scroll (absoluto) pise la animacion idle (incremental).
  const idleRotation = useRef(0)
  // Registro de recursos GPU liberables al desmontar (R22.5).
  const register = useDisposable()

  // Subdivision del icosaedro segun el modo del dispositivo (R2.5).
  const detail = caps?.mode === 'desktop' ? DESKTOP_DETAIL : MOBILE_DETAIL

  // Material compuesto a partir de los snippets GLSL. Se crea UNA sola vez
  // (recompilar shaders es costoso): los valores iniciales toman los defaults de
  // los shaders y los overrides de `params`. Los uniforms dinamicos se mantienen
  // sincronizados aparte en un efecto, evitando recrear el material.
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          // Aurora (color base).
          uColorA: { value: toColor(auroraUniforms.uColorA.value) },
          uColorB: { value: toColor(auroraUniforms.uColorB.value) },
          uTime: { value: auroraUniforms.uTime.value },
          // Disolucion (override desde params).
          uDissolve: { value: params?.dissolve ?? dissolveUniforms.uDissolve.value },
          // Glow (color por defecto; intensidad override desde params).
          uGlowColor: { value: toColor(glowUniforms.uGlowColor.value) },
          uGlowIntensity: {
            value: params?.glowIntensity ?? glowUniforms.uGlowIntensity.value,
          },
          // Desplazamiento organico del vertex shader.
          uDisplaceAmp: { value: 0.35 },
          uDisplaceFreq: { value: 1.1 },
          uSpeed: { value: 0.35 },
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
      }),
    // Creacion unica: los overrides de params se aplican en el efecto de sync.
    [],
  )

  // Mantiene sincronizados los uniforms dinamicos cuando cambian los params, sin
  // recompilar el material.
  useEffect(() => {
    material.uniforms.uDissolve.value = params?.dissolve ?? dissolveUniforms.uDissolve.value
    material.uniforms.uGlowIntensity.value =
      params?.glowIntensity ?? glowUniforms.uGlowIntensity.value
  }, [material, params?.dissolve, params?.glowIntensity])

  // Registra el material para liberarlo al desmontar (R22.5). La geometria
  // declarativa la gestiona/libera React Three Fiber automaticamente.
  useEffect(() => {
    register(material)
  }, [register, material])

  useFrame((_, delta) => {
    // Valor vivo del scroll (numero o MotionValue) leido sin re-render (R19.2).
    const sp = readScroll(scrollProgress)

    const mesh = meshRef.current
    if (!mesh) return

    if (!caps?.reducedMotion) {
      // Avanza el tiempo del shader: deformacion y aurora animadas (R2.4).
      material.uniforms.uTime.value += delta
      // Giro idle sutil, solo con movimiento permitido.
      idleRotation.current += delta * IDLE_SPEED
    }
    // Con reducedMotion no se toca uTime ni el giro idle: estado estatico (R2.6).

    // El progreso de scroll SIEMPRE orienta la geometria (R7.1). Con movimiento
    // reducido `idleRotation` queda en 0, de modo que la orientacion depende solo
    // (y de forma estatica) de la posicion de scroll.
    mesh.rotation.y = sp * Math.PI * 2 + idleRotation.current
    mesh.rotation.x = sp * Math.PI * 0.25
  })

  return (
    <mesh ref={meshRef} material={material}>
      {/* Icosaedro subdividido: forma organica; excluye la primitiva de nudo toroidal (R1.2). */}
      <icosahedronGeometry args={[GEOMETRY_RADIUS, detail]} />
    </mesh>
  )
}
