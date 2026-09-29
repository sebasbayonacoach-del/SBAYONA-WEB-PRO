// SceneCycler — UN solo lienzo WebGL que cambia de variante según la sección
// que el usuario está viendo.
//
// Por qué existe: el brief pide que cada tramo de scroll tenga algo 3D. Montar
// un `SceneMount` por sección significaría tantos contextos WebGL como secciones
// (67 en el sitio), cada uno con su propio `<Canvas>`, su DPR y su presupuesto
// de GPU. Eso saca `vendor-three` de la home y tira el LCP móvil medido en
// 3D-PERFORMANCE-BASELINE.md.
//
// Lo que hace esto: un único `SceneMount` cuya `config.variant` cambia cuando
// cambia la sección más visible. Un contexto, una descarga, y degradación por
// dispositivo intacta porque sigue pasando por `resolveSceneConfig`.
//
// El progreso que ve la escena NO es el de la página. `SceneMount` no admite
// `scrollProgress` (es `Scene3D` quien lo acepta) y el engine publica un único
// `MotionValue` global, así que una escena que animase de 0 a 1 la vería pasar
// por su tramo en el rango 0.6..0.7 y se quedaría a medias. Se resuelve SIN
// tocar el motor: el cycler provee `ScrollContext` con una fuente local que va
// de 0 (la sección entra por el borde inferior) a 1 (sale por el superior),
// calculada sobre la sección activa. Al ser un objeto mutable con `.get()`, que
// es lo que acepta `readScroll`, cambiar de sección no re-renderiza React.
//
// Gobernanza: `pointerEvents: 'none'` en el estilo por defecto. El precedente
// está en Scene3D.jsx:81 — un Canvas que captura punteros se come los CTAs de
// la página, y eso ya costó una sesión entera.

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { SceneMount } from './SceneMount.jsx'
import { ScrollContext } from '../providers/ExperienceProvider.jsx'

function clamp01(value) {
  if (!Number.isFinite(value)) return 0
  return value < 0 ? 0 : value > 1 ? 1 : value
}

/**
 * Fuente de progreso compatible con `readScroll`: un número guardado en un
 * objeto que nunca cambia de identidad.
 */
function createScrollSource() {
  return {
    current: 0,
    get() {
      return this.current
    },
  }
}

/**
 * @param {Object} props
 * @param {Array<{
 *   id: string,
 *   variant: string,
 *   sectionId: string,
 *   params?: Object,
 *   particles?: boolean,
 *   postProcessing?: boolean,
 * }>} props.steps  Uno por sección, en el orden en que aparecen al bajar.
 * @param {string} [props.className]  Clase del contenedor (debe posicionar:
 *   `SceneMount` es `position:absolute; inset:0`).
 * @param {number} [props.minRatio]  Umbral de visibilidad para candidatear.
 * @param {boolean} [props.portal]  Montar el lienzo DENTRO de la sección
 *   activa (true) o en el propio contenedor (false, por defecto).
 */
export function SceneCycler({ steps, className, minRatio = 0.25, portal = false }) {
  const [activeId, setActiveId] = useState(steps[0]?.id ?? null)
  const scroll = useMemo(createScrollSource, [])
  // Se refresca en cada cambio de paso: es lo que lee el medidor de scroll.
  const [activeSectionId, setActiveSectionId] = useState(steps[0]?.sectionId ?? null)
  // Declarados junto a los demás hooks, no donde se usan. Estaban después del
  // `if (!step) return null`, y eso es un orden de hooks condicional: React
  // lanza «rendered more hooks than during the previous render» en cuanto la
  // lista de pasos llegue vacía un render y llena al siguiente.
  const [host, setHost] = useState(null)
  const layerRef = useRef(null)
  const clampRef = useRef(null)

  useEffect(() => {
    if (typeof document === 'undefined') return undefined


    // Se vuelve a CONSULTAR cada nodo por id en cada medición, en vez de observar
    // los nodos capturados una vez. Motivo, medido sobre la home real: el
    // IntersectionObserver se queda con referencias, la home monta y sustituye
    // secciones despues (StickyStage, LeadMagnet, lazy), y al quedarse mirando
    // nodos muertos el paso activo se CONGELABA — `dumbbells` sigui6 siendo
    // "la seccion mas visible" del 42 % al 75 % de la pagina mientras en pantalla
    // habia otra completamente distinta. Un listener de scroll que re-consulta
    // por id es inmune a eso y cuesta 8 getBoundingClientRect por cuadro.
    // La geometria de la capa depende de donde esta montada, y al cambiar de
    // seccion React la re-portaliza DESPUES de la ultima medida del scroll: sin
    // este refresco, el primer fotograma de cada seccion conservaba la banda de
    // la anterior y el lienzo sangraba sobre la vecina (medido: 6 tramos con
    // sangrado, de hasta 1779 px).
    const clampLayer = () => {
      const layer = layerRef.current
      const hostNode = layer?.parentElement?.closest('section') || layer?.parentElement
      if (!layer || !hostNode) return
      const rect = hostNode.getBoundingClientRect()
      const view = window.innerHeight || 1
      const top = Math.max(0, rect.top)
      const h = Math.min(rect.bottom, view) - top
      // Si la sección anfitriona no está en pantalla, la capa se ESCONDE. El
      // suelo de 120 px que había antes mantenía un lienzo visible aunque el
      // anfitrión estuviera entero fuera (medido: `lead-magnet` con rect.top
      // -2504 y la capa pintando arriba del pie legal, desbordando 1779 px).
      // Sin sección visible no hay escena que mostrar. Y tampoco la hay si la
      // sección ya tiene UN LIENZO PROPIO montado después del escaneo (el globo de
      // `/about` y el showroom de `/programs` llegan con `React.lazy`, así que al
      // escanear no estaban y la sección quedó con paso). Ahí el nuestro queda
      // literalmente debajo del de la página: `visibility-audit.cjs` medía 0,6 % y
      // 1,2 % de píxeles cambiados. Esconderlo ahorra un contexto WebGL pintando
      // para nada; el 3D de ese tramo lo pone la propia página.
      const lienzoAjeno = [...hostNode.querySelectorAll('canvas')].some((c) => !layer.contains(c))
      // Y tampoco si lo que tapa el centro del tramo es OTRA SECCIÓN. Medido en
      // `/about`: el paso `4-plyobox` vive en `#about-sec-4` (`.cb-bridge`), pero
      // en el punto central manda `about-globe-section`, una hermana que se
      // solapa por layout (capa pegajosa del globo). No es un problema de
      // `z-index` nuestro —ninguna subida lo arregla, porque el que tapa está
      // fuera de nuestro anfitrión— y en ese tramo el 3D ya lo pone la página.
      // Se esconde la capa en vez de dejarla pintando debajo, que cuesta un
      // contexto WebGL entero por fotograma.
      let tapado = false
      if (h >= 120) {
        const cx = Math.round((window.innerWidth || 1280) / 2)
        const cy = Math.round(top + h / 2)
        const topo = document.elementFromPoint(cx, cy)
        // Vale todo lo que esté DENTRO de nuestro anfitrión (su contenido, que
        // legítimamente va por encima del decorado) y todo lo que sea ANCESTRO
        // (un contenedor nuestro no se puede tapar a sí mismo). Lo demás —una
        // hermana, o una capa fija del cascarón como el panel de crédito de
        // `/app`— significa que en ese punto no se ve nuestro lienzo.
        if (topo && topo !== hostNode && !hostNode.contains(topo) && !topo.contains(hostNode)) {
          tapado = true
        }
      }
      if (h < 120 || lienzoAjeno || tapado) {
        layer.style.display = 'none'
        return
      }
      layer.style.display = ''
      // La geometría se resuelve EN COORDENADAS DEL ANFITRIÓN. `position: fixed`
      // no siempre es la ventana: se referencia al ancestro con `transform`,
      // `filter` o `contain`, y en BAYONA hay contenedores animados por todas
      // partes. Medido en `/app 3-barbell`: el `<canvas>` medía 1280×2355 — la
      // sección entera — con el recorte calculado en coordenadas de ventana, que
      // ya no cuadraba con nada. El tramo aportaba 0 px. Con `absolute` es
      // inmune, porque el anfitrión está posicionado (se lo ponemos arriba).
      //
      // El alto se fija al de la ventana a propósito: si el lienzo midiera la
      // banda, R3F recalcularía el `aspect` de la cámara en cada fotograma y el
      // encuadre —resuelto con el aspect de la ventana— dejaría el objeto
      // encogido al encoger la banda (la barra de 435 px a 130 px en /faq).
      layer.style.position = 'absolute'
      layer.style.left = '0'
      layer.style.right = '0'
      layer.style.bottom = 'auto'
      layer.style.top = `${Math.round(Math.max(0, -rect.top))}px`
      layer.style.height = `${Math.round(view)}px`
      // La capa NO se redimensiona a la banda: se recorta.
      //
      // `!important` NO es un adorno: ds-atelier.css anima `clip-path` en los
      // hijos de la sección (`@keyframes` de máscara de línea), y en la cascada
      // una animación gana a la declaración en línea. Sin `!important` el
      // navegador dejaba el recorte en `inset(0px)` y el lienzo sangraba sobre la
      // sección vecina (medido: 385..662 px en las ocho rutas).
      layer.style.setProperty(
        'clip-path',
        `inset(0px 0px ${Math.round(Math.max(0, view - h))}px 0px)`,
        'important',
      )
    }

    clampRef.current = clampLayer
    let queued = false
    const measure = () => {
      queued = false
      const view = window.innerHeight || 1
      let bestId = null
      let bestRatio = minRatio
      for (const step of steps) {
        const node = document.getElementById(step.sectionId)
        if (!node) continue
        // Fuera los tramos que ya tienen SU propio lienzo. El filtro del cycler de
        // rutas descarta esas secciones al escanear, pero el escaneo pasa UNA vez
        // por ruta y capas como el globo de `/about` llegan con `React.lazy`: al
        // commit aún no existían, se quedaron con paso, y luego su capa las cubre
        // enteras. Medido en `visibility-audit.cjs`: `/about 4-plyobox` cambiaba
        // 0,6 % de píxeles con el nuestro debajo de la suya.
        const ajena = [...node.querySelectorAll('canvas')].some(
          (lienzo) => !layerRef.current?.contains(lienzo),
        )
        if (ajena) continue
        const rect = node.getBoundingClientRect()
        const visible = Math.min(rect.bottom, view) - Math.max(rect.top, 0)
        const ratio = visible > 0 ? visible / Math.min(rect.height, view) : 0
        if (ratio > bestRatio) {
          bestRatio = ratio
          bestId = step.sectionId
        }
      }
      if (bestId) {
        const next = steps.find((step) => step.sectionId === bestId)?.id
        if (next) setActiveId((prev) => (prev === next ? prev : next))
      }
      // La capa es `fixed` para que el lienzo mida UNA pantalla (aspecto sano),
      // pero eso la deja desbordar sobre la sección vecina: se veía el arco del
      // timeline pintado encima de la sección crema de arriba. Se recorta a la
      // banda visible de su propia sección en la MISMA pasada que ya mide el
      // scroll, y escribiendo el estilo directo: si pasara por estado de React
      // habría un re-render por fotograma.
      clampLayer()

    }
    const onScroll = () => {
      if (queued) return
      queued = true
      requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [steps, minRatio])

  const step = useMemo(
    () => steps.find((s) => s.id === activeId) ?? steps[0],
    [steps, activeId],
  )

  useEffect(() => setActiveSectionId(step?.sectionId ?? null), [step])

  // Dónde vive el único lienzo: dentro de la sección activa cuando `portal`.
  // Va ANTES del `if (!step) return null`: era de los hooks que estaban debajo
  // del retorno. Y NO limpia el host al desmontar el efecto: hacerlo dejaba un
  // render intermedio con `host = null`, y el `<Canvas>` se desmontaba dos
  // veces por cambio de sección en lugar de una.
  useEffect(() => {
    const node = step?.sectionId ? document.getElementById(step.sectionId) : null
    const raised = []
    if (node) {
      if (getComputedStyle(node).position === 'static') node.style.position = 'relative'
      // `isolation` es OBLIGATORIO, no estético: sin contexto de apilamiento el
      // lienzo se va DETRÁS del fondo opaco de la sección y desaparece. Medido en
      // la home real: tramos enteros con `visibles: 0`.
      if (portal) node.style.isolation = 'isolate'
      // `z-index: -1` NO basta: en el orden de pintura, un hijo en flujo y SIN
      // posicionar se pinta por encima de un descendiente con z-index negativo.
      // Basta un `<div>` decorativo con degradado para tapar el lienzo entero.
      // Medido con `harness/visibility-audit.cjs` (captura con la capa encendida y
      // apagada y diferencia píxeles): 9 tramos de las tres primeras rutas
      // cambiaban EXACTAMENTE 0 píxeles, y al forzar `z-index: 999` desde fuera el
      // objeto aparecía. Pintaba; estaba tapado.
      //
      // Se deja el lienzo en `0` —por encima de los fondos decorativos— y se sube
      // a `1` los hijos que llevan texto. Probado también a portalizarse DENTRO
      // del envoltorio opaco (`pickOpaqueHost`): medido, era PEOR (`/about` bajaba
      // de 5 tramos sanos a 2 y `/community 0-barbell` de 57,8 % a 0,9 %), porque
      // al entrar en un nodo con `overflow: hidden` el recorte en coordenadas de
      // ventana deja de cuadrar con la banda.
      if (portal) {
        // Se suben las HOJAS con texto propio, no los contenedores. Motivo, en el
        // orden de pintura de CSS: el fondo de un descendiente en flujo y sin
        // posicionar se pinta en el paso 3 y un `z-index: 0` en el 6 — o sea el
        // lienzo ya va por encima de ese fondo. Lo que había que garantizar es que las
        // palabras quedaran por encima del lienzo, y para eso basta subirlas a
        // ellas. Subir el contenedor (intento anterior) arrastra su fondo opaco
        // y vuelve a tapar el decorado: es exactamente el caso de las filas de
        // `/app`, que tienen fondo y separador.
        for (const el of node.querySelectorAll(
          'h1, h2, h3, h4, p, li, dd, dt, a, button, blockquote, figcaption, td, th, label, summary',
        )) {
          const conTexto = [...el.childNodes].some(
            (n) => n.nodeType === 3 && n.textContent.trim().length > 0,
          )
          if (!conTexto) continue
          const cs = getComputedStyle(el)
          if (cs.position === 'static') el.style.position = 'relative'
          el.dataset.cyclerZPrev = el.style.zIndex || ''
          el.style.zIndex = '1'
          raised.push(el)
        }
      }
    }
    setHost(portal ? node ?? null : null)
    return () => {
      for (const child of raised) {
        if (child.dataset.cyclerZPrev) child.style.zIndex = child.dataset.cyclerZPrev
        else child.style.removeProperty('z-index')
        delete child.dataset.cyclerZPrev
      }
    }
  }, [step, portal])

  // Se relanza cuando cambia el anfitrion (el portal se mueve) y un cuadro despues,
  // que es cuando el layout del nuevo padre ya es real.
  useEffect(() => {
    if (!portal || !host) return undefined
    clampRef.current?.()
    const raf = requestAnimationFrame(() => clampRef.current?.())
    return () => cancelAnimationFrame(raf)
  })

  // Progreso local de la sección activa, leído en el `useFrame` de la escena.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const update = () => {
      const node = activeSectionId ? document.getElementById(activeSectionId) : null
      if (!node) return
      const rect = node.getBoundingClientRect()
      const view = window.innerHeight || 1
      // 0 al entrar por abajo, 0.5 exactamente centrada, 1 al salir por arriba.
      scroll.current = clamp01((view - rect.top) / (rect.height + view))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [scroll, activeSectionId])

  if (!step) return null

  const config = {
    variant: step.variant,
    params: step.params,
    particles: step.particles ?? false,
    postProcessing: step.postProcessing ?? false,
  }

  // La capa se TELETRANSPORTA dentro de la sección activa (portal) en vez de
  // vivir en un nodo fijo del fondo de la página. Motivo, medido sobre la home
  // real: cada `<section>` pinta un fondo opaco (#050505, degradados), así que
  // un `<Canvas>` fijo detrás del documento no se ve nunca. Con el portal dentro
  // de la sección, `zIndex: -1` lo deja POR ENCIMA del fondo de la sección y POR
  // DEBAJO de su contenido, que es exactamente el hueco que ocupa un decorado.
  // Sigue habiendo UN solo `<Canvas>`: lo que cambia de padre es el contenedor.
  const layer = (
    <div
      ref={layerRef}
      className={className}
      data-scene-cycler={activeId ?? ''}
      // `fixed`, no `absolute`: el lienzo tiene que medir UNA pantalla, no la
      // sección entera. Con `inset:0` sobre una sección de 1500+ px, R3F pinta un
      // canvas de 1500 px y la cámara (fov 45 vertical) queda con una aspect
      // imposible: solo ves una franja del encuadre y el objeto parece enorme.
      // `fixed` sigue dentro del contexto de apilamiento de la sección anfitriona
      // — `isolation` no crea bloque de contención para `fixed` — así que mantiene
      // el `z-index: -1` por encima del fondo y debajo del texto.
      style={{
        // Con portal la capa vive DENTRO de la sección y se posiciona contra ella
        // (`absolute`); el alto lo fija `clampLayer` al de la ventana. Sin portal
        // es la capa de fondo de quien monta el cycler, y ahí `fixed` sí es lo
        // que pide el banco de pruebas.
        position: portal ? 'absolute' : 'fixed',
        inset: 0,
        // Sobre el fondo de la sección y bajo el contenido con texto (ver el
        // efecto de `raised`): 0 con portal, -1 sin él.
        zIndex: portal ? 0 : -1,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <ScrollContext.Provider value={scroll}>
        <SceneMount config={config} style={{ pointerEvents: 'none' }} />
      </ScrollContext.Provider>
    </div>
  )

  if (!host) {
    return (
      <div className={className} data-scene-cycler={activeId ?? ''}>
        <ScrollContext.Provider value={scroll}>
          <SceneMount config={config} style={{ pointerEvents: 'none' }} />
        </ScrollContext.Provider>
      </div>
    )
  }
  return createPortal(layer, host)
}

export default SceneCycler
