/**
 * Node.js HTTP adapter untuk TanStack Start production server.
 *
 * dist/server/server.js mengeksport Web Fetch API handler, bukan HTTP server.
 * File ini membungkus handler tersebut ke dalam Node.js HTTP server.
 */

import { createServer } from 'node:http'
import { Readable } from 'node:stream'
import { Buffer } from 'node:buffer'

const port = parseInt(process.env.PORT || '3000', 10)
const host = process.env.HOST || '0.0.0.0'

// Import handler dari hasil build TanStack Start
const { default: app } = await import('./dist/server/server.js')

/**
 * Konversi IncomingMessage (Node) → Web Request
 */
async function toWebRequest(req) {
  const protocol = req.socket?.encrypted ? 'https' : 'http'
  const host = req.headers['host'] || `localhost:${port}`
  const url = new URL(req.url, `${protocol}://${host}`)

  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const v of value) headers.append(key, v)
    } else if (value != null) {
      headers.set(key, value)
    }
  }

  const method = req.method || 'GET'
  const hasBody = method !== 'GET' && method !== 'HEAD'

  const body = hasBody
    ? new ReadableStream({
        start(controller) {
          req.on('data', (chunk) => controller.enqueue(new Uint8Array(chunk)))
          req.on('end', () => controller.close())
          req.on('error', (err) => controller.error(err))
        },
      })
    : undefined

  return new Request(url, { method, headers, body, duplex: 'half' })
}

/**
 * Konversi Web Response → ServerResponse (Node)
 */
async function sendWebResponse(webRes, res) {
  res.statusCode = webRes.status
  res.statusMessage = webRes.statusText || ''

  for (const [key, value] of webRes.headers.entries()) {
    res.setHeader(key, value)
  }

  if (!webRes.body) {
    res.end()
    return
  }

  const reader = webRes.body.getReader()
  const nodeStream = new Readable({ read() {} })
  nodeStream.pipe(res)

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      nodeStream.push(Buffer.from(value))
    }
    nodeStream.push(null)
  } catch (err) {
    nodeStream.destroy(err)
  }
}

const server = createServer(async (req, res) => {
  try {
    const webRequest = await toWebRequest(req)
    const webResponse = await app.fetch(webRequest)
    await sendWebResponse(webResponse, res)
  } catch (err) {
    console.error('[server] Unhandled error:', err)
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain' })
    }
    res.end('Internal Server Error')
  }
})

server.listen(port, host, () => {
  console.log(`✅ Frontend server running at http://${host}:${port}`)
})

server.on('error', (err) => {
  console.error('[server] Fatal error:', err)
  process.exit(1)
})
