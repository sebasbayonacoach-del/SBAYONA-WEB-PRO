import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import CompanionDron from './CompanionDron.jsx'
import CompanionChat from './CompanionChat.jsx'
import { useVisitorJourney } from '../../lib/onboarding/VisitorJourneyProvider.jsx'
import { useRewards } from '../../lib/rewards/RewardsProvider.jsx'
import {
  guideBeatAt,
  guidePlanLabel,
  guideSay,
  guideSection,
} from '../../lib/companion/guideScript.js'

/**
 * ACOMPAÑANTE GLOBAL
 * ---------------------------------------------------------------------------
 * El asistente que recorre la web contigo. `CompanionDron` pone la cara y el
 * tecleo; esto pone el criterio: dónde habla, qué dice y cuándo calla.
 *
 * VOZ, desde el 22-09 (comentario 15): quien habla es SEBASTIÁN en primera
 * persona, el entrenador de la casa, no «una asesora» genérica. Y el acceso ya
 * no es un orbe anónimo: la inicial y el rótulo con su nombre, para que se lea
 * como una persona y no como un botón decorativo.
 *
 * Decisiones que conviene no romper:
 *
 *  1. HABLA SEGÚN EL SCROLL. Cada página tiene unos pocos turnos en
 *     `lib/companion/guideScript.js`. Al cambiar de turno el texto cambia y el
 *     drone lo vuelve a teclear: la página se siente viva sin mover el contenido.
 *
 *  2. CALLA EN LA RECEPCIÓN. `/onboarding` ya monta su propia instancia
 *     (Onboarding.jsx) y su guion va por etapas; dos drones hablando a la vez
 *     serían ruido. También calla donde no hay guion: `/entrar`, `/app`, 404.
 *
 *  3. CEDE EL TURNO AL PASE DE LLEGADA. En la portada el pase de crédito BAYONA
 *     es el recibimiento; el asistente entra después de que la persona lo
 *     reclame o lo cierre. Primero una cosa, luego la otra.
 *
 *  4. LA X NO LO BORRA, LO PLIEGA. Queda el acceso flotando como acceso, igual
 *     que el widget del bono: quien lo cierra no lo pierde para siempre.
 *
 *  5. MEMORIA, NUNCA ALMACENAMIENTO. El nombre viene del recorrido en memoria y
 *     el plegado vive en estado local. La web sigue sin guardar nada del
 *     visitante entre sesiones.
 */

/** Deja respirar la apertura de cada página antes de que nadie hable encima. */
const ENTRANCE_DELAY = 1600

export default function GuideCompanion() {
  const { pathname } = useLocation()
  const { name } = useVisitorJourney()
  const { dismissed: bonoCerrado } = useRewards()
  const { scrollYProgress } = useScroll()

  const section = guideSection(pathname)
  const plan = guidePlanLabel(pathname)
  const progreso = useRef(0)
  const [beat, setBeat] = useState(null)
  const [plegado, setPlegado] = useState(false)
  const [charlando, setCharlando] = useState(false)

  /*
   * El scroll dispara esto en cada frame, así que el estado solo cambia cuando
   * cambia el turno: devolver `prev` evita re-renderizar el drone (y reiniciar
   * el tecleo) mientras la persona sigue bajando dentro de la misma frase.
   */
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    progreso.current = latest
    const siguiente = guideBeatAt(section, latest)
    setBeat((prev) => (prev?.id === siguiente?.id ? prev : siguiente))
  })

  useEffect(() => {
    setBeat(null)
    if (!section) return undefined

    /*
     * Todavía en el pliegue, el globo caía encima del CTA primario de la portada
     * («EMPEZAMOS EL RECORRIDO») y del rótulo que lo acompaña durante los 6,5 s
     * que tarda en plegarse: justo el sitio donde se decide si se sigue bajando.
     * El saludo no se pierde: el turno se calcula con el scroll, así que en
     * cuanto la persona baja media pantalla aparece el que le corresponde. Con
     * umbral en píxeles de la propia ventana, no en progreso, porque un 3 % de
     * una página de 22.000 px no es lo mismo que un 3 % de una de 6.800.
     */
    if (window.scrollY < window.innerHeight * 0.55) return undefined

    const timer = window.setTimeout(() => {
      setBeat(guideBeatAt(section, progreso.current))
    }, ENTRANCE_DELAY)

    return () => window.clearTimeout(timer)
  }, [section])

  const text = useMemo(() => guideSay(beat, { name, plan }), [beat, name, plan])

  /*
   * El globo se retira solo. Estaba pensado para que la persona lo cerrara con
   * la ×, pero en la práctica se quedaba encima del contenido: en /programs
   * tapaba las fichas de NIÑOS y ADULTOS y en la home cortaba el cuerpo de las
   * tarjetas, así que media página quedaba sucia durante todo el recorrido.
   * Ahora el mensaje se lee y el dron vuelve a su orb; al cambiar de turno se
   * abre otra vez, que es cuando aporta algo nuevo. Cerrarlo a mano sigue
   * valiendo hasta el siguiente turno.
   */
  useEffect(() => {
    if (!text) return undefined
    setPlegado(false)
    const timer = window.setTimeout(() => setPlegado(true), 6500)
    return () => window.clearTimeout(timer)
  }, [text])

  /*
   * Con el chat abierto manda la conversación: los turnos de scroll siguen
   * calculándose detrás, pero no se pintan encima de lo que se está leyendo.
   *
   * Todo sale por un portal a `document.body`. No es un capricho: el
   * acompañante cuelga de un `div` con `z-index: 1` (el envoltorio de
   * PageTransition) y un contexto de apilamiento atrapado ahí abajo no puede
   * quedar por encima de `main` por mucho `z-index` que declare su propio
   * elemento. Medido: el punto del orbe devolvía `section.programs-pain`, así
   * que ni el globo ni el chat se podían pulsar.
   */
  const interior = (() => {
    if (charlando) return <CompanionChat nombre={name} onCerrar={() => setCharlando(false)} />

    /*
     * Donde no hay guion (la recepción, `/entrar`, el área de miembros, el 404)
     * antes no se pintaba nada. Ahora queda al menos la puerta: el chat sirve en
     * todas las rutas, que es lo que se pidió.
     */
    if (!section || !text) {
      return (
        <button
          type="button"
          className="companion-orb"
          onClick={() => setCharlando(true)}
          aria-label="Hablar con Sebastián, tu asistente en BAYONA"
        >
          <span className="companion-orb__face" aria-hidden="true">S</span>
          <span className="companion-orb__plate" aria-hidden="true">
            <strong>SEBASTIÁN</strong>
            <small>Asistente BAYONA</small>
          </span>
        </button>
      )
    }

    if (section === '/' && bonoCerrado === false) return null

    if (plegado) {
      return (
        <button
          type="button"
          className="companion-orb"
          onClick={() => setCharlando(true)}
          aria-label="Hablar con Sebastián, tu asistente en BAYONA"
        >
          <span className="companion-orb__face" aria-hidden="true">S</span>
          <span className="companion-orb__plate" aria-hidden="true">
            <strong>SEBASTIÁN</strong>
            <small>Asistente BAYONA</small>
          </span>
        </button>
      )
    }

    return (
      <CompanionDron
        className="companion--global"
        text={text}
        name={name}
        label="Sebastián · asistente BAYONA"
        onDismiss={() => setPlegado(true)}
        onAsk={() => setCharlando(true)}
      />
    )
  })()

  if (!interior) return null
  if (typeof document === 'undefined') return null

  return createPortal(interior, document.body)
}
