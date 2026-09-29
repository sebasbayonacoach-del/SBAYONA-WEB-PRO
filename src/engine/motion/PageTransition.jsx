// PageTransition - cortina de transicion entre rutas (Requirement 12).
//
// Envuelve el arbol de rutas y, sobre el, dibuja una cortina animada con
// `clip-path` que barre el viewport en cada navegacion (R12.1). La cortina es un
// overlay decorativo (`pointer-events: none`), por lo que al terminar el barrido
// el contenido de la nueva ruta queda completamente visible e interactivo
// (R12.2). Ademas, cada cambio de ruta restablece el scroll al inicio (R12.3) y,
// con `reducedMotion` activo, se omite la animacion de desplazamiento
// conservando unicamente ese reset (R12.4).
//
// Evoluciona al `RouteCurtain` previo de `src/components/Experience.jsx`: aqui la
// duracion y la curva provienen de `motionTokens` (sin literales de tiempo) y el
// color/forma de la cortina usan los tokens de `theme` (bordes afilados, R9.5).

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { motionTokens } from '../config/motionTokens.js'
import { theme } from '../config/theme.js'
import { useCapabilities } from '../hooks/useCapabilities.js'

// Estilo del overlay de cortina: posicion fija que cubre todo el viewport, por
// encima del contenido, con degradado de marca oscuro -> dorado. Nunca captura
// eventos (`pointerEvents: 'none'`) para no bloquear la interaccion (R12.2) y
// mantiene bordes afilados (`borderRadius: theme.radius` = 0, R9.5).
const curtainStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 9999,
  pointerEvents: 'none',
  borderRadius: theme.radius,
  background: `linear-gradient(115deg, ${theme.color.black2} 0%, ${theme.color.black} 45%, ${theme.color.gold} 135%)`,
}

/**
 * Transicion de pagina con cortina `clip-path`.
 *
 * En cada cambio de `location.pathname`:
 *   1. Restablece el scroll al top (R12.3), sustituyendo a cualquier
 *      `ScrollToTop` previo de la app.
 *   2. Monta una cortina animada (keyed por `pathname`) que barre el viewport
 *      de oculta -> cubre -> oculta usando `clip-path`, con la duracion
 *      (`duration.curtain`) y curva (`ease.curtain`) de `motionTokens` (R12.1).
 *
 * La cortina es puramente decorativa (`aria-hidden`, `pointer-events: none`),
 * de modo que el contenido de la nueva ruta es interactivo durante y despues
 * del barrido (R12.2).
 *
 * Con `reducedMotion` activo (R12.4) NO se ejecuta la cortina ni animacion de
 * desplazamiento alguna: se renderiza `children` directamente, conservando solo
 * el reset de scroll (salto instantaneo, sin animar).
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children Arbol de rutas a envolver.
 * @returns {JSX.Element}
 */
export function PageTransition({ children }) {
  const location = useLocation()
  const { reducedMotion } = useCapabilities()

  // Reset de scroll al top en cada cambio de ruta (R12.3). Se ejecuta tanto en
  // el modo animado como en reduced-motion; el salto es instantaneo (no animado).
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  // Reduced-motion (R12.4): cambio de pagina sin cortina ni desplazamiento.
  if (reducedMotion) {
    return <>{children}</>
  }

  return (
    <>
      {children}
      <AnimatePresence>
        <motion.div
          key={location.pathname}
          aria-hidden="true"
          style={curtainStyle}
          // Barrido vertical: oculta (colapsada arriba) -> cubre todo -> oculta
          // (colapsada abajo). El swap de ruta ocurre bajo la cobertura total.
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{
            clipPath: [
              'inset(0 0 100% 0)',
              'inset(0 0 0 0)',
              'inset(100% 0 0 0)',
            ],
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: motionTokens.duration.curtain,
            times: [0, 0.5, 1],
            ease: motionTokens.ease.curtain,
          }}
        />
      </AnimatePresence>
    </>
  )
}
