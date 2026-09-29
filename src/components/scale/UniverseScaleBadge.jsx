import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { STAGES } from '../../lib/scale/universeScale.js'
import { useUniverseScale } from '../../lib/scale/UniverseScaleProvider.jsx'
import '../../styles/universe-scale.css'

/** Cuánto se queda desplegado tras cambiar de fase, en ms. */
const VENTANA_LECTURA = 4200

/**
 * Testigo de la escala del universo. No es un progreso de lectura ni una barra de
 * XP: dice en qué parte de BAYONA estás parado y deja ver que quedan capas por
 * abrir.
 *
 * Se repliega a los pips en cuanto la persona baja, y se vuelve a abrir solo el
 * tiempo de leerse cuando cambia la fase. Un panel fijo de 350px en la esquina
 * acababa rozando contenido al hacer scroll; el testigo tiene que estar cuando
 * aporta algo y apartarse el resto del tiempo.
 */
export default function UniverseScaleBadge() {
  const { progress, misiones, progreso } = useUniverseScale()
  const siguiente = misiones.find((m) => !m.hecha)
  const [desplegado, setDesplegado] = useState(true)
  const temporizador = useRef(null)

  // Al cambiar la fase, desplegar y devolver el testigo al modo compacto.
  useEffect(() => {
    setDesplegado(true)
    clearTimeout(temporizador.current)
    temporizador.current = setTimeout(() => setDesplegado(false), VENTANA_LECTURA)
    return () => clearTimeout(temporizador.current)
  }, [progress.stageId])

  useEffect(() => {
    const alBajar = () => {
      if (window.scrollY > 420) setDesplegado(false)
    }
    window.addEventListener('scroll', alBajar, { passive: true })
    return () => window.removeEventListener('scroll', alBajar)
  }, [])

  return (
    <aside
      className={`universe-scale${desplegado ? '' : ' universe-scale--compacto'}`}
      aria-label="Tu fase en BAYONA"
      data-universe-stage={progress.stageId}
    >
      <ol className="universe-scale-pips" aria-hidden="true">
        {STAGES.map(({ id, key }) => (
          <li
            key={key}
            className="universe-scale-pip"
            data-filled={id <= progress.stageId ? 'yes' : 'no'}
          />
        ))}
      </ol>
      {desplegado ? (
        <>
          <motion.p
            key={progress.stageId}
            className="universe-scale-label"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="universe-scale-stage">{progress.label}</span>
            <span className="universe-scale-hint">{progress.hint}</span>
          </motion.p>
          <p className="universe-scale-remaining">
            {progress.ultima
              ? 'Has abierto BAYONA entero.'
              : progress.enFase === 0
                ? `Capa recién abierta. Faltan ${progress.falta} descubrimientos para la siguiente.`
                : `En esta capa llevas ${progress.enFase}. Faltan ${progress.falta} para la siguiente.`}
          </p>
          {/*
            Las misiones son lo que convierte el recorrido en un juego propio
            (§27-28). Se resume una sola línea: la lista completa medía 212px de
            testigo y acababa tapando el encabezado de la página. Lo que tiene
            que caber es el progreso y el siguiente paso, no el catálogo.
          */}
          <p className="universe-scale-mision-total" data-siguiente={siguiente?.label ?? ''}>
            Misiones {progreso.hechas} de {progreso.total}
            {siguiente ? ` · la siguiente: ${siguiente.label.toLowerCase()}` : ' · todas cerradas'}
          </p>
        </>
      ) : (
        <p className="universe-scale-corto">{progress.label}</p>
      )}
    </aside>
  )
}
