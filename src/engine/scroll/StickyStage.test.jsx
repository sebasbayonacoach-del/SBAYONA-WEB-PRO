// Tests del escenario sticky narrativo (Fase 5).

import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DEFAULT_CAPABILITIES } from '../providers/capabilities.js'
import { CapabilityContext } from '../providers/CapabilityProvider.jsx'
import {
  resolveStageIndex,
  resolveStageLength,
  STAGE_DEFAULT_LENGTH,
  StickyStage,
} from './StickyStage.jsx'

const DESKTOP = { ...DEFAULT_CAPABILITIES, mode: 'desktop', canHover: true, finePointer: true }

function renderStage(props, caps = DESKTOP) {
  return render(
    <CapabilityContext.Provider value={caps}>
      <StickyStage {...props} />
    </CapabilityContext.Provider>,
  )
}

describe('resolveStageLength — limites del tramo', () => {
  it('acepta longitudes vh entre 100 y 500', () => {
    expect(resolveStageLength('100vh')).toBe('100vh')
    expect(resolveStageLength('200vh')).toBe('200vh')
    expect(resolveStageLength('300vh')).toBe('300vh')
    expect(resolveStageLength('500vh')).toBe('500vh')
  })

  it('rechaza valores fuera de rango o mal formados (fail-safe)', () => {
    expect(resolveStageLength('99vh')).toBe(STAGE_DEFAULT_LENGTH)
    expect(resolveStageLength('501vh')).toBe(STAGE_DEFAULT_LENGTH)
    expect(resolveStageLength('200px')).toBe(STAGE_DEFAULT_LENGTH)
    expect(resolveStageLength('abc')).toBe(STAGE_DEFAULT_LENGTH)
    expect(resolveStageLength(undefined)).toBe(STAGE_DEFAULT_LENGTH)
    expect(resolveStageLength(200)).toBe(STAGE_DEFAULT_LENGTH)
    expect(resolveStageLength('150vh', '150vh')).toBe('150vh')
  })
})

describe('resolveStageIndex — umbrales de estado', () => {
  it('reparte el progreso en estados equitativos', () => {
    expect(resolveStageIndex(0, 3)).toBe(0)
    expect(resolveStageIndex(0.33, 3)).toBe(0)
    expect(resolveStageIndex(0.34, 3)).toBe(1)
    expect(resolveStageIndex(0.67, 3)).toBe(2)
    expect(resolveStageIndex(1, 3)).toBe(2)
  })

  it('acota entradas degradadas sin lanzar', () => {
    expect(resolveStageIndex(1.5, 3)).toBe(2)
    expect(resolveStageIndex(-1, 3)).toBe(0)
    expect(resolveStageIndex(Number.NaN, 3)).toBe(0)
    expect(resolveStageIndex(0.5, 0)).toBe(0)
    expect(resolveStageIndex(0.99, 2.7)).toBe(1)
  })
})

describe('StickyStage — desktop animado', () => {
  it('renderiza el tramo con su longitud y el viewport fijo', () => {
    const { container } = renderStage({
      length: '200vh',
      children: ({ index }) => <p data-testid="estado">Estado {index}</p>,
    })

    const section = container.querySelector('.sticky-stage')
    expect(section).toBeInTheDocument()
    expect(section.style.height).toBe('200vh')
    expect(container.querySelector('.sticky-stage-viewport')).toBeInTheDocument()
    expect(section).not.toHaveClass('sticky-stage--static')
  })

  it('la funcion de estados arranca en el indice 0 con el progreso como MotionValue', () => {
    let captured
    renderStage({
      children: ({ index, progress }) => {
        captured = { index, progress }
        return <p>Estado {index}</p>
      },
    })

    expect(captured.index).toBe(0)
    expect(typeof captured.progress.get).toBe('function')
  })

  it('acepta contenido simple (sin funcion) dentro del viewport fijo', () => {
    const { getByText } = renderStage({ children: <p>contenido fijo</p> })
    expect(getByText('contenido fijo')).toBeInTheDocument()
  })

  it('una longitud invalida degrada a la longitud por defecto', () => {
    const { container } = renderStage({ length: '9000vh', children: <p>x</p> })
    expect(container.querySelector('.sticky-stage').style.height).toBe(STAGE_DEFAULT_LENGTH)
  })
})

describe('StickyStage — movimiento reducido y movil', () => {
  it('con movimiento reducido apila TODOS los estados sin fijacion', () => {
    const seen = []
    const { container } = renderStage(
      {
        states: 3,
        children: ({ index, progress }) => {
          seen.push({ index, progress })
          return <p>Estado {index}</p>
        },
      },
      { ...DESKTOP, reducedMotion: true },
    )

    expect(container.querySelector('.sticky-stage--static')).toBeInTheDocument()
    expect(container.querySelector('.sticky-stage-viewport')).not.toBeInTheDocument()
    expect(container.querySelectorAll('.sticky-stage-frame')).toHaveLength(3)
    expect(seen.map((s) => s.index)).toEqual([0, 1, 2])
    // Progresos representativos crecientes para el contenido estatico.
    expect(seen.map((s) => s.progress)).toEqual([0, 0.5, 1])
  })

  it('en movil tambien apila la secuencia (la narrativa no bloquea)', () => {
    const { container } = renderStage(
      { states: 2, children: ({ index }) => <p>Estado {index}</p> },
      { ...DEFAULT_CAPABILITIES, mode: 'mobile' },
    )

    expect(container.querySelector('.sticky-stage--static')).toBeInTheDocument()
    expect(container.querySelectorAll('.sticky-stage-frame')).toHaveLength(2)
  })
})
