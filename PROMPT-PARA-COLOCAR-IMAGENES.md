# Prompt maestro para colocar las imágenes BAYONA

Copia y pega este texto completo en el agente que vaya a terminar la integración:

---

Trabaja sobre este proyecto BAYONA y termina de colocar las imágenes originales en toda la web.

## Fuentes que debes revisar primero

1. Lee `COMO-CAMBIAR-IMAGENES.md`.
2. Revisa el banco `public/images/bayona-generated/`.
3. Lee el índice `public/images/bayona-generated/README.md`.
4. Revisa todos los huecos declarados con `cinematicScene(...)` en `src/config/siteMedia.js`.

## Objetivo

Cada sección de cada página debe mostrar una imagen original de parkour profesional adecuada a su mensaje. Usa primero una imagen cuyo nombre coincida exactamente con el hueco. Si todavía no existe una imagen específica, selecciona la más apropiada entre los archivos `bank-*.png`, cópiala con el nombre exacto del hueco y conserva también el archivo original del banco.

## Reglas obligatorias

- No uses imágenes descargadas de páginas web ni bancos externos.
- No elimines ni sobrescribas imágenes sin comprobar qué sección las utiliza.
- No reutilices la misma imagen en varias secciones salvo que no exista ninguna alternativa; si sucede, indícalo al final.
- Mantén parkour técnico, profesional y creíble: precisión, recepción, vault, equilibrio, lectura del entorno, movilidad y progresiones seguras.
- Usa obstáculos bajos y técnica anatómicamente correcta; nada de acrobacias imposibles.
- Máximo dos personas por imagen. Si aparecen dos, deben ser un entrenador con una sola persona entrenada, salvo imágenes familiares del banco.
- Incluye diversidad real de edades: niños, adolescentes, adultos y adultos mayores según el contenido de cada sección.
- Evita gimnasios llenos, multitudes, grupos decorativos y personas irrelevantes al fondo.
- Mantén el estilo visual BAYONA: fotografía editorial realista, arquitectura mediterránea, ropa técnica negra o gris sin logos, negro/azul noche y luz ámbar.
- Las imágenes no pueden incluir texto, letras, logotipos ni marcas de agua.
- Mantén formato horizontal próximo a 16:9 y encuadre con espacio útil para los textos de la interfaz.
- No cambies textos, rutas, botones, estructura, componentes ni estilos de la web. Solo integra imágenes y los ajustes mínimos necesarios para que se muestren correctamente.

## Cómo integrar cada imagen

1. Obtén el nombre del hueco en el segundo argumento de `cinematicScene`, por ejemplo `community-group`.
2. La imagen final debe quedar en `public/images/bayona-generated/NOMBRE-DEL-HUECO.png`.
3. Añade exactamente `NOMBRE-DEL-HUECO` al conjunto `GENERATED_BAYONA_SCENES` de `src/config/siteMedia.js`.
4. Comprueba visualmente que el recorte funciona en escritorio y móvil y que las caras, manos y acción principal no quedan tapadas por el texto.
5. Si el encuadre necesita corrección, ajusta únicamente la posición de esa imagen en su sección; no rediseñes la página.

## Imágenes inclusivas ya disponibles

- `bank-child-precision-jump.png`
- `bank-child-supported-vault.png`
- `bank-teen-landing.png`
- `bank-senior-man-balance.png`
- `bank-senior-woman-step.png`
- `bank-grandfather-child-vault.png`

Úsalas donde el contenido hable de infancia, juventud, longevidad, comunidad, acceso, aprendizaje o progresión segura.

## Verificación final

1. Comprueba que todos los huecos de `cinematicScene(...)` tienen su PNG correspondiente y están incluidos en `GENERATED_BAYONA_SCENES`.
2. Busca rutas de imagen rotas y confirma que ningún archivo tiene tamaño cero.
3. Ejecuta `npm run build` y corrige cualquier error.
4. Recorre todas las páginas principales en escritorio y móvil.
5. Entrega un resumen con: número total de imágenes colocadas, huecos completados, imágenes del banco reutilizadas, cualquier hueco pendiente y resultado de la compilación.

## Futuro reemplazo del entrenador por Sebastián

Cuando Sebastián entregue fotos de referencia frontal, tres cuartos y perfil, genera nuevas versiones conservando su identidad y edad aproximada de 23 años. Sustituye cada archivo usando exactamente el mismo nombre para no modificar la estructura de la web. Mantén una imagen diferente en cada sección.

No te detengas tras unas pocas páginas: revisa y completa todas las páginas y todas las secciones hasta que no quede ningún hueco sin imagen original.

---
