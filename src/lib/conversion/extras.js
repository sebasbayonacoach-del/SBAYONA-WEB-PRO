/**
 * @typedef {Object} GroupableService
 * @property {string} id
 * @property {string} category
 */

/**
 * @typedef {Object} ServiceGroup
 * @property {string} category
 * @property {ReadonlyArray<GroupableService>} services
 */

function assertServiceList(services, sourceName) {
  if (!Array.isArray(services)) {
    throw new TypeError(`${sourceName} debe ser una lista de servicios.`)
  }
}

function assertValidService(service, sourceName, index) {
  const location = `${sourceName}[${index}]`

  if (service === null || typeof service !== 'object' || Array.isArray(service)) {
    throw new TypeError(`Servicio inválido en ${location}: debe ser un objeto.`)
  }

  if (typeof service.id !== 'string' || service.id.trim() === '') {
    throw new TypeError(`Servicio inválido en ${location}: id debe ser una cadena no vacía.`)
  }

  if (typeof service.category !== 'string' || service.category.trim() === '') {
    throw new TypeError(`Servicio inválido en ${location}: category debe ser una cadena no vacía.`)
  }
}

/**
 * Une servicios por cantidad y servicios extra, y los agrupa por la categoría
 * exacta publicada en la fuente. El recorrido conserva el orden de las listas,
 * el orden de primera aparición de cada categoría y las referencias originales.
 *
 * @param {ReadonlyArray<GroupableService>} sessionServices
 * @param {ReadonlyArray<GroupableService>} extraServices
 * @returns {ReadonlyArray<ServiceGroup>}
 * @throws {TypeError} Si una colección o un servicio no cumple el contrato mínimo.
 * @throws {Error} Si un identificador aparece más de una vez entre ambas colecciones.
 */
export function groupServicesByCategory(sessionServices, extraServices) {
  assertServiceList(sessionServices, 'sessionServices')
  assertServiceList(extraServices, 'extraServices')

  const seenIds = new Set()
  const groupByCategory = new Map()
  const groups = []

  for (const [sourceName, services] of [
    ['sessionServices', sessionServices],
    ['extraServices', extraServices],
  ]) {
    services.forEach((service, index) => {
      assertValidService(service, sourceName, index)

      if (seenIds.has(service.id)) {
        throw new Error(`Identificador de servicio duplicado: ${service.id}.`)
      }
      seenIds.add(service.id)

      let group = groupByCategory.get(service.category)
      if (!group) {
        group = { category: service.category, services: [] }
        groupByCategory.set(service.category, group)
        groups.push(group)
      }

      group.services.push(service)
    })
  }

  return Object.freeze(groups.map((group) => Object.freeze({
    category: group.category,
    services: Object.freeze([...group.services]),
  })))
}
