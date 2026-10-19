# BAYONA PRIME · Web cinematográfica y lanzamiento de BAYONA App

## Objetivo de esta fase

Hacer que el sitio editorial sea la entrada real a BAYONA App y también a las ofertas de entrenamiento, con un lenguaje visual cinematográfico y verificable. No sustituir la aplicación existente ni su autenticación.

## Mejoras implementadas

- **/app rediseñada:** nueva presentación premium `AppLaunch.jsx` con cinco escenas (portada, recorrido, dos espacios, instalación, acción final), fotografías propias del banco de BAYONA y capturas auténticas del selector Mi App / Coach Studio.
- **Una entrada PWA real:** los enlaces abren `/mi-app/index.html?source=pwa`. No muestran descargas APK falsas. La web sigue permitiendo entrar sin instalar.
- **Instalación informada:** pasos adaptados al navegador Android, a Safari iPhone/iPad y a ordenador. El ancla `/app#instalar-app` funciona al cargar una ruta React diferida.
- **Inicio orientado al producto:** la presentación `BayonaLiveAppShowcase` se muestra después del descubrimiento inicial y antes del catálogo de servicios, sin duplicarla.
- **Un mismo lenguaje en las páginas públicas:** `AppBridgeCinematic` añade un cierre fotográfico, un mensaje específico y un acceso directo a Mi App desde Nosotros, Servicios, Movimiento adaptado, Parkour, Comunidad, Recursos, Preguntas y Tienda.
- **Móvil despejado:** el HUD de misión tiene ahora solo una franja inferior de unos 35 px; es decorativo y no intercepta clics. En escritorio conserva su formato original.
- **Confianza:** los tres PDF de Recursos ahora se descargan directamente sin correo ni formulario. Se actualizó el texto del menú móvil para no exigir datos.
- **SEO:** descripción pública de /app actualizada para destacar el producto web instalable.

## Lo que existe y lo que NO

- Existe la aplicación web integrada bajo `/mi-app/`, su `manifest.webmanifest`, iconos y un service worker con gestión de instalación en la propia app.
- El acceso de usuario y Coach Studio depende de los permisos y del estado de autenticación del producto existente. Este rediseño NO modifica sus archivos.
- No existe en esta rama una APK/AAB pública verificada ni una distribución aprobada en Google Play o App Store. La PWA puede instalarse si el navegador y el contexto HTTPS lo permiten.
- No están desplegados en producción los cambios de esta rama. El staging y despliegue dependen de acceso autorizado a Vercel.
- Stripe sigue en entorno de prueba sin confirmar cobros reales, permisos de acceso pagado ni webhook transaccional persistente.

## Comprobación

- `npm run build` ejecuta verificadores de no filtración de Stripe Sandbox y ausencia del motor 3D en el conjunto estático inicial.
- `npx playwright test e2e/bayona-app-launch-conversion-20261019.spec.js`: prueba las rutas a la app, las capturas reales, el manifest, el enlace PWA, las ocho transiciones editoriales, el orden de Inicio y la detección Android/iPhone.
- `npx playwright test e2e/bayona-prime-global-20261018.spec.js e2e/bayona-game-missions-20261019.spec.js`: mantiene la identidad global, progresión, legibilidad y móviles.
- `npx vitest --run src/pages/Resources.test.jsx src/pages/Home.test.jsx src/components/Layout.nav.test.jsx`: coherencia de descargas, navegación y web.

## Pasos pendientes de disponibilidad comercial

1. Conectar una identidad de Vercel con acceso de Editor/Owner al proyecto correcto, validar dominio y publicar una **preview** no productiva para aceptación.
2. Verificar manualmente autenticación Google y permisos reales de la PWA en móvil y escritorio.
3. Si se desea APK nativa, generar, firmar y publicar el binario Android por un proceso separado. No presentarlo como descargable antes de comprobar firma y URL.
4. Configurar pagos en una cuenta Stripe real, fiscalidad, condiciones y webhook idempotente antes de activar la contratación automática.

**Política:** separar en todos los canales “puedes abrir la app web” de “APK disponible” y “servicio de pago ya activado”.
