// useCapabilities - hook de lectura del CapabilityContext (Requirement 23).
//
// Devuelve las Capabilities vivas provistas por `CapabilityProvider`. Si se usa
// fuera del provider, `CapabilityContext` entrega los defaults mobile-safe.

import { useContext } from 'react'
import { CapabilityContext } from '../providers/CapabilityProvider.jsx'

/**
 * @returns {import('../providers/capabilities.js').Capabilities} Capacidades vivas.
 */
export function useCapabilities() {
  return useContext(CapabilityContext)
}
