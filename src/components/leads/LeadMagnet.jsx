/**
 * BAYONA · contacto y recursos sin captación ficticia.
 * Los materiales son públicos. Solo se pide contacto si existe backend real.
 * Sin backend: contacto voluntario por WhatsApp, sin guardar PII en localStorage.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, CheckCircle2, ShieldCheck } from 'lucide-react'
import { bookingLink, isBookingEnabled, whatsAppLink } from '../../config/site.config.js'
import { isCloudEnabled, supabase } from '../../lib/supabase.js'
import { trackEvent, trackLead, trackWhatsAppClick } from '../../lib/analytics/analytics.js'
import '../../styles/auth-members.css'
import '../../styles/bayona-revenue-ready.css'

export const LEAD_SOURCE = 'lead-magnet'
/* Deprecated legacy key; intentionally never written to. */
export const LEADS_KEY = 'bayona_leads'
export const FREE_RESOURCES = Object.freeze([
  {title:'TU PRIMERA SEMANA',label:'Guía gratuita · 7 días',url:'/downloads/bayona-editorial/primera-semana.pdf'},
  {title:'REGISTRO 30 DÍAS',label:'Workbook gratuito',url:'/downloads/bayona-editorial/registro-30-dias.pdf'},
  {title:'TU PUNTO DE PARTIDA',label:'Dossier gratuito',url:'/downloads/bayona-editorial/dossier-punto-de-partida.pdf'},
])
const EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]+$/
function validContact(value){
 const raw=String(value||'').trim()
 const digits=raw.replace(/\D/g,'')
 return EMAIL.test(raw)||(digits.length>=7&&digits.length<=15)
}
function whatsappIntro(name,contact){
 const who=String(name||'').trim().slice(0,70)
 const channel=String(contact||'').trim().slice(0,120)
 const lines=['Hola, Sebastián. Vi BAYONA y quiero consultar una valoración inicial.',
  who?'Mi nombre es '+who+'.':'',
  channel?'Mi contacto preferido es '+channel+'.':'',
  '¿Qué modalidades y horarios tienes disponibles?']
 return whatsAppLink(lines.filter(Boolean).join('\n'))
}

export default function LeadMagnet({
 heading='Tu siguiente paso.',
 copy='Recibe los materiales gratuitos y consulta si quieres entrenar conmigo.',
}){
 const cloud=isCloudEnabled()
 const [name,setName]=useState('')
 const [contact,setContact]=useState('')
 const [agreed,setAgreed]=useState(false)
 const [status,setStatus]=useState('idle')
 const [error,setError]=useState('')
 const fallbackUrl=cloud?whatsappIntro(name,contact)
   :bookingLink('Hola, Sebastián. He visto BAYONA y quiero consultar una valoración inicial. ¿Cómo puedo empezar?')

 async function submit(event){
  event.preventDefault()
  if(!cloud||!supabase)return
  if(name.trim().length<2||!validContact(contact)){
   setError('Indica tu nombre y un correo o WhatsApp válido.')
   return
  }
  if(!agreed){
   setError('Confirma que quieres que te contactemos para responder tu solicitud.')
   return
  }
  setError('')
  setStatus('sending')
  const lead={
   id:globalThis.crypto?.randomUUID?.() || undefined,
   name:name.trim().slice(0,70),
   contact:contact.trim().slice(0,120),
   source:LEAD_SOURCE,
   created_at:new Date().toISOString(),
  }
  try{
   const {error:dbError}=await supabase.from('leads').insert(lead)
   if(dbError)throw dbError
   setStatus('sent')
   trackLead({source:LEAD_SOURCE})
  }catch{
   // Never report success, and never retain visitors' contact data in localStorage.
   setStatus('failed')
   setError('No pudimos recibir tu solicitud. Puedes abrir WhatsApp y enviarla tú mismo.')
   trackEvent('lead_capture_failed',{source:LEAD_SOURCE})
  }
 }

 return <section className="lead-magnet bayona-direct-contact" aria-labelledby="lead-magnet-title">
  <div className="section-shell lead-magnet-inner">
   <div className="bayona-direct-contact__heading">
    <p className="eyebrow"><span/> SEBASTIÁN · BAYONA</p>
    <h2 id="lead-magnet-title">{heading}</h2>
    <p>{copy}</p>
   </div>
   <div className="bayona-direct-contact__layout">
    <div className="bayona-direct-contact__resources" role="group" aria-label="Tres recursos gratuitos sin registro">
     {FREE_RESOURCES.map((resource,index)=><a
      className="bayona-direct-contact__download"
      key={resource.url}
      href={resource.url}
      download
      onClick={()=>trackEvent('free_resource_download',{source:LEAD_SOURCE,resource:index+1})}>
      <span className="bayona-direct-contact__index">{String(index+1).padStart(2,'0')}</span>
      <span><strong>{resource.title}</strong><small>{resource.label}</small></span>
      <ArrowUpRight size={20} aria-hidden="true"/>
     </a>)}
    </div>
    <div className="bayona-direct-contact__next">
     <span className="bayona-direct-contact__eyebrow">TU SIGUIENTE MOVIMIENTO</span>
     <h3>¿ENTRENAMOS?</h3>
     {cloud&&status!=='sent'&&<form onSubmit={submit} noValidate>
      <label htmlFor="lead-magnet-name">TU NOMBRE</label>
      <input id="lead-magnet-name" type="text" name="name" autoComplete="name" maxLength={70}
       value={name} onChange={e=>setName(e.target.value)} placeholder="¿Cómo te llamas?"/>
      <label htmlFor="lead-magnet-contact">TU CORREO O WHATSAPP</label>
      <input id="lead-magnet-contact" name="contact" type="text" autoComplete="email" maxLength={120}
       value={contact} onChange={e=>setContact(e.target.value)} placeholder="Tu contacto"/>
      <label className="bayona-direct-contact__consent">
       <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)}/>
       <span>Quiero que BAYONA utilice estos datos para responder a mi solicitud.</span>
      </label>
      {error&&<p role="alert" className="bayona-direct-contact__error">{error}</p>}
      <button type="submit" className="gold-button" disabled={status==='sending'}>
       {status==='sending'?'ENVIANDO…':'QUIERO QUE ME CONTACTEN'} <ArrowUpRight size={18} aria-hidden="true"/>
      </button>
     </form>}
     {status==='sent'?<p className="bayona-direct-contact__status" role="status"><CheckCircle2 size={20}/> Solicitud recibida. Te responderemos por el contacto indicado.</p>
      :<p className="bayona-direct-contact__note">Consulta sin compromiso. Confirmamos disponibilidad y condiciones antes de contratar.</p>}
     <a className="bayona-direct-contact__whatsapp" href={fallbackUrl} target="_blank" rel="noopener noreferrer"
      onClick={()=>trackWhatsAppClick({source:LEAD_SOURCE})}>
      {isBookingEnabled()&&!cloud?'CONSULTAR DISPONIBILIDAD':'HABLAR POR WHATSAPP'} <ArrowUpRight size={20}/>
     </a>
     <p className="bayona-direct-contact__privacy"><ShieldCheck size={15}/> Solo se comparte lo que tú decidas enviar.</p>
     <Link className="bayona-direct-contact__plans-link" to="/programs">Ver servicios y precios <ArrowUpRight size={16}/></Link>
    </div>
   </div>
  </div>
 </section>
}
