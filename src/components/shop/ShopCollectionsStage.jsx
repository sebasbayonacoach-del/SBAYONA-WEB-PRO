import { motion, useTransform } from 'framer-motion'
import { ArrowDownRight } from 'lucide-react'
import { StickyStage } from '../../engine/scroll/StickyStage.jsx'
import { useCapabilities } from '../../engine/hooks/useCapabilities.js'
import '../../styles/shop-collections-stage.css'

function MovingBackdrop({ progress }) {
  const scale = useTransform(progress, [0, 1], [1.08, 1.02])
  const x = useTransform(progress, [0, 1], ['-1.5%', '1.5%'])
  return (
    <motion.div
      className="shop-collection-stage__backdrop"
      style={{ scale, x }}
      aria-hidden="true"
    />
  )
}

function CollectionFrame({ collection, index, total, progress, isStatic, onSelect }) {

  return (
    <div className="shop-collection-stage__frame">
      <div className="shop-collection-stage__media" aria-hidden="true">
        {isStatic ? (
          <div className="shop-collection-stage__backdrop" />
        ) : (
          <MovingBackdrop progress={progress} />
        )}
        <div className="shop-collection-stage__scrim" />
      </div>

      <div className="shop-collection-stage__meta" aria-hidden="true">
        <span>COLECCIÓN {collection.number}</span>
        <span>{String(total).padStart(2,'0')} UNIVERSOS</span>
      </div>

      <motion.div
        className="shop-collection-stage__copy"
        key={collection.id}
        initial={isStatic ? false : { opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .52, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      >
        <p>{collection.name}</p>
        <h3>{collection.statement}</h3>
        <span>{collection.fullStatement}</span>
        <button
          type="button"
          onClick={() => onSelect(collection.id)}
        >
          EXPLORAR {collection.name.toUpperCase()}
          <ArrowDownRight size={17} strokeWidth={1.2} />
        </button>
      </motion.div>

      <div className="shop-collection-stage__rail" aria-hidden="true">
        {Array.from({ length: total }, (_, step) => (
          <span key={step} data-active={step === index ? 'true' : undefined}>
            {String(step + 1).padStart(2,'0')}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function ShopCollectionsStage({ collections = [], onSelect }) {
  const { mode } = useCapabilities()
  if (!collections.length) return null

  const length = mode === 'desktop' ? '360vh' : '300vh'

  return (
    <div className="shop-collection-stage">
      <header className="shop-collection-stage__intro">
        <p>COMPRA GUIADA</p>
        <h2 id="shop-collections-title">ELIGE POR USO.<span>NO POR IMPULSO.</span></h2>
        <small>Cada colección responde a una necesidad: empezar, moverte mejor, ganar fuerza o recuperar.</small>
      </header>

      <ol className="sr-only" aria-label="Colecciones BAYONA">
        {collections.map((collection) => (
          <li key={collection.id}>
            <h3>{collection.title}</h3>
            <p>{collection.fullStatement}</p>
            <button type="button" onClick={() => onSelect(collection.id)}>
              Explorar {collection.name}
            </button>
          </li>
        ))}
      </ol>

      <StickyStage
        length={length}
        states={collections.length}
        topOffset={66}
        allowMobile
        className="shop-collection-stage__sticky"
      >
        {({ index, progress, isStatic }) => (
          <CollectionFrame
            collection={collections[index] ?? collections[0]}
            index={index}
            total={collections.length}
            progress={progress}
            isStatic={isStatic}
            onSelect={onSelect}
          />
        )}
      </StickyStage>
    </div>
  )
}
