import { useEffect, useId, useMemo, useState } from 'react'
import { Play } from 'lucide-react'
import { useReducedMotion } from 'framer-motion'
import '../styles/video-section.css'

const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{6,32}$/
const VALID_PLACEMENTS = new Set(['standalone', 'contained', 'media'])

function formatDurationLabel(duration) {
  if (typeof duration === 'string') return duration.trim().toUpperCase()
  if (!Number.isFinite(duration) || duration <= 0) return ''

  const totalSeconds = Math.round(duration)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (minutes === 0) return `${seconds} SEG`
  if (seconds === 0) return `${minutes} MIN`
  return `${minutes}:${String(seconds).padStart(2, '0')} MIN`
}

export default function VideoSection({
  title,
  subtitle,
  videoId,
  videoUrl,
  poster,
  duration,
  placement = 'standalone',
  muted = false,
  captionsSrc,
  captionsLabel = 'Español',
}) {
  const [hasStarted, setHasStarted] = useState(false)
  const reducedMotion = useReducedMotion()
  const titleId = useId()
  const normalizedPlacement = VALID_PLACEMENTS.has(placement) ? placement : 'standalone'
  const safeVideoId = typeof videoId === 'string' && YOUTUBE_ID_PATTERN.test(videoId.trim())
    ? videoId.trim()
    : ''
  const safeVideoUrl = typeof videoUrl === 'string' ? videoUrl.trim() : ''
  const safeCaptionsSrc = typeof captionsSrc === 'string' ? captionsSrc.trim() : ''
  const hasVideo = Boolean(safeVideoId || safeVideoUrl)
  const durationLabel = formatDurationLabel(duration)
  const youtubeEmbedUrl = useMemo(() => {
    if (!safeVideoId) return ''
    const autoplay = reducedMotion ? '0' : '1'
    const mute = muted ? '1' : '0'
    return `https://www.youtube-nocookie.com/embed/${safeVideoId}?autoplay=${autoplay}&mute=${mute}&rel=0&modestbranding=1`
  }, [muted, reducedMotion, safeVideoId])

  useEffect(() => {
    setHasStarted(false)
  }, [safeVideoId, safeVideoUrl])

  const frame = (
    <div className="video-section__stage">
      <div className={`video-section__frame${hasStarted ? ' is-loaded' : ''}`}>
        {hasStarted && hasVideo && (
          <div className="video-section__player">
            {safeVideoId ? (
              <iframe
                src={youtubeEmbedUrl}
                title={title}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <video
                src={safeVideoUrl}
                poster={poster || undefined}
                controls
                autoPlay={!reducedMotion}
                muted={muted}
                playsInline
                preload="metadata"
                aria-label={title}
              >
                {safeCaptionsSrc && (
                  <track
                    kind="captions"
                    src={safeCaptionsSrc}
                    srcLang="es"
                    label={captionsLabel}
                    default
                  />
                )}
              </video>
            )}
          </div>
        )}

        <div className="video-section__poster">
          {poster && <img src={poster} alt="" loading="lazy" decoding="async" />}
          <div className="video-section__poster-grid" aria-hidden="true" />
          <div className="video-section__meta">
            <span>{hasVideo ? 'VIDEO BAYONA' : 'VIDEO PRÓXIMAMENTE'}</span>
            {durationLabel && <span>{durationLabel}</span>}
          </div>
          <div className="video-section__copy">
            {!hasVideo && <p>VIDEO PRÓXIMAMENTE · {title}</p>}
            <h2 id={titleId}>{title}</h2>
            {subtitle && <p className="video-section__subtitle">{subtitle}</p>}
          </div>
          <button
            className="video-section__play"
            type="button"
            disabled={!hasVideo}
            onClick={() => setHasStarted(true)}
            aria-label={hasVideo ? `Reproducir ${title}` : `Video próximamente: ${title}`}
          >
            <Play size={30} fill="currentColor" strokeWidth={1} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )

  if (normalizedPlacement === 'standalone') {
    return (
      <section
        className="video-section video-section--standalone"
        data-video-placement={normalizedPlacement}
        aria-labelledby={titleId}
      >
        <div className="section-shell video-section__shell">{frame}</div>
      </section>
    )
  }

  return (
    <section
      className={`video-section video-section--${normalizedPlacement}`}
      data-video-placement={normalizedPlacement}
      aria-labelledby={titleId}
    >
      {frame}
    </section>
  )
}
