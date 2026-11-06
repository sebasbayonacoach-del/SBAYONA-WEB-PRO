/**
 * Synchronise the public academy syllabus and Coach OS resources.
 * Source of truth: src/config/academyCourses.js and docs/academia/*.md.
 * No payment entitlements or confidential resource-center files are exposed.
 * Run: node scripts/build-coachos-content.mjs
 */
import { academyCourses } from '../src/config/academyCourses.js'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'

const output = 'public/mi-app/academy'
const lessonDir = output + '/lessons'
mkdirSync(lessonDir, { recursive: true })

const sampleSources = {
  'coach-studio-ai': 'docs/academia/COACH-STUDIO-IA-CLASE-01.md',
  'movimiento-360': 'docs/academia/MOVIMIENTO-360-CLASE-01.md',
  'parkour-lab': 'docs/academia/PARKOUR-LAB-CLASE-01.md',
}

const curriculum = academyCourses.map(course => {
  const lesson = sampleSources[course.id]
  if (lesson && !existsSync(lesson)) throw new Error('Falta clase original: '+lesson)
  return {
    id: course.id,
    title: course.title,
    category: course.category,
    audience: course.audience,
    weeks: course.weeks,
    summary: course.summary,
    promise: course.promise,
    modules: course.modules.map(([number,title,detail]) => ({ number, title, detail })),
    deliverables: course.deliverables,
    project: course.project,
    status: 'En preparación',
    sampleLesson: lesson ? '/mi-app/academy/lessons/'+course.id+'.html' : null,
    pageUrl: '/academia#curso-'+course.id,
  }
})
const publicResources = [
  {id:'mes-movimiento',title:'Tu primer mes de movimiento',category:'Guías',summary:'Ebook original · 12 páginas · cuatro semanas y registro.',type:'PDF',href:'/downloads/sebastian-bayona/tu-primer-mes-de-movimiento.pdf'},
  {id:'movimiento-cotidiano',title:'Moverte cada día',category:'Guías',summary:'Ebook original · 8 páginas · hábitos y movilidad.',type:'PDF',href:'/downloads/sebastian-bayona/moverte-cada-dia.pdf'},
  {id:'primera-semana',title:'Tu primera semana',category:'Plantillas',summary:'Guía editorial de incorporación al movimiento.',type:'PDF',href:'/downloads/bayona-editorial/primera-semana.pdf'},
  {id:'registro',title:'Registro de 30 días',category:'Plantillas',summary:'Cuaderno para llevar seguimiento y revisar avances.',type:'PDF',href:'/downloads/bayona-editorial/registro-30-dias.pdf'},
  {id:'punto-partida',title:'Dossier: punto de partida',category:'Plantillas',summary:'Cuestionario y criterios generales de preparación.',type:'PDF',href:'/downloads/bayona-editorial/dossier-punto-de-partida.pdf'},
  {id:'movilidad-habitos',title:'Movilidad y hábitos',category:'Guías',summary:'Lectura complementaria de práctica cotidiana.',type:'PDF',href:'/downloads/bayona-editorial/movilidad-y-habitos.pdf'},
  {id:'plan-fuerza',title:'Plan de fuerza',category:'Planificación',summary:'Material de referencia de programación.',type:'PDF',href:'/downloads/bayona-editorial/plan-fuerza.pdf'},
  {id:'plan-raiz',title:'Plan RAÍZ',category:'Planificación',summary:'Material editorial de la línea RAÍZ.',type:'PDF',href:'/downloads/bayona-editorial/plan-raiz.pdf'},
  {id:'plan-rendimiento',title:'Plan de rendimiento',category:'Planificación',summary:'Material de referencia de rendimiento.',type:'PDF',href:'/downloads/bayona-editorial/plan-rendimiento.pdf'},
  {id:'plan-elite',title:'Plan ELITE',category:'Planificación',summary:'Material editorial de la línea ELITE.',type:'PDF',href:'/downloads/bayona-editorial/plan-elite.pdf'},
]
for (const item of publicResources) {
  const filename = 'public'+item.href
  if (!existsSync(filename)) throw Error('Falta recurso: '+filename)
}
const catalog = {
  schemaVersion: 1,
  title: 'ACADEMIA · Mi Centro de Recursos',
  notice: 'Catálogo de contenidos públicos y materiales de la app. El repositorio personal privado no está conectado ni sincronizado.',
  courses: curriculum,
  resources: publicResources,
  exerciseLibrary: {label:'PROPLAYER · Biblioteca de ejercicios',internalSection:'library',note:'Ya integrada en SB+; las licencias de vídeo se respetan.'},
}
writeFileSync(output+'/catalog.json',JSON.stringify(catalog,null,2)+'\n')

const css = readFileSync('scripts/coach-lesson.css','utf8')
for (const [id, source] of Object.entries(sampleSources)) {
  const markdown = readFileSync(source, 'utf8')
  const rendered = execFileSync('pandoc',['-f','gfm','-t','html5'],{input:markdown,encoding:'utf8'})
  // The source file is version-controlled original content. No scripts or interactive
  // elements allowed in the embedded viewer, which also uses iframe sandbox.
  const safe = rendered.replace(/<script[\s\S]*?<\/script>/gi,'')
  const course = curriculum.find(x=>x.id===id)
  const html = '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>'+course.title+' · Clase abierta</title><style>'+css+'</style></head><body><main class="lesson-content">'+safe+'</main></body></html>'
  writeFileSync(lessonDir+'/'+id+'.html',html)
}
console.log('Coach OS: '+curriculum.length+' formaciones, '+publicResources.length+' recursos PDF, '+Object.keys(sampleSources).length+' clases abiertas.')
