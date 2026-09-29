import { useEffect, useMemo } from 'react'
import {
  ArrowUpRight,
  Cpu,
  Download,
  Dumbbell,
  Footprints,
  LockKeyhole,
  Minus,
  Package,
  Pill,
  Plus,
  ShieldCheck,
  Shirt,
  ShoppingCart,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Drawer } from 'vaul'
import { buildWhatsAppUrl, formatCop, formatUsdApprox } from '../../config/offerings.js'
import { useRewards } from '../../lib/rewards/RewardsProvider.jsx'
import {
  selectCartCount,
  selectCartTotalCOP,
  useCartStore,
} from '../../store/cartStore.js'
import { GUARANTEE } from '../../config/commitments.js'
import { trackWhatsAppClick } from '../../lib/analytics/analytics.js'
import '../../styles/cart.css'

const COP_PER_EUR_REFERENCE = 4300
const CART_ITEM_ICONS = Object.freeze({
  cpu: Cpu,
  download: Download,
  dumbbell: Dumbbell,
  footprints: Footprints,
  package: Package,
  pill: Pill,
  shirt: Shirt,
})

function formatEurApprox(valueCOP) {
  return `≈ €${Math.round(Number(valueCOP) / COP_PER_EUR_REFERENCE)}`
}

function buildCartWhatsAppUrl(items, totalCOP) {
  const itemLines = items.map((item, index) => {
    const lineTotal = item.priceCOP * item.qty
    return `${index + 1}. ${item.qty} × ${item.name} (${item.type}) — ${formatCop(lineTotal)} COP${item.qty > 1 ? ` · ${formatCop(item.priceCOP)} COP c/u` : ''}`
  })

  return buildWhatsAppUrl([
    'Hola BAYONA, quiero finalizar este carrito.',
    '',
    'MI SELECCIÓN:',
    ...itemLines,
    '',
    `TOTAL PUBLICADO: ${formatCop(totalCOP)} COP`,
    `Equivalencia aproximada: ${formatEurApprox(totalCOP)} · ${formatUsdApprox(totalCOP)}`,
    '',
    'Quiero revisar disponibilidad, condiciones y el siguiente paso antes de confirmar.',
  ].join('\n'))
}

function CartItemVisual({ item }) {
  const Icon = CART_ITEM_ICONS[item.icon] ?? (item.type === 'servicio' ? Dumbbell : Package)

  return (
    <span className="cart-item-visual" aria-hidden="true">
      <Icon size={20} strokeWidth={1} />
    </span>
  )
}

export default function CartDrawer({ open, onOpenChange }) {
  const items = useCartStore((state) => state.items)
  const itemCount = useCartStore(selectCartCount)
  const totalCOP = useCartStore(selectCartTotalCOP)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQty = useCartStore((state) => state.updateQty)
  const clear = useCartStore((state) => state.clear)
  const lastAddedKey = useCartStore((state) => state.lastAddedKey)
  const clearLastAddedItem = useCartStore((state) => state.clearLastAddedItem)
  const rewards = useRewards()
  const creditEur = rewards.totalEur
  const checkoutUrl = useMemo(() => buildCartWhatsAppUrl(items, totalCOP), [items, totalCOP])

  useEffect(() => {
    if (!open || !lastAddedKey) return undefined

    const timeout = window.setTimeout(clearLastAddedItem, 900)
    return () => window.clearTimeout(timeout)
  }, [clearLastAddedItem, lastAddedKey, open])

  return (
    <Drawer.Root
      direction="right"
      open={open}
      onOpenChange={onOpenChange}
      shouldScaleBackground={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="cart-drawer-overlay" />
        <Drawer.Content className="cart-drawer" aria-describedby="cart-drawer-description">
          <header className="cart-drawer-header">
            <div>
              <p>BAYONA / SELECCIÓN</p>
              <Drawer.Title>Tu carrito</Drawer.Title>
              <Drawer.Description className="cart-visually-hidden" id="cart-drawer-description">
                Revisa productos y servicios, ajusta cantidades y prepara tu pedido completo para WhatsApp.
              </Drawer.Description>
            </div>
            <span className="cart-drawer-header-count" aria-live="polite">
              {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}
            </span>
            <Drawer.Close asChild>
              <button className="cart-drawer-close" type="button" aria-label="Cerrar carrito">
                <X size={20} strokeWidth={1} aria-hidden="true" />
              </button>
            </Drawer.Close>
          </header>

          <div className="cart-drawer-body">
            {items.length === 0 ? (
              <div className="cart-empty" role="status">
                <ShoppingCart size={32} strokeWidth={0.9} aria-hidden="true" />
                <p>Tu carrito está vacío.</p>
                <Link to="/shop" onClick={() => onOpenChange(false)}>
                  Explora la tienda <ArrowUpRight size={16} strokeWidth={1} aria-hidden="true" />
                </Link>
              </div>
            ) : (
              <ul className="cart-item-list" aria-label="Artículos en tu carrito" aria-live="polite">
                {items.map((item) => (
                  <li className={`cart-item${item.key === lastAddedKey ? ' is-newly-added' : ''}`} key={item.key}>
                    <CartItemVisual item={item} />
                    <div className="cart-item-copy">
                      <span>{item.type}</span>
                      <h3>{item.name}</h3>
                      <p>{formatCop(item.priceCOP)} COP{item.qty > 1 ? ' / unidad' : ''}</p>
                    </div>
                    <button
                      className="cart-item-remove"
                      type="button"
                      onClick={() => removeItem(item.key)}
                      aria-label={`Eliminar ${item.name} del carrito`}
                    >
                      <Trash2 size={16} strokeWidth={1} aria-hidden="true" />
                    </button>
                    <div className="cart-quantity" aria-label={`Cantidad de ${item.name}`}>
                      <button
                        type="button"
                        onClick={() => updateQty(item.key, item.qty - 1)}
                        aria-label={`Reducir cantidad de ${item.name}`}
                      >
                        <Minus size={15} strokeWidth={1} aria-hidden="true" />
                      </button>
                      <span aria-live="polite">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.key, item.qty + 1)}
                        aria-label={`Aumentar cantidad de ${item.name}`}
                      >
                        <Plus size={15} strokeWidth={1} aria-hidden="true" />
                      </button>
                    </div>
                    <strong className="cart-item-total">{formatCop(item.priceCOP * item.qty)} COP</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {items.length > 0 && (
            <footer className="cart-drawer-footer">
              <div className="cart-total-row">
                <span>SUBTOTAL</span>
                <strong>{formatCop(totalCOP)} COP</strong>
                <small>{formatEurApprox(totalCOP)} · {formatUsdApprox(totalCOP)}</small>
              </div>

              {/* El crédito deja de ser un contador suelto del recorrido: aquí se
                  ve como beneficio del pedido, dicho sin inflar — no se descuenta
                  en el carrito, se canjea en la caja. */}
              {creditEur > 0 && (
                <p className="cart-credit-line">
                  <Sparkles size={15} aria-hidden="true" />
                  <span>
                    Crédito BAYONA guardado en esta visita: {rewards.format(creditEur)}.
                    Se aplica en la caja; el de arriba sigue siendo el precio publicado.
                  </span>
                </p>
              )}

              {/*
                El segundo sello decía "Pago seguro al confirmar", y eso no se
                sostiene: en la web no hay pasarela, no se procesa ningún pago.
                Prometer seguridad de pago donde no hay pago erosiona justo la
                confianza que busca.

                La garantía sí se mantiene: es un compromiso comercial publicado
                en Programs ("GARANTÍA PUBLICADA · 30 DÍAS") y en las cuatro
                páginas de plan. Se usa la misma redacción para que el visitante
                lea lo mismo en todo el recorrido.
              */}
              <div className="cart-trust" aria-label="Garantía y forma de confirmación">
                <span><ShieldCheck size={17} strokeWidth={1} aria-hidden="true" /> {GUARANTEE.summaryValue}</span>
                <span><LockKeyhole size={17} strokeWidth={1} aria-hidden="true" /> Aquí no se procesa ningún pago</span>
              </div>

              <div className="cart-drawer-actions">
                <button className="cart-continue" type="button" onClick={() => onOpenChange(false)}>
                  SEGUIR COMPRANDO
                </button>
                <a
                  className="cart-checkout"
                  href={checkoutUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackWhatsAppClick({
                    source: 'cart_drawer',
                    value: totalCOP,
                  })}
                >
                  FINALIZAR POR WHATSAPP <ArrowUpRight size={17} strokeWidth={1} aria-hidden="true" />
                </a>
              </div>
              <p>Nada se cobra aquí. Confirmamos todo por WhatsApp.</p>
              <button className="cart-clear" type="button" onClick={clear}>VACIAR CARRITO</button>
            </footer>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
