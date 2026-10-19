/**
 * Fail production CI if test purchase URLs or dev-only operator interface leak.
 * API files may keep sandbox price IDs, but public assets must never advertise
 * demo checkout as if it accepted real money.
 */
import {readdirSync,readFileSync} from 'node:fs'
import {join} from 'node:path'
const root=join(process.cwd(),'dist')
const stack=[root]
const violations=[]
while(stack.length){
 const dir=stack.pop()
 for(const item of readdirSync(dir,{withFileTypes:true})){
  const full=join(dir,item.name)
  if(item.isDirectory()){stack.push(full);continue}
  if(!/\.(js|css|html|json)$/i.test(item.name))continue
  const contents=readFileSync(full,'utf8')
  if(contents.includes('buy.stripe.com/test_')||contents.includes('PRUEBAS · NO COBROS REALES')){
    violations.push(full.replace(root,''))
  }
 }
}
if(violations.length){
 console.error('ERROR: La compilación pública contiene enlaces o interfaz Stripe sandbox:',violations)
 process.exitCode=1
}else{
 console.log('OK: Compilación pública sin enlaces de pago Stripe sandbox ni interfaz de prueba.')
}
