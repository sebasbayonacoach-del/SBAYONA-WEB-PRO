import { ArrowUpRight, Check, Shirt } from 'lucide-react'
import { clothingDropIds, apparelSourcing } from '../../config/apparelSourcing.js'
import { shopProducts } from '../../config/shopProducts.js'
import { whatsAppLink } from '../../config/site.config.js'
import '../../styles/shop-clothing-drop.css'

const plannedDrop = clothingDropIds
  .map((id) => shopProducts.find((product) => product.id === id))
  .filter(Boolean)

const phases = [
  { number: '01', title: 'ELIGE TU PIEZA', detail: 'Explora seis propuestas. No mostramos existencias ni precios sin confirmar.' },
  { number: '02', title: 'PEDIMOS TU TALLA', detail: 'Confirma el modelo y tu talla antes de decidir una compra.' },
  { number: '03', title: 'VALIDAMOS LA ENTREGA', detail: 'Comprobaremos proveedor, precio final, impuestos y plazo antes de cobrar.' },
]

/** Landing editorial para preparar el drop textil; no inicia pagos ni órdenes. */
export default function ApparelLaunch() {
  return (
    <section id="bayona-ropa" className="bayona-clothing" aria-labelledby="bayona-clothing-title">
      <div className="bayona-clothing__header">
        <div>
          <p className="bayona-clothing__eyebrow"><Shirt size={16} aria-hidden="true" /> BAYONA / DROP 01 / PRELANZAMIENTO</p>
          <h2 id="bayona-clothing-title">EL UNIFORME<br /><em>DEL MOVIMIENTO.</em></h2>
        </div>
        <div className="bayona-clothing__intro">
          <span>PIEZAS CON PROPÓSITO / EDICIÓN 01</span>
          <p>Una colección cápsula para entrenar, moverte y vivir a tu ritmo. Estamos contrastando fabricantes y acabados antes de activar las ventas.</p>
          <a href="#bayona-clothing-pieces">EXPLORAR PRENDAS <ArrowUpRight size={16} aria-hidden="true" /></a>
        </div>
      </div>

      <div id="bayona-clothing-pieces" className="bayona-clothing__grid" aria-label="Seis prendas previstas para el primer lanzamiento">
        {plannedDrop.map((product, index) => (
          <article className="bayona-clothing__piece" key={product.id}>
            <span className="bayona-clothing__piece-index">{String(index + 1).padStart(2, '0')} / 06</span>
            <div className="bayona-clothing__piece-art" aria-hidden="true">
              <span>B.</span>
              <small>{product.collection.toUpperCase()}</small>
            </div>
            <div className="bayona-clothing__piece-info">
              <p>{product.category.toUpperCase()} · EN DESARROLLO</p>
              <h3>{product.name}</h3>
              <span>Diseño y disponibilidad sujetos a validación de muestra.</span>
            </div>
            <a
              href={whatsAppLink(`Hola BAYONA. Me interesa ${product.name} de la futura colección. ¿Podéis informarme sobre tallas, fecha y precio final cuando estén confirmados?`)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Consultar lanzamiento de ${product.name} por WhatsApp`}
              data-clothing-id={product.id}
              data-supplier-state={apparelSourcing[product.id]?.status ?? 'pending'}
            >
              CONSULTAR LANZAMIENTO <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </article>
        ))}
      </div>

      <div className="bayona-clothing__journey" aria-label="Cómo será la compra de ropa BAYONA">
        {phases.map((step) => (
          <div key={step.number}>
            <span>{step.number}</span>
            <strong>{step.title}</strong>
            <p>{step.detail}</p>
          </div>
        ))}
      </div>
      <p className="bayona-clothing__honesty"><Check size={16} aria-hidden="true" />
        Esta selección está en preparación. Esta sección no acepta pagos ni confirma existencias o fechas de envío.
      </p>
    </section>
  )
}
