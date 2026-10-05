#!/usr/bin/env python3
"""Generate the BAYONA editorial downloads from the canonical offerings catalog."""
from pathlib import Path
import json, subprocess, textwrap
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/downloads/bayona-editorial'
W, H = A4
BLACK = colors.HexColor('#11110f'); PANEL = colors.HexColor('#1b1a17')
WHITE = colors.HexColor('#f4f1eb'); MUTED = colors.HexColor('#aaa69f')
ORANGE = colors.HexColor('#ef9858'); RULE = colors.HexColor('#514b43')
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
MONO = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'
pdfmetrics.registerFont(TTFont('Bayona', FONT)); pdfmetrics.registerFont(TTFont('Bayona-Bold', BOLD)); pdfmetrics.registerFont(TTFont('Bayona-Mono', MONO))

CATALOG_JS = "import { membershipPlans } from './src/config/offerings.js'; console.log(JSON.stringify(membershipPlans.map(({id,name,journey,priceDisplay,currency,eur,usdDisplay,tag,shortDescription,audience,includedLead,included,excluded,scarcity})=>({id,name,journey,priceDisplay,currency,eur,usdDisplay,tag,shortDescription,audience,includedLead,included,excluded,scarcity}))))"
PLANS = json.loads(subprocess.check_output(['node','--input-type=module','-e',CATALOG_JS],cwd=ROOT,text=True))
IMAGES = {
 'week': ROOT/'public/images/scenes/escena-proceso-gandia-real.webp',
 'log': ROOT/'public/images/bayona-generated/resources-challenge.png',
 'move': ROOT/'public/images/scenes/escena-parkour-gandia-tecnica.webp',
 'start': ROOT/'public/images/scenes/escena-proceso-datos-premium.webp',
 'RAIZ': ROOT/'public/images/bayona-generated/community-tier-open-1600.webp',
 'FUERZA': ROOT/'public/images/bayona-generated/programs-service-tecnica-1600.webp',
 'RENDIMIENTO': ROOT/'public/images/bayona-generated/programs-service-rendimiento-1600.webp',
 'ELITE': ROOT/'public/images/bayona-generated/community-tier-private-1672.webp',
}
S = ParagraphStyle('body',fontName='Bayona',fontSize=9.2,leading=14,textColor=WHITE,spaceAfter=5)
SMALL = ParagraphStyle('small',parent=S,fontSize=8,leading=12,textColor=MUTED)

def para(c, txt, x, y, width, style=S):
    p=Paragraph(txt,style); _,h=p.wrap(width, H); p.drawOn(c,x,y-h); return y-h
def label(c, txt, x, y, color=ORANGE):
    c.setFillColor(color); c.setFont('Bayona-Mono',7.5); c.drawString(x,y,txt.upper())
def wrap(c, txt, x, y, width, font='Bayona-Bold', size=27, leading=None, color=WHITE):
    leading=leading or size*1.12; c.setFillColor(color); c.setFont(font,size)
    lines=[]
    for part in txt.split('\n'):
        words=part.split(); line=''
        for word in words:
            test=(line+' '+word).strip()
            if pdfmetrics.stringWidth(test,font,size)>width and line: lines.append(line); line=word
            else: line=test
        lines.append(line)
    for line in lines: c.drawString(x,y,line); y-=leading
    return y
def base(c, title, n, total, img=None):
    c.setFillColor(BLACK); c.rect(0,0,W,H,fill=1,stroke=0)
    if img and img.exists():
        c.saveState(); c.setFillAlpha(.32); c.drawImage(ImageReader(str(img)),0,H-255,width=W,height=255,preserveAspectRatio=False,mask='auto'); c.restoreState()
        c.setFillColor(BLACK); c.saveState(); c.setFillAlpha(.40); c.rect(0,H-260,W,260,fill=1,stroke=0); c.restoreState()
    c.setStrokeColor(RULE); c.line(38,H-33,W-38,H-33)
    label(c,'BAYONA  /  '+title,38,H-24)
    c.setStrokeColor(RULE); c.line(38,32,W-38,32)
    c.setFillColor(MUTED); c.setFont('Bayona-Mono',7); c.drawString(38,19,'ENTRENAMIENTO CON CRITERIO  ·  MATERIAL EDUCATIVO')
    c.drawRightString(W-38,19,f'{n:02d} / {total:02d}')
def newpage(c, title, n, total, img=None):
    c.showPage(); base(c,title,n,total,img)
def lines(c, x, y, width, count=3, gap=22):
    c.setStrokeColor(RULE)
    for i in range(count): c.line(x,y-i*gap,x+width,y-i*gap)
def prompt(c, title, question, y, height=92):
    c.setFillColor(PANEL); c.roundRect(38,y-height,W-76,height,8,fill=1,stroke=0)
    label(c,title,54,y-20); para(c,question,54,y-42,W-108,SMALL); lines(c,54,y-height+25,W-108,1)
    return y-height-16

def resource(slug,title,kicker,desc,img,sections,workbook=False):
    total=len(sections)+1; path=OUT/f'{slug}.pdf'; c=canvas.Canvas(str(path),pagesize=A4,pageCompression=1)
    base(c,kicker,1,total,img)
    label(c,'GUÍA ABIERTA  /  DESCARGA GRATUITA',38,H-292)
    y=wrap(c,title,38,H-335,510,size=31)
    y=para(c,desc,38,y-18,500,S)
    y-=22; c.setFillColor(ORANGE); c.rect(38,y-2,48,3,fill=1,stroke=0)
    y-=35
    for i,(head,copy,activity) in enumerate(sections,2):
        newpage(c,kicker,i,total,img)
        label(c,f'CAPÍTULO {i-1:02d}  /  {kicker}',38,H-76)
        y=wrap(c,head,38,H-118,515,size=24)
        y=para(c,copy,38,y-18,510,S)-18
        if activity:
            if workbook: y=prompt(c,'PRÁCTICA',activity,y,105)
            else:
                y=para(c,activity,38,y,510,ParagraphStyle('call',parent=S,fontName='Bayona-Bold',textColor=ORANGE,fontSize=11,leading=16))-26
        if workbook and y>245:
            y=prompt(c,'TU REGISTRO', 'Anota lo que observas, sin juzgar el resultado. ¿Qué harás distinto en la próxima sesión?',y,120)
            lines(c,54,y-15,W-108,3,23)
        para(c,'Adapta la propuesta a tu experiencia, entorno y recursos. Si una actividad causa dolor o malestar, detente y busca orientación profesional adecuada.',38,94,510,SMALL)
    c.save(); return path

def brochure(plan):
    name=plan['name']; slug=plan['id'].lower(); path=OUT/f'plan-{slug}.pdf'; c=canvas.Canvas(str(path),pagesize=A4,pageCompression=1); img=IMAGES.get(plan['id']); total=3
    base(c,'PLAN '+name,1,total,img)
    label(c,plan['journey'],38,H-292)
    y=wrap(c,name,38,H-340,510,size=39)
    y=wrap(c,plan['tag'],38,y-15,500,font='Bayona-Mono',size=9,leading=14,color=ORANGE)
    y-=25; c.setFillColor(ORANGE); c.setFont('Bayona-Bold',24); c.drawString(38,y,plan['priceDisplay'])
    c.setFont('Bayona',10); c.setFillColor(WHITE); c.drawString(38,y-20,plan['currency']+'  ·  '+plan['eur']+'  ·  '+plan['usdDisplay'])
    y=para(c,plan['shortDescription'],38,y-52,485,S)
    label(c,'PARA QUIÉN',38,y-28); y=para(c,plan['audience'],38,y-43,485,SMALL)
    newpage(c,'PLAN '+name,2,total,img)
    label(c,'ALCANCE DEL ACOMPAÑAMIENTO',38,H-75)
    y=H-110
    if plan.get('includedLead'): y=para(c,plan['includedLead'],38,y,510,ParagraphStyle('lead',parent=S,fontName='Bayona-Bold',textColor=ORANGE,fontSize=11,leading=16))-12
    for item in plan['included']:
        c.setFillColor(ORANGE); c.circle(45,y-5,2,fill=1,stroke=0); y=para(c,item,58,y,475,S)-12
    y-=8; label(c,'ESTE NIVEL NO INCLUYE',38,y); y-=20
    for item in plan['excluded']:
        c.setFillColor(MUTED); c.circle(45,y-5,2,fill=1,stroke=0); y=para(c,item,58,y,475,SMALL)-8
    newpage(c,'PLAN '+name,3,total,img)
    label(c,'DECIDE CON INFORMACIÓN CLARA',38,H-75)
    y=wrap(c,'Tu proceso empieza con una conversación.',38,H-124,510,size=22)
    y=para(c,'Revisa qué nivel encaja con tu momento y confirma con BAYONA los detalles aplicables antes de contratar.',38,y-15,500,S)-22
    c.setFillColor(PANEL); c.roundRect(38,y-100,W-76,86,8,fill=1,stroke=0)
    label(c,'INVERSIÓN PUBLICADA',54,y-35); c.setFillColor(ORANGE); c.setFont('Bayona-Bold',20); c.drawString(54,y-67,plan['priceDisplay']+' '+plan['currency'])
    y-=135
    para(c,'Los servicios, frecuencia y alcance indicados en este folleto reproducen la oferta publicada por BAYONA. Las equivalencias de moneda son aproximadas. Confirma disponibilidad y condiciones vigentes en la conversación de contratación.',38,y,500,SMALL)
    if plan.get('scarcity'): label(c,plan['scarcity'],38,115)
    c.save(); return path

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    resource('primera-semana','Empieza por una semana posible','PRIMERA SEMANA','Una guía breve para observar tu punto de partida, preparar sesiones realistas y cerrar la semana con una decisión concreta. Sin rutinas universales ni metas prometidas.',IMAGES['week'],[
      ('Antes de empezar','La primera semana sirve para conocer tu agenda, espacio, experiencia y preferencias. No hace falta compensar el tiempo anterior ni demostrar nada.','¿Qué días y horarios suelen estar disponibles de verdad?'),
      ('Diseña el mínimo viable','Elige una frecuencia que puedas sostener y deja margen para descanso y cambios de agenda. Prepara con antelación un lugar y una opción sencilla para cada sesión.','Mi opción sencilla para esta semana es...'),
      ('Registra lo que pasó','Al terminar, apunta qué fue fácil, qué estorbó y cómo te sentiste durante la actividad. El registro ayuda a decidir; no es una calificación.','¿Qué facilitó que aparecieras? ¿Qué cambiarías?'),
      ('Cierra con una decisión','Conserva lo que encajó y ajusta una sola cosa para la semana siguiente. Si necesitas orientación personalizada, conversa con un profesional cualificado.','Una decisión pequeña para la próxima semana:')],True)
    resource('registro-30-dias','30 días para observar tu proceso','REGISTRO 30 DÍAS','Un cuaderno personal para anotar movimiento, energía y contexto durante un mes. No es un reto competitivo ni incluye premios o resultados garantizados.',IMAGES['log'],[
      ('Elige qué observar','Selecciona dos o tres señales útiles para ti: sesiones realizadas, descanso, energía percibida o facilidad para organizarte. El peso o la apariencia no son requisitos.','Mis señales de seguimiento son...'),
      ('Semana 1 · punto de partida','Anota tus circunstancias actuales y qué te gustaría entender mejor. Mantén la descripción neutral y concreta.','¿Qué patrón de agenda veo esta semana?'),
      ('Semana 2 · repetición','Registra lo que pudiste repetir y las barreras que aparecieron. Cambiar el plan también aporta información.','Una barrera y una adaptación que probé...'),
      ('Semana 3 · ajuste','Cambia una variable cada vez para notar qué te ayuda: horario, preparación, duración o descanso. Evita usar el registro para castigarte.','¿Qué ajuste merece continuar?'),
      ('Semana 4 · lectura','Compara tus notas y escribe una conclusión modesta, basada en lo observado. Este cuaderno no diagnostica ni sustituye asesoría individual.','Lo que aprendí y quiero mantener...')],True)
    resource('movilidad-y-habitos','Muévete con atención','MOVILIDAD Y HÁBITOS','Ideas educativas para integrar pausas de movimiento y hábitos sostenibles en la vida diaria. Ajusta cada propuesta a tus posibilidades y contexto.',IMAGES['move'],[
      ('Empieza por observar','Antes de añadir una rutina, observa dónde pasas el día, qué posiciones repites y cuándo te viene bien cambiar de postura. No existe una postura perfecta que debas mantener todo el día.','¿En qué momento me ayudaría una pausa?'),
      ('Pausas que caben en el día','Prueba cambios suaves de posición, caminar un poco o mover articulaciones sin forzar. Elige una opción cómoda y breve que puedas repetir.','Una pausa que puedo probar en mi jornada...'),
      ('Hazlo visible y sencillo','Asocia el hábito a una señal cotidiana, como terminar una llamada o preparar el espacio de trabajo. Deja a mano lo necesario y permite adaptar la opción.','Mi señal y mi versión mínima serán...'),
      ('Revisa la experiencia','Observa si la práctica te resulta cómoda, útil y compatible con tu vida. Detén cualquier actividad que cause dolor o malestar y consulta a un profesional sanitario cuando corresponda.','Qué me funcionó y qué prefiero modificar:')],True)
    resource('dossier-punto-de-partida','Tu punto de partida, en claro','DOSSIER PERSONAL','Un dossier de regalo para ordenar tus objetivos, experiencia, preferencias y preguntas antes de planificar. Puedes usarlo sin registrarte ni compartir tus respuestas.',IMAGES['start'],[
      ('Lo que quiero cambiar','Describe qué te gustaría que fuera diferente en tu relación con el movimiento, la fuerza o tus hábitos. Elige un propósito propio, concreto y revisable.','Me gustaría poder...'),
      ('Mi vida hoy','Anota horarios, responsabilidades, lugar disponible, recursos y obstáculos. Esta información permite pensar en opciones realistas.','Mi semana suele verse así...'),
      ('Mi experiencia y preferencias','Registra qué actividades has probado, cuáles disfrutaste y qué no encajó. Añade solo la información personal que quieras conservar.','Disfruto / prefiero evitar...'),
      ('Preguntas para una conversación','Prepara preguntas sobre método, seguimiento, límites del servicio y condiciones. No necesitas decidir antes de entender las respuestas.','Quiero preguntar...'),
      ('Una siguiente acción posible','Elige un paso pequeño: reservar un horario, preparar un espacio, pedir información o revisar esta hoja más adelante. No es una inscripción ni una solicitud de compra.','Mi siguiente paso, cuando esté listo, es...')],True)
    for p in PLANS: brochure(p)
    print('\n'.join(str(p) for p in sorted(OUT.glob('*.pdf'))))
if __name__=='__main__': main()
