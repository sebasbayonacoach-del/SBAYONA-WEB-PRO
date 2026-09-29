import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { spawnSync } from 'node:child_process'

// Capture status in files as well as stdout, for desktop hosts without a console.
const root = dirname(dirname(fileURLToPath(import.meta.url)))
const output = join(root, 'outputs')
mkdirSync(output, { recursive: true })
const statusPath = join(output, 'motion-validation.json')
const report = { startedAt: new Date().toISOString(), runtime: process.version, checks: [] }
const save = () => writeFileSync(statusPath, JSON.stringify(report, null, 2))
save()
for (const [name, args] of [
  ['unit-tests', ['node_modules/vitest/vitest.mjs', '--run']],
  ['production-build', ['node_modules/vite/bin/vite.js', 'build']],
]) {
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    encoding: 'utf8',
    timeout: 300000,
    maxBuffer: 32 * 1024 * 1024,
    windowsHide: true,
  })
  writeFileSync(join(output, `${name}.log`), `${result.stdout ?? ''}\n${result.stderr ?? ''}`)
  report.checks.push({ name, exitCode: result.status, error: result.error?.message ?? null })
  save()
}
report.finishedAt = new Date().toISOString()
save()
process.exitCode = report.checks.every((check) => check.exitCode === 0) ? 0 : 1
