/*
 * check-snapshot.mjs — compares the project's files with the SHA-256 baseline
 * recorded in ownership/evidence/baseline-sha256.json and reports what changed,
 * went missing or was added. Part of the ownership record: it proves file
 * contents against a dated snapshot, not who wrote them or when.
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const BASELINE_FILE = 'ownership/evidence/baseline-sha256.json'
const IGNORED_FOLDERS = new Set(['ownership', 'verification', '.git', 'node_modules', 'dist', 'dist-ssr'])
const SECRET_FILE_PREFIX = '.env'
const SECRET_FILE = '.dev.vars'
const WINDOWS_STREAM_MARKER = 'Zone.Identifier'

function isIgnored(entry) {
  if (IGNORED_FOLDERS.has(entry.name)) return true
  if (entry.name.startsWith(SECRET_FILE_PREFIX) || entry.name === SECRET_FILE) return true
  return entry.name.includes(WINDOWS_STREAM_MARKER)
}

export function trackedFiles(root, relative = '') {

  function listEntry(entry) {
    if (isIgnored(entry)) return []
    const name = path.join(relative, entry.name)
    if (entry.isDirectory()) return trackedFiles(root, name)
    return entry.isFile() ? [name.split(path.sep).join('/')] : []
  }

  return fs.readdirSync(path.join(root, relative), { withFileTypes: true }).flatMap(listEntry).sort()
}

export function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
}

function assertSafeManifestPath(entryPath) {
  const isString = typeof entryPath === 'string'
  if (!isString || path.isAbsolute(entryPath) || entryPath.split(/[\\/]/).includes('..')) throw new Error('Invalid manifest path')
}

export function verifySnapshot(root = PROJECT_ROOT) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, BASELINE_FILE), 'utf8'))
  const current = new Set(trackedFiles(root))
  const changed = []
  const missing = []
  for (const entry of manifest.files) {
    assertSafeManifestPath(entry.path)
    const file = path.resolve(root, entry.path)
    if (!file.startsWith(root + path.sep)) throw new Error('Manifest path escapes the project')
    if (!current.has(entry.path)) missing.push(entry.path)
    else if (sha256(file) !== entry.sha256) changed.push(entry.path)
    current.delete(entry.path)
  }
  return { baselineRecordedAt: manifest.recordedAt, trackedFiles: manifest.files.length, changed, missing, added: [...current].sort() }
}

function reportFromCommandLine() {
  const result = verifySnapshot()
  console.log(JSON.stringify(result, null, 2))
  const differs = result.changed.length > 0 || result.missing.length > 0 || result.added.length > 0
  if (differs) {
    console.log('The project differs from the recorded baseline. This may reflect intentional later edits.')
    process.exitCode = 1
  } else {
    console.log('All tracked files match. This verifies file contents, not ownership or an independent creation date.')
  }
}

const runDirectly = process.argv[1] != null && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (runDirectly) reportFromCommandLine()
