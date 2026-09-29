import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { SectionLabel } from '../Layout'
import Glyph from './Glyph'

/**
 * BAYONA · SOCIAL HUB — SMART ORGANIZATION
 * Groups every fetched/curated item across all platforms into editorial
 * sections. Only sections that contain content are rendered.
 */

const SECTIONS = [
  { group: 'video', label: 'Vídeos', eyebrow: 'EN MOVIMIENTO' },
  { group: 'article', label: 'Artículos', eyebrow: 'IDEAS Y MÉTODO' },
  { group: 'post', label: 'Reels y Publicaciones', eyebrow: 'LO ÚLTIMO' },
  { group: 'podcast', label: 'Podcast', eyebrow: 'AUDIO' },
  { group: 'product', label: 'Productos', eyebrow: 'HECHO POR BAYONA' },
  { group: 'event', label: 'Eventos', eyebrow: 'EN VIVO' },
]

function relDate(d) {
  if (!d) return null
  const date = new Date(d)
  if (Number.isNaN(date.getTime())) return null
  const days = Math.round((Date.now() - date.getTime()) / 86400000)
  if (days <= 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  if (days < 7) return `Hace ${days} días`
  if (days < 30) return `Hace ${Math.round(days / 7)} sem`
  if (days < 365) return `Hace ${Math.round(days / 30)} meses`
  return `Hace ${Math.round(days / 365)} años`
}

export default function LatestContentSection({ profiles, feeds }) {
  const grouped = useMemo(() => {
    const map = { video: [], article: [], post: [], podcast: [], product: [], event: [], project: [] }
    for (const p of profiles) {
      const items = (feeds.get(p.id)?.items) || []
      for (const it of items) {
        map[it.kind || p.group]?.push({ ...it, platform: p })
      }
    }
    // Merge project into the relevant editorial bucket to keep nav lean.
    if (map.project.length) {
      map.article.push(...map.project)
    }
    return map
  }, [profiles, feeds])

  const visible = SECTIONS.filter(s => (grouped[s.group]?.length || 0) > 0)
  if (visible.length === 0) return null

  return (
    <section className="social-content section-shell" aria-label="Contenido reciente de BAYONA">
      <div className="social-content-head">
        <SectionLabel>03 / CONTENIDO RECIENTE</SectionLabel>
        <h2>LO QUE BAYONA<br /><span>CREA HOY.</span></h2>
        <p className="social-content-sub">
          Una sola corriente de contenido. Seleccionada desde cada plataforma, organizada para que la encuentres sin ruido.
        </p>
      </div>

      {visible.map(section => (
        <div className="social-block" key={section.group}>
          <div className="social-block-label">
            <SectionLabel>{section.eyebrow}</SectionLabel>
            <h3>{section.label}</h3>
            <span className="social-block-count">{grouped[section.group].length}</span>
          </div>
          <div className="social-block-grid">
            {grouped[section.group].slice(0, 6).map((it, i) => (
              <motion.a
                key={`${it.platform.id}-${it.url}-${i}`}
                href={it.url}
                target="_blank"
                rel="noreferrer"
                className="social-tile"
                style={{ '--brand': it.platform.accent }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-8% 0px' }}
                transition={{ duration: 0.5, delay: Math.min(i * 0.04, 0.24), ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="social-tile-media" aria-hidden="true">
                  {it.thumb ? (
                    <img src={it.thumb} alt="" loading="lazy" decoding="async" />
                  ) : null}
                  <span className="social-tile-platform" style={{ color: it.platform.accent }}>
                    <Glyph name={it.platform.glyph} size={16} />
                  </span>
                </span>
                <span className="social-tile-body">
                  <span className="social-tile-title">{it.title}</span>
                  <span className="social-tile-foot">
                    <span className="social-tile-src">{it.platform.label}</span>
                    {relDate(it.date) && <span className="social-tile-date">{relDate(it.date)}</span>}
                    <ArrowUpRight size={13} className="social-tile-arrow" />
                  </span>
                </span>
              </motion.a>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
