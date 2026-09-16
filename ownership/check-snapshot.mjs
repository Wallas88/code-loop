import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ignored = new Set(['ownership', 'verification', '.git', 'node_modules', 'dist', 'dist-ssr'])

export function trackedFiles(root, relative = '') {
  return fs.readdirSync(path.join(root, relative), { withFileTypes: true })
    .flatMap(entry => {
      if (ignored.has(entry.name) || entry.name.startsWith('.env') || entry.name === '.dev.vars' || entry.name.includes('Zone.Identifier')) return []
      const name = path.join(relative, entry.name)
      if (entry.isDirectory()) return trackedFiles(root, name)
      return entry.isFile() ? [name.split(path.sep).join('/')] : []
    }).sort()
}

export const sha256 = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')

export function verifySnapshot(root = projectRoot) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'ownership/evidence/baseline-sha256.json'), 'utf8'))
  const current = new Set(trackedFiles(root))
  const changed = [], missing = []
  for (const entry of manifest.files) {
    if (typeof entry.path !== 'string' || path.isAbsolute(entry.path) || entry.path.split(/[\\/]/).includes('..')) throw new Error('Invalid manifest path')
    const file = path.resolve(root, entry.path)
    if (!file.startsWith(root + path.sep)) throw new Error('Manifest path escapes the project')
    if (!current.has(entry.path)) missing.push(entry.path)
    else if (sha256(file) !== entry.sha256) changed.push(entry.path)
    current.delete(entry.path)
  }
  return { baselineRecordedAt: manifest.recordedAt, trackedFiles: manifest.files.length, changed, missing, added: [...current].sort() }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = verifySnapshot()
  console.log(JSON.stringify(result, null, 2))
  if (result.changed.length || result.missing.length || result.added.length) {
    console.log('The project differs from the recorded baseline. This may reflect intentional later edits.')
    process.exitCode = 1
  } else {
    console.log('All tracked files match. This verifies file contents, not ownership or an independent creation date.')
  }
}
