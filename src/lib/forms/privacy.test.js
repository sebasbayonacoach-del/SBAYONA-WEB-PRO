import { describe, expect, it } from 'vitest'
import {
  createOnboardingMessage,
  createResourceQuestionMessage,
  detectSensitiveData,
  normalizeFormText,
  validateOnboarding,
  validateResourceQuestion,
} from './privacy.js'

describe('privacidad y validación de formularios — Requirement 16', () => {
  it('normaliza espacios sin ampliar los datos recopilados', () => {
    expect(normalizeFormText('  una   pregunta\n general  ')).toBe('una pregunta general')
  })

  it.each([
    ['Mi radiografía muestra algo', 'datos de salud'],
    ['Quiero enviar radiografías y analíticas', 'datos de salud'],
    ['Estas imágenes corporales son recientes', 'datos de salud'],
    ['Tengo un diagnóstico reciente', 'datos de salud'],
    ['Mi DNI es 12345678Z', 'datos de identificación'],
    ['Escríbeme a persona@example.com', 'datos de contacto'],
    ['Mi número es +34 600 123 456', 'datos de contacto'],
  ])('detecta señales sensibles antes de preparar el canal: %s', (value, category) => {
    expect(detectSensitiveData(value)).toBe(category)
  })

  it('valida únicamente opciones categóricas permitidas y consentimiento en onboarding', () => {
    expect(validateOnboarding({
      goal: 'constancia',
      experience: 'inicio',
      availability: 'tres',
      consent: true,
    })).toEqual({ valid: true, errors: {} })

    const invalid = validateOnboarding({
      goal: 'dato-inventado',
      experience: '',
      availability: '',
      consent: false,
    })

    expect(invalid.valid).toBe(false)
    expect(invalid.errors).toEqual(expect.objectContaining({
      goal: expect.any(String),
      experience: expect.any(String),
      availability: expect.any(String),
      consent: expect.any(String),
    }))
  })

  it('crea un resumen de onboarding mínimo, informativo y no médico', () => {
    const message = createOnboardingMessage({
      goal: 'comparar-planes',
      experience: 'retomo',
      availability: 'uno-dos',
      consent: true,
    })

    expect(message).toContain('Comparar acompañamientos')
    expect(message).toContain('Estoy retomando')
    expect(message).toContain('1 o 2 momentos por semana')
    expect(message).toMatch(/no incluye nombre, email, teléfono, archivos ni datos de salud/i)
    expect(message).toMatch(/no un diagnóstico, tratamiento ni respuesta médica/i)
  })

  it('rechaza preguntas fuera de límites, sin tema, sensibles o sin consentimiento', () => {
    expect(validateResourceQuestion({ topic: '', question: 'corta', consent: false }).valid).toBe(false)
    expect(validateResourceQuestion({
      topic: 'recursos',
      question: '¿Podéis revisar mi analítica y darme un diagnóstico?',
      consent: true,
    }).errors.question).toMatch(/datos de salud/i)
    expect(validateResourceQuestion({
      topic: 'recursos',
      question: 'a'.repeat(281),
      consent: true,
    }).errors.question).toMatch(/máximo de 280/i)
  })

  it('prepara una pregunta general válida sin adjuntos ni promesas médicas', () => {
    const message = createResourceQuestionMessage({
      topic: 'protocolo',
      question: '  ¿Cómo adapto la guía a una semana con poco tiempo?  ',
      consent: true,
    })

    expect(message).toContain('Tema: Protocolo 7 días.')
    expect(message).toContain('¿Cómo adapto la guía a una semana con poco tiempo?')
    expect(message).toMatch(/no adjunto archivos/i)
    expect(message).toMatch(/no solicito diagnóstico, tratamiento o respuesta médica/i)
  })
})
