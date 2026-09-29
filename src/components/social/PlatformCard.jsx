import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { ArrowUpRight, BadgeCheck } from 'lucide-react'
import Glyph from './Glyph'

/**
 * BAYONA · SOCIAL HUB — PLATFORM CARD
 * A collectible premium card. Reuses the tilt + spotlight motion language
 * established by HoloCard, tuned slower and softer for luxury.
 *
 * Brand color appears only as accents (top edge glow, dot, glyph tint) — never
 * as a loud background. Metrics render only when verified by config.
 */
export default function PlatformCard({ profile, items = [], loading = false }) {
  const reducedMotion = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [7, -7]), { stiffness: 170, damping: 18 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-9, 9]), { stiffness: 170, damping: 18 })

  const accent = '#f4a261'
  const latest = items.slice(0, 3)
  const hasContent = latest.length > 0

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    x.set(px - 0.5)
    y.set(py - 0.5)
    e.currentTarget.style.setProperty('--spot-x', `${px * 100}%`)
    e.currentTarget.style.setProperty('--spot-y', `${py * 100}%`)
  }
  const reset = (e) => {
    x.set(0); y.set(0)
    e.currentTarget.style.setProperty('--spot-x', '50%')
    e.currentTarget.style.setProperty('--spot-y', '0%')
  }

  return (
    <motion.a
      href={profile.url}
      target="_blank"
      rel="noreferrer"
      className={`social-card ${loading ? 'is-loading' : ''}`}
      style={{
        '--brand': accent,
        '--brand-alt': accent,
        rotateX: reducedMotion ? 0 : rotateX,
        rotateY: reducedMotion ? 0 : rotateY,
      }}
      onMouseMove={reducedMotion ? undefined : handleMove}
      onMouseLeave={reducedMotion ? undefined : reset}
      initial={reducedMotion ? false : { opacity: 0, y: 22 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={reducedMotion ? undefined : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      aria-label={`${profile.verbo} a BAYONA en ${profile.label}`}
    >
      <span className="social-card-edge" aria-hidden="true" />
      <span className="social-card-spotlight" aria-hidden="true" />

      <div className="social-card-head">
        <div className="social-card-glyph" style={{ color: accent }}>
          <Glyph name={profile.glyph} size={24} />
        </div>
        <div className="social-card-meta">
          <span className="social-card-platform">{profile.label}</span>
          <span className="social-card-handle">
            @{profile.handle}
            {profile.verified && (
              <BadgeCheck size={13} className="social-card-verified" aria-label="Cuenta verificada" />
            )}
          </span>
        </div>
        <span className="social-card-arrow" aria-hidden="true"><ArrowUpRight size={17} /></span>
      </div>

      <div className="social-card-body">
        <p className="social-card-desc">
          {profile.description || profile.fallbackDesc}
        </p>
        {(profile.followers || profile.kind) && (
          <div className="social-card-stats">
            {profile.followers && (
              <span className="social-card-stat">
                <b>{profile.followers}</b>
                <i>{profile.followerLabel}</i>
              </span>
            )}
            {profile.kind && (
              <span className="social-card-stat social-card-kind">
                <i className="social-card-kind-dot" />{profile.kindLabel}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="social-card-foot">
        {loading ? (
          <div className="social-card-skeleton" aria-hidden="true">
            <span /><span /><span />
          </div>
        ) : hasContent ? (
          <ul className="social-card-items">
            {latest.map((it, i) => (
              <li key={`${it.url}-${i}`}>
                <a href={it.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
                  {it.thumb && (
                    <span
                      className="social-card-thumb"
                      style={{ backgroundImage: `url(${it.thumb})` }}
                      aria-hidden="true"
                    />
                  )}
                  <span className="social-card-item-title">{it.title}</span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <span className="social-card-cta">
            {profile.verbo} en {profile.label} <ArrowUpRight size={13} />
          </span>
        )}
      </div>
    </motion.a>
  )
}
