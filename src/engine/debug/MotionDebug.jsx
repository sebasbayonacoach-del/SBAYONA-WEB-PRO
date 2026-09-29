// MotionDebug - overlay de depuracion del movimiento (Fase 5).
//
// SOLO DESARROLLO: requiere `import.meta.env.DEV` (Vite lo elimina estaticamente
// del bundle de produccion) Y el flag de query `?motionDebug=1`. Muestra en
// vivo el estado del scroll del engine: progreso de pagina, velocidad,
// direccion, viewport, modo y movimiento reducido.
//
// Es decorativo (`aria-hidden`, `pointer-events: none`): nunca captura foco ni
// interaccion, y nunca aparece ante un usuario real.

import { useEffect, useState } from 'react'
import { useCapabilities } from '../hooks/useCapabilities.js'
import { useEngineScroll, useScrollState } from '../providers/ExperienceProvider.jsx'

/** Estilo inline del panel: aislado, sin CSS global que mantener. */
const panelStyle = {
  position: 'fixed',
  left: 12,
  bottom: 12,
  zIndex: 9998,
  padding: '10px 12px',
  background: 'rgba(5, 5, 5, 0.92)',
  border: '1px solid rgba(244, 162, 97, 0.4)',
  color: '#e8e4dc',
  font: '11px/1.6 "DM Mono", ui-monospace, monospace',
  letterSpacing: '0.04em',
  pointerEvents: 'none',
  whiteSpace: 'pre',
}

/**
 * Overlay de debug del Motion Engine. Fuera de desarrollo o sin el flag
 * `?motionDebug=1` renderiza `null` (y en produccion Vite elimina la rama).
 *
 * Debe montarse DENTRO de `ExperienceProvider` para leer el estado vivo del
 * scroll; fuera del provider los valores quedan a 0 sin romper.
 *
 * @returns {JSX.Element|null}
 */
export function MotionDebug() {
  // Fuera de desarrollo no existe el overlay: la condicion es estatica para
  // que el bundler elimine todo el arbol en produccion.
  if (!import.meta.env.DEV) return null

  return <MotionDebugPanel />
}

/** Panel vivo. Solo se monta en desarrollo con el flag activo. */
function MotionDebugPanel() {
  const progress = useEngineScroll()
  const state = useScrollState()
  const caps = useCapabilities()
  const [enabled, setEnabled] = useState(false)
  const [readout, setReadout] = useState({ progress: 0, velocity: 0, direction: 0 })

  // Flag de query: el overlay es opt-in incluso en desarrollo.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    setEnabled(params.get('motionDebug') === '1')
  }, [])

  // Actualiza el leido sin suscribir re-renders de todo el arbol: solo este
  // panel se re-renderiza, y solo al cambiar el redondeo (2 decimales).
  useEffect(() => {
    if (!enabled || !progress) return undefined

    const update = () => {
      setReadout((current) => {
        const next = {
          progress: Math.round(progress.get() * 100) / 100,
          velocity: Math.round((state ? state.velocity.get() : 0) * 10) / 10,
          direction: state ? state.direction.get() : 0,
        }
        return next.progress === current.progress &&
          next.velocity === current.velocity &&
          next.direction === current.direction
          ? current
          : next
      })
    }

    const unsubscribe = progress.on('change', update)
    update()
    return unsubscribe
  }, [enabled, progress, state])

  if (!enabled) return null

  const width = typeof window !== 'undefined' ? window.innerWidth : 0
  const lines = [
    `MOTION DEBUG`,
    `progress   ${readout.progress.toFixed(2)}`,
    `velocity   ${readout.velocity.toFixed(1)} px/ev`,
    `direction  ${readout.direction > 0 ? '↓ bajando' : readout.direction < 0 ? '↑ subiendo' : '· reposo'}`,
    `viewport   ${width}px`,
    `mode       ${caps.mode}`,
    `reduced    ${caps.reducedMotion ? 'si' : 'no'}`,
  ]

  return (
    <div style={panelStyle} aria-hidden="true" data-testid="motion-debug">
      {lines.join('\n')}
    </div>
  )
}
