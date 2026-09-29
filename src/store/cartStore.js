import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const CART_ITEM_TYPES = new Set(['producto', 'servicio'])

/** Clave del carrito persistido. Subir el `version` de abajo invalida lo guardado. */
export const CART_STORAGE_KEY = 'bayona:cart:v1'

export function createCartKey(type, name) {
  const normalizedType = String(type ?? '').trim()
  const normalizedName = String(name ?? '').trim()

  if (!CART_ITEM_TYPES.has(normalizedType)) {
    throw new TypeError(`Tipo de carrito no válido: ${normalizedType || 'vacío'}`)
  }
  if (!normalizedName) throw new TypeError('El artículo del carrito necesita un nombre.')

  return `${normalizedType}:${normalizedName}`
}

function normalizeCartItem(item) {
  const type = String(item?.type ?? '').trim()
  const name = String(item?.name ?? '').trim()
  const priceCOP = Math.round(Number(item?.priceCOP))
  const qty = Math.max(1, Math.floor(Number(item?.qty) || 1))

  if (!Number.isFinite(priceCOP) || priceCOP < 0) {
    throw new TypeError(`Precio COP no válido para ${name || 'el artículo'}.`)
  }

  return {
    key: createCartKey(type, name),
    type,
    name,
    priceCOP,
    qty,
    media: item?.media?.src ? item.media : null,
    icon: item?.icon ?? null,
    img: item?.img ?? null,
  }
}

export const selectCartCount = ({ items }) => items.reduce((count, item) => count + item.qty, 0)
export const totalCOP = ({ items }) => items.reduce(
  (total, item) => total + (item.priceCOP * item.qty),
  0,
)
export const selectCartTotalCOP = totalCOP

/**
 * Vuelve a validar lo que venga de localStorage.
 * `normalizeCartItem` lanza si el artículo no es válido, así que un carrito
 * corrupto o de una versión anterior tumbaría la app al rehidratar. Aquí se
 * descarta lo que no pase la validación en lugar de propagar la excepción.
 */
function sanitizePersistedItems(items) {
  if (!Array.isArray(items)) return []

  return items.flatMap((item) => {
    try {
      return [normalizeCartItem(item)]
    } catch {
      return []
    }
  })
}

const createCartState = (set) => ({
  items: [],
  isOpen: false,
  lastAddedKey: null,
  addItem: (item) => set((state) => {
    const nextItem = normalizeCartItem(item)
    const currentItem = state.items.find(({ key }) => key === nextItem.key)

    if (!currentItem) {
      return {
        items: [...state.items, nextItem],
        isOpen: true,
        lastAddedKey: nextItem.key,
      }
    }

    return {
      items: state.items.map((cartItem) => (
        cartItem.key === nextItem.key
          ? {
              ...cartItem,
              priceCOP: nextItem.priceCOP,
              qty: cartItem.qty + nextItem.qty,
              media: nextItem.media ?? cartItem.media,
              icon: nextItem.icon ?? cartItem.icon,
              img: nextItem.img ?? cartItem.img,
            }
          : cartItem
      )),
      isOpen: true,
      lastAddedKey: nextItem.key,
    }
  }),
  setOpen: (isOpen) => set({ isOpen: Boolean(isOpen) }),
  clearLastAddedItem: () => set({ lastAddedKey: null }),
  removeItem: (key) => set((state) => ({
    items: state.items.filter((item) => item.key !== key),
  })),
  updateQty: (key, qty) => set((state) => {
    const nextQty = Math.max(0, Math.floor(Number(qty) || 0))

    return {
      items: nextQty === 0
        ? state.items.filter((item) => item.key !== key)
        : state.items.map((item) => (item.key === key ? { ...item, qty: nextQty } : item)),
    }
  }),
  clear: () => set({ items: [], lastAddedKey: null }),
})

/**
 * El carrito ahora sobrevive a la recarga. Antes vivía solo en memoria: si
 * alguien añadía cuatro servicios y recargaba, o volvía desde WhatsApp, la
 * selección desaparecía y había que empezar de cero. Es la fuga de conversión
 * más silenciosa que tenía la tienda.
 *
 * Solo se persisten los artículos. `isOpen` y `lastAddedKey` son estado de UI:
 * si se guardaran, el panel se abriría solo al cargar cualquier página.
 */
export const useCartStore = create(
  persist(createCartState, {
    name: CART_STORAGE_KEY,
    version: 1,
    partialize: (state) => ({ items: state.items }),
    merge: (persistedState, currentState) => ({
      ...currentState,
      items: sanitizePersistedItems(persistedState?.items),
    }),
  }),
)
