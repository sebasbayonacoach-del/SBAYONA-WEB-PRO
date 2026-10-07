import { describe, expect, it } from 'vitest'
import { TESTIMONIALS } from '../config/testimonials.js'
import {
  IMPACT_STATS,
  TRAJECTORY_STOPS,
  WORLD_MAP_MARKERS,
} from './GlobeTestimonials.jsx'

describe('Mapa de trayectoria e impacto BAYONA', () => {
  it('publica un punto por experiencia, sin barrios o puntos inventados', () => {
    expect(WORLD_MAP_MARKERS).toHaveLength(TESTIMONIALS.length)
    expect(WORLD_MAP_MARKERS.map((marker) => marker.testimonialId).sort((a, b) => a - b))
      .toEqual(TESTIMONIALS.map((testimonial) => testimonial.id).sort((a, b) => a - b))

    const markerIds = WORLD_MAP_MARKERS.map((marker) => marker.id).join(' ')
    expect(markerIds).not.toMatch(/chapinero|usaquen|suba|engativa|teusaquillo|fontibon|kennedy|bosa|san-cristobal/i)
  })

  it('resume únicamente lo que existe en el registro publicado', () => {
    expect(IMPACT_STATS).toEqual([
      { value: 10, label: 'historias publicadas' },
      { value: 4, label: 'países representados' },
      { value: 5, label: 'ciudades en el mapa' },
    ])
  })

  it('cuenta la trayectoria Colombia → España → Internacional sin inventar volumen', () => {
    expect(TRAJECTORY_STOPS.map((stop) => stop.title)).toEqual([
      'Colombia',
      'España',
      'Internacional',
    ])
    expect(TRAJECTORY_STOPS[0].copy).toContain('5 historias publicadas')
    expect(TRAJECTORY_STOPS[1].copy).toContain('3 historias publicadas')
    expect(TRAJECTORY_STOPS[2].copy).toContain('2 historias publicadas')
  })

  it('mantiene las ciudades publicadas como única fuente geográfica', () => {
    const cities = [...new Set(TESTIMONIALS.map((testimonial) => testimonial.city))].sort()
    expect(cities).toEqual(['Bogotá', 'Buenos Aires', 'Madrid', 'Miami', 'Valencia'])
    expect(new Set(WORLD_MAP_MARKERS.map((marker) => marker.city))).toEqual(new Set(cities))
  })
})
