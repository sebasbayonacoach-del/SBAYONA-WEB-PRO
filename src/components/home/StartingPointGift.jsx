import { useState } from 'react'
import { Download, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import DossierMockup from './DossierMockup.jsx'

export default function StartingPointGift() {
  const [goal, setGoal] = useState('')
  const [days, setDays] = useState('')
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  function submit(event) {
    event.preventDefault()
    if (!goal || !days) { setError('Elige tu objetivo y los días que podrías reservar.'); event.currentTarget.querySelector(`input[name="${!goal ? 'gift-goal' : 'gift-days'}"]`)?.focus(); return }
    setError(''); setReady(true)
  }
  return (
    <div className="journey-gift-layout">
      <DossierMockup title="Tu punto de partida." subtitle="UN CUADERNO PARA CONOCERTE MEJOR" image="/images/bayona-generated/home-proof-1600.webp" />
      <div className="journey-gift-panel">
        <p>Dos decisiones pequeñas. Un siguiente paso más claro. Completa este punto de partida y llévate el dossier para seguir pensándolo con calma.</p>
        <form onSubmit={submit} noValidate className="journey-gift-form">
          <fieldset><legend>¿Qué quieres construir?</legend>{['Volver a la constancia', 'Entrenar con más fuerza', 'Ordenar mi semana'].map(value => <label key={value} className={goal === value ? 'is-selected' : ''}><input type="radio" name="gift-goal" value={value} checked={goal === value} onChange={() => { setGoal(value); setReady(false) }} />{value}</label>)}</fieldset>
          <fieldset><legend>¿Cuántos días puedes reservar?</legend><div className="journey-gift-days">{['2 días', '3 días', '4 o más'].map(value => <label key={value} className={days === value ? 'is-selected' : ''}><input type="radio" name="gift-days" value={value} checked={days === value} onChange={() => { setDays(value); setReady(false) }} />{value}</label>)}</div></fieldset>
          {error && <p role="alert" id="gift-error">{error}</p>}
          <button type="submit" aria-describedby="gift-privacy">Preparar mi punto de partida <ArrowUpRight size={18} /></button>
          <p id="gift-privacy" className="journey-label">TUS RESPUESTAS SOLO VIVEN EN ESTA PÁGINA. NO SE ENVÍAN NI SE GUARDAN.</p>
        </form>
        {ready && <div className="journey-gift-ready" role="status"><p>Tu intención: {goal.toLowerCase()}. Tu espacio: {days.toLowerCase()} por semana. Anótalo en tu dossier y úsalo para preparar la primera conversación.</p><a href="/downloads/bayona-editorial/dossier-punto-de-partida.pdf" download><Download size={18} />Descargar mi dossier de inicio</a></div>}
        <div className="final-doors"><Link to="/onboarding" className="cta-primary">Continuar con mi recorrido <ArrowUpRight size={18} /></Link><Link to="/programs" className="cta-secondary">Comparar programas <ArrowUpRight size={18} /></Link></div>
        <a className="journey-gift-bypass" href="/downloads/bayona-editorial/dossier-punto-de-partida.pdf" download>También puedes descargarlo directamente.</a>
      </div>
    </div>
  )
}
