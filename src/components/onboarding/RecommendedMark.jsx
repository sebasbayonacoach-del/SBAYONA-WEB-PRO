/**
 * BAYONA · MARCA DE PLAN RECOMENDADO
 * ---------------------------------------------------------------------------
 * Se pinta sobre el plan que la recepción sugirió a esta persona concreta.
 *
 * No es un "destacado" comercial: FUERZA ya es el plan destacado para todo el
 * mundo (`featured: true` en offerings.js). Esto es distinto, y por eso se
 * distingue visualmente: dice "esto es lo que respondiste que necesitas".
 *
 * No renderiza nada si quien mira no ha pasado por recepción, así que el plan
 * se ve exactamente igual que antes para una visita anónima.
 */

import { Compass } from 'lucide-react'
import { useRecommendedPlanId } from '../../lib/onboarding/VisitorJourneyProvider.jsx'

export default function RecommendedMark({ planId, className = '' }) {
  const recommendedPlanId = useRecommendedPlanId()

  if (!recommendedPlanId || String(planId).toUpperCase() !== recommendedPlanId) return null

  return (
    <p className={`recommended-mark ${className}`.trim()}>
      <Compass size={13} strokeWidth={1.5} aria-hidden="true" />
      <span>TU RECEPCIÓN SUGIRIÓ ESTE</span>
    </p>
  )
}
