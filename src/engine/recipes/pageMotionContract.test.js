// Tests del contrato de movimiento por pagina (Fase 5).

import { describe, expect, it } from 'vitest'

import {
  DEFAULT_PAGE_MOTION,
  describeMotionOffer,
  resolvePageMotionContract,
  TEXT_MOTION_MODES,
  validatePageMotionContract,
} from './pageMotionContract.js'

describe('resolvePageMotionContract — normalizacion fail-safe', () => {
  it('sin declaracion devuelve el contrato minimo (calma primero)', () => {
    const contract = resolvePageMotionContract()

    expect(contract.intensity).toBe('balanced')
    expect(contract.narrative).toBe(false)
    expect(contract.horizontal).toBe(false)
    expect(contract.sticky).toBe(false)
    expect(contract.parallax).toBe(false)
    expect(contract.marquee).toBe(false)
    expect(contract.textMotion).toBe('none')
    expect(contract.future3d).toBe(false)
    expect(contract.zones).toEqual([...DEFAULT_PAGE_MOTION.zones])
    expect(contract.recipes).toEqual([])
  })

  it('acepta una declaracion valida completa', () => {
    const contract = resolvePageMotionContract({
      intensity: 'immersive',
      narrative: true,
      horizontal: true,
      sticky: true,
      textMotion: 'mask',
      future3d: true,
      zones: ['hero', 'body'],
      recipes: ['cinematicStage', 'editorial-reveal', 'inventada'],
    })

    expect(contract.intensity).toBe('immersive')
    expect(contract.narrative).toBe(true)
    expect(contract.horizontal).toBe(true)
    expect(contract.sticky).toBe(true)
    expect(contract.textMotion).toBe('mask')
    expect(contract.future3d).toBe(true)
    expect(contract.zones).toEqual(['hero', 'body'])
    // Las recetas inexistentes se descartan; claves y ids se aceptan.
    expect(contract.recipes).toEqual(['cinematicStage', 'editorial-reveal'])
  })

  it('los campos invalidos degradan a su default sin lanzar', () => {
    const contract = resolvePageMotionContract({
      intensity: 'salvaje',
      textMotion: 'gigante',
      zones: [],
      recipes: 'no-es-array',
    })

    expect(contract.intensity).toBe('balanced')
    expect(contract.textMotion).toBe('none')
    expect(contract.zones).toEqual([...DEFAULT_PAGE_MOTION.zones])
    expect(contract.recipes).toEqual([])
  })

  it('entrada no-objeto degrada al contrato minimo', () => {
    expect(resolvePageMotionContract('basura')).toMatchObject({ intensity: 'balanced' })
    expect(resolvePageMotionContract(null)).toMatchObject({ intensity: 'balanced' })
  })
})

describe('validatePageMotionContract — reglas del sistema', () => {
  it('una pagina tranquila es valida con zonas ligeras', () => {
    // Quiet = menos zonas animadas: el esqueleto de 4 zonas (peso 8) supera
    // su limite (6) a proposito; una pagina tranquila declara menos zonas.
    const { valid, warnings } = validatePageMotionContract({
      intensity: 'quiet',
      zones: ['body', 'supporting', 'cta'],
    })
    expect(valid).toBe(true)
    expect(warnings).toEqual([])
  })

  it('el esqueleto completo con quiet avisa por presupuesto', () => {
    const { valid, warnings } = validatePageMotionContract({ intensity: 'quiet' })
    expect(valid).toBe(false)
    expect(warnings.join(' ')).toMatch(/limite/)
  })

  it('avisa si sticky/horizontal se declaran con intensidad quiet', () => {
    const { valid, warnings } = validatePageMotionContract({ intensity: 'quiet', sticky: true })
    expect(valid).toBe(false)
    expect(warnings.join(' ')).toMatch(/quiet/)
  })

  it('avisa si la narrativa espacial no se declara como narrativa', () => {
    const { valid, warnings } = validatePageMotionContract({
      intensity: 'immersive',
      horizontal: true,
    })
    expect(valid).toBe(false)
    expect(warnings.join(' ')).toMatch(/narrative/)
  })

  it('sticky + horizontal exige immersive', () => {
    const base = { narrative: true, sticky: true, horizontal: true }
    expect(validatePageMotionContract({ ...base, intensity: 'balanced' }).valid).toBe(false)
    expect(validatePageMotionContract({ ...base, intensity: 'immersive' }).valid).toBe(true)
  })

  it('una pagina inmersiva completa pasa la validacion', () => {
    const { valid, warnings } = validatePageMotionContract({
      intensity: 'immersive',
      narrative: true,
      sticky: true,
      zones: ['hero', 'body', 'cta'],
    })
    expect(valid).toBe(true)
    expect(warnings).toEqual([])
  })
})

describe('describeMotionOffer', () => {
  it('expone intensidades, modos de texto y recetas del sistema', () => {
    const offer = describeMotionOffer()

    expect(offer.intensities).toEqual(['quiet', 'balanced', 'immersive'])
    expect(offer.textMotionModes).toEqual([...TEXT_MOTION_MODES])
    expect(offer.recipes).toHaveLength(8)
  })
})
