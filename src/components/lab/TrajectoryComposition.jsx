/**
 * BAYONA · LABORATORIO ESPACIAL — COMPOSICIÓN ESTÁTICA DE REFERENCIA
 * ------------------------------------------------------------------
 * Presentación conceptual 2D del pabellón: suelo que ancla, dos montantes, tres
 * plataformas en desnivel, una barra a escala y un arco de trayectoria, con una
 * única dirección de luz que entra por una abertura.
 *
 * Por qué 2D y por qué ya:
 *  - Permite revisar ESCALA, PROPORCIÓN, LECTURA DE PLANO y JERARQUÍA sin
 *    depender de un rodaje, de un modelo ni de una decisión de admisión 3D.
 *  - Es la alternativa 2D contra la que se medirá el greybox del Lote 2: si la
 *    escena no comunica mejor que esto, no hay caso que defender.
 *
 * Es decorativo: todo el contenido existe en el DOM del panel (`LabPanel`), así
 * que el SVG va `aria-hidden` y los hotspots son BOTONES reales encima, no
 * zonas calientes invisibles. Sin `!important`, sin animación permanente: la
 * única transición es el realce de la estación activa y respeta
 * prefers-reduced-motion desde spatial-lab.css.
 */

import { STATIONS, TRAJECTORY } from './trajectoryStations.js'

/** Geometría del dibujo en un viewBox de 1200×640 (unidades ≈ 10 cm). */
const FLOOR_Y = 552
const PLATFORMS = [
  { id: 'trayectoria-understand', x: 96, w: 280, top: 500 },
  { id: 'trayectoria-build', x: 456, w: 252, top: 424 },
  { id: 'trayectoria-support', x: 788, w: 236, top: 336 },
]

export default function TrajectoryComposition({ activeIndex = 0, onSelect }) {
  const active = STATIONS[activeIndex] ?? STATIONS[0]

  return (
    <figure className="lab-composition">
      <svg
        className="lab-composition__art"
        viewBox="0 0 1200 640"
        role="img"
        aria-labelledby="lab-composition-title"
        focusable="false"
      >
        <title id="lab-composition-title">
          Composición de referencia: pabellón de movimiento con tres plataformas en desnivel
        </title>

        <defs>
          <linearGradient id="lab-light" x1="0.72" y1="0" x2="0.36" y2="1">
            <stop offset="0%" stopColor="var(--lab-light-fill, #EDE7DC)" stopOpacity="0.34" />
            <stop offset="62%" stopColor="var(--lab-light-fill, #EDE7DC)" stopOpacity="0.06" />
            <stop offset="100%" stopColor="var(--lab-light-fill, #EDE7DC)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Suelo: la línea que ancla todo el dibujo. */}
        <line className="lab-comp-floor" x1="40" y1={FLOOR_Y} x2="1160" y2={FLOOR_Y} />

        {/* Abertura de luz: la única fuente direccional del espacio. */}
        <polygon className="lab-comp-light" points="902,0 1160,0 700,640 384,640" fill="url(#lab-light)" />
        <line className="lab-comp-aperture" x1="902" y1="6" x2="1160" y2="6" />

        {/* Dos montantes: estructura, no decoración. */}
        <rect className="lab-comp-pier" x="118" y="196" width="18" height={FLOOR_Y - 196} />
        <rect className="lab-comp-pier" x="1004" y="150" width="18" height={FLOOR_Y - 150} />

        {/* Tres plataformas en desnivel controlado. */}
        {PLATFORMS.map((p, i) => (
          <g key={p.id} className={i === activeIndex ? 'is-active' : undefined}>
            <rect className="lab-comp-slab" x={p.x} y={p.top} width={p.w} height="20" />
            <rect
              className="lab-comp-mass"
              x={p.x + 18}
              y={p.top + 20}
              width={p.w - 36}
              height={FLOOR_Y - p.top - 20}
            />
          </g>
        ))}

        {/* Barra a escala humana, apoyada entre la primera y la segunda losa. */}
        <line className="lab-comp-bar" x1="196" y1="452" x2="410" y2="452" />
        <line className="lab-comp-bar" x1="196" y1="452" x2="196" y2="500" />
        <line className="lab-comp-bar" x1="410" y1="452" x2="410" y2="500" />

        {/* La trayectoria: del borde de la losa 2 al apoyo de la 3. */}
        <path className="lab-comp-path" d="M708 424 C 764 360, 800 336, 862 336" />
        <circle className="lab-comp-path-end" cx="862" cy="336" r="5" />

        {/* Marcas de lectura en el suelo (señalética de precisión). */}
        {PLATFORMS.map((p, i) => (
          <text key={`m-${p.id}`} className="lab-comp-mark" x={p.x + 4} y={FLOOR_Y + 26}>
            {String(i + 1).padStart(2, '0')}
          </text>
        ))}
      </svg>

      <figcaption className="lab-composition__caption">
        <span className="lab-composition__hint">{TRAJECTORY.figureHint}</span>
      </figcaption>

      <div className="lab-hotspots">
        {STATIONS.map((station, index) => (
          <button
            key={station.id}
            type="button"
            className="lab-hotspot"
            style={{ left: `${station.hotspot.x}%`, top: `${station.hotspot.y}%` }}
            onClick={() => onSelect?.(index)}
            aria-pressed={station.id === active.id}
            aria-label={`Estación ${station.marker}: ${station.title}`}
          >
            <span className="lab-hotspot__dot" aria-hidden="true" />
            <span className="lab-hotspot__label">{station.marker}</span>
          </button>
        ))}
      </div>
    </figure>
  )
}
