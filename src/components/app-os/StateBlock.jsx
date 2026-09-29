/**
 * BAYONA OS · estados y procedencia del dato.
 *
 * Cada bloque del panel declara de dónde sale lo que enseña. Esto no es
 * decoración: es el contrato de honestidad del producto. Un bloque sin dato
 * NUNCA se rellena con un número: se pinta su estado vacío.
 */
import { AlertTriangle, CircleDashed, Loader2, Sparkles, WifiOff } from 'lucide-react'

const TONES = Object.freeze({
  real: { label: 'Dato real', icon: Sparkles },
  derived: { label: 'Calculado', icon: Sparkles },
  empty: { label: 'Sin datos todavía', icon: CircleDashed },
  concept: { label: 'En preparación', icon: CircleDashed },
  offline: { label: 'Sin conexión', icon: WifiOff },
})

export function DataBadge({ tone = 'empty', children }) {
  const config = TONES[tone] ?? TONES.empty
  const Icon = config.icon
  return (
    <span className={`os-badge os-badge--${tone}`}>
      <Icon size={11} strokeWidth={1.6} aria-hidden="true" />
      {children ?? config.label}
    </span>
  )
}

/**
 * Estado de un bloque. `kind`:
 *  · loading · vacío legítimo (`empty`) · error recuperable · `concept`
 *    (la función existe en arquitectura pero aún no tiene datos ni backend).
 */
export function StateBlock({ kind = 'empty', title, description, action }) {
  const isLoading = kind === 'loading'
  const isError = kind === 'error'
  return (
    <div className={`os-state os-state--${kind}`} role={isError ? 'alert' : 'status'}>
      {isLoading
        ? <Loader2 size={18} strokeWidth={1.5} aria-hidden="true" className="os-state__spin" />
        : isError
          ? <AlertTriangle size={18} strokeWidth={1.5} aria-hidden="true" />
          : <CircleDashed size={18} strokeWidth={1.5} aria-hidden="true" />}
      <p className="os-state__title">{title}</p>
      {description ? <p className="os-state__copy">{description}</p> : null}
      {action ? <div className="os-state__action">{action}</div> : null}
    </div>
  )
}

export default StateBlock