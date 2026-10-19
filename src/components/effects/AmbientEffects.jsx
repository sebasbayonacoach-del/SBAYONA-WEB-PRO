import {useEffect} from 'react'
import {useLocation} from 'react-router-dom'
import {drawProceduralEffect} from './drawProceduralEffect.js'
import {EFFECT_NAMES,EFFECT_PLACEMENTS} from './effectRegistry.js'
import '../../styles/bayona-effects-library.css'

const LIMIT_FPS=24
const BUFFER_SCALE=.64
const supported=()=>typeof window!=='undefined'&&
 typeof IntersectionObserver!=='undefined'&&typeof MutationObserver!=='undefined'

/**
 * Attaches a lightweight Canvas 2D interpretation to each mapped section.
 * Uses a single scheduler, IntersectionObserver, reduced-motion and
 * visibilitychange so never runs 21 animation loops concurrently.
 * Nothing is attached to the lead form, checkout or PWA authentication.
 */
export default function AmbientEffects(){
 const {pathname}=useLocation()
 useEffect(()=>{
  if(!supported()||!(pathname in EFFECT_PLACEMENTS))return undefined
  const placements=EFFECT_PLACEMENTS[pathname]
  const mounted=new Map()
  let frame=0,last=0,stopped=false,pending=false
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)')
  const observer=new IntersectionObserver(entries=>{
   for(const entry of entries){
    const obj=mounted.get(entry.target)
    if(!obj)continue
    obj.visible=entry.isIntersecting
    if(entry.isIntersecting)render(obj,0)
   }
  },{rootMargin:'120px 0px',threshold:0})
  function render(obj,t){
   if(!obj.canvas.isConnected)return
   // Size the raster to its bounded decorative accent, NOT to a 3,000px
   // section (which stretched stripes and dots across the cards).
   const bounds=obj.canvas.getBoundingClientRect()
   const width=Math.min(700,Math.max(1,Math.round(bounds.width*BUFFER_SCALE)))
   const height=Math.min(540,Math.max(1,Math.round(bounds.height*BUFFER_SCALE)))
   if(obj.canvas.width!==width)obj.canvas.width=width
   if(obj.canvas.height!==height)obj.canvas.height=height
   drawProceduralEffect(obj.canvas,obj.effect,t)
  }
  const tick=(ts)=>{
   if(stopped)return
   frame=window.requestAnimationFrame(tick)
   if(document.hidden||reduce.matches||ts-last<1000/LIMIT_FPS)return
   last=ts
   for(const obj of mounted.values()){
    if(obj.visible)render(obj,ts/1000)
   }
  }
  function scan(){
   if(stopped)return
   for(const {effect,selector} of placements){
    const host=document.querySelector('main #main-content '+selector)||
      document.querySelector('#main-content '+selector)
    if(!host||mounted.has(host))continue
    const canvas=document.createElement('canvas')
    canvas.className='bayona-fx-canvas'
    canvas.setAttribute('aria-hidden','true')
    canvas.setAttribute('data-bayona-effect',effect)
    canvas.dataset.effectName=EFFECT_NAMES[effect]
    canvas.setAttribute('role','presentation')
    const obj={canvas,host,effect,visible:false}
    mounted.set(host,obj)
    host.classList.add('bayona-fx-host')
    host.dataset.bayonaFx=effect
    host.appendChild(canvas)
    observer.observe(host)
    render(obj,0)
   }
  }
  function scheduleScan(){
   if(pending||stopped)return
   pending=true
   window.requestAnimationFrame(()=>{pending=false;scan()})
  }
  const tree=document.getElementById('main-content')||document.body
  const mutationObserver=new MutationObserver(scheduleScan)
  mutationObserver.observe(tree,{childList:true,subtree:true})
  const onVisibility=()=>{if(!document.hidden)for(const obj of mounted.values())if(obj.visible)render(obj,0)}
  const onReduced=()=>{for(const obj of mounted.values())if(obj.visible)render(obj,0)}
  document.addEventListener('visibilitychange',onVisibility)
  reduce.addEventListener?.('change',onReduced)
  scan()
  frame=window.requestAnimationFrame(tick)
  return ()=>{
   stopped=true;window.cancelAnimationFrame(frame)
   mutationObserver.disconnect();observer.disconnect()
   document.removeEventListener('visibilitychange',onVisibility)
   reduce.removeEventListener?.('change',onReduced)
   for(const obj of mounted.values()){
    obj.canvas.remove()
    obj.host.classList.remove('bayona-fx-host')
    delete obj.host.dataset.bayonaFx
   }
   mounted.clear()
  }
 },[pathname])
 return null
}
