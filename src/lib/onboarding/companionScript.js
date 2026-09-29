/**
 * GUION DEL ACOMPAÑANTE
 * ---------------------------------------------------------------------------
 * Lo que pidió el dueño: "un bot que te acompañe en el recorrido y que te vaya
 * guiando… que las letras se escriban, que la web esté viva".
 *
 * El guion vive aquí, separado del componente, por dos razones:
 *
 *  1. Es COPY. Se reescribe sin tocar React ni CSS, y la regla de voz del dueño
 *     ("todo en juntos, nunca usted solo") se revisa en un solo fichero.
 *  2. Es REUTILIZABLE. El acompañante también acompaña el resto del sitio; este
 *     módulo solo cubre la recepción, que es donde empieza todo.
 *
 * Cada entrada es corta a propósito: el acompañante habla en una línea, no da
 * un discurso. Si el texto crece, el globo tapa la pantalla y estorba.
 */

/**
 * Devuelve la línea del acompañante para una etapa de la recepción.
 * `name` puede venir vacío: entonces el saludo no intenta usarlo.
 */
export function companionLine(stage, { name = '', route = null, gift = null } = {}) {
  const quien = name ? `, ${name}` : ''

  switch (stage) {
    case 'umbral':
      return 'Se abren las puertas. Pasa, que te enseño la casa.'
    case 'nombre':
      return `Antes de nada${quien ? '' : ''}: dime cómo te llamas y te hablo por tu nombre.`
    case 'ritmo':
      return `Perfecto${quien}. ¿Vamos rápido o nos damos tiempo? Las dos opciones valen.`
    case 'preguntas':
      return 'Una detrás de otra. Toca la que más se te parezca.'
    case 'regalo':
      return gift
        ? `Esto es lo que te llevas${quien}: ${gift.items.length} piezas, valor ${gift.totalDisplay}. Se paga con cero.`
        : 'Esto es lo que te llevas hoy.'
    case 'ruta':
      return route
        ? `${quien ? name : 'Aquí está'}: tu ruta es ${route.plan}. Y al lado, lo que no cuesta nada.`
        : 'Tres puertas. Las tres son tuyas.'
    case 'cierre':
      return `Cuando quieras${quien}, empezamos. Yo me quedo aquí.`
    default:
      return 'Vamos juntos.'
  }
}

/** Línea del acompañante cuando la persona borra su recorrido. */
export const COMPANION_RESET_LINE = 'Listo. Empezamos de cero cuando tú digas.'
