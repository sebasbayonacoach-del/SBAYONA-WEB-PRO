/**
 * BAYONA · LABORATORIO ESPACIAL — «TRAYECTORIA» · CONFIGURACIÓN DE ESTACIONES
 * -------------------------------------------------------------------------
 * Lote 1 (FASE A · laboratorio DOM aislado). Aquí NO hay 3D: solo hay DATOS.
 *
 * Regla de origen del contenido: las tres estaciones NO inventan una doctrina
 * nueva. Se derivan del bloque real del método ya publicado
 * (`conversionContent.js` → `home-mechanism`, los pasos TE LEEMOS /
 * CONSTRUIMOS / TE ACOMPAÑAMOS que hoy consume Home.jsx). Si mañana cambia el
 * catálogo, cambia el laboratorio: no hay copy duplicado que se oxide.
 *
 * Regla de honestidad: «Trayectoria» es el NOMBRE de la experiencia, no una
 * promesa comercial ni la descripción de una instalación real. El espacio es
 * conceptual mientras no exista evidencia y aprobación de otra cosa: hay una
 * maqueta greybox (Lote 2) y no un pabellón construido.
 *
 * Lote 2: los ENCUADRES y la geometría viven en `src/engine/scene/trajectoryStage.js`
 * (datos puros también, pero del lado del motor). Aquí no hay `Vector3` ni
 * import de Three a propósito: este fichero lo consume la versión sencilla en DOM.
 *
 * Los destinos (`to`) son rutas existentes del sitio. La relación estación →
 * ruta es editorial (dónde se amplía la idea), NO comercial: ninguna estación
 * promete un plan concreto ni construye CTA de pago dentro del laboratorio.
 */

import { homeContentModel } from '../../config/conversionContent.js'

/** Bloque del método: única fuente de los tres pasos. */
const methodBlock = homeContentModel.blocks.find(({ id }) => id === 'home-mechanism')

if (!methodBlock) {
  throw new Error(
    'trajectoryStations: no existe el bloque "home-mechanism" en homeContentModel. ' +
      'El laboratorio no debe inventarse su propio método: arregla la fuente.',
  )
}

/**
 * Cómo se lee cada paso en el espacio, y dónde se amplía en el sitio.
 * `spatial` describe INTENCIÓN de composición (para revisar antes de montar
 * ninguna escena); no es una cámara real ni un contrato de render: eso será el
 * Lote 2 y se definirá con el motor existente, no aquí.
 */
const STATION_DIRECTIONS = {
  understand: {
    to: '/#empieza',
    ctaLabel: 'Contar tu punto de partida',
    hotspot: { x: 16, y: 66 },
    spatial: {
      camera: 'plano general alto y frío',
      reading: 'el suelo se lee antes de moverse',
      light: 'luz cenital amplia, sin acentos',
    },
  },
  build: {
    to: '/programs',
    ctaLabel: 'Ver la estructura del acompañamiento',
    hotspot: { x: 50, y: 52 },
    spatial: {
      camera: 'dolly lateral corto, apoyo en la barra',
      reading: 'proporción y medida: hay un sistema',
      light: 'luz rasante que marca los cantos',
    },
  },
  support: {
    to: '/community',
    ctaLabel: 'Conocer a la gente que sostiene el hábito',
    hotspot: { x: 82, y: 38 },
    spatial: {
      camera: 'encuadre estable, salida visible',
      reading: 'la trayectoria continúa con alguien al lado',
      light: 'abertura de luz al fondo: la salida',
    },
  },
}

/** Nombre y marco de la experiencia (no es una oferta). */
export const TRAJECTORY = Object.freeze({
  id: 'trayectoria',
  name: 'TRAYECTORIA',
  subtitle: 'el movimiento tiene estructura',
  heading: methodBlock.heading,
  intro: methodBlock.body,
  /** Descargo médico heredado de la fuente: no se diagnostica ni se trata. */
  boundary: methodBlock.boundary,
  /** El espacio es conceptual: se declara, no se disimula. */
  disclaimer:
    'Espacio conceptual, no una instalación real. Sin activar nada se ve la composición de referencia en 2D; al activarla, una maqueta greybox en 3D (escala, volumen y encuadre, sin materiales definitivos) que se descarga solo dentro de este laboratorio.',
  status: 'Maqueta espacial disponible bajo demanda',
  /**
   * Nota de la figura. Es SU texto, no un eco del descargo de arriba: el
   * laboratorio no repite el mismo contenido accesible en dos sitios.
   */
  figureHint:
    'Figura decorativa. El contenido del recorrido está en el panel, en texto real y seleccionable.',
})

/** Las tres estaciones, en orden, con su contenido real. */
export const STATIONS = Object.freeze(
  methodBlock.items.map((item, index) => {
    const direction = STATION_DIRECTIONS[item.id]
    if (!direction) {
      throw new Error(`trajectoryStations: estación "${item.id}" sin dirección de recorrido definida.`)
    }
    return Object.freeze({
      id: `trayectoria-${item.id}`,
      key: item.id,
      index,
      marker: item.marker,
      title: item.title,
      body: item.body,
      to: direction.to,
      ctaLabel: direction.ctaLabel,
      hotspot: Object.freeze({ ...direction.hotspot }),
      spatial: Object.freeze({ ...direction.spatial }),
    })
  }),
)

export const STATION_COUNT = STATIONS.length

/** Acceso por id, usado por la navegación y por los enlaces de los hotspots. */
export const STATION_BY_ID = Object.freeze(
  STATIONS.reduce((acc, station) => ({ ...acc, [station.id]: station }), {}),
)
