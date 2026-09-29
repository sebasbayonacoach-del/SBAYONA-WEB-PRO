// Tests del reveal de lineas con mascara (Fase 5).

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DEFAULT_CAPABILITIES } from '../providers/capabilities.js'
import { CapabilityContext } from '../providers/CapabilityProvider.jsx'
import { TextMask } from './TextMask.jsx'

function renderMask(props, caps = {}) {
  return render(
    <CapabilityContext.Provider value={{ ...DEFAULT_CAPABILITIES, ...caps }}>
      <TextMask {...props} />
    </CapabilityContext.Provider>,
  )
}

describe('TextMask — modo animado', () => {
  it('divide el texto por saltos de linea y anuncia la frase completa', () => {
    const { container } = renderMask({ text: 'MOVIMIENTO\nDISCIPLINA\nCLARIDAD' })

    const mask = container.querySelector('.text-mask')
    expect(mask).toHaveAttribute('aria-label', 'MOVIMIENTO DISCIPLINA CLARIDAD')

    const lines = container.querySelectorAll('.text-mask-line')
    expect(lines).toHaveLength(3)
    // Cada linea animada es decorativa para el lector de pantalla.
    for (const line of lines) {
      expect(line).toHaveAttribute('aria-hidden', 'true')
    }
    expect(screen.getByText('DISCIPLINA')).toBeInTheDocument()
  })

  it('el array `lines` tiene prioridad sobre `text`', () => {
    const { container } = renderMask({
      lines: ['LÍNEA A', 'LÍNEA B'],
      text: 'ESTE TEXTO SE IGNORA',
    })

    expect(container.querySelectorAll('.text-mask-line')).toHaveLength(2)
    expect(screen.getByText('LÍNEA A')).toBeInTheDocument()
    expect(screen.queryByText('ESTE TEXTO SE IGNORA')).not.toBeInTheDocument()
  })

  it('ignora lineas vacias del texto', () => {
    const { container } = renderMask({ text: 'PRIMERA\n\n   \nSEGUNDA' })
    expect(container.querySelectorAll('.text-mask-line')).toHaveLength(2)
  })

  it('respeta la etiqueta pedida con `as`', () => {
    const { container } = renderMask({ text: 'TITULAR', as: 'h2' })
    expect(container.querySelector('h2.text-mask')).toBeInTheDocument()
  })

  it('eager deja el texto critico visible desde el primer frame', () => {
    const { container } = renderMask({ text: 'HERO CRITICO', as: 'h1', eager: true })
    const mask = container.querySelector('h1.text-mask')

    expect(mask).toHaveClass('text-mask--eager')
    expect(container.querySelectorAll('.text-mask-inner')).toHaveLength(0)
    expect(screen.getByText('HERO CRITICO')).toBeInTheDocument()
  })
})

describe('TextMask — movimiento reducido', () => {
  it('muestra el texto plano sin mascaras ni segmentos ocultos', () => {
    const { container } = renderMask(
      { text: 'MOVIMIENTO\nDISCIPLINA' },
      { reducedMotion: true },
    )

    const mask = container.querySelector('.text-mask')
    expect(mask).toHaveClass('text-mask--static')
    expect(mask).toHaveAttribute('aria-label', 'MOVIMIENTO DISCIPLINA')
    // Sin envoltorios de mascara ni contenido aria-hidden.
    expect(container.querySelectorAll('.text-mask-line')).toHaveLength(0)
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument()
    expect(screen.getByText('MOVIMIENTO')).toBeInTheDocument()
    expect(screen.getByText('DISCIPLINA')).toBeInTheDocument()
  })
})

describe('TextMask — casos limite', () => {
  it('sin lineas no renderiza contenido', () => {
    const { container } = renderMask({ text: '' })
    expect(container.querySelector('.text-mask')).toBeInTheDocument()
    expect(container.querySelectorAll('.text-mask-line')).toHaveLength(0)
  })
})
