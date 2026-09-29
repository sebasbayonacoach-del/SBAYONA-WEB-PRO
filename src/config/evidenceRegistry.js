/** @typedef {import('../lib/conversion/evidence.js').EvidenceRecord} EvidenceRecord */

/**
 * Registro local de evidencia aprobada, agrupado por contexto editorial.
 *
 * Permanece vacío hasta que un hito de página aporte evidencia real con fuente,
 * autorización aplicable, atribución y alcance documentados. Un contexto ausente
 * equivale siempre a una colección vacía; nunca se añaden placeholders.
 *
 * @type {Readonly<Record<string, ReadonlyArray<EvidenceRecord>>>}
 */
export const evidenceRegistry = Object.freeze({})
