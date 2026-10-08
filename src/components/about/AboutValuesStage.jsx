/* Los valores no son cuatro pantallas de scroll: son cuatro decisiones de marca
   que el lector puede comparar en una sola composición editorial. */
import '../../styles/about-values-stage.css'

export default function AboutValuesStage({ items = [] }) {
  if (!items.length) return null
  return (
    <div className="about-values-stage">
      <header className="about-values-stage__intro">
        <p>LO QUE NOS DEFINE / 04 PRINCIPIOS</p>
        <h2 id="about-values-title">CUATRO PRINCIPIOS.<span>UNA SOLA DIRECCIÓN.</span></h2>
        <small>No buscamos que dependas de una rutina. Buscamos que comprendas cada paso de tu proceso.</small>
      </header>
      <ol className="about-values-stage__grid" aria-label="Los cuatro principios de BAYONA">
        {items.map(([Icon, title, text], i) => (
          <li key={title} className="about-values-stage__card">
            <div className="about-values-stage__meta"><span>{String(i + 1).padStart(2, '0')} / 04</span><Icon size={27} strokeWidth={1.2} aria-hidden="true" /></div>
            <h3>{title}</h3>
            <p>{text}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
