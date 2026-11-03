import { useEffect, useRef, useState } from 'react'
import '../../styles/bayona-real-archive.css'

// Clips procedentes del banco local SELECTED_VIDEO/APTO_REVISION_FINAL.
// No se incorporan retratos de identidad no validada ni archivos REVISION_PRIVACIDAD.
const CLIPS = [
  { id: 'broll-rio', title: 'LA RUTA', category: 'Paisaje / España', duration: '00:08' },
  { id: 'movimiento-pov', title: 'OTRA ALTURA', category: 'Movimiento / POV', duration: '00:08' },
  { id: 'skyline-espana', title: 'CIUDAD ABIERTA', category: 'Horizonte / España', duration: '00:08' },
  { id: 'entorno-abierto', title: 'EL ENTORNO', category: 'Exterior / Deporte', duration: '00:08' },
  { id: 'ruta-urbana', title: 'EL RECORRIDO', category: 'Perspectiva / POV', duration: '00:08' },
  { id: 'arquitectura-deportiva', title: 'ESTRUCTURAS', category: 'Arquitectura / Movimiento', duration: '00:08' },
  { id: 'movimiento-entorno', title: 'EL CAMPO', category: 'Espacio / Deporte', duration: '00:02' },
  { id: 'campo-abierto', title: 'LUZ DE TARDE', category: 'Campo / Exterior', duration: '00:06' },
]

export default function BayonaRealArchive() {
  const sectionRef = useRef(null)
  const [playingId, setPlayingId] = useState(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    if (window.location.hash === '#archivo-real') {
      window.requestAnimationFrame(() => window.scrollTo({
        top: section.getBoundingClientRect().top + window.scrollY - 105,
        behavior: 'instant',
      }))
    }

    // Un panel global no debe ocultar las imágenes del archivo mientras se visita.
    const updateFocus = () => {
      const rect = section.getBoundingClientRect()
      const visible = rect.top < window.innerHeight * 0.9 && rect.bottom > window.innerHeight * 0.1
      document.body.classList.toggle('bayona-archive-focused', visible)
    }

    window.addEventListener('scroll', updateFocus, { passive: true })
    window.addEventListener('resize', updateFocus)
    updateFocus()

    return () => {
      window.removeEventListener('scroll', updateFocus)
      window.removeEventListener('resize', updateFocus)
      document.body.classList.remove('bayona-archive-focused')
    }
  }, [])

  useEffect(() => {
    const video = sectionRef.current?.querySelector('video')
    if (!video) return

    const pauseIfHidden = () => { if (document.hidden) video.pause() }
    const observer = 'IntersectionObserver' in window
      ? new IntersectionObserver(([entry]) => {
          if (!entry.isIntersecting) video.pause()
        }, { threshold: 0.15 })
      : null

    observer?.observe(video)
    document.addEventListener('visibilitychange', pauseIfHidden)
    return () => {
      observer?.disconnect()
      document.removeEventListener('visibilitychange', pauseIfHidden)
      video.pause()
    }
  }, [playingId])

  return (
    <section className="bayona-real-archive" id="archivo-real" ref={sectionRef} aria-labelledby="archivo-real-title">
      <div className="bayona-real-archive__shell">
        <div className="bayona-real-archive__topline">
          <span>BAYONA / ARCHIVO AUDIOVISUAL</span>
          <span>EDICIÓN 01 — 2026</span>
        </div>

        <header className="bayona-real-archive__intro">
          <p className="bayona-real-archive__kicker">UN ARCHIVO EN MOVIMIENTO</p>
          <h2 id="archivo-real-title">VIDA REAL.<br /><em>EN MOVIMIENTO.</em></h2>
          <div className="bayona-real-archive__lead">
            <p>Ocho escenas del universo BAYONA. Ciudad, altura y movimiento: el recorrido que hay detrás de cada nuevo comienzo.</p>
            <span className="bayona-real-archive__count"><strong>08</strong><small>CAPÍTULOS<br />VISUALES</small></span>
          </div>
        </header>

        <div className="bayona-real-archive__reel-heading">
          <span>01 — 08 / ARCHIVO EN MOVIMIENTO</span>
          <span>IMAGEN ORIGINAL / SIN AUDIO</span>
        </div>

        <div className="bayona-real-archive__reels">
          {CLIPS.map((clip, index) => (
            <article className="bayona-real-archive__reel" key={clip.id}>
              <div
                className="bayona-real-archive__frame"
                style={{ backgroundImage: `url(/images/bayona-authentic/${clip.id}.webp)`, backgroundPosition: 'center', backgroundSize: 'cover' }}
              >
                {playingId === clip.id ? (
                  <video
                    src={`/videos/bayona-authentic/${clip.id}.mp4`}
                    poster={`/images/bayona-authentic/${clip.id}.webp`}
                    controls
                    autoPlay
                    muted
                    playsInline
                    loop
                    aria-label={`${clip.title}: fragmento real del archivo BAYONA`}
                  />
                ) : (
                  <button
                    type="button"
                    className="bayona-real-archive__launch"
                    aria-label={`Reproducir ${clip.title}, ${clip.category}`}
                    onClick={() => setPlayingId(clip.id)}
                  >
                    <img
                      src={`/images/bayona-authentic/${clip.id}.webp`}
                      alt=""
                      loading="eager"
                      decoding="async"
                    />
                    <span className="bayona-real-archive__launch-content" aria-hidden="true">
                      <span className="bayona-real-archive__play-icon">▶</span>
                      <span>VER CLIP</span>
                    </span>
                  </button>
                )}
                <span className="bayona-real-archive__serial" aria-hidden="true">B / {String(index + 1).padStart(2, '0')}</span>
                <span className="bayona-real-archive__duration" aria-hidden="true">{clip.duration}</span>
              </div>
              <div className="bayona-real-archive__caption">
                <span className="bayona-real-archive__chapter">{String(index + 1).padStart(2, '0')} / 08</span>
                <h3>{clip.title}</h3>
                <p>{clip.category}</p>
              </div>
            </article>
          ))}
        </div>

        <footer className="bayona-real-archive__footer">
          <span>OCHO ESCENAS ORIGINALES DEL ARCHIVO BAYONA.</span>
          <span>Las escenas con personas identificables pendientes de autorización quedan fuera de esta selección.</span>
        </footer>
      </div>
    </section>
  )
}
