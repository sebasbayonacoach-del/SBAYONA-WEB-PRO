import { describe, expect, it } from 'vitest'
import {
  DIAS,
  HABITOS,
  alternar,
  diasCompletos,
  escribirRegistro,
  leerRegistro,
  racha,
  registroVacio,
  semanaCompleta,
  totalMarcas,
} from './checkin.js'

/** Marca el hábito indicado en los días que se listan. */
function marcar(pares) {
  return pares.reduce((registro, [habito, dia]) => alternar(registro, habito, dia), registroVacio())
}

describe('checkin del Protocolo 7 días', () => {
  it('arranca vacío y no muta el registro al alternar', () => {
    const inicial = registroVacio()
    const siguiente = alternar(inicial, 'mover', 0)

    expect(totalMarcas(inicial)).toBe(0)
    expect(siguiente).not.toBe(inicial)
    expect(siguiente.mover[0]).toBe(true)
    expect(totalMarcas(siguiente)).toBe(1)
  })

  it('alternar dos veces sobre la misma casilla la deja como estaba', () => {
    const unaVez = alternar(registroVacio(), 'dormir', 3)
    expect(alternar(unaVez, 'dormir', 3)).toEqual(registroVacio())
  })

  it('ignora hábitos o días que no existen en vez de romper el registro', () => {
    const intacto = registroVacio()
    expect(alternar(intacto, 'no-existe', 0)).toBe(intacto)
    expect(alternar(intacto, 'mover', DIAS.length)).toBe(intacto)
    expect(alternar(intacto, 'mover', -1)).toBe(intacto)
  })

  it('la racha cuenta días seguidos hacia atrás desde la última marca', () => {
    expect(racha(registroVacio())).toBe(0)
    expect(racha(marcar([['mover', 0], ['dormir', 1], ['comida', 2]]))).toBe(3)
    // Con un hueco en medio, la racha es solo la parte final.
    expect(racha(marcar([['mover', 0], ['mover', 2], ['mover', 3]]))).toBe(2)
    // Empezar tarde no castiga: tres días seguidos son tres, empiecen cuando empiecen.
    expect(racha(marcar([['mover', 4], ['mover', 5], ['mover', 6]]))).toBe(3)
  })

  it('un día con un solo hábito sostiene la racha, pero no cuenta como día completo', () => {
    const registro = marcar([['mover', 0], ['dormir', 0], ['mover', 1]])
    expect(totalMarcas(registro)).toBe(3)
    expect(racha(registro)).toBe(2)
    expect(diasCompletos(registro)).toBe(0)

    // Con el tercero del día 0, ese día ya está completo.
    expect(diasCompletos(alternar(registro, 'comida', 0))).toBe(1)
  })

  it('la semana solo está completa si los siete días tienen los tres hábitos', () => {
    const completa = marcar(
      HABITOS.flatMap((habito) => DIAS.map((_, dia) => [habito.id, dia])),
    )
    expect(diasCompletos(completa)).toBe(DIAS.length)
    expect(semanaCompleta(completa)).toBe(true)
    expect(semanaCompleta(alternar(completa, 'mover', 6))).toBe(false)
  })

  it('leer un almacenamiento roto devuelve un registro limpio', () => {
    expect(leerRegistro(null)).toEqual(registroVacio())
    expect(leerRegistro('no es json')).toEqual(registroVacio())
    expect(leerRegistro('{"registro":{"mover":"hola"}}')).toEqual(registroVacio())
    // Faltan filas: se rellenan, no se deja hueco.
    expect(leerRegistro('{"registro":{"mover":[true,true]}}').dormir).toHaveLength(DIAS.length)
    expect(leerRegistro('{"registro":{"mover":[true,true]}}').mover.slice(0, 2)).toEqual([true, true])
  })

  it('escribir y leer es idempotente', () => {
    const registro = marcar([['comida', 5], ['dormir', 6]])
    expect(leerRegistro(escribirRegistro(registro))).toEqual(registro)
  })
})
