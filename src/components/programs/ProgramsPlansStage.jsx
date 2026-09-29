import { motion, useTransform } from 'framer-motion'
import { ArrowUpRight, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StickyStage } from '../../engine/scroll/StickyStage.jsx'
import { useCapabilities } from '../../engine/hooks/useCapabilities.js'
import { mediaHeroUrls, siteMedia } from '../../config/siteMedia.js'
import '../../styles/programs-plans-stage.css'

function PlanBackdrop({ plan, progress }) {
  const media = siteMedia.plans?.[plan.id]?.poster
  const scale = useTransform(progress, [0, 1], [1.07, 1.015])
  const y = useTransform(progress, [0, 1], ['2%', '-2%'])
  const src = media ? mediaHeroUrls(media).retina : ''
  return <motion.div className="program-plan-stage__backdrop" style={{ scale, y, backgroundImage: src ? `url("${src}")` : undefined }} aria-hidden="true" />
}

function PlanFrame({ plan, index, total, progress, isStatic }) {
  const inclusions = (plan.included ?? []).slice(0, 3)
  const media = siteMedia.plans?.[plan.id]?.poster
  const src = media ? mediaHeroUrls(media).retina : ''

  return (
    <div className="program-plan-stage__frame">
      <div className="program-plan-stage__media" aria-hidden="true">
        {isStatic
          ? <div className="program-plan-stage__backdrop" style={{ backgroundImage: src ? `url("${src}")` : undefined }} />
          : <PlanBackdrop plan={plan} progress={progress} />}
        <div className="program-plan-stage__scrim" />
      </div>

      <div className="program-plan-stage__meta" aria-hidden="true">
        <span>MEMBRESÍA {String(index + 1).padStart(2,'0')}</span>
        <span>{String(total).padStart(2,'0')} NIVELES</span>
      </div>

      <motion.article
        className="program-plan-stage__copy"
        key={plan.id}
        aria-hidden="true"
        initial={isStatic ? false : { opacity: 0, y: 34 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .5, ease: [0.16,1,0.3,1] }}
      >
        <p className="program-plan-stage__tag">{plan.tag}</p>
        <h3>{plan.name}</h3>
        <p className="program-plan-stage__desc">{plan.shortDescription}</p>
        <div className="program-plan-stage__price">
          <strong>{plan.priceDisplay}</strong>
          <span>{plan.currency}</span>
          <small>{plan.eur} · {plan.usdDisplay}</small>
        </div>
        <ul>
          {inclusions.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <div className="program-plan-stage__actions">
          <Link to={`/plan/${plan.id.toLowerCase()}`}>VER EXPERIENCIA <ArrowUpRight size={16} /></Link>
          <a href={plan.cta} target="_blank" rel="noreferrer">HABLAR <MessageCircle size={15} /></a>
        </div>
      </motion.article>

      <div className="program-plan-stage__rail" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => <span key={i} data-active={i === index ? 'true' : undefined}>{String(i + 1).padStart(2,'0')}</span>)}
      </div>
    </div>
  )
}

export default function ProgramsPlansStage({ plans = [] }) {
  const { mode } = useCapabilities()
  if (!plans.length) return null
  const length = mode === 'desktop' ? '380vh' : '320vh'

  return (
    <div className="program-plan-stage">
      <ol className="sr-only" aria-label="Planes BAYONA">
        {plans.map((plan) => (
          <li key={plan.id}>
            <h3>{plan.name}</h3>
            <p>{plan.shortDescription}</p>
            <p>{plan.priceDisplay} {plan.currency} · {plan.eur} · {plan.usdDisplay}</p>
            <ul>{(plan.included ?? []).map((item) => <li key={item}>{item}</li>)}</ul>
          </li>
        ))}
      </ol>

      <StickyStage length={length} states={plans.length} topOffset={66} allowMobile className="program-plan-stage__sticky">
        {({ index, progress, isStatic }) => <PlanFrame plan={plans[index] ?? plans[0]} index={index} total={plans.length} progress={progress} isStatic={isStatic} />}
      </StickyStage>
    </div>
  )
}
