// ShopHologramLayer — capa WebGL del hero de Shop
// Fase 11.6 · Se carga vía React.lazy en Shop.jsx para no bloquear LCP.
//
// El holograma de la tarjeta vive DETRÁS del título "EQUIPA TU MOVIMIENTO"
// (z-index: 0) y NO captura eventos de puntero: los CTAs de carrito y
// WhatsApp de las secciones siguientes siguen recibiendo todos los clics.
// Si WebGL falla, SceneErrorBoundary retira el lienzo en silencio y el
// hero 2D (imagen de fondo + título animado) permanece visible.

import { SceneMount } from '../../engine/scene/SceneMount.jsx'

/** Configuración de la escena 3D holográfica de Shop.
 * Apagada a propósito (comprobado el 2026-09-19 con captura real): la variante
 * `hologram` declara `assets: []`, así que la tarjeta se pinta sin textura y sale
 * como un rectángulo negro tapando la fotografía del hero. Eso no es un holograma,
 * es un defecto. Requiere asset + presupuesto de carga del MASTERPLAN antes de
 * abrirse. Lo que sí se queda arreglado es el puntero del Canvas en Scene3D. */
const HOLOGRAM_SCENE_CONFIG = {
  variant: 'hologram',
  enabled: false,
  postProcessing: true,
}

/**
 * Capa 3D holográfica del hero de Shop.
 * @returns {JSX.Element|null}
 */
export default function ShopHologramLayer() {
  return (
    <SceneMount
      config={HOLOGRAM_SCENE_CONFIG}
      className="shop-hologram-webgl"
      style={{ pointerEvents: 'none' }}
    />
  )
}
