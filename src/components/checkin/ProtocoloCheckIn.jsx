/**
 * BAYONA · PROTOCOLO 7 DÍAS — el check-in que se puede hacer aquí mismo.
 * ---------------------------------------------------------------------------
 * /resources explicaba el Protocolo de 7 días; nadie podía empezar. Este
 * componente convierte la promesa en un gesto: tres cosas, siete casillas.
 *
 * Dos decisiones a propósito:
 *  · La cuadrícula va ANTES que el titular. Es la regla de jerarquía del brief
 *    aplicada a una herramienta: lo primero es el objeto con el que se puede
 *    hacer algo, y debajo lo que significa.
 *  · Se guarda en este aparato y no en ningún servidor. No hay cuenta, no hay
 *    foto, no hay testigos. Lo dice en pantalla, porque si no lo dice, alguien
 *    lo supone.
 */

import { useEffect, useMemo, useState } from 'react'
import { useRewards } from '../../lib/rewards/RewardsProvider.jsx'
import {
  CLAVE_ALMACEN,
  DIAS,
  DIAS_CORTOS,
  HABITOS,
  META_RACHA,
  alternar,
  escribirRegistro,
  leerRegistro,
  racha,
  registroVacio,
  semanaCompleta,
  totalMarcas,
} from '../../lib/checkin/checkin.js'
import '../../styles/protocolo-checkin.css'

/** Lunes a domingo, en el orden de la cuadrícula. */
function indiceDeHoy() {
  return (new Date().getDay() + 6) % 7
}

function safeLocalStorage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export default function ProtocoloCheckIn() {
  const { award } = useRewards()
  const [registro, setRegistro] = useState(registroVacio)
  const [recuperado, setRecuperado] = useState(false)
  const hoy = useMemo(indiceDeHoy, [])

  useEffect(() => {
    try {
      setRegistro(leerRegistro(safeLocalStorage()?.getItem(CLAVE_ALMACEN)))
    } finally {
      setRecuperado(true)
    }
  }, [])

  useEffect(() => {
    if (!recuperado) return
    try {
      safeLocalStorage()?.setItem(CLAVE_ALMACEN, escribirRegistro(registro))
    } catch {
      // Sin almacenamiento disponible el seguimiento sigue sirviendo esta
      // visita; no se avisa de algo que no cambia nada para la persona.
    }
  }, [registro, recuperado])

  const marcas = totalMarcas(registro)
  const dias = racha(registro)
  const completa = semanaCompleta(registro)

  useEffect(() => {
    if (dias >= META_RACHA) award({ id: 'protocolo-racha', label: 'Racha de tres días', eur: 3 })
    if (completa) award({ id: 'protocolo-semana', label: 'Protocolo de 7 días completo', eur: 7 })
  }, [dias, completa, award])

  return (
    <section className="protocolo-checkin" aria-labelledby="protocolo-checkin-title">
      <div className="protocolo-cuadricula">
        <div className="protocolo-dias" aria-hidden="true">
          {DIAS_CORTOS.map((dia, index) => (
            <span key={dia} className={index === hoy ? 'is-hoy' : undefined}>{dia}</span>
          ))}
        </div>
        <ul className="protocolo-habitos">
          {HABITOS.map((habito) => (
            <li className="protocolo-fila" key={habito.id}>
              <p className="protocolo-fila-cabecera">
                <strong>{habito.label}</strong>
                <span>{habito.hint}</span>
              </p>
              <div className="protocolo-celdas">
                {DIAS.map((dia, index) => {
                  const activo = Boolean(registro[habito.id][index])
                  return (
                    <button
                      key={dia}
                      type="button"
                      className="protocolo-celda"
                      data-marca={activo ? '' : undefined}
                      data-hoy={index === hoy ? '' : undefined}
                      aria-pressed={activo}
                      aria-label={`${habito.label} · ${dia}`}
                      onClick={() => setRegistro((actual) => alternar(actual, habito.id, index))}
                    />
                  )
                })}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <header className="protocolo-texto">
        <p className="protocolo-eyebrow">PROTOCOLO 7 DÍAS · SE PUEDE EMPEZAR AQUÍ</p>
        <h2 id="protocolo-checkin-title">
          SIETE DÍAS.
          <br />
          <span>TRES COSAS.</span>
        </h2>
        <p className="protocolo-lead">
          Marca lo que hayas hecho. Sin fotos, sin testigos y sin que nadie te lo pregunte.
        </p>
        <p className="protocolo-resumen" aria-live="polite" data-vacio={marcas === 0 ? '' : undefined}>
          {marcas === 0
            ? 'Aún no hay nada marcado. El primer día empieza por una casilla.'
            : `${marcas} ${marcas === 1 ? 'marca' : 'marcas'} · ${dias} ${
                dias === 1 ? 'día seguido' : 'días seguidos'
              }${dias >= META_RACHA ? ' · eso ya es un hábito, no una intención' : ''}${
                completa ? ' · semana completa' : ''
              }.`}
        </p>
        <p className="protocolo-nota">
          Se guarda en este aparato y no en ningún servidor. Es el mismo seguimiento que luego
          llevamos juntos en la aplicación; aquí puedes probarlo antes.
        </p>
      </header>
    </section>
  )
}
