const JOURNEY_SCENES = Object.freeze([
  Object.freeze({ id: 'threshold', label: 'EL UMBRAL' }),
  Object.freeze({ id: 'welcome', label: 'BIENVENIDA' }),
  Object.freeze({ id: 'visit', label: 'TU VISITA' }),
  Object.freeze({ id: 'pass', label: 'TU PASE' }),
  Object.freeze({ id: 'questions', label: '3 PREGUNTAS' }),
  Object.freeze({ id: 'route', label: 'TU CAMINO' }),
  Object.freeze({ id: 'exit', label: 'ENTRAR' }),
])

const TAGLINE = 'BAYONA · MOVIMIENTO · CIENCIA · PROPÓSITO HUMANO'

export default function UmbralJourney({ currentScene }) {
  const currentIndex = Math.max(0, JOURNEY_SCENES.findIndex((scene) => scene.id === currentScene))

  return (
    <div className="umbral-closing-chrome">
      <div className="umbral-marquee" role="region" aria-label={TAGLINE}>
        <span className="umbral-visually-hidden">{TAGLINE}</span>
        <div className="umbral-marquee__track" aria-hidden="true">
          {[0, 1].map((group) => (
            <div className="umbral-marquee__group" key={group}>
              {[0, 1, 2, 3].map((item) => <span key={item}>{TAGLINE}</span>)}
            </div>
          ))}
        </div>
      </div>

      <nav className="umbral-journey" aria-label="Recorrido de ingreso BAYONA">
        <div className="umbral-journey__heading">
          <span>RECORRIDO DE INGRESO</span>
          <strong>DESCUBRIR → CONFIAR → ELEGIR → ENTRAR</strong>
        </div>
        <ol>
          {JOURNEY_SCENES.map((scene, index) => {
            const state = index === currentIndex ? 'current' : index < currentIndex ? 'complete' : 'pending'
            return (
              <li className={`is-${state}`} key={scene.id} aria-current={state === 'current' ? 'step' : undefined}>
                <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <strong>{scene.label}</strong>
              </li>
            )
          })}
        </ol>
      </nav>
    </div>
  )
}
