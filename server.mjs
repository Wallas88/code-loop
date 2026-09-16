import http from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const root = path.dirname(fileURLToPath(import.meta.url))
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.woff2':'font/woff2', '.svg':'image/svg+xml', '.json':'application/json; charset=utf-8' }
export function createServer() {
  return http.createServer(async (request, response) => {
    if (!['GET','HEAD'].includes(request.method)) { response.writeHead(405, { Allow:'GET, HEAD' }); response.end(); return }
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
      const relative = pathname === '/' ? 'index.html' : pathname.slice(1)
      const file = path.resolve(root, relative)
      const resolvedRelative = path.relative(root, file).split(path.sep).join('/')
      const allowed = resolvedRelative === 'index.html' || resolvedRelative === 'styles.css' || resolvedRelative.startsWith('src/') || resolvedRelative.startsWith('assets/')
      if (!allowed || !file.startsWith(root + path.sep) || !(await stat(file)).isFile()) throw new Error('Not found')
      const data = await readFile(file)
      response.writeHead(200, {
        'Content-Type': types[path.extname(file)] || 'application/octet-stream',
        'Content-Length': data.length,
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer',
        'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'none'; frame-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'"
      })
      response.end(request.method === 'HEAD' ? undefined : data)
    } catch { response.writeHead(404, { 'Content-Type':'text/plain' }); response.end('Not found') }
  })
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.CODE_LOOP_PORT || 4180)
  const server = createServer()
  server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? `Port ${port} is already in use. Try http://127.0.0.1:${port}/ in your browser, or set CODE_LOOP_PORT to another port.` : error.message); process.exitCode = 1 })
  server.listen(port, '127.0.0.1', () => {
    const url = `http://127.0.0.1:${port}/`
    console.log(`\nCode Loop is ready: ${url}\nKeep this window open while you practise. Press Ctrl+C to stop.\n`)
    if (process.argv.includes('--open')) {
      const command = process.platform === 'win32' ? ['rundll32.exe', ['url.dll,FileProtocolHandler',url]] : process.platform === 'darwin' ? ['open',[url]] : ['xdg-open',[url]]
      const child = spawn(command[0], command[1], { stdio:'ignore', windowsHide:true })
      child.on('error', () => console.log(`Open ${url} in your browser.`))
    }
  })
}
