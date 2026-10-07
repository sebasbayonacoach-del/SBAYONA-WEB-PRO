/**
 * BAYONA · LABORATORIO ESPACIAL — «TRAYECTORIA» (Lote 1 + Lote 2)
 * ---------------------------------------------------------------
 * Punto de entrada del laboratorio dentro del playground de /design-system.
 *
 * Qué es: un recorrido de TRES estaciones cuyo CONTENIDO vive en DOM (texto
 * real, seleccionable, enlazado) y que ofrece encima una vista espacial opcional
 * — una maqueta greybox que solo se carga si el usuario la pide.
 *
 * Frontera de carga (Lote 2): este módulo NO importa el motor. El puente
 * `TrajectoryStage.jsx` aparece únicamente dentro de un `import()` ligado a la
 * intención explícita del usuario. Sin ese clic, el grafo de esta ruta no ve ni
 * `three`, ni `@react-three/*`, ni el chunk de la escena.
 *
 * Qué NO es, y lo dice él mismo: no es una instalación real ni el acabado
 * definitivo; es una maqueta de referencia en un espacio conceptual. Nada de
 * esto se enlaza desde la home ni desde una ruta pública: el propietario de esta
 * pestaña es el playground interno (`src/pages/DesignSystem.jsx`), que ya es
 * `noindex` y está fuera del sitemap.
 *
 * Nota: `noindex` no es control de acceso. La URL es alcanzable por quien la
 * escriba; el contenido es material de trabajo interno sin datos personales ni
 * comerciales, y así se rotula.
 */

import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { STATIONS, TRAJECTORY } from './trajectoryStations.js'
import { goTo, initialNavigation, isComplete, progressOf, reset, step } from './stationNavigation.js'
import {
  STAGE_ACTIONS,
  STAGE_STATUS,
  canCancel,
  canRequest,
  initialStageState,
  stageReducer,
  stageStatusLabel,
} from './trajectoryStageMachine.js'
import { WEBGL_UNAVAILABLE_MESSAGE, probeWebGL } from './webglSupport.js'
import TrajectoryComposition from './TrajectoryComposition.jsx'
// Lectura de capacidades del motor (movimiento reducido), por RUTA DIRECTA y no
// por el barrel: el módulo ya está en el grafo de entrada de toda la app, así
// que no añade bytes, y evita duplicar un `matchMedia` propio con su propia
// definición de "reducido".
import { useCapabilities } from '../../engine/hooks/useCapabilities.js'
import '../../styles/spatial-lab.css'

function navReducer(state, action) {
  switch (action.type) {
    case 'step':
      return step(state, action.delta)
    case 'go':
      return goTo(state, action.index)
    case 'reset':
      return reset(state)
    default:
      return state
  }
}

export default function TrajectoryLab() {
  const [nav, dispatch] = useReducer(navReducer, STATIONS.length, initialNavigation)
  const [stage, dispatchStage] = useReducer(stageReducer, undefined, initialStageState)
  const [engineInfo, setEngineInfo] = useState(null)

  const caps = useCapabilities()
  const reducedMotion = caps?.reducedMotion === true

  const active = STATIONS[nav.index] ?? STATIONS[0]
  const complete = isComplete(nav)

  /**
   * Teclado del grupo de estaciones: flechas para recorrer con el foco,
   * Inicio/Fin para los extremos, Escape para volver al principio. Vive en los
   * BOTONES, no en el <nav>: el contenedor no es interactivo y un listener ahí
   * es un error de accesibilidad (jsx-a11y) además de un patrón peor. Tab no se
   * captura: salir del grupo tiene que ser siempre posible.
   */
  const tabRefs = useRef([])

  const onTabKeyDown = useCallback((event, index) => {
    const last = STATIONS.length - 1
    const moves = {
      ArrowRight: Math.min(index + 1, last),
      ArrowDown: Math.min(index + 1, last),
      ArrowLeft: Math.max(index - 1, 0),
      ArrowUp: Math.max(index - 1, 0),
      Home: 0,
      End: last,
    }
    if (event.key in moves) {
      event.preventDefault()
      const target = moves[event.key]
      dispatch({ type: 'go', index: target })
      tabRefs.current[target]?.focus()
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      dispatch({ type: 'reset' })
      tabRefs.current[0]?.focus()
    }
  }, [])

  /**
   * Efecto de carga: lo ÚNICO que descarga el motor. Corre con `loading`, nunca
   * antes, y su resultado se descarta si la petición quedó obsoleta
   * (cancelación, desmontaje, reintento). Primero se sondea WebGL y solo después
   * se importa el puente: a un navegador sin contexto no se le piden los ~240 kB
   * de librería gráfica (sería gastar para poder mostrar un error).
   *
   * Un `import()` ya lanzado no se puede retirar de la caché del navegador: lo
   * que sí se puede es no montar lo que llegue tarde, y eso es lo que hace el
   * `token` de la máquina de estados.
   */
  useEffect(() => {
    if (stage.status !== STAGE_STATUS.LOADING) return undefined
    const token = stage.token
    let alive = true

    const probe = probeWebGL()
    if (!probe.ok) {
      dispatchStage({ type: STAGE_ACTIONS.FAILED, token, error: WEBGL_UNAVAILABLE_MESSAGE })
      return () => {
        alive = false
      }
    }
    setEngineInfo(probe)

    import('./TrajectoryStage.jsx')
      .then((module) => {
        if (!alive) return
        const Stage = module?.default ?? module?.TrajectoryStage ?? null
        dispatchStage({ type: STAGE_ACTIONS.RESOLVED, token, Stage })
      })
      .catch((error) => {
        if (!alive) return
        dispatchStage({
          type: STAGE_ACTIONS.FAILED,
          token,
          error:
            `No se pudo cargar el módulo de la escena (${String(error?.message ?? 'sin detalle')}). ` +
            'El texto del recorrido sigue intacto.',
        })
      })

    return () => {
      alive = false
    }
  }, [stage.status, stage.token])

  const requestSpatial = useCallback(() => {
    dispatchStage({ type: STAGE_ACTIONS.REQUEST })
  }, [])

  const cancelSpatial = useCallback(() => {
    dispatchStage({ type: STAGE_ACTIONS.CANCEL })
  }, [])

  const returnToSimple = useCallback(() => {
    // Desmontar el <Canvas> es el mecanismo real de interrupción del bucle de
    // render: no hay "pausar" el motor, se le retira del árbol.
    dispatchStage({ type: STAGE_ACTIONS.RETURN })
    setEngineInfo(null)
  }, [])

  const handleStageFailed = useCallback((reason) => {
    dispatchStage({ type: STAGE_ACTIONS.VERIFY_FAILED, error: String(reason ?? '') })
    setEngineInfo(null)
  }, [])

  const Stage = stage.status === STAGE_STATUS.SPATIAL ? stage.Stage : null

  return (
    <section className="lab" aria-labelledby="lab-title">
      <header className="lab-head">
        <p className="lab-kicker">
          Laboratorio · {TRAJECTORY.name} — {TRAJECTORY.subtitle}
        </p>
        <h2 className="lab-title" id="lab-title">
          {TRAJECTORY.heading}
        </h2>
        <p className="lab-intro">{TRAJECTORY.intro}</p>
        <p className="lab-state">
          <span className="lab-badge">{TRAJECTORY.status}</span>
          <span className="lab-state__note">{TRAJECTORY.disclaimer}</span>
        </p>
      </header>

      <div className="lab-body">
        <div className="lab-side">
          <nav className="lab-tabs" aria-label="Estaciones del recorrido">
            {STATIONS.map((station, index) => (
              <button
                key={station.id}
                type="button"
                className="lab-tab"
                ref={(node) => {
                  tabRefs.current[index] = node
                }}
                onClick={() => dispatch({ type: 'go', index })}
                onKeyDown={(event) => onTabKeyDown(event, index)}
                aria-pressed={index === nav.index}
              >
                <span className="lab-tab__marker" aria-hidden="true">
                  {station.marker}
                </span>
                <span className="lab-tab__title">{station.title}</span>
              </button>
            ))}
          </nav>

          <div className="lab-progress" role="presentation">
            <span
              className="lab-progress__fill"
              style={{ transform: `scaleX(${Math.max(progressOf(nav), 0.06)})` }}
            />
            <span className="lab-progress__text">
              Estación {nav.index + 1} de {nav.count}
              {complete ? ' · recorrido visto' : ''}
            </span>
          </div>

          {/* ------------------------------------------- MODO ESPACIAL (Lote 2) */}
          <div className="lab-mode">
            <p className="lab-mode__status" role="status">
              {stageStatusLabel(stage.status)}
              {stage.status === STAGE_STATUS.SPATIAL && reducedMotion
                ? ' · cambios de encuadre por corte (movimiento reducido)'
                : ''}
            </p>

            {canRequest(stage) && (
              <button type="button" className="lab-mode__cta" onClick={requestSpatial}>
                {stage.status === STAGE_STATUS.ERROR ? 'Reintentar vista espacial' : 'Activar vista espacial'}
              </button>
            )}
            {stage.status === STAGE_STATUS.SPATIAL && (
              <button type="button" className="lab-mode__cta" onClick={returnToSimple}>
                Volver a la vista sencilla
              </button>
            )}
            {canCancel(stage) && (
              <button type="button" className="lab-mode__ghost" onClick={cancelSpatial}>
                Cancelar carga
              </button>
            )}

            {stage.status === STAGE_STATUS.ERROR && stage.error && (
              <p className="lab-mode__error">{stage.error}</p>
            )}

            <p className="lab-mode__note">
              {stage.status === STAGE_STATUS.SPATIAL
                ? 'Maqueta greybox: geometría, escala y encuadre. Sin materiales definitivos, sin sombras y sin modelo descargado. Cambiar de estación mueve la cámara; la lectura del método está en el panel, no en el lienzo.'
                : 'La vista espacial es una maqueta de referencia que se descarga solo al activarla. El recorrido se lee completo sin ella.'}
            </p>

            {engineInfo?.version && (
              <p className="lab-mode__engine" data-webgl-version={engineInfo.version}>
                Motor: WebGL {engineInfo.version === 'webgl2' ? '2' : '1'}
                {engineInfo.renderer ? ` · ${engineInfo.renderer.slice(0, 60)}` : ''}
                {engineInfo.software ? ' · renderizado por software: no mide GPU' : ''}
              </p>
            )}
          </div>

          <button type="button" className="lab-reset" onClick={() => dispatch({ type: 'reset' })}>
            Volver al principio
          </button>
        </div>

        <div className="lab-stage">
          {Stage ? (
            <Stage stationKey={active.key} onFailed={handleStageFailed} />
          ) : (
            <TrajectoryComposition
              activeIndex={nav.index}
              onSelect={(index) => dispatch({ type: 'go', index })}
            />
          )}

          <article className="lab-panel" id={`lab-panel-${active.id}`} aria-labelledby={`lab-h-${active.id}`}>
            <p className="lab-panel__marker">
              {active.marker} / {String(STATIONS.length).padStart(2, '0')}
            </p>
            <h3 className="lab-panel__title" id={`lab-h-${active.id}`}>
              {active.title}
            </h3>
            <p className="lab-panel__body">{active.body}</p>

            <dl className="lab-panel__spatial">
              <div>
                <dt>Cámara</dt>
                <dd>{active.spatial.camera}</dd>
              </div>
              <div>
                <dt>Lectura</dt>
                <dd>{active.spatial.reading}</dd>
              </div>
              <div>
                <dt>Luz</dt>
                <dd>{active.spatial.light}</dd>
              </div>
            </dl>

            <p className="lab-panel__cta">
              <Link to={active.to} className="lab-cta">
                {active.ctaLabel}
              </Link>
            </p>
          </article>
        </div>
      </div>

      <footer className="lab-foot">
        <p className="lab-boundary">{TRAJECTORY.boundary}</p>
        <p className="lab-foot__meta">
          Motor gráfico solo bajo demanda · <Link to="/programs">programas</Link> ·{' '}
          <Link to="/#empieza">empieza gratis</Link> · <Link to="/community">comunidad</Link>
        </p>
      </footer>
    </section>
  )
}
