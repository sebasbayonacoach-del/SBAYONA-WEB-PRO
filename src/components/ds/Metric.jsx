// DS/Metric - dato numérico con etiqueta (Fase 3).
//
// Valor en DM Mono (lectura de "dato", números tabulares) y etiqueta
// técnica en microcopia. Para precios, métricas y cifras de prueba social.

/**
 * @param {{
 *   value: import('react').ReactNode,
 *   label: import('react').ReactNode,
 *   className?: string,
 * }} props
 */
export function Metric({ value, label, className = '' }) {
  return (
    <div className={`ds-metric${className ? ` ${className}` : ''}`}>
      <span className="ds-numeric">{value}</span>
      <span className="ds-metric__label">{label}</span>
    </div>
  )
}
