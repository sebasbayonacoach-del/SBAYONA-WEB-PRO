/**
 * BAYONA · SOCIAL HUB — PLATFORM REGISTRY
 * ---------------------------------------------------------------------------
 * Single source of truth for platform metadata and URL detection.
 *
 * Platform identity is expressed through glyph and copy. Every visual accent
 * is normalized to BAYONA orange so third-party brand colors never leak into
 * the monochrome luxury system.
 */

const BAYONA_ACCENT = '#F4A261'

const withBayonaAccent = (metadata) => ({
  ...metadata,
  accent: BAYONA_ACCENT,
  accentAlt: BAYONA_ACCENT,
})

export const PLATFORMS = {
  instagram: withBayonaAccent({
    id: 'instagram',
    label: 'Instagram',
    hosts: ['instagram.com', 'instagr.am'],
    detect: u => u.pathname.replace('/', '').split('/')[0] || null,
    glyph: 'instagram',
    kind: 'post',
    group: 'post',
    verbo: 'Seguir',
  }),
  youtube: withBayonaAccent({
    id: 'youtube',
    label: 'YouTube',
    hosts: ['youtube.com', 'youtu.be', 'm.youtube.com'],
    detect: (u) => {
      if (u.hostname === 'youtu.be') return u.pathname.slice(1) || null
      if (u.pathname.startsWith('/channel/')) return u.pathname.split('/')[2] || null
      if (u.pathname.startsWith('/@')) return u.pathname.slice(2) || null
      if (u.pathname.startsWith('/c/') || u.pathname.startsWith('/user/')) return u.pathname.split('/')[2] || null
      if (u.pathname.startsWith('/feed') || u.pathname === '/') return null
      const seg = u.pathname.split('/')[1]
      return seg && seg !== 'watch' ? seg : null
    },
    glyph: 'youtube',
    kind: 'video',
    group: 'video',
    verbo: 'Suscribirse',
  }),
  tiktok: withBayonaAccent({
    id: 'tiktok',
    label: 'TikTok',
    hosts: ['tiktok.com', 'vm.tiktok.com'],
    detect: u => {
      const seg = u.pathname.split('@')[1]
      return seg ? seg.split('/')[0] : null
    },
    glyph: 'tiktok',
    kind: 'post',
    group: 'post',
    verbo: 'Seguir',
  }),
  linkedin: withBayonaAccent({
    id: 'linkedin',
    label: 'LinkedIn',
    hosts: ['linkedin.com'],
    detect: u => {
      if (u.pathname.startsWith('/in/')) return u.pathname.split('/')[2] || null
      if (u.pathname.startsWith('/company/')) return u.pathname.split('/')[2] || null
      return null
    },
    glyph: 'linkedin',
    kind: 'article',
    group: 'article',
    verbo: 'Conectar',
  }),
  github: withBayonaAccent({
    id: 'github',
    label: 'GitHub',
    hosts: ['github.com'],
    detect: u => {
      const seg = u.pathname.split('/')[1]
      return seg && seg !== 'orgs' ? seg : null
    },
    glyph: 'github',
    kind: 'article',
    group: 'project',
    verbo: 'Ver perfil',
  }),
  facebook: withBayonaAccent({
    id: 'facebook',
    label: 'Facebook',
    hosts: ['facebook.com', 'fb.com', 'm.facebook.com'],
    detect: u => {
      const seg = u.pathname.replace('/', '').split('/')[0]
      return seg && seg !== 'profile.php' ? seg : (u.searchParams.get('id') || null)
    },
    glyph: 'facebook',
    kind: 'post',
    group: 'post',
    verbo: 'Seguir',
  }),
  threads: withBayonaAccent({
    id: 'threads',
    label: 'Threads',
    hosts: ['threads.net'],
    detect: u => u.pathname.split('@')[1]?.split('/')[0] || null,
    glyph: 'threads',
    kind: 'post',
    group: 'post',
    verbo: 'Seguir',
  }),
  x: withBayonaAccent({
    id: 'x',
    label: 'X',
    hosts: ['x.com', 'twitter.com'],
    detect: u => {
      const seg = u.pathname.split('/')[1]
      return seg && seg !== 'home' && seg !== 'search' ? seg : null
    },
    glyph: 'x',
    kind: 'post',
    group: 'post',
    verbo: 'Seguir',
  }),
  spotify: withBayonaAccent({
    id: 'spotify',
    label: 'Spotify',
    hosts: ['spotify.com', 'open.spotify.com'],
    detect: u => u.pathname.split('/')[2] || null,
    glyph: 'spotify',
    kind: 'podcast',
    group: 'podcast',
    verbo: 'Escuchar',
  }),
  discord: withBayonaAccent({
    id: 'discord',
    label: 'Discord',
    hosts: ['discord.gg', 'discord.com', 'discordapp.com'],
    detect: u => u.pathname.replace('/', '').split('/')[0] || null,
    glyph: 'discord',
    kind: 'post',
    group: 'community',
    verbo: 'Unirme',
  }),
  behance: withBayonaAccent({
    id: 'behance',
    label: 'Behance',
    hosts: ['behance.net'],
    detect: u => u.pathname.replace('/', '').split('/')[0] || null,
    glyph: 'behance',
    kind: 'post',
    group: 'project',
    verbo: 'Ver trabajo',
  }),
  dribbble: withBayonaAccent({
    id: 'dribbble',
    label: 'Dribbble',
    hosts: ['dribbble.com'],
    detect: u => u.pathname.replace('/', '').split('/')[0] || null,
    glyph: 'dribbble',
    kind: 'post',
    group: 'project',
    verbo: 'Ver perfil',
  }),
  medium: withBayonaAccent({
    id: 'medium',
    label: 'Medium',
    hosts: ['medium.com'],
    detect: u => u.pathname.replace('/', '').split('/')[0] || null,
    glyph: 'medium',
    kind: 'article',
    group: 'article',
    verbo: 'Leer',
  }),
  substack: withBayonaAccent({
    id: 'substack',
    label: 'Substack',
    hosts: ['substack.com'],
    detect: u => {
      if (u.hostname.endsWith('.substack.com')) return u.hostname.split('.')[0]
      const seg = u.pathname.replace('/', '').split('/')[0]
      return seg && seg !== 'note' ? seg : null
    },
    glyph: 'substack',
    kind: 'article',
    group: 'article',
    verbo: 'Suscribirme',
  }),
  patreon: withBayonaAccent({
    id: 'patreon',
    label: 'Patreon',
    hosts: ['patreon.com'],
    detect: u => u.pathname.replace('/', '').split('/')[0] || null,
    glyph: 'patreon',
    kind: 'product',
    group: 'product',
    verbo: 'Apoyar',
  }),
  gumroad: withBayonaAccent({
    id: 'gumroad',
    label: 'Gumroad',
    hosts: ['gumroad.com', 'gumroad.co'],
    detect: u => {
      if (u.hostname.endsWith('.gumroad.com')) return u.hostname.split('.')[0]
      return u.pathname.replace('/', '').split('/')[0] || null
    },
    glyph: 'gumroad',
    kind: 'product',
    group: 'product',
    verbo: 'Comprar',
  }),
  calendly: withBayonaAccent({
    id: 'calendly',
    label: 'Calendly',
    hosts: ['calendly.com'],
    detect: u => u.pathname.replace('/', '').split('/')[0] || null,
    glyph: 'calendly',
    kind: 'event',
    group: 'event',
    verbo: 'Reservar',
  }),
  twitch: withBayonaAccent({
    id: 'twitch',
    label: 'Twitch',
    hosts: ['twitch.tv'],
    detect: u => u.pathname.replace('/', '').split('/')[0] || null,
    glyph: 'twitch',
    kind: 'video',
    group: 'video',
    verbo: 'Seguir',
  }),
  pinterest: withBayonaAccent({
    id: 'pinterest',
    label: 'Pinterest',
    hosts: ['pinterest.com', 'pinterest.es', 'pin.it'],
    detect: u => u.pathname.replace('/', '').split('/')[0] || null,
    glyph: 'pinterest',
    kind: 'post',
    group: 'post',
    verbo: 'Seguir',
  }),
  website: withBayonaAccent({
    id: 'website',
    label: 'Sitio web',
    hosts: [],
    detect: (u, raw) => u.hostname || raw,
    glyph: 'website',
    kind: 'article',
    group: 'article',
    verbo: 'Visitar',
  }),
}

const HOST_INDEX = (() => {
  const index = {}
  for (const platform of Object.values(PLATFORMS)) {
    for (const host of platform.hosts) index[host] = platform
  }
  return index
})()

/**
 * Detect a platform from any pasted URL. Returns a resolved profile or null.
 *   { id, label, glyph, accent, accentAlt, kind, group, verbo,
 *     url, handle, original, known }
 */
export function detectPlatform(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null
  let value = rawUrl.trim()
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`

  let url
  try {
    url = new URL(value)
  } catch {
    return null
  }

  const host = url.hostname.replace(/^www\./, '').toLowerCase()
  const known = HOST_INDEX[host]
  const platform = known || PLATFORMS.website
  const handle = known?.detect(url, rawUrl) || url.hostname

  return {
    id: platform.id,
    label: platform.label,
    glyph: platform.glyph,
    accent: platform.accent,
    accentAlt: platform.accentAlt,
    kind: platform.kind,
    group: platform.group,
    verbo: platform.verbo,
    url: url.href,
    handle,
    original: rawUrl,
    known: Boolean(known),
  }
}

/** Resolve every non-empty entry in socialLinks into a resolved profile list. */
export function resolveProfiles(socialLinks) {
  return Object.values(socialLinks)
    .map(value => detectPlatform(value))
    .filter(Boolean)
}
