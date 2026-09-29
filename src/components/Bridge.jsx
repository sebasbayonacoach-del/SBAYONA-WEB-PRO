import { useId } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { sceneBackgroundProps } from './SceneBackground.jsx'
import '../styles/community-bridges.css'

const DEFAULT_FREE_LABEL = 'LA COMUNIDAD ES GRATIS · ENTRA SIN COMPRAR NADA · SIN TARJETA'

function BridgeAction({ href, label, secondary }) {
  if (!href || !label) return null

  const className = `cb-bridge-cta${secondary ? ' cb-bridge-cta--secondary' : ''}`
  const content = (
    <>
      {label}
      <ArrowUpRight size={17} strokeWidth={1.2} aria-hidden="true" />
    </>
  )

  if (href.startsWith('/')) {
    return <Link className={className} to={href}>{content}</Link>
  }

  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  )
}

export default function Bridge({
  eyebrow,
  title,
  titleAccent,
  hook,
  free = false,
  freeLabel = DEFAULT_FREE_LABEL,
  ctaLabel,
  ctaHref,
  ctaSecondary = false,
  children,
  layout = 'split',
  compact = false,
  media,
  className = '',
}) {
  const generatedId = useId()
  const headingId = title ? `cb-bridge-${generatedId.replace(/:/g, '')}` : undefined
  const classes = [
    'cb-bridge',
    children && 'cb-bridge--with-media',
    layout === 'stacked' && 'cb-bridge--stacked',
    compact && 'cb-bridge--compact',
    className,
  ].filter(Boolean).join(' ')
  const Root = compact ? 'div' : 'section'

  return (
    <Root
      {...sceneBackgroundProps(media, {
        className: classes,
        variant: 'subtle',
        pseudo: 'after',
      })}
      aria-labelledby={headingId}
    >
      <div className="cb-bridge-inner">
        <div className="cb-bridge-copy">
          {eyebrow && <span className="cb-bridge-eyebrow">{eyebrow}</span>}
          {title && (
            <h2 className="cb-bridge-title" id={headingId}>
              {title}
              {titleAccent && <><br /><span>{titleAccent}</span></>}
            </h2>
          )}
          {hook && <p className="cb-bridge-hook">{hook}</p>}
          {free && <p className="cb-bridge-free">{freeLabel}</p>}
          <BridgeAction href={ctaHref} label={ctaLabel} secondary={ctaSecondary} />
        </div>

        {children && <div className="cb-bridge-media">{children}</div>}
      </div>
    </Root>
  )
}
