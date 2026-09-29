import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { conversionContent } from '../../config/conversionContent.js'
import { MethodSequence, normalizeMethodStep } from './MethodSequence.jsx'

const HERE = dirname(fileURLToPath(import.meta.url))
const componentSource = readFileSync(join(HERE, 'MethodSequence.jsx'), 'utf8')
const experienceCss = readFileSync(join(HERE, '../../styles/ds-experience.css'), 'utf8')

const homeMechanism = conversionContent['/'].blocks.find(({ id }) => id === 'home-mechanism')

afterEach(cleanup)

describe('MethodSequence — patrón compartido del método (FASE 4 · 4.4)', () => {
  it('proyecta los tres tramos del método publicado, en orden y sin inventar copy', () => {
    const { container } = render(<MethodSequence items={homeMechanism.items} />)
    const steps = [...container.querySelectorAll('.ds-method-step')]

    expect(steps).toHaveLength(3)
    expect(steps.map((step) => step.querySelector('.ds-method-step__marker').textContent))
      .toEqual(['01', '02', '03'])
    expect(steps.map((step) => step.querySelector('.ds-method-step__title').textContent))
      .toEqual(homeMechanism.items.map(({ title }) => title))
    expect(steps.map((step) => step.querySelector('.ds-method-step__copy').textContent))
      .toEqual(homeMechanism.items.map(({ body }) => body))
  })

  it('es una lista ordenada con nombre accesible y sin capas de espacio', () => {
    const { getByRole } = render(
      <MethodSequence items={homeMechanism.items} label="El método BAYONA en tres tramos" />,
    )
    const list = getByRole('list', { name: 'El método BAYONA en tres tramos' })

    expect(list.tagName).toBe('OL')
    expect(list).toHaveAttribute('data-experience-layer', 'editorial')
    expect(list.querySelectorAll('canvas, video')).toHaveLength(0)
  })

  it('admite las dos formas de item que el sitio ya publicaba', () => {
    const legacy = [
      { number: '01', title: 'VALORAR', copy: 'Primer tramo.' },
      { number: '02', title: 'PLANIFICAR', copy: 'Segundo tramo.' },
      { number: '03', title: 'AJUSTAR', copy: 'Tercer tramo.' },
    ]
    const { container } = render(<MethodSequence items={legacy} variant="compact" />)

    expect(container.querySelector('.ds-method--compact')).not.toBeNull()
    expect([...container.querySelectorAll('.ds-method-step__title')].map((el) => el.textContent))
      .toEqual(['VALORAR', 'PLANIFICAR', 'AJUSTAR'])
    expect(container.querySelector('.ds-method-step__copy').textContent).toBe('Primer tramo.')
    expect(normalizeMethodStep({ title: 'SOLO TITULO' }, 1).marker).toBe('02')
  })

  it('marca el tramo activo para la lectura espacial y degrada sin items', () => {
    const { container, rerender } = render(
      <MethodSequence items={homeMechanism.items} activeIndex={1} />,
    )
    const steps = container.querySelectorAll('.ds-method-step')

    expect(steps[1]).toHaveAttribute('data-active', 'true')
    expect(steps[0]).not.toHaveAttribute('data-active')

    rerender(<MethodSequence items={[]} />)
    expect(container.querySelector('.ds-method')).toBeNull()
  })

  it('respeta el nivel de encabezado que le pide la página', () => {
    const { container } = render(
      <MethodSequence items={homeMechanism.items} headingLevel="h4" />,
    )

    expect(container.querySelector('h2.ds-method-step__title')).toBeNull()
    expect(container.querySelectorAll('h4.ds-method-step__title')).toHaveLength(3)
  })

  it('no trae WebGL ni dependencias de motion: el patrón es DOM + CSS', () => {
    expect(componentSource).not.toMatch(/from ['"]three|framer-motion|@react-three/)
    expect(componentSource).not.toMatch(/canvas|WebGLRenderer/)
  })

  it('el movimiento viene de las familias del sistema, no de JS ni de duraciones nuevas', () => {
    const { container } = render(<MethodSequence items={homeMechanism.items} />)

    expect(container.querySelector('.ds-method')).toHaveClass('ds-reveal', 'ds-reveal--mask')
    expect(container.querySelector('.ds-method-step')).toHaveClass('ds-reveal', 'ds-reveal--shift')
  })

  it('el patrón vive en la hoja del sistema con reduced motion estático', () => {
    expect(experienceCss).toMatch(/\.ds-method\s*\{[^}]*list-style:\s*none/s)
    expect(experienceCss).toMatch(/\.ds-method-step__marker/)
    const blocks = [...experienceCss.matchAll(/@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?\n\}/g)]
      .map((found) => found[0])
    const reducedBlock = blocks.find((block) => block.includes('.ds-reveal')) ?? ''

    expect(blocks).toHaveLength(1)
    expect(reducedBlock).toMatch(/\.ds-reveal[^{]*\{[^}]*animation:\s*none/s)
    expect(reducedBlock).not.toMatch(/animation:\s*none[^}]*duration:\s*0s/)
  })
})
