import { ArrowUpRight, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MOVEMENT_CONTEXTS } from '../../data/adaptedMovement.js'
import '../../styles/home-everything-visible.css'

/**
 * Portada: las 12 familias quedan a la vista y se evitan 104 líneas de texto.
 * Catálogo completo en /movimiento-adaptado, accesible voluntariamente.
 */
export default function HomeMovementContexts() {
  return (
    <section className="bayona-home-contexts bayona-home-contexts--focused" id="movimiento-adaptado" aria-labelledby="bayona-home-contexts-heading">
      <div className="gym-home-shell">
        <div className="bayona-home-contexts__intro">
          <div>
            <span className="bayona-home-contexts__eyebrow">MOVIMIENTO ADAPTADO / 12 ÁREAS</span>
            <h2 id="bayona-home-contexts-heading">TU PUNTO DE PARTIDA <em>IMPORTA.</em></h2>
          </div>
          <div className="bayona-home-contexts__side">
            <p>¿Dolor, lesión o alguna condición de salud? El movimiento necesita adaptarse a cada situación, no al revés.</p>
            <span>Siempre dentro de los límites profesionales correspondientes.</span>
          </div>
        </div>
        <div className="bayona-home-contexts__grid" aria-label="Áreas en las que puede ser importante adaptar el ejercicio">
          {MOVEMENT_CONTEXTS.map(group => (
            <article className="bayona-home-contexts__group" key={group.id}>
              <span className="bayona-home-contexts__index">{group.icon} / 12</span>
              <h3>{group.name}</h3>
              <ul>{group.examples.slice(0, 3).map(example => <li key={example}>{example}</li>)}</ul>
              {group.examples.length > 3 && <small>Y otras {group.examples.length - 3} situaciones</small>}
            </article>
          ))}
        </div>
        <div className="bayona-home-contexts__scope" role="note">
          <ShieldCheck size={22} aria-hidden="true"/>
          <div>
            <strong>ENTRENAR CON CRITERIO.</strong>
            <p>BAYONA ofrece entrenamiento, no diagnóstico ni tratamiento. Las contraindicaciones, la aptitud para entrenar y la necesidad de supervisión requieren valoración sanitaria cuando corresponda. No pedimos información médica para navegar.</p>
            <Link to="/movimiento-adaptado">Conocer los 104 ejemplos y los límites del servicio <ArrowUpRight size={17} aria-hidden="true"/></Link>
          </div>
        </div>
      </div>
    </section>
  )
}
