import { useState } from 'react'
import { ArrowUpRight, ShieldCheck } from 'lucide-react'
import { getSandboxPaymentLink } from '../../config/stripeSandboxCatalog.js'
import { trackEvent } from '../../lib/analytics/analytics.js'
import '../../styles/stripe-sandbox.css'

/** Operator preview; dynamically loaded only under import.meta.env.DEV. */
export default function StripeSandboxPreview({plan,hasExtras=false}){
  const [mode,setMode]=useState('monthly')
  const link=getSandboxPaymentLink(plan?.id,mode)
  const ready=Boolean(link)&&!hasExtras
  return <section className="bayona-stripe-test" aria-labelledby="bayona-stripe-test-title" data-testid="stripe-sandbox-preview">
    <div className="bayona-stripe-test__meta">
      <span className="bayona-stripe-test__mark">STRIPE · SANDBOX</span>
      <span className="bayona-stripe-test__status">PRUEBAS · NO COBROS REALES</span>
    </div>
    <h2 id="bayona-stripe-test-title">Ensaya el pago.</h2>
    <p className="bayona-stripe-test__desc">Compara el recorrido de un cliente sin mover dinero ni activar una membresía.</p>
    <div className="bayona-stripe-test__modes" role="group" aria-label="Modalidad de facturación en Stripe de prueba">
      <label className={mode==='monthly'?'is-selected':''}>
        <input type="radio" name="stripe-test-billing" value="monthly" checked={mode==='monthly'} onChange={()=>setMode('monthly')}/>
        <span><strong>MES A MES</strong><small>Renovación automática</small></span>
      </label>
      <label className={mode==='once'?'is-selected':''}>
        <input type="radio" name="stripe-test-billing" value="once" checked={mode==='once'} onChange={()=>setMode('once')}/>
        <span><strong>UN MES</strong><small>Sin renovación</small></span>
      </label>
    </div>
    <div className="bayona-stripe-test__summary">
      <span>BAYONA {plan.name} · {mode==='monthly'?'al mes':'por un mes'}</span>
      <strong>{plan.priceDisplay} COP</strong>
    </div>
    {hasExtras ? <p role="status" className="bayona-stripe-test__note">Esta prueba cubre solo la membresía. Quita las sesiones y extras para probar este importe exacto; no se cobrarán por separado.</p> : null}
    {ready ?
      <a className="bayona-stripe-test__link" href={link} target="_blank" rel="noopener noreferrer"
         onClick={()=>trackEvent('sandbox_payment_link_opened',{source:'checkout_operator_preview',plan:plan.id,mode})}
         aria-label={`Abrir Stripe de prueba para ${plan.name}, ${mode==='monthly'?'suscripción mensual':'pago único'}`}>
        ABRIR PAGO DE PRUEBA <ArrowUpRight aria-hidden="true" size={19}/>
      </a> :
      <span aria-disabled="true" className="bayona-stripe-test__link bayona-stripe-test__link--disabled">PRUEBA NO DISPONIBLE CON EXTRAS</span>
    }
    <p className="bayona-stripe-test__foot"><ShieldCheck size={16} aria-hidden="true"/> Solo disponible en el servidor de desarrollo. Ningún resultado de Stripe activa servicios ni marca una venta.</p>
  </section>
}
