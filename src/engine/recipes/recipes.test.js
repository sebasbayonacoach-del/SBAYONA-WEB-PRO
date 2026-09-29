// Tests del recetario de movimiento (Fase 5).

import { describe, expect, it } from 'vitest'

import { MOTION_RECIPES, RECIPE_LIST, recipesUseKnownTokens, resolveRecipe } from './index.js'
import { MOTION_INTENSITIES } from './intensity.js'

describe('MOTION_RECIPES — oferta completa', () => {
  it('contiene las ocho recetas del sistema', () => {
    expect(Object.keys(MOTION_RECIPES).sort()).toEqual(
      [
        'cinematicStage',
        'compactRail',
        'dataCascade',
        'editorialReveal',
        'editorialSlide',
        'horizontalPassage',
        'imageDrift',
        'quietTransition',
      ].sort(),
    )
    expect(RECIPE_LIST).toHaveLength(8)
  })

  it('toda receta declara proposito, intensidad, componentes y contraindicaciones', () => {
    for (const recipe of RECIPE_LIST) {
      expect(recipe.id, 'id').toMatch(/^[a-z][a-z-]*$/)
      expect(recipe.name.length, `${recipe.id} name`).toBeGreaterThan(3)
      expect(recipe.purpose.length, `${recipe.id} purpose`).toBeGreaterThan(10)
      expect(Object.keys(MOTION_INTENSITIES), `${recipe.id} intensity`).toContain(recipe.intensity)
      expect(recipe.components.length, `${recipe.id} components`).toBeGreaterThan(0)
      expect(recipe.useWhen.length, `${recipe.id} useWhen`).toBeGreaterThan(5)
      expect(recipe.avoidWhen.length, `${recipe.id} avoidWhen`).toBeGreaterThan(5)
      expect(recipe.mobile.length, `${recipe.id} mobile`).toBeGreaterThan(5)
      expect(recipe.reducedMotion.length, `${recipe.id} reducedMotion`).toBeGreaterThan(5)
    }
  })

  it('toda receta usa distancias y tiers que existen en motionTokens', () => {
    expect(recipesUseKnownTokens()).toBe(true)
  })

  it('las recetas inmersivas son solo las narrativas', () => {
    const immersive = RECIPE_LIST.filter((recipe) => recipe.intensity === 'immersive').map(
      (recipe) => recipe.id,
    )
    expect(immersive.sort()).toEqual(['cinematic-stage', 'horizontal-passage'])
  })
})

describe('resolveRecipe', () => {
  it('resuelve por clave camelCase y por id kebab-case', () => {
    expect(resolveRecipe('editorialReveal')?.id).toBe('editorial-reveal')
    expect(resolveRecipe('editorial-reveal')?.id).toBe('editorial-reveal')
    expect(resolveRecipe('inexistente')).toBeNull()
    expect(resolveRecipe(undefined)).toBeNull()
  })
})
