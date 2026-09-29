// Scene3D - host del lienzo 3D (Requirements 1.1, 7.1, 7.2, 7.4, 22.1-22.3, 22.7).
//
// Punto de montaje del <Canvas> de React Three Fiber. Recibe un ResolvedScene
// (ya degradado por dispositivo y con el DPR acotado por resolveSceneConfig) y
// monta la variante de escena declarada por la ruta. Concentra aqui las
// decisiones de rendimiento/adaptacion que dependen de las capacidades vivas:
//   - DPR acotado por DPR_Limit del modo (R22.3).
//   - frameloop bajo demanda con movimiento reducido (reposo/idle) (R7.4).
//   - antialias y sombras dinamicas solo en Desktop (R3.2, coste GPU).
//
// Montaje condicional: si la ruta no declara escena (config === null) NO se monta
// ningun Canvas (R22.7), evitando coste de WebGL en rutas sin experiencia 3D.
//
// La carga diferida real (React.lazy de este modulo) se cablea en el
// ExperienceProvider (Tarea 16); este componente queda listo para importarse de
// forma perezosa. La variante concreta (config.component) llega en las Tareas
// 8-12; mientras sea null, el Canvas se monta vacio, sin placeholders artificiales.

import { Suspense, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

import { Canvas } from '@react-three/fiber'
import { useCapabilities } from '../hooks/useCapabilities.js'
// Ruta DIRECTA al provider (no el barrel del engine) para evitar ciclos de import.
import { useEngineScroll } from '../providers/ExperienceProvider.jsx'
import { readScroll } from '../hooks/useScrollProgress.js'

/**
 * Host del lienzo 3D para una ruta.
 *
 * @param {Object} props
 * @param {import('../config/sceneConfig.js').ResolvedScene|null} props.config
 *   Escena resuelta por `resolveSceneConfig`, o `null` si la ruta no declara
 *   escena o la variante esta deshabilitada (en cuyo caso no se monta Canvas).
 * @param {number} [props.scrollProgress]  Override opcional del progreso de
 *   scroll normalizado 0..1. Si se omite, se usa la FUENTE UNICA del engine
 *   (`useEngineScroll`, un `MotionValue`) y en su defecto 0. El valor (numero o
 *   MotionValue) se propaga a la variante, que lo lee con `readScroll` dentro de
 *   su `useFrame` sin re-render por-fotograma (R19.2).
 * @param {import('react').MutableRefObject<HTMLElement|null>} [props.eventSource]
 *   Contenedor del que el Canvas toma los eventos de puntero (SceneMount le pasa
 *   el hero padre para no tapar la UI).
 * @param {boolean} [props.inView]  Si el lienzo está dentro del viewport: cuando
 *   es falso el bucle de render se congela (`demand`) para no gastar GPU en una
 *   escena invisible (§33 performance / R7.4).
 * @returns {JSX.Element|null} El <Canvas> con la escena montada, o `null`.
 */
// R3F aplica la prop `camera` solo al CREAR el lienzo.
// Un mismo <Canvas> que recorre variantes (el cycler) se quedaba con la cámara
// de la primera. Se corrige aquí, dentro del Canvas, con el estado vivo.
function SceneCamera({ position }) {
  const camera = useThree((state) => state.camera)
  const [x, y, z] = position ?? []
  useEffect(() => {
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return
    camera.position.set(x, y, z)
    camera.updateProjectionMatrix()
  }, [camera, x, y, z])
  return null
}


function CinematicCameraRig({ basePosition, scrollProgress, enabled }) {
  const camera = useThree((state) => state.camera)
  const [baseX, baseY, baseZ] = basePosition ?? []

  useFrame(() => {
    if (!enabled) return
    if (![baseX, baseY, baseZ].every(Number.isFinite)) return
    const progress = readScroll(scrollProgress)
    const drift = progress - 0.5

    // Desplazamiento microscópico: da profundidad sin cambiar el encuadre
    // resuelto por RouteSceneCycler ni competir con la animación del objeto.
    const targetX = baseX + drift * 0.08
    const targetY = baseY - drift * 0.04
    const targetZ = baseZ * (1 - drift * 0.035)
    const ease = 0.075

    camera.position.x += (targetX - camera.position.x) * ease
    camera.position.y += (targetY - camera.position.y) * ease
    camera.position.z += (targetZ - camera.position.z) * ease
  })

  return null
}

export function Scene3D({ config, scrollProgress, eventSource, inView = true, interactive = true }) {
  // Capacidades vivas del dispositivo (modo, movimiento reducido, DPR_Limit...).
  const caps = useCapabilities()
  // Fuente unica de scroll del engine: MotionValue 0..1, o null fuera del provider.
  const engineScroll = useEngineScroll()

  // Sin escena para esta ruta: no se monta Canvas (R22.7).
  if (!config) {
    return null
  }

  // Componente R3F de la variante. Puede ser null hasta cablear las Tareas 8-12;
  // en ese caso el Canvas se monta vacio a la espera de la geometria real.
  const Component = config.component

  // Reposo/idle con movimiento reducido o lienzo fuera de pantalla: solo se
  // renderiza bajo demanda en vez de en cada fotograma, dejando la escena
  // estática (R7.4, R23.2, §33 performance).
  const frameloop = caps.reducedMotion || !inView ? 'demand' : 'always'

  // Sombras dinamicas solo en Desktop (coste GPU); la iluminacion las consume (R3.2).
  const shadows = caps.mode === 'desktop'

  // Prop explicita > fuente unica del engine > 0. Puede ser numero o MotionValue;
  // la variante lo lee con `readScroll` en su `useFrame` (sin re-render, R19.2).
  
  const scroll = scrollProgress ?? engineScroll ?? 0

  return (
    <Canvas
      dpr={[1, config.params.dpr]} // DPR acotado por DPR_Limit del modo (R22.3).
      frameloop={frameloop}
      shadows={shadows}
      camera={{ position: config.params.cameraPosition, fov: 45 }}
      gl={{ antialias: caps.mode === 'desktop', powerPreference: 'high-performance' }}
      eventSource={eventSource ?? undefined}
      eventPrefix="client"
      style={{ pointerEvents: interactive ? 'auto' : 'none' }}
    >
      <Suspense fallback={null}>
        <SceneCamera position={config.params.cameraPosition} />
        <CinematicCameraRig
          basePosition={config.params.cameraPosition}
          scrollProgress={scroll}
          enabled={!interactive && config.parallax !== false && caps.mode === 'desktop' && !caps.reducedMotion}
        />
        {Component ? (
          <Component
            params={config.params}
            scrollProgress={scroll}
            particles={config.particles}
            postProcessing={config.postProcessing}
            caps={caps}
          />
        ) : null}
      </Suspense>
    </Canvas>
  )
}
