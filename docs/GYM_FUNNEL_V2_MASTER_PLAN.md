# BAYONA — GYM FUNNEL V2 MASTER PLAN

Fecha: 7 octubre 2026
Rama: `bayona-prime/gym-funnel-v2-20261007`
Base estable: `bayona-prime/shop-unified-20261004`

## 1. Objetivo

Transformar BAYONA de una experiencia digital extensa, abstracta y fragmentada en una web de gimnasio/entrenamiento premium, sencilla de entender, visual, comercial y orientada a conversión.

La experiencia debe responder en segundos:
1. Qué es BAYONA.
2. Qué puedo contratar.
3. Cuál servicio me conviene.
4. Cuánto cuesta.
5. Qué recibo gratis.
6. Cómo dejo mis datos.
7. Cómo agendo.
8. Cómo compro.

## 2. Referencias estudiadas

### Bodytech
Patrones a adoptar:
- lenguaje directo de fitness/gimnasio;
- categorías comerciales claras;
- productos con imagen como protagonista;
- precio, disponibilidad y acción rápida visibles;
- tienda organizada por categorías y filtros;
- promesas comerciales breves;
- navegación reconocible y sin nombres conceptuales que obliguen a aprender el sitio.

### Trainingym
Patrones a adoptar:
- propuesta de valor en una frase;
- beneficios concretos antes de explicar tecnología;
- acción principal visible;
- captación/asesoría como siguiente paso;
- bloques breves y escaneables;
- producto explicado desde el resultado operativo.

### Regla BAYONA
Inspiración estructural, no copia visual. Mantener negro/grafito/blanco + naranja/amanecer, identidad BAYONA y un tono premium humano.

## 3. Diagnóstico actual

### Problemas principales
- Home excesivamente larga.
- Demasiados capítulos que explican ideas parecidas.
- “Programas”, “servicios”, planes, extras y configurador aparecen en diferentes momentos y generan repetición.
- Navegación agrupada por conceptos internos (“Recorrido”, “Ecosistema”, “Decidir”) en lugar de necesidades del cliente.
- Menú desplegable móvil demasiado pequeño y con densidad visual pobre.
- Gamificación global (bonus, universo, ribbon, companion, etc.) compite con el objetivo comercial.
- Onboarding de “bienvenido a BAYONA” funciona como una experiencia aparte y no como embudo de ventas simple.
- Tienda tiene catálogo y medios registrados, pero las tarjetas actuales priorizan iconografía sobre fotografía.
- Demasiadas acciones diferentes: entrar, recorrer, decidir, comunidad, app, recursos, configurar, WhatsApp.
- El visitante tiene que aprender BAYONA antes de poder comprar BAYONA.

## 4. Arquitectura nueva

### Navegación principal
- Inicio
- Servicios
- Parkour
- Tienda
- Recursos
- Nosotros

Acciones persistentes:
- CTA principal: EMPIEZA GRATIS
- CTA secundario: WhatsApp
- Carrito solo cuando exista contexto de tienda.

### Servicios
La ruta `/programs` se conserva por compatibilidad técnica, pero públicamente se llama “Servicios”.

Dentro:
1. Entrenamiento online.
2. Entrenamiento presencial.
3. Membresías de acompañamiento.
4. Sesiones 1:1.
5. Evaluación y planificación.
6. Movilidad y recuperación.
7. Parkour / rendimiento técnico.
8. Servicios complementarios.

Nunca volver a mostrar “Programas” como nombre de navegación.

## 5. Home nueva — máximo 7 bloques

### Bloque 1 — Hero
Pregunta que responde: “¿Qué es esto?”
- Fotografía/vídeo de entrenamiento real.
- Titular máximo 8-10 palabras.
- Subcopy máximo 2 líneas.
- CTA: EMPIEZA GRATIS.
- CTA secundario: VER SERVICIOS.
- Promesa de bienvenida: “Completa tu recorrido y recibe tus recursos de inicio.”

### Bloque 2 — Servicios
Pregunta: “¿Qué puedo hacer aquí?”
3-4 tarjetas grandes con imagen:
- Entrenamiento personal.
- Entrenamiento online.
- Parkour y rendimiento.
- Recuperación / movilidad.

Cada tarjeta:
- una frase;
- una imagen;
- un CTA.

### Bloque 3 — Cómo funciona
Pregunta: “¿Qué pasa si empiezo?”
3 pasos:
1. Déjanos tus datos.
2. Hacemos una valoración inicial.
3. Recibes tu ruta, tus recursos y puedes agendar.

### Bloque 4 — Planes
Pregunta: “¿Cuánto cuesta?”
- mantener los planes canónicos;
- mostrar comparación simple;
- precio y principal diferencia primero;
- detalle bajo demanda;
- sin repetir todos los servicios.

### Bloque 5 — Prueba
Pregunta: “¿Por qué confiar?”
- experiencias/testimonios verificados;
- metodología en una sola línea;
- ningún carrusel interminable.

### Bloque 6 — Regalos
Pregunta: “¿Qué recibo antes de pagar?”
Mostrar exactamente:
- guía primera semana;
- workbook 30 días;
- dossier punto de partida.
CTA: RECIBIR MIS RECURSOS.

### Bloque 7 — Captación
Pregunta: “¿Qué hago ahora?”
Formulario corto:
- nombre;
- email o WhatsApp;
- objetivo opcional.
Tras enviar:
- confirmación;
- descarga de recursos;
- botón agendar valoración;
- botón ver servicios.

## 6. Embudo

### Entrada
Hero -> “Empieza gratis”

### Captura
Nombre + contacto.

### Valor inmediato
Recursos descargables visibles inmediatamente.

### Agenda
Botón “Agendar valoración” abre el canal confirmado disponible.

### Consideración
Servicios / planes.

### Compra
Checkout o WhatsApp según servicio.

### Seguimiento
Lead queda en almacenamiento local y Supabase cuando está disponible.

## 7. Menú móvil

Debe ser una pantalla completa, no una tarjeta pequeña.

Requisitos:
- 100dvh;
- ancho total;
- tipografía de navegación grande;
- 5-6 destinos máximo;
- números o microetiquetas solo si ayudan;
- CTA enorme abajo;
- contacto rápido;
- sin “Recorrido / Entrenar / Ecosistema / Decidir”;
- carrito separado;
- fondo fotográfico/gradiente de gimnasio;
- cierre grande y evidente.

## 8. Eliminaciones globales

Retirar del recorrido público:
- ArrivalBonusCard;
- JourneyRibbon;
- UniverseScaleBadge;
- UniverseScaleSights;
- GuideCompanion;
- ShareInvite automático;
- NextChapter automático;
- cualquier bienvenida gamificada global;
- cualquier texto de “universo”, “mundo”, “desbloqueo” o “misión” que no represente literalmente el servicio.

Mantener:
- WhatsApp;
- consentimiento;
- navegación;
- footer;
- SEO;
- rutas actuales por compatibilidad;
- accesibilidad.

## 9. Tienda

### Prioridad
Volver a fotografía de producto/uso como elemento principal.

Cada tarjeta:
- imagen 4:5;
- nombre;
- categoría;
- precio;
- selector de variante cuando exista;
- añadir al carrito;
- WhatsApp secundario.

### Categorías públicas
- Ropa
- Calzado
- Equipamiento
- Recuperación
- Nutrición

Las colecciones narrativas Origins/Movement/Strength/Recovery pueden sobrevivir como filtros secundarios, no como estructura principal.

### Limpieza
Eliminar de la tienda:
- bloques de servicios que repiten Servicios;
- explicaciones largas;
- procesos editoriales que no ayudan a elegir producto.

## 10. Audiovisual

Dirección:
- fotografía humana de gimnasio primero;
- vídeos cortos sin audio/autoplay agresivo;
- imágenes a sangre;
- menos 3D decorativo;
- texto sobre imagen con contraste fuerte;
- transiciones rápidas;
- motion reducido en móvil;
- CTA siempre visible sin tapar contenido.

Hero:
- atleta real;
- luz cálida lateral;
- negro/gris profundo;
- naranja solo como acento;
- sensación “gym premium”, no “metaverso”.

## 11. Copy

### Evitar
- mundos;
- universo;
- recorrido como metáfora central;
- demasiadas frases filosóficas;
- “ecosistema”;
- “decidir” como sección;
- “programas” como categoría principal;
- párrafos de más de 3 líneas.

### Preferir
- entrena;
- fuerza;
- rendimiento;
- movilidad;
- acompañamiento;
- sesión;
- plan;
- entrenador;
- evaluación;
- agenda;
- empieza;
- recursos;
- tienda.

## 12. Métricas de éxito

- Home <= 7 bloques principales.
- Menú <= 6 destinos.
- Primer CTA visible sin scroll.
- Servicios entendibles en < 10 s.
- Formulario alcanzable desde hero en 1 acción.
- Recursos obtenibles en <= 2 acciones.
- Planes alcanzables en <= 2 acciones.
- Tienda con imagen en 100% de tarjetas cuando haya media.
- Cero duplicación “programas/servicios” en Home.
- Cero widgets de gamificación global.
- Cero overflow horizontal 390/768/1440.
- Reduced motion funcional.
- Build y tests críticos en verde antes de merge.

## 13. Orden de ejecución

Fase A — shell:
1. menú desktop;
2. menú móvil fullscreen;
3. footer;
4. eliminar gamificación global.

Fase B — Home:
5. reemplazar Home por 7 bloques;
6. integrar captación;
7. integrar regalos;
8. integrar planes sin redundancia.

Fase C — Servicios:
9. renombrar públicamente Programs -> Servicios;
10. simplificar página;
11. separar categorías.

Fase D — Tienda:
12. restaurar imágenes;
13. reordenar categorías;
14. reducir texto;
15. mejorar card/cart.

Fase E — embudo:
16. LeadMagnet;
17. éxito con recursos + agenda;
18. CTA coherente en todo el sitio.

Fase F — QA:
19. responsive;
20. accesibilidad;
21. build;
22. tests críticos;
23. preview;
24. comparación con versión base;
25. merge solo después de revisión visual.
