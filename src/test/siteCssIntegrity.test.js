import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import postcss from 'postcss'

function stylesheetFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const filepath = join(directory, entry.name)
    return entry.isDirectory() ? stylesheetFiles(filepath) : filepath.endsWith('.css') ? [filepath] : []
  })
}

describe('integridad de CSS de todas las páginas BAYONA', () => {
  it('ninguna hoja de estilos tiene bloques sin cerrar', () => {
    const root = join(process.cwd(), 'src')
    const errors = []
    for (const file of stylesheetFiles(root)) {
      try {
        postcss.parse(readFileSync(file, 'utf8'), { from: file })
      } catch (error) {
        errors.push(`${file}: ${error.message}`)
      }
    }
    expect(errors).toEqual([])
  })
})
