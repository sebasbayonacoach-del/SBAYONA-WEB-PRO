/**
 * BAYONA OS · pantalla TRAINING.
 *
 * Lo que HOY es real: la sesión de ejemplo publicada con su checklist
 * (estado local, no persistido) y el registro de sesión real.
 * Lo que todavía NO existe: programas asignados, ejercicios con series,
 * calendario y progresión. Se declara, no se simula.
 */
import { useState } from 'react'
import { Check, Dumbbell, Flame, Gauge, TimerReset } from 'lucide-react'
import { StateBlock, DataBadge } from '../StateBlock.jsx'
import { ROUTINE_EXAMPLE } from '../../../lib/app-os/progressStore.js'
import { useClientProgram } from '../../../lib/app-os/clientProgram.js'

export function TrainingScreen() {
  const [checked, setChecked] = useState(() => ROUTINE_EXAMPLE.map(() => false))
  const { program } = useClientProgram()
  const done = checked.filter(Boolean).length

  function toggle(index) {
    setChecked((current) => current.map((value, position) => (position === index ? !value : value)))
  }

  return (
    <div className="os-screen">
      <header className="os-screen__head">
        <p className="os-label">ENTRENAMIENTO</p>
        <h1 className="os-screen__title">ENTRENO DE HOY</h1>
        <p className="os-screen__intro">
          Una sesión clara, medible y sin ruido. El cliente ve qué hacer; tú puedes
          estructurar el objetivo, la fase y los ajustes sin convertirlo en una hoja fría.
        </p>
      </header>

      <section className="os-session-brief" aria-label="Brief operativo de entrenamiento">
        <article>
          <TimerReset size={17} strokeWidth={1.5} aria-hidden="true" />
          <span>Duración</span>
          <strong>25–35 min</strong>
        </article>
        <article>
          <Gauge size={17} strokeWidth={1.5} aria-hidden="true" />
          <span>Intensidad</span>
          <strong>controlada</strong>
        </article>
        <article>
          <Dumbbell size={17} strokeWidth={1.5} aria-hidden="true" />
          <span>Bloques</span>
          <strong>{ROUTINE_EXAMPLE.length}</strong>
        </article>
        <article>
          <Flame size={17} strokeWidth={1.5} aria-hidden="true" />
          <span>Estado</span>
          <strong>{done === ROUTINE_EXAMPLE.length ? 'cerrada' : 'activa'}</strong>
        </article>
      </section>

      <section className="os-workout-stage" aria-labelledby="os-workout-stage-title">
        <div className="os-workout-stage__copy">
          <p className="os-label">SESIÓN PROGRAMADA</p>
          <h2 id="os-workout-stage-title">{program.name}</h2>
          <p>{program.coachNote}</p>
        </div>
        <div className="os-workout-blocks" aria-label="Bloques de la sesión">
          {program.sessionBlocks.map((block, index) => (
            <article key={block.id}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{block.label}</strong>
              <small>{block.time}</small>
              <p>{block.goal}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="os-panel" aria-labelledby="os-session-title">
        <div className="os-panel__head">
          <h2 id="os-session-title">CHECKLIST EJECUTABLE · RAÍZ S1 DÍA A</h2>
          <DataBadge tone="concept">Plantilla editable</DataBadge>
        </div>

        <ul className="os-checklist">
          {ROUTINE_EXAMPLE.map((item, index) => (
            <li key={item}>
              <label className={checked[index] ? 'is-done' : ''}>
                <input
                  type="checkbox"
                  checked={checked[index]}
                  onChange={() => toggle(index)}
                />
                <span className="os-checklist__box" aria-hidden="true">
                  {checked[index] ? <Check size={12} strokeWidth={2.4} /> : null}
                </span>
                <span className="os-checklist__text">{item}</span>
              </label>
            </li>
          ))}
        </ul>

        <p className="os-panel__foot" aria-live="polite">
          {done} de {ROUTINE_EXAMPLE.length} bloques marcados
        </p>
      </section>

      <section className="os-panel" aria-labelledby="os-program-title">
        <div className="os-panel__head">
          <h2 id="os-program-title">PROGRAMA ASIGNADO</h2>
          <DataBadge tone="concept" />
        </div>
        <StateBlock
          kind="concept"
          title="Editor de programa pendiente de backend."
          description="La interfaz ya está preparada para fases, semanas, sesiones y ajustes de coach. El siguiente salto es guardar esas asignaciones en base de datos."
        />
      </section>

      <section className="os-panel" aria-labelledby="os-calendar-title">
        <div className="os-panel__head">
          <h2 id="os-calendar-title">CALENDARIO Y EJERCICIOS</h2>
          <DataBadge tone="concept" />
        </div>
        <StateBlock
          kind="concept"
          title="Calendario, biblioteca de ejercicios y series."
          description="Esta capa debe permitirte armar rutinas, progresiones y alternativas por cliente. Hasta conectar datos reales, queda como módulo estructural visible."
        />
      </section>
    </div>
  )
}

export default TrainingScreen
