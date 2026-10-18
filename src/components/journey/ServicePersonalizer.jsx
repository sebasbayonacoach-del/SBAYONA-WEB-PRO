import { GOAL_OVERVIEW } from '../../data/goalOverview.js'
import '../../styles/journey-guide.css'

/**
 * No conditional recommendations and no required clicks:
 * every visitor sees every route to a relevant service.
 */
export default function ServicePersonalizer() {
  return (
    <section className="bayona-services-conversation bayona-services-conversation--open" aria-labelledby="bayona-conversation-title">
      <div className="bayona-services-conversation__prompt">
        <span className="bayona-services-conversation__number">BAYONA / PENSADO PARA PERSONAS REALES</span>
        <h3 id="bayona-conversation-title">SEGÚN TU OBJETIVO, <em>ESTE PUEDE SER TU CAMINO.</em></h3>
        <p>Cinco situaciones habituales y una forma de acompañamiento para cada una. Todo a la vista, sin cuestionarios ni pasos escondidos.</p>
        <p className="bayona-services-conversation__privacy">Orientación general, no una valoración individual ni un diagnóstico.</p>
      </div>
      <div className="bayona-services-conversation__overview" aria-label="Todas las opciones y posibles caminos">
        {GOAL_OVERVIEW.map(item=>(
          <div className="bayona-services-conversation__match" key={item.id}>
            <div>
              <span className="bayona-services-conversation__match-goal">{item.label}</span>
              <p>{item.explanation}</p>
            </div>
            <span className="bayona-services-conversation__match-service">
              <small>PUEDES EXPLORAR</small>
              <strong>{item.service}</strong>
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
