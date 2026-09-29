// Test del playground del Design System (ruta interna /design-system, Fase 3).

import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import DesignSystem from './DesignSystem.jsx'

vi.mock('framer-motion', () => {
  const ignoredProps = new Set([
    'initial',
    'animate',
    'exit',
    'transition',
    'layout',
    'whileInView',
    'viewport',
    'variants',
  ])
  const component = (tag) => React.forwardRef(({ children, ...props }, ref) => {
    const domProps = Object.fromEntries(Object.entries(props).filter(([key]) => !ignoredProps.has(key)))
    return React.createElement(tag, { ...domProps, ref }, children)
  })

  const motion = new Proxy({}, {
    get: (_, tag) => (tag === 'create'
      ? (BaseComponent) => component(BaseComponent)
      : component(tag)),
  })

  // MotionValue minimo para los hooks de scroll del Motion Engine (Fase 5):
  // el playground demuestra StickyStage/HorizontalPassage, que leen progreso
  // normalizado sin re-render por fotograma.
  const motionValue = (initial = 0) => ({
    get: () => initial,
    set: () => {},
    on: () => () => {},
  })

  return {
    AnimatePresence: ({ children }) => children,
    motion,
    useReducedMotion: () => false,
    useMotionValue: (initial) => motionValue(initial),
    useScroll: () => ({ scrollYProgress: motionValue(0) }),
    useTransform: () => motionValue(0),
    useMotionValueEvent: () => {},
  }
})

function renderPage() {
  return render(
    <MemoryRouter>
      <DesignSystem />
    </MemoryRouter>,
  )
}

describe('página DesignSystem (playground interno)', () => {
  it('se presenta como ruta interna, no como contenido público', () => {
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'BAYONA Design System' })).toBeInTheDocument()
    expect(
      screen.getByText('Ruta interna · no indexable · fuera del sitemap'),
    ).toBeInTheDocument()
  })

  it('muestra las dieciséis secciones del sistema', () => {
    renderPage()

    for (const label of [
      '01 · Color',
      '02 · Superficies',
      '03 · Tipografía',
      '04 · Espaciado',
      '05 · Componentes base',
      '06 · Movimiento',
      '07 · Presets 3D',
      '08 · Escala z-index',
      '09 · Breakpoints',
      '10 · Scroll storytelling',
      '11 · Marquee',
      '12 · TextMask',
      '13 · StickyStage',
      '14 · HorizontalPassage',
      '15 · Handoff 3D',
      '16 · Recetas de movimiento',
    ]) {
      expect(screen.getByText(label), label).toBeInTheDocument()
    }
  })

  it('expone los componentes base con sus estados', () => {
    renderPage()

    expect(screen.getByRole('button', { name: 'Acción principal' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Acción secundaria' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Acción mínima' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Bloqueada' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Enviando' })).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('link', { name: 'Como enlace' })).toBeInTheDocument()
  })

  it('vuelca los presets reales del engine (sin datos inventados)', () => {
    renderPage()

    // Cámaras y materiales de scenePresets.js.
    expect(screen.getByText('hero')).toBeInTheDocument()
    expect(screen.getByText('portrait')).toBeInTheDocument()
    expect(screen.getByText('matte')).toBeInTheDocument()
    expect(screen.getByText('accent')).toBeInTheDocument()

    // Niveles de movimiento de motionTokens.js.
    expect(screen.getByText('micro')).toBeInTheDocument()
    expect(screen.getByText('cinematic')).toBeInTheDocument()
  })

  it('demuestra las piezas del Motion Engine 2.0 (Fase 5)', () => {
    renderPage()

    // Marquesina declarativa con lineas editoriales.
    expect(screen.getByRole('region', { name: 'Líneas editoriales' })).toBeInTheDocument()
    expect(screen.getAllByText('BAYONA').length).toBeGreaterThanOrEqual(1)

    // TextMask: las tres lineas de la demo, accesibles por su texto completo.
    expect(screen.getByText('El movimiento es información.')).toBeInTheDocument()

    // StickyStage: en jsdom (modo mobile) se apilan los tres estados.
    expect(screen.getByText('Estado A')).toBeInTheDocument()
    expect(screen.getByText('Estado B')).toBeInTheDocument()
    expect(screen.getByText('Estado C')).toBeInTheDocument()

    // HorizontalPassage: los cuatro vagones visibles en el fallback estatico.
    expect(screen.getByText('Relacion espacial')).toBeInTheDocument()
    expect(screen.getByText('Continuidad')).toBeInTheDocument()

    // Recetas: las ocho declaradas en recipes/index.js.
    expect(screen.getByText('Editorial Reveal')).toBeInTheDocument()
    expect(screen.getByText('Horizontal Passage')).toBeInTheDocument()
    expect(screen.getByText('Quiet Transition')).toBeInTheDocument()
  })
})
