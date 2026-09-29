/**
 * CONTRATO DE COMPONENTE — TrajectoryLab (Lote 1, solo DOM).
 * ---------------------------------------------------------
 * Qué verifica de verdad:
 *  - Que el recorrido se puede hacer con teclado y con puntero, que el panel
 *    refleja la estación activa (contenido leído de la config, no repetido a
 *    mano) y que el CTA apunta a la ruta declarada en esa estación.
 *  - Que la honestidad del estado es observable: el usuario ve que NO hay escena
 *    todavía y que el espacio es conceptual.
 *  - AISLAMIENTO: ningún módulo del laboratorio importa three / @react-three.
 *    En el Lote 1 eso es una obligación, no una optimización.
 *  - PROPIEDAD: quien monta el laboratorio es el playground interno
 *    (/design-system), no la home ni ninguna ruta pública.
 */

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import TrajectoryLab from './TrajectoryLab.jsx'
import { STATIONS } from './trajectoryStations.js'

function renderLab() {
  return render(
    <MemoryRouter>
      <TrajectoryLab />
    </MemoryRouter>,
  )
}

describe('TrajectoryLab — recorrido en DOM', () => {
  it('expone las tres estaciones como botones nombrados', () => {
    renderLab()
    const tabs = within(screen.getByRole('navigation', { name: 'Estaciones del recorrido' }))
    STATIONS.forEach((station, index) => {
      const tab = tabs.getAllByRole('button')[index]
      expect(tab).toHaveAccessibleName(new RegExp(station.title))
      expect(tab).toHaveAttribute('aria-pressed', index === 0 ? 'true' : 'false')
    })
    // Los botones del grupo son los tres, ni uno más (los hotspots son otro grupo).
    expect(tabs.getAllByRole('button')).toHaveLength(STATIONS.length)

    // Cada hotspot repite la estación con un nombre explícito, no es un área ciega.
    STATIONS.forEach((station) => {
      expect(
        screen.getByRole('button', { name: `Estación ${station.marker}: ${station.title}` }),
      ).toBeInTheDocument()
    })
  })

  it('el panel muestra el contenido de la estación activa desde la config', () => {
    renderLab()
    expect(screen.getByRole('heading', { level: 3, name: STATIONS[0].title })).toBeInTheDocument()
    expect(screen.getAllByText(STATIONS[0].body).length).toBeGreaterThanOrEqual(1)

    const tabs = within(screen.getByRole('navigation', { name: 'Estaciones del recorrido' }))
    fireEvent.click(tabs.getAllByRole('button')[2])

    expect(screen.getByRole('heading', { level: 3, name: STATIONS[2].title })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 3, name: STATIONS[0].title })).not.toBeInTheDocument()
  })

  it('el CTA de cada estación enlaza a la ruta declarada', () => {
    renderLab()
    const tabs = within(screen.getByRole('navigation', { name: 'Estaciones del recorrido' }))
    STATIONS.forEach((station, index) => {
      fireEvent.click(tabs.getAllByRole('button')[index])
      expect(screen.getByRole('link', { name: station.ctaLabel })).toHaveAttribute('href', station.to)
      expect(screen.getAllByText(station.body).length).toBeGreaterThanOrEqual(1)
      expect(index).toBeLessThan(STATIONS.length)
    })
  })

  it('las flechas mueven selección y foco, y se detienen en los extremos', () => {
    renderLab()
    const nav = screen.getByRole('navigation', { name: 'Estaciones del recorrido' })
    const tabs = within(nav).getAllByRole('button')

    fireEvent.keyDown(tabs[0], { key: 'ArrowRight' })
    expect(tabs[1]).toHaveAttribute('aria-pressed', 'true')
    expect(document.activeElement).toBe(tabs[1])

    fireEvent.keyDown(tabs[1], { key: 'ArrowLeft' })
    fireEvent.keyDown(tabs[0], { key: 'ArrowLeft' })
    expect(tabs[0]).toHaveAttribute('aria-pressed', 'true')

    fireEvent.keyDown(tabs[0], { key: 'End' })
    expect(tabs[2]).toHaveAttribute('aria-pressed', 'true')

    fireEvent.keyDown(tabs[0], { key: 'Home' })
    expect(tabs[0]).toHaveAttribute('aria-pressed', 'true')

    fireEvent.keyDown(tabs[2], { key: 'Escape' })
    expect(tabs[0]).toHaveAttribute('aria-pressed', 'true')
    expect(document.activeElement).toBe(tabs[0])
  })

  it('el grupo es alcanzable y salible con Tab: no hay trampa de foco', () => {
    renderLab()
    const nav = screen.getByRole('navigation', { name: 'Estaciones del recorrido' })
    const tabs = within(nav).getAllByRole('button')
    // Los tres botones están en el orden de lectura y ninguno tiene tabIndex
    // positivo (eso rompería el orden natural del Tab).
    tabs.forEach((tab) => expect(tab).not.toHaveAttribute('tabindex', '0'))
    expect(tabs[0].compareDocumentPosition(tabs[2]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('declara su propio estado: maqueta bajo demanda, no instalación real', () => {
    renderLab()
    expect(screen.getByText('Maqueta espacial disponible bajo demanda')).toBeInTheDocument()
    // El descargo se dice una sola vez: no se repite como eco accesible.
    expect(screen.getAllByText(/Espacio conceptual, no una instalación real/i)).toHaveLength(1)
    expect(screen.getByText(/Figura decorativa/i)).toBeInTheDocument()
    expect(screen.getByText(/marco no médico/i)).toBeInTheDocument()
  })

  it('no reproduce el hueco de vídeo ni promete un plan concreto', () => {
    renderLab()
    expect(screen.queryByText(/VIDEO PRÓXIMAMENTE/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/RAÍZ|FUERZA|RENDIMIENTO|ELITE/)).not.toBeInTheDocument()
  })
})

describe('TrajectoryLab — aislamiento y propiedad', () => {
  const LAB_DIR = 'src/components/lab'

  it('ningún fichero del laboratorio importa three ni @react-three', () => {
    const offenders = []
    for (const entry of readdirSync(LAB_DIR, { withFileTypes: true })) {
      if (!entry.isFile() || !/\.jsx?$/.test(entry.name)) continue
      if (entry.name.includes('.test.')) continue
      const src = readFileSync(join(LAB_DIR, entry.name), 'utf8')
      if (
        /from\s+['"](?:@react-three|three)[^'"]*['"]/.test(src) ||
        /import\(\s*['"](?:@react-three|three)/.test(src)
      ) {
        offenders.push(entry.name)
      }
    }
    expect(
      offenders,
      `el laboratorio no puede arrastrar el motor 3D en el Lote 1: ${offenders.join(', ')}`,
    ).toEqual([])
  })

  it('el CSS del laboratorio no añade !important ni toca selectores globales', () => {
    const css = readFileSync('src/styles/spatial-lab.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
    expect(css).not.toMatch(/!important/)
    const globalSelectors = css
      .split('}')
      .map((block) => block.split('{')[0].trim())
      .filter((sel) => sel && !sel.startsWith('.lab') && !sel.startsWith('@') && !sel.startsWith('/*'))
    expect(globalSelectors, `selectores fuera del prefijo .lab-: ${globalSelectors.join(' | ')}`).toEqual([])
  })

  it('quien monta el laboratorio es el playground /design-system', () => {
    const page = readFileSync('src/pages/DesignSystem.jsx', 'utf8')
    expect(page).toMatch(/from '\.\.\/components\/lab\/TrajectoryLab\.jsx'/)
    expect(page).toMatch(/<TrajectoryLab\s*\/>/)
  })
})
