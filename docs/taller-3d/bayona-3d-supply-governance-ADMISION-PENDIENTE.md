# Admisión de las variantes nuevas — borrador para `3D-ADMISSION-RECORD.md`

Esto **no está aplicado en `C:\Users\sevis\BAYONA`**: es el texto y el inventario
que hay que pegar allí cuando el repo quede libre. Se prepara aparte porque los
dos testes de `src/test/fase7aSceneGovernance.test.js` declaran el registro un
**conjunto cerrado** y exigen registro de admisión antes de aceptar una variante
nueva. Relajar el teste sin este papel sería saltarse el proceso del proyecto.

## 1 · Qué se pide admitir

Doce objetos nuevos + un visor. Todos proceden de `INVENTARIO-OBJETOS.md`: cada
variante está ligada a un titular concreto de la web, que es lo que exige el
brief (§39: cada objeto representa una idea; §38: nada ornamental).

| variante | objeto | cotas reales | titular que lo pide |
|---|---|---|---|
| `barbell` | barra olímpica cargada | 2,20 m, disco 450 mm | «PASA. TE ENSEÑO BAYONA» |
| `dumbbells` | mueble de mancuernas | 1,80 × 0,78 × 0,66 m | «Aquí no hay humo» |
| `kettlebell` | pesa rusa | asa 62 % del cuerpo | «Plan / membresía» |
| `weightstack` | pila selectorizada | 20 × 190×75×14 mm, 100 kg | «Por qué no avanzas» |
| `plyobox` | caja pliométrica | 60 × 50 × 40 cm | «No es magia, es método» |
| `punchbag` | saco de boxeo | 1,45 m + cadena | «Coach / 2003» |
| `bench` | banco regulable | 1,28 m, 5 posiciones | «Notar el cambio» |
| `platetree` | árbol de discos | 3 brazos, poste 62 cm | «La base y lo opcional» |
| `scale` | báscula con tallímetro | plataforma 36 cm, columna 2,00 m | «Te leemos» |
| `timer` | cronómetro de intervalos | Ø 240 mm, tabata 40/20 | «Tres momentos, un mismo pulso» |
| `recovery` | kit de recuperación | rodillo 330×150, mini band 660 mm | «Personaliza tu recuperación» |
| `pullupbar` | barra fija + colchoneta | vano 1,20 m a 2,15 m, colchoneta 100 mm | «Valentía no es improvisación» |
| `viewer` | inspección orbitable del objeto | caja medida sobre la geometría | `/shop`, «mira el material» |

## 2 · Evidencia que respalda la admisión

Medido en **build de producción** de la copia aislada, nunca en dev:

- **Contrato de suministro**: 21/21 (`bayona-3d-supply/verify-scenes.cjs`) —
  `assets: []`, sin dependencias nuevas, sin `Math.random`, guarda de
  `reducedMotion`, `readScroll`, tokens de `theme` existentes y geometrías ya
  usadas por el engine.
- **Cobertura**: las 8 rutas tienen 3D en el 100 % de sus secciones reales
  (`harness/coverage.cjs`). `/` 14/14, `/about` 6/6, `/programs` 10/10,
  `/shop` 5/5, `/resources` 8/8, `/community` 11/11, `/faq` 2/2.
- **Visibilidad real** (`harness/visibility-audit.cjs`, diferencia de píxeles
  entre capa encendida y apagada): ningún tramo por debajo del 8 %; la mayoría
  entre 20 % y 70 %.
- **Sangrado**: 0 px en las 8 rutas.
- **CTAs**: 36/36 tramos con todos los enlaces y botones alcanzables
  (`harness/ctatest.cjs`) — es la regla 4 de `PLAN-MERGE.md`.
- **Presupuesto móvil**: intacto. El cycler pasa por `resolveSceneConfig`, así
  que `MOBILE_MAX_PARTICLES`, `MOBILE_MAX_INSTANCES` y los DPR siguen aplicando.

## 3 · Lo que hay que editar en el repo, en el mismo commit

`inventario-gobernanza.cjs` imprime las dos listas ya ordenadas y completas,
leídas del árbol con el suministro puesto:

```
node governance/inventario-gobernanza.cjs > governance/inventario-actual.txt
```

1. `fase7aSceneGovernance.test.js` › «el registro de escenas contiene
   exactamente las variantes documentadas»: sustituir el array de 8 por el de
   27 que imprime el generador.
2. Ídem › «7B: los ÚNICOS archivos con import de @react-three»: sustituir el
   inventario de 13 por los 33 archivos listados. Todos viven en
   `engine/scene/` y se alcanzan solo vía `lazy()`, que es la condición que el
   teste protege; ninguno introduce una ruta de carga nueva.

**No ejecutar estos cambios a ciegas si el repo hermana tocó el registro
mientras tanto**: volver a correr el generador contra el árbol real y comparar.

## 4 · Coste que hay que aceptar o rechazar, y es decisión del proyecto

Montar el cycler a nivel de router mete `vendor-three` (232 kB gzip) en las
rutas que hoy no cargan three. Medido en `/faq`: de 235 kB a 470 kB de JS.
Las dos salidas honestas son:

- **Aceptar** 3D en las 8 rutas y actualizar `3D-PERFORMANCE-BASELINE.md` con
  el presupuesto nuevo, o
- **Limitar** el `<RouteSceneCycler>` a las rutas de `SCENE_ALLOWLIST`, que
  deja `/faq`, `/resources` y `/community` sin nada y contradice el objetivo de
  «algo 3D en cada tramo».

Lo mismo con `/about` y `/programs`: hoy tienen dos contextos WebGL porque su
capa propia (globe / showroom) no es un paso del cycler. Convertirlas en pasos
obliga a tocar los ficheros que está escribiendo la otra sesión.
