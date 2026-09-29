import { buildWhatsAppUrl } from './offerings.js'

export function buildCatalogItemWhatsAppUrl(item) {
  return buildWhatsAppUrl([
    `Hola BAYONA, quiero consultar el artículo ${item.name} (${item.code}).`,
    '¿Podéis confirmarme el precio, la disponibilidad, los detalles y las condiciones vigentes?',
  ].join('\n'))
}

function createCatalogItem(item) {
  return Object.freeze({
    ...item,
    whatsappUrl: buildCatalogItemWhatsAppUrl(item),
  })
}

export const catalogItems = Object.freeze([
  createCatalogItem({
    id: 'hoodie-bayona',
    code: 'OBJ-01',
    name: 'Hoodie BAYONA',
    category: 'Ropa',
    icon: 'shirt',
    summary: 'Referencia de indumentaria incluida en la selección consultable BAYONA.',
  }),
  createCatalogItem({
    id: 'camiseta-origins',
    code: 'OBJ-02',
    name: 'Camiseta Origins',
    category: 'Ropa',
    icon: 'shirt',
    summary: 'Referencia de indumentaria incluida en la selección consultable BAYONA.',
  }),
  createCatalogItem({
    id: 'zapatillas-move',
    code: 'OBJ-03',
    name: 'Zapatillas MOVE',
    category: 'Calzado',
    icon: 'footprints',
    summary: 'Referencia de calzado incluida en la selección consultable BAYONA.',
  }),
  createCatalogItem({
    id: 'bandas-resistencia',
    code: 'OBJ-04',
    name: 'Bandas de resistencia',
    category: 'Equipamiento',
    icon: 'dumbbell',
    summary: 'Referencia de equipamiento incluida en la selección consultable BAYONA.',
  }),
  createCatalogItem({
    id: 'kit-reboot',
    code: 'OBJ-05',
    name: 'Kit Reboot',
    category: 'Equipamiento',
    icon: 'package',
    summary: 'Referencia de equipamiento incluida en la selección consultable BAYONA.',
  }),
  createCatalogItem({
    id: 'mochila-bayona',
    code: 'OBJ-06',
    name: 'Mochila BAYONA',
    category: 'Equipamiento',
    icon: 'backpack',
    summary: 'Referencia de equipamiento incluida en la selección consultable BAYONA.',
  }),
])

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
