/**
 * Verify that first-route JavaScript does not fetch the WebGL vendor chunk.
 * Run after a production build: npm run audit:bundle:3d.
 */
import {readFileSync} from 'node:fs'
import {join} from 'node:path'
import {gzipSync} from 'node:zlib'

const dist=join(process.cwd(),'dist')
const html=readFileSync(join(dist,'index.html'),'utf8')
const entry=html.match(/<script[^>]+src="\/assets\/(index-[^"]+\.js)"/)?.[1]
if(!entry)throw new Error('No se encontró el JavaScript principal en dist/index.html')

const pending=[entry]
const checked=new Set()
const sizes=[]
while(pending.length){
 const file=pending.pop()
 if(checked.has(file))continue
 checked.add(file)
 const source=readFileSync(join(dist,'assets',file),'utf8')
 sizes.push({file,kib:Math.round(gzipSync(source).length/1024)})
 const imports=[...source.matchAll(/(?:\bfrom\s*|\bimport\s*)["']\.\/([^"']+\.js)["']/g)]
 for(const match of imports)pending.push(match[1])
}
const webgl=[...checked].filter(file=>file.includes('vendor-three'))
const totalKiB=sizes.reduce((sum,item)=>sum+item.kib,0)
console.log('BAYONA · auditoría de carga inicial de JavaScript')
console.log('Módulos de entrada:',[...checked].join(', '))
console.log('Suma gzip de chunks estáticos:',totalKiB+' KiB')
if(webgl.length){
 console.error('FALLO: WebGL cargado de forma estática:',webgl.join(', '))
 process.exitCode=1
}else{
 console.log('OK: no hay importación estática del motor 3D en la entrada.')
}
