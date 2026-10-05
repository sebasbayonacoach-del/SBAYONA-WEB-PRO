import React from 'react'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import {
  HOME_EVIDENCE_CONTEXT,
  homeContentModel,
  membershipPlanEditorialProjection,
} from '../config/conversionContent.js'
import {
  calculateExperience,
  membershipPlans,
  sessionServices,
} from '../config/offerings.js'
import {
  draftEvidenceFixture,
  verifiedEvidenceFixture,
} from '../lib/conversion/evidence.testFixtures.js'
import Home, { HomeProofSection } from './Home.jsx'

vi.mock('framer-motion', () => {
  const ignoredProps = new Set(['initial', 'animate', 'exit', 'variants', 'whileInView', 'viewport', 'transition', 'whileHover', 'whileTap'])
  const component = (tag) => React.forwardRef(({ children, ...props }, ref) => {
    const domProps = Object.fromEntries(Object.entries(props).filter(([key]) => !ignoredProps.has(key)))
    return React.createElement(tag, { ...domProps, ref }, children)
  })

  // Fase 8 (prototipo E — StickyStage en la sección MÉTODO): el mock debe
  // cubrir el contrato de hooks del engine (useSectionProgress consume
  // useScroll/useTransform). MotionValue mínimo, mismo patrón que el setup.
  const motionValue = () => ({
    get: () => 0,
    set: vi.fn(),
    on: vi.fn(() => () => {}),
  })

  return {
    animate: vi.fn(() => ({ stop: vi.fn() })),
    useInView: vi.fn(() => false),
    useReducedMotion: vi.fn(() => false),
    useScroll: vi.fn(() => ({ scrollY: motionValue(), scrollYProgress: motionValue() })),
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
    GoldButton: ({ children, to, className = '' }) => <Link className={`gold-button ${className}`.trim()} to={to}>{children}</Link>,
    SectionLabel: ({ children }) => <p>{children}</p>,
  }
})

afterEach(cleanup)

function renderHome() {
  return render(<MemoryRouter><Home /></MemoryRouter>)
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function expectAnimatedTotal(summary, calculation) {
  const count = summary.querySelector('.persistent-summary-count')

  expect(summary).toHaveAttribute('data-total-cop', String(calculation.totalCop))
  expect(count).toHaveTextContent('0')
  expect(count).toHaveAttribute('aria-label', calculation.totalDisplay)
}

describe('Home — narrativa premium y contenido crítico', () => {
  it('presenta un único h1, una escena full-bleed y soporte DOM sin canvas', () => {
    const { container } = renderHome()
    const hero = container.querySelector('.hero-module')

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', {
      level: 1,
      name: homeContentModel.h1,
    })).toBeInTheDocument()
    expect(within(hero).getByText((_, element) => (
      element?.classList.contains('hero-kicker')
      && element.textContent === 'BAYONA · ENTRENAMIENTO CON MÉTODO'
    ))).toBeInTheDocument()
    // La portada recibe como un asesor en la puerta: se presenta y ofrece el
    // recorrido. No promete una transformación a quien acaba de aterrizar.
    expect(within(hero).getByText(/Soy Sebastián\. Leemos tu punto de partida/i)).toBeInTheDocument()
    expect(within(hero).queryByText(/Entrena con dirección, seguimiento real/i)).toBeNull()
    expect(hero).toHaveAttribute('data-media-key')
    // Garantía: si hay canvas, es parte del hero-module (lazy-loaded, no LCP-blocking).
    const canvas = container.querySelector('canvas')
    if (canvas) {
      expect(canvas.closest('.hero-module')).toBeTruthy()
    }
    expect(container.querySelector('.hero-3d-scene, .hero-canvas, .hero-orbits')).toBeNull()
    // Garantía: el fallback CSS siempre existe para reduced-motion / mobile / error.
    expect(container.querySelector('.hero-aurora')).not.toBeNull()
    expect(container.querySelectorAll('.hero-particles > span')).toHaveLength(6)
  })

  it('convierte el futuro en un pasaje aspiracional semántico, sin cuenta atrás ni figura monumental', () => {
    const { container } = renderHome()
    const visionBlock = homeContentModel.blocks.find(({ id }) => id === 'home-vision')
    const vision = container.querySelector('[data-content-block="home-vision"]')
    const lines = within(vision).getByRole('list', {
      name: 'Cambios que notas cuando entrenas con dirección',
    })

    expect(vision).toHaveAttribute('data-content-stage', 'vision')
    expect(vision).toHaveAttribute('data-content-placement', 'prelude')
    expect(vision).toHaveAttribute('data-media-key')
    expect(within(vision).getByRole('heading', {
      level: 2,
      name: visionBlock.heading,
    })).toBeInTheDocument()
    expect(within(vision).getByText(visionBlock.body)).toBeInTheDocument()
    expect(within(lines).getAllByRole('listitem')).toHaveLength(visionBlock.items.length)
    visionBlock.items.forEach(({ title }) => {
      expect(within(lines).getByText(title)).toBeInTheDocument()
    })
    // Fuera el 90 monumental con su "DÍAS" diminuto, los marcadores numéricos
    // y el titular partido en tres piezas de escala propia: el h2 es texto
    // corrido y la escena ya no anuncia plazo.
    expect(vision.querySelector('.vision-figure, .vision-90-count')).toBeNull()
    expect(vision.querySelector('.vision-heading-days')).toBeNull()
    expect(vision.querySelector('.proof-process-marker')).toBeNull()
    expect(vision).not.toHaveTextContent(/IMAGÍNATE|DENTRO DE DÍAS|90/i)
    // Una sola foto con un solo tratamiento: sin la segunda capa desenfocada.
    expect(vision.className).not.toMatch(/home-scene/)
    expect(vision.className).toMatch(/home-passage/)
    expect(within(vision).getByRole('link', {
      name: /VAMOS A VER CÓMO FUNCIONA/i,
    })).toHaveAttribute('href', '#problemas')
    expect(container.querySelector('[data-static-fallback="dom"], .narrative-hero-visual')).toBeNull()
  })

  it('recibe con una sola acción principal y deja el atajo de decidir en segundo plano', () => {
    const { container } = renderHome()
    const hero = container.querySelector('.hero-module')
    const heroNavigation = screen.getByRole('navigation', {
      name: 'Empezar el recorrido por BAYONA',
    })

    // Una única puerta en la acción principal: la recepción, que es el
    // recorrido. Ni "VER PLANES" ni "IR DIRECTO A LA DECISIÓN".
    expect(within(heroNavigation).getAllByRole('link')).toHaveLength(1)
    expect(within(heroNavigation).getByRole('link', {
      name: /EMPIEZA CON DIRECCIÓN/i,
    })).toHaveAttribute('href', '/onboarding')

    // El atajo de quien ya vio la página web existe, es pequeño y secundario:
    // vive fuera de la acción principal y salta directo a la decisión.
    const shortcut = within(hero).getByRole('link', { name: /YA VI LA PÁGINA WEB/i })
    expect(shortcut).toHaveAttribute('href', '#home-offer-heading')
    expect(heroNavigation.contains(shortcut)).toBe(false)
    expect(within(hero).getByText(/Primero entiendes el método\. Después decides\./i)).toBeInTheDocument()

    // Y una puerta discreta al método, sin competir con la acción principal.
    expect(within(hero).getByRole('link', {
      name: /VER EL MÉTODO/i,
    })).toHaveAttribute('href', '#problemas')

    expect(container.querySelector('#problemas')).toHaveAttribute(
      'aria-labelledby',
      'transformation-heading',
    )
    expect(screen.getByRole('link', { name: /Continuar con mi recorrido/i })).toHaveAttribute('href', '/onboarding')
    expect(screen.getByRole('link', { name: /COMPARAR PROGRAMAS/i })).toHaveAttribute('href', '/programs')
  })

  it('presenta el diagnóstico editorial sin imágenes encajonadas y sin aviso sanitario en pantalla', () => {
    const { container } = renderHome()
    const problemBlock = homeContentModel.blocks.find(({ id }) => id === 'home-problem')
    const problemSection = container.querySelector('[data-content-block="home-problem"]')

    expect(within(problemSection).getByRole('heading', {
      level: 2,
      name: problemBlock.heading,
    })).toBeInTheDocument()
    expect(within(problemSection).getByText(problemBlock.body)).toBeInTheDocument()
    expect(within(problemSection).getAllByRole('listitem')).toHaveLength(problemBlock.items.length)
    problemBlock.items.forEach(({ title, body }) => {
      expect(within(problemSection).getByRole('heading', { level: 3, name: title })).toBeInTheDocument()
      expect(within(problemSection).getByText(body)).toBeInTheDocument()
    })
    // El método sigue teniendo la salud en cuenta, pero la portada no lo
    // anuncia: fuera la nota de "consulta a un profesional" y fuera la placa
    // de límite sanitario. El aviso comercial del showroom es otra cosa y
    // sigue donde estaba.
    expect(within(problemSection).queryByText(/consulta a un profesional/i)).toBeNull()
    expect(problemSection.querySelector('.home-pain-note')).toBeNull()
    expect(container.querySelector('.medical-boundary')).toBeNull()
    const footerNote = container.querySelector('.home-disclaimer-note')
    expect(footerNote).not.toHaveTextContent(/marco no médico/i)
    expect(footerNote).toHaveTextContent(/Los resultados dependen de tu contexto y de tu constancia/i)
    expect(problemSection.querySelector('img:not(.photo-story-background):not(.journey-intro-photo)')).toBeNull()
    expect(problemSection.querySelector('.photo-story-background')).toHaveAttribute('alt', '')
  })

  it('declara el pasaje como prólogo sin alterar el flujo canónico del modelo', () => {
    const { container } = renderHome()
    const narrativeSections = [...container.querySelectorAll('section[data-content-stage]')]

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
    expect(narrativeSections.slice(0, 3).map(({ dataset }) => dataset.contentBlock)).toEqual([
      'home-vision',
      'home-problem',
      'home-mechanism',
    ])
    expect(narrativeSections[0]).toHaveAttribute('data-content-placement', 'prelude')
  })

  it('expone el método actual con tres pasos y mantiene el límite profesional fuera de la interfaz', () => {
    const { container } = renderHome()
    const mechanismBlock = homeContentModel.blocks.find(({ id }) => id === 'home-mechanism')
    const mechanismSection = container.querySelector('[data-content-block="home-mechanism"]')
    // Fase 8 (prototipo E): los pasos dejaron de ser <ol>/<li> (lista) y son
    // <article class="mechanism-step"> dentro del escenario StickyStage. En el
    // fallback estático (jsdom/móvil) cada frame apila su copia de los pasos:
    // el contrato exige que cada TÍTULO exista (allBy) y que los artículos con
    // contenido existan. Mismos 3 pasos.
    const stepTitles = mechanismBlock.items.map(({ title }) =>
      within(mechanismSection).getAllByRole('heading', { level: 3, name: title }),
    )

    expect(within(mechanismSection).getByRole('heading', {
      level: 2,
      name: mechanismBlock.heading,
    })).toBeInTheDocument()
    expect(within(mechanismSection).getByText(mechanismBlock.body)).toBeInTheDocument()
    expect(stepTitles).toHaveLength(mechanismBlock.items.length)
    stepTitles.forEach((matches) => {
      // Fase 9.0-A: cada paso existe EXACTAMENTE una vez. El fallback estático
      // renderiza un solo paso por frame (contrato isStatic de StickyStage);
      // duplicados (el bug N×N del arquitecto) vuelven a romper este test.
      expect(matches.length).toBe(1)
    })
    // El límite profesional sigue declarado en el modelo —lo consumen el
    // laboratorio y las auditorías—, pero la portada ya no lo muestra: ningún
    // descargo sanitario en la interfaz.
    expect(mechanismBlock.boundary).toMatch(/marco no médico.*no diagnostica, trata ni sustituye/i)
    expect(within(mechanismSection).queryByRole('complementary', {
      name: 'Límite profesional',
    })).toBeNull()
  })

  it('presenta beneficios en una única columna lógica sin garantías ni imágenes por tarjeta', () => {
    const { container } = renderHome()
    const benefitsBlock = homeContentModel.blocks.find(({ id }) => id === 'home-process-benefits')
    const benefitsSection = container.querySelector('[data-content-block="home-process-benefits"]')
    const benefits = within(benefitsSection).getAllByRole('listitem')

    expect(within(benefitsSection).getByRole('heading', {
      level: 2,
      name: benefitsBlock.heading,
    })).toBeInTheDocument()
    expect(within(benefitsSection).getByText(benefitsBlock.body)).toBeInTheDocument()
    expect(benefits.map((benefit) => benefit.querySelector('.pillar-number')?.textContent)).toEqual(['01', '02', '03'])
    expect(benefits.map((benefit) => within(benefit).getByRole('heading', { level: 3 }).textContent)).toEqual(
      benefitsBlock.items.map(({ title }) => title),
    )
    expect(benefits.every((benefit) => (
      benefit.dataset.markerColumn === 'inline-start'
      && benefit.firstElementChild?.classList.contains('pillar-number')
      && !benefit.classList.contains('pillar-item-reverse')
    ))).toBe(true)
    expect(benefitsSection.querySelector('.journey-intro-photo')).toHaveAttribute('alt', '')
    expect(benefitsSection.querySelector('.pillar-item img')).toBeNull()
    expect(benefitsSection).not.toHaveTextContent(/garantizamos|resultado asegurado|transformación garantizada/i)
  })

  it('mantiene Evidence_Gate cerrado y publica solo proceso cuando no hay evidencia', () => {
    const { container } = renderHome()
    const processFallback = homeContentModel.blocks.find(({ id }) => id === 'home-process-fallback')
    const proofSection = container.querySelector('[data-evidence-gate="empty"]')

    expect(proofSection).toHaveAttribute('data-content-block', processFallback.id)
    expect(within(proofSection).getByRole('heading', {
      level: 2,
      name: processFallback.heading,
    })).toBeInTheDocument()
    expect(within(proofSection).getByRole('list', {
      name: 'Proceso verificable de BAYONA',
    })).toBeInTheDocument()
    expect(within(proofSection).getAllByRole('listitem')).toHaveLength(processFallback.items.length)
    processFallback.items.forEach(({ title }) => {
      expect(within(proofSection).getByRole('heading', { level: 3, name: title })).toBeInTheDocument()
    })
    expect(proofSection.querySelector('.evidence-list, [data-evidence-slot], .evidence-slot')).toBeNull()
    expect(proofSection).not.toHaveTextContent(/formación europea|estándares europeos|\+8|testimonio de|clientes atendidos/i)
  })

  it('renderiza solo evidencia aprobada junto con su alcance y fuente', () => {
    const approvedRecord = { ...verifiedEvidenceFixture, context: HOME_EVIDENCE_CONTEXT }
    const draftRecord = { ...draftEvidenceFixture, context: HOME_EVIDENCE_CONTEXT }
    const { container } = render(
      <MemoryRouter>
        <HomeProofSection recordsOrRegistry={[draftRecord, approvedRecord]} />
      </MemoryRouter>,
    )
    const proofSection = container.querySelector('[data-evidence-gate="published"]')

    expect(within(proofSection).getByRole('list', {
      name: 'Experiencia verificada de BAYONA',
    })).toBeInTheDocument()
    expect(within(proofSection).getAllByRole('listitem')).toHaveLength(1)
    expect(within(proofSection).getByText(approvedRecord.attribution)).toBeInTheDocument()
    expect(within(proofSection).getByText(approvedRecord.content.statement)).toBeInTheDocument()
    expect(within(proofSection).getByText(approvedRecord.scope)).toBeInTheDocument()
    expect(within(proofSection).getByText(approvedRecord.sourceRef)).toBeInTheDocument()
    expect(within(proofSection).queryByText(draftRecord.attribution)).not.toBeInTheDocument()
    expect(proofSection.querySelector('.proof-process-list, [data-evidence-slot], .evidence-slot')).toBeNull()
  })

  it('integra los cuatro planes, precios accesibles y presentaciones PDF sin alterar sus fuentes', () => {
    const { container } = renderHome()
    const offerBlock = homeContentModel.blocks.find(({ id }) => id === 'home-offer')
    const offerSection = container.querySelector('[data-content-block="home-offer"]')
    const comparison = within(offerSection).getByRole('list', {
      name: 'Comparación de planes por plan',
    })

    expect(within(offerSection).getByRole('heading', {
      level: 2,
      name: offerBlock.heading,
    })).toBeInTheDocument()
    expect(within(offerSection).getByText(offerBlock.body)).toBeInTheDocument()
    expect(within(comparison).getAllByRole('listitem')).toHaveLength(membershipPlans.length)
    expect(within(offerSection).getAllByRole('article')).toHaveLength(1)
    expect(within(comparison).getAllByRole('button').filter((button) => (
      button.getAttribute('aria-pressed') === 'true'
    ))).toHaveLength(1)

    membershipPlanEditorialProjection.forEach(({ plan, overlay }) => {
      const anchor = offerSection.querySelector(`#plan-${plan.id.toLowerCase()}`)
      const selector = within(anchor).getByRole('button', { name: `Ver plan ${plan.name}` })

      fireEvent.click(selector)

      const article = within(offerSection).getByRole('article', { name: plan.name })

      expect(selector).toHaveAttribute('aria-pressed', 'true')
      expect(within(article).getByText(overlay.descriptor)).toBeInTheDocument()
      expect(within(article).getByText(overlay.jtbdSummary)).toBeInTheDocument()
      expect(within(article).getByText(overlay.valueSummary)).toBeInTheDocument()
      expect(within(article).getByRole('button', {
        name: `Ver alcance y condiciones de ${plan.name}`,
      })).toHaveAttribute('aria-expanded', 'false')
      expect(within(article).getByRole('link', {
        name: `Consultar ${plan.name} por WhatsApp`,
      })).toHaveAttribute('href', plan.cta)
      expect(within(article).getByRole('link', {
        name: `Ver presentación de ${plan.name}`,
      })).toHaveAttribute('href', `/plan/${plan.id.toLowerCase()}`)
      expect(article.querySelector('.plan-presentation-thumbnail')).not.toBeNull()
    })
  })
})

describe('Home — extras y resumen persistente', () => {
  it('explora una categoría y anuncia plan, selección y totales desde el catálogo actual', () => {
    const { container } = renderHome()
    const configurator = container.querySelector('.extras-configurator')
    const categoryNavigation = within(configurator).getByRole('navigation', {
      name: 'Categorías de servicios',
    })
    const summary = within(configurator).getByRole('complementary', {
      name: 'Tu selección actual',
    })
    const initialSelection = { planId: membershipPlans[0].id, serviceQuantities: {}, extraIds: [] }

    expect(summary).toHaveAttribute('aria-live', 'polite')
    expect(summary).toHaveAttribute('aria-atomic', 'true')
    expect(summary).toHaveAttribute('tabindex', '0')
    expectAnimatedTotal(summary, calculateExperience(initialSelection))
    expect(within(configurator).queryByRole('checkbox')).not.toBeInTheDocument()

    fireEvent.click(within(categoryNavigation).getByRole('button', {
      name: `Explorar categoría ${sessionServices[0].category}`,
    }))
    const categoryPanel = within(configurator).getByRole('region', {
      name: sessionServices[0].category,
    })
    fireEvent.click(within(categoryPanel).getByRole('button', {
      name: `Ver detalle y opciones de ${sessionServices[0].label}`,
    }))
    fireEvent.change(within(categoryPanel).getByRole('combobox', {
      name: `Cantidad de ${sessionServices[0].label}`,
    }), { target: { value: '2' } })

    const serviceSelection = {
      ...initialSelection,
      serviceQuantities: { [sessionServices[0].id]: 2 },
    }
    expectAnimatedTotal(summary, calculateExperience(serviceSelection))

    const nextPlan = membershipPlans[1]
    fireEvent.click(within(configurator).getByRole('radio', {
      name: new RegExp(`${escapeRegExp(nextPlan.name)}.*${escapeRegExp(nextPlan.priceDisplay)}`, 'i'),
    }))
    expectAnimatedTotal(summary, calculateExperience({
      ...serviceSelection,
      planId: nextPlan.id,
    }))
    expect(within(summary).getByText(nextPlan.name)).toBeInTheDocument()

    const inPersonService = sessionServices.find(({ presencial }) => presencial)
    if (inPersonService.category !== sessionServices[0].category) {
      fireEvent.click(within(categoryNavigation).getByRole('button', {
        name: `Explorar categoría ${inPersonService.category}`,
      }))
    }
    const inPersonPanel = within(configurator).getByRole('region', {
      name: inPersonService.category,
    })
    fireEvent.click(within(inPersonPanel).getByRole('button', {
      name: `Ver detalle y opciones de ${inPersonService.label}`,
    }))
    expect(within(configurator).getByText(
      'presencial sujeto a ubicación y disponibilidad',
    )).toBeInTheDocument()
    expect(within(configurator).queryByRole('link')).not.toBeInTheDocument()
  })
})

describe('Home — preview explícito de Official_WhatsApp', () => {
  it('mantiene WhatsApp bloqueado hasta revisar el mensaje vigente y sus condiciones', () => {
    const { container } = renderHome()
    const preview = container.querySelector('.request-preview')

    expect(preview).toHaveAttribute('data-preview-state', 'pending')
    expect(within(preview).getByRole('button', {
      name: 'Abrir WhatsApp de BAYONA; revisa primero el mensaje',
    })).toBeDisabled()
    expect(within(preview).queryByRole('link')).not.toBeInTheDocument()

    fireEvent.click(within(preview).getByRole('button', { name: 'Revisar mensaje exacto' }))

    const exactPreview = within(preview).getByRole('region', {
      name: 'Vista previa exacta de la solicitud a WhatsApp',
    })
    const message = exactPreview.querySelector('.request-preview-message').textContent
    const whatsapp = within(exactPreview).getByRole('link', {
      name: 'Abrir WhatsApp de BAYONA en una pestaña nueva',
    })
    const parsedUrl = new URL(whatsapp.getAttribute('href'))

    expect(parsedUrl.origin).toBe('https://wa.me')
    expect(parsedUrl.pathname).toBe('/34641698332')
    expect(parsedUrl.searchParams.get('text')).toBe(message)
    expect(within(exactPreview).getByRole('region', {
      name: 'Datos que se incluirán',
    })).toHaveTextContent(membershipPlans[0].name)
    expect(within(exactPreview).getByRole('region', {
      name: 'Condiciones geográficas',
    })).toHaveTextContent('ubicación cuando aplique')
    expect(within(exactPreview).getByRole('region', {
      name: 'Aviso no contractual',
    })).toHaveTextContent('no constituye pago, pedido, inscripción, disponibilidad ni acceso confirmados')
    expect(whatsapp).toHaveAttribute('target', '_blank')
    expect(whatsapp).toHaveAttribute('rel', 'noopener noreferrer')

    const updatedPlan = membershipPlans[2]
    fireEvent.click(within(container.querySelector('.extras-configurator')).getByRole('radio', {
      name: new RegExp(`${escapeRegExp(updatedPlan.name)}.*${escapeRegExp(updatedPlan.priceDisplay)}`, 'i'),
    }))

    expect(preview).toHaveAttribute('data-preview-state', 'pending')
    expect(within(preview).queryByRole('link')).not.toBeInTheDocument()
    expect(within(preview).getByRole('button', {
      name: 'Revisar mensaje actualizado',
    })).toBeInTheDocument()
  })
})
