import { AnimatePresence, motion } from 'framer-motion'
import { ScanLine, ShieldCheck } from 'lucide-react'
import { ONBOARDING_OPTIONS } from '../../lib/forms/privacy.js'

const FIELD_DEFINITIONS = Object.freeze([
  Object.freeze({ key: 'goal', label: 'OBJETIVO', empty: 'POR DEFINIR' }),
  Object.freeze({ key: 'experience', label: 'EXPERIENCIA', empty: 'POR DEFINIR' }),
  Object.freeze({ key: 'availability', label: 'RITMO SEMANAL', empty: 'POR DEFINIR' }),
])

const VISITOR_VALUES = Object.freeze({
  goal: 'Explorar BAYONA',
  experience: 'Visita libre',
  availability: 'A tu ritmo',
})

function optionLabel(key, value) {
  return ONBOARDING_OPTIONS[key]?.find((option) => option.value === value)?.label ?? ''
}

function AnimatedValue({ value, empty }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={value || empty}
        className={value ? 'is-complete' : 'is-empty'}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      >
        {value || empty}
      </motion.span>
    </AnimatePresence>
  )
}

export default function PaseBayona({
  answers,
  route,
  code,
  visitType = 'personalized',
  compact = false,
}) {
  const isVisitor = visitType === 'visitor' || visitType === 'human'

  return (
    <article
      className={`bayona-pass${compact ? ' bayona-pass--compact' : ''}`}
      aria-label="Pase BAYONA temporal y anónimo"
    >
      <div className="bayona-pass__scan" aria-hidden="true" />
      <header className="bayona-pass__header">
        <div>
          <span>PASE BAYONA</span>
          <strong>VISITANTE · ACCESO TEMPORAL</strong>
        </div>
        <ScanLine size={26} strokeWidth={1} aria-hidden="true" />
      </header>

      <div className="bayona-pass__identity">
        <span>CÓDIGO VISUAL</span>
        <strong>{code}</strong>
        <small>NO ES UN IDENTIFICADOR PERMANENTE</small>
      </div>

      <dl className="bayona-pass__fields" aria-live="polite">
        {FIELD_DEFINITIONS.map((field) => {
          const value = isVisitor
            ? VISITOR_VALUES[field.key]
            : optionLabel(field.key, answers[field.key])

          return (
            <div key={field.key}>
              <dt>{field.label}</dt>
              <dd><AnimatedValue value={value} empty={field.empty} /></dd>
            </div>
          )
        })}
        <div className="bayona-pass__route">
          <dt>RUTA SUGERIDA</dt>
          <dd><AnimatedValue value={route?.plan} empty="EN CONSTRUCCIÓN" /></dd>
        </div>
      </dl>

      <footer className="bayona-pass__privacy">
        <ShieldCheck size={17} strokeWidth={1} aria-hidden="true" />
        <p>
          Este pase es temporal y se borra al salir. No pedimos cuenta, nombre ni foto.
          No guardamos tus datos en servidor, cookies ni almacenamiento local.
        </p>
      </footer>
    </article>
  )
}
