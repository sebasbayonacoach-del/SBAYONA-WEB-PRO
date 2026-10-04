import { motion, useTransform } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { homeTestimonials, testimonialVariant } from '../../config/testimonials.js'
import { useCapabilities } from '../../engine/hooks/useCapabilities.js'
import { StickyStage } from '../../engine/scroll/StickyStage.jsx'
import { trackEvent } from '../../lib/analytics/analytics.js'
import '../../styles/experience-proof.css'

function describePerson({ age, role, city, country }) {
  return [age ? `${age} años` : null, role, [city, country].filter(Boolean).join(', ')]
    .filter(Boolean)
    .join(' · ')
}

function DynamicPortrait({ person, progress }) {
  const scale = useTransform(progress, [0, 1], [1.08, 1.02])
  const y = useTransform(progress, [0, 1], ['2%', '-2%'])

  return (
    <motion.img
      className="experience-story__portrait"
      src={testimonialVariant(person.image, 960)}
      srcSet={`${testimonialVariant(person.image, 256)} 256w, ${testimonialVariant(person.image, 960)} 960w`}
      sizes="100vw"
      alt=""
      width="960"
      height="540"
      loading="lazy"
      decoding="async"
      style={{ scale, y }}
      draggable="false"
    />
  )
}

function LateralFilm({ index, progress }) {
  const travel = useTransform(progress,[0,1],['17%','-18%'])
  const next = homeTestimonials[(index+1)%homeTestimonials.length]
  const after = homeTestimonials[(index+2)%homeTestimonials.length]
  return (
    <motion.div className="bayona-experience-film" style={{x:travel}} aria-hidden="true">
      {[next,after].map((person,i)=>(
        <figure className="bayona-experience-film__slide" key={person.id} style={{'--film-order':i}}>
          <img src={testimonialVariant(person.image,256)} alt="" loading="lazy" decoding="async" width="256" height="144" />
          <figcaption>{String((index+i+1)%homeTestimonials.length+1).padStart(2,'0')} / SIGUIENTE HISTORIA</figcaption>
        </figure>
      ))}
    </motion.div>
  )
}

function StoryFrame({ person, index, total, progress, isStatic }) {
  return (
    <div className="experience-story__frame">
      <div className="experience-story__media" aria-hidden="true">
        {isStatic ? (
          <img
            className="experience-story__portrait"
            src={testimonialVariant(person.image, 960)}
            alt=""
            width="960"
            height="540"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <DynamicPortrait person={person} progress={progress} />
        )}
        <div className="experience-story__scrim" />
      </div>

      {!isStatic && <LateralFilm index={index} progress={progress} />}
      <div className="experience-story__chrome" aria-hidden="true">
        <span>EXPERIENCIA {String(index + 1).padStart(2, '0')}</span>
        <span>{String(total).padStart(2, '0')} VOCES</span>
      </div>

      <motion.article
        className="experience-story__copy"
        key={person.id}
        initial={isStatic ? false : { opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="experience-story__eyebrow">EXPERIENCIAS PUBLICADAS</p>
        <p className="experience-story__person">
          <strong>{person.name}</strong>
          <span>{describePerson(person)}</span>
        </p>
        <blockquote>{person.quote}</blockquote>
        <p className="experience-story__result">
          <span>LO QUE SE LLEVÓ</span>
          {person.result}
        </p>

        {index === total - 1 ? (
          <Link
            className="experience-story__link"
            to="/about"
            onClick={() => trackEvent('proof_explore', { destination: '/about', source: 'home_proof' })}
          >
            VER LAS DIEZ HISTORIAS
            <ArrowUpRight size={16} strokeWidth={1.2} aria-hidden="true" />
          </Link>
        ) : null}
      </motion.article>

      <ol className="experience-story__progress" aria-label="Historias publicadas">
        {Array.from({ length: total }, (_, stepIndex) => (
          <li
            key={stepIndex}
            data-active={stepIndex === index ? 'true' : undefined}
            aria-label={`Historia ${stepIndex + 1}`}
          />
        ))}
      </ol>
    </div>
  )
}

export default function ExperienceProof() {
  const { mode } = useCapabilities()
  const length = mode === 'desktop' ? '310vh' : '325vh'

  return (
    <section
      className="experience-proof-section experience-story"
      aria-labelledby="home-experiences-title"
      data-experience-layer="editorial motion spatial"
    >
      <div className="experience-story__intro">
        <p>04 / EXPERIENCIAS</p>
        <h2 id="home-experiences-title">
          GENTE REAL.
          <span>CUATRO PUNTOS DE PARTIDA.</span>
        </h2>
        <small>HISTORIAS QUE AVANZAN CONTIGO</small>
      </div>

      <StickyStage
        length={length}
        states={homeTestimonials.length}
        topOffset={66}
        allowMobile
        className="experience-story__stage"
      >
        {({ index, progress, isStatic }) => {
          const person = homeTestimonials[index] ?? homeTestimonials[0]
          return (
            <StoryFrame
              person={person}
              index={index}
              total={homeTestimonials.length}
              progress={progress}
              isStatic={isStatic}
            />
          )
        }}
      </StickyStage>

      <p className="experience-story__legal microcopy">
        Historias compartidas por alumnos. Algunos nombres o detalles pueden haberse
        simplificado para proteger privacidad.
      </p>
    </section>
  )
}
