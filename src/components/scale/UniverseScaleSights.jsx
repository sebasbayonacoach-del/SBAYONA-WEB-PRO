import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useUniverseScale } from '../../lib/scale/UniverseScaleProvider.jsx'

/**
 * Testigo silencioso de secciones vistas.
 *
 * Sin esto la escala del universo solo crece al cambiar de página, y el brief
 * pide lo contrario: que el RECORRIDO agrande BAYONA. Este componente no pinta
 * nada — observa qué secciones han ocupado de verdad el viewport y las registra.
 *
 * La clave es `ruta::identidad`, con la identidad sacada del id o de la primera
 * clase que significa algo. Se ignora el andamiaje genérico (`section-shell`,
 * `ds-reveal`, las variantes de fondo de escena) para que dos secciones que
 * comparten utilidades no se confundan entre sí.
 */
const SELECTOR = ':scope > section, :scope > article > section, :scope > div > section'

const GENERICAS = /^(scene-bg.*|is-.*|has-.*|v2-plane--.*)$/

function clasesDe(seccion) {
  return String(seccion.className || '').split(/\s+/).filter(Boolean)
}

/**
 * Identidad que DISTINGUE, no la primera clase.
 *
 * El intento ingenuo —"la primera clase que signifique algo"— se cae en cuanto
 * una página repite envolvente: las diez secciones de /community empiezan todas
 * por `community-section`, así que las diez registraban la misma clave y el
 * recorrido entero sumaba 1. Aquí se mira el grupo de hermanas y se elige la
 * clase propia de cada una; si ninguna es exclusiva, se numera por posición.
 */
function identidadDe(seccion, hermanas) {
  if (seccion.id) return seccion.id

  let mejor = null
  let menosCompartidas = Infinity
  for (const clase of clasesDe(seccion)) {
    if (GENERICAS.test(clase)) continue
    let veces = 0
    for (const otra of hermanas) {
      if (clasesDe(otra).includes(clase)) veces += 1
    }
    if (veces < menosCompartidas) {
      menosCompartidas = veces
      mejor = clase
    }
    if (veces <= 1) break
  }

  if (mejor && menosCompartidas <= 1) return mejor
  return `${mejor || 'seccion'}-${hermanas.indexOf(seccion)}`
}

export default function UniverseScaleSights() {
  const { seeSection } = useUniverseScale()
  const { pathname } = useLocation()
  const visto = useRef(new Set())
  const callback = useRef(seeSection)
  callback.current = seeSection

  useEffect(() => {
    const contenedor = document.querySelector('main')
    if (!contenedor) return undefined

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue
          const hermanas = hermanasDe(entrada.target)
          const identidad = identidadDe(entrada.target, hermanas)
          if (!identidad) continue
          const clave = `${pathname}::${identidad}`
          if (visto.current.has(clave)) continue
          visto.current.add(clave)
          callback.current(clave)
        }
      },
      // Banda central de lectura, no un ratio del propio bloque. Con `threshold`
      // alto una sección más larga que el viewport no alcanza nunca el corte y
      // no cuenta, aunque el usuario la esté mirando. Recortando el root por
      // arriba y por abajo, una sección cuenta en cuanto cruza el tercio donde
      // cae la vista.
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )

    const observadas = new WeakSet()

    const hermanasDe = () => [...contenedor.querySelectorAll(SELECTOR)]

    function explorar() {
      for (const seccion of contenedor.querySelectorAll(SELECTOR)) {
        if (observadas.has(seccion)) continue
        observadas.add(seccion)
        observador.observe(seccion)
      }
    }

    // Las rutas van con React.lazy dentro de <Suspense>: en el primer efecto el
    // <main> puede estar todavía vacío, y observar una lista vacía no produce
    // nunca más intentos. Se re-escanea cuando el contenido aparece.
    explorar()
    const mutaciones = new MutationObserver(explorar)
    mutaciones.observe(contenedor, { childList: true, subtree: true })

    return () => {
      mutaciones.disconnect()
      observador.disconnect()
    }
  }, [pathname])

  return null
}
