import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowUpRight, X } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import './preview-intent.css'

/* What a link actually opens. Never imply an unavailable download or purchase. */
const PREVIEW_INTENTS = Object.freeze({
  '/onboarding': {
    kind: 'PRIMER PASO', title: 'EMPIEZA CON DIRECCIÓN',
    body: 'Cuéntanos tu punto de partida para preparar una ruta de entrenamiento acorde con tu contexto.',
    chapters: ['TU CONTEXTO', 'OBJETIVOS', 'SIGUIENTE PASO'],
  },
  '/resources': {
    kind: 'BIBLIOTECA', title: 'RECURSOS Y DOSSIER',
    body: 'Consulta las guías, condiciones y recursos disponibles antes de decidir cómo comenzar.',
    chapters: ['PROTOCOLO', 'RETO 30 DÍAS', 'DOSSIER'],
  },
  '/community': {
    kind: 'COMUNIDAD', title: 'CONOCE EL ESPACIO',
    body: 'Explora cómo se organiza la comunidad y qué encontrarás antes de participar.',
    chapters: ['PRESENTACIÓN', 'CONVERSACIONES', 'ACCESO'],
  },
  '/programs': {
    kind: 'PROGRAMAS', title: 'ELIGE TU PROCESO',
    body: 'Compara las opciones de acompañamiento, su estructura y las condiciones disponibles.',
    chapters: ['RAÍZ', 'RENDIMIENTO', 'ELITE'],
  },
  '/about': {
    kind: 'HISTORIA', title: 'CONOCE BAYONA',
    body: 'Descubre nuestra visión sobre movimiento, ciencia aplicada y progreso sostenible.',
    chapters: ['ORIGEN', 'CRITERIO', 'VISIÓN'],
  },
  '/shop': {
    kind: 'TIENDA', title: 'EXPLORA LA TIENDA',
    body: 'Accede al catálogo y consulta los detalles reales de cada producto antes de comprar.',
    chapters: ['CATÁLOGO', 'DETALLES', 'ELECCIÓN'],
  },
  '/faq': {
    kind: 'AYUDA', title: 'RESUELVE TUS DUDAS',
    body: 'Consulta las preguntas frecuentes sobre el proceso, sus condiciones y el acceso.',
    chapters: ['PROCESO', 'CONDICIONES', 'AYUDA'],
  },
  '/parkour-academy': {
    kind: 'ACADEMIA', title: 'PARKOUR BAYONA',
    body: 'Consulta la propuesta de parkour y las actividades disponibles antes de participar.',
    chapters: ['MOVIMIENTO', 'PROGRESIÓN', 'ACADEMIA'],
  },
  '/plan': {
    kind: 'DETALLE DEL PLAN', title: 'DESCUBRE TU PLAN',
    body: 'Revisa el contenido, las condiciones y el precio publicados del programa que has elegido.',
    chapters: ['PROGRAMA', 'CONTENIDO', 'CONDICIONES'],
  },
  '/entrar': {
    kind: 'CUENTA', title: 'ACCESO A BAYONA',
    body: 'Inicia sesión para usar las funciones de cuenta disponibles.',
    chapters: ['IDENTIDAD', 'ACCESO', 'TU ESPACIO'],
  },
  '/checkout': {
    kind: 'PEDIDO', title: 'REVISAR TU ELECCIÓN',
    body: 'Revisa cuidadosamente el resumen y las condiciones del pedido antes de confirmar.',
    chapters: ['RESUMEN', 'CONDICIONES', 'CONFIRMACIÓN'],
  },
  '/app': {
    kind: 'PRODUCTO DIGITAL', title: 'ABRE BAYONA APP',
    body: 'Accede a la versión web de BAYONA App y descubre lo que sigue en desarrollo.',
    chapters: ['EXPERIENCIA', 'FUNCIONES', 'ACCESO'],
  },
})

const SELECTORS = [
  '.hero-tour-cta', '.cta-primary', '.cta-secondary', '.free-dossier-action',
  '.vision-spatial-cta', '.community-immersive-decision a',
  '.experience-story__cta', '.free-dossier-footer a', '.final-doors a',
  '[data-preview-intent]',
].join(',')

function getIntentForAnchor(anchor) {
  if (!anchor?.closest?.('main')) return null
  const path = anchor.getAttribute('href')
  if (!path || path.startsWith('//')) return null
  const isPlanAnchor = /^#plan-[a-z0-9-]+$/i.test(path)
  if (!path.startsWith('/') && !isPlanAnchor) return null
  const base = isPlanAnchor ? '/plan' : path.split(/[?#]/)[0]
  const destination = PREVIEW_INTENTS[base] || PREVIEW_INTENTS['/' + base.split('/').filter(Boolean)[0]]
  if (!destination) return null
  const prominent = anchor.matches(SELECTORS) ||
    Boolean(anchor.querySelector('svg.lucide-arrow-up-right, svg.lucide-zap')) ||
    /[↗→]/.test(anchor.textContent || '')
  if (!prominent) return null
  const label = (anchor.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 90)
  return { ...destination, href: path, label: label || destination.title }
}

/** Single listener system across all public routes, without replacing real links. */
export default function PreviewIntentExperience() {
  const { pathname } = useLocation()
  const [view, setView] = useState(null)
  const [sheet, setSheet] = useState(false)
  const originRef = useRef(null)
  const dialogRef = useRef(null)
  const hide = useCallback(() => { setView(null); setSheet(false) }, [])

  useEffect(() => { hide() }, [pathname, hide])

  useEffect(() => {
    function findAnchor(e) { return e.target?.closest?.('a[href]') }
    function show(e) {
      if (sheet || window.matchMedia('(hover: none)').matches || window.innerWidth <= 760) return
      const anchor = findAnchor(e)
      const intent = getIntentForAnchor(anchor)
      if (!intent) return
      const r = anchor.getBoundingClientRect()
      const panelWidth = Math.min(340, window.innerWidth - 24)
      const left = Math.max(12, Math.min(window.innerWidth - panelWidth - 12, r.left))
      const top = r.bottom + 16 + 220 < window.innerHeight ? r.bottom + 12 : Math.max(82, r.top - 236)
      originRef.current = anchor
      setView({ ...intent, left, top })
    }
    function depart(e) {
      if (sheet) return
      const anchor = findAnchor(e)
      if (anchor && getIntentForAnchor(anchor) && !anchor.contains(e.relatedTarget)) setView(null)
    }
    function openMobile(e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const mobile = window.innerWidth <= 760 || window.matchMedia('(pointer: coarse)').matches
      if (!mobile) return
      const anchor = findAnchor(e)
      const intent = getIntentForAnchor(anchor)
      if (!intent) return
      e.preventDefault()
      e.stopPropagation()
      originRef.current = anchor
      setSheet(true)
      setView({ ...intent, left: 0, top: 0 })
    }
    const onEscape = (e) => {
      if (e.key !== 'Escape') return
      if (view) {
        hide()
        originRef.current?.focus?.()
      }
    }
    const onTrap = (e) => {
      if (e.key !== 'Tab' || !sheet) return
      const buttons = dialogRef.current?.querySelectorAll('button, a[href]')
      if (!buttons?.length) return
      const first = buttons[0], last = buttons[buttons.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('pointerover', show)
    document.addEventListener('focusin', show)
    document.addEventListener('pointerout', depart)
    document.addEventListener('click', openMobile, true)
    document.addEventListener('keydown', onEscape)
    document.addEventListener('keydown', onTrap)
    return () => {
      document.removeEventListener('pointerover', show)
      document.removeEventListener('focusin', show)
      document.removeEventListener('pointerout', depart)
      document.removeEventListener('click', openMobile, true)
      document.removeEventListener('keydown', onEscape)
      document.removeEventListener('keydown', onTrap)
    }
  }, [hide, sheet, view])

  useEffect(() => {
    if (sheet) dialogRef.current?.querySelector('button')?.focus()
  }, [sheet])

  useEffect(() => {
    if (!sheet) return undefined
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = oldOverflow }
  }, [sheet])

  if (!view) return null
  const contents = (
    <div className={sheet ? 'bayona-preview-scrim' : 'bayona-preview-hover-layer'}
      onClick={sheet ? (e) => { if (e.target === e.currentTarget) hide() } : undefined}>
      <section
        ref={dialogRef}
        role={sheet ? 'dialog' : 'status'}
        aria-modal={sheet ? 'true' : undefined}
        aria-label={sheet ? 'Vista previa del destino' : undefined}
        data-preview-type={view.kind}
        className={'bayona-preview-panel' + (sheet ? ' bayona-preview-panel--sheet' : '')}
        style={sheet ? undefined : { left: view.left, top: view.top }}
      >
        <header className="bayona-preview-panel__top">
          <span>B / VISTA PREVIA</span>
          <span>{view.kind}</span>
          {sheet && <button type="button" onClick={hide} aria-label="Cerrar vista previa"><X size={20} /></button>}
        </header>
        <div className="bayona-preview-panel__main">
          <div className="bayona-preview-panel__folio">
            <span>BAYONA — EDICIÓN DIGITAL</span>
            <strong>{view.title}</strong>
            <span>01 — 03 / CONTENIDO</span>
          </div>
          <p>{view.body}</p>
          <ol>{view.chapters.map((chapter, i) => <li key={chapter}><span>0{i+1}</span>{chapter}</li>)}</ol>
        </div>
        <footer><span>DESTINO: {view.href}</span>
          {sheet ? <a href={view.href}>ABRIR DESTINO <ArrowUpRight size={17} /></a>
            : <span className="bayona-preview-panel__hint">HAZ CLIC PARA ENTRAR ↗</span>}
        </footer>
      </section>
    </div>
  )
  return createPortal(contents, document.body)
}
