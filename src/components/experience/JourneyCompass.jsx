import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ArrowDownRight, ArrowUpRight, CircleDot } from 'lucide-react'
import { JOURNEY_CHAPTERS } from '../../data/journeyGoals.js'
import { useJourneyExperience } from './JourneyExperienceContext.jsx'
const ROUTE_NAMES = {
  '/about': 'QUIÉN TE ACOMPAÑA',
  '/programs': 'SERVICIOS Y SESIONES',
  '/movimiento-adaptado': 'MOVIMIENTO ADAPTADO',
  '/parkour-academy': 'PARKOUR ACADEMY',
  '/resources': 'TUS RECURSOS',
  '/community': 'COMUNIDAD BAYONA',
  '/faq': 'TUS PREGUNTAS',
  '/app': 'TU APP BAYONA',
  '/shop': 'TIENDA BAYONA',
}
/** El capítulo refleja la sección leída, nunca el progreso de un perfil privado. */
export default function JourneyCompass() {
  const { pathname } = useLocation()
  const { goal } = useJourneyExperience()
  const [chapter, setChapter] = useState(0)
  const [shown, setShown] = useState(false)
  const [pageProgress, setPageProgress] = useState(0)
  useEffect(() => {
    let frame = 0
    const sync = () => {
      frame = 0
      if (pathname === '/') {
        let next = 0
        for (const [index, item] of JOURNEY_CHAPTERS.entries()) {
          const target = document.getElementById(item.id)
          if (target && target.getBoundingClientRect().top <= window.innerHeight * .55) next = index
        }
        setChapter(current => current === next ? current : next)
      }
      const available = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      setPageProgress(Math.round(Math.max(0, Math.min(100, window.scrollY * 100 / available))))
      setShown(window.scrollY > 220 || pathname !== '/')
    }
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(sync) }
    sync()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [pathname])
  if (!ROUTE_NAMES[pathname] && pathname !== '/') return null
  const current = JOURNEY_CHAPTERS[chapter]
  const progress = pathname === '/' ? (chapter + 1) * 100 / JOURNEY_CHAPTERS.length : pageProgress
  const title = pathname === '/' ? current.label : ROUTE_NAMES[pathname]
  return (
    <aside className={`bayona-compass${shown ? ' is-visible' : ''}`} aria-label="Orientación del recorrido BAYONA">
      <div className="bayona-compass__bar">
        <CircleDot size={17} aria-hidden="true"/>
        <span>RECORRIDO BAYONA</span>
        <strong>{pathname === '/' ? current.number + ' / ' + String(JOURNEY_CHAPTERS.length).padStart(2, '0') : 'TU EXPLORACIÓN'}</strong>
      </div>
      <div className="bayona-compass__middle">
        <div>
          <span>{goal ? 'TU ENFOQUE · ' + goal.short : 'DESCUBRE A TU RITMO'}</span>
          <strong>{title}</strong>
        </div>
        {pathname === '/' ? <ArrowDownRight size={22} aria-hidden="true"/> : <ArrowUpRight size={22} aria-hidden="true"/>}
      </div>
      <div className="bayona-compass__progress" aria-hidden="true"><span style={{ width: progress + '%' }}/></div>
    </aside>
  )
}
