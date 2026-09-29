/**
 * BAYONA · COMPROMISOS PÚBLICOS
 * ---------------------------------------------------------------------------
 * Fuente única de verdad de lo que BAYONA promete. Ninguna página debe
 * redactar una garantía por su cuenta.
 *
 * POR QUÉ EXISTE
 *
 * La garantía se contaba de tres formas distintas a la vez:
 * · PlanPresentation: "te devolvemos cada peso. Sin preguntas. Sin trabas."
 * · Programs: "Consulta requisitos, procedimiento y exclusiones."
 * · FAQ: "Confirma las condiciones de la garantía antes de pagar."
 *
 * Una promesa incondicional y, dos clics más allá, una que remite a exclusiones
 * sin publicar. Eso no protege al negocio y destruye la confianza que la
 * garantía debería construir: quien lee las tres cosas concluye que hay letra
 * pequeña escondida.
 *
 * CRITERIO ADOPTADO
 *
 * Se conserva la versión que ya estaba publicada y es la más fuerte —30 días,
 * importe íntegro, sin condiciones— y se propaga sin matizarla en ningún sitio.
 * No se inventan requisitos ni exclusiones: si algún día existen, se escriben
 * aquí una vez y aparecen en todo el recorrido a la vez.
 */

export const GUARANTEE = Object.freeze({
  /** Ventana en días. Se usa también para construir las etiquetas. */
  days: 30,

  /** Etiqueta corta para sellos y microbandas. */
  badge: 'GARANTÍA PUBLICADA · 30 DÍAS',

  /** Titular de la sección de garantía. */
  title: '30 DÍAS.',
  titleAccent: 'CERO RIESGO.',

  /** Antetítulo editorial. */
  eyebrow: 'TODO EL RIESGO ES NUESTRO',

  /** La promesa, tal como se publica. Sin matices añadidos. */
  promise:
    'Si en 30 días sientes que BAYONA no es para ti, te devolvemos el importe íntegro. Sin preguntas y sin trabas.',

  /** Cómo se solicita. Es procedimiento, no una condición para cobrarla. */
  howTo:
    'La solicitas por WhatsApp dentro de los primeros 30 días y te confirmamos la devolución por escrito.',

  /** Línea de una sola frase para resúmenes y letra pequeña. */
  short: '30 días. Si no es para ti, te devolvemos el importe íntegro.',

  /** Valor para las filas de resumen tipo dt/dd. */
  summaryValue: '30 días, importe íntegro',
})

/**
 * Respuesta de la FAQ, derivada de la promesa para que no puedan divergir.
 * Antes decía "confirma las condiciones", que contradecía la promesa publicada.
 */
export const GUARANTEE_FAQ_ANSWER = [
  GUARANTEE.promise,
  GUARANTEE.howTo,
  'Cubre la membresía mensual. Los servicios sueltos y las sesiones ya realizadas se confirman por escrito antes de contratarlos.',
].join(' ')
