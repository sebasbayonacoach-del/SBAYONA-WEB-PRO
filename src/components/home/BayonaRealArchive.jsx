import {useEffect,useRef} from 'react'
import '../../styles/bayona-real-archive.css'

const CLIPS=[
 {src:'/videos/bayona-authentic/broll-rio.mp4',title:'UN CAMINO',description:'España · Archivo original',poster:'/images/bayona-authentic/broll-rio.webp'},
 {src:'/videos/bayona-authentic/movimiento-entorno.mp4',title:'EL ENTORNO',description:'Deporte · Grabación original',poster:'/images/bayona-authentic/movimiento-entorno.webp'},
 {src:'/videos/bayona-authentic/movimiento-pov.mp4',title:'EN PRIMERA PERSONA',description:'Movimiento · Archivo original',poster:'/images/bayona-authentic/movimiento-pov.webp'},
]
export default function BayonaRealArchive(){
 const ref=useRef(null)
 useEffect(()=>{
  const root=ref.current
  if(!root || !('IntersectionObserver' in window))return
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)')
  const videos=[...root.querySelectorAll('video')]
  const observer=new IntersectionObserver(entries=>{
   for(const item of entries){
    const video=item.target
    if(item.isIntersecting && !reduce.matches && !document.hidden){
     video.play().catch(()=>{})
    }else video.pause()
   }
  },{rootMargin:'80px 0px',threshold:.5})
  videos.forEach(video=>observer.observe(video))
  const hidden=()=>{if(document.hidden)videos.forEach(v=>v.pause())}
  document.addEventListener('visibilitychange',hidden)
  return ()=>{observer.disconnect();document.removeEventListener('visibilitychange',hidden);videos.forEach(v=>v.pause())}
 },[])
 return <section className="bayona-real-archive" id="archivo-real" aria-labelledby="archivo-real-title" ref={ref}>
  <div className="bayona-real-archive__shell">
   <div className="bayona-real-archive__intro">
    <div className="bayona-real-archive__eyebrow"><span>ARCHIVO BAYONA</span><span>IMÁGENES Y VÍDEOS ORIGINALES</span></div>
    <h2 id="archivo-real-title">VIDA REAL.<br/><em>MOVIMIENTO REAL.</em></h2>
    <p>No es un avatar. Son fotografías y grabaciones del archivo personal de BAYONA.</p>
   </div>
   <div className="bayona-real-archive__photos">
    <figure className="bayona-real-archive__photo bayona-real-archive__photo--portrait">
      <img src="/images/bayona-authentic/selfie-exterior-2026-04-11.jpg" alt="Fotografía original del archivo personal de BAYONA en una calle de España" width="1152" height="2048" loading="lazy" decoding="async"/>
      <figcaption><span>01 — SEBASTIÁN</span><span>11.04.2026</span></figcaption>
    </figure>
    <figure className="bayona-real-archive__photo bayona-real-archive__photo--rooftop">
      <img src="/images/bayona-authentic/selfie-azotea-2026-01-07.webp" alt="Selfie original en una azotea, del archivo de BAYONA" width="900" height="1600" loading="lazy" decoding="async"/>
      <figcaption><span>02 — ORIGEN</span><span>07.01.2026</span></figcaption>
    </figure>
    <figure className="bayona-real-archive__photo bayona-real-archive__photo--mountain">
      <img src="/images/bayona-authentic/recorrido-montana-2026-02-23.jpg" alt="Fotografía original de un recorrido por un paisaje de montaña" width="900" height="1600" loading="lazy" decoding="async"/>
      <figcaption><span>03 — CAMINO</span><span>23.02.2026</span></figcaption>
    </figure>
   </div>
   <div className="bayona-real-archive__reel-heading"><span>REELS / DEL ARCHIVO</span><span>GRABACIÓN REAL · SIN AUDIO</span></div>
   <div className="bayona-real-archive__reels">
    {CLIPS.map((clip,i)=><article key={clip.src} className="bayona-real-archive__reel">
      <video src={clip.src} poster={clip.poster} muted loop playsInline preload="none"
        controls aria-label={clip.title+' — vídeo original del archivo BAYONA'}/>
      <div className="bayona-real-archive__reel-caption">
       <span>{String(i+1).padStart(2,'0')} / 03</span>
       <strong>{clip.title}</strong>
       <small>{clip.description}</small>
      </div>
    </article>)}
   </div>
   <p className="bayona-real-archive__source">Archivo personal seleccionado · No se incluyen vídeos con consentimiento de terceros pendiente.</p>
  </div>
 </section>
}