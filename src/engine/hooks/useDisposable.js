// useDisposable - ciclo de vida de recursos GPU de Three.js (Requirement 22.5).
//
// `createDisposableRegistry` es una funcion PURA (sin React), reutilizable y
// verificable de forma aislada por los property tests: acumula recursos y los
// libera llamando a `dispose()` EXACTAMENTE una vez al desmontar, evitando fugas
// de geometrias/materiales/texturas (R22.5). El hook `useDisposable` enlaza ese
// registro al ciclo de vida del componente React.

import { useEffect, useRef } from 'react'

/**
 * @typedef {{ dispose?: () => void }} Disposable
 */

/**
 * Crea un registro de recursos liberables. Funcion PURA e independiente de React
 * para poder verificarse aislada (R22.5).
 *
 * @returns {{ register: <T>(resource: T) => T, disposeAll: () => void }}
 */
export function createDisposableRegistry() {
  /** @type {Set<Disposable>} */
  const resources = new Set()

  /**
   * Registra un recurso y lo devuelve tal cual (encadenable). Los valores
   * "falsy" (null/undefined) se ignoran para no romper `disposeAll`.
   * @template T
   * @param {T} resource
   * @returns {T}
   */
  function register(resource) {
    if (resource) resources.add(resource)
    return resource
  }

  /**
   * Libera todos los recursos llamando a `dispose()` EXACTAMENTE una vez por
   * recurso y vacia el registro. Idempotente: llamadas posteriores no vuelven a
   * liberar los mismos recursos. Ignora los que no tengan metodo `dispose`.
   */
  function disposeAll() {
    resources.forEach((resource) => {
      if (typeof resource.dispose === 'function') resource.dispose()
    })
    resources.clear()
  }

  return { register, disposeAll }
}

/**
 * Hook que enlaza un registro de recursos al ciclo de vida del componente:
 * libera todo lo registrado al desmontar, una sola vez (R22.5).
 *
 * @returns {<T>(resource: T) => T} Funcion `register` estable entre renders.
 */
export function useDisposable() {
  const registry = useRef(createDisposableRegistry()).current

  useEffect(() => () => registry.disposeAll(), [])

  return registry.register
}
