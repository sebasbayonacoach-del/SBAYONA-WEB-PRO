# BAYONA WEB × Refero Styles — sistema editorial aplicado

**Fecha:** 12/10/2026 · **Rama de edición:** `copia-para-mimo`
**Base de seguridad inmutable:** `backup/BAYONA-WEB-OFICIAL-2026-10-11` (`de50d0c`).

## Qué es la referencia

[Refero Styles](https://styles.refero.design/) es una biblioteca de más de 2.000
sistemas visuales descritos para uso por IA; **no es una sola plantilla ni un tema
que pueda activarse íntegramente**. La adaptación toma patrones combinables de:

- [Brex — white concrete, single ember](https://styles.refero.design/style/b58d92f6-68a8-4358-8fc9-6ea58e6d483b):
  una sola señal de acción, rejilla 1200px, ritmo 48–80px, tarjetas contenidas,
  botones definidos y tipografía Inter comprimida.
- [Linear — midnight precision](https://styles.refero.design/style/90ce5883-bb24-4466-93f7-801cd617b0d1):
  estructura oscura, contraste y alineación.
- [Raycast — midnight command center](https://styles.refero.design/style/3b6a17f0-3bdf-418c-a95e-0b89e5a8b2f8):
  jerarquía por capas, foco claro, control de densidad.

Las recomendaciones de los ejemplos son **principios reinterpretados**, no una
copia de marcas, imágenes, textos, tipografías privadas ni diseños propietarios.

## Decisiones para BAYONA

| Dimensión | Norma aplicada |
|---|---|
| Identidad | Negro/grafito + brasa naranja cálida; conservar el modo día y la identidad BAYONA |
| Display | Titulares Montserrat existentes, jerarquía óptica, tracking compacto; no fuentes de pago |
| Cuerpo | Inter existente; longitud de lectura máx. 64ch y line-height 1.65 en textos de apoyo |
| Rejilla | Contenedores máx. 1280px, márgenes fluidos 20–64px |
| Espacio | Módulos públicos con ritmo 72–144px en escritorio y 60–92px en móvil |
| Tarjetas | Regla fina y fondo preexistente; menos sombras, señal naranja solo en interacción |
| Acciones | Botones e inputs con radios coherentes, área táctil de al menos 44px |
| Accesibilidad | Foco visible, texto equilibrado, `prefers-reduced-motion` y responsive |
| Conversión | Mantener embudo real: recursos gratuitos, valoración opcional y programas |
| Rendimiento | CSS puro; sin scripts, WebGL nuevo, blur añadido ni peticiones de fuentes externas |

## Integración

- Implementación: `src/styles/refero-editorial-system.css`.
- Importación en `src/main.jsx`, **antes** de las tres capas finales
  `ds-experience.css`, `ds-atelier.css` y `home-atelier.css`.
- Selectores circunscritos a `.ds-frame[data-experience-scope='brand']`.
  El laboratorio `/design-system` no recibe los cambios comerciales.
- Cada variable `--refero-*` referencia la paleta y tokens existentes de BAYONA.
- El componente comercial existente sigue siendo fuente de verdad para
  precios, checkout, legales, consentimientos y enlaces.
- No altera BAYONA APP, backend, autenticación ni rutas de Vercel.

## Lista de control previa a publicar

1. Ejecutar `npm run build`; asegurar que el generador de HTML produce las rutas.
2. Ejecutar `npx vitest run src/test/referoEditorialSystem.test.js
   src/test/experienceSystemContract.test.js`.
3. Inspeccionar `/`, `/programs`, `/shop`, `/resources`, `/community`
   en 375px y 1440px, modo día/noche y navegación con teclado.
4. Confirmar que el hero cinematográfico, las tarjetas con imagen y el formulario
   de recursos siguen operando.
5. Volver siempre a la etiqueta `web-oficial-20261011-pre-edicion-externa` si
   las ediciones posteriores degradan la experiencia.

**Regla Git:** la otra IA puede trabajar en `copia-para-mimo`.
Nunca editar, mover o borrar la rama `backup/BAYONA-WEB-OFICIAL-2026-10-11`
ni la etiqueta `web-oficial-20261011-pre-edicion-externa`.
