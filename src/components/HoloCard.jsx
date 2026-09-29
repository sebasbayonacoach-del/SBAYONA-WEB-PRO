import { ArrowUpRight } from 'lucide-react'

export default function HoloCard({ product, featured = false }) {
  const handleMove = (event) => {
    if (event.pointerType === 'touch') return

    const bounds = event.currentTarget.getBoundingClientRect()
    const pointerX = (event.clientX - bounds.left) / bounds.width
    const pointerY = (event.clientY - bounds.top) / bounds.height
    const rotateX = (0.5 - pointerY) * 10
    const rotateY = (pointerX - 0.5) * 12

    event.currentTarget.style.setProperty('--holo-rotate-x', `${rotateX.toFixed(2)}deg`)
    event.currentTarget.style.setProperty('--holo-rotate-y', `${rotateY.toFixed(2)}deg`)
    event.currentTarget.style.setProperty('--spot-x', `${pointerX * 100}%`)
    event.currentTarget.style.setProperty('--spot-y', `${pointerY * 100}%`)
  }

  const reset = (event) => {
    event.currentTarget.style.setProperty('--holo-rotate-x', '0deg')
    event.currentTarget.style.setProperty('--holo-rotate-y', '0deg')
    event.currentTarget.style.setProperty('--spot-x', '50%')
    event.currentTarget.style.setProperty('--spot-y', '0%')
  }

  return (
    <div
      className={`holo-wrap${featured ? ' is-featured' : ''}`}
      onPointerMove={handleMove}
      onPointerLeave={reset}
    >
      <article className="holo-card" data-product-id={product.id}>
        <div className="holo-image" aria-hidden="true">
          <span className="holo-type">{product.type}</span>
          <span className="holo-emoji">{product.emoji}</span>
          <span className="holo-monogram">B</span>
          <span className="holo-grid" />
        </div>
        <div className="holo-spotlight" aria-hidden="true" />
        {!featured && (
          <div className="holo-copy">
            <p className="holo-collection">{product.collection} Collection</p>
            <h3>{product.name}</h3>
            <p className="holo-description">{product.description}</p>
            <div className="holo-purchase">
              <strong>{product.priceDisplay}</strong>
              <a
                href={product.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                data-shop-product={product.id}
                aria-label={`Lo quiero: ${product.name}, ${product.priceDisplay}`}
              >
                LO QUIERO <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </div>
          </div>
        )}
      </article>
    </div>
  )
}
