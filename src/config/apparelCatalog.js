import { apparelSourcing } from './apparelSourcing.js'
import { shopProducts } from './shopProducts.js'

/**
 * Fuente única del escaparate público. Se excluyen los productos cuyas
 * prestaciones o seguridad requieren pruebas antes de describirlos al cliente.
 * Los demás productos textiles siguen siendo consultas de prelanzamiento.
 */
export const storefrontProducts = Object.freeze(
  shopProducts.filter((product) => apparelSourcing[product.id]?.status !== 'blocked'),
)

export const pendingApparelCount = shopProducts.filter(
  (product) => Boolean(apparelSourcing[product.id]),
).length

export const blockedApparelIds = Object.freeze(
  shopProducts.filter((product) => apparelSourcing[product.id]?.status === 'blocked')
    .map((product) => product.id),
)
