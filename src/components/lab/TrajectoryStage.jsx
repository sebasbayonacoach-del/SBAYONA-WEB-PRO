/**
 * BAYONA · LABORATORIO ESPACIAL — PUENTE AL MOTOR (Lote 2)
 * -------------------------------------------------------------------------
 * Módulo PUENTE: es lo único del laboratorio que conoce el engine de escena.
 * Se carga SOLO con `import()` desde `TrajectoryLab.jsx`, de modo que:
 *
 *   · En modo sencillo, esta ruta no existe en el grafo del navegador.
 *   · El DOM del laboratorio nunca importa `three` ni `@react-three/*`: el
 *     único import del motor es `SceneMount`, que ya trae su propia carga
 *     perezosa hacia `Scene3D` (patrón existente de la Fase 7B, no lo invento
 *     aquí). No se toca el barrel del engine: import por ruta directa.
 *
 * Hace tres cosas y ninguna más:
 *   1. Traduce el estado del laboratorio a un `Scene_Config` (`variant:
 *      'trajectory'` + la estación actual dentro de `params`).
 *   2. Deja montar la escena en el contenedor que le presta.
 *   3. VERIFICA después de montar que hay un `<canvas>` con contexto WebGL vivo
 *      y lo comunica. Sin esto, una barrera de error silenciosa dejaría un hueco
 *      negro con la UI diciendo "vista espacial activa", que es justo lo que
 *      este lote no puede permitirse.
 */

import { useEffect, useMemo, useRef } from 'react'
import { SceneMount } from '../../engine/scene/SceneMount.jsx'
import { INITIAL_VIEW_KEY, VIEWS, viewFor } from '../../engine/scene/trajectoryStage.js'
import { hasLiveWebGLContext } from './webglSupport.js'

/**
 * Variante de `resolveSceneConfig` usada por el laboratorio. Se construye aquí y
 * no en el DOM sencillo para que el laboratorio pueda existir sin este fichero.
 *
 * @param {Object} props
 * @param {string} [props.stationKey]  'understand' | 'build' | 'support'
 * @returns {Object} Scene_Config
 */
/** Estaciones con encuadre propio: el vocabulario cerrado del greybox. */
export const SUPPORTED_STAGE_KEYS = Object.freeze(Object.keys(VIEWS))

export function buildStageConfig(stationKey) {
  const key = SUPPORTED_STAGE_KEYS.includes(stationKey) ? stationKey : INITIAL_VIEW_KEY
  const initial = viewFor(key, 1.6)
  return {
    variant: 'trajectory',
    // El canal legítimo de datos por montaje son los `params`: Scene3D pasa a la
    // variante `params` (y nada más), así que la estación viaja ahí y no por un
    // store global ni por un prop extra del motor (no existe).
    params: {
      stationKey: key,
      // Encuadre con el que nace el <Canvas>: el de la estación actual, para que
      // el primer fotograma ya sea el bueno y no un salto desde el default.
      cameraPosition: initial.position,
    },
    // Greybox: sin partículas, sin post-proceso, sin parallax de puntero.
    particles: false,
    postProcessing: false,
    parallax: false,
  }
}

/**
 * @param {Object} props
 * @param {string} [props.stationKey]
 * @param {() => void} [props.onVerified]   Canvas con contexto WebGL vivo.
 * @param {(reason:string) => void} [props.onFailed]  Montaje sin lienzo utilizable.
 */
export default function TrajectoryStage({ stationKey, onVerified, onFailed }) {
  const hostRef = useRef(null)
  const config = useMemo(() => buildStageConfig(stationKey), [stationKey])
  // Los callbacks viven en un ref para poder verificar UNA sola vez (en el
  // montaje) sin volver a comprobar el lienzo en cada render del laboratorio:
  // re-verificar es trivial, re-emitir `error` mientras carga no es honesto.
  const callbacksRef = useRef({ onVerified, onFailed })
  useEffect(() => {
    callbacksRef.current = { onVerified, onFailed }
  })

  // Verificación post-montaje, sin temporizadores: se comprueba en el commit en
  // el que la escena debería estar. Si la barrera del motor se tragó un fallo,
  // aquí no hay <canvas> y el estado pasa a `error` con explicación.
  useEffect(() => {
    const host = hostRef.current
    const canvas = host && typeof host.querySelector === 'function' ? host.querySelector('canvas') : null
    if (canvas && hasLiveWebGLContext(canvas)) {
      callbacksRef.current.onVerified?.(canvas)
    } else {
      callbacksRef.current.onFailed?.(
        canvas
          ? 'El lienzo está montado, pero su contexto WebGL no está disponible.'
          : 'El motor se descargó, pero no pudo montar un lienzo WebGL.',
      )
    }
    // Sin dependencias: es la comprobación de MONTAJE, no un vigilante del
    // render loop. Tampoco hay temporizador: un lienzo tardío no es un fallo.
  }, [])

  return (
    <div className="lab-spatial" ref={hostRef} data-lab-stage="trajectory">
      <SceneMount config={config} />
    </div>
  )
}
