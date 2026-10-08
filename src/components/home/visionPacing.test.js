import { describe, expect, it } from 'vitest'
import { resolveVisionChapter, resolveVisionGalleryProgress } from './visionPacing.js'

describe('BAYONA scroll con tiempo de lectura', () => {
  it('distribuye los cinco capítulos y prolonga el último', () => {
    expect([0, 0.18, 0.36, 0.54, 0.73, 1].map(resolveVisionChapter)).toEqual([0, 1, 2, 3, 4, 4])
    expect(resolveVisionChapter(NaN)).toBe(0)
  })
  it('sostiene los planos al comenzar cada capítulo', () => {
    expect(resolveVisionGalleryProgress(0)).toBe(0)
    expect(resolveVisionGalleryProgress(0.02)).toBe(0)
    expect(resolveVisionGalleryProgress(0.17)).toBeCloseTo(2 / 9)
    expect(resolveVisionGalleryProgress(0.36)).toBeCloseTo(4 / 9)
  })
  it('el último fotograma permanece estable mientras se lee el CTA', () => {
    expect(resolveVisionGalleryProgress(0.86)).toBe(1)
    expect(resolveVisionGalleryProgress(0.96)).toBe(1)
    expect(resolveVisionGalleryProgress(1)).toBe(1)
  })
  it('el progreso nunca retrocede al avanzar el scroll', () => {
    let prev = 0
    for (let i = 0; i <= 100; i++) {
      const value = resolveVisionGalleryProgress(i / 100)
      expect(value).toBeGreaterThanOrEqual(prev - 1e-9)
      prev = value
    }
  })
})
