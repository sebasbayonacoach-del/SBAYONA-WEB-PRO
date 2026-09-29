/**
 * BAYONA · CHECK-IN DEL PROTOCOLO 7 DÍAS
 * ---------------------------------------------------------------------------
 * El brief pide que la gamificación sea un sistema central y nombra los
 * check-ins como parte de él. Todo lo demás ya existía —dinero, sellos,
 * misiones, niveles— excepto este verbo: en /resources el Protocolo de 7 días
 * se explicaba, pero nadie podía empezar.
 *
 * Aquí no hay azar ni confeti. Tres cosas que se sostienen cualquier semana y
 * una cuadrícula de siete. La única animación es la casilla cambiando de
 * estado, porque lo que se celebra es la marca, no el diseño.
 *
 * Los cálculos son puros: se pueden probar sin DOM y los usa el propio
 * componente tal cual.
 */

export const HABITOS = Object.freeze([
  Object.freeze({ id: 'mover', label: 'MOVERME', hint: 'Veinte minutos, como puedas.' }),
  Object.freeze({ id: 'dormir', label: 'DORMIR', hint: 'Siete horas, sin negociar.' }),
  Object.freeze({ id: 'comida', label: 'COMER BIEN', hint: 'Proteína decidida antes del hambre.' }),
])

export const DIAS = Object.freeze(['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'])
export const DIAS_CORTOS = Object.freeze(['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'])

export const CLAVE_ALMACEN = 'bayona_protocolo_7'
export const META_RACHA = 3
export const META_SEMANA = 7

/** Registro vacío: tres hábitos × siete días sin marcar. */
export function registroVacio() {
  return Object.fromEntries(HABITOS.map((habito) => [habito.id, DIAS.map(() => false)]))
}

/** Devuelve un registro nuevo; nunca muta el que recibe. */
export function alternar(registro, habitoId, dia) {
  const actual = registro?.[habitoId]
  if (!Array.isArray(actual) || dia < 0 || dia >= DIAS.length) return registro
  const siguiente = actual.slice()
  siguiente[dia] = !siguiente[dia]
  return { ...registro, [habitoId]: siguiente }
}

export function totalMarcas(registro) {
  return HABITOS.reduce((suma, habito) => suma + (registro?.[habito.id] ?? []).filter(Boolean).length, 0)
}

/** Días con al menos una marca, en orden de semana. */
export function diasConMarca(registro) {
  return DIAS.map((_, dia) => HABITOS.some((habito) => Boolean(registro?.[habito.id]?.[dia])))
}

/**
 * Racha: días seguidos con algo marcado, contados hacia atrás desde el último
 * día con marca. Empezar por el miércoles y saltarse el lunes no rompe nada,
 * porque la racha mide el impulso actual, no la asistencia perfecta.
 */
export function racha(registro) {
  const marcas = diasConMarca(registro)
  const ultimo = marcas.lastIndexOf(true)
  if (ultimo === -1) return 0
  let seguidos = 0
  while (ultimo - seguidos >= 0 && marcas[ultimo - seguidos]) seguidos += 1
  return seguidos
}

export function diasCompletos(registro) {
  return DIAS.filter((_, dia) => HABITOS.every((habito) => Boolean(registro?.[habito.id]?.[dia]))).length
}

export function semanaCompleta(registro) {
  return diasCompletos(registro) === DIAS.length
}

/**
 * Lee el almacenamiento. Cualquier valor raro —un JSON partido, un objeto con
 * un hábito de menos, una cadena donde va un booleano— devuelve un registro
 * limpio en vez de reventar la página: el check-in es un detalle, no una
 * dependencia del recorrido.
 */
export function leerRegistro(bruto) {
  if (!bruto) return registroVacio()
  try {
    const datos = JSON.parse(bruto)
    const base = registroVacio()
    HABITOS.forEach((habito) => {
      const fila = datos?.registro?.[habito.id]
      if (!Array.isArray(fila)) return
      base[habito.id] = DIAS.map((_, dia) => Boolean(fila[dia]))
    })
    return base
  } catch {
    return registroVacio()
  }
}

export function escribirRegistro(registro) {
  return JSON.stringify({ version: 1, registro })
}
