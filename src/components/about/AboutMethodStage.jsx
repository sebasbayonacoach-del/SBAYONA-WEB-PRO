/* El método se puede entender de un vistazo: tres decisiones, sin un escenario
   sticky por paso. Cada fase es visible, semántica y navegable en móvil. */
import '../../styles/about-method-stage.css'

export default function AboutMethodStage({ items = [] }) {
  if (!items.length) return null
  return (
    <div className="about-decision-stage">
      <ol className="about-decision-stage__steps" aria-label="Las tres decisiones del método BAYONA">
        {items.map((item, index) => (
          <li className="about-decision-stage__step" key={item.number}>
            <span className="about-decision-stage__index">{item.number} / {String(items.length).padStart(2,'0')}</span>
            <span className="about-decision-stage__line" aria-hidden="true"><span /></span>
            <h3>{item.title}</h3>
            <p>{item.copy}</p>
            <span className="about-decision-stage__watermark" aria-hidden="true">{String(index + 1).padStart(2,'0')}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
