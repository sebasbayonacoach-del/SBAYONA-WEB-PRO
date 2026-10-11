import { buildWhatsAppUrl } from './offerings.js'
import { shopProducts } from './shopProducts.js'

const LEGACY_SELECTION = Object.freeze([
  ['hoodie-origins', 'OBJ-01', 'Ropa'],
  ['camiseta-origins', 'OBJ-02', 'Ropa'],
  ['zapatillas-move', 'OBJ-03', 'Calzado'],
  ['bandas-resistencia-set-5', 'OBJ-04', 'Equipamiento'],
  ['kit-reboot', 'OBJ-05', 'Equipamiento'],
  ['mochila-bayona', 'OBJ-06', 'Equipamiento'],
])

const canonicalById = new Map(shopProducts.map((item) => [item.id, item]))

export function buildCatalogItemWhatsAppUrl(item) {
  return buildWhatsAppUrl([
    `Hola BAYONA, quiero consultar el artículo ${item.name} (${item.code}).`,
    '¿Podéis confirmarme el precio, la disponibilidad, los detalles y las condiciones vigentes?',
  ].join('\n'))
}

export const catalogItems = Object.freeze(LEGACY_SELECTION.map(([id, code, category]) => {
  const canonical = canonicalById.get(id)
  if (!canonical) throw new Error(`Producto canónico inexistente: ${id}`)
  const item = Object.freeze({
    id: canonical.id,
    code,
    name: canonical.name,
    category,
    icon: canonical.icon,
    shopUrl: canonical.shopUrl,
    summary: 'Producto canónico de la selección consultable BAYONA.',
  })
  return Object.freeze({ ...item, whatsappUrl: buildCatalogItemWhatsAppUrl(item) })
}))

export const catalogCategories = Object.freeze([
  'Todo',
  ...new Set(catalogItems.map((item) => item.category)),
])

function normalizeSearch(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('es')
}

export function filterCatalog(items, { category = 'Todo', query = '' } = {}) {
  const normalizedQuery = normalizeSearch(query)
  return items.filter((item) => {
    const matchesCategory = category === 'Todo' || item.category === category
    const searchableCopy = normalizeSearch(`${item.name} ${item.category} ${item.code}`)
    return matchesCategory && searchableCopy.includes(normalizedQuery)
  })
}
