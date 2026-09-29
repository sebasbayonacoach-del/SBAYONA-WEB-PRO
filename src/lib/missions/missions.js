/**
 * Misiones del recorrido BAYONA (brief §27 y §28).
 *
 * La gamificación del brief no es un adorno: pide que explorar tenga forma de
 * juego propio. Aquí las misiones son objetivos concretos que se cumplen con lo
 * que el visitante hace DE VERDAD en el sitio — responder a la recepción,
 * recorrer varias casas, llegar al método, mirar la comunidad, configurar su
 * experiencia. No hay puntos por esperar ni por hacer scroll infinito.
 *
 * Lógica PURA: recibe el estado de exploración y devuelve qué está cumplido.
 * Lo dispara UniverseScaleProvider, que ya mantiene ese estado, y cada misión
 * cerrada paga un sello al crédito de la visita (§12: «mientras exploro estoy
 * ganando algo»).
 */

/** @typedef {{ routes: string[], sections: string[], answers: Record<string, unknown> }} EstadoExploracion */

const ES = (ruta) => (seccion) => seccion.startsWith(`${ruta}::`)

const cuantasEn = (secciones, ruta) => secciones.filter(ES(ruta)).length

const RUTAS_PLAN = ['/plan/raiz', '/plan/fuerza', '/plan/rendimiento', '/plan/elite']

/**
 * Catálogo de misiones. `cumple` decide con el estado de exploración; `eur` es
 * lo que suma al crédito BAYONA al cerrarse, en la misma escala que los sellos
 * que ya paga la recepción.
 *
 * Los importes van bajos y parejos: el brief pide que se sienta valioso pero
 * advierte de no convertirlo en un casino (§12).
 */
export const MISIONES = Object.freeze([
  {
    id: 'bienvenida',
    label: 'Pasar por recepción',
    detalle: 'Decir tu nombre y responder al menos una pregunta.',
    eur: 4,
    /** @param {EstadoExploracion} e */
    cumple: (e) => Object.values(e.answers ?? {}).some((v) => v !== null && v !== undefined && v !== ''),
  },
  {
    id: 'cuatro-casas',
    label: 'Recorrer cuatro casas',
    detalle: 'Abrir cuatro partes distintas de BAYONA.',
    eur: 6,
    /** @param {EstadoExploracion} e */
    cumple: (e) => new Set(e.routes).size >= 4,
  },
  {
    id: 'metodo',
    label: 'Ver cómo se entrena aquí',
    detalle: 'Llegar a la sección del método, en la portada o en los programas.',
    eur: 5,
    /** @param {EstadoExploracion} e */
    cumple: (e) =>
      e.sections.some(
        (s) => (s.startsWith('/::') && s.includes('mechanism')) || (s.startsWith('/programs::') && s.includes('method')),
      ),
  },
  {
    id: 'ecosistema',
    label: 'Mirar el ecosistema',
    detalle: 'Recorrer al menos tres piezas de la comunidad.',
    eur: 6,
    /** @param {EstadoExploracion} e */
    cumple: (e) => cuantasEn(e.sections, '/community') >= 3,
  },
  {
    id: 'experiencia',
    label: 'Configurar tu experiencia',
    detalle: 'Entrar en un plan o en el cerrador de pago.',
    eur: 8,
    /** @param {EstadoExploracion} e */
    cumple: (e) => e.routes.includes('/checkout') || RUTAS_PLAN.some((r) => e.routes.includes(r)),
  },
])

/**
 * Estado de las misiones con el recorrido actual.
 * @param {EstadoExploracion} estado
 * @returns {{ id: string, label: string, detalle: string, eur: number, hecha: boolean }[]}
 */
export function evaluarMisiones(estado) {
  const base = { routes: [], sections: [], answers: {}, ...estado }
  return MISIONES.map(({ id, label, detalle, eur, cumple }) => ({
    id,
    label,
    detalle,
    eur,
    hecha: Boolean(cumple(base)),
  }))
}

/** @param {EstadoExploracion} estado */
export function misionesCerradas(estado) {
  return evaluarMisiones(estado).filter((m) => m.hecha)
}

/** Misiones cerradas sobre el total. Sirve para el progreso sin mentir. */
export function progresoMisiones(estado) {
  const lista = evaluarMisiones(estado)
  const hechas = lista.filter((m) => m.hecha).length
  return { hechas, total: lista.length, valorEur: lista.filter((m) => m.hecha).reduce((t, m) => t + m.eur, 0) }
}
