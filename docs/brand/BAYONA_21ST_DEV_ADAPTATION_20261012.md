# BAYONA × 21st.dev — capa interactiva 2026-10-12

**Rama:** `copia-para-mimo` · **Respaldo oficial:** `backup/BAYONA-WEB-OFICIAL-2026-10-11` (commit `de50d0c`).

## Referencias seleccionadas

21st.dev es una biblioteca de componentes y plantillas, no un único diseño global. Se aplican dos patrones de su comunidad:

- [Spotlight Card](https://21st.dev/blog/react-spotlight-effect-components): una luz suave que sigue el ratón mediante solo dos variables CSS. El artículo recomienda una única escucha delegada y evitar `setState` por fotograma.
- [Shimmer Button](https://21st.dev/community/components/explore/shimmer-button): brillo ocasional en una acción prioritaria, adaptado aquí a los tonos cálidos de BAYONA.

No se importan componentes remotos, código de terceros, librerías extras, estilos propietarios, imágenes ni marcas de terceros.

## Implementación

- `src/components/home/spotlightPointer.js`: actualiza las coordenadas del puntero mediante un único manejador por rejilla, sin re-renderizar React.
- `src/pages/Home.jsx`: aplica spotlight en los cuatro servicios y los tres recursos gratuitos, preservando destinos, contenido y analíticas.
- `src/components/PremiumRouteChrome.jsx`: elimina únicamente los siete listeners de spotlight antiguos en Home para no duplicar el nuevo efecto. Las demás rutas conservan su comportamiento.
- `src/styles/21st-community-interactions.css`: gradiente progresivo en escritorio oscuro y barrido único al pasar el cursor o dar foco al CTA del hero; visual estable en móvil, modo día y reduced-motion.
- `src/main.jsx`: importa estilos nuevos antes del trío de estilos propietarios `ds-experience`, `ds-atelier`, `home-atelier`, conservando sus contratos.
- `src/styles/bayona-visual-unity.css`: exceptúa **solo** a las tarjetas de spotlight del bloqueo antiguo de fondos en pseudo-elementos; el resto del diseño permanece protegido.

## Criterios de aceptación

1. Cuatro servicios y tres recursos gratuitos sin duplicados ni cambiar la captación.
2. Solo una escucha por rejilla; no usar eventos globales ni actualizaciones de estado React para el puntero.
3. CSS decorativo sin impedir clics (pseudo-elementos `pointer-events: none`).
4. Nada de imágenes externas, animaciones permanentes ni cambios en la app BAYONA.
5. Comprobar home en modo día/noche, anchos 375px y 1440px, y `prefers-reduced-motion`.
6. Verificar build, pruebas de componentes e integridad de GitHub. `main` y respaldo oficial intactos.
