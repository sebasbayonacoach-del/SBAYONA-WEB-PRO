# BAYONA / ropa — proveedores y sistema comercial
**Investigación:** 12 de noviembre de 2026. **Rama:** `feature/bayona-apparel-sourcing-20261112`.

> **Estado importante:** Los contactos y modelos son **candidatos**, no acuerdos de distribución, pedidos, precios confirmados ni inventario reservado. La tienda pública y los cobros no se han actualizado. El ordenador local `pop-os` estaba desconectado; estos cambios están guardados en GitHub en una rama aislada, **sin compilación E2E local ni despliegue**.

## Modelo de negocio elegido

BAYONA vende una **colección cápsula de ropa de movimiento**, no un bazar multicategoría. Prioridad inicial: camiseta Origins, hoodie Origins, gorra BAYONA, tank top, short técnico y sudadera Recovery. Límite comercial inicial: **6 modelos**, colores negro/blanco/hueso, logo BAYONA original, variantes de talla reducidas. Primero bajo demanda; posteriormente acuerdos con taller español para 20–50 unidades de modelos probados. No comprar stock de 18 referencias.

La web actual en esta rama incluye 14 referencias textiles (6 de entrenamiento + 8 lifestyle) y 4 de calzado con etiquetas de precio originalmente en COP. La nueva sección `ApparelLaunch` muestra seis diseños como **prelanzamiento**, sin inventar PVP, proveedor confirmado o stock, y permite consultas reales por WhatsApp. El proveedor de cada SKU queda registrado internamente en `src/config/apparelSourcing.js`. El catálogo general existente sigue siendo **consultivo**, no un pedido pagado con stock automático. Para convertirlo en venta automática deben conectarse las variantes reales de Shopify y su proveedor.

## Proveedores verificables por función

| Proveedor | Función / correspondencia | Operativa y limitaciones | Contacto / documentación |
|---|---|---|---|
| **Printful** | POD: camiseta, top, leggings, pantalón, gorra, calcetín normal; también zapatilla casual | Sin pedido mínimo; centro en Barcelona, pero **no todos los artículos se fabrican allí**. En zapatillas sus plazos publicados pueden ser de 17–22 días hábiles. Ver disponibilidad y coste por SKU. | https://www.printful.com/es/print-on-demand-espana |
| **Stanley/Stella** | Camiseta Origins Creator 2.0, manga larga Creator 2.0, hoodie Cruiser 2.0, sudadera Changer 2.0 | Prendas en blanco premium y canal B2B; no equivale a impresión y envío directo sin atelier o acuerdo. Declara suministro B2B sin mínimo para blancos; personalización debe cotizarse. | https://stanleystella.com/es-eu/bu/bu-b2b |
| **Muchacho Studio** | Personalización de prendas Stanley/Stella | Distribuidor oficial en Girona; consulta serigrafía, bordado, DTF y muestras, mínimos y logística a Gandía. | https://muchachostudio.com/ · hola@muchachostudio.com |
| **Roly** | Short técnico DORTMUND, camisetas de tirantes y cortavientos | Proveedor español de prendas técnicas; confirmar revendedor, precio neto, mínimo, stock por talla, personalización. | https://roly.eu/es/shop · https://roly.eu/es/model_PA6688 |
| **8Merch** | POD Stanley/Stella como alternativa europea | Distribuidor oficial, atención por presupuesto; preguntar capacidad de dropshipping uno a uno y Shopify. | https://stanleystella.8merch.com/en/ · services@8merch.com |
| **Printify** | Calzado casual, chanclas, shorts, leggings y accesorios | Marketplace de fábricas. País de fabricación y plazo varía por producto, algunos zapatos salen de China: **no afirmar producción local ni performance técnico**. | https://printify.com/custom-shoes/ |
| **Gelato** | Segundo proveedor POD para validar alternativas en Europa | Producción y tecnología por socio; no inferir que cada artículo se imprime en España. | https://www.gelato.com/integrations |

## Matriz de los 18 productos reales del catálogo

| SKU BAYONA | Proveedor primero | Alternativa | Estado previo a venta |
|---|---|---|---|
| tank-top-performance | Printful tirantes | Roly / taller | Cotización + muestra |
| short-tecnico-bayona | Roly DORTMUND 6688 | Printful shorts | Cotización + muestra |
| legging-pro-mujer | Printful leggings | Roly / Printify | Verificar opacidad y tallaje |
| camiseta-manga-larga | Stanley/Stella Creator 2.0 Long Sleeve | Muchacho Studio | Cotizar impresión y talla |
| top-deportivo-mujer | Printful top deportivo | Printify | Validar soporte y composición |
| camiseta-compresion | Fabricante técnico pendiente | Roly como camiseta técnica, **no compresión** | **Bloqueado** hasta verificar compresión |
| hoodie-origins | Stanley/Stella Cruiser 2.0 | Printful / Muchacho | Prioridad P1 |
| hoodie-premium | Stanley/Stella Cruiser 2.0 / 8Merch | Muchacho | Diferenciar acabado real y pedir muestra |
| camiseta-origins | Stanley/Stella Creator 2.0 | Printful / Muchacho | Prioridad P1 |
| pantalon-jogger-premium | Printful jogger | Stanley/Stella pantalones | Muestra y dimensiones |
| gorra-bayona | Printful gorra bordada | Roly / Muchacho | Prioridad P1 |
| chaqueta-windstopper | Roly cortavientos | Printify | **Bloqueado** como “Windstopper” si no hay derecho/tecnología verificables; renombrar a cortavientos |
| sudadero-recovery | Stanley/Stella Changer 2.0 | Printful / Muchacho | Vender como prenda lifestyle, no terapia |
| calcetines-compresion-pack-3 | Printful calcetín normal | Fabricante compresión específico | **Bloqueado** para promesa de compresión; alternativa sería pack de calcetines normales |
| zapatillas-move | Printful sneaker casual | Printify | Muestra; solo estilo casual |
| zapatillas-trainer-pro | Fabricante técnico pendiente | No sustituir por sneaker casual | **Bloqueado** rendimiento |
| zapatillas-parkour-free | Fabricante técnico parkour pendiente | Ninguna opción performance validada | **Bloqueado**: prueba de agarre y seguridad |
| chanclas-recovery | Printify chanclas | Printful sandalias | Solo producto casual, sin beneficio clínico |

## Siete decisiones para vender de verdad

1. **Una colección, no 18 promesas:** publicar 3 prendas al principio (Camiseta Origins + Hoodie Origins + Gorra BAYONA); ampliar a seis cuando se puedan fabricar y entregar.
2. **Proveedores y muestra primero:** coste neto 1/10/25/50 piezas, bordado/estampación, IVA, transporte a cliente en España y devoluciones. Comprobar tallas, encogimiento, lavado, color, caída real y embalaje de 2–3 muestras.
3. **Precios reales en EUR:** precio final con impuestos; margen = PVP/1,21 − fabricación neta − envío/packaging netos − comisión cobro − provisión devoluciones. La matriz XLSX tiene un simulador; todos los costes pendientes están sin rellenar. No copiar precios COP del catálogo.
4. **Shopify como núcleo comercial:** inventario y variante verificados, pago seguro y recibos en Shopify; frontend BAYONA en Vercel mediante Storefront API pública y `checkoutUrl`. Secretos privados nunca en JS del navegador.
5. **Printful conectado a Shopify:** publicar inicialmente como borrador, enlazar variantes Shopify nativas talla/color con productos reales y gestión Printful, activar sincronización de stock. Hacer una compra de prueba antes del primer cobro.
6. **Producto con toda la información:** fotos **reales de la muestra o mockups claramente identificados**, fit, gramaje, fibra, guía de talla, precio final, envío previsto, dirección y contacto del responsable de producto, devolución y garantía.
7. **Tráfico de contenido con medición:** Reel real de Sebastián utilizando cada pieza (sin afirmar que una imagen conceptual sea una foto del producto), enlace UTM directo a su ficha, compra en 3 pasos (talla → carrito → Shopify checkout), emails postventa consentidos y KPIs view_item, add_to_cart, begin_checkout, purchase, tasa de cambio, CAC, devoluciones y margen neto.

## Protecciones legales y de marca

- **España**: el IVA general es 21% como hipótesis inicial para ropa; confirmar régimen aplicable a cada venta. https://administracion.gob.es/tu-espacio-europeo/derechos-obligaciones/empresas/impuestos/iva/tipos-exenciones
- **UE**: etiqueta de composición de fibras textil obligatoria y traducción correspondiente. https://europa.eu/youreurope/business/product-rules-compliance/textiles-and-footwear/textile-label/index_en.htm
- **UE**: ofertas online deben mostrar fabricante e información de contacto y, cuando proceda, responsable en la UE y advertencias, conforme a GPSR 2023/988 art.19. https://eur-lex.europa.eu/eli/reg/2023/988/oj/esp
- **Devolución**: con carácter general el consumidor dispone de 14 días de desistimiento; **la impresión bajo demanda de un diseño estándar de BAYONA no es automáticamente excepción**. La excepción legal es un producto hecho conforme a especificaciones particulares del cliente o claramente personalizado. https://www.boe.es/buscar/act.php?id=BOE-A-2007-20555
- **Calzado y compresión**: evitar promesas de seguridad, terapia o rendimiento sin ensayo/documentación. No usar signos registrados de terceros sin licencia. No recolectar datos de salud para vender ropa.
- Verificar actividad económica y facturación habilitada antes de poner cobros reales en producción.

## Estado de ejecución

- Sourcing de los 18 SKU preparado en `src/config/apparelSourcing.js`.
- Seis productos de lanzamiento mostrados como **prelanzamiento**, dentro de `Shop.jsx`, gracias a `ApparelLaunch.jsx` + `shop-clothing-drop.css`.
- Se han creado **dos borradores en Gmail** (sin enviar) para Muchacho Studio y 8Merch para cotización inicial.
- El Excel de proveedores y márgenes fue entregado como anexo en el chat.
- **NO** hay proveedor aceptado, muestra aprobada, checkout de ropa operativo ni despliegue público. El próximo paso que depende de terceros es su respuesta de costes y la conexión de Shopify/Printful.

## Referencias de integración
- Shopify Headless: https://shopify.dev/docs/storefronts/headless/overview
- Cart checkout URL: https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart/manage
- Vincular Printful y Shopify: https://help.printful.com/hc/es/articles/50262260641297--C%C3%B3mo-conecto-mi-tienda-de-Shopify-con-Printful
- Sincronización de stock: https://help.printful.com/hc/es/articles/50263482677009--Qu%C3%A9-es-la-sincronizaci%C3%B3n-del-stock-de-productos-y-c%C3%B3mo-afecta-a-mi-tienda
