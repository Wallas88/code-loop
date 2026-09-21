/*
 * server.mjs — the local server behind `npm start`: serves the game from this
 * folder on 127.0.0.1 and nothing else. Only the app's own files are reachable
 * (index.html, styles.css, src/, assets/), so the server source, package files
 * and anything above this folder never leave the machine. No dependencies.
 */
import http from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const DEFAULT_PORT = 4180
const ALLOWED_METHODS = ['GET', 'HEAD']
const ALLOWED_FILES = ['index.html', 'styles.css']
const ALLOWED_FOLDERS = ['src/', 'assets/']
const FALLBACK_TYPE = 'application/octet-stream'
const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
}
// The game runs entirely in the browser: no network calls, no embedded scripts
// from elsewhere. The header says so, so the browser enforces it.
const CONTENT_SECURITY_POLICY = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'none'; frame-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'"

function isAllowedPath(relative) {
  if (ALLOWED_FILES.includes(relative)) return true
  return ALLOWED_FOLDERS.some(startsFolder)

  function startsFolder(folder) {
    return relative.startsWith(folder)
  }
}

// Resolves the request path to a file inside ROOT, or throws when it is not
// one of the app's own files. Every failure is answered as "Not found".
async function resolveAppFile(url) {
  const pathname = decodeURIComponent(new URL(url, 'http://localhost').pathname)
  const relative = pathname === '/' ? 'index.html' : pathname.slice(1)
  const file = path.resolve(ROOT, relative)
  const resolvedRelative = path.relative(ROOT, file).split(path.sep).join('/')
  const insideRoot = file.startsWith(ROOT + path.sep)
  if (!isAllowedPath(resolvedRelative) || !insideRoot) throw new Error('Not found')
  const details = await stat(file)
  if (!details.isFile()) throw new Error('Not found')
  return file
}

async function handleRequest(request, response) {
  if (!ALLOWED_METHODS.includes(request.method)) {
    response.writeHead(405, { Allow: ALLOWED_METHODS.join(', ') })
    response.end()
    return
  }
  try {
    const file = await resolveAppFile(request.url)
    const data = await readFile(file)
    response.writeHead(200, {
      'Content-Type': CONTENT_TYPES[path.extname(file)] ?? FALLBACK_TYPE,
      'Content-Length': data.length,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Content-Security-Policy': CONTENT_SECURITY_POLICY,
    })
    response.end(request.method === 'HEAD' ? undefined : data)
  } catch {
    // Anything outside the allow-list, missing, or unreadable is the same answer:
    // the reason is never sent to the browser.
    response.writeHead(404, { 'Content-Type': 'text/plain' })
    response.end('Not found')
  }
}

export function createServer() {
  return http.createServer(handleRequest)
}

function openInBrowser(url) {
  const command = process.platform === 'win32'
    ? ['rundll32.exe', ['url.dll,FileProtocolHandler', url]]
    : process.platform === 'darwin'
      ? ['open', [url]]
      : ['xdg-open', [url]]
  const child = spawn(command[0], command[1], { stdio: 'ignore', windowsHide: true })

  function tellUserToOpenIt() {
    console.log(`Open ${url} in your browser.`)
  }

  child.on('error', tellUserToOpenIt)
}

function startFromCommandLine() {
  const port = Number(process.env.CODE_LOOP_PORT ?? DEFAULT_PORT)
  const server = createServer()

  function reportListenError(error) {
    const message = error.code === 'EADDRINUSE'
      ? `Port ${port} is already in use. Try http://127.0.0.1:${port}/ in your browser, or set CODE_LOOP_PORT to another port.`
      : error.message
    console.error(message)
    process.exitCode = 1
  }

  function announceReady() {
    const url = `http://127.0.0.1:${port}/`
    console.log(`\nCode Loop is ready: ${url}\nKeep this window open while you practise. Press Ctrl+C to stop.\n`)
    if (process.argv.includes('--open')) openInBrowser(url)
  }

  server.on('error', reportListenError)
  server.listen(port, '127.0.0.1', announceReady)
}

const runDirectly = process.argv[1] != null && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (runDirectly) startFromCommandLine()
