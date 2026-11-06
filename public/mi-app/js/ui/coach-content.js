// SEBASTIAN BAYONA / COACH OS · Academia y Mi Centro de Recursos
// Materia pública original. No se conceden matrículas ni permisos de pago.
import { accountRole } from '../sync/supabase.js'
import { BUILDERS, openSection } from './shared.js'

const SOURCE = './academy/catalog.json'
const FAV_KEY = 'sb.coach.resources.favorites.v1'
const READ_KEY = 'sb.coach.academy.samples.read.v1'
let catalogTask = null

export function loadCoachCatalog(fetcher = fetch) {
  if (!catalogTask) catalogTask = fetcher(SOURCE, {cache:'no-cache'}).then(response => {
    if (!response.ok) throw new Error('HTTP '+response.status)
    return response.json()
  }).then(data => {
    if (!Array.isArray(data.courses) || !Array.isArray(data.resources)) throw new Error('Catálogo incompleto')
    return data
  }).catch(error => { catalogTask=null; throw error })
  return catalogTask
}

function n(tag, cls, text) {
  const e = document.createElement(tag)
  if (cls) e.className = cls
  if (text != null) e.textContent = String(text)
  return e
}
function btn(cls, label, cb) {
  const b = n('button',cls,label)
  b.type='button'
  if (cb) b.addEventListener('click',cb)
  return b
}
function link(cls, label, href) {
  const a = n('a',cls,label)
  a.href = href
  a.target='_blank'
  a.rel='noopener noreferrer'
  return a
}
function list(key) {
  try {
    const val=JSON.parse(localStorage.getItem(key)||'[]')
    return new Set(Array.isArray(val)?val.filter(x=>typeof x==='string'):[])
  } catch { return new Set() }
}
function toggle(key,id) {
  const values=list(key)
  if (values.has(id)) values.delete(id)
  else values.add(id)
  try { localStorage.setItem(key,JSON.stringify([...values])) } catch {}
  return values.has(id)
}
function validLesson(href) { return /^\/mi-app\/academy\/lessons\/[a-z0-9-]+\.html$/.test(href||'') }
function validDocument(href) { return /^\/downloads\/(?:sebastian-bayona|bayona-editorial)\/[a-z0-9-]+\.pdf$/.test(href||'') }
function verified(body) {
  if(accountRole()==='coach') return true
  body.replaceChildren(n('p','co-error','Acceso exclusivo para la cuenta Coach verificada.'))
  return false
}
function stillHere(body,section) {
  return body.isConnected && document.body.dataset.section===section && accountRole()==='coach'
}
function shell(title,description,number) {
  const root=n('section','co-learning')
  const hero=n('header','co-learning__hero')
  hero.append(n('span','co-learning__eyebrow','COACH OS  /  '+number),n('h3','',title),n('p','',description))
  const nav=n('nav','co-learning__switch')
  nav.setAttribute('aria-label','Herramientas educativas del Coach')
  for(const [name,label] of [['academy','ACADEMIA'],['resources','MI CENTRO DE RECURSOS'],['library','PROPLAYER']]) {
    const b=btn('',label,()=>openSection(name))
    b.dataset.coGo=name
    b.classList.toggle('is-active',document.body.dataset.section===name)
    nav.append(b)
  }
  const inside=n('div','co-learning__inside')
  root.append(hero,nav,inside)
  return {root,inside}
}
function summary(inside,items) {
  const row=n('div','co-learning__intro')
  for(const [value,text] of items) {
    const item=n('div','')
    item.append(n('strong','',value),n('span','',text))
    row.append(item)
  }
  inside.append(row)
}
function note(inside,text) { inside.append(n('p','co-learning__note',text)) }
function working(body,label) {
  body.replaceChildren(n('p','co-learning__loading','Cargando '+label+'…'))
}
function errorView(body,section,error) {
  const {root,inside}=shell('Contenido no disponible','Tus registros y sesiones no se han modificado.','SIN CONEXIÓN')
  inside.append(n('p','co-learning__error','No se pudo abrir el catálogo: '+(error?.message||'error de conexión')+'.'))
  inside.append(btn('co-learning__primary','REINTENTAR',()=>section==='academy'?renderAcademy(body):renderResources(body)))
  body.replaceChildren(root)
}
function searchBox(inside,label,placeholder) {
  const wrap=n('label','co-learning__search')
  wrap.append(n('span','',label))
  const input=n('input','','')
  input.type='search';input.autocomplete='off';input.placeholder=placeholder
  wrap.append(input);inside.append(wrap)
  return input
}
function filters(inside,options,onChange) {
  const group=n('div','co-learning__chips')
  group.setAttribute('role','group')
  group.setAttribute('aria-label','Filtrar catálogo')
  let active=options[0]
  const buttons=[]
  for(const option of options) {
    const b=btn('',option,()=>{
      active=option
      for(const item of buttons) item.setAttribute('aria-pressed',String(item===b))
      onChange(active)
    })
    b.setAttribute('aria-pressed',String(active===option))
    buttons.push(b);group.append(b)
  }
  inside.append(group)
  return group
}

async function renderAcademy(body) {
  if(!verified(body)) return
  working(body,'Academia')
  try {
    const model=await loadCoachCatalog()
    if (!stillHere(body,'academy')) return
    const {root,inside}=shell('ACADEMIA','Aprende, practica y aplica. Seis formaciones y tres clases originales para leer aquí.','01')
    summary(inside,[['6 FORMACIONES','Currículos estructurados'],['3 CLASES','Acceso abierto de lectura']])
    note(inside,'Ediciones en preparación: no hay matrícula, pago ni certificado activo. Las clases abiertas son materiales originales.')
    const input=searchBox(inside,'BUSCAR FORMACIÓN','Fuerza, parkour, IA, entrenadores…')
    const count=n('p','co-learning__count')
    const cards=n('div','co-learning__cards')
    let category='TODAS'
    filters(inside,['TODAS',...new Set(model.courses.map(c=>c.category))],option=>{category=option; redraw()})
    inside.append(count,cards,link('co-learning__secondary','VER ACADEMIA COMPLETA EN LA WEB ↗','/academia'))
    function redraw() {
      const q=input.value.trim().toLocaleLowerCase('es')
      const filtered=model.courses.filter(c=>(category==='TODAS'||c.category===category)
        && [c.title,c.summary,c.audience,...c.modules.map(m=>m.title)].join(' ').toLocaleLowerCase('es').includes(q))
      count.textContent=filtered.length+' de '+model.courses.length+' formaciones'
      cards.replaceChildren(...filtered.map(c=>courseCard(body,c)))
    }
    input.addEventListener('input',redraw)
    body.replaceChildren(root)
    redraw()
  } catch(error) {
    if (stillHere(body,'academy')) errorView(body,'academy',error)
  }
}
function courseCard(body,course) {
  const card=n('article','co-course')
  const head=n('div','co-course__head')
  head.append(n('span','',course.category),n('span','',course.weeks+' SEMANAS'))
  card.append(head,n('h4','',course.title),n('p','',course.summary))
  const outcome=n('p','co-course__outcome')
  outcome.append(n('strong','','AL FINAL: '),document.createTextNode(course.promise))
  card.append(outcome)
  const details=n('details','co-course__syllabus')
  details.append(n('summary','',course.modules.length+' MÓDULOS / VER TEMARIO'))
  const ol=n('ol','')
  for(const m of course.modules) {
    const li=n('li','')
    li.append(n('span','',m.number))
    const info=n('div','')
    info.append(n('strong','',m.title),n('p','',m.detail))
    li.append(info);ol.append(li)
  }
  details.append(ol,n('p','co-course__project','PROYECTO FINAL: '+course.project))
  card.append(details)
  const actions=n('div','co-course__buttons')
  if(validLesson(course.sampleLesson)) actions.append(btn('co-learning__primary','LEER CLASE 01',()=>showLesson(body,course)))
  const href=/^\/academia#curso-[a-z0-9-]+$/.test(course.pageUrl||'') ? course.pageUrl : '/academia'
  actions.append(link('co-learning__ghost','EXPLORAR CURSO ↗',href))
  card.append(actions,n('small','','PRELANZAMIENTO · SIN COBRO'))
  return card
}
function showLesson(body,course) {
  if (!validLesson(course.sampleLesson) || !verified(body)) return
  const {root,inside}=shell('LECTURA ABIERTA','Una clase completa para estudiar a tu ritmo. No es una matrícula.','CLASE 01')
  inside.append(btn('co-reader__back','← VOLVER A ACADEMIA',()=>renderAcademy(body)))
  inside.append(n('h4','co-reader__title',course.title))
  note(inside,'Puedes marcarla como leída: es una preferencia local en este dispositivo, no una evaluación oficial.')
  const frame=n('iframe','co-reader__frame')
  frame.setAttribute('title','Clase abierta: '+course.title)
  frame.setAttribute('sandbox','allow-same-origin')
  frame.src=course.sampleLesson
  inside.append(frame)
  const mark=btn('co-reader__mark','',()=>{
    toggle(READ_KEY,course.id)
    paint()
  })
  function paint() { mark.textContent=list(READ_KEY).has(course.id)?'✓ LEÍDA · DESMARCAR':'MARCAR COMO LEÍDA' }
  paint()
  inside.append(mark)
  body.replaceChildren(root)
  body.scrollTop=0
}

async function renderResources(body) {
  if(!verified(body)) return
  working(body,'Mi Centro de Recursos')
  try {
    const model=await loadCoachCatalog()
    if(!stillHere(body,'resources')) return
    const {root,inside}=shell('MI CENTRO DE RECURSOS','Documentos organizados para estudiar y preparar sesiones sin abandonar Coach OS.','02')
    summary(inside,[[model.resources.length+' DOCUMENTOS','PDFs verificados'],['PROPLAYER','Biblioteca de ejercicios aparte']])
    note(inside,'Selección de recursos de la web. Tu archivo privado «Mi Centro de Recursos» de Google Drive aún NO está sincronizado; no se publican archivos privados.')
    const shortcut=n('div','co-learning__shortcut')
    shortcut.append(n('strong','','BIBLIOTECA TÉCNICA DE EJERCICIOS'),n('p','','PROPLAYER ya está integrado en SB+. Abre ejercicios y rutinas directamente aquí.'))
    shortcut.append(btn('co-learning__primary','ABRIR PROPLAYER →',()=>openSection('library')))
    inside.append(shortcut)
    const input=searchBox(inside,'BUSCAR DOCUMENTO','Fuerza, movilidad, registro…')
    const count=n('p','co-learning__count')
    const cards=n('div','co-learning__cards')
    let category='TODOS'
    filters(inside,['TODOS','FAVORITOS',...new Set(model.resources.map(r=>r.category))],option=>{category=option;redraw()})
    inside.append(count,cards)
    const finish=n('div','co-learning__end')
    finish.append(link('co-learning__secondary','ABRIR BIBLIOTECA DE LA WEB ↗','/resources'),n('small','','Favoritos guardados solo en este navegador. No incluyen datos de clientes.'))
    inside.append(finish)
    function redraw() {
      const q=input.value.trim().toLocaleLowerCase('es')
      const favorite=list(FAV_KEY)
      const filtered=model.resources.filter(r=>validDocument(r.href)
        && (category==='TODOS'||category===r.category||(category==='FAVORITOS'&&favorite.has(r.id)))
        && [r.title,r.summary,r.category].join(' ').toLocaleLowerCase('es').includes(q))
      count.textContent=filtered.length+' de '+model.resources.length+' documentos'
      cards.replaceChildren(...filtered.map(r=>resourceCard(r,redraw)))
    }
    input.addEventListener('input',redraw)
    body.replaceChildren(root)
    redraw()
  } catch(error) {
    if(stillHere(body,'resources')) errorView(body,'resources',error)
  }
}
function resourceCard(resource,redraw) {
  const card=n('article','co-resource')
  const head=n('div','co-course__head')
  head.append(n('span','',resource.category),n('span','','PDF'))
  card.append(head,n('h4','',resource.title),n('p','',resource.summary))
  const actions=n('div','co-resource__actions')
  actions.append(link('co-learning__primary','ABRIR PDF ↗',resource.href))
  const fav=btn('co-learning__ghost','',()=>{
    toggle(FAV_KEY,resource.id)
    paint()
  })
  function paint() {
    const isFavorite=list(FAV_KEY).has(resource.id)
    fav.textContent=isFavorite?'★ GUARDADO':'☆ GUARDAR'
    fav.setAttribute('aria-pressed',String(isFavorite))
  }
  paint()
  actions.append(fav)
  card.append(actions)
  return card
}

BUILDERS.academy=renderAcademy
BUILDERS.resources=renderResources
