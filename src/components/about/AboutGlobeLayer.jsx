// AboutGlobeLayer — capa WebGL del globo de About
// Fase 11.2 · Se carga vía React.lazy en About.jsx para no bloquear LCP.
//
// Esta capa vive DETRÁS del mapa interactivo 2D (z-index: 0) y NO acepta
// eventos de puntero: GlobeTestimonials sigue recibiendo todos los clics.
// Si WebGL falla, SceneErrorBoundary retira el lienzo en silencio y el mapa
// 2D (más la lista HTML accesible) permanece visible.

import { SceneMount } from '../../engine/scene/SceneMount.jsx'

/** Configuración de la escena 3D del globo de About. */
const GLOBE_SCENE_CONFIG = {
  variant: 'globe',
  particles: true,
  postProcessing: true,
}

/**
 * Capa 3D del globo de About.
 * @returns {JSX.Element|null}
 */
export default function AboutGlobeLayer() {
  return (
    <SceneMount
      config={GLOBE_SCENE_CONFIG}
      className="about-globe-webgl"
      style={{ pointerEvents: 'none' }}
    />
  )
}
