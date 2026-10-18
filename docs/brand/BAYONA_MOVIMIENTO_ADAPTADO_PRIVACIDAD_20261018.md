# BAYONA / Movimiento adaptado · Reglas de alcance y privacidad

## Qué se publicó en el rediseño
- Página pública `/movimiento-adaptado`: doce familias de situaciones y 104 ejemplos informativos.
- Orientación progresiva opcional en la home: objetivo, contexto y formato preferido.
- El ejercicio es apoyo de capacidad funcional y bienestar; BAYONA no ofrece diagnóstico, fisioterapia ni tratamiento médico mediante esta página.
- No hay promesas de mejora de enfermedades, eliminación de dolor ni aptitud médica automática.
- Patologías, contraindicaciones y autorizaciones deben valorarse por profesionales sanitarios cuando corresponda.

## Contrato de privacidad que no debe romperse
- Las respuestas del perfil viven **únicamente en estado de React**, durante la visita. No usar localStorage, sessionStorage, cookies, SDKs de analytics, URL query/hash, fetch, XHR, beacons, logs de servidor ni servicios externos con las respuestas de salud.
- La búsqueda de condiciones filtra texto en el navegador y no comunica términos buscados.
- El enlace de contacto prepara un mensaje **genérico**, sin añadir resultados del perfil ni nombres de diagnósticos.
- Hay control visible para reiniciar/borrar respuestas.
- Si se crea en el futuro un backend o CRM para guardar respuestas clínicas, antes deben existir aviso de privacidad suficiente, base jurídica apropiada, consentimiento **explícito** cuando sea aplicable, control de acceso, minimización, mecanismo de retirada y medidas de seguridad. No activar recolección silenciosa.
- No usar el scroll o visitas a páginas para inferir estados de salud.

## Referencias de criterios
- AEPD: categorías especiales / datos de salud, art. 9 RGPD.
- AEPD: consentimiento expreso, libre, informado y afirmativo.
- OMS: Directrices sobre actividad física y comportamiento sedentario (afecciones crónicas y discapacidad). La adaptación debe tener en cuenta capacidades y contraindicaciones.

## Restricción de producto
No afirmar que BAYONA atiende todas las patologías; ninguna lista es exhaustiva. Cada caso es particular y puede requerir derivación. Los apartados no acreditan una especialidad clínica.

## Acompañamiento contextual de navegación (fase del 18/10)
- `JourneyProvider` conserva **solo** el objetivo general y/o servicio que la persona elige de forma expresa mientras la aplicación React está abierta. El estado se pierde al recargar, no existe cuenta asociada ni un identificador de visitante.
- `ServicePersonalizer` permite elegir objetivo, prioriza una tarjeta y permite borrar la elección en cualquier momento. No usa tiempo de scroll, visitas ni clics pasivos para elaborar un perfil.
- `JourneyGuide` ofrece orientación relacionada con la página en pantalla, mediante reglas editoriales predefinidas, sin atribuir diagnósticos ni capacidades clínicas.
- El cuestionario `AdaptiveDiscovery` solo comparte su objetivo general con la guía **si el visitante pulsa voluntariamente el botón de transferencia**. El contexto de salud, la modalidad y demás respuestas nunca se comparten con la guía.
- No transmitir el estado del guía o del cuestionario a analytics, CRM, localStorage, cookies, query strings, enlaces de WhatsApp ni otras herramientas sin rediseño legal y de seguridad.


## 2026-10-18 · Diseño abierto / sin clic para orientarse (sustituye el flujo contextual previo)

- Los cinco objetivos y sus posibles servicios están **todos a la vista** en Inicio. No hay estado personalizado, ordenamiento de tarjetas ni inferencia de un objetivo por la navegación.
- La antigua guía flotante se sustituyó por notas editoriales siempre desplegadas dentro de las páginas pertinentes.
- El cuestionario progresivo se sustituyó por tres capítulos informativos simultáneos. No hay campos, botón de siguiente, diagnóstico, memoria de respuesta ni transmisión de datos.
- Las 12 familias de situaciones de salud presentan sus ejemplos de forma abierta. El buscador sigue siendo opcional, nunca imprescindible para leer.
- Los enlaces normales de navegación y contacto siguen existiendo, pero la orientación básica se puede comprender solo desplazándose.
- Se mantiene el límite profesional: la mención de una patología no equivale a prometer tratamiento ni indicar que esa persona es apta para ejercitarse.
