# BAYONA PRIME — Workbook, previews y cohete 3D (2026-10-04)

## Alcance implementado

1. ProofProcessStage: cuaderno editorial con portada clara, tres láminas en profundidad, una fotografía local integrada, capítulos CONTEXTO / PLAN / AJUSTE y nota «DOCUMENTO ILUSTRATIVO · NO EVIDENCIA DE RESULTADOS». En móvil la maqueta aparece una sola vez, sin repetir la foto sobre cada bloque; texto semántico conservado sin duplicar encabezados accesibles.
2. PreviewIntentExperience: sistema centralizado de previsualizaciones de flechas y CTAs con destinos reales, panel en hover y focus en escritorio; hoja accesible en móvil, cierre/Escape, foco restituido, scroll bloqueado y enlace definitivo. Rutas cubiertas: onboarding, programas, plan, recursos, comunidad, academia, tienda, historia, acceso, app, FAQ y checkout.
3. FlightCraft3D: objeto espacial original tridimensional procedimental en React Three Fiber y Three.js: casco, cono, ventanilla, tres aletas, tobera, luz metálica y escape; se coloca sobre la trayectoria de scroll. Se carga con React.lazy cuando está cerca de la pantalla y tras comprobar soporte WebGL. Sin WebGL se mantiene una placa editorial legible. En movimiento reducido queda el modelo quieto.

## Límites

No se modificaron precios, datos, planes, pedidos, políticas, producción ni pruebas comerciales. No se añadieron dependencias; reutiliza las existentes. Las previsualizaciones describen las rutas pero no fingen una descarga ni una app que aún no exista.

## Pruebas

- 18/18 pruebas enfocadas de Home y contratos tras los cambios iniciales.
- 13/13 pruebas E2E de workbook, enlaces y paneles, accesibilidad móvil, 3D real y auditoría de imágenes en 390/726/1440.
- La build inicial fue exitosa, con aviso conocido de tamaño vendor-three. Se verificará build final, suites completas, lint y preview compilada antes de integrar.

Trabajo aislado en bayona-prime/interactive-preview-3d-20261004 destinado al PR #1; main y producción no se tocarán.

## Estado final tras el reinicio — 2026-10-05

El brief posterior sustituyó las escenas orbitales de método y beneficios por
fotografía a pantalla completa. El componente original `FlightCraft3D.jsx` se
conserva en `docs/piezas-de-copias-viejas/`, fuera del código de producción y sin
importadores. La home tampoco monta el cycler de objetos sobre las fotografías;
las reglas de las demás rutas se mantienen. La descripción del cohete arriba
corresponde a la iteración anterior.

La home final usa `home-photographic.css` para método, beneficios, proceso,
comunidad y las cuatro piezas del kit. `PhotographicChapter.jsx` y
`home-luxury-conversion.css` dan continuidad a acompañamiento, personalización y
cierre. Los enlaces y el configurador conservan sus destinos y datos.

Vista previa compilada: http://127.0.0.1:4285/. Servicio local de usuario
`bayona-web-preview.service`, habilitado para arrancar al iniciar sesión;
configuración en `~/.config/systemd/user/bayona-web-preview.service`. Sirve el
`dist` de este checkout y escucha únicamente en localhost. Para actualizarla
tras futuros cambios: `npm run build`. Para detenerla:
`systemctl --user stop bayona-web-preview.service`.

Verificación final: 21/21 pruebas E2E de home, kit, configurador, enlaces,
movimiento reducido y ausencia de WebGL; build correcta, 112 archivos de tests aprobados
(784 pruebas aprobadas y una omitida), lint sin errores. Persisten avisos de
lint y tamaño del chunk de Three.js. La preview compilada se comprobó a 390 y
1440 px: HTTP 200, sin errores de página, imágenes rotas ni desbordamiento
horizontal. Las capturas de acompañamiento, personalización y cierre se
revisaron visualmente en ambos tamaños.

La prueba `preview-intent-and-photography.spec.js` protege las vistas previas y
la lectura del método incluso sin soporte WebGL. La auditoría espera a que
termine la pantalla de carga antes de capturar el hero.

Trabajo conservado en `bayona-prime/interactive-preview-3d-20261004`.

## Estado oficial — sesión «Reanuda la tarea web» (2026-10-05)

Esta es la variante que el dueño identificó como **la oficial con teléfonos**. El recorrido final mantiene un smartphone grande con cinco mensajes y entrada narrativa al método; fotografía a pantalla completa entre capítulos; biblioteca gratuita con cuatro piezas descargables; ocho PDF reales (cuatro recursos y cuatro folletos de plan); previews de planes en vídeo; y cierre con dossier + formulario local de punto de partida. La sesión posterior «Termina» trabajó en otro repositorio y no forma parte de esta entrega.

Validación final antes de Git:
- build Vite: exit 0;
- Vitest completo: 112 archivos, 784 pruebas correctas, 1 omitida, 0 fallidas;
- Playwright final: 21/21 pruebas correctas en 390/726-768/1440 px, movimiento normal/reducido y ausencia de WebGL;
- ESLint: 0 errores (844 advertencias preexistentes/no bloqueantes);
- preview compilada 127.0.0.1:4285: HTTP 200, teléfono presente a 390/1440, formulario visible, sin overflow, imágenes rotas ni errores JS;
- ocho documentos en public/downloads/bayona-editorial comienzan con %PDF-.

No se desplegó producción ni se modificó main. La entrega se publica mediante las ramas de revisión.
