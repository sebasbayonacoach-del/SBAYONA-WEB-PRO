/**
 * COSTURA DEL CÓDIGO QR
 * ---------------------------------------------------------------------------
 * Decisión documentada a propósito: aquí NO se dibuja un QR falso.
 *
 * Un rectángulo con cuadraditos que no escanea es peor que no poner nada —
 * la persona apunta la cámara, no pasa nada, y lo que se rompe es la confianza
 * justo en el paso del pago. Escribir un codificador QR correcto (Reed-Solomon,
 * enmascarado, versiones) sin dependencia nueva es posible, pero no se puede
 * AFIRMAR que funciona sin decodificar la salida, y decodificarla exigiría otro
 * codificador. Mientras no haya esa prueba, se enseña el código de verdad.
 *
 * Lo que sí queda listo es la costura: este componente recibe `payload` (la
 * cadena que habría que codificar) y un `size` en píxeles. El día que exista un
 * codificador verificado —propio con test de decodificación, o una librería que
 * el dueño apruebe— se sustituye el bloque marcado con SEAM por un <svg> y se
 * pone `QR_ENCODER_READY = true`. Nada más cambia: ni el panel, ni los tests,
 * ni el CSS.
 */

/** Falso hasta que exista un codificador verificado. Es la señal honesta. */
export const QR_ENCODER_READY = false

export default function QrCode({
  payload,
  size = 176,
  label = 'TU CÓDIGO',
  note = 'Escríbelo o cópialo. Es el mismo código que llega por WhatsApp.',
  className = '',
}) {
  const text = String(payload ?? '')
  const boxStyle = { width: `${size}px`, height: `${size}px` }

  return (
    <figure className={`cx-qr ${className}`.trim()} style={boxStyle}>
      <figcaption className="cx-qr__label">{label}</figcaption>

      {/*
        SEAM · sustituir este <div> por el <svg> de un codificador QR verificado
        que reciba `payload` y `size`. Mantener el aria-label para que siga
        siendo legible con lector de pantalla.
      */}
      <div className="cx-qr__box" aria-label={`${label}: ${text}`}>
        <code className="cx-qr__payload" data-testid="qr-payload">
          {text}
        </code>
      </div>

      {QR_ENCODER_READY ? null : <p className="cx-qr__note">{note}</p>}
    </figure>
  )
}
