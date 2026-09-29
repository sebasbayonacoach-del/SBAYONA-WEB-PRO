/**
 * BAYONA OS · gráfica de tendencia en SVG propio (sin librería de charts).
 *
 * Decisión: el proyecto no tiene ninguna librería de gráficas y añadir una
 * costaría peso en la ruta. Para 14 días de conteos reales, un `path` en
 * SVG es exacto y cuesta cero KB.
 *
 * Sin datos NO dibuja una línea plana a cero (eso insinuaría lectura):
 * el componente padre decide enseñar su estado vacío.
 */
export function TrendChart({ series = [], label = 'Actividad', height = 84 }) {
  const points = Array.isArray(series) ? series : []
  /** Conteo válido o 0. `Number()` devuelve NaN, no null: hay que validarlo. */
  const countOf = (item) => {
    const value = Number(item?.count)
    return Number.isFinite(value) && value > 0 ? value : 0
  }

  const max = points.reduce((acc, item) => Math.max(acc, countOf(item)), 0)
  const total = points.reduce((acc, item) => acc + countOf(item), 0)
  const width = 300
  const safeMax = max > 0 ? max : 1
  const step = points.length > 1 ? width / (points.length - 1) : width

  const coords = points.map((item, index) => {
    const x = index * step
    const y = height - (countOf(item) / safeMax) * (height - 12) - 6
    return { x, y, count: countOf(item), date: item?.date }
  })

  const line = coords.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ')
  const area = coords.length > 0
    ? `M0,${height} L${line.replace(/ /g, ' L')} L${width},${height} Z`
    : ''

  return (
    <svg
      className="os-chart"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={`${label}: ${total} registros en los últimos ${points.length} días. Máximo diario: ${max}.`}
    >
      <title>{`${label} — ${total} registros en ${points.length} días`}</title>
      <line className="os-chart__base" x1="0" y1={height - 0.5} x2={width} y2={height - 0.5} />
      {max > 0 ? <path className="os-chart__area" d={area} /> : null}
      {max > 0 ? <polyline className="os-chart__line" points={line} /> : null}
      {coords.filter((point) => point.count > 0).map((point) => (
        <circle key={point.date} className="os-chart__dot" cx={point.x} cy={point.y} r="2.4" />
      ))}
    </svg>
  )
}

export default TrendChart