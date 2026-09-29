// SignatureScene - ensamblaje de la escena insignia 3D
// (Requirements 1.1, 3.1, 4.1, 5.1, 6.1, 7.1, 25.1, 25.4).
//
// Compone TODOS los subsistemas de la escena insignia como HERMANOS dentro del
// <Canvas> de React Three Fiber (el Canvas lo aporta Scene3D). El orden y las
// props de cada subsistema se conservan tal cual los definen sus modulos:
//   - LightingRig       -> iluminacion adaptativa por dispositivo (R3.x).
//   - SignatureGeometry -> geometria insignia deformada por ruido (R1.x, R2.x).
//   - ParticleField     -> campo de particulas interactivo (R4.x), opcional.
//   - InstancedCluster  -> cumulo instanciado con LOD (R5.x).
//   - PostProcessing    -> pipeline cinematografico (R6.x), opcional.
//
// IMPORTANTE (@react-three/postprocessing v2): el <EffectComposer> de
// PostProcessing NO envuelve al resto de mallas. En la API v2 el composer
// renderiza la escena automaticamente (toma el render actual del Canvas), por lo
// que se monta como UN HERMANO mas junto a la geometria, las luces y las
// particulas. Envolver las mallas dentro del composer romperia el pipeline.
//
// Los toggles `particles` y `postProcessing` (independientes por ruta, R25.4)
// llegan ya resueltos desde `resolveSceneConfig` a traves de Scene3D. Cuando un
// toggle es `false`, el subsistema correspondiente NO se monta (no hay coste de
// GPU asociado). Por defecto ambos estan activos.
//
// Carga diferida: este modulo se importa de forma perezosa desde el
// Scene_Registry (`React.lazy`), de modo que el bundle 3D solo se descarga al
// renderizar la escena. Scene3D ya envuelve la variante en <Suspense>, por lo
// que se expone un `export default` ademas del named export (requisito de
// `React.lazy`, que resuelve el `default` del modulo).
//
// NOTA: componente de composicion interno de la escena; no se exporta en el
// barrel publico del engine.

import { LightingRig } from './LightingRig.jsx'
import { SignatureGeometry } from './SignatureGeometry.jsx'
import { ParticleField } from './ParticleField.jsx'
import { InstancedCluster } from './InstancedCluster.jsx'
import { PostProcessing } from './PostProcessing.jsx'

/**
 * Escena insignia completa: ensambla luces, geometria, particulas, cumulo
 * instanciado y post-proceso como hermanos dentro del Canvas de Scene3D.
 *
 * @param {Object} props
 * @param {import('../config/sceneConfig.js').ResolvedScene['params']} props.params
 *   Parametros de escena ya resueltos (defaults + degradacion por dispositivo +
 *   DPR acotado). Se propagan sin transformar a cada subsistema.
 * @param {number} [props.scrollProgress=0]  Progreso de scroll normalizado 0..1
 *   que orienta la geometria y el cumulo y modula el campo de particulas (R7.1).
 * @param {import('../providers/capabilities.js').Capabilities} [props.caps]
 *   Capacidades vivas del dispositivo (modo y movimiento reducido); cada
 *   subsistema decide su adaptacion a partir de ellas.
 * @param {boolean} [props.particles=true]  Toggle del campo de particulas
 *   (independiente por ruta, R25.4). Si es `false`, ParticleField no se monta.
 * @param {boolean} [props.postProcessing=true]  Toggle del post-proceso
 *   (independiente por ruta, R25.4). Si es `false`, PostProcessing no se monta.
 * @returns {JSX.Element} Fragmento con los subsistemas de la escena como hermanos.
 */
export function SignatureScene({
  params,
  scrollProgress = 0,
  caps,
  particles = true,
  postProcessing = true,
}) {
  return (
    <>
      {/* Iluminacion adaptativa: se monta siempre (define el volumen de la escena). */}
      <LightingRig caps={caps} />

      {/* Geometria insignia deformada por ruido, orientada por el scroll. */}
      <SignatureGeometry params={params} scrollProgress={scrollProgress} caps={caps} />

      {/* Campo de particulas interactivo (opcional segun toggle de ruta, R25.4). */}
      {particles && (
        <ParticleField params={params} scrollProgress={scrollProgress} caps={caps} />
      )}

      {/* Cumulo instanciado con LOD, tambien orientado por el scroll. */}
      <InstancedCluster params={params} caps={caps} scrollProgress={scrollProgress} />

      {/*
        Post-proceso cinematografico (opcional, R25.4). El EffectComposer va como
        HERMANO (no envuelve las mallas): en la API v2 renderiza la escena por si
        mismo a partir del render del Canvas.
      */}
      {postProcessing && <PostProcessing params={params} caps={caps} />}
    </>
  )
}

// Default export requerido por `React.lazy` (resuelve el `default` del modulo)
// para la carga diferida cableada en el Scene_Registry.
export default SignatureScene
