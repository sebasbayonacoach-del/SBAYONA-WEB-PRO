// Loader - pantalla de carga inicial con la marca BAYONA (Requirement 20).
//
// Cubre todo el viewport (`position: fixed`, `inset: 0`, z-index muy alto) con
// la identidad BAYONA (marca dorada sobre fondo negro de la paleta, R20.1) y
// refleja el progreso de carga de los assets 3D leidos del store del engine
// `loadingProgress.js` (R20.2): porcentaje textual + barra dorada.
//
// Fase 7B (hallazgo 7A-01): el progreso se leia de `useProgress()` de
// `@react-three/drei`, cuyo import estatico arrastraba `vendor-three`
// (216,48 kB gzip) al chunk de entrada de TODAS las rutas. El contrato es el
// mismo (`{ progress, active, loaded, total }`), pero ahora el Loader es 100%
// agnostico de WebGL: las escenas que carguen assets reportan su avance al
// store via `updateLoadingProgress()` y este overlay solo lo refleja.
//
// Estado "listo":
//   - Con assets declarados (`total > 0`): listo cuando `progress >= 100` y ya
//     no hay cargas activas (`!active`) (R20.2).
//   - Sin assets 3D en la ruta inicial (`total === 0`): tras un tick inicial se
//     considera listo sin esperar assets 3D (R20.6), evitando un loader eterno
//     en rutas que no montan una Scene_3D.
//
// Al estar listo, se oculta con una transicion de SALIDA animada (fade + slide)
// via `AnimatePresence` con tiempos de `motionTokens` (R20.3); mientras es
// visible cubre la interfaz (`pointerEvents: 'auto'`) y al salir libera el
// puntero para que el contenido subyacente sea interactivo (R20.4).
//
// Reduced_Motion (R20.5): render ESTATICO con el progreso TEXTUAL ("Cargando...
// NN%"), sin animacion de movimiento ni barra animada; al estar listo se oculta
// sin transicion de salida (desmontaje instantaneo).

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  getLoadingProgress,
  subscribeLoadingProgress,
} from './loadingProgress.js'
import { theme } from '../config/theme.js'
import { motionTokens } from '../config/motionTokens.js'
import { useCapabilities } from '../hooks/useCapabilities.js'

/**
 * Lee el progreso de carga del engine y re-renderiza cuando cambia.
 *
 * Replica el contrato de lectura que antes cumplia `useProgress()` de drei:
 * `{ progress, active, loaded, total }`. Fuera de cargas declaradas (`total === 0`)
 * devuelve los ceros iniciales del store y el Loader resuelve por su fallback.
 *
 * @returns {{progress: number, active: boolean, loaded: number, total: number}}
 */
function useLoadingProgress() {
  const [snapshot, setSnapshot] = useState(getLoadingProgress)

  useEffect(() => subscribeLoadingProgress(setSnapshot), [])

  return snapshot
}

// z-index muy alto: el loader se dibuja por encima de todo (incluidos cursor y
// grano) mientras cubre la experiencia durante la carga inicial (R20.1).
const LOADER_Z_INDEX = 100000

// Tick inicial (ms) para resolver el estado listo cuando la ruta no declara
// assets 3D (R20.6): si al cumplirse no ha comenzado ninguna carga, se considera
// listo sin esperar assets.
const READY_FALLBACK_MS = 300

// El 3D nunca debe bloquear indefinidamente el contenido. Si una escena declara
// assets pero alguno tarda o no reporta finalización, liberamos la interfaz y
// dejamos que el asset termine por debajo. El DOM/CSS de cada escena ya es el
// fallback diseñado.
const MAX_BLOCKING_MS = 1400

// Dimensiones de la barra de progreso dorada.
const BAR_WIDTH = 220
const BAR_HEIGHT = 2

// Estilo base del overlay a pantalla completa (bordes afilados, R9.5). Fondo
// negro de la paleta y marca dorada (R20.1). Captura el puntero mientras es
// visible para bloquear la interaccion con el contenido en carga.
const overlayBaseStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: LOADER_Z_INDEX,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1.25rem',
  padding: '2rem',
  backgroundColor: theme.color.black,
  color: theme.color.gold,
  borderRadius: theme.radius,
  pointerEvents: 'auto',
  textAlign: 'center',
}

// Wordmark BAYONA: Montserrat 900 con amplio tracking, dorado (R9.7, R20.1).
const wordmarkStyle = {
  margin: 0,
  fontFamily: theme.font.heading,
  fontWeight: theme.fontWeight.heading,
  fontSize: 'clamp(2.5rem, 8vw, 5rem)',
  letterSpacing: '0.28em',
  // Compensa el tracking para mantener el bloque optico centrado.
  textIndent: '0.28em',
  lineHeight: 1,
  color: theme.color.gold,
}

// Subtitulo "Cargando experiencia": Inter ligera, tracking amplio, tenue.
const subtitleStyle = {
  margin: 0,
  fontFamily: theme.font.body,
  fontWeight: theme.fontWeight.bodyLight,
  fontSize: '0.75rem',
  letterSpacing: '0.42em',
  textIndent: '0.42em',
  textTransform: 'uppercase',
  color: theme.color.muted,
}

// Pista de la barra de progreso (fondo oscuro de la paleta, bordes afilados).
const barTrackStyle = {
  position: 'relative',
  width: BAR_WIDTH,
  height: BAR_HEIGHT,
  marginTop: '0.5rem',
  backgroundColor: theme.color.black3,
  borderRadius: theme.radius,
  overflow: 'hidden',
}

// Relleno dorado de la barra (R20.2).
const barFillStyle = {
  position: 'absolute',
  inset: 0,
  right: 'auto',
  backgroundColor: theme.color.gold,
  borderRadius: theme.radius,
}

// Porcentaje en tipografia de datos tecnicos (DM Mono, R9.7).
const percentStyle = {
  margin: 0,
  fontFamily: theme.font.mono,
  fontSize: '0.8rem',
  letterSpacing: '0.2em',
  color: theme.color.goldBright,
}

/**
 * Normaliza el progreso de `useProgress()` a un entero 0..100 seguro para UI.
 *
 * @param {number} progress Progreso crudo (0..100) del store `loadingProgress.js`.
 * @returns {number} Porcentaje entero acotado al rango [0, 100].
 */
function toPercent(progress) {
  const value = Number.isFinite(progress) ? progress : 0
  return Math.min(100, Math.max(0, Math.round(value)))
}

/**
 * Pantalla de carga inicial con la marca BAYONA y progreso de assets 3D.
 *
 * Lee `{ progress, active, loaded, total }` de `useLoadingProgress()` para reflejar el
 * progreso de los assets 3D (R20.1, R20.2) y resuelve el estado "listo" segun:
 *   - `total > 0`: listo cuando `progress >= 100` y `!active` (R20.2).
 *   - `total === 0`: listo tras `READY_FALLBACK_MS` si no comenzo ninguna carga
 *     de assets 3D, sin esperarlos (R20.6).
 *
 * Comportamiento por capacidades:
 *   - Movimiento normal: overlay animado que, al estar listo, ejecuta una
 *     transicion de SALIDA (fade + slide) via `AnimatePresence` con tiempos de
 *     `motionTokens` (R20.3) y libera el puntero al salir (R20.4). La barra de
 *     progreso dorada se anima hacia el porcentaje actual.
 *   - `reducedMotion` (R20.5): render ESTATICO con progreso TEXTUAL ("Cargando...
 *     NN%"), sin barra animada ni movimiento; al estar listo se desmonta sin
 *     transicion de salida.
 *
 * @returns {JSX.Element|null} Overlay del loader mientras carga; `null` cuando
 *   la experiencia esta lista (o durante el estado listo en `reducedMotion`).
 */
export function Loader() {
  const { progress, active, loaded, total } = useLoadingProgress()
  const { reducedMotion } = useCapabilities()
  const [ready, setReady] = useState(false)

  // Camino con assets declarados: listo al completar la carga (R20.2).
  useEffect(() => {
    if (total > 0 && !active && progress >= 100) {
      setReady(true)
    }
  }, [total, active, progress])

  // Camino sin assets 3D en la ruta inicial (R20.6): un tick inicial marca listo
  // si no ha comenzado ninguna carga. Si entretanto arrancan cargas
  // (`total > 0` / `active`), el temporizador se reprograma y no fuerza el
  // estado listo, dejando que lo resuelva el efecto de assets.
  useEffect(() => {
    const timer = setTimeout(() => {
      setReady((prev) => prev || (total === 0 && !active))
    }, READY_FALLBACK_MS)
    return () => clearTimeout(timer)
  }, [total, active])

  // Guardarraíl UX: ningún asset opcional puede secuestrar la interfaz. La
  // experiencia DOM/CSS ya está renderizada y puede mostrarse mientras WebGL
  // completa su carga en segundo plano.
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), MAX_BLOCKING_MS)
    return () => clearTimeout(timer)
  }, [])

  const percent = toPercent(progress)

  // --- Reduced_Motion (R20.5): estatico, textual, sin salida animada ---
  if (reducedMotion) {
    if (ready) {
      return null
    }
    return (
      <div role="status" aria-live="polite" style={overlayBaseStyle}>
        <p style={wordmarkStyle}>BAYONA</p>
        <p style={subtitleStyle}>Cargando experiencia</p>
        <p style={percentStyle}>Cargando... {percent}%</p>
      </div>
    )
  }

  // --- Movimiento normal: overlay animado con salida (R20.3, R20.4) ---
  return (
    <AnimatePresence>
      {!ready && (
        <motion.div
          key="bayona-loader"
          role="status"
          aria-live="polite"
          style={overlayBaseStyle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          // Salida: fade + slide hacia arriba y liberacion del puntero para que
          // el contenido subyacente sea interactivo de inmediato (R20.4).
          exit={{ opacity: 0, y: '-100%', pointerEvents: 'none' }}
          transition={{
            duration: motionTokens.duration.slow,
            ease: motionTokens.ease.curtain,
          }}
        >
          <motion.p
            style={wordmarkStyle}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: motionTokens.duration.base,
              ease: motionTokens.ease.entrance,
            }}
          >
            BAYONA
          </motion.p>
          <p style={subtitleStyle}>Cargando experiencia</p>
          <div
            style={barTrackStyle}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
          >
            <motion.div
              style={barFillStyle}
              initial={{ width: '0%' }}
              animate={{ width: `${percent}%` }}
              transition={{
                duration: motionTokens.duration.base,
                ease: motionTokens.ease.standard,
              }}
            />
          </div>
          <p style={percentStyle}>{percent}%</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
