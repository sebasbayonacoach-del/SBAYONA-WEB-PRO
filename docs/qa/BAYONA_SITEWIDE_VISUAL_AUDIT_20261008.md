# BAYONA — Auditoría visual transversal (8 octubre 2026)

**Rama de revisión:** `bayona-prime/visual-rescue-20261008`. No se debe fusionar sin revisión visual y validación de CI.

## Diagnóstico

Las rutas funcionan técnicamente, pero la experiencia visual **no estaba terminada**. La web combina demasiadas capas de estilos, varias redefinen colores de páginas que usan otras superficies. Las pruebas de build no cubrían legibilidad de texto contra el color efectivamente pintado.

Se inspeccionaron capturas de **12 rutas** con viewport móvil (390 px) y escritorio (1440 px), en modo **día y noche**, más capturas de capítulos internos. La auditoría detectó:
- Texto oscuro sobre capítulos de fondo negro en **Tienda** y **BAYONA+** al activar día.
- Cabecera o método con contraste invertido en las fichas de **planes**.
- Héroes con fotografía prevista pero ocultada por fondos opacos (About) o cubierta por un oscuro excesivo (Parkour, Community).
- En Parkour móvil, titulares cortados en demasiadas líneas y breadcrumb blanco sobre papel claro.
- Páginas muy largas: la visita móvil a Home ronda 11.800 px de altura y varias rutas editoriales superan 10.000 px. Longitud no equivale a valor.
- El preloader de marca aparece sobre la primera impresión en algunas rutas; revisar dependencia de assets y duración, sin eliminar arbitrariamente la carga de WebGL.
- Encabezados, imágenes y CTAs necesitan auditoría comercial, no solo corrección de CSS.

## Correcciones ya efectuadas en esta rama

| Área | Trabajo aplicado |
|---|---|
| Home | Hero diurno fotográfico y servicio editorial de cuatro caminos (PR #6 previo) |
| Servicios | Nombres y categorías coherentes, fotografías visibles, subcatálogo desplegable y profundidad de enlaces (PR #6 previo) |
| Tienda | El bloque «Encuentra lo que necesitas» recupera fondo marfil y tinta oscura en día |
| BAYONA+ | Las secciones oscuras recuperan titulares y textos legibles; cabecera diurna coordinada |
| Planes | Método oscuro con encabezados blancos y bloque de exclusiones claro con tinta oscura |
| Nosotros | Imagen de cabecera disponible en proyecto, colocada en el plano de fondo realmente visible |
| Parkour | Fotografía diurna existente, titular móvil más compacto, breadcrumb legible |
| Comunidad | Recuperación de fotografía editorial del hero en día |
| QA | Contratos de Playwright de navegación móvil transversal y contraste de superficies principales |

## Pendientes de dirección de arte y producto

Estos **no** se deben marcar como resueltos solo porque apruebe Playwright:

1. **Home**: revisar densidad, tiempo de primera interacción y coherencia narrativa de regalos, planes y conversión.
2. **Nosotros**: reemplazar visuales genéricos por material auténtico validado del entrenador y su trayectoria; revisar prueba social.
3. **Servicios / Parkour**: afinar la oferta, la geografía de atención presencial, la presentación individual y la credibilidad.
4. **Tienda**: fotos de cada producto, diferencias entre categorías y checkout; no presentar como comprable algo sin inventario real.
5. **BAYONA+**: unificar el lenguaje del demo y dejar explícito qué es concepto frente a función disponible.
6. **Comunidad**: revisar ritmo de secciones, acceso real, horarios y contenido verificable.
7. **Recursos**: condensar capítulos y comprobar acceso real a PDFs y formularios.
8. **FAQ, Mi cuenta, Planes y Checkout**: revisar textos, garantías, promesas, estados vacíos, errores y flujos completos.
9. **Todas**: responsive 390/768/1440, contraste día y noche, navegación por teclado, movimiento reducido, imágenes, enlaces, coste de carga y ausencia de scroll lateral.

## Criterios para cerrar

- Capturas aprobadas visualmente en móvil y escritorio, de día y de noche.
- Funciones y CTAs ejercitados en navegador hasta su destino real.
- Oferta y precios comprobados contra datos fuente; nunca inventar disponibilidad o resultados.
- Lint, build, unitarias y regresión Playwright completos.
- Revisión explícita del usuario **antes de merge o despliegue público**.
