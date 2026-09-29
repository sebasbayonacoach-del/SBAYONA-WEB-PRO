// CustomCursor - cursor personalizado de BAYONA (Design System 2.0, Fase 3).
//
// ARQUITECTURA ÚNICA del cursor: este componente es la suma de las dos
// implementaciones que convivían (duplicado detectado en la auditoría):
//   - Del engine conserva la PUERTA de capacidades: lee el CapabilityContext
//     y solo se monta cuando `pointerEffectsEnabled` es verdadero (Desktop sin
//     `prefers-reduced-motion`). En touch/móvil o con movimiento reducido
//     devuelve `null`: no monta listeners ni oculta el cursor nativo
//     (R14.3, R14.4, Property 4).
//   - Del componente legacy (components/CustomCursor.jsx, ya eliminado)
//     conserva el VISUAL vivo: anillo cálido que crece sobre elementos
//     interactivos, seguimiento acotado por requestAnimationFrame y ocultación
//     al perder el foco o salir de la ventana.
//
// Los colores salen de `theme.color` (fuente única de la paleta) y el z-index
// del token `--ds-z-cursor` (por encima del grano, ver ds-tokens.css).

import { useEffect, useRef, useState } from 'react'
import { theme } from '../config/theme.js'
import { useCapabilities } from '../hooks/useCapabilities.js'
import { pointerEffectsEnabled } from '../providers/capabilities.js'

// Elementos considerados "interactivos" ante los que el anillo crece.
// Superconjunto de las dos listas históricas.
const INTERACTIVE_SELECTOR = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  'summary',
  '[role="button"]',
  '[data-cursor]',
].join(',')

// Alphas del anillo como sufijo hex sobre el color de marca.
const RING_BG = `${theme.color.orange}33` // ~20 % en reposo
const RING_BG_HOVER = `${theme.color.orange}1a` // ~10 % al crecer
const RING_GLOW = `${theme.color.orange}47` // ~28 % de halo

/**
 * Capa visual del cursor. Solo se monta cuando la puerta de capacidades la
 * habilita, así que sus hooks se ejecutan de forma incondicional.
 *
 * @returns {JSX.Element} Anillo cálido en `position: fixed`.
 */
function CursorRing() {
  const cursorRef = useRef(null)
  const frameRef = useRef(0)
  const pointerRef = useRef({ x: -40, y: -40, interactive: false, visible: false })

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return undefined

    const renderPointer = () => {
      frameRef.current = 0
      const { x, y, interactive, visible } = pointerRef.current
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`
      cursor.style.opacity = visible ? '1' : '0'
      cursor.classList.toggle('is-interactive', interactive)
    }

    const scheduleRender = () => {
      if (!frameRef.current) frameRef.current = window.requestAnimationFrame(renderPointer)
    }

    const handlePointerMove = (event) => {
      pointerRef.current = {
        x: event.clientX,
        y: event.clientY,
        interactive:
          event.target instanceof Element &&
          Boolean(event.target.closest(INTERACTIVE_SELECTOR)),
        visible: true,
      }
      scheduleRender()
    }

    const hidePointer = () => {
      pointerRef.current.visible = false
      scheduleRender()
    }

    document.documentElement.classList.add('has-custom-cursor')
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('blur', hidePointer)
    document.documentElement.addEventListener('mouseleave', hidePointer)

    return () => {
      document.documentElement.classList.remove('has-custom-cursor')
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('blur', hidePointer)
      document.documentElement.removeEventListener('mouseleave', hidePointer)
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
    }
  }, [])

  return (
    <>
      <span ref={cursorRef} className="bayona-cursor" aria-hidden="true">
        <span className="bayona-cursor__ring" />
      </span>
      <style>{`
        html.has-custom-cursor,
        html.has-custom-cursor * {
          cursor: none !important;
        }

        .bayona-cursor {
          position: fixed;
          top: 0;
          left: 0;
          z-index: var(--ds-z-cursor, 10001);
          width: 0;
          height: 0;
          opacity: 0;
          pointer-events: none;
          will-change: transform;
          transition: opacity 120ms ease;
        }

        .bayona-cursor__ring {
          position: absolute;
          top: 0;
          left: 0;
          width: 12px;
          height: 12px;
          border: 1px solid ${theme.color.orange};
          border-radius: 50%;
          background: ${RING_BG};
          box-shadow: 0 0 14px ${RING_GLOW};
          transform: translate(-50%, -50%);
          transition: width 180ms ease, height 180ms ease, background-color 180ms ease;
        }

        .bayona-cursor.is-interactive .bayona-cursor__ring {
          width: 28px;
          height: 28px;
          background: ${RING_BG_HOVER};
        }

        @media (hover: none), (pointer: coarse), (prefers-reduced-motion: reduce) {
          .bayona-cursor {
            display: none !important;
          }
        }
      `}</style>
    </>
  )
}

/**
 * Cursor personalizado del Experience_Engine.
 *
 * Puerta de capacidades: monta la capa visual SOLO cuando los efectos de
 * puntero están habilitados (Desktop sin movimiento reducido). En el resto
 * de contextos devuelve `null`.
 *
 * @returns {JSX.Element|null}
 */
export function CustomCursor() {
  const caps = useCapabilities()
  const [mounted, setMounted] = useState(false)

  // El anillo solo tiene sentido con el DOM listo; el estado evita tocar
  // document.documentElement durante el primer render (SSR-safe).
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !pointerEffectsEnabled(caps)) {
    return null
  }
  return <CursorRing />
}
