// SceneMount - montador de escena 3D con carga diferida (Requirements 22.7, 24.4, 25.2).
//
// Punto de integracion entre la app y el motor 3D. Recibe el Scene_Config
// declarado por una ruta/seccion, lo resuelve con `resolveSceneConfig` (logica
// PURA, R25.2) contra las capacidades vivas del dispositivo y decide si montar o
// no el lienzo:
//   - Si la escena no aplica (variante desconocida, deshabilitada o config
//     ausente) `resolveSceneConfig` devuelve `null` y aqui NO se monta nada
//     (R22.7): la ruta se queda sin coste de WebGL.
//   - Si aplica, se monta `Scene3D` de forma DIFERIDA (`React.lazy` + `Suspense`).
//
// Code-splitting (R22.7): `Scene3D` se importa de forma perezosa mediante
// `import()` dinamico, de modo que `@react-three/fiber` (dependencia pesada) solo
// entra en un chunk aparte que se descarga cuando una ruta realmente monta una
// escena. Las rutas sin experiencia 3D nunca cargan el Canvas ni R3F.
//
// El contenedor se posiciona en absoluto cubriendo a su ancestro posicionado y
// admite eventos de puntero para que el Canvas pueda reaccionar. Permanece DETRÁS
// del contenido del hero mediante z-index; la UI debe ocupar una capa superior
// (lo garantizan `PageHero` y los consumidores directos).

import { Component, lazy, Suspense, useCallback, useEffect, useState } from 'react'
// Imports DIRECTOS (no el barrel del engine) para no arrastrar otros modulos ni
// romper el code-splitting: solo logica pura + lectura de capacidades.
import { resolveSceneConfig } from '../config/sceneConfig.js'
import { useCapabilities } from '../hooks/useCapabilities.js'
import { trackEvent } from '../../lib/analytics/analytics.js'

// Carga diferida del host del lienzo: aisla `@react-three/fiber` en su propio
// chunk. Las rutas sin escena NO descargan este modulo (R22.7).
const Scene3D = lazy(() =>
  import('./Scene3D.jsx').then((module) => ({ default: module.Scene3D })),
)

/**
 * Barrera local de la escena 3D. La capa es decorativa (`aria-hidden`): si
 * Three.js o R3F fallan (WebGL inestable, contexto perdido, bug de escena),
 * la barrera retira el lienzo en silencio y el contenido de la pagina sigue
 * funcionando. Sin ella, el error subiria hasta AppErrorBoundary y tumbaria la
 * pagina entera con la pantalla de recarga. Mismo patron que GlobeErrorBoundary.
 */
class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    trackEvent('scene_3d_error', { message: String(error?.message ?? error) })
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

/**
 * Montador de escena 3D para una ruta o seccion.
 *
 * Resuelve el `Scene_Config` recibido contra las capacidades del dispositivo y,
 * si la escena aplica, monta `Scene3D` de forma diferida dentro de un contenedor
 * posicionado e interactivo detrás del contenido del hero.
 * Si la escena no aplica, no renderiza nada (R22.7).
 *
 * @param {Object} props
 * @param {import('../config/sceneConfig.js').SceneParams & {variant:string, params?:Object, enabled?:boolean, particles?:boolean, postProcessing?:boolean, parallax?:boolean}} props.config
 *   Scene_Config declarado por la ruta (variante + overrides + toggles).
 * @param {string} [props.className]  Clase CSS opcional para el contenedor.
 * @param {import('react').CSSProperties} [props.style]  Estilos opcionales que se
 *   fusionan (y pueden sobrescribir) los estilos de posicionamiento por defecto.
 * @returns {JSX.Element|null} Contenedor con el Canvas diferido, o `null` si la
 *   ruta no declara una escena montable.
 */
export function SceneMount({ config, className, style }) {
  // Capacidades vivas del dispositivo (modo, DPR, movimiento reducido...).
  const caps = useCapabilities()
  // El Canvas escucha eventos desde el contenedor del hero, no desde una capa
  // WebGL que cubra toda la interfaz. Así R3F recibe movimiento de puntero sin
  // interceptar CTAs, enlaces o selección de texto.
  const [eventSource, setEventSource] = useState(null)
  const connectToParent = useCallback((node) => {
    setEventSource(node?.parentElement ?? null)
  }, [])
  // Pausa del bucle de render cuando el lienzo sale del viewport (§33
  // performance / R7.4): mientras el contenedor no se ve, el Canvas congela el
  // frameloop a `demand` y deja de gastar GPU en fotogramas invisibles.
  // Arranca en `true` para no congelar una escena visible antes del primer
  // disparo asíncrono del observer.
  const [inView, setInView] = useState(true)

  useEffect(() => {
    if (!eventSource || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry.isIntersecting)),
      { threshold: 0 },
    )
    observer.observe(eventSource)
    return () => observer.disconnect()
  }, [eventSource])

  // Resolucion PURA: aplica defaults, degradacion por modo y acota el DPR (R25.2).
  const resolved = resolveSceneConfig(config, caps)

  // Sin escena montable para esta ruta: no se monta Canvas ni se carga R3F (R22.7).
  if (!resolved) {
    return null
  }

  return (
    <SceneErrorBoundary>
      <div
        ref={connectToParent}
        className={className}
        // La capa visual acepta puntero para la interacción 3D. Scene3D conecta
        // además el event manager de R3F al hero padre; la UI permanece por encima.
        style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'auto', ...style }}
        aria-hidden="true"
      >
        <Suspense fallback={null}>
          <Scene3D
            config={resolved}
            eventSource={eventSource}
            inView={inView}
            interactive={(style?.pointerEvents ?? 'auto') !== 'none'}
          />
        </Suspense>
      </div>
    </SceneErrorBoundary>
  )
}
