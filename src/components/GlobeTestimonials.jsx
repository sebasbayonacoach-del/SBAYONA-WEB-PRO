import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Play } from 'lucide-react'
import { useCapabilities } from '../engine/hooks/useCapabilities.js'
import { TESTIMONIALS, testimonialVariant } from '../config/testimonials.js'

const EARTH_TEXTURE_URL = '/images/system/earth-dark.jpg'

/*
  Los testimonios y el helper de variantes viven en src/config/testimonials.js.
  Estaban aqui dentro, asi que solo podian usarse donde se montara este globo
  (43 kB + three.js). Como dato suelto los puede consumir tambien la home sin
  arrastrar la escena 3D. Se reexporta GLOBE_TESTIMONIALS por compatibilidad.
*/
export { testimonialVariant }
export const GLOBE_TESTIMONIALS = TESTIMONIALS

export const WORLD_MAP_MARKERS = Object.freeze([
  Object.freeze({ id: 'co-bogota-centro', country: 'Colombia', lat: 4.711, lng: -74.072, testimonialId: 0 }),
  Object.freeze({ id: 'co-bogota-chapinero', country: 'Colombia', lat: 4.649, lng: -74.063, testimonialId: 0 }),
  Object.freeze({ id: 'co-bogota-usaquen', country: 'Colombia', lat: 4.695, lng: -74.031, testimonialId: 1 }),
  Object.freeze({ id: 'co-bogota-suba', country: 'Colombia', lat: 4.741, lng: -74.084, testimonialId: 1 }),
  Object.freeze({ id: 'co-bogota-engativa', country: 'Colombia', lat: 4.701, lng: -74.113, testimonialId: 2 }),
  Object.freeze({ id: 'co-bogota-teusaquillo', country: 'Colombia', lat: 4.641, lng: -74.085, testimonialId: 2 }),
  Object.freeze({ id: 'co-bogota-fontibon', country: 'Colombia', lat: 4.679, lng: -74.141, testimonialId: 3 }),
  Object.freeze({ id: 'co-bogota-kennedy', country: 'Colombia', lat: 4.627, lng: -74.157, testimonialId: 3 }),
  Object.freeze({ id: 'co-bogota-bosa', country: 'Colombia', lat: 4.617, lng: -74.19, testimonialId: 4 }),
  Object.freeze({ id: 'co-bogota-san-cristobal', country: 'Colombia', lat: 4.565, lng: -74.083, testimonialId: 4 }),
  Object.freeze({ id: 'es-valencia-family', country: 'España', lat: 39.47, lng: -0.38, testimonialId: 5 }),
  Object.freeze({ id: 'es-valencia-nestor', country: 'España', lat: 39.5, lng: -0.42, testimonialId: 6 }),
  Object.freeze({ id: 'es-madrid-laura', country: 'España', lat: 40.42, lng: -3.7, testimonialId: 7 }),
  Object.freeze({ id: 'us-miami', country: 'Miami', lat: 25.76, lng: -80.19, testimonialId: 8 }),
  Object.freeze({ id: 'ar-buenos-aires', country: 'Argentina', lat: -34.61, lng: -58.38, testimonialId: 9 }),
])

const MAP_FOCUS_PRESETS = Object.freeze({
  Colombia: Object.freeze({ zoom: 7.2, label: 'Colombia', eyebrow: 'País en foco' }),
  España: Object.freeze({ zoom: 6.4, label: 'España', eyebrow: 'País en foco' }),
  Miami: Object.freeze({ zoom: 9.2, label: 'Miami', eyebrow: 'Ciudad en foco' }),
  Argentina: Object.freeze({ zoom: 5.8, label: 'Argentina', eyebrow: 'País en foco' }),
})

function testimonialInitials(name) {
  return String(name ?? '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
}

function TestimonialAvatar({ testimonial }) {
  const [imageError, setImageError] = useState(false)
  const initials = testimonialInitials(testimonial.name)

  if (!testimonial.image || imageError) {
    return (
      <div className="globe-testimonials-portrait" aria-label={`Avatar de ${testimonial.name}`}>
        {initials}
      </div>
    )
  }

  return (
    <img
      src={testimonialVariant(testimonial.image, 256)}
      alt={testimonial.name}
      className="globe-testimonials-portrait"
      /* Se declara el tamaño de render para que el navegador reserve el hueco
         antes de descargar la imagen y no haya salto de layout (CLS). */
      width="88"
      height="88"
      loading="lazy"
      decoding="async"
      onError={() => setImageError(true)}
    />
  )
}

function CountryFlag({ countryCode, countryName }) {
  const renderFlag = () => {
    switch (countryCode) {
      case 'ES':
        return (
          <svg viewBox="0 0 640 480" style={{ width: '100%', height: '100%' }} aria-label={`Bandera de ${countryName}`}>
            <path fill="#AA151B" d="M0 0h640v160H0z"/>
            <path fill="#F1BF00" d="M0 160h640v160H0z"/>
            <path fill="#AA151B" d="M0 320h640v160H0z"/>
          </svg>
        )
      case 'CO':
        return (
          <svg viewBox="0 0 640 480" style={{ width: '100%', height: '100%' }} aria-label={`Bandera de ${countryName}`}>
            <path fill="#FCD116" d="M0 0h640v240H0z"/>
            <path fill="#003893" d="M0 240h640v120H0z"/>
            <path fill="#CE1126" d="M0 360h640v120H0z"/>
          </svg>
        )
      case 'AR':
        return (
          <svg viewBox="0 0 640 480" style={{ width: '100%', height: '100%' }} aria-label={`Bandera de ${countryName}`}>
            <path fill="#74ACDF" d="M0 0h640v160H0z"/>
            <path fill="#FFFFFF" d="M0 160h640v160H0z"/>
            <path fill="#74ACDF" d="M0 320h640v160H0z"/>
            <circle cx="320" cy="240" r="40" fill="none" stroke="#F6B40E" strokeWidth="8"/>
            <path fill="#F6B40E" d="M320 200l8 24h25l-20 15 8 24-21-15-21 15 8-24-20-15h25z"/>
          </svg>
        )
      case 'US':
        return (
          <svg viewBox="0 0 640 480" style={{ width: '100%', height: '100%' }} aria-label={`Bandera de ${countryName}`}>
            <rect width="640" height="480" fill="#B22234"/>
            <path stroke="#FFF" strokeWidth="37" d="M0 55h640M0 129h640M0 203h640M0 277h640M0 351h640M0 425h640"/>
            <rect width="256" height="185" fill="#3C3B6E"/>
          </svg>
        )
      default:
        return (
          <div className="globe-testimonials-country-fallback" style={{ width: '100%', height: '100%' }} aria-label={`${countryName}`}>
            {countryCode}
          </div>
        )
    }
  }

  return (
    <div className="globe-testimonials-country-flag">
      {renderFlag()}
    </div>
  )
}

function markerForTestimonial(testimonialId) {
  return WORLD_MAP_MARKERS.find((marker) => marker.testimonialId === testimonialId) ?? null
}

export function latLngTo3D(lat, lng, radius = 1) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const y = radius * Math.cos(phi)
  const z = radius * Math.sin(phi) * Math.sin(theta)
  return [x, y, z]
}

function mapPosition(lat, lng) {
  return {
    left: `${((lng + 180) / 360) * 100}%`,
    top: `${((90 - lat) / 180) * 100}%`,
  }
}

function InteractiveWorldMap({ activeTestimonial, focusedMarker, onSelect }) {
  const focusPreset = focusedMarker ? MAP_FOCUS_PRESETS[focusedMarker.country] : null
  const focusPosition = focusedMarker ? mapPosition(focusedMarker.lat, focusedMarker.lng) : { left: '50%', top: '50%' }
  const zoom = focusPreset?.zoom ?? 1
  const inverseZoom = 1 / zoom

  return (
    <div
      className={`globe-testimonials-world${focusedMarker ? ' is-focused' : ''}`}
      role="group"
      aria-label="Mapa mundial interactivo con quince puntos de impacto"
      data-focused-region={focusedMarker?.country ?? 'Mundo'}
    >
      <div
        className={`globe-testimonials-world-map${focusedMarker ? ' is-focused' : ''}`}
        style={{
          backgroundImage: `linear-gradient(rgba(244, 162, 97, 0.04), rgba(5, 5, 5, 0.12)), url(${EARTH_TEXTURE_URL})`,
          transformOrigin: `${focusPosition.left} ${focusPosition.top}`,
          transform: `scale(${zoom})`,
          '--map-inverse-zoom': inverseZoom,
        }}
        data-focused-region={focusedMarker?.country ?? 'Mundo'}
        data-map-zoom={zoom}
      >
        <span className="globe-testimonials-world-map-grid" aria-hidden="true" />
        {WORLD_MAP_MARKERS.map((marker, index) => {
          const testimonial = GLOBE_TESTIMONIALS[marker.testimonialId]
          const active = testimonial.id === activeTestimonial.id
          const focused = marker.id === focusedMarker?.id
          const inFocusedRegion = marker.country === focusedMarker?.country

          return (
            <button
              key={marker.id}
              type="button"
              className={`globe-testimonials-world-point${active ? ' is-active' : ''}${focused ? ' is-focused' : ''}${focusedMarker && !inFocusedRegion ? ' is-muted' : ''}`}
              style={{ ...mapPosition(marker.lat, marker.lng), '--point-delay': `${index * -0.17}s` }}
              data-country={marker.country}
              data-marker-id={marker.id}
              aria-label={`Abrir historia de ${testimonial.name} desde ${marker.country}`}
              aria-pressed={active}
              onClick={() => onSelect(marker)}
            >
              <span aria-hidden="true" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function GlobeTestimonials() {
  const capabilities = useCapabilities()
  const reducedMotion = capabilities.reducedMotion
  const [activeId, setActiveId] = useState(0)
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [focusedMarker, setFocusedMarker] = useState(null)
  const touchStartX = useRef(null)
  const activeTestimonial = GLOBE_TESTIMONIALS[activeId]
  const activeFocusPreset = focusedMarker ? MAP_FOCUS_PRESETS[focusedMarker.country] : null

  // Prefetch next testimonial image
  useEffect(() => {
    const nextId = (activeId + 1) % GLOBE_TESTIMONIALS.length
    const nextTestimonial = GLOBE_TESTIMONIALS[nextId]
    if (nextTestimonial.image) {
      const img = new Image()
      img.src = nextTestimonial.image
    }
  }, [activeId])

  useEffect(() => {
    if (!isOverlayOpen) return undefined
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return
      setIsOverlayOpen(false)
      setFocusedMarker(null)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [isOverlayOpen])

  const closeTestimonial = () => {
    setIsOverlayOpen(false)
    setFocusedMarker(null)
  }

  const selectAndOpen = (testimonialId, marker = markerForTestimonial(testimonialId)) => {
    setActiveId(testimonialId)
    setFocusedMarker(marker)
    setIsOverlayOpen(true)
  }

  const selectMapMarker = (marker) => {
    selectAndOpen(marker.testimonialId, marker)
  }

  const showPrevious = () => {
    const previousId = activeId === 0 ? GLOBE_TESTIMONIALS.length - 1 : activeId - 1
    selectAndOpen(previousId)
  }

  const showNext = () => {
    selectAndOpen((activeId + 1) % GLOBE_TESTIMONIALS.length)
  }

  const handleTouchStart = (event) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null
  }

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current
    const distance = endX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(distance) < 44) return
    if (distance > 0) showPrevious()
    else showNext()
  }

  return (
    <div className="globe-testimonials-experience">
      <style>{`
        .about-globe-testimonials-section { display: block; }
        .about-globe-testimonials-heading { max-width: 960px; margin-bottom: clamp(36px, 6vw, 72px); }
        .about-globe-testimonials-heading > p {
          max-width: 720px;
          color: #c8c4bd;
          font-size: clamp(1rem, 1.6vw, 1.25rem);
        }

        .globe-testimonials-experience {
          position: relative;
          width: 100%;
          overflow: hidden;
          border: 1px solid rgba(244, 162, 97, 0.22);
          background: #050505;
        }

        .globe-testimonials-stage,
        .globe-testimonials-canvas { position: relative; background: #050505; }
        .globe-testimonials-stage { isolation: isolate; }
        .globe-testimonials-canvas {
          height: clamp(520px, 57vw, 680px);
          border-bottom: 1px solid rgba(244, 162, 97, 0.18);
        }

        .globe-testimonials-world {
          position: relative;
          display: grid;
          box-sizing: border-box;
          width: 100%;
          height: 100%;
          overflow: hidden;
          padding: clamp(46px, 4.8vw, 58px) clamp(4px, 1vw, 12px) clamp(42px, 4vw, 52px);
          place-items: center;
          background: radial-gradient(circle at 40% 50%, rgba(244, 162, 97, 0.17), transparent 44%), #080808;
        }

        .globe-testimonials-world-map {
          position: relative;
          width: min(106%, 1440px);
          max-height: 100%;
          aspect-ratio: 2 / 1;
          overflow: hidden;
          border: 1px solid rgba(244, 162, 97, 0.34);
          background-color: #121212;
          background-position: center;
          background-repeat: no-repeat;
          background-size: 100% 100%;
          box-shadow: inset 0 0 72px rgba(0, 0, 0, 0.28), 0 0 42px rgba(244, 162, 97, 0.12), 0 20px 70px rgba(0, 0, 0, 0.26);
          filter: brightness(1.7) saturate(1.1) contrast(1.1);
          backface-visibility: hidden;
          will-change: transform, transform-origin, filter;
          transition:
            transform 1.35s cubic-bezier(0.16, 1, 0.3, 1),
            transform-origin 1.35s cubic-bezier(0.16, 1, 0.3, 1),
            filter 900ms ease,
            box-shadow 900ms ease;
        }

        .globe-testimonials-world-map.is-focused {
          filter: brightness(1.6) saturate(1.22) contrast(1.12);
          box-shadow: inset 0 0 82px rgba(0, 0, 0, 0.24), 0 0 56px rgba(244, 162, 97, 0.16), 0 26px 90px rgba(0, 0, 0, 0.34);
        }

        .globe-testimonials-world-map::after {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(90deg, rgba(5, 5, 5, 0.12), transparent 18%, transparent 82%, rgba(5, 5, 5, 0.14)), linear-gradient(180deg, rgba(244, 162, 97, 0.04), transparent 55%, rgba(5, 5, 5, 0.1));
          content: '';
          pointer-events: none;
        }

        .globe-testimonials-world-map-grid {
          position: absolute;
          inset: 0;
          z-index: 1;
          background-image: linear-gradient(rgba(255, 255, 255, 0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.055) 1px, transparent 1px);
          background-size: 12.5% 25%;
          pointer-events: none;
        }

        .globe-testimonials-world-point {
          position: absolute;
          z-index: 3;
          display: grid;
          width: 36px;
          height: 36px;
          padding: 0;
          border: 0;
          border-radius: 50%;
          place-items: center;
          background: transparent;
          cursor: pointer;
          opacity: 1;
          transform: translate(-50%, -50%) scale(var(--map-inverse-zoom, 1));
          transform-origin: center;
          will-change: transform, opacity;
          transition:
            transform 1.35s cubic-bezier(0.16, 1, 0.3, 1),
            opacity 600ms ease;
        }

        .globe-testimonials-world-point.is-muted { opacity: 0.14; }
        .globe-testimonials-world-point.is-focused { z-index: 5; }

        .globe-testimonials-world-point::before {
          position: absolute;
          width: 21px;
          height: 21px;
          border: 1px solid rgba(244, 162, 97, 0.56);
          border-radius: 50%;
          content: '';
          animation: globe-testimonials-point-pulse 2.6s ease-out infinite;
          animation-delay: var(--point-delay);
        }

        .globe-testimonials-world-point span {
          display: block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #F4A261;
          box-shadow: 0 0 8px #F4A261, 0 0 21px rgba(244, 162, 97, 0.94);
          transition: background 200ms ease, box-shadow 200ms ease, transform 200ms ease;
        }

        .globe-testimonials-world-point:hover span,
        .globe-testimonials-world-point:focus-visible span,
        .globe-testimonials-world-point.is-active span,
        .globe-testimonials-world-point.is-focused span {
          background: #fff;
          box-shadow: 0 0 9px #fff, 0 0 26px rgba(244, 162, 97, 1);
          transform: scale(1.38);
        }

        .globe-testimonials-world-point:focus-visible {
          outline: 1px solid rgba(244, 162, 97, 0.82);
          outline-offset: 1px;
        }

        @keyframes globe-testimonials-point-pulse {
          0% { opacity: 0.8; transform: scale(0.55); }
          72%, 100% { opacity: 0; transform: scale(1.5); }
        }

        .globe-testimonials-map-focus {
          position: absolute;
          top: 20px;
          left: 50%;
          z-index: 4;
          display: grid;
          min-width: 138px;
          gap: 3px;
          padding: 9px 13px 9px 17px;
          border: 1px solid rgba(244, 162, 97, 0.42);
          background: rgba(5, 5, 5, 0.82);
          box-shadow: 0 14px 38px rgba(0, 0, 0, 0.32);
          color: #fff;
          pointer-events: none;
          translate: -50% 0;
          backdrop-filter: blur(12px);
        }

        .globe-testimonials-map-focus::before {
          position: absolute;
          top: 8px;
          bottom: 8px;
          left: 7px;
          width: 2px;
          background: #F4A261;
          box-shadow: 0 0 12px rgba(244, 162, 97, 0.8);
          content: '';
        }

        .globe-testimonials-map-focus span {
          color: rgba(255, 255, 255, 0.54);
          font: 600 0.49rem/1.2 'DM Mono', monospace;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .globe-testimonials-map-focus strong {
          color: #fff;
          font: 800 0.7rem/1.2 'Montserrat', Arial, sans-serif;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .globe-testimonials-map-meta {
          position: absolute;
          top: 20px;
          left: 20px;
          z-index: 4;
          display: grid;
          grid-template-columns: 34px minmax(0, 1fr);
          gap: 10px;
          align-items: center;
          max-width: min(360px, calc(100% - 40px));
          margin: 0;
          padding: 10px 12px;
          border: 1px solid rgba(244, 162, 97, 0.22);
          background: rgba(5, 5, 5, 0.76);
          color: #fff;
          pointer-events: none;
          backdrop-filter: blur(10px);
        }

        .globe-testimonials-map-meta-icon {
          display: grid;
          width: 32px;
          height: 32px;
          border: 1px solid rgba(244, 162, 97, 0.48);
          place-items: center;
          color: #F4A261;
          font: 500 1rem/1 'DM Mono', monospace;
        }

        .globe-testimonials-map-meta-copy { display: grid; gap: 3px; }
        .globe-testimonials-map-meta-copy strong {
          color: #fff;
          font: 700 0.61rem/1.25 'DM Mono', monospace;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .globe-testimonials-map-meta-copy small {
          color: rgba(255, 255, 255, 0.56);
          font: 500 0.53rem/1.35 'DM Mono', monospace;
          letter-spacing: 0.055em;
          text-transform: uppercase;
        }

        .globe-testimonials-location-index {
          position: absolute;
          bottom: 18px;
          left: 20px;
          z-index: 4;
          display: flex;
          width: fit-content;
          gap: 1px;
          padding: 5px 7px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(5, 5, 5, 0.68);
          backdrop-filter: blur(8px);
        }

        .globe-testimonials-location-index button {
          position: relative;
          width: 24px;
          height: 24px;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: transparent;
          color: transparent;
          font-size: 0;
          cursor: pointer;
        }

        .globe-testimonials-location-index button::after {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 6px;
          height: 6px;
          border: 1px solid rgba(244, 162, 97, 0.68);
          border-radius: 50%;
          background: rgba(5, 5, 5, 0.82);
          content: '';
          transform: translate(-50%, -50%);
          transition: background 160ms ease, transform 160ms ease;
        }

        .globe-testimonials-location-index button:hover::after,
        .globe-testimonials-location-index button:focus-visible::after,
        .globe-testimonials-location-index button.is-active::after {
          background: #F4A261;
          transform: translate(-50%, -50%) scale(1.35);
        }

        .globe-testimonials-overlay {
          position: absolute;
          top: 22px;
          right: 22px;
          bottom: 22px;
          z-index: 200;
          box-sizing: border-box;
          width: min(430px, 40vw);
          max-width: min(800px, calc(100% - 44px));
          max-height: 90vh;
          overflow-x: hidden;
          overflow-y: auto;
          padding: 0;
          border: 1px solid rgba(244, 162, 97, 0.34);
          background: rgba(5, 5, 5, 0.9);
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.48);
          scrollbar-color: rgba(244, 162, 97, 0.48) transparent;
          scrollbar-width: thin;
          backdrop-filter: blur(18px);
        }

        .globe-testimonials-overlay-shell { width: 100%; min-height: 100%; }
        .globe-testimonials-close {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 400;
          display: grid;
          width: 32px;
          height: 32px;
          padding: 0;
          border: 1px solid rgba(244, 162, 97, 0.4);
          place-items: center;
          background: transparent;
          color: rgba(244, 162, 97, 0.7);
          font: 500 1.35rem/1 'Inter', Arial, sans-serif;
          cursor: pointer;
          transition: all 180ms ease;
        }
        .globe-testimonials-close:hover,
        .globe-testimonials-close:focus-visible {
          background: rgba(244, 162, 97, 0.1);
          border-color: #F4A261;
          color: #F4A261;
          box-shadow: 0 0 16px rgba(244, 162, 97, 0.4);
          transform: rotate(6deg);
        }

        .globe-testimonials-card { 
          position: relative;
          z-index: 100;
          display: block; 
          min-height: 0; 
        }
        .globe-testimonials-media {
          position: relative;
          z-index: 1;
          width: 100%;
          min-height: 176px;
          aspect-ratio: 16 / 7.7;
          overflow: hidden;
          border-bottom: 1px solid rgba(244, 162, 97, 0.24);
          background: #11100f;
          padding-bottom: 0;
        }
        .globe-testimonials-media-visual {
          position: absolute;
          inset: 0;
          z-index: 0;
          display: block;
          width: 100%;
          height: 100%;
          border: 0;
          object-fit: cover;
          filter: saturate(0.82) contrast(1.06) brightness(0.7);
        }
        .globe-testimonials-media-scrim {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(180deg, rgba(5, 5, 5, 0.05) 20%, rgba(5, 5, 5, 0.74) 100%);
          pointer-events: none;
        }
        .globe-testimonials-video-placeholder {
          position: absolute;
          inset: 15px;
          z-index: 2;
          display: flex;
          flex-direction: column;
          gap: 4px;
          align-items: center;
          justify-content: center;
          padding-bottom: 30px;
          aspect-ratio: 16 / 9;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          background: rgba(15, 15, 15, 0.65);
          -webkit-backdrop-filter: blur(20px);
          backdrop-filter: blur(20px);
          color: #fff;
          pointer-events: none;
        }
        @supports not (backdrop-filter: blur(20px)) {
          .globe-testimonials-video-placeholder {
            background: rgba(0, 0, 0, 0.88);
          }
        }
        .globe-testimonials-video-play-icon {
          display: grid;
          width: 40px;
          height: 40px;
          place-items: center;
          color: #F4A261;
          opacity: 0.7;
          filter: drop-shadow(0 0 10px rgba(212, 120, 56, 0.4));
          transition: transform 200ms ease, opacity 200ms ease, filter 200ms ease;
          cursor: pointer;
        }
        .globe-testimonials-video-play-icon:hover {
          transform: scale(1.05);
          opacity: 0.95;
          filter: drop-shadow(0 0 16px rgba(212, 120, 56, 0.7));
        }
        .globe-testimonials-video-text {
          color: rgba(255, 255, 255, 0.6);
          font: 300 0.6875rem/1.3 'DM Mono', monospace;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.9);
        }

        .globe-testimonials-portrait-wrap {
          position: absolute;
          bottom: 24px;
          left: 24px;
          z-index: 10;
          width: 88px;
          height: 88px;
        }
        .globe-testimonials-portrait {
          position: relative;
          z-index: 2;
          display: grid;
          width: 100%;
          height: 100%;
          border: 2px solid rgba(212, 120, 56, 0.5);
          border-radius: 50%;
          place-items: center;
          background: #0c0c0d;
          object-fit: cover;
          box-shadow: 0 0 0 5px rgba(5, 5, 5, 0.9), 0 0 24px rgba(244, 162, 97, 0.32);
          color: #F4A261;
          font: 800 1.375rem/1 'Montserrat', Arial, sans-serif;
          letter-spacing: -0.04em;
          text-align: center;
        }
        .globe-testimonials-country-flag {
          position: absolute;
          right: -4px;
          bottom: -4px;
          z-index: 2;
          width: 20px;
          height: 20px;
          border: 2px solid #000000;
          border-radius: 50%;
          background: transparent;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
          overflow: hidden;
        }
        .globe-testimonials-country-flag svg,
        .globe-testimonials-country-flag img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .globe-testimonials-country-fallback {
          display: grid;
          place-items: center;
          width: 100%;
          height: 100%;
          background: #F4A261;
          color: #050505;
          font: 700 0.5rem/1 'Montserrat', Arial, sans-serif;
          letter-spacing: -0.02em;
        }

        .globe-testimonials-story { min-width: 0; padding: 44px 20px 0; }
        .globe-testimonials-eyebrow {
          margin: 0 0 0.45rem;
          color: #F4A261;
          font: 700 0.55rem/1.3 'DM Mono', monospace;
          letter-spacing: 0.11em;
          text-transform: uppercase;
        }
        .globe-testimonials-name {
          margin: 0;
          color: #fff;
          font-family: 'Montserrat', Arial, sans-serif;
          font-size: clamp(1.55rem, 2.5vw, 2.15rem);
          font-weight: 900;
          line-height: 0.96;
          letter-spacing: -0.04em;
          text-transform: uppercase;
        }
        .globe-testimonials-person-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.28rem 0.52rem;
          margin: 0.65rem 0 0;
          color: #F4A261;
          font: 700 0.55rem/1.4 'DM Mono', monospace;
          letter-spacing: 0.055em;
          text-transform: uppercase;
        }
        .globe-testimonials-person-meta span + span::before {
          margin-right: 0.52rem;
          color: rgba(255, 255, 255, 0.3);
          content: '·';
        }
        .globe-testimonials-quote {
          margin: 15px 0;
          color: #fff;
          font-family: 'Inter', Arial, sans-serif;
          font-size: clamp(1rem, 1.5vw, 1.18rem);
          font-style: italic;
          font-weight: 300;
          line-height: 1.25;
        }
        .globe-testimonials-result {
          display: inline-flex;
          width: fit-content;
          margin: 0;
          padding: 0.48rem 0.58rem;
          border: 1px solid rgba(244, 162, 97, 0.65);
          color: #F4A261;
          font: 700 0.53rem/1.3 'DM Mono', monospace;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }
        .globe-testimonials-result strong {
          margin-right: 0.35rem;
          color: rgba(255, 255, 255, 0.52);
          font-weight: 500;
        }

        .globe-testimonials-navigation {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
          gap: 7px;
          align-items: center;
          margin: 18px 20px 0;
        }
        .globe-testimonials-navigation button {
          min-height: 39px;
          padding: 0.68rem 0.62rem;
          border: 1px solid rgba(244, 162, 97, 0.8);
          background: transparent;
          color: #F4A261;
          font: 800 0.53rem/1 'DM Mono', monospace;
          letter-spacing: 0.065em;
          cursor: pointer;
          transition: background 180ms ease, color 180ms ease, transform 180ms ease;
        }
        .globe-testimonials-navigation button:hover,
        .globe-testimonials-navigation button:focus-visible {
          background: #F4A261;
          color: #050505;
          transform: translateY(-1px);
        }
        .globe-testimonials-counter {
          min-width: 48px;
          color: #fff;
          font: 700 0.6rem/1 'DM Mono', monospace;
          text-align: center;
        }
        .globe-testimonials-disclaimer {
          display: block;
          margin: 12px 20px 18px;
          color: #77736d;
          font: 400 0.56rem/1.45 'Inter', Arial, sans-serif;
          text-align: center;
        }

        .globe-testimonials-media {
          background:
            linear-gradient(rgba(244, 162, 97, 0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(244, 162, 97, 0.055) 1px, transparent 1px),
            radial-gradient(circle at 72% 28%, rgba(244, 162, 97, 0.19), transparent 34%),
            #0b0a09;
          background-size: 34px 34px, 34px 34px, auto, auto;
        }

        @media (min-width: 701px) and (max-width: 1024px) {
          .globe-testimonials-overlay {
            width: min(500px, 50vw);
            max-width: calc(100% - 44px);
          }
        }

        @media (max-width: 700px) {
          .globe-testimonials-experience { overflow: visible; }
          .globe-testimonials-canvas { height: 370px; }
          .globe-testimonials-world { padding: 48px 0 34px; }
          .globe-testimonials-world-map { width: 118%; }
          .globe-testimonials-world-point { width: 32px; height: 32px; }
          .globe-testimonials-world-point::before { width: 18px; height: 18px; }
          .globe-testimonials-world-point span { width: 7px; height: 7px; }
          .globe-testimonials-map-focus {
            top: 68px;
            left: 10px;
            min-width: 124px;
            padding-block: 8px;
            translate: 0 0;
          }
          .globe-testimonials-map-meta {
            top: 10px;
            left: 10px;
            grid-template-columns: 30px minmax(0, 1fr);
            max-width: calc(100% - 20px);
            padding: 8px 10px;
          }
          .globe-testimonials-map-meta-icon { width: 28px; height: 28px; }
          .globe-testimonials-map-meta-copy small { font-size: 0.47rem; }
          .globe-testimonials-location-index { bottom: 10px; left: 10px; }
          .globe-testimonials-overlay {
            position: relative;
            inset: auto;
            width: 100%;
            max-width: none;
            min-height: 0;
            overflow: visible;
            border-width: 0 0 1px;
            box-shadow: none;
          }
          .globe-testimonials-overlay-shell { min-height: 0; }
          .globe-testimonials-media { min-height: 190px; aspect-ratio: 16 / 8.8; }
          .globe-testimonials-portrait-wrap { bottom: 20px; left: 20px; width: 72px; height: 72px; }
          .globe-testimonials-country-flag { width: 18px; height: 18px; right: -3px; bottom: -3px; }
          .globe-testimonials-story { padding: 40px 17px 0; }
          .globe-testimonials-person-meta { display: grid; gap: 0.22rem; }
          .globe-testimonials-person-meta span + span::before { content: none; }
          .globe-testimonials-navigation { margin: 18px 17px 0; }
          .globe-testimonials-navigation button { padding-inline: 0.4rem; font-size: 0.5rem; }
        }

        @media (prefers-reduced-motion: reduce) {
          .globe-testimonials-world-point::before { animation: none; }
          .globe-testimonials-world-map,
          .globe-testimonials-world-point,
          .globe-testimonials-close,
          .globe-testimonials-location-index button::after,
          .globe-testimonials-navigation button { transition: none; }
        }
      `}</style>
      <div className={`globe-testimonials-stage${isOverlayOpen ? ' is-overlay-open' : ''}`}>
        <div className="globe-testimonials-canvas">
          <InteractiveWorldMap
            activeTestimonial={activeTestimonial}
            focusedMarker={focusedMarker}
            onSelect={selectMapMarker}
          />

          <AnimatePresence mode="wait">
            {focusedMarker && activeFocusPreset && (
              <motion.div
                key={focusedMarker.country}
                className="globe-testimonials-map-focus"
                role="status"
                aria-live="polite"
                aria-atomic="true"
                data-focused-region={focusedMarker.country}
                initial={reducedMotion ? false : { opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                transition={reducedMotion ? { duration: 0 } : { duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              >
                <span>{activeFocusPreset.eyebrow}</span>
                <strong>{activeFocusPreset.label}</strong>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="globe-testimonials-map-meta" aria-label="Información del mapa de historias">
            <span className="globe-testimonials-map-meta-icon" aria-hidden="true">+</span>
            <span className="globe-testimonials-map-meta-copy">
              <strong>Explora el mapa</strong>
              <small>15 puntos · 10 Colombia · 3 España · Miami · Argentina</small>
            </span>
          </div>

          <div className="globe-testimonials-location-index" aria-label="Seleccionar una historia">
            {GLOBE_TESTIMONIALS.map((testimonial) => (
              <button
                key={testimonial.id}
                type="button"
                className={testimonial.id === activeId ? 'is-active' : ''}
                aria-label={`Abrir historia de ${testimonial.name} en ${testimonial.city}`}
                aria-pressed={testimonial.id === activeId && isOverlayOpen}
                title={`${testimonial.city}, ${testimonial.country}`}
                onClick={() => selectAndOpen(testimonial.id)}
              />
            ))}
          </div>
        </div>

        <AnimatePresence>
          {isOverlayOpen && (
            <motion.aside
              key="testimonial-overlay"
              className="globe-testimonials-overlay"
              role="dialog"
              aria-modal="false"
              aria-labelledby="globe-testimonial-title"
              initial={reducedMotion ? false : { opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <button
                type="button"
                className="globe-testimonials-close"
                aria-label="Cerrar testimonio y volver al mapa"
                onClick={closeTestimonial}
              >
                <X size={18} strokeWidth={1} aria-hidden="true" />
              </button>

              <div className="globe-testimonials-overlay-shell">
                <div aria-live="polite" aria-atomic="true">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.article
                      key={activeTestimonial.id}
                      className="globe-testimonials-card"
                      initial={reducedMotion ? false : { opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
                      transition={reducedMotion ? { duration: 0 } : { duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      style={{ willChange: 'transform, opacity' }}
                    >
                      <div
                        className="globe-testimonials-media"
                        aria-label={`Marcador editorial de ${activeTestimonial.name}`}
                      >
                        {activeTestimonial.image && (
                          <img
                            src={testimonialVariant(activeTestimonial.image, 960)}
                            srcSet={[
                              `${testimonialVariant(activeTestimonial.image, 256)} 256w`,
                              `${testimonialVariant(activeTestimonial.image, 960)} 960w`,
                            ].join(', ')}
                            sizes="(max-width: 700px) 100vw, 700px"
                            alt={`${activeTestimonial.name}, ${activeTestimonial.role}`}
                            className="globe-testimonials-media-visual"
                            width="960"
                            height="540"
                            loading="lazy"
                            decoding="async"
                          />
                        )}
                        <span className="globe-testimonials-media-scrim" aria-hidden="true" />
                        
                        <div className="globe-testimonials-video-placeholder" aria-label="Espacio reservado para video testimonial">
                          <span className="globe-testimonials-video-play-icon">
                            <Play size={40} strokeWidth={1.5} aria-hidden="true" />
                          </span>
                          <span className="globe-testimonials-video-text">VIDEO PRÓXIMAMENTE</span>
                        </div>

                        <div className="globe-testimonials-portrait-wrap">
                          <TestimonialAvatar testimonial={activeTestimonial} />
                          <CountryFlag 
                            countryCode={activeTestimonial.countryCode} 
                            countryName={activeTestimonial.country}
                          />
                        </div>
                      </div>

                      <div className="globe-testimonials-story">
                        <p className="globe-testimonials-eyebrow">
                          HISTORIA {String(activeTestimonial.id + 1).padStart(2, '0')} / {GLOBE_TESTIMONIALS.length}
                        </p>
                        <h3 id="globe-testimonial-title" className="globe-testimonials-name">
                          {activeTestimonial.name}
                        </h3>
                        <p className="globe-testimonials-person-meta">
                          {activeTestimonial.age !== null && <span>{activeTestimonial.age} AÑOS</span>}
                          <span>{activeTestimonial.role}</span>
                          <span>{activeTestimonial.city} · {activeTestimonial.country}</span>
                        </p>
                        <blockquote className="globe-testimonials-quote">
                          “{activeTestimonial.quote}”
                        </blockquote>
                        <p className="globe-testimonials-result">
                          <strong>Resultado:</strong> {activeTestimonial.result}
                        </p>
                      </div>
                    </motion.article>
                  </AnimatePresence>
                </div>

                <nav className="globe-testimonials-navigation" aria-label="Navegar testimonios">
                  <button type="button" onClick={showPrevious} aria-label="Mostrar testimonio anterior">
                    <ChevronLeft size={15} strokeWidth={1} aria-hidden="true" /> ANTERIOR
                  </button>
                  <span className="globe-testimonials-counter" aria-live="off">
                    {activeTestimonial.id + 1} / {GLOBE_TESTIMONIALS.length}
                  </span>
                  <button type="button" onClick={showNext} aria-label="Mostrar testimonio siguiente">
                    SIGUIENTE <ChevronRight size={15} strokeWidth={1} aria-hidden="true" />
                  </button>
                </nav>

                <small className="globe-testimonials-disclaimer">
                  Historias compartidas por alumnos. Algunos nombres o detalles pueden haberse
                  simplificado para proteger privacidad.
                </small>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
