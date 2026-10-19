import { useEffect, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Check, ExternalLink, MonitorSmartphone, ShieldCheck, Smartphone, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BAYONA_APP_ENTRY_URL, BAYONA_APP_MOBILE_IMAGE, BAYONA_APP_ROLE_IMAGE } from '../config/bayonaAppIntegration.js'
import { trackEvent } from '../lib/analytics/analytics.js'
import '../styles/app-launch-premium.css'

const FEATURE_STEPS = Object.freeze([
  { number:'01', name:'ENTRA', headline:'TU ESPACIO.', note:'Accede a Mi App desde el navegador. Crea tu perfil si eres nuevo.' },
  { number:'02', name:'ORGANIZA', headline:'TU PROCESO.', note:'Explora el entrenamiento, el registro y las herramientas disponibles.' },
  { number:'03', name:'CONTINÚA', headline:'A TU RITMO.', note:'Vuelve desde el móvil o añade la web a tu pantalla de inicio.' },
])

function useDeviceInstructions() {
  const [device,setDevice]=useState('default')
  useEffect(()=>{
    const ua=navigator.userAgent||''
    setDevice(/iPad|iPhone|iPod/.test(ua)||navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1
      ?'ios': /Android/.test(ua)?'android':'desktop')
  },[])
  if(device==='ios')return {label:'IPHONE / IPAD',step:'Abre Mi App en Safari. Pulsa Compartir y elige «Añadir a pantalla de inicio».',detail:'En algunos navegadores necesitarás abrir primero la página en Safari.'}
  if(device==='android')return {label:'ANDROID',step:'Abre Mi App en Chrome y utiliza «Instalar aplicación» si el navegador lo ofrece.',detail:'Si no aparece, abre el menú ⋮ y busca «Añadir a pantalla de inicio».'}
  return {label:'ORDENADOR',step:'Abre Mi App en tu navegador. Si aparece la opción «Instalar», puedes añadirla como aplicación.',detail:'También puedes utilizarla directamente en una pestaña.'}
}
function TrackedAppLink({children,source,className, ...props}){
  return <a className={className} href={BAYONA_APP_ENTRY_URL}
    onClick={()=>trackEvent('bayona_app_open_intent',{source})} {...props}>{children}</a>
}

export default function AppLaunch(){
  const instructions=useDeviceInstructions()
  useEffect(()=>{
    // Lazy-loaded SPA routes appear after the browser's native hash jump.
    // Apply the installation deep link once the real section exists.
    if(window.location.hash!=='#instalar-app')return undefined
    const frame=window.requestAnimationFrame(()=>{
      const section=document.getElementById('instalar-app')
      if(section){
        window.scrollTo({top:section.getBoundingClientRect().top+window.scrollY-115,behavior:'instant'})
      }
    })
    return ()=>window.cancelAnimationFrame(frame)
  },[])
  return <div className="bayona-launch" data-testid="bayona-app-launch">
    <section className="bayona-launch__hero" aria-labelledby="bayona-launch-title">
      <div className="bayona-launch__hero-media" aria-hidden="true"/>
      <div className="bayona-launch__grid" aria-hidden="true"/>
      <div className="bayona-launch__shell bayona-launch__hero-grid">
        <div className="bayona-launch__hero-copy">
          <div className="bayona-launch__micro"><span className="bayona-launch__live-dot" aria-hidden="true"/> BAYONA / TU ESPACIO DIGITAL <span>001 — APP</span></div>
          <h1 id="bayona-launch-title">TU VIDA.<br/><em>TU RITMO.</em><br/>TU APP.</h1>
          <p>Tu entrenamiento continúa donde estés. Un espacio digital para volver a tu proceso, todos los días.</p>
          <TrackedAppLink source="app_launch_hero" className="bayona-launch__primary">
            ABRIR BAYONA APP <ArrowUpRight size={20} aria-hidden="true"/>
          </TrackedAppLink>
          <div className="bayona-launch__hero-proof"><ShieldCheck size={16} aria-hidden="true"/> Aplicación web disponible · Sin APK obligatoria</div>
        </div>
        <div className="bayona-launch__hero-device" aria-label="Vista real de BAYONA App">
          <div className="bayona-launch__device-glow" aria-hidden="true"/>
          <div className="bayona-launch__device">
            <div className="bayona-launch__device-top"><span><i/><i/><i/></span><span>BAYONA / APP</span><MonitorSmartphone size={16}/></div>
            <picture><source media="(max-width: 640px)" srcSet={BAYONA_APP_MOBILE_IMAGE}/><img src={BAYONA_APP_ROLE_IMAGE} alt="Captura real de BAYONA App con las entradas a Mi App y Coach Studio" width="1365" height="900" decoding="async" fetchPriority="high"/></picture>
          </div>
          <div className="bayona-launch__device-label"><span>01 / PRODUCTO REAL</span><span>MI APP · COACH STUDIO</span></div>
        </div>
        <a href="#bayona-launch-tour" className="bayona-launch__scroll" aria-label="Seguir descubriendo BAYONA App"><span>DESCUBRE LA EXPERIENCIA</span><ArrowDownRight size={19}/></a>
      </div>
    </section>

    <section id="bayona-launch-tour" className="bayona-launch__tour" aria-labelledby="bayona-launch-tour-title">
      <div className="bayona-launch__shell">
        <div className="bayona-launch__section-intro"><span>02 / EL RECORRIDO</span><h2 id="bayona-launch-tour-title">ENTRA. ENTRENA.<br/><em>CONTINÚA.</em></h2><p>Sin complicarte la vida.</p></div>
        <div className="bayona-launch__missions">
          {FEATURE_STEPS.map(item=><article className="bayona-launch__mission" key={item.number}>
            <span className="bayona-launch__mission-num">{item.number} / 03</span>
            <strong>{item.name}</strong>
            <h3>{item.headline}</h3>
            <p>{item.note}</p>
          </article>)}
        </div>
        <div className="bayona-launch__tour-line"><span>UNA CUENTA. UN PROCESO. TU PRÓXIMO MOVIMIENTO.</span><Check size={21}/></div>
      </div>
    </section>

    <section className="bayona-launch__roles" aria-labelledby="bayona-launch-roles-title">
      <div className="bayona-launch__shell">
        <div className="bayona-launch__section-intro"><span>03 / ACCESO</span><h2 id="bayona-launch-roles-title">DOS ESPACIOS.<br/><em>UN ECOSISTEMA.</em></h2></div>
        <div className="bayona-launch__role-grid">
          <article className="bayona-launch__role bayona-launch__role--personal">
            <span>01 / PARA TI</span><Smartphone size={30} aria-hidden="true"/><h3>MI APP.</h3>
            <p>Tu espacio de entrenamiento, hábitos y progreso.</p>
            <TrackedAppLink source="app_launch_personal" className="bayona-launch__role-link">ENTRAR COMO USUARIO <ArrowUpRight size={18}/></TrackedAppLink>
          </article>
          <article className="bayona-launch__role bayona-launch__role--coach">
            <span>02 / ENTRENADOR AUTORIZADO</span><Sparkles size={29} aria-hidden="true"/><h3>COACH STUDIO.</h3>
            <p>El espacio de gestión profesional de BAYONA. Acceso restringido a la cuenta autorizada.</p>
            <TrackedAppLink source="app_launch_coach" className="bayona-launch__role-link">VER PANTALLA DE ACCESO <ArrowUpRight size={18}/></TrackedAppLink>
          </article>
        </div>
      </div>
    </section>

    <section className="bayona-launch__install" id="instalar-app" aria-labelledby="bayona-launch-install-title">
      <div className="bayona-launch__shell bayona-launch__install-grid">
        <div className="bayona-launch__install-copy">
          <span className="bayona-launch__eyebrow">04 / LLEVA BAYONA CONTIGO</span>
          <h2 id="bayona-launch-install-title">TODA LA EXPERIENCIA.<br/><em>EN TU MÓVIL.</em></h2>
          <p>BAYONA funciona como aplicación web. Puedes abrirla en el navegador y, si tu dispositivo lo admite, instalarla en la pantalla de inicio.</p>
          <div className="bayona-launch__device-hint"><span><Smartphone size={20} aria-hidden="true"/>{instructions.label}</span><strong>{instructions.step}</strong><small>{instructions.detail}</small></div>
          <TrackedAppLink source="app_launch_install" className="bayona-launch__primary">ABRIR PARA INSTALAR <ExternalLink size={19}/></TrackedAppLink>
          <small className="bayona-launch__honesty">La instalación depende del navegador. No anunciamos una APK ni una publicación en Google Play o App Store que aún no se haya verificado.</small>
        </div>
        <div className="bayona-launch__install-art" aria-hidden="true">
          <div className="bayona-launch__install-halo"/>
          <div className="bayona-launch__install-number">B/</div>
          <div className="bayona-launch__install-device"><img src={BAYONA_APP_MOBILE_IMAGE} width="390" height="480" loading="lazy" decoding="async" alt=""/></div>
          <span className="bayona-launch__install-serial">BAYONA / WEB APP / 2026</span>
        </div>
      </div>
    </section>

    <section className="bayona-launch__final" aria-labelledby="bayona-launch-final-title">
      <div className="bayona-launch__shell bayona-launch__final-inner">
        <span>05 / EL SIGUIENTE PASO</span>
        <h2 id="bayona-launch-final-title">LO IMPORTANTE<br/><em>ES EMPEZAR.</em></h2>
        <div className="bayona-launch__final-actions">
          <TrackedAppLink source="app_launch_final" className="bayona-launch__primary">IR A MI APP <ArrowUpRight size={19}/></TrackedAppLink>
          <Link to="/programs" className="bayona-launch__final-secondary">DESCUBRIR ENTRENAMIENTOS <ArrowUpRight size={17}/></Link>
        </div>
        <p>La aplicación web ya se puede abrir. Algunas integraciones avanzadas, pagos y acceso a Coach Studio siguen sujetos a configuración y autorización.</p>
      </div>
    </section>
  </div>
}
