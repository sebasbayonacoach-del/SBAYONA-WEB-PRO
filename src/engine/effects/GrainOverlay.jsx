// GrainOverlay - capa global de grano de pelicula (Requirements 16.1, 16.2,
// 16.3).
//
// Overlay estatico en `position: fixed` que cubre todo el viewport y superpone
// una textura de grano generada por `feTurbulence` (ruido fractal) sobre la
// interfaz completa (R16.1). La textura es el MISMO patron SVG que la clase
// `.hero-grain` de `src/styles.css`, embebido como data URI y repetido en mosaico
// para mantener una densidad de grano constante sea cual sea el tamano de
// pantalla.
//
// La opacidad es sutil y configurable para preservar la legibilidad del
// contenido subyacente (R16.2) y `pointer-events: none` garantiza que el usuario
// interactua con los elementos situados por debajo sin que la capa capture
// eventos de puntero (R16.3). Es estatico: no anima por-fotograma.

// Patron de grano SVG (fractalNoise), identico al usado por `.hero-grain` en
// `src/styles.css`. Ya viene URL-encoded, por lo que se usa tal cual dentro de
// `url("...")`.
const GRAIN_DATA_URI =
  "data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.95' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.45'/%3E%3C/svg%3E"

// Lado (px) del mosaico de grano; coincide con el viewBox del SVG (180x180)
// para reproducirlo 1:1 al repetirlo.
const GRAIN_TILE = 180

// z-index alto para cubrir la interfaz, pero por DEBAJO del `CustomCursor`
// (z-index 10000), de modo que el cursor siempre se dibuja sobre el grano.
const GRAIN_Z_INDEX = 9999

/**
 * Capa global de grano de pelicula sobre la interfaz.
 *
 * Renderiza un `div` fijo que cubre todo el viewport (`inset: 0`) con la textura
 * de grano repetida en mosaico. La `opacity` (sutil por defecto) modula la
 * intensidad sin comprometer la legibilidad del contenido (R16.2). No captura
 * eventos de puntero (R16.3) y no realiza animacion alguna (estatico).
 *
 * @param {object} [props]
 * @param {number} [props.opacity=0.03] Opacidad de la capa de grano (0..1). Valor
 *   sutil por defecto para preservar la legibilidad.
 * @returns {JSX.Element} Overlay de grano en `position: fixed`.
 */
export function GrainOverlay({ opacity = 0.03 }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        // No captura eventos: la interaccion pasa a los elementos de abajo (R16.3).
        pointerEvents: 'none',
        zIndex: GRAIN_Z_INDEX,
        opacity,
        backgroundImage: `url("${GRAIN_DATA_URI}")`,
        // Mosaico repetido a tamano fijo para densidad de grano constante (R16.1).
        backgroundRepeat: 'repeat',
        backgroundSize: `${GRAIN_TILE}px ${GRAIN_TILE}px`,
      }}
    />
  )
}
