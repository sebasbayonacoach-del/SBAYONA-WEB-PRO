import { describe, expect, it } from 'vitest'
import { faqEntries } from '../../config/faqContent.js'
import { membershipPlans } from '../../config/offerings.js'
import { responder, sugerenciasIniciales } from './chatBrain.js'

/**
 * El contrato del chat es la honestidad, no la elegancia: cada respuesta tiene
 * que salir de lo publicado (planes y preguntas frecuentes) o declararse sin
 * respuesta. Estos tests vigilan justo eso, porque el día que alguien añada una
 * frase bonita inventada aquí es el día que la web promete algo que no existe.
 */
describe('cerebro del chat de Sebastián (asistente de la casa)', () => {
  it('da los cuatro precios tal y como están publicados', () => {
    const { texto } = responder('cuánto cuesta')
    for (const plan of membershipPlans) {
      expect(texto).toContain(plan.name)
      expect(texto).toContain(plan.priceCop.toLocaleString('es-CO'))
    }
  })

  it('responde con la respuesta publicada del FAQ, no con una paráfrasis', () => {
    const entrada = faqEntries[0]
    const { texto } = responder(entrada.question)
    expect(texto).toContain(entrada.answer)
  })

  it('describe un plan por su audience real y su precio', () => {
    const plan = membershipPlans[1]
    const { texto } = responder(`háblame de ${plan.name}`)
    expect(texto).toContain(plan.audience)
    expect(texto).toContain(plan.priceCop.toLocaleString('es-CO'))
  })

  it('no se inventa lo que no está publicado', () => {
    const { texto } = responder('mi gato es azul y vive en la luna')
    expect(texto).toMatch(/no lo tengo publicado|no voy a inventar/i)
    for (const entrada of faqEntries) {
      expect(texto).not.toContain(entrada.answer)
    }
  })

  it('ofrece salidas que existen: sugerencias al abrir y WhatsApp al cerrar', () => {
    expect(sugerenciasIniciales.length).toBeGreaterThan(2)
    const { chips } = responder('una cosa rarísima sin relación')
    expect(chips).toContain('HABLAR CON SEBASTIÁN')
    expect(chips).toContain('VER PRECIOS')
  })

  it('saluda sin prometer nada', () => {
    const { texto } = responder('hola')
    /*
      Comentario 15 del 22-09: quien habla es Sebastián en primera persona, no
      «una asesora» genérica. Se actualiza el PIN DE LA VOZ, no la guarda: sigue
      prohibido prometer garantías o resultados en un saludo.
    */
    expect(texto).toMatch(/soy Sebastián, el asistente de BAYONA/i)
    expect(texto).not.toMatch(/garantiz|resultados seguros|sin riesgo/i)
    /*
      Y no puede vender lo que no hay. Sin backend de lenguaje conectado,
      anunciarse como IA sería la promesa falsa que el brief veta; lo honesto es
      responder con lo publicado y derivar a una persona.
    */
    expect(texto).not.toMatch(/inteligencia artificial|una ia que|bot con ia/i)
  })

  it('nunca suelta un "usted" suelto, que es la norma de voz del sitio', () => {
    const muestras = ['cuánto cuesta', '¿necesito experiencia previa?', 'hola', 'gato azul lunático']
    for (const m of muestras) {
      expect(responder(m).texto).not.toMatch(/\busted\b/i)
    }
  })
})
