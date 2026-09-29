/**
 * BAYONA · SOCIAL HUB — GLYPH
 * ---------------------------------------------------------------------------
 * Unified, single-weight brand marks rendered as inline SVG. Every glyph
 * shares the same stroke/fill language so the cards read as one brand.
 * `currentColor` lets the card tint the glyph with the platform accent.
 */

const V = {
  instagram: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </g>
  ),
  youtube: (
    <g fill="currentColor">
      <path d="M22 8.2a3 3 0 0 0-2.1-2.1C18.1 5.6 12 5.6 12 5.6s-6.1 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.7 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.8.5 7.9.5 7.9.5s6.1 0 7.9-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22.3 12 31 31 0 0 0 22 8.2ZM10 15V9l5.2 3Z" />
    </g>
  ),
  tiktok: (
    <g fill="currentColor">
      <path d="M16.5 3c.4 2.3 1.7 3.7 3.9 3.9v2.6c-1.4.1-2.7-.3-3.9-1v5.9a5.7 5.7 0 1 1-5.7-5.7c.3 0 .6 0 .9.1v2.7a3 3 0 1 0 2.1 2.9V3Z" />
    </g>
  ),
  linkedin: (
    <g fill="currentColor">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 17v-7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </g>
  ),
  github: (
    <g fill="currentColor">
      <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.1-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.4-2.2-.2-4.5-1.1-4.5-5a3.9 3.9 0 0 1 1-2.7c-.1-.3-.5-1.3.1-2.6 0 0 .8-.3 2.7 1a9.3 9.3 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .6 1.3.2 2.3.1 2.6a3.9 3.9 0 0 1 1 2.7c0 3.9-2.3 4.8-4.5 5 .3.3.6.9.6 1.8v2.7c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" />
    </g>
  ),
  facebook: (
    <g fill="currentColor">
      <path d="M13.5 21v-7h2.4l.4-2.8h-2.8V9.4c0-.8.2-1.4 1.4-1.4h1.5V5.5c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2H8.2V14h2.3v7Z" />
    </g>
  ),
  threads: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M17.6 11a6.4 6.4 0 0 0-.1-1.2 4.6 4.6 0 0 0-4.5-3.3 5 5 0 0 0-4.8 3.5 5 5 0 0 0 .8 4.7 4.8 4.8 0 0 0 4 1.8c1.8 0 3-.6 3.8-1.8" />
      <path d="M12.9 8.6c1.6 0 2.4 1.4 2.4 3.1s-1 3.1-2.6 3.1-2.2-1-2.2-2.6.7-2.8 1.9-2.8" fill="currentColor" stroke="none" />
    </g>
  ),
  x: (
    <g fill="currentColor">
      <path d="M17.5 3h3l-6.6 7.5L21.8 21h-6l-4.7-6-5.3 6H2.8l7-8L2.5 3h6.1l4.3 5.6ZM16.4 19h1.7L7.7 4.8H5.9Z" />
    </g>
  ),
  spotify: (
    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M7.5 10.2c2.6-.8 6.2-.6 8.8.7M8 13.2c2.1-.6 5-.4 7.1.6M8.5 15.9c1.6-.4 3.7-.3 5.3.4" />
    </g>
  ),
  discord: (
    <g fill="currentColor">
      <path d="M18.9 5.9A16 16 0 0 0 15 4.7l-.2.4a14 14 0 0 1 3.5 1.4 12.6 12.6 0 0 0-11-.2 14 14 0 0 1 3.5-1.2l-.2-.4a16 16 0 0 0-3.9 1.2C3.5 9.6 2.9 13.2 3 16.7A16 16 0 0 0 8 19l.5-.7a10 10 0 0 1-2-1l.4-.3a11 11 0 0 0 9.6 0l.4.3a10 10 0 0 1-2 1l.5.7a16 16 0 0 0 5-2.3c.2-4.1-.7-7.7-2.5-10.8ZM9.5 14.4c-.8 0-1.4-.7-1.4-1.6s.6-1.6 1.4-1.6 1.5.7 1.4 1.6c0 .9-.6 1.6-1.4 1.6Zm5 0c-.8 0-1.4-.7-1.4-1.6s.6-1.6 1.4-1.6 1.5.7 1.4 1.6c0 .9-.6 1.6-1.4 1.6Z" />
    </g>
  ),
  behance: (
    <g fill="currentColor">
      <path d="M8.4 6.5c1.6 0 3 .8 3 2.6 0 1-.6 1.7-1.4 2 1.1.3 1.8 1.1 1.8 2.4 0 2-1.6 2.9-3.4 2.9H3V6.5Zm-.2 4c.8 0 1.3-.4 1.3-1.1S8.9 8.3 8 8.3H5.2v2.2Zm.2 4.2c.9 0 1.5-.4 1.5-1.3 0-.8-.6-1.2-1.5-1.2H5.2v2.5ZM15.5 8.3h4v1h-4ZM20.6 13.4c0-.2-.1-.4-.1-.6 0-2-1.3-3.6-3.6-3.6a3.6 3.6 0 0 0-3.7 3.8c0 2.2 1.4 3.7 3.8 3.7 1.6 0 2.9-.7 3.3-2.1h-1.9c-.1.4-.6.6-1.2.6-.9 0-1.4-.5-1.5-1.4h4.8Zm-4.7-1.1c.1-.8.6-1.3 1.4-1.3s1.2.5 1.3 1.3Z" />
    </g>
  ),
  dribbble: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M5 8.5c4 .8 9 .6 12.7-1.4M3.5 13.5c4.6-1.5 9.2-.6 12 1.8M9 3.7c3 3 5 7.5 5.4 13.5" strokeLinecap="round" />
    </g>
  ),
  medium: (
    <g fill="currentColor">
      <circle cx="6.5" cy="12" r="3" />
      <ellipse cx="13" cy="12" rx="2.4" ry="3" />
      <ellipse cx="18" cy="12" rx="1.4" ry="3" />
    </g>
  ),
  substack: (
    <g fill="currentColor">
      <path d="M5 4h14v2.4H5Zm0 3.6h14V11H5Zm0 4.7h14V21l-7-3.6L5 21Z" />
    </g>
  ),
  patreon: (
    <g fill="currentColor">
      <circle cx="15.5" cy="9" r="6" />
      <rect x="4" y="3" width="3" height="18" />
    </g>
  ),
  gumroad: (
    <g fill="currentColor">
      <path d="M14 4H6v16h3v-6h2l4 6h3.4l-4.3-6.2A4 4 0 0 0 17 5.8 4.6 4.6 0 0 0 14 4Zm.1 2.6c1 0 1.7.7 1.7 1.7s-.7 1.7-1.7 1.7H9V6.6Z" />
    </g>
  ),
  calendly: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9h17M8 3v4M16 3v4M9 14h6M12 11.5v5" />
    </g>
  ),
  twitch: (
    <g fill="currentColor">
      <path d="M5 3h15v10l-4 4h-3l-3 3h-2v-3H5Zm2 2v10h3v3l3-3h4V5Zm3 3v4h1.5V8Zm4 0v4H16V8Z" />
    </g>
  ),
  pinterest: (
    <g fill="currentColor">
      <path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.9 0 1.3.6 1.3 1.4 0 .9-.5 2.2-.8 3.4-.2.9.5 1.7 1.4 1.7 1.7 0 2.9-2.2 2.9-4.7 0-2-1.3-3.4-3.7-3.4a4.2 4.2 0 0 0-4.4 4.2c0 .8.3 1.4.6 1.8l-.3 1.1c0 .2-.2.2-.4.1a3.3 3.3 0 0 1-1.5-2.9c0-2.2 1.8-4.8 5.3-4.8 2.9 0 4.8 2.1 4.8 4.3 0 2.9-1.6 5.1-4 5.1-.8 0-1.5-.4-1.8-.9l-.5 1.9c-.2.7-.6 1.4-1 2A10 10 0 1 0 12 2Z" />
    </g>
  ),
  website: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
    </g>
  ),
}

export default function Glyph({ name, size = 22, className = '', label }) {
  const inner = V[name] || V.website
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={`social-glyph ${className}`}
      role={label ? 'img' : undefined}
    >
      {label ? <title>{label}</title> : null}
      {inner}
    </svg>
  )
}
