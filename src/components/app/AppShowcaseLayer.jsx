// AppShowcaseLayer — capa WebGL del hero de App Experience
// Fase 11.5 · Se carga vía React.lazy en AppExperience.jsx para no bloquear LCP.
//
// Esta capa vive DETRÁS del contenido del hero (z-index: 0) y NO acepta
// eventos de puntero: los CTAs (recibir novedades, conocer el concepto)
// siguen recibiendo todos los clics. Si WebGL falla, SceneErrorBoundary
// retira el lienzo en silencio y el hero 2D permanece visible.

import { SceneMount } from '../../engine/scene/SceneMount.jsx'

/** Configuración de la escena 3D del teléfono de App Experience. */
const SHOWCASE_SCENE_CONFIG = {
  variant: 'showcase',
  postProcessing: true,
  // El registro encuadra el teléfono a 4 m y ocupa la mitad del lienzo, justo
  // detrás del titular: se leía como una losa cruzada con el texto. A 5,6 m
  // queda en un tercio, de emblema tras el lockup, y el velo de la clase
  // `.app-showcase-webgl` lo termina de mandar al fondo.
  params: { cameraPosition: [0, 0.3, 5.6] },
}

/**
 * Capa 3D del teléfono de App Experience.
 * @returns {JSX.Element|null}
 */
export default function AppShowcaseLayer() {
  return (
    <SceneMount
      config={SHOWCASE_SCENE_CONFIG}
      className="app-showcase-webgl"
      style={{ pointerEvents: 'none' }}
    />
  )
}
