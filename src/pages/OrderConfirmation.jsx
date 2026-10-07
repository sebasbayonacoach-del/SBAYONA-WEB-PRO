import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buildWhatsAppUrl } from '../config/offerings.js'

const whatsappUrl = buildWhatsAppUrl([
  'Hola BAYONA, envié una solicitud desde la web.',
  'Quiero revisar la información disponible sobre los siguientes pasos.',
  'Entiendo que el tiempo de respuesta puede variar y que este mensaje no completa ninguna compra ni cobro.',
].join('\n'))

export default function OrderConfirmation() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section className="confirmation" aria-labelledby="confirmation-title">
      <div className="confirmation-lines" aria-hidden="true" />

      <motion.div
        className="confirmation-shell"
        data-motion={prefersReducedMotion ? 'static' : 'enhanced'}
        initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.55, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <header className="confirmation-intro">
          <div className="confirmation-status">
            <span className="confirmation-check" aria-hidden="true">
              <Check size={20} strokeWidth={1.8} />
            </span>
            <p>BAYONA OS · SOLICITUD</p>
          </div>

          <h1 id="confirmation-title">
            TU SIGUIENTE <span>PASO ESTÁ CLARO.</span>
          </h1>
          <p className="confirmation-lead">
            Tu configuración quedó preparada para continuar por WhatsApp. Esta página no completa
            compras ni cobros: organiza la conversación para que el acompañamiento empiece con criterio.
          </p>
        </header>

        <section className="confirmation-next" aria-labelledby="confirmation-next-title">
          <div className="confirmation-next-heading">
            <p>PROTOCOLO DE CONTINUIDAD</p>
            <h2 id="confirmation-next-title">SIGUIENTES PASOS</h2>
          </div>

          <ol className="confirmation-steps" aria-label="Siguientes pasos después de enviar la solicitud">
            <li>
              <span aria-hidden="true">01</span>
              <div>
                <h3>ABRE LA CONVERSACIÓN</h3>
                <p>
                  La confirmación del plan, los detalles y cualquier ajuste continúan por WhatsApp.
                  El tiempo de respuesta puede variar; esta pantalla deja el contexto preparado.
                </p>
                <a
                  className="confirmation-step-link"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Revisar en WhatsApp <ArrowRight aria-hidden="true" size={17} />
                </a>
              </div>
            </li>

            <li>
              <span aria-hidden="true">02</span>
              <div>
                <h3>CONOCE LA COMUNIDAD</h3>
                <p>
                  Conoce el espacio comunitario y la información vigente mientras se revisa tu solicitud.
                </p>
                <Link className="confirmation-step-link" to="/community">
                  Conocer la comunidad <ArrowRight aria-hidden="true" size={17} />
                </Link>
              </div>
            </li>

            <li>
              <span aria-hidden="true">03</span>
              <div>
                <h3>ACTIVA MOVIMIENTO</h3>
                <p>
                  Explora el Reto 30 Días y los recursos gratuitos a tu ritmo, sin promesas irreales.
                </p>
                <Link className="confirmation-step-link" to="/resources#reto">
                  Ver Reto 30 Días y recursos <ArrowRight aria-hidden="true" size={17} />
                </Link>
              </div>
            </li>
          </ol>
        </section>
      </motion.div>
    </section>
  )
}
