/**
 * BAYONA OS · indicador radial de progreso (SVG propio, sin librerías).
 *
 * Se usa como instrumento, no como adorno: siempre acompaña a una etiqueta
 * y a una nota de procedencia. Con `value == null` (sin dato) NO dibuja un
 * 0 % engañoso: dibuja el aro vacío y lo declara.
 */
export function ProgressRing({
  value = null,
  max = 100,
  label = '',
  note = '',
  size = 148,
  stroke = 6,
}) {
  const hasValue = Number.isFinite(value)
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100
  const ratio = hasValue ? Math.min(Math.max(value / safeMax, 0), 1) : 0
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const dash = circumference * ratio
  const display = hasValue ? `${Math.round(ratio * 100)}%` : '—'

  return (
    <figure className={`os-ring${hasValue ? '' : ' os-ring--empty'}`} style={{ width: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={hasValue
          ? `${label || 'Progreso'}: ${display}${note ? `. ${note}` : ''}`
          : `${label || 'Progreso'}: sin datos suficientes todavía`}
      >
        <circle
          className="os-ring__track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
        />
        <circle
          className="os-ring__value"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="butt"
          strokeDasharray={`${dash} ${circumference - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <figcaption className="os-ring__caption">
        <span className="os-ring__value-text">{display}</span>
        {label ? <span className="os-ring__label">{label}</span> : null}
        {note ? <span className="os-ring__note">{note}</span> : null}
      </figcaption>
    </figure>
  )
}

export default ProgressRing