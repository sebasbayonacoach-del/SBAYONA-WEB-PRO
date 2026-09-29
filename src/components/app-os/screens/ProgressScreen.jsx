/**
 * BAYONA OS · pantalla PROGRESS.
 *
 * Solo cuenta lo que se puede contar. No hay «% de cumplimiento» porque no
 * existe plan planificado contra el que medir, y no hay «volumen de carga»
 * porque no hay series ni pesos registrados. Lo que sí hay: sesiones
 * registradas con su fecha real.
 */
import { DataBadge, StateBlock } from '../StateBlock.jsx'
import { TrendChart } from '../TrendChart.jsx'

export function ProgressScreen({ data }) {
  const { daily, hasCloudRows, week, streak, logs, cloud } = data
  const total14 = daily.reduce((acc, item) => acc + item.count, 0)
  const activeDays14 = daily.filter((item) => item.count > 0).length

  if (!hasCloudRows) {
    return (
      <div className="os-screen">
        <header className="os-screen__head">
          <p className="os-label">PROGRESO</p>
          <h1 className="os-screen__title">PROGRESO REAL</h1>
        </header>
        <StateBlock
          kind={cloud.error ? 'error' : 'empty'}
          title={cloud.error ? 'No pudimos leer tu historial.' : 'SIN DATOS DE ENTRENAMIENTO TODAVÍA'}
          description={cloud.error
            ? 'El registro local de este dispositivo sigue intacto. Prueba de nuevo más tarde.'
            : 'Tu primera sesión registrada aparecerá aquí convertida en lectura semanal. Sin datos reales no dibujamos gráficas decorativas.'}
        />
        <section className="os-panel" aria-labelledby="os-planned-metrics">
          <div className="os-panel__head">
            <h2 id="os-planned-metrics">MÉTRICAS PREVISTAS</h2>
            <DataBadge tone="concept" />
          </div>
          <p className="os-panel__intro">
            El panel está preparado para estas lecturas. Se activarán cuando
            exista el dato real que las sostiene:
          </p>
          <ul className="os-plain-list">
            <li>Sesiones por semana y mes (requiere registro de sesiones).</li>
            <li>Días activos y racha (derivable del registro anterior).</li>
            <li>Cumplimiento del programa (requiere programa asignado).</li>
            <li>Movilidad y fuerza (requiere registro por ejercicio).</li>
          </ul>
        </section>
      </div>
    )
  }

  return (
    <div className="os-screen">
      <header className="os-screen__head">
        <p className="os-label">PROGRESO</p>
          <h1 className="os-screen__title">PROGRESO REAL</h1>
        <p className="os-screen__intro">
          Lectura de tus {logs.length} {logs.length === 1 ? 'registro' : 'registros'} de sesión.
        </p>
      </header>

      <section className="os-panel os-panel--chart" aria-labelledby="os-trend-title">
        <div className="os-panel__head">
          <h2 id="os-trend-title">ÚLTIMOS 14 DÍAS</h2>
          <DataBadge tone="derived" />
        </div>
        <p className="os-chart__value">
          <strong>{total14}</strong> {total14 === 1 ? 'sesión' : 'sesiones'} · {activeDays14} {activeDays14 === 1 ? 'día activo' : 'días activos'}
        </p>
        <TrendChart series={daily} label="Sesiones registradas" />
        <p className="os-panel__foot">Sesiones marcadas con su fecha real. No incluye datos de salud.</p>
      </section>

      <section className="os-metrics" aria-label="Métricas reales">
        <article className="os-metric">
          <p className="os-metric__label">SESIONES ESTA SEMANA</p>
          <p className="os-metric__value">{week.sessions}</p>
          <DataBadge tone="real" />
        </article>
        <article className="os-metric">
          <p className="os-metric__label">DÍAS ACTIVOS ESTA SEMANA</p>
          <p className="os-metric__value">{week.activeDays}</p>
          <DataBadge tone="derived" />
        </article>
        <article className="os-metric">
          <p className="os-metric__label">RACHA ACTUAL</p>
          <p className="os-metric__value">{streak}</p>
          <DataBadge tone="derived" />
        </article>
      </section>

      <section className="os-panel" aria-labelledby="os-planned-metrics-2">
        <div className="os-panel__head">
          <h2 id="os-planned-metrics-2">AÚN NO DISPONIBLE</h2>
          <DataBadge tone="concept" />
        </div>
        <ul className="os-plain-list">
          <li>Cumplimiento del programa: requiere un programa asignado.</li>
          <li>Movilidad, fuerza y volumen: requieren registro por ejercicio.</li>
          <li>Constancia por hábitos: requiere registrar sueño, movilidad y recuperación.</li>
        </ul>
      </section>
    </div>
  )
}

export default ProgressScreen
