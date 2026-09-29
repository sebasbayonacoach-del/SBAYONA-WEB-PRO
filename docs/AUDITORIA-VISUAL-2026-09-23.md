# Auditoría visual BAYONA — 23 de septiembre de 2026

## Alcance

Auditoría de las 14 rutas públicas indexadas en la versión publicada de Netlify, observadas en un viewport de 700 × 699 px. Se revisaron jerarquía, ritmo vertical, densidad, elementos persistentes y consistencia tipográfica. No se cambió código.

## Veredicto

La identidad es fuerte y reconocible. El problema principal no es “falta de diseño”, sino falta de edición: muchas páginas mantienen la misma intensidad visual durante demasiado tiempo, combinan demasiados objetivos en un solo recorrido y acumulan controles fijos que tapan contenido.

La tipografía principal es más consistente de lo que parece: en las rutas observadas el H1 calculado es 46,72 px y el H2 36,48 px. La sensación de inconsistencia nace sobre todo de componentes secundarios con escalas propias, H3 que bajan hasta 17,92 px, uso muy frecuente de mayúsculas, diferentes anchos de línea y bloques que no comparten el mismo aire interno.

## Hallazgos prioritarios

### P0 — Demasiadas capas fijas tapan el contenido

En varias rutas aparecen simultáneamente navegación, raíl de misión, pase VIP, control de compartir, WhatsApp, asistente y la insignia de Netlify. En 700 × 699 px llegan a ocupar o cruzar el titular, el cuerpo y la llamada a la acción.

Acción recomendada: en anchuras inferiores a 900 px mostrar solo navegación y un CTA flotante. Pase, misión, compartir y asistente deben agruparse en un único botón o pasar al flujo normal de la página.

### P0 — Tres páginas son excesivamente largas

- Programas: 27.530 px y 18 secciones.
- Tienda: 23.804 px y 16 secciones.
- Recursos: 17.522 px y 18 secciones.
- Inicio: 21.280 px.

Acción recomendada: reducir entre 25 % y 40 % el contenido visible por ruta. Programas no debería contener a la vez segmentación por edad, explicación del método, cuatro fichas completas, comparación, servicios y configurador. Dejar la comparación resumida y enviar el detalle a cada página de plan. En Tienda, separar catálogo y configurador. En Recursos, usar categorías con expansión progresiva.

### P1 — El ritmo entre secciones es uniforme, no respirado

Inicio usa repetidamente 84 px arriba y abajo; Nosotros y Comunidad usan 64 px. Aunque no son valores pequeños, casi todos los bloques tienen una densidad y peso parecidos, por lo que el scroll se percibe continuo y apretado.

Acción recomendada: alternar tres ritmos:

- Sección principal: 128–160 px en escritorio, 88–112 px en tableta, 72–88 px en móvil.
- Sección de apoyo: 88–112 px en escritorio, 72–88 px en tableta, 56–72 px en móvil.
- Puente o CTA: 56–72 px, con mucho menos contenido.

Añadir además 32–48 px entre introducción y contenido, 24–32 px entre tarjetas y 16–20 px entre título y texto.

### P1 — La escala tipográfica necesita una sola autoridad

Propuesta de escala global:

- Display/H1: `clamp(2.75rem, 6vw, 6rem)`; línea 0,92–1,00.
- H2: `clamp(2.25rem, 4vw, 4rem)`; línea 1,00–1,08.
- H3: `clamp(1.35rem, 2vw, 2rem)`; línea 1,08–1,18.
- Lead: `clamp(1.05rem, 1.4vw, 1.3rem)`; línea 1,45–1,60.
- Body: 1rem–1,125rem; línea 1,55–1,70.
- Microtexto: 0,75rem–0,875rem; reservar mayúsculas y tracking para etiquetas, no para párrafos.

Limitar títulos a 10–14 palabras cuando sea posible y a 10–12 caracteres por línea visual en los displays más grandes.

### P1 — Falta una pausa visual después de cada argumento fuerte

Las páginas encadenan hero, manifiesto, tarjetas, tabla y CTA sin zonas de baja densidad. Introducir una pausa cada 2–3 secciones: imagen de ancho completo, frase breve, estadística, testimonio o transición con fondo limpio. Esa pausa debe aportar una sola idea, no otra tarjeta compleja.

## Revisión por ruta

1. `/` — **Necesita edición importante.** Buena entrada, pero 21.280 px y demasiadas decisiones en una sola página. El pase y los controles flotantes tapan texto y CTA.
2. `/about` — **Salud media.** Historia clara y 9 secciones, pero el hero queda cruzado por capas persistentes y el ritmo interno es demasiado uniforme.
3. `/app` — **Necesita simplificación.** 14.526 px y 13 secciones para un producto aún en desarrollo. Unificar concepto, mockups, lista de interés y estado en una narrativa más corta.
4. `/community` — **Necesita edición importante.** Diez bloques densos antes del cierre. Conservar hero, cómo se siente, pulso semanal, niveles y entrada; condensar el resto.
5. `/faq` — **Buena base con problemas de superficie.** Longitud razonable, pero el hero y sus categorías quedan invadidos por capas flotantes.
6. `/onboarding` — **La ruta más enfocada.** Una pantalla y una decisión clara. Corregir el carrusel horizontal que queda cortado y mantener este nivel de concentración como referencia.
7. `/parkour-academy` — **Salud media.** Mensaje fuerte, pero el titular pierde legibilidad por solapamientos. Separar mejor técnica, niveles, seguridad y CTA.
8. `/programs` — **Crítica.** 27.530 px. Es una página de descubrimiento, comparación, catálogo y configurador a la vez. Debe dividir responsabilidades.
9. `/resources` — **Crítica.** 18 secciones y demasiados recursos expuestos simultáneamente. Convertir en biblioteca navegable con categorías y destacados.
10. `/shop` — **Crítica.** 23.804 px; filtros sticky de 172 px en la anchura observada y recorrido de compra muy largo. Reducir sticky, agrupar productos y separar configuración.
11. `/plan/raiz` — **Salud media.** Hero claro y coherente, pero la ruta completa supera 12.000 px. Reducir repeticiones y llevar condiciones secundarias a acordeones.
12. `/plan/fuerza` — **Salud media.** Misma arquitectura sólida que RAÍZ; necesita menos bloques repetidos y más contraste entre beneficio, prueba y acción.
13. `/plan/rendimiento` — **Salud media.** Titular fuerte; simplificar el cuerpo y hacer la comparación con otros planes opcional.
14. `/plan/elite` — **Salud media.** La propuesta premium se entiende, pero el corte del título en móvil/tableta y la longitud debilitan la sensación de exclusividad.

## Plan de mejora recomendado

### Fase 1 — Sistema global

1. Crear tokens únicos para tipografía, separación de sección, separación interna, ancho de lectura y altura de controles.
2. Reducir los elementos fijos a un máximo de dos en móvil/tableta.
3. Definir tres plantillas de sección: protagonista, contenido y puente.
4. Limitar párrafos a 58–68 caracteres y titulares a un ancho máximo coherente.

### Fase 2 — Reducir contenido

1. Programas: resumen de planes + enlaces a cada plan; sacar el catálogo y configurador.
2. Tienda: catálogo primero; configurador en una ruta o paso independiente.
3. Recursos: destacados + filtros; ocultar el resto hasta que el usuario elija categoría.
4. Inicio: eliminar argumentos repetidos y dejar un CTA principal por tramo.

### Fase 3 — Pulido por ruta

Revisar recorte de imágenes, longitud de títulos, contraste, estados sticky, separación de tarjetas y CTAs. Validar en 390, 768, 1024 y 1440 px.

## Accesibilidad y límites

Desde las capturas se observan riesgos de contenido tapado, lectura interrumpida, objetivos táctiles compitiendo y titulares partidos de forma poco natural. La estructura semántica incluye encabezados y enlaces descriptivos en muchas rutas, lo cual es una fortaleza.

Esta revisión no demuestra cumplimiento WCAG completo. Faltan pruebas específicas de teclado, foco visible, contraste medido, zoom al 200 %, lectores de pantalla, reducción de movimiento y validación de formularios.
