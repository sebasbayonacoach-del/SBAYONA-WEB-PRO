import React from 'react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cleanup, fireEvent, render, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import {
  conversionContent,
  HOME_EVIDENCE_CONTEXT,
  homeContentModel,
  membershipPlanEditorialProjection,
} from '../config/conversionContent.js'
import { evidenceRegistry } from '../config/evidenceRegistry.js'
import {
  COMMERCIAL_SCOPE_NOTICE,
  extraServices,
  membershipComparisonRows,
  membershipPlans,
  sessionServices,
} from '../config/offerings.js'
import { selectPublishableEvidence } from '../lib/conversion/evidence.js'
import { PUBLIC_ROUTES } from '../test/conversionRegression.config.js'
import homeSource from './Home.jsx?raw'
import Home from './Home.jsx'

const homeCss = readFileSync(resolve(process.cwd(), 'src/styles/home.css'), 'utf8')

vi.mock('framer-motion', () => {
  const ignoredProps = new Set([
    'initial',
    'animate',
    'exit',
    'variants',
    'whileInView',
    'viewport',
    'transition',
    'whileHover',
    'whileTap',
  ])
  const component = (tag) => React.forwardRef(({ children, ...props }, ref) => {
    const domProps = Object.fromEntries(
      Object.entries(props).filter(([key]) => !ignoredProps.has(key)),
    )
    return React.createElement(tag, { ...domProps, ref }, children)
  })

  // MotionValue mínimo para los hooks del engine (StickyStage → useSectionProgress
  // usa useScroll). Fase 8: el mock anterior no lo exportaba y el prototipo E
  // (sección MÉTODO con StickyStage) reventaba al renderizar.
  const motionValue = () => ({
    get: () => 0,
    set: vi.fn(),
    on: vi.fn(() => () => {}),
  })

  return {
    animate: vi.fn(() => ({ stop: vi.fn() })),
    useInView: vi.fn(() => false),
    useReducedMotion: vi.fn(() => false),
    // Contrato real de framer-motion que consume el engine: useScroll con
    // offset/target devuelve MotionValues de scrollY/scrollYProgress.
    useScroll: vi.fn(() => ({
      scrollY: motionValue(),
      scrollYProgress: motionValue(),
    })),
    // useSectionProgress deriva el progreso del tramo con useTransform.
    useTransform: vi.fn(() => motionValue()),
    transform: vi.fn(),
    useMotionValue: motionValue,
    useMotionValueEvent: vi.fn(),
    motion: new Proxy({}, { get: (_, tag) => component(tag) }),
  }
})

vi.mock('../components/Layout', async () => {
  const { Link } = await import('react-router-dom')
  return {
    GoldButton: ({ children, to, className = '' }) => (
      <Link className={`gold-button ${className}`.trim()} to={to}>{children}</Link>
    ),
    SectionLabel: ({ children }) => <p>{children}</p>,
  }
})

function renderHome() {
  return render(<MemoryRouter><Home /></MemoryRouter>)
}

afterEach(cleanup)

describe('Home — contratos de composición premium', () => {
  it('resuelve anchors, rutas públicas y presentaciones PDF contra sus fuentes reales', () => {
    const { container } = renderHome()
    const destinations = [...container.querySelectorAll('a[href]')]
      .map((link) => link.getAttribute('href'))
      .filter((href) => href?.startsWith('/') || href?.startsWith('#'))
    const anchors = destinations.filter((destination) => destination.startsWith('#'))
    const pdfs = destinations.filter((destination) => destination.startsWith('/docs/'))
    const routes = destinations.filter((destination) => (
      destination.startsWith('/') && !destination.startsWith('/docs/')
    ))

    // Las presentaciones de plan son rutas internas (/plan/:id), no PDFs.
    const planRoutes = destinations.filter((destination) => destination.startsWith('/plan/'))
    expect(new Set(anchors)).toEqual(new Set(['#problemas', '#home-offer-heading']))
    // En Home el acceso directo a la presentación completa se concentra en
    // el plan destacado (FUERZA); los demás se abren desde el showroom.
    const featuredPlan = membershipPlans.find(({ featured }) => featured)
    expect(new Set(planRoutes.map((route) => route.toLowerCase())))
      .toEqual(new Set([`/plan/${featuredPlan.id.toLowerCase()}`]))
    expect(pdfs).toHaveLength(0)

    anchors.forEach((destination) => {
      expect(container.querySelector(destination)).not.toBeNull()
    })
    routes.forEach((destination) => {
      const pathname = new URL(destination, 'https://bayona.test').pathname
      expect(PUBLIC_ROUTES).toContain(pathname)
    })
  })

  it('proyecta un showroom único con catálogo, precio accesible, detalle y PDF canónicos', () => {
    const { container } = renderHome()
    const offerSection = container.querySelector('[data-content-block="home-offer"]')
    const comparison = within(offerSection).getByRole('list', {
      name: 'Comparación de planes por plan',
    })

    expect(comparison).toHaveAttribute('data-comparison-layout', 'showroom')
    expect(within(comparison).getAllByRole('listitem')).toHaveLength(membershipPlans.length)
    expect(within(offerSection).getAllByRole('article')).toHaveLength(1)
    expect(container.querySelector('table')).toBeNull()
    expect(homeSource).toMatch(/PlanExplorer[^]*membershipPlanEditorialProjection/)
    expect(homeSource).not.toMatch(/function PlanAccordion|plans-accordion/)

    membershipPlanEditorialProjection.forEach(({ plan, overlay }, planIndex) => {
      expect(plan).toBe(membershipPlans[planIndex])
      const anchor = offerSection.querySelector(`#plan-${plan.id.toLowerCase()}`)
      const selector = within(anchor).getByRole('button', { name: `Ver plan ${plan.name}` })

      expect(anchor).toHaveAttribute('data-plan-id', plan.id)
      expect(selector).toHaveAttribute('type', 'button')
      expect(within(anchor).getByText(overlay.descriptor)).toBeInTheDocument()
      expect(within(anchor).getByText(plan.priceDisplay, { exact: false })).toBeInTheDocument()

      fireEvent.click(selector)
      expect(selector).toHaveAttribute('aria-pressed', 'true')

      const article = within(offerSection).getByRole('article', { name: plan.name })
      const orderedSummary = [...article.querySelectorAll([
        '.plan-canonical-name',
        '.plan-descriptor',
        '.plan-summary-jtbd',
        '.plan-summary-scope',
        '.plan-summary-value',
        '.plan-summary-price',
        '.plan-disclosure-button',
      ].join(', '))]

      expect(orderedSummary.map((element) => element.classList[0])).toEqual([
        'plan-canonical-name',
        'plan-descriptor',
        'plan-summary-jtbd',
        'plan-summary-scope',
        'plan-summary-value',
        'plan-summary-price',
        'plan-disclosure-button',
      ])
      expect(within(article).getByRole('heading', { level: 3, name: plan.name })).toBeInTheDocument()
      expect(within(article).getByText(overlay.descriptor)).toBeInTheDocument()
      expect(within(article).getByText(overlay.jtbdSummary)).toBeInTheDocument()
      expect(within(article).getByText(overlay.valueSummary)).toBeInTheDocument()
      expect(within(article).getByText(plan.shortDescription)).toBeInTheDocument()
      expect(within(article).getByRole('link', {
        name: `Consultar ${plan.name} por WhatsApp`,
      })).toHaveAttribute('href', plan.cta)
      expect(within(article).getByRole('link', {
        name: `Ver presentación de ${plan.name}`,
      })).toHaveAttribute('href', `/plan/${plan.id.toLowerCase()}`)
      expect(article.querySelector('.plan-presentation-thumbnail')).not.toBeNull()

      const disclosure = within(article).getByRole('button', {
        name: `Ver alcance y condiciones de ${plan.name}`,
      })
      const details = document.getElementById(disclosure.getAttribute('aria-controls'))

      expect(disclosure).toHaveAttribute('type', 'button')
      expect(disclosure).toHaveAttribute('aria-expanded', 'false')
      expect(details).toHaveAttribute('aria-labelledby', disclosure.id)
      expect(details).toHaveAttribute('hidden')

      fireEvent.click(disclosure)
      expect(disclosure).toHaveAttribute('aria-expanded', 'true')
      expect(details).not.toHaveAttribute('hidden')
      plan.included.forEach((item) => expect(details).toHaveTextContent(item))
      plan.excluded?.forEach((item) => expect(details).toHaveTextContent(item))
      expect(details).toHaveTextContent(COMMERCIAL_SCOPE_NOTICE)
      membershipComparisonRows.forEach((row) => {
        expect(details).toHaveTextContent(row.feature)
        expect(details).toHaveTextContent(row.values[planIndex])
      })
    })

    expect(homeCss).toMatch(/\.plan-disclosure-button\s*\{[^}]*min-height:\s*50px/s)
    expect(homeCss).toMatch(/\.plan-disclosure-button:focus-visible/)
    expect(homeCss).toMatch(/@media \(max-width: 760px\)[^]*\.plan-comparison-list\.plan-showroom-selector\s*\{[^}]*display:\s*flex/s)
    expect(homeCss).not.toMatch(/\.plans-accordion|\.plan-accordion|\.plan-header|\.plan-body/)
  })

  it('mantiene el modelo canónico y declara el prólogo visual como pasaje, no como cuenta atrás', () => {
    const { container } = renderHome()
    const [
      problemBlock,
      visionBlock,
      mechanismBlock,
      benefitsBlock,
      evidenceBlock,
      processFallback,
      offerBlock,
      actionBlock,
    ] = homeContentModel.blocks
    const renderedBlockIds = [...container.querySelectorAll('section[data-content-stage]')]
      .map(({ dataset }) => dataset.contentBlock)

    expect(conversionContent['/']).toBe(homeContentModel)
    // Titular actualizado el 2026-09-22 por pedido expreso del dueño (reescritura
    // de copy con criterio comercial). La regla de fondo de este contrato sigue
    // viva y más abajo se comprueba: el héroe de la portada no le pide a quien
    // acaba de llegar que tome una decisión de compra.
    expect(homeContentModel.h1).toBe('ENTRENA CON DIRECCIÓN. HAZTE MÁS FUERTE.')
    // La portada RECIBE: el titular saluda y ofrece el recorrido. Quien acaba
    // de llegar todavía no sabe qué tiene que decidir, así que el héroe no
    // puede pedirle una decisión (fuera "VER PLANES" e "IR DIRECTO A LA
    // DECISIÓN"; fuera la recepción como tercera puerta redundante).
    expect(homeSource).not.toMatch(/VER PLANES|IR DIRECTO A LA DECISIÓN|NO SÉ POR DÓNDE EMPEZAR/)
    expect(homeContentModel.blocks.map(({ stage }) => stage)).toEqual([
      'problem',
      'vision',
      'mechanism',
      'mechanism',
      'proof',
      'proof',
      'offer',
      'action',
    ])
    expect(renderedBlockIds).toEqual([
      visionBlock.id,
      problemBlock.id,
      mechanismBlock.id,
      benefitsBlock.id,
      processFallback.id,
      offerBlock.id,
      actionBlock.id,
    ])
    expect(container.querySelector('[data-content-block="home-vision"]')).toHaveAttribute(
      'data-content-placement',
      'prelude',
    )

    // Cuatro problemas declarados en la voz de quien los tiene, no cuatro
    // etiquetas. Reescritos el 2026-09-22 por pedido expreso del dueño. Lo que
    // este contrato protege es que sigan siendo CUATRO y en este orden: la
    // portada abre con el problema y no con la oferta.
    expect(problemBlock.items.map(({ title }) => title)).toEqual([
      'QUIERES CAMBIAR, PERO NO SABES POR DÓNDE EMPEZAR',
      'ENTRENAS, PERO NO SABES SI VALE LA PENA',
      'TU CUERPO TE HABLA Y YA NO QUIERES IGNORARLO',
      'TU VIDA NO CABE EN UNA PLANTILLA DESCARGADA',
    ])
    expect(visionBlock).toMatchObject({
      claimType: 'aspiration',
      state: 'aspirational',
    })
    // La escena deja de ser una cuenta atrás. Antes: "IMAGÍNATE DENTRO DE 90
    // DÍAS" con un 90 monumental y un "DÍAS" diminuto al lado. Ahora el plazo
    // no se anuncia, el cuerpo habla en primera persona del plural y las cinco
    // frases se dicen como las dice una persona, sin marcador numérico.
    // Titular reescrito el 2026-09-22 con la reescritura comercial del dueño.
    expect(visionBlock.heading).toBe('PROGRESAS MEJOR CUANDO DEJAS DE ENTRENAR A CIEGAS.')
    expect(`${visionBlock.heading} ${visionBlock.body}`).not.toMatch(/90/i)
    expect(visionBlock.body).toMatch(/juntos/i)
    expect(visionBlock.body).not.toMatch(/esto no es una promesa/i)
    expect(visionBlock.items).toHaveLength(5)
    /*
      Tres pasos del método. Reescritos el 2026-09-22: los rótulos nuevos dicen
      qué recibe la persona («LEEMOS TU REALIDAD / DISEÑAMOS TU RUTA / AJUSTAMOS
      CONTIGO») donde los viejos decían solo el verbo en genérico. La guarda que
      importa —que sean TRES, en este orden, y el marco no médico de abajo— sigue
      intacta.
    */
    expect(mechanismBlock.items.map(({ title }) => title)).toEqual([
      'LEEMOS TU REALIDAD',
      'DISEÑAMOS TU RUTA',
      'AJUSTAMOS CONTIGO',
    ])
    expect(mechanismBlock.boundary).toMatch(/marco no médico/i)
    expect(benefitsBlock.items.map(({ marker }) => marker)).toEqual(['01', '02', '03'])
    expect(benefitsBlock.items.map(({ body }) => body).join(' ')).not.toMatch(
      /garantizamos|resultado asegurado|transformación garantizada/i,
    )

    const pillarItems = [...container.querySelectorAll('.pillars-stack > .pillar-item')]
    expect(pillarItems).toHaveLength(3)
    expect(pillarItems.every((item) => (
      item.dataset.markerColumn === 'inline-start'
      && item.firstElementChild?.classList.contains('pillar-number')
    ))).toBe(true)
    expect(homeSource).not.toMatch(/pillar-item-reverse/)
    expect(homeCss).not.toMatch(/direction\s*:\s*rtl|pillar-item-reverse/)

    expect(evidenceBlock).toMatchObject({
      id: 'home-evidence-unavailable',
      claimType: 'evidence',
      state: 'unavailable',
    })
    expect(processFallback).toMatchObject({
      id: 'home-process-fallback',
      claimType: 'editorial',
      state: 'verified',
    })
    expect(processFallback.items.map(({ title }) => title).join(' ')).not.toMatch(/\+8|formación europea/i)
    expect(homeContentModel.evidenceContext).toBe(HOME_EVIDENCE_CONTEXT)
    expect(selectPublishableEvidence(evidenceRegistry, HOME_EVIDENCE_CONTEXT)).toEqual([])

    const proofSection = container.querySelector('[data-evidence-gate="empty"]')
    expect(proofSection).toHaveAttribute('data-content-block', processFallback.id)
    expect(proofSection.querySelector('.proof-process-list')).not.toBeNull()
    expect(proofSection.querySelector('.evidence-list')).toBeNull()
    expect(container.querySelector('[data-evidence-slot], .evidence-slot')).toBeNull()
    expect(container.querySelector('[data-content-block="home-action"]')).toHaveTextContent(actionBlock.body)
  })

  it('usa solo DOM y escenas premium, sin canvas ni componentes narrativos retirados', () => {
    const { container } = renderHome()

    // Garantía: no hay componentes narrativos retirados ni configuración estática de escena.
    expect(homeSource).not.toMatch(/NarrativeHeroVisual|RecommendationGuide|HOME_HERO_SCENE_CONFIG/i)
    // Garantía: el CSS no contiene clases obsoletas de escena 3D.
    expect(homeCss).not.toMatch(/hero-3d-scene|hero-canvas|hero-orbits?|orbit-[12]/i)
    // Garantía: las clases de fallback CSS existen siempre.
    expect(homeCss).toMatch(/\.hero-aurora/)
    expect(homeCss).toMatch(/\.hero-particles/)
    expect(homeCss).toMatch(/\.home-scene--future/)
    expect(homeCss).toMatch(/\.home-about-bridge/)
    expect(homeCss).toMatch(/\.home-editorial-light \.pain-column > \.pain-item[^}]*background-color:\s*transparent\s*!important/s)
    expect(homeCss).toMatch(/#main-content \.home-memberships-section #home-offer-heading[^}]*8\.75vw/s)
    // Garantía: si hay canvas, es lazy-loaded dentro del hero; fallback CSS siempre presente.
    const canvas = container.querySelector('canvas')
    if (canvas) {
      expect(canvas.closest('.hero-module')).toBeTruthy()
    }
    expect(container.querySelector('.hero-aurora')).not.toBeNull()
    expect(container.querySelectorAll('.hero-particles > span')).toHaveLength(6)
    expect(container.querySelector('[data-static-fallback="dom"], .narrative-hero-visual')).toBeNull()
  })
})

describe('Home — elección directa y configurador', () => {
  it('retira la mini-guía, conserva el showroom y explica membresía, extras y revisión', () => {
    const { container } = renderHome()
    const offerSection = container.querySelector('[data-content-block="home-offer"]')
    const explorer = offerSection.querySelector('.plan-explorer')
    const configuratorSection = container.querySelector('.home-services-configurator')
    const guide = within(configuratorSection).getByRole('list', {
      name: 'Cómo configurar tu experiencia BAYONA',
    })

    expect(offerSection.querySelector('.recommendation-guide')).toBeNull()
    expect(explorer).not.toBeNull()
    expect(within(guide).getAllByRole('listitem')).toHaveLength(3)
    expect(guide).toHaveTextContent('MEMBRESÍA BASE')
    expect(guide).toHaveTextContent('EXTRAS OPCIONALES')
    expect(guide).toHaveTextContent('REVISIÓN FINAL')
    membershipPlans.forEach((plan) => {
      expect(offerSection.querySelector(`#plan-${plan.id.toLowerCase()}`)).not.toBeNull()
    })
    expect(homeSource).toMatch(/PlanExplorer/)
    expect(homeSource).not.toMatch(/RecommendationGuide|PlanCalculator/)
  })

  it('deriva categorías fuente y mantiene el resumen accesible durante el count-up', () => {
    const { container } = renderHome()
    const configurator = container.querySelector('.extras-configurator')
    const explorer = configurator.querySelector('.extras-explorer')
    const categoryNavigation = within(explorer).getByRole('navigation', {
      name: 'Categorías de servicios',
    })
    const summary = within(configurator).getByRole('complementary', {
      name: 'Tu selección actual',
    })
    const expectedCategories = [...sessionServices, ...extraServices].reduce(
      (categories, service) => categories.includes(service.category)
        ? categories
        : [...categories, service.category],
      [],
    )
    const count = summary.querySelector('.persistent-summary-count')

    expect(homeSource).toMatch(/ExtrasExplorer[^]*PersistentSummary/)
    expect(explorer.nextElementSibling).toBe(summary)
    expect(within(categoryNavigation).getAllByRole('button').map((button) => button.textContent)).toEqual(
      expectedCategories,
    )
    expect(explorer.querySelector('.extras-category-panel')).toHaveAttribute('hidden')
    expect(within(explorer).queryByRole('checkbox')).not.toBeInTheDocument()
    expect(summary).toHaveAttribute('aria-live', 'polite')
    expect(summary).toHaveAttribute('aria-atomic', 'true')
    expect(summary).toHaveAttribute('tabindex', '0')
    expect(summary).toHaveAttribute('data-total-cop', String(membershipPlans[0].priceCop))
    expect(within(summary).getByText(membershipPlans[0].name)).toBeInTheDocument()
    expect(count).toHaveTextContent('0')
    expect(count).toHaveAttribute('aria-label', membershipPlans[0].priceDisplay)
    expect(within(summary).queryByRole('link')).not.toBeInTheDocument()

    expect(homeCss).toMatch(/\.extras-configurator\s*\{[^}]*grid-template-columns:/s)
    expect(homeCss).toMatch(/\.persistent-summary\s*\{[^}]*position:\s*sticky/s)
    expect(homeCss).toMatch(/@media \(max-width: 950px\)[^]*\.persistent-summary\s*\{[^}]*position:\s*static/s)
    expect(homeCss).toMatch(/\.extras-category-navigation button[^}]*min-height:\s*48px/s)
  })
})
