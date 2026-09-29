// PostProcessing - pipeline de post-procesado cinematografico de la escena 3D
// (Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8).
//
// Envuelve el render de la Scene_3D con el <EffectComposer> de
// @react-three/postprocessing (API v2) y monta la cadena de efectos en el orden
// de pipeline definido en el diseno:
//
//   bloom -> vigneta -> grano
//
// Composicion de la cadena segun contexto (caps):
//   - Bloom (R6.1) y Vigneta (R6.4): SIEMPRE presentes, en cualquier modo.
//   - Noise / grano de pelicula (R6.5): presente mientras haya movimiento
//     permitido; es un efecto que varia por fotograma, por lo que se omite con
//     movimiento reducido (R6.7).
//   - Reduced_Motion (R6.7, R6.8): se construye el composer SOLO con Bloom y
//     Vigneta ESTATICOS (parametros fijos, sin animacion por fotograma) y se
//     OMITE todo efecto que varie por frame (grano). Ninguno de los efectos de
//     este modulo se anima por fotograma: no hay useFrame, por lo que
//     bloom/vigneta quedan estaticos.
//
// Color del bloom "mediante la escena": el bloom NO recibe un color explicito;
// realza por luminancia los tonos mas claros del render, que en esta escena son
// los emisivos dorado/naranja del Theme (materiales/luces de las Tareas 8-11).
// Un `luminanceThreshold` alto concentra el brillo en esos tonos claros (R6.1).
//
// IMPORTANTE (API v2): el <EffectComposer> construye sus pasadas a partir de los
// EFECTOS realmente montados como hijos; pasar hijos `false`/`null` rompe el
// pipeline. Por eso la cadena se arma como un ARRAY de elementos segun las
// condiciones (sin entradas falsy) y se renderiza como hijos del composer.
//
// NOTA: componente interno de la escena; no se exporta en el barrel del engine.

import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

// --- Bloom (R6.1) ---
// Intensidad por defecto si la escena no aporta `bloomIntensity` (espejo del
// valor Desktop del Scene_Registry).
const DEFAULT_BLOOM_INTENSITY = 1.2
// Umbral de luminancia: solo los pixeles mas claros (emisivos dorado/naranja)
// superan el umbral y florecen; el resto de la escena no brilla.
const BLOOM_LUMINANCE_THRESHOLD = 0.85
// Suavizado del corte de luminancia para una transicion de brillo sin bordes.
const BLOOM_LUMINANCE_SMOOTHING = 0.25

// --- Vignette (R6.4) ---
// Inicio del oscurecimiento hacia los bordes y profundidad del mismo.
const VIGNETTE_OFFSET = 0.32
const VIGNETTE_DARKNESS = 0.72

// --- Noise / grano de pelicula (R6.5) ---
// Opacidad baja para un grano sutil, tipo pelicula, no ruido agresivo.
const GRAIN_OPACITY = 0.04

/**
 * Pipeline de post-procesado cinematografico de la escena 3D.
 *
 * Monta el <EffectComposer> con la cadena de efectos adecuada a la
 * preferencia de movimiento. La degradacion por modo (Desktop/Mobile) y el
 * respeto a `reducedMotion` se resuelven aqui construyendo el array de efectos
 * sin entradas falsy (requisito de la API v2).
 *
 * @param {Object} props
 * @param {import('../config/sceneConfig.js').ResolvedScene['params']} [props.params]
 *   Parametros resueltos de la escena; se lee `bloomIntensity` (R6.1).
 * @param {import('../providers/capabilities.js').Capabilities} [props.caps]
 *   Capacidades vivas: `reducedMotion` desactiva los efectos por
 *   fotograma (R6.7, R6.8).
 * @returns {JSX.Element} El <EffectComposer> con la cadena de efectos activa.
 */
export function PostProcessing({ params, caps }) {
  // Intensidad de bloom desde la escena, con default de calidad Desktop (R6.1).
  const bloomIntensity = params?.bloomIntensity ?? DEFAULT_BLOOM_INTENSITY

  // Contexto de decision: reduced-motion recorta el pipeline a bloom +
  // vigneta estaticos (R6.7, R6.8).
  const reducedMotion = Boolean(caps?.reducedMotion)

  // Cadena de efectos como ARRAY (nunca hijos falsy, ver nota de API v2). Se
  // rellena en el orden de pipeline del diseno; cada rama es aditiva.
  const effects = []

  // Bloom: SIEMPRE presente y estatico (R6.1). Realza por luminancia los tonos
  // dorado/naranja emisivos de la escena; `mipmapBlur` da un halo suave y ancho.
  effects.push(
    <Bloom
      key="bloom"
      intensity={bloomIntensity}
      luminanceThreshold={BLOOM_LUMINANCE_THRESHOLD}
      luminanceSmoothing={BLOOM_LUMINANCE_SMOOTHING}
      mipmapBlur
    />,
  )

  // Vigneta: SIEMPRE presente y estatica (R6.4). Oscurece los bordes para
  // concentrar la atencion en el centro de la escena.
  effects.push(
    <Vignette key="vignette" offset={VIGNETTE_OFFSET} darkness={VIGNETTE_DARKNESS} />,
  )

  // Grano de pelicula (R6.5): grano sutil (opacidad baja + premultiply, que
  // atenua el grano en las zonas oscuras, como en pelicula). Es un efecto que
  // varia por fotograma, de modo que se OMITE con movimiento reducido (R6.7).
  // Presente tanto en Desktop como en Mobile mientras haya movimiento.
  if (!reducedMotion) {
    effects.push(
      <Noise
        key="grain"
        premultiply
        opacity={GRAIN_OPACITY}
        blendFunction={BlendFunction.OVERLAY}
      />,
    )
  }

  return <EffectComposer>{effects}</EffectComposer>
}
