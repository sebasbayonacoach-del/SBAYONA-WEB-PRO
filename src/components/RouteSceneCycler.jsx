// RouteSceneCycler — una capa 3D por ruta, con UN solo lienzo WebGL.
//
// Envuelve el `SceneCycler` del engine con las dos cosas que son de la página y
// no del motor:
//   1. Descubrir las secciones de primer nivel de la ruta (las hermanas de su
//      primera `<section>`) y darles id.
//   2. Elegir variante por sección y encuadrarla contra el hueco que deja el
//      titular de ESA sección.
//
// Por qué no montar un `SceneMount` por sección: `/` tiene 14 secciones y
// `/resources` 11. Un lienzo por sección son 25 contextos WebGL, cada uno con su
// DPR y su presupuesto de GPU, y `vendor-three` entrando en rutas que hoy no lo
// cargan. Uno por ruta mantiene la degradación por dispositivo intacta porque
// sigue pasando por `resolveSceneConfig`.

import { useEffect, useState } from 'react'
import { SceneCycler } from '../engine/scene/SceneCycler.jsx'
import { useCapabilities } from '../engine/hooks/useCapabilities.js'

/**
 * @param {Object} props
 * @param {Array<[RegExp, string]>} props.rules  [regex del titular, variante].
 * @param {string[]} props.cycle  Variantes de reserva, por rotación.
 * @param {string} [props.idPrefix]
 */
export function RouteSceneCycler({ rules, cycle, idPrefix = 'sec' }) {
  const caps = useCapabilities()
  const [steps, setSteps] = useState([])
  const canRunNarrativeWebGL = caps.mode === 'desktop' && caps.reducedMotion === false

  useEffect(() => {
    if (!canRunNarrativeWebGL) {
      setSteps([])
      return undefined
    }
    let cancelled = false
    let frame = 0

    // Secciones de primer nivel que TODAVÍA no tienen su propio lienzo.
    // `/about` y `/programs` ya montan su capa (globe y showroom) antes de
    // esto: sin este filtro, el cycler se sumaba y la ruta acababa con DOS
    // contextos WebGL y dos escenas pintando en el mismo tramo.
    // Vivas: el cambio de ruta va con `AnimatePresence`, así que al montar el
    // cycler las <section> de la página saliente siguen en el DOM. Enlazarse a
    // ellas deja los pasos apuntando a nodos ya desmontados, y el resultado
    // medido era 0/9 tramos con escena en /faq. `document.contains` las saca.
    // Con altura: cada ruta arrastra un `<section>` de 0 px en la posición 0
    // (un anclaje del cascarón, sin clase ni título). Sin este filtro se
    // quedaba el primer paso, la capa se ocultaba por `h < 120` y la página
    // arrancaba sin nada de 3D hasta la segunda sección.
    const liveSections = () =>
      [...document.querySelectorAll('section:not(section section)')].filter(
        (node) =>
          document.contains(node) &&
          node.offsetHeight > 0 &&
          !node.querySelector('canvas'),
      )

    // Las rutas van con `React.lazy` dentro de `<Suspense>`, y el cascarón
    // (Layout) pinta su `<section>` de compartir ANTES de que la página monte
    // las suyas. Paradose en el primer resultado no vacío, /faq capturaba solo
    // «share-invite» y se quedaba con 1 tramo de 9: las secciones reales de la
    // página (2632 px y 1656 px, sin id) llegaban después y ya nadie rescaneaba.
    // Lo que hace falta no es "no vacío", es "ya no cambia": se commita cuando
    // la misma lista de secciones se repite STABLE_FRAMES seguidas.
    const STABLE_FRAMES = 12
    const MAX_FRAMES = 150

    // Se escribe UNA sola vez. Después del commit el cycler mete un <canvas> en
    // la sección activa, y como el filtro de arriba excluye las que ya tienen
    // lienzo, un segundo rescance descartaría ese tramo y reindexaría los
    // siguientes. Medido: así /`/` caía de 8 tramos con escena a 3 en build.
    /*
     * Cuánto peso visual merece el objeto en ESTA sección. El velo global de
     * `media-scenes.css` baja la capa a 0,5 para que el objeto no compita con
     * las letras, pero medido en `/about` eso hacía desaparecer la barra del
     * hueco de 3841 px de la línea de tiempo: allí el objeto era lo único en
     * pantalla y se quedaba en nada. Así que el velo se decide con el hueco
     * real de la franja central —el mismo criterio de `inventario-3d.mjs`— y se
     * escribe como variable en la sección: la propiedad hereda hasta el lienzo,
     * que está portalizado dentro de ella, y no hace falta tocar `SceneCycler`.
     */
    const aplicarVelo = (node) => {
      const alto = node.offsetHeight
      const base = node.getBoundingClientRect().top + window.scrollY
      const franjas = []
      for (const el of node.querySelectorAll('h1, h2, h3, h4, p, li, td, th, button, a, figcaption')) {
        const r = el.getBoundingClientRect()
        if (!el.textContent.trim()) continue
        if (r.right < window.innerWidth * 0.25 || r.left > window.innerWidth * 0.75) continue
        franjas.push([r.top + window.scrollY - base, r.bottom + window.scrollY - base])
      }
      franjas.sort((a, b) => a[0] - b[0])
      let libre = 0
      let cursor = 0
      for (const [ini, fin] of franjas) {
        if (ini > cursor) libre = Math.max(libre, ini - cursor)
        cursor = Math.max(cursor, fin)
      }
      libre = Math.max(libre, alto - cursor)
      // Un objeto del repertorio mide 522 px de alto; si la corrida libre es de
      // más de una pantalla y media, el objeto tiene el encuadre para él solo.
      node.style.setProperty('--scene-veil', libre >= window.innerHeight * 1.7 ? '0.9' : '0.5')
    }

    const commit = (sections) => {
      setSteps(
        sections
          .map((node, i) => {
            if (!node.id) node.id = `${idPrefix}-${i}`
            const heading = node.querySelector('h1, h2, h3')?.textContent ?? ''
            const hit = rules.find(([re]) => re.test(heading))
            // Con `cycle: []` (rutas que declaradamente no llevan decorado, como
            // `/faq`), `cycle[i % 0]` es `cycle[NaN]` → `undefined`, que NO es
            // `null` y se colaba por el filtro: la ruta acababa con pasos de
            // variante inexistente y el velo puesto en secciones que debían estar
            // limpias. Lo cazó scripts/probe-escenas.mjs al contar el guion contra
            // lo pintado. Se resuelve a `null` aquí y se filtra por nulo flojo.
            const variant = hit ? hit[1] : cycle.length ? cycle[i % cycle.length] : null
            return { node, i, variant }
          })
          // `null` en el guion = "esta sección no lleva decorado". Se queda sin
          // paso, y como el lienzo vive portalizado y recortado DENTRO de la
          // sección del paso activo, al bajar a esta sección el anterior queda
          // recortado fuera: no pinta nada. Medido en `/about`: el ciclo ponía
          // una pila de pesos negra sobre el hueso de «CUATRO PRINCIPIOS», que
          // es el peor contraste del sitio.
          .filter(({ variant }) => variant != null)
          .map(({ node, i, variant }) => {
            aplicarVelo(node)
            return {
              id: `${i}-${variant}`,
              sectionId: node.id,
              variant,
              params: framingFor(variant),
              postProcessing: false,
            }
          }),
      )
    }

    let previousKey = ''
    let stableFor = 0
    let tries = 0

    const scan = () => {
      if (cancelled) return
      const sections = liveSections()
      // Firma de la lista: ni el orden ni el contenido pueden cambiar de
      // incógnito. Los títulos distinguen dos secciones sin id en el mismo sitio.
      const key = sections
        .map((node, i) => `${i}:${node.id}|${node.querySelector('h1, h2, h3')?.textContent ?? ''}`)
        .join('§')
      const settled = sections.length > 0 && key === previousKey

      stableFor = settled ? stableFor + 1 : 0
      previousKey = key
      tries += 1

      if (stableFor < STABLE_FRAMES && tries < MAX_FRAMES) {
        frame = requestAnimationFrame(scan)
        return
      }
      if (!sections.length) return
      commit(sections)
    }

    frame = requestAnimationFrame(scan)
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
    }
  }, [rules, cycle, idPrefix, canRunNarrativeWebGL])

  if (!canRunNarrativeWebGL || !steps.length) return null
  return <SceneCycler steps={steps} portal />
}

/**
 * Encuadre. La única palanca que deja el motor es `params.cameraPosition`: el
 * cycler no envuelve la escena en un `<group>`.
 *
 * La distancia se despeja del tamaño real del objeto: el lienzo ve un semiancho
 * de `tan(fov/2) * z * aspect`, así que para que el objeto ocupe `FILL` del ancho
 * basta `z = rx / (FILL * tan(fov/2) * aspect)`. Las dos primeras versiones
 * alejaban la cámara en METROS sueltos y por eso fallaban: medido en /faq, la
 * barra asomaba por la esquina inferior izquierda y el resto era fondo negro.
 *
 * NO se echa el objeto a una columna. Se probó (`SIDE` 0,4 / 0,95 / −0,4, y como
 * control la cámara fijada a mano en x=3, que sí lo saca del plano): el centro del
 * objeto se movía ~30 px donde la proyección pedía 250. Mover la cámara en x
 * cambia la perspectiva, no la posición en pantalla de forma predecible. La
 * palanca limpia sería un offset sobre un `<group>` que envuelva la variante, y
 * eso es un cambio de motor, no de cycler. Mientras no exista, el objeto es
 * decorado centrado detrás del contenido.
 */
const FOV = 45
const TAN = Math.tan((FOV / 2) * (Math.PI / 180))
// El objeto encuadrado mide `2 * FILL * halfW` = `FILL` del ancho del lienzo.
// Con 0,42 los objetos ALTOS (tallímetro de 2 m, barra de dominadas a 2,15 m)
// obligaban a retroceder a 6-7 m y quedaban en un tercio del fotograma. 0,58 los
// acerca sin que ninguno toque el recorte: verificado tramo a tramo con
// `visibility-audit.cjs`, que es lo que detecta el encuadre roto.
const FILL = 0.58

/**
 * Semiextensión [x, y] en METROS de lo que entra en el plano, leída de las cotas
 * reales de cada escena (barra de 2,20 m; saco de 1,45 m; caja de 60×50×40 cm).
 *
 * Es la porción que se encuadra, no el tamaño de la composición: las hileras
 * (10 kettles, 12 mancuernas) miden 2,5 m y encuadrarlas enteras pedía una cámara
 * a 4,5 m donde cada unidad salía de icono. Se encuadran dos o tres unidades y el
 * resto se sale del plano, como en una foto real.
 *
 * El TERCER número es la altura del centro del objeto, y no es un capricho: la
 * cámara del engine no hace `lookAt`, mira en `-Z` a la altura en que esté puesta.
 * Con la cámara a 0,3 m un tallímetro de 2 m o un árbol de discos salían cortados
 * por arriba; a la altura de su centro quedan centrados.
 */
const SIZE = {
  // Calibrado el 2026-09-21 midiendo el lienzo con `scripts/medir-escena.mjs`
  // (SIN la variable `SOLTAR`, que falsea el recorte). `platetree` y
  // `weightstack` estaban al 3,2 % y 5,8 % de píxeles visibles porque su
  // `centerY` declaraba el centro de una versión anterior de la escena: el árbol
  // midió 0,62 m de alto tras el rediseño y seguía encuadrado a 0,88. Se baja el
  // centro a la cota real PERO se deja el `ry` por encima de la mitad exacta: la
  // holgura es lo que paga que la banda de la sección sea más corta que el
  // lienzo. Probado sin holgura (ry = cota exacta): el objeto se sale de arriba.
  // 0,55 y no 1,10: para que cupieran los 2,20 m había que retroceder a ~4 m, y
  // el acero de 29 mm de diámetro quedaba en un hilo de 3 px.
  barbell: [0.55, 0.25, 0.25],
  punchbag: [0.3, 0.78, 0.78],
  plyobox: [0.42, 0.42, 0.25],
  bench: [0.68, 0.36, 0.35],
  kettlebell: [0.55, 0.18, 0.09],
  dumbbells: [0.7, 0.45, 0.5],
  weightstack: [0.15, 0.6, 0.33],
  platetree: [0.564, 0.55, 0.309],
  // Segunda tanda del inventario: báscula con tallímetro (2,00 m de columna),
  // cronómetro de intervalos (Ø 240 mm), kit de recuperación (rodillo de 330 mm
  // + pelota + banda) y barra fija con colchoneta (barra a 2,15 m).
  scale: [0.3, 1.05, 1.0],
  // El cronómetro no es solo el dial de 240 mm: la escena le dibuja un pie de
  // mesa cuyas patas bajan hasta el suelo (base de 22 cm a y=0, dial a 0,46 m).
  // Encuadrar solo el dial dejaba la cámara a 36 cm y el pie ocupaba la pantalla
  // entera detrás del titular de /app.
  timer: [0.17, 0.24, 0.23],
  recovery: [0.5, 0.14, 0.08],
  pullupbar: [0.68, 1.2, 1.1],
  bridge: [1.2, 0.6, 0.3],
  method: [1.1, 0.7, 0.3],
  levels: [1.1, 0.7, 0.3],
  timeline: [1.2, 0.6, 0.3],
  vault: [0.9, 0.9, 0.3],
  habitat: [1.2, 0.8, 0.3],
  globe: [1.1, 1.1, 0.3],
  showroom: [1.2, 0.8, 0.3],
}

function framingFor(variant) {
  const [rx, ry, centerY] = SIZE[variant] ?? [1.1, 0.7, 0.3]
  // El lienzo es `fixed` a pantalla y solo se RECIERTA con clip-path, así que su
  // aspect es el de la ventana y no cambia al bajar. Usar el alto de la sección
  // aquí dio un encuadre válido en el primer fotograma y una lenteja en el
  // resto del tramo.
  const aspect = (window.innerWidth || 1280) / (window.innerHeight || 800)
  const z = Math.max(rx / (FILL * TAN * aspect), ry / (FILL * TAN))
  return { cameraPosition: [0, centerY, z] }
}

export default RouteSceneCycler
