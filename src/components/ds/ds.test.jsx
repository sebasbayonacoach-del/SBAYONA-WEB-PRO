// Tests de los componentes base del Design System 2.0 (Fase 3).
//
// Verifican estructura, clases de token, estados y accesibilidad básica.
// El estado visual (hover/focus/reduced-motion) vive en ds-base.css y se
// cubre con las capturas del playground, no aquí.

import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import {
  Button,
  CardBase,
  Container,
  CTABlock,
  HeroBase,
  Link,
  MediaBlock,
  Metric,
  Section,
  SectionLabel,
  Surface,
} from './index.js'

describe('DS Container', () => {
  it('centra el contenido con la clase del sistema y admite clase extra', () => {
    const { container } = render(<Container className="extra">hola</Container>)
    const node = container.firstChild

    expect(node.className).toBe('ds-container extra')
    expect(node.textContent).toBe('hola')
  })
})

describe('DS Section', () => {
  it('aplica aire editorial por defecto', () => {
    const { container } = render(<Section>contenido</Section>)
    expect(container.firstChild.className).toBe('ds-section')
  })

  it('combina flush, superficie e id', () => {
    const { container } = render(
      <Section flush surface="glass" id="prueba">
        contenido
      </Section>,
    )
    const node = container.firstChild

    expect(node.id).toBe('prueba')
    expect(node.className).toContain('ds-section--flush')
    expect(node.className).toContain('ds-surface--glass')
  })

  it('ignora un nivel de superficie fuera de la escalera', () => {
    const { container } = render(<Section surface="neon">contenido</Section>)
    expect(container.firstChild.className).toBe('ds-section')
  })
})

describe('DS Surface', () => {
  it('aplica el peldaño pedido', () => {
    const { container } = render(<Surface level="raised">x</Surface>)
    expect(container.firstChild.className).toBe('ds-surface ds-surface--raised')
  })

  it('sin nivel queda en la superficie base', () => {
    const { container } = render(<Surface level="fuera">x</Surface>)
    expect(container.firstChild.className).toBe('ds-surface')
  })
})

describe('DS Button', () => {
  it('renderiza un botón primario con tipo button por defecto', () => {
    render(<Button>Entrar</Button>)
    const button = screen.getByRole('button', { name: 'Entrar' })

    expect(button.className).toBe('ds-button ds-button--primary')
    expect(button.type).toBe('button')
  })

  it('admite las variantes secondary y ghost', () => {
    render(
      <>
        <Button variant="secondary">Secundaria</Button>
        <Button variant="ghost">Mínima</Button>
      </>,
    )

    expect(screen.getByRole('button', { name: 'Secundaria' }).className).toContain(
      'ds-button--secondary',
    )
    expect(screen.getByRole('button', { name: 'Mínima' }).className).toContain(
      'ds-button--ghost',
    )
  })

  it('con href se convierte en enlace manteniendo el visual', () => {
    render(<Button href="/plan/raiz">Ver plan</Button>)
    const link = screen.getByRole('link', { name: 'Ver plan' })

    expect(link.getAttribute('href')).toBe('/plan/raiz')
    expect(link.className).toContain('ds-button--primary')
  })

  it('expone los estados disabled y loading de forma accesible', () => {
    render(
      <>
        <Button disabled>Bloqueado</Button>
        <Button loading>Enviando</Button>
      </>,
    )

    expect(screen.getByRole('button', { name: 'Bloqueado' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Enviando' })).toHaveAttribute(
      'aria-busy',
      'true',
    )
  })

  it('dispara onClick', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Acción</Button>)

    fireEvent.click(screen.getByRole('button', { name: 'Acción' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('DS Link', () => {
  it('renderiza un enlace con la clase del sistema', () => {
    render(<Link href="/faq">Preguntas</Link>)
    const link = screen.getByRole('link', { name: 'Preguntas' })

    expect(link.className).toBe('ds-link')
    expect(link.getAttribute('href')).toBe('/faq')
  })
})

describe('DS SectionLabel', () => {
  it('pinta la etiqueta técnica (eyebrow)', () => {
    render(<SectionLabel>Método 01</SectionLabel>)
    const label = screen.getByText('Método 01')

    expect(label.tagName).toBe('P')
    expect(label.className).toBe('ds-eyebrow')
  })
})

describe('DS HeroBase', () => {
  it('estructura el opening con su contenedor de contenido', () => {
    const { container } = render(<HeroBase>apertura</HeroBase>)
    const hero = container.querySelector('.ds-hero')

    expect(hero).not.toBeNull()
    expect(hero.querySelector('.ds-hero__content').textContent).toBe('apertura')
  })
})

describe('DS CardBase', () => {
  it('es un article con la clase de tarjeta por defecto', () => {
    const { container } = render(<CardBase>tarjeta</CardBase>)
    const card = container.firstChild

    expect(card.tagName).toBe('ARTICLE')
    expect(card.className).toBe('ds-card')
  })

  it('admite cambiar el elemento semántico', () => {
    const { container } = render(<CardBase as="li">tarjeta</CardBase>)
    expect(container.firstChild.tagName).toBe('LI')
  })
})

describe('DS Metric', () => {
  it('muestra valor numérico y etiqueta', () => {
    const { container } = render(<Metric value="4" label="Niveles de acompañamiento" />)

    expect(container.querySelector('.ds-numeric').textContent).toBe('4')
    expect(container.querySelector('.ds-metric__label').textContent).toBe(
      'Niveles de acompañamiento',
    )
  })
})

describe('DS MediaBlock', () => {
  it('exige texto alternativo y aplica la proporción pedida', () => {
    const { container } = render(
      <MediaBlock src="/imagen.jpg" alt="Sala de entrenamiento" ratio="16-9" />,
    )
    const image = screen.getByRole('img', { name: 'Sala de entrenamiento' })

    expect(container.querySelector('figure').className).toContain('ds-media--16-9')
    expect(image.getAttribute('loading')).toBe('lazy')
  })

  it('oculta la imagen rota sin romper el marco (ES-002)', () => {
    render(<MediaBlock src="/inexistente.jpg" alt="Sala de entrenamiento" />)
    const image = screen.getByRole('img', { name: 'Sala de entrenamiento' })
    fireEvent.error(image)
    expect(image.style.display).toBe('none')
  })
})

describe('DS CTABlock', () => {
  it('agrupa acciones y microcopia opcional', () => {
    render(
      <CTABlock note="Sin permanencia.">
        <Button>Empezar</Button>
      </CTABlock>,
    )

    expect(screen.getByRole('button', { name: 'Empezar' })).toBeInTheDocument()
    expect(screen.getByText('Sin permanencia.').className).toBe('ds-cta__note')
  })

  it('sin nota no renderiza el párrafo de microcopia', () => {
    const { container } = render(
      <CTABlock>
        <Button>Empezar</Button>
      </CTABlock>,
    )

    expect(container.querySelector('.ds-cta__note')).toBeNull()
  })
})
