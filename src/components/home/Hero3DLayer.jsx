// Hero3DLayer — capa WebGL del hero de Home
// Fase 11.1 · Se carga vía React.lazy en Home.jsx para no bloquear LCP.
//
// Esta capa vive DETRÁS del contenido del hero (z-index: 0) y acepta
// eventos de puntero para la interacción 3D. Si WebGL falla,
// SceneErrorBoundary retira el lienzo en silencio y el fallback CSS
// (.hero-aurora + .hero-particles) permanece visible.

import { SceneMount } from '../../engine/scene/SceneMount.jsx'

/** Configuración de la escena 3D del hero.
 * Lote 2.2 (integración 2026-09-17): apagada en React (enabled=false) para
 * servir el hero fotográfico aprobado. Reversible sin tocar CSS ni canvas. */
const HERO_SCENE_CONFIG = {
  variant: 'hero',
  enabled: false,
  particles: true,
  postProcessing: true,
}

/**
 * Capa 3D del hero de Home.
 * @returns {JSX.Element|null}
 */
export default function Hero3DLayer() {
  return (
    <SceneMount
      config={HERO_SCENE_CONFIG}
      className="hero-webgl-layer"
    />
  )
}
