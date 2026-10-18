import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Activity, ArrowDownRight } from 'lucide-react'
import { getCinemaRoute } from '../../data/cinemaJourney.js'
import { JOURNEY_CHAPTERS } from '../../data/journeyGoals.js'
import { useJourneyExperience } from './JourneyExperienceContext.jsx'
import '../../styles/bayona-cinema-global.css'

function eligibleSections(main) {
  const all = [...main.querySelectorAll('section')].filter(section => {
    if (section.closest('.editorial-outro,.bayona-journey-inline,.bayona-moment,.bayona-coach')) return false
    const heading = section.querySelector('h1,h2')
    if (!heading || section.getBoundingClientRect().height < 230) return false
    return true
  })
  let chapters = all.filter(section => !section.parentElement?.closest('section'))
  if (chapters.length < 2) {
    // Some legacy pages place all content inside a semantic wrapper.
    chapters = all.filter(section => !all.some(other => other !== section && other.contains(section)))
    if (chapters.length < 2) {
      chapters = all.filter(section => !all.some(other =>
        other !== section && other.contains(section) && other.querySelector('h1,h2') === section.querySelector('h1,h2')))
    }
  }
  return [...new Set(chapters)].slice(0, 16)
}

function isLightSurface(section) {
  let element = section
  for (let i = 0; element && i < 4; i++, element = element.parentElement) {
    const match = getComputedStyle(element).backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
    if (!match || (match[4] !== undefined && Number(match[4]) < .5)) continue
    const [r,g,b] = [Number(match[1]),Number(match[2]),Number(match[3])]
    return (.2126*r + .7152*g + .0722*b) > 130
  }
  return false
}

/** A cinematic thread across every public route; no new navigation requirements. */
export default function CinematicGlobalChapters() {
  const { pathname } = useLocation()
  const profile = getCinemaRoute(pathname)
  const { goal, preferences, coachOpen } = useJourneyExperience()
  const [scene, setScene] = useState({ index: 0, total: 1, label: '' })
  const [visible, setVisible] = useState(false)
  const [contactOnScreen, setContactOnScreen] = useState(false)

  useEffect(() => {
    if (!profile) return undefined
    const main = document.getElementById('main-content')
    if (!main) return undefined
    document.body.classList.add('bayona-cinema-active')
    document.body.dataset.bayonaCinemaRoute = pathname
    document.body.style.setProperty('--bayona-cinema-photo',`url("${profile.image}")`)
    let chapters = []
    let frame = 0
    let refreshFrame = 0
    const refresh = () => {
      refreshFrame = 0
      const next = eligibleSections(main)
      chapters.forEach(section => {
        if (!next.includes(section)) {
          section.classList.remove('bayona-cinema-chapter','bayona-cinema-chapter--light','bayona-cinema-chapter--dark','bayona-cinema-chapter--first','bayona-cinema-chapter--active')
          section.removeAttribute('data-bayona-chapter-number')
        }
      })
      chapters = next
      chapters.forEach((section, index) => {
        section.classList.add('bayona-cinema-chapter')
        section.classList.toggle('bayona-cinema-chapter--light', isLightSurface(section))
        section.classList.toggle('bayona-cinema-chapter--dark', !isLightSurface(section))
        section.classList.toggle('bayona-cinema-chapter--first',index===0)
        section.setAttribute('data-bayona-chapter-number',String(index+1).padStart(2,'0'))
      })
      sync()
    }
    const sync = () => {
      frame=0
      let index=0
      for(let n=0;n<chapters.length;n++){
        if(chapters[n].getBoundingClientRect().top<innerHeight*.61) index=n
      }
      const active=chapters[index]
      const heading=(active?.querySelector('h1,h2')?.textContent||profile.name).trim().replace(/\s+/g,' ').slice(0,80)
      const homeChapter = pathname === '/' ? JOURNEY_CHAPTERS.find(c=>c.id===active?.id) : null
      const label=homeChapter?.label || (index===0?profile.name:heading)
      setScene(previous=>(previous.index===index && previous.total===chapters.length && previous.label===label)
        ? previous : {index,total:Math.max(1,chapters.length),label})
      chapters.forEach((section, n)=>section.classList.toggle('bayona-cinema-chapter--active',n===index))
      setVisible(window.scrollY>170||pathname!=='/')
      const conversion=document.querySelector('.bayona-direct-contact')
      const rect=conversion?.getBoundingClientRect()
      // A fixed chapter overlay must never block the contact or payment handoff.
      setContactOnScreen(Boolean(rect && rect.top < window.innerHeight*.88 && rect.bottom > window.innerHeight*.12))
    }
    const onScroll=()=>{if(!frame)frame=requestAnimationFrame(sync)}
    const onMutation=()=>{if(!refreshFrame)refreshFrame=requestAnimationFrame(refresh)}
    const observer=new MutationObserver(onMutation)
    observer.observe(main,{childList:true,subtree:true})
    refresh()
    window.addEventListener('scroll',onScroll,{passive:true})
    window.addEventListener('resize',onScroll)
    return ()=>{
      observer.disconnect()
      window.removeEventListener('scroll',onScroll)
      window.removeEventListener('resize',onScroll)
      cancelAnimationFrame(frame)
      cancelAnimationFrame(refreshFrame)
      chapters.forEach(section=>{
        section.classList.remove('bayona-cinema-chapter','bayona-cinema-chapter--light','bayona-cinema-chapter--dark','bayona-cinema-chapter--first','bayona-cinema-chapter--active')
        section.removeAttribute('data-bayona-chapter-number')
      })
      document.body.classList.remove('bayona-cinema-active')
      delete document.body.dataset.bayonaCinemaRoute
      document.body.style.removeProperty('--bayona-cinema-photo')
    }
  },[pathname,profile])

  if (!profile) return null
  const progress=Math.round((scene.index+1)*100/scene.total)
  return (
    <aside className={'bayona-cinema-track bayona-compass'+(visible&&!coachOpen&&!contactOnScreen?' is-visible':'')} aria-label="Tu recorrido BAYONA" aria-live="off">
      <div className="bayona-compass__bar">
        <Activity size={15} aria-hidden="true"/>
        <span>SEBASTIÁN TE ACOMPAÑA</span>
        <strong>{String(scene.index+1).padStart(2,'0')} / {String(scene.total).padStart(2,'0')}</strong>
      </div>
      <div className="bayona-compass__middle">
        <div>
          <span>{goal?'TU OBJETIVO · '+goal.short : Object.keys(preferences).length?'TU RUTA EN CONSTRUCCIÓN': profile.label}</span>
          <strong>{scene.label||profile.name}</strong>
        </div>
        <ArrowDownRight size={19} aria-hidden="true"/>
      </div>
      <p className="bayona-cinema-track__line">{profile.line}</p>
      <div className="bayona-compass__progress" aria-hidden="true"><span style={{width:progress+'%'}}/></div>
    </aside>
  )
}
