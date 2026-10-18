/**
 * Preguntas de baja fricción contextualizadas por capítulo.
 * Nunca piden diagnósticos, síntomas, datos personales ni datos de contacto.
 * La lectura no se bloquea si la persona no participa.
 */
export const MOMENT_PROMPTS = Object.freeze({
  '/': [
    null,
    { title:'¿POR DÓNDE QUIERES EMPEZAR?', key:'inicio', options:['Entender mi punto de partida','Ver las opciones'], detail:'Tu punto de partida es lo primero.' },
    { title:'¿CÓMO TE GUSTARÍA ENTRENAR?', key:'formato', options:['Con acompañamiento cercano','A mi propio ritmo'], detail:'Puedes cambiar tu respuesta en cualquier momento.' },
    { title:'¿CUÁNTO APOYO BUSCAS?', key:'apoyo', options:['Una base sencilla','Seguimiento más frecuente'], detail:'No elegimos ni compramos ningún plan por ti.' },
    { title:'¿QUÉ TE INTERESA AQUÍ?', key:'saludInfo', options:['Entender el enfoque','Conocer los límites del servicio'], detail:'Orientación general; no recogemos información de salud.' },
    { title:'¿QUÉ PREFIERES PARA EMPEZAR?', key:'inicioProceso', options:['Hablar primero','Explorar los recursos'], detail:'El siguiente paso siempre es voluntario.' },
    { title:'¿QUÉ TE INTERESA DE LA APP?', key:'appInteres', options:['Organizar sesiones','Seguir mi progreso'], detail:'Consulta qué existe hoy y qué sigue en desarrollo.' },
    { title:'¿QUÉ QUIERES APROVECHAR GRATIS?', key:'recurso', options:['Guía de 7 días','Registro de 30 días'], detail:'Los tres recursos siguen disponibles sin registro.' },
    { title:'¿CÓMO PREFIERES CONTINUAR?', key:'contacto', options:['Hablar por WhatsApp','Seguir explorando'], detail:'Contactar no es obligatorio. Ningún mensaje se envía automáticamente.' },
  ],
  '/about': [
    { title:'¿QUÉ QUIERES CONOCER?', key:'conocer', options:['A la persona','El método de trabajo'] },
    { title:'¿QUÉ VALORAS MÁS?', key:'criterio', options:['Escucha y cercanía','Un plan claro'] },
    { title:'¿QUÉ TE GENERA MÁS CONFIANZA?', key:'confianza', options:['Conocer al entrenador','Saber cómo trabaja'] },
    { title:'¿QUÉ PARTE TE INSPIRA?', key:'historia', options:['Los comienzos','La evolución del método'] },
    { title:'¿QUÉ TE INTERESA DE LA COMUNIDAD?', key:'comunidad', options:['Historias reales','Aprender en grupo'] },
    { title:'¿QUÉ PRIORIZAS?', key:'valores', options:['Transparencia','Acompañamiento responsable'] },
    { title:'¿QUÉ TE GUSTARÍA ENTENDER?', key:'metodo', options:['La progresión','Cómo empezar'] },
  ],
  '/programs': [
    { title:'¿CÓMO TE IMAGINAS ENTRENANDO?', key:'formato', options:['Con acompañamiento cercano','A mi propio ritmo'] },
    { title:'¿QUÉ CAMINO EXPLORAMOS?', key:'servicio', options:['Entrenamiento individual','Entrenamiento online'] },
    { title:'¿QUÉ APOYO PREFIERES?', key:'apoyo', options:['Una base sencilla','Seguimiento más frecuente'] },
    { title:'¿QUÉ QUIERES COMPARAR?', key:'sesiones', options:['Lo que incluye','La forma de entrenar'] },
    { title:'¿CUÁL SERÍA TU SIGUIENTE PASO?', key:'contacto', options:['Consultar disponibilidad','Seguir explorando'] },
  ],
  '/movimiento-adaptado': [
    { title:'¿QUÉ QUIERES COMPRENDER?', key:'saludInfo', options:['El enfoque del ejercicio','Los límites profesionales'] },
    { title:'¿QUÉ INFORMACIÓN BUSCAS?', key:'contextos', options:['Ver las áreas generales','Leer las orientaciones de seguridad'] },
    { title:'¿QUÉ NECESITAS ACLARAR?', key:'criterioSalud', options:['Cuándo consultar','Qué hace un entrenador'] },
  ],
  '/parkour-academy': [
    { title:'¿QUÉ TE LLAMA DEL PARKOUR?', key:'parkourInteres', options:['Aprender las bases','Mejorar el control'] },
    { title:'¿QUÉ TE GUSTARÍA ENTRENAR?', key:'parkourInicio', options:['Técnica desde cero','Progresión paso a paso'] },
    { title:'¿QUÉ TE IMPORTA DEL NIVEL?', key:'parkourNivel', options:['Empezar con seguridad','Entender cómo se progresa'] },
    { title:'¿QUÉ QUIERES SABER DEL MÉTODO?', key:'metodo', options:['Aprender movimientos','Entender la progresión'] },
    { title:'¿QUÉ PASO PREFIERES?', key:'contacto', options:['Consultar opciones','Conocer primero el programa'] },
    { title:'¿QUÉ QUIERES RESOLVER?', key:'dudas', options:['Las clases','Cómo empezar'] },
    { title:'¿QUÉ HARÍAS DESPUÉS?', key:'contacto', options:['Preguntar por disponibilidad','Seguir descubriendo'] },
  ],
  '/app': [
    { title:'¿QUÉ TE APORTARÍA UNA APP?', key:'appInteres', options:['Organizar sesiones','Seguir mi progreso'] },
    { title:'¿QUÉ QUIERES EXPLORAR?', key:'appReal', options:['La experiencia actual','Cómo acceder'] },
    { title:'¿QUÉ TE INTERESA DEL FUTURO?', key:'appFuturo', options:['Planificación','Recuperación y hábitos'] },
    { title:'¿QUÉ TE GUSTARÍA VER?', key:'appModulos', options:['Entrenamiento','Organización'] },
    { title:'¿QUÉ FORMATO TE AYUDA MÁS?', key:'appVisual', options:['Una vista simple','Detalles del entrenamiento'] },
    { title:'¿CÓMO QUIERES SEGUIR?', key:'appContacto', options:['Conocer novedades','Explorar la app'] },
    { title:'¿QUÉ BUSCAS ORGANIZAR?', key:'appConexion', options:['Sesiones','Recursos'] },
    { title:'¿QUÉ SIGUE PARA TI?', key:'appContacto', options:['Consultar la versión actual','Seguir el desarrollo'] },
  ],
  '/community': [
    { title:'¿QUÉ BUSCAS EN UNA COMUNIDAD?', key:'comunidad', options:['Compartir experiencias','Aprender con otros'] },
    { title:'¿QUÉ TE AYUDA A MANTENERTE?', key:'constancia', options:['Un hábito simple','Acompañamiento'] },
    { title:'¿QUÉ ACTIVIDAD TE INTERESA?', key:'comunidadActividad', options:['Retos accesibles','Aprender nuevas ideas'] },
    { title:'¿QUÉ PARTICIPACIÓN PREFIERES?', key:'comunidadModo', options:['Explorar primero','Participar gradualmente'] },
    { title:'¿QUÉ TE GUSTA DESCUBRIR?', key:'comunidadActualidad', options:['Novedades','Experiencias'] },
    { title:'¿QUÉ APROVECHARÍAS MÁS?', key:'comunidadContenido', options:['Recursos prácticos','Conversaciones'] },
    { title:'¿CÓMO QUIERES EMPEZAR?', key:'comunidadContacto', options:['Conocer el grupo','Preguntar cómo funciona'] },
  ],
  '/resources': [
    { title:'¿QUÉ RECURSO TE VENDRÍA BIEN?', key:'recurso', options:['Guía de 7 días','Registro de 30 días'] },
    { title:'¿QUÉ TE AYUDA A EMPEZAR?', key:'habitos', options:['Pasos pequeños','Registrar avances'] },
    { title:'¿QUÉ HÁBITO PREFIERES OBSERVAR?', key:'registro', options:['La constancia','La organización'] },
    { title:'¿QUÉ QUIERES LEER?', key:'lectura', options:['Ideas de entrenamiento','Consejos prácticos'] },
    { title:'¿QUÉ TIPO DE RESPUESTA BUSCAS?', key:'preguntas', options:['Una explicación','Una orientación general'] },
    { title:'¿CUÁL ES TU SIGUIENTE PASO?', key:'recursoContacto', options:['Descargar gratis','Preguntar sobre servicios'] },
  ],
  '/faq': [
    { title:'¿QUÉ QUIERES ACLARAR?', key:'faq', options:['Precios y planes','Cómo funciona BAYONA'] },
    { title:'¿QUÉ TE AYUDA A DECIDIR?', key:'dudas', options:['Comparar opciones','Entender el proceso'] },
    { title:'¿CÓMO PREFIERES RESOLVERLO?', key:'contacto', options:['Hacer una consulta','Explorar con calma'] },
  ],
  '/shop': [
    { title:'¿QUÉ QUIERES EXPLORAR?', key:'tienda', options:['Ropa BAYONA','Complementos'] },
    { title:'¿QUÉ ESTILO TE INTERESA?', key:'tiendaEstilo', options:['Uso diario','Estilo deportivo'] },
    { title:'¿QUÉ VALORAS DE UNA PRENDA?', key:'tiendaCriterio', options:['Comodidad','Diseño'] },
    { title:'¿CÓMO PREFIERES COMPARAR?', key:'tiendaComparar', options:['Ver el catálogo','Consultar detalles'] },
    { title:'¿QUÉ QUIERES CONOCER?', key:'tiendaProceso', options:['Cómo comprar','Condiciones y disponibilidad'] },
  ],
})

export function getMomentPrompt(pathname, index) {
  return MOMENT_PROMPTS[pathname]?.[index] ?? null
}
