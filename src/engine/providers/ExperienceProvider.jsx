// ExperienceProvider - provider raiz del Experience_Engine (Requirements 24.1,
// 24.3, 20.x, 19.2).
//
// Compone la infraestructura transversal del motor y la deja disponible para
// TODA la app, de forma consistente en cualquier ruta (R24.3):
//   - `CapabilityProvider`: capacidades vivas del dispositivo (modo, movimiento
//     reducido, puntero...) accesibles por todo lo que cuelga del engine (R23).
//   - `EngineRoot`: monta el smooth scroll (Lenis) y publica una FUENTE UNICA de
//     progreso de scroll normalizado 0..1 (R19.2) via `ScrollContext`, ademas de
//     los efectos globales de marca (Loader y grano de pelicula).
//
// El progreso de scroll se expone como un `MotionValue` de Framer Motion (no
// como estado de React) para evitar re-renders por-fotograma: los consumidores
// lo leen con `.get()` dentro de un `useFrame`/render loop o se suscriben a el
// sin provocar renders del arbol.

import { createContext, useContext, useEffect, useMemo } from 'react'
import { useMotionValue } from 'framer-motion'
import { CapabilityProvider } from './CapabilityProvider.jsx'
import { useCapabilities } from '../hooks/useCapabilities.js'
import { useLenis } from '../hooks/useLenis.js'
import { useSurfaceDepth } from '../hooks/useSurfaceDepth.js'
import { Loader } from '../effects/Loader.jsx'
import { GrainOverlay } from '../effects/GrainOverlay.jsx'

/**
 * Contexto que transporta el progreso de scroll normalizado del engine.
 *
 * Su valor es un `MotionValue<number>` en el rango 0..1 y constituye la FUENTE
 * UNICA de progreso de scroll de la experiencia (R19.2). Es `null` fuera del
 * `ExperienceProvider`; usa `useEngineScroll()` para consumirlo de forma segura.
 *
 * @type {import('react').Context<import('framer-motion').MotionValue<number>|null>}
 */
export const ScrollContext = createContext(null)

/**
 * Contexto con el ESTADO dinamico del scroll del engine (Fase 5): velocidad y
 * direccion como `MotionValue<number>`. Se actualiza en la MISMA suscripcion
 * que publica el progreso (Lenis o fallback nativo): no anade listeners ni
 * re-renders. Es `null` fuera del `ExperienceProvider`; usa `useScrollState()`.
 *
 * Semantica:
 *  - `velocity`: desplazamiento por evento de scroll (px). En Lenis es la
 *    velocidad interna del smooth scroll; en el fallback nativo es el delta
 *    de `scrollTop` entre eventos. El consumidor que necesite suavizado debe
 *    aplicarlo (p. ej. `useSpring`); el engine no acumula inercia propia.
 *  - `direction`: 1 bajando, -1 subiendo, 0 en reposo inicial.
 *
 * @type {import('react').Context<{velocity: import('framer-motion').MotionValue<number>, direction: import('framer-motion').MotionValue<number>}|null>}
 */
export const ScrollStateContext = createContext(null)

/**
 * Acota un numero al rango [0, 1]. Valores no finitos se tratan como 0 para
 * mantener el progreso siempre dentro de un rango seguro.
 *
 * @param {number} value Valor de progreso crudo.
 * @returns {number} Progreso acotado a [0, 1].
 */
function clamp01(value) {
  if (!Number.isFinite(value)) return 0
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

/**
 * Nucleo del motor: vive por DENTRO de `CapabilityProvider` para poder leer las
 * capacidades vivas. Monta el smooth scroll, publica el progreso de scroll como
 * `MotionValue` y renderiza los efectos globales de marca junto al contenido.
 *
 * Orden de montaje relevante:
 *   1. `useLenis` se invoca ANTES del efecto de suscripcion. Con smooth scroll
 *      real trae `lenis` con `import()` dinámico (chunk fuera del entry): la
 *      instancia puede llegar DESPUÉS del primer efecto, así que el efecto se
 *      re-ejecuta con `lenisReady` para cambiar del camino nativo al de Lenis
 *      sin añadir listeners ni re-renders extra.
 *   2. El efecto de suscripcion lee `lenisRef.current`:
 *      - Si existe (movimiento normal + puntero fino), escucha el evento
 *        `scroll` de Lenis y publica `progress` acotado en el `MotionValue`.
 *      - Si es `null` (movimiento reducido o puntero grueso -> scroll nativo,
 *        R19.3), calcula el progreso desde el scroll del documento
 *        (`scrollTop / (scrollHeight - clientHeight)`).
 *
 * @param {{ children: import('react').ReactNode }} props
 * @returns {JSX.Element} Arbol del engine con contexto de scroll y efectos.
 */
function EngineRoot({ children }) {
  const caps = useCapabilities()
  useSurfaceDepth()
  // Se llama ANTES del efecto de suscripcion. `lenisReady` cambia cuando la
  // carga diferida (des)aparece: el efecto de abajo lo usa como dep para
  // cambiar del camino nativo al de Lenis sin listeners extra.
  const { ref: lenisRef, ready: lenisReady } = useLenis({
    reducedMotion: caps.reducedMotion,
    finePointer: caps.finePointer,
  })

  // Progreso de scroll 0..1 como MotionValue: sin estado, sin re-render por
  // fotograma. Es la fuente unica que consumen escena/parallax/etc. (R19.2).
  const scrollProgress = useMotionValue(0)
  // Fase 5: velocidad y direccion del scroll como MotionValues. Se actualizan
  // en la misma suscripcion que el progreso: ni un listener extra ni un
  // re-render. Los consume el handoff 3D (Fase 7) y el debug de movimiento.
  const scrollVelocity = useMotionValue(0)
  const scrollDirection = useMotionValue(0)

  useEffect(() => {
    const lenis = lenisRef.current

    // --- Camino Lenis (movimiento normal) ---
    // Lenis emite `scroll` con `progress` normalizado 0..1, mas su velocidad
    // y direccion internas (1 bajando, -1 subiendo).
    if (lenis) {
      const handleLenisScroll = ({ progress, velocity, direction }) => {
        scrollProgress.set(clamp01(progress))
        if (Number.isFinite(velocity)) scrollVelocity.set(velocity)
        if (Number.isFinite(direction)) scrollDirection.set(direction)
      }
      lenis.on('scroll', handleLenisScroll)
      return () => {
        lenis.off('scroll', handleLenisScroll)
      }
    }

    // --- Camino nativo (movimiento reducido, R19.3) ---
    // Sin Lenis: el progreso se deriva del scroll del documento. Si el
    // contenido no desborda el viewport (divisor <= 0) el progreso es 0.
    // La velocidad es el delta de scrollTop entre eventos y la direccion su
    // signo; con movimiento reducido estos valores son informativos (el
    // sistema no debe derivar animacion de ellos).
    let lastTop = typeof window !== 'undefined' ? window.scrollY || 0 : 0
    const handleWindowScroll = () => {
      const doc = document.documentElement
      const scrollTop = doc.scrollTop || window.scrollY || 0
      const max = doc.scrollHeight - doc.clientHeight
      const progress = max > 0 ? scrollTop / max : 0
      scrollProgress.set(clamp01(progress))

      const delta = scrollTop - lastTop
      lastTop = scrollTop
      if (Number.isFinite(delta) && delta !== 0) {
        scrollVelocity.set(delta)
        scrollDirection.set(delta > 0 ? 1 : -1)
      }
    }

    window.addEventListener('scroll', handleWindowScroll, { passive: true })
    // Sincroniza el valor inicial con la posicion de scroll actual al montar.
    handleWindowScroll()

    return () => {
      window.removeEventListener('scroll', handleWindowScroll)
    }
    // Los tres MotionValues son estables (identidad persistente entre
    // renders): se incluyen para satisfacer exhaustive-deps sin que el
    // efecto se re-ejecute de mas. `lenisReady` SÍ re-ejecuta a propósito:
    // es el aviso de que la carga diferida de Lenis (des)apareció y hay que
    // cambiar de camino (nativo <-> Lenis).
  }, [lenisRef, lenisReady, caps.reducedMotion, caps.finePointer, scrollProgress, scrollVelocity, scrollDirection])

  // Identidad estable del valor del contexto: los MotionValues no cambian.
  const scrollState = useMemo(
    () => ({ velocity: scrollVelocity, direction: scrollDirection }),
    [scrollVelocity, scrollDirection],
  )

  return (
    <ScrollContext.Provider value={scrollProgress}>
      <ScrollStateContext.Provider value={scrollState}>
        {/* Loader de marca y efectos globales consistentes en todas las rutas (R24.3). */}
        <Loader />
        <GrainOverlay opacity={0.02} />
        {children}
      </ScrollStateContext.Provider>
    </ScrollContext.Provider>
  )
}

/**
 * Provider raiz del Experience_Engine (R24.1).
 *
 * Envuelve la app con las capacidades del dispositivo y el nucleo del motor, de
 * modo que basta con un unico proveedor en la raiz para habilitar smooth
 * scroll, progreso de scroll compartido y efectos globales en toda la
 * aplicacion (R24.3).
 *
 * @param {{ children: import('react').ReactNode }} props
 * @returns {JSX.Element} Arbol de la app envuelto por el motor.
 */
export function ExperienceProvider({ children }) {
  return (
    <CapabilityProvider>
      <EngineRoot>{children}</EngineRoot>
    </CapabilityProvider>
  )
}

/**
 * Hook de consumo del progreso de scroll del engine (FUENTE UNICA, R19.2).
 *
 * Devuelve el `MotionValue<number>` (0..1) publicado por `ExperienceProvider`.
 * Al ser un MotionValue NO provoca re-render: leelo con `.get()` dentro de un
 * `useFrame`/render loop, o suscribete con `.on('change', ...)` / `useTransform`
 * para reaccionar sin renders. Devuelve `null` si se usa fuera del provider.
 *
 * @returns {import('framer-motion').MotionValue<number>|null} Progreso de scroll.
 */
export function useEngineScroll() {
  return useContext(ScrollContext)
}

/**
 * Hook de consumo del estado dinamico del scroll del engine (Fase 5).
 *
 * Devuelve `{ velocity, direction }` como `MotionValue<number>` publicados por
 * `ExperienceProvider` (misma suscripcion que el progreso: sin listeners extra
 * y sin re-render). `velocity` es el desplazamiento por evento (px) y
 * `direction` vale 1 bajando, -1 subiendo, 0 en reposo inicial. Devuelve
 * `null` si se usa fuera del provider.
 *
 * @returns {{velocity: import('framer-motion').MotionValue<number>, direction: import('framer-motion').MotionValue<number>}|null}
 */
export function useScrollState() {
  return useContext(ScrollStateContext)
}
