import {ArrowUpRight, MonitorSmartphone} from 'lucide-react'
import {useLocation} from 'react-router-dom'
import {BAYONA_APP_ENTRY_URL,BAYONA_APP_MOBILE_IMAGE} from '../../config/bayonaAppIntegration.js'
import {trackEvent} from '../../lib/analytics/analytics.js'
import '../../styles/app-bridge-cinematic.css'

const STORIES=Object.freeze({
 '/about':{stage:'TU ENTRENADOR',title:'EL ACOMPAÑAMIENTO NO TERMINA AQUÍ.'},
 '/programs':{stage:'TUS PLANES',title:'TU ENTRENAMIENTO SIGUE CONTIGO.'},
 '/movimiento-adaptado':{stage:'TU MOVIMIENTO',title:'CADA PASO FORMA PARTE DEL PROCESO.'},
 '/parkour-academy':{stage:'TU PROGRESIÓN',title:'UN SALTO. UNA SESIÓN. TU HISTORIA.'},
 '/community':{stage:'TU COMUNIDAD',title:'EL CAMINO SIGUE FUERA DE AQUÍ.'},
 '/resources':{stage:'TUS RECURSOS',title:'APRENDE AQUÍ. CONTINÚA ALLÍ.'},
 '/faq':{stage:'TU SIGUIENTE PASO',title:'YA SABES MÁS. AHORA EMPIEZA.'},
 '/shop':{stage:'TU EQUIPO',title:'LA EXPERIENCIA VA MÁS ALLÁ.'},
})

export default function AppBridgeCinematic(){
 const {pathname}=useLocation()
 const story=STORIES[pathname]
 if(!story)return null
 return <section className="bayona-app-bridge" aria-labelledby="bayona-bridge-title" data-testid="app-bridge-cinematic">
  <div className="bayona-app-bridge__glow" aria-hidden="true"/>
  <div className="bayona-app-bridge__shell">
   <div className="bayona-app-bridge__copy">
    <span className="bayona-app-bridge__overline">BAYONA / {story.stage} / APP</span>
    <h2 id="bayona-bridge-title">{story.title}</h2>
    <p>Abre BAYONA App. Tu espacio digital de entrenamiento y seguimiento está a un paso.</p>
    <a href={BAYONA_APP_ENTRY_URL} className="bayona-app-bridge__action"
      onClick={()=>trackEvent('sitewide_app_open_intent',{source:pathname})}>
      ABRIR BAYONA APP <ArrowUpRight size={20} aria-hidden="true"/>
    </a>
    <small>Aplicación web · Compatible con instalación desde navegadores que lo permitan.</small>
   </div>
   <div className="bayona-app-bridge__visual" aria-hidden="true">
    <div className="bayona-app-bridge__ring"/>
    <div className="bayona-app-bridge__phone"><div className="bayona-app-bridge__phone-top"><MonitorSmartphone size={15}/> BAYONA / TU ESPACIO</div>
     <img src={BAYONA_APP_MOBILE_IMAGE} width="390" height="480" loading="lazy" decoding="async" alt=""/>
    </div>
    <span className="bayona-app-bridge__serial">B/ PRIME · CONTINÚA</span>
   </div>
  </div>
 </section>
}
