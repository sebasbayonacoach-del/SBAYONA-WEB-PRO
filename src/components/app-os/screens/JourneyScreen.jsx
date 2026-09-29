/**
 * BAYONA OS · pantalla JOURNEY.
 *
 * Línea de tiempo construida SOLO con hitos reales derivados de los
 * registros (primera sesión, última, total). Sin registros no hay hitos: se
 * enseña el arranque del camino, no un progreso inventado.
 */
import { Link } from 'react-router-dom'
import { DataBadge, StateBlock } from '../StateBlock.jsx'

export function JourneyScreen({ data }) {
  const { milestones, hasCloudRows, logs } = data

  return (
    <div className="os-screen">
      <header className="os-screen__head">
        <p className="os-label">CAMINO</p>
        <h1 className="os-screen__title">TU CAMINO</h1>
        <p className="os-screen__intro">
          El proceso visto como recorrido: señales, hitos y próximos pasos con sentido.
        </p>
      </header>

      {hasCloudRows ? (
        <section className="os-panel" aria-labelledby="os-timeline-title">
          <div className="os-panel__head">
            <h2 id="os-timeline-title">HITOS REGISTRADOS</h2>
            <DataBadge tone="derived" />
          </div>
          <ol className="os-timeline">
            {milestones.map((item) => (
              <li key={item.id}>
                <span className="os-timeline__node" aria-hidden="true" />
                <p className="os-timeline__label">{item.label}</p>
                <p className="os-timeline__value">{item.detail}</p>
              </li>
            ))}
          </ol>
          <p className="os-panel__foot">
            Derivado de tus {logs.length} {logs.length === 1 ? 'registro' : 'registros'} reales de sesión.
          </p>
        </section>
      ) : (
        <StateBlock
          kind="empty"
          title="TU CAMINO EMPIEZA AQUÍ"
          description="Todavía no hay hitos. Se construirán con tus sesiones registradas, no con estimaciones."
          action={<Link className="os-link" to="/app">Ir al panel de hoy</Link>}
        />
      )}

      <section className="os-panel" aria-labelledby="os-journey-steps">
        <div className="os-panel__head">
          <h2 id="os-journey-steps">PRÓXIMOS PASOS DEL RECORRIDO</h2>
          <DataBadge tone="concept" />
        </div>
        <ol className="os-steps">
          <li><span>01</span> PERFIL: objetivo, punto de partida y disponibilidad.</li>
          <li><span>02</span> PROGRAMA: fase, semanas y sesiones asignadas.</li>
          <li><span>03</span> PRIMERA SESIÓN: registro real que abre el historial.</li>
        </ol>
        <p className="os-panel__foot">
          La experiencia está preparada para estos pasos. Se activan cuando existe
          una asignación real por parte de tu entrenador.
        </p>
      </section>
    </div>
  )
}

export default JourneyScreen
