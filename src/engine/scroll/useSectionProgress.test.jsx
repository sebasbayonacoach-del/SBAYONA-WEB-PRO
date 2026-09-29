// Tests del progreso de seccion declarativo (Fase 5, Scroll Storytelling).

import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { resolveRange, SECTION_RANGES, useSectionProgress } from './useSectionProgress.js'

/**
 * Sonda real: asigna el ref a un elemento (como haria una pagina), de modo
 * que `useScroll` trabaja con un nodo hidratado y sin warnings.
 */
function Probe({ options, capture }) {
  const { ref, progress, value } = useSectionProgress(options)
  capture({ progress, value })
  return <div ref={ref} data-testid="probe" />
}

function renderProbe(options) {
  let captured = {}
  const utils = render(<Probe options={options} capture={(api) => (captured = api)} />)
  return { ...utils, captured: () => captured }
}

describe('resolveRange — vocabulario narrativo', () => {
  it('cubre las cuatro intenciones narrativas', () => {
    expect(Object.keys(SECTION_RANGES)).toEqual(['traverse', 'enter', 'pin', 'exit'])
  })

  it('resuelve cada preset a su par offset', () => {
    expect(resolveRange('traverse')).toEqual(['start end', 'end start'])
    expect(resolveRange('enter')).toEqual(['start end', 'start start'])
    expect(resolveRange('pin')).toEqual(['start start', 'end end'])
    expect(resolveRange('exit')).toEqual(['center start', 'end start'])
  })

  it('acepta un par offset explicito valido', () => {
    expect(resolveRange(['start end', 'center start'])).toEqual(['start end', 'center start'])
  })

  it('degrada a traverse ante entradas no reconocidas (fail-safe)', () => {
    expect(resolveRange('inexistente')).toEqual(['start end', 'end start'])
    expect(resolveRange(undefined)).toEqual(['start end', 'end start'])
    expect(resolveRange(null)).toEqual(['start end', 'end start'])
    expect(resolveRange(['solo-uno'])).toEqual(['start end', 'end start'])
    expect(resolveRange(['borde invalido', 'start end'])).toEqual(['start end', 'end start'])
    expect(resolveRange(42)).toEqual(['start end', 'end start'])
  })

  it('devuelve copias: mutar el resultado no altera los presets', () => {
    const resolved = resolveRange('pin')
    resolved[0] = 'mutado'
    expect(SECTION_RANGES.pin).toEqual(['start start', 'end end'])
    expect(resolveRange('pin')).toEqual(['start start', 'end end'])
  })
})

describe('useSectionProgress', () => {
  it('expone progreso y valor como MotionValues inicializados a 0', () => {
    const { captured, getByTestId } = renderProbe()
    const { progress, value } = captured()

    expect(getByTestId('probe')).toBeInTheDocument()
    expect(typeof progress.get).toBe('function')
    expect(typeof value.get).toBe('function')
    expect(progress.get()).toBeGreaterThanOrEqual(0)
    expect(progress.get()).toBeLessThanOrEqual(1)
  })

  it('el valor mapeado con output parte del extremo inicial del rango', () => {
    const { captured } = renderProbe({ output: [48, -48] })

    // Sin scroll real en jsdom el progreso es 0 => valor en el inicio del output.
    expect(captured().value.get()).toBe(48)
  })

  it('sobrevive al desmontaje sin fugas (cleanup de listeners)', () => {
    const { captured, unmount } = renderProbe({ range: 'pin' })

    expect(captured().progress.get()).toBeGreaterThanOrEqual(0)
    expect(() => unmount()).not.toThrow()
  })
})
