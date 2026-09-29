import VideoSection from '../VideoSection.jsx'
import { siteMedia } from '../../config/siteMedia.js'

const WELCOME_SCRIPT = 'Hola, soy Sebastián. Bienvenido a BAYONA. Hoy abrimos nuestras puertas de forma digital para acompañarte estés donde estés. En menos de un minuto conocemos tu punto de partida y te mostramos qué camino puedes explorar.'

export default function WelcomeVideo() {
  return (
    <div className="umbral-welcome-video">
      <VideoSection
        title="BIENVENIDO A BAYONA VIRTUAL"
        subtitle="Sebastián te recibe y explica cómo funciona este primer ingreso. Puedes continuar sin reproducirlo."
        poster={siteMedia.onboarding.threshold.src}
        duration="1 MIN"
        placement="media"
        muted
      />
      <details className="umbral-transcript">
        <summary>LEER TRANSCRIPCIÓN DEL VIDEO</summary>
        <p>{WELCOME_SCRIPT}</p>
        <small>
          El video real se incorporará con subtítulos antes de publicarse. Este espacio no reproduce sonido automáticamente.
        </small>
      </details>
    </div>
  )
}
