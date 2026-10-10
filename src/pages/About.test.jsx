import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import About from './About.jsx'

vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_, tag) => React.forwardRef(({ children, initial, whileInView, viewport, transition, ...props }, ref) => (
      React.createElement(tag, { ...props, ref }, children)
    )),
  }),
  AnimatePresence: ({ children }) => children,
  useReducedMotion: () => false,
  // Fase 8 (bloque G — StickyStage en la sección RECORRIDO): el mock debe
  // cubrir el contrato de hooks del engine (useSectionProgress consume
  // useScroll/useTransform). MotionValue mínimo.
  useScroll: () => ({
    scrollY: { get: () => 0, set: () => {}, on: () => () => {} },
    scrollYProgress: { get: () => 0, set: () => {}, on: () => () => {} },
  }),
  useTransform: () => ({ get: () => 0, set: () => {}, on: () => () => {} }),
  useMotionValue: () => ({ get: () => 0, set: () => {}, on: () => () => {} }),
  useMotionValueEvent: () => {},
}))

vi.mock('../components/Layout', () => ({
  PageHero: ({ title, kicker, children }) => (
    <section>
      <p>{kicker}</p>
      <h1>{title}</h1>
      {children}
    </section>
  ),
  SectionLabel: ({ children }) => <p>{children}</p>,
}))

vi.mock('../components/Globe3D.jsx', () => ({
  default: () => <div data-testid="globe-3d" />,
}))

// La página /about actual narra método, recorrido y valores sin inventar
// credenciales. Este contrato protege esa honestidad editorial.
describe('/about — historia, honestidad y conversión', () => {
  it('muestra el hero del método y el problema que resuelve BAYONA', () => {
    render(<MemoryRouter><About /></MemoryRouter>)

    expect(screen.getByText('CAPÍTULO 02 · NOSOTROS')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: /DETRÁS DEL MOVIMIENTO\./i })).toBeInTheDocument()
    expect(screen.getByText(/Antes de hablar de resultados, queremos entender a la persona/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /UNA MARCA.*UNA PERSONA REAL/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /UN PLAN SIRVE\s*CUANDO ENCAJA CONTIGO/i })).toBeInTheDocument()
    expect(screen.getByText('VALORAR ANTES DE PRESCRIBIR')).toBeInTheDocument()
    expect(screen.getByText('EXPLICAR ANTES DE EXIGIR')).toBeInTheDocument()
    expect(screen.getByText('REVISAR ANTES DE AJUSTAR')).toBeInTheDocument()
  })

  it('presenta la cronología y los cuatro valores sin inventar credenciales', () => {
    const { container } = render(<MemoryRouter><About /></MemoryRouter>)
    const copy = container.textContent

    expect(copy).toContain('2003')
    expect(copy).toContain('LA PRÁCTICA DEL PARKOUR')
    expect(copy).toContain('2019-2025')
    expect(copy).toContain('formación europea en preparación física')
    expect(copy).toContain('2026')
    for (const value of ['CRITERIO', 'RESPETO', 'EDUCACIÓN', 'RIGOR']) {
      expect(screen.getByText(value)).toBeInTheDocument()
    }

    // Sin métricas infladas ni marcas de catálogos anteriores.
    expect(copy).not.toMatch(/ESSA|\+1[.\s]?000|personas transformadas|casos de éxito|para siempre/i)
  })

  it('cierra con el método y CTAs verificables hacia planes y WhatsApp', () => {
    const { container } = render(<MemoryRouter><About /></MemoryRouter>)

    expect(screen.getByRole('heading', { name: /DE COLOMBIA A ESPAÑA\.\s*HISTORIAS QUE SIGUEN\./i })).toBeInTheDocument()
    expect(screen.getByText('TRAYECTORIA E IMPACTO')).toBeInTheDocument()
    expect(screen.getByText('10', { selector: '.globe-impact-stat strong' })).toBeInTheDocument()
    expect(screen.getByText('4', { selector: '.globe-impact-stat strong' })).toBeInTheDocument()
    expect(screen.getByText('5', { selector: '.globe-impact-stat strong' })).toBeInTheDocument()
    expect(container.querySelectorAll('.globe-testimonials-world-point')).toHaveLength(10)
    expect(screen.getByRole('heading', { name: /NO ES UNA RUTINA\.\s*ES UNA DECISIÓN TRAS OTRA\./i })).toBeInTheDocument()
    expect(container.textContent).not.toContain('ENTRENAMOS, REGISTRAMOS Y AJUSTAMOS. JUNTOS.')

    expect(screen.getByRole('link', { name: /EMPEZAR JUNTOS/i })).toHaveAttribute('href', '/programs')

    const call = screen.getByRole('link', { name: /HABLAMOS/i })
    expect(call.getAttribute('href')).toMatch(/^https:\/\/wa\.me\/34641698332\?text=/)
    expect(decodeURIComponent(call.getAttribute('href'))).toContain('quiero que empecemos juntos con BAYONA')

    // REVISIÓN 2026-09-19 · el dueño vetó el aviso médico en la interfaz:
    // «nada de si tienes dolores persistentes… no quiero que pongas todo eso».
    // La página cierra en limpio, sin descargo sanitario y sin numeración
    // decorativa de sección.
    expect(container.textContent).not.toMatch(/diagnostic|atención sanitaria|médic|consulta|dolores/i)
    expect(container.textContent).not.toMatch(/0\d\s*\/\s*[A-ZÁÉÍÓÚÑ]/)
  })
})
