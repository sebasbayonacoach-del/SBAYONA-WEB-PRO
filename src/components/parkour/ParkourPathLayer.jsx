// ParkourPathLayer — capa WebGL del hero de Parkour Academy
// Fase 11.3 · Se carga vía React.lazy en ParkourAcademy.jsx para no bloquear LCP.
//
// Esta capa vive DETRÁS del contenido del hero (z-index: 0) y NO acepta
// eventos de puntero: los CTAs (registrar interés, conocer el método)
// siguen recibiendo todos los clics. Si WebGL falla, SceneErrorBoundary
// retira el lienzo en silencio y el hero 2D permanece visible.

import { SceneMount } from '../../engine/scene/SceneMount.jsx'

/** Configuración de la escena 3D de la trayectoria de Parkour Academy.
 * Apagada a propósito (comprobado el 2026-09-19 con captura real a 1440px):
 * el greybox actual pinta barras instanciadas sueltas sobre la fotografía y el
 * campo de partículas lee como confeti, no como trayectoria con cámara. El brief
 * §38 prohíbe el 3D ornamental, así que no se abre hasta que la escena tenga
 * dirección de arte. El arreglo de punteros de Scene3D sí se queda: sin él, el
 * lienzo se comía los clics de los CTAs. */
const PARKOUR_SCENE_CONFIG = {
  variant: 'parkour',
  enabled: false,
  particles: true,
  postProcessing: true,
}

/**
 * Capa 3D de la trayectoria de Parkour Academy.
 * @returns {JSX.Element|null}
 */
export default function ParkourPathLayer() {
  return (
    <SceneMount
      config={PARKOUR_SCENE_CONFIG}
      className="academy-parkour-webgl"
      style={{ pointerEvents: 'none' }}
    />
  )
}
