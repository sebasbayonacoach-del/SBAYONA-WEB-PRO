import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const providerSource = readFileSync(
  resolve(process.cwd(), 'src/engine/providers/ExperienceProvider.jsx'),
  'utf8',
)

describe('ExperienceProvider — cursor global', () => {
  it('no monta un segundo cursor que compita con el cursor rápido de la aplicación', () => {
    expect(providerSource).not.toMatch(/import\s+\{\s*CustomCursor\s*\}\s+from\s+['"][^'"]*CustomCursor\.jsx['"]/)
    expect(providerSource).not.toMatch(/<CustomCursor\s*\/>/)
  })
})
