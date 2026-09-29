import React from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  editorialServices,
  membershipPlans,
  serviceCategoryDefinitions,
} from '../config/offerings.js'
import { useCartStore } from '../store/cartStore.js'
import Programs from './Programs.jsx'

vi.mock('framer-motion', () => {
  const ignoredProps = new Set(['initial', 'animate', 'exit', 'variants', 'whileInView', 'viewport', 'transition', 'whileHover', 'whileTap'])
  const component = (tag) => React.forwardRef(({ children, ...props }, ref) => {
    const domProps = Object.fromEntries(Object.entries(props).filter(([key]) => !ignoredProps.has(key)))
    return React.createElement(tag, { ...domProps, ref }, children)
  })

  return {
    motion: new Proxy({}, { get: (_, tag) => component(tag) }),
    useReducedMotion: () => true,
    useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
    useTransform: (value) => value,
    useMotionValueEvent: () => {},
  }
})

vi.mock('sonner', () => ({
  toast: { success: vi.fn() },
}))

vi.mock('../components/Layout', async () => {
  const { Link } = await import('react-router-dom')
  return {
    GoldButton: ({ children, to, className = '' }) => <Link className={className} to={to}>{children}</Link>,
    PageHero: ({ title, kicker, children }) => <section><p>{kicker}</p><h1>{title}</h1>{children}</section>,
    SectionLabel: ({ children }) => <p>{children}</p>,
  }
})

describe('Programs fase 4 editorial', () => {
  beforeEach(() => {
    useCartStore.getState().clear()
  })

  it('presenta el concepto completo, Deportistas y copy honesto en español', () => {
    render(<MemoryRouter><Programs /></MemoryRouter>)

    expect(screen.getByRole('heading', { level: 1, name: 'ENTRENAMIENTO CON DIRECCIÓN CLARA.' })).toBeInTheDocument()
    expect(screen.getByText('BAYONA • PROGRAMAS DE ENTRENAMIENTO')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'DEPORTISTAS' })).toBeInTheDocument()
    expect(screen.getByText('Revisa las propuestas por etapa y confirma disponibilidad antes de elegir.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /VALORAR\. PLANIFICAR\..*REVISAR\./i })).toBeInTheDocument()

    const copy = document.body.textContent
    expect(copy).not.toMatch(/30 DÍAS SIN COMPROMISO|te devolvemos todo|garantía de devolución/i)
    expect(copy).not.toMatch(/SSL|tarjeta|stock|casos de éxito|miembros activos/i)
  })

  it('organiza los servicios por categoría y añade desde un único CTA de carrito', () => {
    render(<MemoryRouter><Programs /></MemoryRouter>)

    for (const plan of membershipPlans) {
      expect(screen.getAllByText(plan.name).length).toBeGreaterThan(0)
      expect(screen.getAllByText(plan.priceDisplay).length).toBeGreaterThan(0)
    }

    const navigation = screen.getByRole('navigation', { name: 'Explorar servicios por categoría' })
    expect(within(navigation).getAllByRole('button')).toHaveLength(serviceCategoryDefinitions.length)

    for (const category of serviceCategoryDefinitions) {
      fireEvent.click(within(navigation).getByRole('button', { name: new RegExp(category.title, 'i') }))

      const panel = document.querySelector('#program-services-active-panel')
      const expectedServices = editorialServices.filter((service) => service.category === category.id)

      expect(panel).toBeInTheDocument()
      expect(within(panel).getByRole('heading', { level: 3, name: category.title })).toBeInTheDocument()
      expect(panel.querySelectorAll('.program-service-card')).toHaveLength(expectedServices.length)
      expect(panel.querySelectorAll('.program-service-cart')).toHaveLength(expectedServices.length)
      expect(panel.querySelectorAll('a')).toHaveLength(0)

      for (const service of expectedServices) {
        expect(within(panel).getByRole('heading', { level: 4, name: service.label })).toBeInTheDocument()
      }
    }

    fireEvent.click(within(navigation).getByRole('button', { name: /CLASES/i }))
    const classesPanel = document.querySelector('#program-services-active-panel')
    const firstService = editorialServices.find((service) => service.category === 'CLASES')
    const addButton = within(classesPanel).getAllByRole('button', { name: /al carrito por/i })[0]

    fireEvent.click(addButton)
    const addedButton = within(document.querySelector('#program-services-active-panel'))
      .getAllByRole('button', { name: /al carrito por/i })[0]
    expect(addedButton).toHaveTextContent('AÑADIR OTRO')
    expect(useCartStore.getState().items).toEqual([
      expect.objectContaining({
        type: 'servicio',
        name: firstService.label,
        priceCOP: firstService.priceCop,
        qty: 1,
      }),
    ])

    fireEvent.click(addedButton)
    expect(useCartStore.getState().items[0].qty).toBe(2)
  })

  it('integra la calculadora compartida y cierra sin descargo sanitario', () => {
    const { container } = render(<MemoryRouter><Programs /></MemoryRouter>)

    expect(screen.getByRole('heading', { name: /ELIGE PLAN Y.*SERVICIOS/i })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: /elige tu plan base/i })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: /añade clases extra/i })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: /completa tu arsenal/i })).toBeInTheDocument()
    expect(screen.getByText(/Tu plan base está listo\. Añade servicios solo si los necesitas\./i)).toBeInTheDocument()

    // REVISIÓN 2026-09-19 · el dueño vetó el aviso médico en la interfaz:
    // «nada de si tienes dolores persistentes… no quiero que pongas todo eso».
    // El pie legal con COMMERCIAL_SCOPE_NOTICE desaparece de /programs y con él
    // cualquier mención a diagnóstico o atención sanitaria.
    expect(container.querySelector('.programs-legal-note')).toBeNull()
    expect(container.textContent).not.toMatch(/marco no médico|diagnostic|atención sanitaria|consulta un médico|dolores persistentes/i)
    // La numeración decorativa de sección también sale del copy.
    expect(container.textContent).not.toMatch(/0\d\s*\/\s*[A-ZÁÉÍÓÚÑ]/)
  })
})
