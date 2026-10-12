# BAYONA / DISEÑO INMERSIVO 2026-10-12

**Rama editable:** `copia-para-mimo` · **Oficial intacta:** `backup/BAYONA-WEB-OFICIAL-2026-10-11` (`de50d0c`).

## Tres fuentes, tres aportaciones verificables

- [Refero Styles](https://styles.refero.design/): tipo editorial, composición de grandes titulares,
  dirección de lectura, rejilla proporcional, fondos sobrios y una señal de acción.
- [21st.dev](https://21st.dev/community/components): patrones funcionales de hero,
  tarjetas de servicio y navegación, refinados para React/Vite sin dependencias nuevas.
- [404s.design](https://www.404s.design/): galería de errores creativos; inspira
  **una página 404 original** con composición monumental y orientación a una nueva ruta.
  Referencias editoriales: BOC Studio (tipografía grande), Pensatori Irrazionali
  (interacción y juego sutil) y James Walsh Studio (personalidad visual).
  No se copian las obras de otros estudios.

## Cambios visuales observables

**Inicio**
- Retícula cinematográfica con fotografía existente y gran titular. Se elimina doble
  padding entre hero y su contenedor, que empujaba CTA fuera del primer pantallazo.
- Coordenadas de marca en el hero.
- **Nueva franja editorial de papel cálido** tras el hero, que conecta con cuatro caminos.
- Cuatro tarjetas de servicio reciben cifras tipográficas grandes y mejor jerarquía.
- Listas de confianza y recursos mejor delimitados.

**404**
- Experiencia inmersiva separada del tema día/noche: 404 trazado, fondo grafito
  y brújula orbital CSS con tres nodos.
- Cuatro rutas de recuperación reales, ruta solicitada legible, volver al inicio y
  WhatsApp. Respeta `RouteSeo` noindex, accesibilidad y `prefers-reduced-motion`.
- Nada de webfonts remotas, WebGL ni animaciones perpetuas si motion reducido.

**Capítulos**
- Nosotros / Tienda / Comunidad / Recursos / BAYONA+ / Parkour:
  numeral editorial específico, canto naranja en el hero y componentes
  diferenciados por propósito.
- No toca la APP de clientes, ni altera las ofertas, precios, pagos, registros
  de lead, consentimiento, rutas comerciales ni publicidad.

## Ubicación y mantenimiento

- `src/pages/Home.jsx`, `src/styles/home-immersive-pass-20261012.css`.
- `src/pages/NotFound.jsx`, `src/styles/not-found-experience-20261012.css`.
- `src/styles/bayona-chapter-atlas-20261012.css`, importación en
  `src/main.jsx` **antes** del trío final `ds-experience`, `ds-atelier`,
  `home-atelier`; la página 404 importa su CSS por ruta.
- Pruebas: `e2e/bayona-immersive-design-20261012.spec.js`.

## Validación / rollback

1. `npm run build`
2. `npx vitest run src/pages/Home.contract.test.jsx src/pages/NotFound.test.jsx src/test/experienceSystemContract.test.js` (o batería disponible).
3. `npx playwright test e2e/bayona-immersive-design-20261012.spec.js`
4. Inspección visual a 390 y 1440 píxeles, tema claro/oscuro y reducción de movimiento.
5. Restauración siempre desde la rama `backup/BAYONA-WEB-OFICIAL-2026-10-11` o etiqueta oficial.

**Nota:** 404s.design es una galería de errores, no una colección de diseños
aplicable indiscriminadamente a toda la web. Se ha utilizado donde aporta valor real.
