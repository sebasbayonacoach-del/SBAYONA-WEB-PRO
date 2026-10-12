# BAYONA — auditoría visual completa y reset del sistema
**Fecha:** 12/10/2026
**Base:** versión oficial protegida `de50d0c6532b9e30d3446100795a8cfe30eddd1f`
**Rama de trabajo aislada:** `audit/visual-reset-20261012`

## Diagnóstico visual real

La auditoría se hizo con capturas de Inicio / mitad / final, en 1440×900 y 390×844, para:
Inicio, Nosotros, Servicios, Parkour, Comunidad, BAYONA+, Tienda, Recursos, FAQ y 404.

Problemas medidos antes del reset:

| Ruta | Escritorio aprox. | Móvil aprox. | Problema dominante |
|---|---:|---:|---|
| Inicio | 12.736 px | 15.327 px | ocho capítulos sobredimensionados y showroom largo |
| Nosotros | 12.459 px | 17.392 px | runway de testimonios/globo de casi 8.000 px en móvil |
| Servicios | 10.214 px | 10.406 px | comparador de planes mal repartido y cards gigantes |
| Parkour | 11.242 px | 11.416 px | escenas de casi 1.000 px cada una |
| Comunidad | 10.978 px | ~10.000 px | hero y calendario tratados como instalaciones de pantalla completa |
| BAYONA+ | 13.793 px | 15.035 px | concept deck y museo de dispositivos |
| Tienda | 13.323 px | 12.327 px | catálogo de más de 8.000 px y spans heredados |
| Recursos | 13.986 px | 11.872 px | revista/reto convertidos en scroll theatre |
| FAQ | 7.162 px | 8.316 px | cierre y categorías sobredimensionadas |

También se contaron **141 hojas CSS**. La acumulación de estilos era el principal problema:
cada nueva capa intentaba ganar a la anterior, creando incoherencias, huecos, pseudo-elementos
decorativos y comportamientos muy distintos entre escritorio y móvil.

## Nueva dirección

**BAYONA = editorial deportivo premium, humano y cálido.**

- Grafito para impacto.
- Papel cálido para respirar y dividir capítulos.
- Naranja únicamente como señal de acción.
- Fotografía grande y humana como protagonista.
- Montserrat para titulares; Inter para lectura.
- Máximo de contenido: 1240 px.
- Menos cajas, microetiquetas, bordes y numeración decorativa.
- Sin añadir JavaScript, WebGL, dependencias ni fuentes remotas.
- Mantener precios, productos, textos comerciales, rutas, formularios y analítica existentes.

## Arquitectura

Se parte de la versión oficial y se añade **un solo owner final**:

`src/styles/bayona-visual-reset-20261012.css`

Ese archivo carga después de `home-atelier.css`, a propósito. Las hojas antiguas siguen
conteniendo la mecánica de componentes, pero esta hoja es la única autoridad final de
presentación. El contrato de cascada fue actualizado para hacerlo explícito y testeable.

## Cambios por ruta

- **Global:** navegación 74 px, contenedor 1240 px, footer compacto, foco accesible.
- **Inicio:** cards 2×2, proceso compacto, planes legibles, recursos 3 columnas y lead en dos columnas.
- **Nosotros:** storytelling editorial; el globo/testimonios deja de ser runway kilométrico y pasa a tarjetas estáticas.
- **Servicios:** cards 2×2 y comparador 280 px + ficha principal; elimina pseudo-capa clara que destruía contraste.
- **Parkour:** progresión y método como capítulos compactos; escenas dejan de medir ~1.000 px.
- **Comunidad:** hero acotado, calendario/tier/social en grids legibles.
- **BAYONA+:** módulos compactos; concept deck simplificado; móvil elimina dispositivos redundantes.
- **Tienda:** cuatro columnas en escritorio, dos en móvil; cards y colecciones dejan de imponer spans gigantes.
- **Recursos:** hero/libros/reto/revista se convierten en biblioteca editorial; publicaciones compactas.
- **FAQ:** categorías directas, cierre y tarjetas de ayuda reducidas.
- **404:** limpia y funcional desde la base oficial.

## Seguridad

- La rama oficial y su tag no se tocan.
- El rediseño se construye en un worktree separado porque otra IA estaba editando
  `copia-para-mimo` simultáneamente.
- Antes de integrar, se compara el hash remoto para evitar sobrescribir cambios ajenos.
