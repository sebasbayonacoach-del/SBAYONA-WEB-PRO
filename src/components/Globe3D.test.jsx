import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Globe3D, { GLOBE_MARKERS, resolveGlobeConfig } from './Globe3D.jsx'

describe('Globe3D — configuración adaptativa', () => {
  it('reduce geometría y desactiva drag en móvil', () => {
    const desktop = resolveGlobeConfig({ mode: 'desktop', reducedMotion: false, dprLimit: 2 })
    const mobile = resolveGlobeConfig({ mode: 'mobile', reducedMotion: false, dprLimit: 1.5 })

    expect(mobile.sphereDetail).toBeLessThan(desktop.sphereDetail)
    expect(mobile.dpr).toBeLessThanOrEqual(desktop.dpr)
    expect(desktop.enableControls).toBe(true)
    expect(mobile.enableControls).toBe(false)
  })

  it('detiene la rotación y usa render bajo demanda con reduced-motion', () => {
    const config = resolveGlobeConfig({ mode: 'desktop', reducedMotion: true, dprLimit: 2 })

    expect(config.rotate).toBe(false)
    expect(config.rotationSpeed).toBe(0)
    expect(config.enableControls).toBe(false)
    expect(config.frameloop).toBe('demand')
  })

  it('mantiene únicamente marcadores prudentes y copy honesto', () => {
    expect(GLOBE_MARKERS).toHaveLength(3)
    expect(GLOBE_MARKERS.map(({ label, description }) => [label, description])).toEqual([
      ['Colombia', 'Origen y experiencia profesional'],
      ['España / Europa', 'Formación y desarrollo actual'],
      ['Internacional', 'Visión de crecimiento'],
    ])
    expect(JSON.stringify(GLOBE_MARKERS)).not.toMatch(/clientes|sedes|casos de éxito|transformad|\+1[.\s]?000/i)
  })
})

describe('Globe3D — fallback y contrato visual', () => {
  it('no bloquea contenido cuando WebGL no está disponible', () => {
    render(<Globe3D webglAvailable={false} />)

    expect(screen.getByRole('group', { name: /trayectoria y visión internacional/i })).toBeInTheDocument()
    expect(screen.getByText('Colombia')).toBeInTheDocument()
    expect(screen.getByText('España / Europa')).toBeInTheDocument()
    expect(screen.getByText('Internacional')).toBeInTheDocument()
  })

  it('usa geometría procedural, OrbitControls y ningún activo remoto', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/components/Globe3D.jsx'), 'utf8')

    expect(source).toContain('icosahedronGeometry')
    expect(source).toContain('OrbitControls')
    expect(source).toContain('color="#F4A261" wireframe')
    expect(source).not.toContain('#C9A961')
    expect(source).not.toMatch(/TextureLoader|useTexture|https?:\/\//)
  })
})
