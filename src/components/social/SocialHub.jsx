import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { SectionLabel } from '../Layout'
import { socialLinks, overrides, hubCopy } from '../../config/social.config'
import { resolveProfiles } from '../../lib/social/platforms'
import { fetchFeeds } from '../../lib/social/feed'
import PlatformCard from './PlatformCard'
import LatestContentSection from './LatestContentSection'

const KIND_LABEL = {
  post: 'Publicaciones',
  video: 'Vídeos',
  article: 'Artículos',
  podcast: 'Podcast',
  product: 'Productos',
  event: 'Eventos',
  project: 'Proyectos',
  community: 'Comunidad',
}

/** Default editorial copy when no override is supplied. */
const DEFAULT_DESC = {
  instagram: 'Movimiento, método y diario visual de BAYONA.',
  youtube: 'Documentales y clases sobre ciencia del movimiento y el rendimiento.',
  tiktok: 'Píldoras de entrenamiento, parkour y mentalidad.',
  linkedin: 'Visión, método y dirección de BAYONA como empresa.',
  github: 'Código abierto y experimentos del equipo de producto.',
  facebook: 'Comunidad, eventos y novedades de la red BAYONA.',
  threads: 'Conversación y reflexión alrededor del movimiento con propósito.',
  x: 'Pensamiento en corto y señales desde el núcleo de BAYONA.',
  spotify: 'Podcast y playlists para entrenar, crear y recuperar.',
  discord: 'El espacio de conversación de la comunidad BAYONA.',
  behance: 'Identidad, dirección de arte y diseño de BAYONA.',
  dribbble: 'Detalles de producto e interfaces en evolución.',
  medium: 'Ensayos sobre rendimiento humano, ciencia y disciplina.',
  substack: 'Cartas largas sobre método, biología y propósito.',
  patreon: 'Acceso exclusivo a archivos, sesiones y procesos internos.',
  gumroad: 'Planes, guías y herramientas digitales.',
  calendly: 'Reserva una sesión o una llamada de orientación.',
  twitch: 'Directos de entrenamiento, creación y proceso.',
  pinterest: 'Tablero visual de inspiración y estética BAYONA.',
  website: 'La sede digital principal de BAYONA.',
}

function withDefaults(profile) {
  const o = overrides[profile.id] || {}
  return {
    ...profile,
    description: o.description || '',
    fallbackDesc: DEFAULT_DESC[profile.id] || 'Parte de BAYONA.',
    followers: o.followers || '',
    verified: Boolean(o.verified),
    accent: o.accent || profile.accent,
    channelId: o.channelId || profile.channelId || '',
    latestItems: o.latestItems || [],
    kindLabel: KIND_LABEL[profile.kind] || profile.kind,
    followerLabel: hubCopy.followerLabel,
  }
}

export default function SocialHub() {
  const reducedMotion = useReducedMotion()
  const profiles = useMemo(() => resolveProfiles(socialLinks).map(withDefaults), [])
  const [feeds, setFeeds] = useState(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profiles.length === 0) {
      setLoading(false)
      return
    }
    // Manual overrides win: seed the feed map instantly, then fetch the rest.
    const seeded = new Map()
    for (const p of profiles) {
      if (p.latestItems?.length) seeded.set(p.id, { platform: p.id, items: p.latestItems, source: 'manual' })
    }
    setFeeds(seeded)

    const ctrl = new AbortController()
    const needsFetch = profiles.filter(p => !seeded.has(p.id))
    setLoading(needsFetch.length > 0)
    fetchFeeds(needsFetch, ctrl.signal).then(result => {
      setFeeds(prev => new Map([...prev, ...result]))
      setLoading(false)
    })
    return () => ctrl.abort()
  }, [profiles])

  if (profiles.length === 0) {
    return (
      <section className="social-hub section-shell" aria-label="Sede de redes BAYONA">
        <div className="social-hub-head">
          <SectionLabel>{hubCopy.kicker}</SectionLabel>
          <h2>{hubCopy.titleLine1}<br /><span>{hubCopy.titleLine2}</span></h2>
        </div>
        <motion.div
          className="social-empty"
          initial={reducedMotion ? false : { opacity: 0, y: 18 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={reducedMotion ? undefined : { duration: 0.6 }}
        >
          <p className="social-empty-title">{hubCopy.emptyTitle}</p>
          <p className="social-empty-body">{hubCopy.emptyBody}</p>
        </motion.div>
      </section>
    )
  }

  return (
    <>
      <section className="social-hub section-shell" aria-label="Sede de redes BAYONA">
        <div className="social-hub-head">
          <SectionLabel>{hubCopy.kicker}</SectionLabel>
          <h2>{hubCopy.titleLine1}<br /><span>{hubCopy.titleLine2}</span></h2>
          <p className="social-hub-intro">{hubCopy.intro}</p>
        </div>
        <div className="social-grid">
          {profiles.map(p => (
            <PlatformCard
              key={p.id}
              profile={p}
              items={feeds.get(p.id)?.items || []}
              loading={loading && !feeds.has(p.id)}
            />
          ))}
        </div>
        {loading && (
          <motion.p
            className="social-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            aria-live="polite"
          >
            <span className="social-loading-dot" />{hubCopy.loadingLabel}
          </motion.p>
        )}
      </section>

      <LatestContentSection profiles={profiles} feeds={feeds} />
    </>
  )
}
