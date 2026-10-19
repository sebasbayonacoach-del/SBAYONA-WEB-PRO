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
  // SPA home renders after native browser hash handling.
  // Honor direct preview links without activating movement elsewhere.
  if(window.location.hash==='#archivo-real'){
   window.requestAnimationFrame(()=>window.scrollTo({
    top:root.getBoundingClientRect().top+window.scrollY-105,
    behavior:'instant',
   }))
  }
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
    <div className="bayona-real-archive__eyebrow"><span>ARCHIVO BAYONA</span><span>VÍDEOS ORIGINALES · SIN ROSTROS ATRIBUIDOS</span></div>
    <h2 id="archivo-real-title">IMÁGENES DEL<br/><em>ARCHIVO REAL.</em></h2>
    <p>Grabaciones de movimiento y lugares del archivo BAYONA. La identidad de los retratos sigue pendiente de confirmación.</p>
   </div>
   <div className="bayona-real-archive__reel-heading"><span>VÍDEOS / DEL ARCHIVO</span><span>GRABACIÓN REAL · SIN AUDIO</span></div>
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
   <p className="bayona-real-archive__source">Secuencias documentales revisadas por fotograma. No se atribuyen rostros sin confirmación.</p>
  </div>
 </section>
}