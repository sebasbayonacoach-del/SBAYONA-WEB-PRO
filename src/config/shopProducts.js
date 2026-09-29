import { siteMedia } from './siteMedia.js'
import { whatsAppLink } from './site.config.js'

const COP_PER_EUR_REFERENCE = 4300
const COP_PER_USD_REFERENCE = 4000

function formatCop(value) {
  return `$${Number(value).toLocaleString('es-CO')}`
}

function formatCurrencyRange(value, formatter) {
  return Array.isArray(value)
    ? `${formatter(value[0])}–${formatter(value[1])}`
    : formatter(value)
}

function formatEur(value) {
  return formatCurrencyRange(value, (amount) => `€${Math.round(amount / COP_PER_EUR_REFERENCE)}`)
}

function formatUsd(value) {
  return formatCurrencyRange(value, (amount) => `$${Math.round(amount / COP_PER_USD_REFERENCE)}`)
}

export const shopCollections = Object.freeze([
  Object.freeze({
    id: 'origins',
    name: 'Origins',
    title: 'ORIGINS COLLECTION',
    icon: 'sunrise',
    media: siteMedia.shop.collections.origins,
    statement: 'Para los que empiezan.',
    fullStatement: 'Para los que empiezan. Tu primer paso viste BAYONA.',
    number: '01',
  }),
  Object.freeze({
    id: 'movement',
    name: 'Movement',
    title: 'MOVEMENT COLLECTION',
    icon: 'move',
    media: siteMedia.shop.collections.movement,
    statement: 'Diseñado para moverte.',
    fullStatement: 'Diseñado para moverte. Sin límites.',
    number: '02',
  }),
  Object.freeze({
    id: 'strength',
    name: 'Strength',
    title: 'STRENGTH COLLECTION',
    icon: 'dumbbell',
    media: siteMedia.shop.collections.strength,
    statement: 'Construye tu fuerza.',
    fullStatement: 'Construye tu fuerza. Llévala contigo.',
    number: '03',
  }),
  Object.freeze({
    id: 'recovery',
    name: 'Recovery',
    title: 'RECOVERY COLLECTION',
    icon: 'leaf',
    media: siteMedia.shop.collections.recovery,
    statement: 'Recupera. Renace. Repite.',
    fullStatement: 'Recupera. Renace. Repite.',
    number: '04',
  }),
])

const collectionById = new Map(shopCollections.map((collection) => [collection.id, collection]))

function buildShopWhatsAppUrl(product) {
  const message = `Hola BAYONA, quiero ${product.name} (${product.priceDisplay})`
  return whatsAppLink(message)
}

function createProduct(product, index) {
  const collection = collectionById.get(product.collectionId)
  if (!collection) throw new Error(`Colección desconocida: ${product.collectionId}`)

  const media = siteMedia.shop.products[product.id]

  const priceDisplay = `${formatCurrencyRange(product.price, formatCop)} COP`
  const normalizedProduct = {
    ...product,
    media,
    priceCop: Array.isArray(product.price) ? undefined : product.price,
    priceRange: Array.isArray(product.price) ? product.price : undefined,
    priceDisplay,
    eurDisplay: `≈ ${formatEur(product.price)}`,
    usdDisplay: `≈ ${formatUsd(product.price)} USD`,
    collection: collection.name,
    collectionTitle: collection.title,
    collectionIcon: collection.icon,
    type: product.category,
    cardSize: product.cardSize ?? ['standard', 'tall', 'compact', 'standard'][index % 4],
  }

  return Object.freeze({
    ...normalizedProduct,
    whatsappUrl: buildShopWhatsAppUrl(normalizedProduct),
  })
}

const productDefinitions = [
  { id: 'tank-top-performance', name: 'Tank Top Performance', price: 99000, category: 'Ropa Entreno', collectionId: 'movement', icon: 'shirt', description: 'Entrenas libre. Nada frena tu movimiento.' },
  { id: 'short-tecnico-bayona', name: 'Short Técnico BAYONA', price: 119000, category: 'Ropa Entreno', collectionId: 'movement', icon: 'shirt', description: 'Te mueves sin límites. Comodidad en cada repetición.' },
  { id: 'legging-pro-mujer', name: 'Legging Pro Mujer', price: 149000, category: 'Ropa Entreno', collectionId: 'movement', icon: 'shirt', description: 'Entrenas en serio. Soporte que sigue tu ritmo.', cardSize: 'tall' },
  { id: 'camiseta-manga-larga', name: 'Camiseta Manga Larga', price: 139000, category: 'Ropa Entreno', collectionId: 'movement', icon: 'shirt', description: 'Sigues adelante. Protección cuando el día exige más.' },
  { id: 'top-deportivo-mujer', name: 'Top Deportivo Mujer', price: 99000, category: 'Ropa Entreno', collectionId: 'movement', icon: 'shirt', description: 'Te mueves segura. Soporte y libertad en cada sesión.' },
  { id: 'camiseta-compresion', name: 'Camiseta Compresión', price: 129000, category: 'Ropa Entreno', collectionId: 'movement', icon: 'shirt', description: 'Tu ritmo no afloja. Ajuste que acompaña cada repetición.' },

  { id: 'hoodie-origins', name: 'Hoodie Origins', price: 189000, category: 'Ropa Lifestyle', collectionId: 'origins', icon: 'shirt', description: 'Tu primera pieza. El inicio del camino.', cardSize: 'tall', featured: true },
  { id: 'hoodie-premium', name: 'Hoodie Premium', price: 249000, category: 'Ropa Lifestyle', collectionId: 'strength', icon: 'shirt', description: 'Para los que van en serio. Presencia que se siente.', cardSize: 'tall' },
  { id: 'camiseta-origins', name: 'Camiseta Origins', price: 129000, category: 'Ropa Lifestyle', collectionId: 'origins', icon: 'shirt', description: 'Tu identidad, sin ruido. Simple. Potente. Tuya.' },
  { id: 'pantalon-jogger-premium', name: 'Pantalón Jogger Premium', price: 179000, category: 'Ropa Lifestyle', collectionId: 'strength', icon: 'shirt', description: 'Representas dentro y fuera. Del gimnasio a la calle.' },
  { id: 'gorra-bayona', name: 'Gorra BAYONA', price: 89000, category: 'Ropa Lifestyle', collectionId: 'origins', icon: 'shirt', description: 'Perteneces al camino. Lleva la marca donde vayas.', cardSize: 'compact' },
  { id: 'chaqueta-windstopper', name: 'Chaqueta Windstopper', price: 289000, category: 'Ropa Lifestyle', collectionId: 'movement', icon: 'shirt', description: 'No negocias con el clima. Sigues avanzando.', cardSize: 'tall' },
  { id: 'sudadero-recovery', name: 'Sudadero Recovery', price: 159000, category: 'Ropa Lifestyle', collectionId: 'recovery', icon: 'shirt', description: 'Bajas el ritmo sin perder identidad. Recupera con estilo.' },
  { id: 'calcetines-compresion-pack-3', name: 'Calcetines Compresión (pack 3)', price: 59000, category: 'Ropa Lifestyle', collectionId: 'movement', icon: 'shirt', description: 'Cuidas cada detalle. Tu movimiento también empieza abajo.', cardSize: 'compact' },

  { id: 'zapatillas-move', name: 'Zapatillas MOVE', price: 289000, category: 'Calzado', collectionId: 'movement', icon: 'footprints', description: 'Te adaptas a cualquier terreno. Agarre y libertad total.', cardSize: 'tall' },
  { id: 'zapatillas-trainer-pro', name: 'Zapatillas Trainer Pro', price: 349000, category: 'Calzado', collectionId: 'strength', icon: 'footprints', description: 'Entrenas todo. Respuesta firme en cada movimiento.' },
  { id: 'zapatillas-parkour-free', name: 'Zapatillas Parkour Free', price: 399000, category: 'Calzado', collectionId: 'movement', icon: 'footprints', description: 'Ves rutas donde otros ven muros. Agarre extremo.', cardSize: 'tall' },
  { id: 'chanclas-recovery', name: 'Chanclas Recovery', price: 89000, category: 'Calzado', collectionId: 'recovery', icon: 'footprints', description: 'También avanzas cuando recuperas. Descanso para tus pies.', cardSize: 'compact' },

  { id: 'bandas-resistencia-set-5', name: 'Bandas de Resistencia (set 5)', price: 89000, category: 'Equipamiento', collectionId: 'strength', icon: 'dumbbell', description: 'Tu gimnasio va contigo. Entrena donde quieras.' },
  { id: 'mancuernas-ajustables', name: 'Mancuernas Ajustables', price: 425000, category: 'Equipamiento', collectionId: 'strength', icon: 'dumbbell', description: 'Construyes fuerza a tu manera. Infinitas posibilidades.', cardSize: 'tall' },
  { id: 'kit-reboot', name: 'Kit Reboot', price: 259000, category: 'Equipamiento', collectionId: 'strength', icon: 'package', description: 'Decides volver más fuerte. Todo lo esencial para empezar.' },
  { id: 'foam-roller-pro', name: 'Foam Roller Pro', price: 79000, category: 'Equipamiento', collectionId: 'recovery', icon: 'dumbbell', description: 'Recuperas para volver mejor. Diez minutos que cuentan.', cardSize: 'compact' },
  { id: 'pelota-suiza', name: 'Pelota Suiza', price: 99000, category: 'Equipamiento', collectionId: 'strength', icon: 'dumbbell', description: 'Controlas tu centro. Estabilidad que se siente.' },
  { id: 'kettlebell-pro', name: 'Kettlebell Pro (8–24 kg)', price: [159000, 299000], category: 'Equipamiento', collectionId: 'strength', icon: 'dumbbell', description: 'Construyes poder real. Fuerza funcional en cada movimiento.', cardSize: 'tall' },
  { id: 'barra-dominadas-portatil', name: 'Barra Dominadas Portátil', price: 189000, category: 'Equipamiento', collectionId: 'strength', icon: 'dumbbell', description: 'Tu casa también es territorio de fuerza. Eleva tu nivel.' },
  { id: 'esterilla-premium', name: 'Esterilla Premium', price: 99000, category: 'Equipamiento', collectionId: 'recovery', icon: 'dumbbell', description: 'Creas tu espacio. Tu suelo, tu práctica, tu momento.' },
  { id: 'guantes-parkour', name: 'Guantes de Parkour', price: 89000, category: 'Equipamiento', collectionId: 'movement', icon: 'dumbbell', description: 'Proteges tus manos. Domina cualquier muro.', cardSize: 'compact' },
  { id: 'mochila-bayona', name: 'Mochila BAYONA', price: 189000, category: 'Equipamiento', collectionId: 'recovery', icon: 'package', description: 'Tu transformación viaja contigo. Lleva lo que te impulsa.', cardSize: 'tall' },

  { id: 'botella-smart-bayona', name: 'Botella Smart BAYONA', price: 79000, category: 'Máquinas', collectionId: 'recovery', icon: 'cpu', description: 'Cuidas tu energía. Hidratación inteligente durante el día.' },
  { id: 'pistola-masaje-pro', name: 'Pistola de Masaje Pro', price: 299000, category: 'Máquinas', collectionId: 'recovery', icon: 'cpu', description: 'Recuperas como entrenas: en serio. Potencia en tus manos.', cardSize: 'tall' },
  { id: 'reloj-inteligente-bayona', name: 'Reloj Inteligente BAYONA', price: 599000, category: 'Máquinas', collectionId: 'strength', icon: 'cpu', description: 'Lees tu evolución. Tus métricas convierten esfuerzo en progreso.' },
  { id: 'banda-resistencia-inteligente', name: 'Banda de Resistencia Inteligente', price: 359000, category: 'Máquinas', collectionId: 'strength', icon: 'cpu', description: 'Haces visible tu fuerza. Mide cada avance en vivo.' },
  { id: 'bascula-inteligente', name: 'Báscula Inteligente', price: 249000, category: 'Máquinas', collectionId: 'strength', icon: 'cpu', description: 'Conoces tu punto de partida. Datos claros para avanzar mejor.' },

  { id: 'whey-protein-bayona', name: 'Whey Protein BAYONA', price: 189000, category: 'Suplementos', collectionId: 'recovery', icon: 'pill', description: 'Alimentas tu progreso. Proteína limpia, recuperación real.' },
  { id: 'creatina-monohidrato', name: 'Creatina Monohidrato', price: 99000, category: 'Suplementos', collectionId: 'strength', icon: 'pill', description: 'Construyes más fuerza. Potencia respaldada por ciencia.' },
  { id: 'pre-workout-elite', name: 'Pre-Workout Elite', price: 149000, category: 'Suplementos', collectionId: 'strength', icon: 'pill', description: 'Entras enfocado. Energía que acompaña tu intensidad.', cardSize: 'tall' },
  { id: 'omega-3-premium', name: 'Omega 3 Premium', price: 89000, category: 'Suplementos', collectionId: 'recovery', icon: 'pill', description: 'Cuidas tu base. Recuperación que empieza desde dentro.', cardSize: 'compact' },
  { id: 'multivitaminico-elite', name: 'Multivitamínico Elite', price: 99000, category: 'Suplementos', collectionId: 'recovery', icon: 'pill', description: 'Sostienes tu ritmo. Una base diaria optimizada.' },
  { id: 'colageno-hidrolizado', name: 'Colágeno Hidrolizado', price: 129000, category: 'Suplementos', collectionId: 'recovery', icon: 'pill', description: 'Te cuidas para seguir. Soporte diario desde dentro.' },

]

export const shopProducts = Object.freeze(productDefinitions.map(createProduct))

export const shopCollectionFilters = Object.freeze([
  Object.freeze({ id: 'all', label: 'Todo' }),
  ...shopCollections.map(({ id, name }) => Object.freeze({ id, label: name })),
])

export const shopCategoryFilters = Object.freeze([
  'Todo',
  'Ropa Entreno',
  'Ropa Lifestyle',
  'Calzado',
  'Equipamiento',
  'Máquinas',
  'Suplementos',
])

export const shopTypeFilters = shopCategoryFilters

function normalizeSearch(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('es')
}

export function filterShopProducts(
  products,
  { collectionId = 'all', category = 'Todo', type = category, query = '' } = {},
) {
  const selectedCategory = category === 'Todo' ? type : category
  const normalizedQuery = normalizeSearch(query)

  return products.filter((product) => {
    const matchesCollection = collectionId === 'all' || product.collectionId === collectionId
    const matchesCategory = selectedCategory === 'Todo' || product.category === selectedCategory
    const searchableText = normalizeSearch([
      product.name,
      product.description,
      product.collection,
      product.collectionTitle,
      product.category,
    ].join(' '))

    return matchesCollection && matchesCategory && searchableText.includes(normalizedQuery)
  })
}
