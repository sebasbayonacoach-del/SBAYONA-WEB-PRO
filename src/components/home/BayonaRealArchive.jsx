import { useEffect, useRef, useState } from 'react'
import '../../styles/bayona-real-archive.css'

const CLIPS = Object.freeze([
  { src: '/videos/bayona-authentic/broll-rio.mp4', poster: '/images/bayona-authentic/broll-rio.webp', title: 'UN CAMINO', description: 'Paisaje · España', chapter: '01' },
  { src: '/videos/bayona-authentic/movimiento-entorno.mp4', poster: '/images/bayona-authentic/movimiento-entorno.webp', title: 'EL ENTORNO', description: 'Deporte · Movimiento', chapter: '02' },
  { src: '/videos/bayona-authentic/movimiento-pov.mp4', poster: '/images/bayona-authentic/movimiento-pov.webp', title: 'EN PRIMERA PERSONA', description: 'Recorrido · POV', chapter: '03' },
])

export default function BayonaRealArchive() {
  const [activeIndex, setActiveIndex] = useState(0)
  const sectionRef = useRef(null)
  const active = CLIPS[activeIndex]

  useEffect(() => {
    if (window.location.hash !== '#archivo-real') return
    const frame = window.requestAnimationFrame(() => sectionRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' }))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  return (
    <section className="bayona-real-archive" id="archivo-real" ref={sectionRef} aria-labelledby="archivo-real-title">
      <div className="bayona-real-archive__shell">
        <header className="bayona-real-archive__intro">
          <div className="bayona-real-archive__eyebrow">
            <span>ARCHIVO BAYONA / 2026</span>
            <span>03 FRAGMENTOS ORIGINALES</span>
          </div>
          <h2 id="archivo-real-title">VIDA REAL.<br /><em>MOVIMIENTO REAL.</em></h2>
          <div className="bayona-real-archive__intro-bottom">
            <p>El movimiento también se cuenta con imágenes. Explora tres fragmentos del archivo audiovisual de BAYONA, sin rostros atribuidos ni personajes inventados.</p>
            <span aria-hidden="true">01 — 03 / FILM ARCHIVE</span>
          </div>
        </header>

        <div className="bayona-real-archive__feature">
          <div className="bayona-real-archive__player">
            <div className="bayona-real-archive__screen">
              <video
                key={active.src}
                src={active.src}
                poster={active.poster}
                controls
                muted
                playsInline
                preload="none"
                aria-label={active.title + ' — grabación original sin audio'}
              />
              <span className="bayona-real-archive__screen-label" aria-hidden="true">B / MOTION ARCHIVE</span>
            </div>
            <div className="bayona-real-archive__frame-data" aria-hidden="true">
              <span>REC · BAYONA</span><span>ORIGINAL FOOTAGE</span><span>16:09 / EDITORIAL</span>
            </div>
          </div>

          <aside className="bayona-real-archive__editorial" aria-live="polite">
            <span className="bayona-real-archive__chapter">SECUENCIA {active.chapter} / 03</span>
            <h3>{active.title}</h3>
            <p>{active.description}. Grabación del archivo personal, presentada sin atribuir identidades.</p>
            <div className="bayona-real-archive__editorial-rule" aria-hidden="true" />
            <span className="bayona-real-archive__hint">SELECCIONA UN FRAGMENTO PARA VERLO</span>
            <div className="bayona-real-archive__takes" role="group" aria-label="Seleccionar fragmento de vídeo">
              {CLIPS.map((clip, index) => (
                <button
                  key={clip.src}
                  type="button"
                  className={'bayona-real-archive__take' + (index === activeIndex ? ' is-current' : '')}
                  onClick={() => setActiveIndex(index)}
                  aria-pressed={index === activeIndex}
                  aria-label={'Seleccionar vídeo ' + clip.chapter + ': ' + clip.title}
                >
                  <img src={clip.poster} alt="" loading="lazy" decoding="async" width="122" height="152" />
                  <span className="bayona-real-archive__take-info">
                    <small>TAKE {clip.chapter}</small>
                    <strong>{clip.title}</strong>
                  </span>
                  <span className="bayona-real-archive__take-arrow" aria-hidden="true">↗</span>
                </button>
              ))}
            </div>
          </aside>
        </div>

        <figure className="bayona-real-archive__landscape">
          <img src="/images/bayona-authentic/recorrido-montana-2026-02-23.jpg" alt="Paisaje de montaña registrado en el archivo de BAYONA" width="900" height="1600" loading="lazy" decoding="async" />
          <figcaption><span>EL CAMINO CONTINÚA</span><span>ARCHIVO DE PAISAJE · 23.02.2026</span></figcaption>
        </figure>
        <p className="bayona-real-archive__source">Material original seleccionado. Los retratos no identificados y las imágenes de terceros sin autorización quedan fuera. Reproducción manual para respetar tus datos y preferencias de movimiento.</p>
      </div>
    </section>
  )
}
