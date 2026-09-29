import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import '../styles/immersive-overhaul.css'

const SECTION_QUERY = 'main section'
const NAVBAR_SCROLL_THRESHOLD = 40

function readSectionLabel(section, index) {
  const labelledBy = section.getAttribute('aria-labelledby')
  if (labelledBy) {
    const heading = document.getElementById(labelledBy)
    if (heading && heading.textContent) {
      return heading.textContent.trim().split(/\s+/).slice(0, 3).join(' ')
    }
  }

  const stage = section.getAttribute('data-content-stage')
  if (stage) return stage.toUpperCase()

  const eyebrow = section.querySelector('.eyebrow, [class*="SectionLabel"], p')
  if (eyebrow && eyebrow.textContent) {
    return eyebrow.textContent.trim().split(/\s+/).slice(0, 3).join(' ')
  }

  return `SECCIÓN ${String(index + 1).padStart(2, '0')}`
}

export default function ImmersiveChrome() {
  const [sections, setSections] = useState([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const frameRef = useRef(0)
  const location = useLocation()

  const collectSections = useCallback(() => {
    const nodes = Array.from(document.querySelectorAll(SECTION_QUERY))
    setSections(
      nodes
        .filter((node) => node.getBoundingClientRect().height > 120)
        .map((node, index) => ({
          id: node.getAttribute('id') || `bayona-section-${index}`,
          label: readSectionLabel(node, index),
          node,
        })),
    )
  }, [])

  useEffect(() => {
    collectSections()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const index = sections.findIndex(
            ({ node }) => node === entry.target,
          )
          if (index !== -1) setActiveIndex(index)
        })
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )

    sections.forEach(({ node }) => observer.observe(node))

    return () => observer.disconnect()
  }, [collectSections, sections, location.pathname])

  useEffect(() => {
    const handleScroll = () => {
      if (frameRef.current) return

      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = 0
        const scrollY = window.scrollY

        setScrolled(scrollY > NAVBAR_SCROLL_THRESHOLD)

        const navbar = document.querySelector('.navbar')
        if (navbar) navbar.classList.toggle('is-scrolled', scrollY > NAVBAR_SCROLL_THRESHOLD)

        const hero = document.querySelector('.hero-module')
        if (hero) {
          const height = hero.offsetHeight || 1
          const progress = Math.min(Math.max(scrollY / height, 0), 1)
          hero.style.setProperty('--hero-scroll', progress.toFixed(3))
        }

        const vision = document.querySelector('.vision-section .vision-panel')
        if (vision) {
          const rect = vision.getBoundingClientRect()
          const viewport = window.innerHeight || 1
          const raw = (viewport - rect.top) / (viewport + rect.height)
          const progress = Math.min(Math.max(raw, 0), 1)
          vision.style.setProperty('--section-progress', `${(progress * 100).toFixed(1)}%`)
        }
      })
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  const jumpTo = useCallback((node) => {
    if (!node) return
    node.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const activeLabel = sections[activeIndex]?.label ?? ''

  return (
    <>
      <div className="bayona-grain" aria-hidden="true" />

      <div
        className="bayona-nav-section"
        data-visible={scrolled ? 'true' : 'false'}
        aria-hidden="true"
      >
        {activeLabel}
      </div>

      <nav className="bayona-rail" aria-label="Índice de la experiencia BAYONA">
        {sections.map(({ id, label, node }, index) => (
          <button
            key={id}
            type="button"
            className="bayona-rail-item"
            data-active={index === activeIndex ? 'true' : 'false'}
            onClick={() => jumpTo(node)}
          >
            <span className="bayona-rail-label">{label}</span>
            <span className="bayona-rail-tick" aria-hidden="true" />
          </button>
        ))}
      </nav>

      <div
        className="bayona-marquee--fixed"
        data-visible={scrolled ? 'true' : 'false'}
        aria-hidden="true"
      >
        <div className="bayona-marquee-track">
          {[0, 1].map((dup) => (
            <span key={dup}>
              BAYONA <b>·</b> NO ES MOTIVACIÓN <b>·</b> ES ESTRUCTURA <b>·</b>{' '}
              ENTRENAMIENTO CON DIRECCIÓN <b>·</b> SEGUIMIENTO REAL <b>·</b>{' '}
            </span>
          ))}
        </div>
      </div>
    </>
  )
}
