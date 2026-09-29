/**
 * BAYONA · SOCIAL HUB — FEED LAYER
 * ---------------------------------------------------------------------------
 * Fetches REAL public content where the platform exposes an RSS/Atom feed.
 * Uses the public rss2json CORS proxy (no key, free tier). Falls back to an
 * empty list on any failure — the UI never receives an error.
 *
 * YouTube handles are resolved to their canonical channel ID before requesting
 * the native feed. The resolved ID is cached so normal visits do not repeat the
 * channel-page lookup.
 *
 * This is the single seam for live data. Swapping in an OAuth-backed backend,
 * GraphQL or REST later means changing only this module: components stay the same.
 *
 * Cache: localStorage, 1 hour TTL for feeds and 7 days for channel resolution.
 */

const PROXY = 'https://api.rss2json.com/v1/api.json?rss_url='
const YOUTUBE_HTML_RELAY = 'https://api.allorigins.win/raw?url='
const TTL = 60 * 60 * 1000
const YOUTUBE_RESOLUTION_TTL = 7 * 24 * 60 * 60 * 1000
const YOUTUBE_CHANNEL_ID_PATTERN = /^UC[A-Za-z0-9_-]{22}$/

function safeLocalStorage() {
  try {
    return globalThis?.localStorage ?? null
  } catch {
    return null
  }
}

function readStoredValue(key, ttl) {
  try {
    const raw = safeLocalStorage()?.getItem(key)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data?.ts || Date.now() - data.ts > ttl) return null
    return data.value ?? data.items ?? null
  } catch {
    return null
  }
}

function writeStoredValue(key, value) {
  try {
    safeLocalStorage()?.setItem(key, JSON.stringify({ ts: Date.now(), value }))
  } catch {
    /* storage may be unavailable (private mode / quota) — ignore */
  }
}

function channelIdFromText(value) {
  if (typeof value !== 'string' || !value) return null
  const trimmed = value.trim()
  if (YOUTUBE_CHANNEL_ID_PATTERN.test(trimmed)) return trimmed

  const patterns = [
    /<meta[^>]+itemprop=["']channelId["'][^>]+content=["'](UC[A-Za-z0-9_-]{22})["']/i,
    /<meta[^>]+content=["'](UC[A-Za-z0-9_-]{22})["'][^>]+itemprop=["']channelId["']/i,
    /["']externalId["']\s*:\s*["'](UC[A-Za-z0-9_-]{22})["']/,
    /youtube\.com\/channel\/(UC[A-Za-z0-9_-]{22})/i,
    /["']channelId["']\s*:\s*["'](UC[A-Za-z0-9_-]{22})["']/,
  ]

  for (const pattern of patterns) {
    const match = pattern.exec(value)
    if (match?.[1] && YOUTUBE_CHANNEL_ID_PATTERN.test(match[1])) return match[1]
  }
  return null
}

function youtubeLookupUrls(profile) {
  const urls = []
  const add = (value) => {
    if (!value || urls.includes(value)) return
    urls.push(value)
  }

  for (const value of [profile?.url, profile?.original]) {
    if (typeof value !== 'string' || !value) continue
    try {
      const parsed = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`)
      if (parsed.hostname.replace(/^www\./, '').toLowerCase().endsWith('youtube.com')) {
        parsed.search = ''
        parsed.hash = ''
        add(parsed.href)
      }
    } catch {
      /* Ignore malformed profile URLs and continue with the normalized handle. */
    }
  }

  const cleanHandle = String(profile?.handle ?? '').replace(/^@/, '').trim()
  if (cleanHandle && !YOUTUBE_CHANNEL_ID_PATTERN.test(cleanHandle)) {
    add(`https://www.youtube.com/@${encodeURIComponent(cleanHandle)}`)
  }

  return urls
}

async function resolveYouTubeChannelId(profile, signal) {
  const directId = channelIdFromText(profile?.channelId)
    ?? channelIdFromText(profile?.handle)
    ?? channelIdFromText(profile?.url)
    ?? channelIdFromText(profile?.original)
  if (directId) return directId

  const cleanHandle = String(profile?.handle ?? '').replace(/^@/, '').trim().toLowerCase()
  if (!cleanHandle) return null

  const cacheKey = `bayona:youtube-channel:${cleanHandle}`
  const cached = readStoredValue(cacheKey, YOUTUBE_RESOLUTION_TTL)
  if (YOUTUBE_CHANNEL_ID_PATTERN.test(cached ?? '')) return cached

  for (const channelUrl of youtubeLookupUrls(profile)) {
    const relayUrl = `${YOUTUBE_HTML_RELAY}${encodeURIComponent(channelUrl)}`
    const requests = typeof window === 'undefined'
      ? [channelUrl, relayUrl]
      : [relayUrl]

    for (const requestUrl of requests) {
      if (signal?.aborted) return null
      try {
        const response = await fetch(requestUrl, {
          signal,
          headers: { Accept: 'text/html,application/xhtml+xml' },
        })
        if (!response.ok) continue
        const channelId = channelIdFromText(await response.text())
        if (!channelId) continue
        writeStoredValue(cacheKey, channelId)
        return channelId
      } catch {
        if (signal?.aborted) return null
      }
    }
  }

  return null
}

/** Resolve a profile to its native RSS feed URL, if one exists. */
async function nativeFeedUrl(profile, signal) {
  if (!profile?.handle) return null
  switch (profile.id) {
    case 'youtube': {
      const channelId = await resolveYouTubeChannelId(profile, signal)
      return channelId
        ? `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
        : null
    }
    case 'medium':
      return `https://medium.com/feed/@${profile.handle.replace(/^@/, '')}`
    case 'substack': {
      const clean = profile.handle.replace(/^@/, '')
      if (profile.original?.includes('.substack.com')) {
        const host = new URL(profile.original).hostname
        return `https://${host}/feed`
      }
      return `https://${clean}.substack.com/feed`
    }
    case 'twitch':
      return null // no public RSS
    default:
      return null
  }
}

function readCache(key) {
  return readStoredValue(key, TTL)
}

function writeCache(key, items) {
  writeStoredValue(key, items)
}

function normalize(item, fallbackKind) {
  if (!item) return null
  const thumb =
    item.thumbnail ||
    item.enclosure?.link ||
    (item.description && /<img[^>]+src="([^"]+)"/i.exec(item.description)?.[1]) ||
    null
  return {
    title: item.title?.trim() || 'Sin título',
    url: item.link || null,
    date: item.pubDate || null,
    thumb,
    kind: fallbackKind,
  }
}

/**
 * Fetch a real feed for a profile. Always resolves (never rejects):
 *   returns FeedResult { platform, items: [], source: 'live' | 'cache' | null }
 */
export async function fetchFeed(profile, signal) {
  const empty = { platform: profile?.id, items: [], source: null }
  if (!profile?.id || !profile?.handle) return empty

  const cacheKey = `bayona:feed:${profile.id}:${profile.handle}`
  const cached = readCache(cacheKey)
  if (cached) return { platform: profile.id, items: cached, source: 'cache' }

  try {
    const feedUrl = await nativeFeedUrl(profile, signal)
    if (!feedUrl) return empty

    const res = await fetch(PROXY + encodeURIComponent(feedUrl), {
      signal,
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return empty
    const data = await res.json()
    if (data?.status !== 'ok' || !Array.isArray(data.items)) return empty
    const items = data.items.slice(0, 6).map(i => normalize(i, profile.kind)).filter(Boolean)
    writeCache(cacheKey, items)
    return { platform: profile.id, items, source: 'live' }
  } catch {
    return empty
  }
}

/** Fetch many profiles in parallel; returns a Map<platformId, FeedResult>. */
export async function fetchFeeds(profiles, signal) {
  const entries = await Promise.all(
    profiles.map(p => fetchFeed(p, signal).then(r => [p.id, r])),
  )
  return new Map(entries)
}
