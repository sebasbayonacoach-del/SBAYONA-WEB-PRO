/**
 * Original 2D procedural studies referencing 21 publicly named visual genres.
 * Not imported WebGL shaders or code from AIDesigner.
 * Normalized 0..1 coordinates; calls stop when the host section is offscreen.
 */
const PI=Math.PI,TAU=PI*2,sin=Math.sin,cos=Math.cos
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v))
const rand=i=>{const v=sin(i*127.1+78.233)*43758.5453;return v-Math.floor(v)}
const amber=[246,164,99],gold=[255,218,169],teal=[76,211,182],blue=[107,152,215]
const color=(rgb,alpha)=>'rgba('+rgb.join(',')+','+cl(alpha)+')'
function glow(c,x,y,r,rgb,alpha=1){
 const g=c.createRadialGradient(x,y,.001,x,y,r)
 g.addColorStop(0,color(rgb,.38*alpha))
 g.addColorStop(.55,color(rgb,.13*alpha))
 g.addColorStop(1,color(rgb,0))
 c.fillStyle=g;c.fillRect(x-r,y-r,2*r,2*r)
}
function dot(c,x,y,r,rgb,a=.5){
 c.beginPath();c.ellipse(x,y,r,r,0,0,TAU);c.fillStyle=color(rgb,a);c.fill()
}
function stroke(c,points,rgb,a=.36,width=.002){
 if(points.length<2)return
 c.beginPath();c.moveTo(...points[0])
 for(const p of points.slice(1))c.lineTo(...p)
 c.strokeStyle=color(rgb,a);c.lineWidth=width;c.stroke()
}
function band(c,points,rgb,a=.1){
 c.beginPath();c.moveTo(...points[0]);for(const p of points.slice(1))c.lineTo(...p)
 c.lineTo(1,1);c.lineTo(0,1);c.closePath();c.fillStyle=color(rgb,a);c.fill()
}
function wave(t,j,n=60,amplitude=.04,base=.1){
 const out=[]
 for(let i=0;i<=n;i++){
  const x=i/n
  out.push([x,base+j*.065+sin(x*10+t*.4+j*.3)*amplitude+sin(x*21-t*.24+j*.42)*.008])
 }
 return out
}
function circle(c,x,y,rx,ry,rgb,a=.25,width=.002){
 c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.lineWidth=width;c.strokeStyle=color(rgb,a);c.stroke()
}
function draw(c,id,t){
 switch(id){
 case 'fluted-glass':
  glow(c,.25+sin(t*.2)*.08,.46,.6,teal,.8);glow(c,.76,.43,.49,amber,.9)
  for(let i=0;i<46;i++){
   const x=i/46,g=c.createLinearGradient(x,0,x+.025,0)
   g.addColorStop(0,color(gold,0));g.addColorStop(.4,color(gold,.22));g.addColorStop(.7,color(blue,.025));g.addColorStop(1,color(teal,.14))
   c.fillStyle=g;c.fillRect(x,0,.018,1)
   stroke(c,[[x,0],[x,1]],gold,.12,.001)
  }break
 case 'riso-dither':
  for(let j=0;j<25;j++)for(let i=0;i<42;i++){
   const x=(i+.5)/42,y=(j+.5)/25
   const n=cl(.5+(sin(x*13+t*.4)+cos(y*12-t*.25)+sin((x+y)*8+t*.3))/6)
   dot(c,x,y,.0015+n*.007,(i+j)%5===0?teal:amber,.15+n*.5)
  }break
 case 'noise-shimmer':
  for(let i=0;i<150;i++){const x=rand(i+4),y=rand(i+90);dot(c,x,y,.0006+rand(i+31)*.002,gold,.08+sin(t*.7+i)**2*.35)}
  for(let j=0;j<9;j++)stroke(c,wave(t*.6,j,56,.025,.15),j%2?gold:teal,.22,.0016)
  break
 case 'dot-grid-wave':
  for(let j=0;j<15;j++)for(let i=0;i<27;i++){
   const v=.5+.5*sin(i*.52+j*.49-t*1.2),x=(i+.5)/27,y=(j+.5)/15
   dot(c,x,y,.002+v*.0046,v>.52?gold:teal,.10+v*.47)
  }break
 case 'fluid-smoke':
  for(let j=0;j<28;j++)stroke(c,wave(t*.85,j,63,.063,.07),j%3===0?teal:amber,.07+j*.009,.0035+j*.0001)
  glow(c,.68+sin(t*.16)*.08,.42,.6,teal,.6);break
 case 'light-rays':
  glow(c,.19,.07,.55,gold,.9)
  for(let i=0;i<26;i++){
   const theta=.12+i*.066+sin(t*.22+i)*.021
   const x=.19+cos(theta)*1.4,y=.06+sin(theta)*1.5
   c.beginPath();c.moveTo(.19,.06);c.lineTo(x-.013,y);c.lineTo(x+.013,y);c.closePath()
   c.fillStyle=color(i%3?gold:teal,.03+rand(i)*.12);c.fill()
  }
  for(let i=0;i<55;i++)dot(c,rand(i+1),rand(i+72),.0015,gold,.1+sin(t+i)**2*.25)
  break
 case 'holo-foil':
  for(let j=0;j<21;j++)stroke(c,wave(t*.65,j,65,.035,-.17),[gold,teal,blue,amber][j%4],.15,.009)
  for(let i=0;i<23;i++)stroke(c,[[i/23-.1,0],[i/23+.12,1]],gold,.1,.001)
  glow(c,.43+sin(t*.2)*.22,.5,.44,blue,.58);break
 case 'halftone':
  for(let j=0;j<30;j++)for(let i=0;i<45;i++){
   const x=(i+.5)/45,y=(j+.5)/30
   const n=.5+.5*sin(x*10+t*.25)*cos(y*8-t*.21)
   dot(c,x,y,.0015+n*.0055,j%2?amber:gold,.16+n*.44)
  }break
 case 'caustics':
  glow(c,.55,.35,.8,teal,.7)
  for(let j=0;j<25;j++)stroke(c,wave(t*2.3,j,70,.028,-.11),j%4===0?gold:teal,.17,.003)
  break
 case 'aurora-flow':
  for(let i=0;i<43;i++){
   const x=i/43,y=.19+sin(x*6+t*.24)*.12
   const g=c.createLinearGradient(x,y,x,1)
   g.addColorStop(0,color(teal,.20));g.addColorStop(.5,color(blue,.07));g.addColorStop(1,color(teal,0))
   c.fillStyle=g;c.fillRect(x,y,.021,1-y)
  }
  for(let j=0;j<5;j++)stroke(c,wave(t*.55,j,65,.09,.09),j%2?gold:teal,.23,.003)
  break
 case 'silk-waves':
  for(let j=0;j<15;j++){const pts=wave(t,j,80,.06,.06);stroke(c,pts,j%2?amber:gold,.11+j*.012,.004);if(j%5===0)band(c,pts,teal,.025)}
  break
 case 'liquid-metal':
  glow(c,.63,.39,.64,gold,.7)
  for(let j=0;j<19;j++){
   const y=j*.062+sin(t*.21+j)*.012
   const g=c.createLinearGradient(0,y,1,y+.03)
   g.addColorStop(0,color(gold,.02));g.addColorStop(.4,color(gold,.30));g.addColorStop(.55,color(blue,.05));g.addColorStop(.76,color(gold,.25));g.addColorStop(1,color(gold,0))
   c.fillStyle=g;c.fillRect(0,y,1,.008+j*.00035)
  }break
 case 'heatmap':
  for(let i=0;i<9;i++){
   const x=.14+rand(i+1)*.7+sin(t*.13+i)*.03,y=.18+rand(i+17)*.65
   glow(c,x,y,.19+rand(i+23)*.2,i%3===0?teal:amber,.75)
   for(let j=1;j<=3;j++)circle(c,x,y,.035+j*.044,.03+j*.04,gold,.1,.0015)
  }break
 case 'liquid-glass':
  glow(c,.5,.46,.6,teal,.68)
  for(let i=0;i<5;i++){
   const x=.1+(i%3)*.3+sin(t*.17+i)*.02,y=.14+Math.floor(i/3)*.42+cos(t*.21+i)*.02
   c.beginPath();c.roundRect(x,y,.24,.29,.036)
   c.fillStyle=color(gold,.035);c.fill();c.lineWidth=.004;c.strokeStyle=color(gold,.29);c.stroke()
   stroke(c,[[x+.02,y+.02],[x+.20,y+.02]],gold,.39,.003)
  }break
 case 'mesh-gradient':
  for(let i=0;i<11;i++){
   const x=.14+rand(i+5)*.74+sin(t*.16+i)*.08,y=.12+rand(i+14)*.76+cos(t*.13+i)*.075
   glow(c,x,y,.25+rand(i+33)*.30,[teal,amber,blue][i%3],.87)
  }break
 case 'starfield':
  for(let i=0;i<155;i++){
   const z=.3+rand(i+45)*.7,x=(rand(i+1)+t*.001*z)%1,y=rand(i+775)
   dot(c,x,y,.0007+z*.0014,gold,.1+.54*z*(.5+.5*sin(t*.33+i)**2))
  }
  stroke(c,[[(t*.018)%1,.08],[(t*.018)%1-.10,.18]],gold,.7,.003)
  break
 case 'bokeh-dust-drift':
  for(let i=0;i<58;i++){
   const x=(rand(i+2)+sin(t*.17+i)*.038+1)%1,y=(rand(i+80)+t*.005*(.2+rand(i+77)))%1
   dot(c,x,y,.005+rand(i+22)*.02,i%3===0?teal:gold,.07+rand(i+9)*.12)
   if(i%7===0)glow(c,x,y,.08,gold,.32)
  }break
 case 'glow-orbs':
  for(let i=0;i<11;i++){
   const x=.1+rand(i+2)*.75+sin(t*.17+i*2)*.1,y=.2+rand(i+12)*.60+cos(t*.12+i)*.1
   glow(c,x,y,.23+rand(i+23)*.17,i%2?gold:teal,.88)
  }break
 case 'ascii-plasma':{
  const chars=['·',':','-','=','+','*','#','@']
  c.font='.019px monospace';c.textAlign='center';c.textBaseline='middle'
  for(let j=0;j<16;j++)for(let i=0;i<40;i++){
   const x=(i+.5)/40,y=(j+.5)/16
   const v=sin(x*12+t*.4)*cos(y*13-t*.3)+sin(x*6+y*5+t*.3)
   const n=Math.floor(cl((v+2)/4)*7)
   c.fillStyle=color(n>4?gold:teal,.12+n*.065)
   c.fillText(chars[n],x,y)
  }
  break
 }
 case 'pixel-grid':
  for(let j=0;j<17;j++)for(let i=0;i<31;i++){
   const x=i/31,y=j/17,v=.5+.5*sin(x*8-t*.37)*cos(y*10+t*.2)
   if(v>.33){c.fillStyle=color((i+j)%4===0?teal:amber,v*.21);c.fillRect(x+.002,y+.004,.026,.05)}
  }break
 case 'topo-lines':
  for(let j=0;j<33;j++){
   const pts=[],hx=.54+sin(t*.13)*.1
   for(let i=0;i<=70;i++){
    const x=i/70
    const hill=.12*Math.exp(-((x-hx)**2)/.03)
    pts.push([x,-.06+j*.035+sin(x*12+t*.1+j*.4)*.019-hill])
   }
   stroke(c,pts,j%5===0?gold:teal,j%5===0?.38:.18,j%5===0?.002:.0013)
  }break
 default:break
 }
}
export function drawProceduralEffect(canvas,effect,t=0){
 const c=canvas.getContext('2d',{alpha:true})
 if(!c||canvas.width<1||canvas.height<1)return
 c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,canvas.width,canvas.height)
 c.setTransform(canvas.width,0,0,canvas.height,0,0);c.save()
 draw(c,effect,t);c.restore()
}
