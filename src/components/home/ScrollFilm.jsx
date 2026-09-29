import { motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { mediaHeroUrls, siteMedia } from '../../config/siteMedia.js'
import '../../styles/scroll-film.css'


function filmImageProps(media) {
  const { standard, retina } = mediaHeroUrls(media)
  return {
    src: retina || media.src,
    srcSet: standard && retina && standard !== retina ? `${standard} 1x, ${retina} 2x` : undefined,
  }
}

const frames = [
  {
    number: '01',
    eyebrow: 'EL PUNTO DE PARTIDA',
    title: 'MUÉVETE.\nCON INTENCIÓN.',
    description: 'Cada cambio empieza por saber dónde estás.',
    image: siteMedia.home.hero,
  },
  {
    number: '02',
    eyebrow: 'LA DIRECCIÓN',
    title: 'MENOS RUIDO.\nMÁS CAMINO.',
    description: 'Un plan que conecta entrenamiento, técnica y constancia.',
    image: siteMedia.home.ninetyDays,
  },
  {
    number: '03',
    eyebrow: 'EL MÉTODO BAYONA',
    title: 'EL PROCESO\nES TUYO.',
    description: 'Avanza a tu ritmo. Aquí empieza el recorrido.',
    image: siteMedia.home.method,
  },
]

function MovingFrame({ frame, index, progress }) {
  const start = index / frames.length
  const end = (index + 1) / frames.length
  const fade = 0.055
  const opacity = useTransform(progress,
    [Math.max(0, start - fade), start + fade, end - fade, Math.min(1, end + fade)],
    [index === 0 ? 1 : 0, 1, 1, index === frames.length - 1 ? 1 : 0])
  const imageScale = useTransform(progress, [start, end], [1.18, 1])
  const imageY = useTransform(progress, [start, end], ['4%', '-4%'])
  const titleY = useTransform(progress, [start, end], ['25%', '-20%'])

  return (
    <motion.div className="scroll-film__frame" style={{ opacity }}>
      <motion.img
        className="scroll-film__image"
        {...filmImageProps(frame.image)}
        alt=""
        loading={index === 0 ? 'eager' : 'lazy'}
        style={{ scale: imageScale, y: imageY }}
      />
      <div className="scroll-film__shade" />
      <motion.div className="scroll-film__copy" style={{ y: titleY }}>
        <p className="scroll-film__eyebrow"><span>{frame.number} / 03</span>{frame.eyebrow}</p>
        <h2>{frame.title}</h2>
        <p className="scroll-film__description">{frame.description}</p>
      </motion.div>
    </motion.div>
  )
}

export default function ScrollFilm() {
  const stage = useRef(null)
  const [staticMode, setStaticMode] = useState(false)
  const { scrollYProgress } = useScroll({ target: stage, offset: ['start start', 'end end'] })
  const railScale = useTransform(scrollYProgress, [0, 1], [0, 1])

  useEffect(() => {
    document.body.classList.toggle('award-calm', staticMode)
    return () => document.body.classList.remove('award-calm')
  }, [staticMode])

  return (
    <section
      ref={stage}
      className={`scroll-film${staticMode ? ' scroll-film--static' : ''}`}
      aria-label="El recorrido BAYONA en tres escenas"
      data-scroll-story="home-intro"
    >
      {staticMode ? <button type="button" className="scroll-film__enable" onClick={() => setStaticMode(false)}>
        ACTIVAR EXPERIENCIA DE SCROLL <span aria-hidden="true">↗</span>
      </button> : null}
      {staticMode ? frames.map((frame) => (
        <div className="scroll-film__static-frame" key={frame.number}>
          <img {...filmImageProps(frame.image)} alt="" loading="lazy" decoding="async" />
          <div className="scroll-film__copy">
            <p className="scroll-film__eyebrow"><span>{frame.number} / 03</span>{frame.eyebrow}</p>
            <h2>{frame.title}</h2>
            <p className="scroll-film__description">{frame.description}</p>
          </div>
        </div>
      )) : (
        <div className="scroll-film__sticky">
          <button type="button" className="scroll-film__calm" onClick={() => setStaticMode(true)}>
            MODO CALMA
          </button>
          {frames.map((frame, index) => (
            <MovingFrame key={frame.number} frame={frame} index={index} progress={scrollYProgress} />
          ))}
          <div className="scroll-film__chrome" aria-hidden="true">
            <span>BAYONA / UNA FORMA DE AVANZAR</span>
            <div className="scroll-film__rail"><motion.i style={{ scaleX: railScale }} /></div>
            <span>DESLIZA PARA DESCUBRIR ↓</span>
          </div>
        </div>
      )}
    </section>
  )
}
