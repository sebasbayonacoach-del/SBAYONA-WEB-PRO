# BAYONA / Nosotros · Recorrido visual corrective QA

La captura del usuario del 8/10/2026 mostraba el texto «Una historia de práctica...» comprimido en una columna de 34 px y una foto de fondo ampliada que cubría casi toda la ventana.

## Causa raíz
La estructura `.about-story-heading` tenía dos columnas (34 px + contenido), pero su primer elemento `.about-vertical-word` era ocultado por el diseño premium. El `<div>` textual quedaba colocado automáticamente en la primera columna. La capa escénica además usaba `background-size:cover` sobre una foto de primer plano y mucho padding superior. En escritorio la versión estática de `StickyStage` apilaba cuatro marcos gigantes.

## Cambios
- Se eliminó la pista ornamental fantasma; el texto cuenta con su propia columna de lectura amplia.
- La fotografía deja de cubrir el texto: se integra como figura editorial con proporciones controladas y pie descriptivo, ilustrativo, sin atribuir identidad real.
- El escenario recupera una composición sobria oscura con acentos naranja; mantiene legibilidad en modo día.
- El escenario desktop de años ocupa el ancho completo, no una cuarta parte de la rejilla anterior.
- Con movimiento reducido la cronología presenta cuatro hitos en una rejilla de dos columnas. En móvil se conserva la cronología de cuatro entradas legibles.

## Criterios de no regresión
`e2e/about-story-visual-regression.spec.js` verifica 390, 768, 1024, 1440 y 1700 px; foto cargada, título y párrafo con anchura correcta, sin overflow horizontal, y tamaños razonables de la sección. Verifica también el StickyStage normal y reducido.

La Home y la publicación pública no cambian en este commit. Desplegar únicamente una vista previa privada hasta aprobación editorial.
