
### Bloqueo de merge #1: la gobernanza de escenas está en rojo A PROPÓSITO

`npx vitest run` en la copia aislada: 679 pasan, 6 fallan. Cuatro son del
entorno de esta copia (`e2e/`, `scripts/lab-greybox-projection.mjs` y
`artifacts/fase9/...` no se copiaron; son ENOENT, no fallos de código). Dos son
reales y las provocan las escenas nuevas:

- `fase7aSceneGovernance` › "el registro de escenas contiene exactamente las
  variantes documentadas": el registro era un conjunto cerrado de 8 y ahora tiene
  21.
- `fase7aSceneGovernance` › "7B: los ÚNICOS archivos con import de @react-three…":
  inventario exacto, 13 → 29 archivos.

**No se han editado esos testes.** Su enunciado dice que una variante extra
necesita `3D-ADMISSION-RECORD.md` aprobado y el alta en el inventario con el
arquitecto. Eso es una decisión de gobierno del repo, no un detalle técnico, y el
repo lo está escribiendo otro agente ahora mismo. El merge real tiene que traer:
una entrada por variante nueva en el registro de admisión + las dos listas del
teste actualizadas, en el mismo commit.
