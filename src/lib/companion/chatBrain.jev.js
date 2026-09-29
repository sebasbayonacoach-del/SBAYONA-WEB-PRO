/**
 * Puerta Jev para la asesora BAYONA. El código manda; Jev solo decide lo pequeño:
 * seguridad (jailbreak/inyección) e intención/urgencia. Sin clave o si Jev
 * falla, se responde con el cerebro local sin romperse.
 */
import { buildContactQuestions, systemOne } from '../jev/jevDecide.js'
import { responder } from './chatBrain.js'

const HUMAN = {
  texto: 'Eso te lo confirma mejor una persona del equipo por WhatsApp. Te paso con ellos.',
  chips: ['HABLAR CON SEBASTIÁN'],
}

export async function responderConJev(mensaje, { apiKey = null, fetchImpl = fetch } = {}) {
  const limpio = (mensaje || '').trim()
  if (!limpio) return responder(limpio)

  if (!apiKey) return responder(limpio)

  let puerta = null
  try {
    const res = await systemOne({ state: limpio.slice(0, 500), questions: buildContactQuestions(), apiKey, fetchImpl })
    puerta = res.answers ?? {}
  } catch {
    return responder(limpio)
  }

  if ((puerta.is_unsafe?.noul ?? 0) >= 0.7) return { ...HUMAN }

  const local = responder(limpio)
  const intent = puerta.department?.choice
  const urgent = puerta.is_urgent?.noul ?? 0
  if (urgent >= 0.7 && local.texto && !/WhatsApp/.test(local.texto)) {
    return { texto: `${local.texto}\n\nVeo que te corre prisa: si necesitas respuesta hoy, escríbenos por WhatsApp.`, chips: local.chips }
  }
  return { ...local, intent: intent ?? undefined }
}
