import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { ArrowDownRight, ArrowUpRight, Check, RotateCcw, Sparkles } from 'lucide-react'
import { bookingLink } from '../../config/site.config.js'
import { getMomentPrompt, MOMENT_PROMPTS } from '../../data/journeyMoments.js'
import { useJourneyExperience } from './JourneyExperienceContext.jsx'
import '../../styles/bayona-moments.css'

function SectionMoment({ moment, index, total, isFinal }) {
  const { goal, preferences, choosePreference, clearAll } = useJourneyExperience()
  const selected = preferences[moment.key] || null
  const completed = Object.keys(preferences).length
  const lastPreference = Object.entries(preferences).filter(([key]) => key !== moment.key).at(-1)?.[1]
  const message = [
    'Hola BAYONA, quiero hablar sobre las opciones de entrenamiento.',
    goal ? 'Mi objetivo general es: ' + goal.label + '.' : '',
    ...Object.entries(preferences).slice(0, 5).map(([key, answer]) => key + ': ' + answer + '.'),
    '¿Podemos conversar para conocer las opciones?',
  ].filter(Boolean).join(' ')
  const link = bookingLink(message)
  return (
    <div className="bayona-moment" data-moment-key={moment.key} aria-label={'Tu decisión en esta sección: ' + moment.title}>
      <div className="bayona-moment__header">
        <span className="bayona-moment__symbol"><Sparkles size={18} aria-hidden="true"/></span>
        <span>UN MOMENTO PARA TI</span>
        <small>{String(index + 1).padStart(2,'0')} / {String(total).padStart(2,'0')}</small>
      </div>
      <div className="bayona-moment__content">
        <div>
          <h3>{moment.title}</h3>
          <p>{moment.detail || 'Puedes elegir o simplemente seguir explorando.'}</p>
        </div>
        <div className="bayona-moment__answers">
          {moment.options.map(option => (
            <button type="button" key={option} aria-pressed={selected === option}
              className={selected === option ? 'is-selected' : ''}
              onClick={() => choosePreference(moment.key, option)}>
              {selected === option ? <Check size={15} aria-hidden="true"/> : null}{option}
            </button>
          ))}
        </div>
      </div>
      {lastPreference && !selected ? <p className="bayona-moment__memory">YA HEMOS TENIDO EN CUENTA: <strong>{lastPreference}</strong></p> : null}
      <div className="bayona-moment__end">
        <span role="status" aria-live="polite">
          {selected ? 'TOMADO EN CUENTA: ' + selected : 'SIN RESPUESTA OBLIGATORIA'}
          <span className="bayona-moment__count"> · {completed} {completed === 1 ? 'preferencia' : 'preferencias'} durante esta visita</span>
        </span>
        <div>
          {completed > 0 && <button type="button" className="bayona-moment__reset" onClick={clearAll}>
            <RotateCcw size={13} aria-hidden="true"/> Borrar elecciones
          </button>}
          {isFinal
            ? <a href={link} target="_blank" rel="noopener noreferrer">
              ABRIR WHATSAPP CON MI RESUMEN <ArrowUpRight size={16} aria-hidden="true"/>
            </a>
            : <span className="bayona-moment__continue">SIGUE EXPLORANDO <ArrowDownRight size={16} aria-hidden="true"/></span>}
        </div>
      </div>
    </div>
  )
}

/**
 * Introduce una microdecisión al cierre de cada sección editorial de primer nivel.
 * Los slots se crean una vez por sección, también después de cargar rutas lazy.
 * No bloquea la lectura, el pago, ni otras interfaces y no manipula contenido.
 */
export default function JourneySectionMoments() {
  const { pathname } = useLocation()
  const [targets, setTargets] = useState([])
  useEffect(() => {
    if (!MOMENT_PROMPTS[pathname]) {
      setTargets([])
      return undefined
    }
    const main = document.getElementById('main-content')
    if (!main) return undefined
    let frame = 0
    const owned = new Set()
    const refresh = () => {
      frame = 0
      const sections = [...main.querySelectorAll('section')].filter(section =>
        !section.parentElement?.closest('section') &&
        !section.closest('.bayona-moment') &&
        section.getBoundingClientRect().height > 90
      )
      const results = sections.flatMap((section, index) => {
        const prompt = getMomentPrompt(pathname, index)
        if (!prompt || section.dataset.bayonaMomentOptout === 'true') return []
        let slot = [...section.children].find(child => child.classList?.contains('bayona-moment-slot'))
        if (!slot) {
          slot = document.createElement('div')
          slot.className = 'bayona-moment-slot'
          section.appendChild(slot)
          owned.add(slot)
        }
        return [{ slot, prompt, index, total: sections.length }]
      })
      setTargets(previous => {
        if (previous.length === results.length &&
          previous.every((item, index) => item.slot === results[index].slot &&
            item.index === results[index].index && item.prompt === results[index].prompt)) return previous
        return results
      })
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(refresh) }
    const observer = new MutationObserver(schedule)
    observer.observe(main, { childList: true, subtree: true })
    schedule()
    return () => {
      observer.disconnect()
      if (frame) cancelAnimationFrame(frame)
      for (const slot of owned) slot.remove()
      setTargets([])
    }
  }, [pathname])
  return targets.map(({ slot, prompt, index, total }) =>
    createPortal(
      <SectionMoment moment={prompt} index={index} total={total}
        isFinal={pathname === '/' ? prompt.key === 'contacto' && index === 8 : index === total - 1} />,
      slot,
      pathname + ':' + index
    )
  )
}
