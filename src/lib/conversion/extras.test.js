import { describe, expect, it } from 'vitest'
import { groupServicesByCategory } from './extras.js'

function service(id, category) {
  return Object.freeze({ id, category, testOnly: true })
}

// Validates: Requirements 5.10, 5.15
describe('agrupación pura de servicios', () => {
  it('conserva el orden de primera aparición de categorías y servicios', () => {
    const sessionFirst = service('session-first', 'TEST_ONLY_SECOND')
    const sessionSecond = service('session-second', 'TEST_ONLY_FIRST')
    const extraFirst = service('extra-first', 'TEST_ONLY_SECOND')
    const extraSecond = service('extra-second', 'TEST_ONLY_THIRD')

    const groups = groupServicesByCategory(
      [sessionFirst, sessionSecond],
      [extraFirst, extraSecond],
    )

    expect(groups.map(({ category }) => category)).toEqual([
      'TEST_ONLY_SECOND',
      'TEST_ONLY_FIRST',
      'TEST_ONLY_THIRD',
    ])
    expect(groups.map(({ services }) => services.map(({ id }) => id))).toEqual([
      ['session-first', 'extra-first'],
      ['session-second'],
      ['extra-second'],
    ])
  })

  it('une categorías mixtas sin modificar ids ni sustituir objetos fuente', () => {
    const sessionShared = service('session-shared', 'TEST_ONLY_SHARED')
    const sessionOwn = service('session-own', 'TEST_ONLY_SESSION')
    const extraShared = service('extra-shared', 'TEST_ONLY_SHARED')
    const extraOwn = service('extra-own', 'TEST_ONLY_EXTRA')

    const groups = groupServicesByCategory(
      [sessionShared, sessionOwn],
      [extraShared, extraOwn],
    )

    expect(groups).toHaveLength(3)
    expect(groups[0]).toEqual({
      category: 'TEST_ONLY_SHARED',
      services: [sessionShared, extraShared],
    })
    expect(groups[0].services[0]).toBe(sessionShared)
    expect(groups[0].services[1]).toBe(extraShared)
    expect(groups[1].services[0]).toBe(sessionOwn)
    expect(groups[2].services[0]).toBe(extraOwn)
    expect(groups.flatMap(({ services }) => services.map(({ id }) => id))).toEqual([
      'session-shared',
      'extra-shared',
      'session-own',
      'extra-own',
    ])
  })

  it('devuelve una lista vacía para dos fuentes vacías', () => {
    const groups = groupServicesByCategory([], [])

    expect(groups).toEqual([])
    expect(Object.isFrozen(groups)).toBe(true)
  })

  it.each([
    [
      'dentro de sessionServices',
      [service('duplicate-id', 'TEST_ONLY_A'), service('duplicate-id', 'TEST_ONLY_B')],
      [],
    ],
    [
      'entre sessionServices y extraServices',
      [service('duplicate-id', 'TEST_ONLY_A')],
      [service('duplicate-id', 'TEST_ONLY_B')],
    ],
  ])('rechaza un id duplicado %s', (_caseName, sessionServices, extraServices) => {
    expect(() => groupServicesByCategory(sessionServices, extraServices)).toThrow(
      'Identificador de servicio duplicado: duplicate-id.',
    )
  })

  it.each([
    ['un valor que no es objeto', [null], /debe ser un objeto/],
    ['un servicio sin id', [{ category: 'TEST_ONLY' }], /id debe ser una cadena no vacía/],
    ['un servicio con id vacío', [{ id: ' ', category: 'TEST_ONLY' }], /id debe ser una cadena no vacía/],
    ['un servicio sin categoría', [{ id: 'missing-category' }], /category debe ser una cadena no vacía/],
    ['un servicio con categoría vacía', [{ id: 'blank-category', category: ' ' }], /category debe ser una cadena no vacía/],
  ])('rechaza %s', (_caseName, invalidServices, expectedMessage) => {
    expect(() => groupServicesByCategory(invalidServices, [])).toThrow(TypeError)
    expect(() => groupServicesByCategory(invalidServices, [])).toThrow(expectedMessage)
  })
})
