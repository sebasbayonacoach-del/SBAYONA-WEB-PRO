/**
 * BAYONA · REGALO ESCONDIDO (comentario 13 del 22-09)
 * ---------------------------------------------------------------------------
 * «Deja [regalos] a lo largo de la página web… déjalos como escondidos para que
 * la persona los encuentre… tiene que ganarse los regalos haciendo clic en los
 * regalos que están por ahí regados. Si no le dio clic, pues no los encontró.
 * Pero no debe sumarse automáticamente» (anotaciones 13 y 23).
 *
 * Este componente es ESE clic. Un disco pequeño, plantado dentro de una
 * sección, que no habla hasta que alguien lo pulsa. Al pulsarlo hace las dos
 * cosas en orden: registrar el hallazgo (`discover`) y reclamarlo (`claimSeal`).
 * Nunca cobra solo: si el visitante no lo ve, el sello no existe en su pase.
 *
 * Los importes bajos y sueltos: el brief avisa de no convertir esto en un
 * casino (§12). Y el valor sigue siendo CRÉDITO BAYONA, una cortesía para el
 * plan, no dinero.
 *
 * Colocación: se posiciona en absoluto, así que la sección que lo monte tiene
 * que ser `position: relative`. Donde no hay sitio, se puede poner
 * `static` con la clase `seal-gift--static`.
 */

import { useState } from 'react'
import { Gift } from 'lucide-react'
import { useRewards } from '../../lib/rewards/RewardsProvider.jsx'
import '../../styles/rewards.css'

export default function HiddenSealGift({ id, label, eur = 3, className = '', style }) {
  const { discover, claimSeal, stateOf, format } = useRewards()
  const [aviso, setAviso] = useState('')

  const estado = stateOf(id)
  const guardado = estado === 'Reclamado' || estado === 'Usado'

  function recoger() {
    discover({ id, label, eur })
    /*
      El reclamo se hace sobre lo que ACABA de descubrirse. `claimSeal` ignora
      cualquier id que no esté en la lista de hallazgos, así que no hay forma de
      cobrar un sello que no se encontró.
    */
    claimSeal(id)
    setAviso(`${label} · ${format(eur)} guardados en tu pase`)
  }

  if (guardado) {
    return (
      <>
        <p className={`seal-gift seal-gift--done${className ? ` ${className}` : ''}`} style={style}>
          <Gift size={13} strokeWidth={1.6} aria-hidden="true" />
          {estado === 'Usado' ? 'CANJEADO' : 'GUARDADO'} · {label}
        </p>
        {aviso !== '' && (
          <span className="seal-gift__toast" role="status">
            {aviso}
          </span>
        )}
      </>
    )
  }

  return (
    <span className={`seal-gift-wrap${className ? ` ${className}` : ''}`} style={style}>
      <button
        type="button"
        className="seal-gift"
        onClick={recoger}
        aria-label={`Regalo escondido: recoger ${label} y guardarlo en tu pase BAYONA`}
      >
        <Gift size={13} strokeWidth={1.6} aria-hidden="true" />
      </button>
      {aviso !== '' && (
        <span className="seal-gift__toast" role="status">
          {aviso}
        </span>
      )}
    </span>
  )
}
