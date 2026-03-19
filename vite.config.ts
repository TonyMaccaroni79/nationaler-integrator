import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    plugins: [
    react(),
    {
      name: 'local-api-routes',
      configureServer(server) {
        const routeLoaders: Record<string, () => Promise<unknown>> = {
          '/api/validate-dmrv': () => import('./app/api/validate-dmrv'),
          '/api/authorize': () => import('./app/api/authorize'),
          '/api/mint': () => import('./app/api/mint'),
          '/api/audit': () => import('./app/api/audit'),
          '/api/bootstrap': () => import('./app/api/bootstrap'),
          '/api/reset-demo': () => import('./app/api/reset-demo'),
          '/api/governance-details': () => import('./app/api/governance-details'),
          '/api/admin/users': () => import('./app/api/admin/users'),
          '/api/admin/set-role': () => import('./app/api/admin/set-role'),
        }

        server.middlewares.use(async (req, res, next) => {
          const url = req.url ?? ''
          const [path, queryString] = url.split('?')
          if (!path.startsWith('/api/')) return next()

          ;(req as { query?: Record<string, string> }).query = Object.fromEntries(
            new URLSearchParams(queryString ?? ''),
          )

          const load = routeLoaders[path]
          if (!load) {
            res.statusCode = 404
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: `No local API route for ${path}` }))
            return
          }

          if (req.method && ['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase())) {
            const chunks: Buffer[] = []
            for await (const chunk of req) {
              chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)))
            }
            const raw = Buffer.concat(chunks).toString('utf8').trim()
            if (raw) {
              try {
                ;(req as { body?: unknown }).body = JSON.parse(raw)
              } catch {
                ;(req as { body?: unknown }).body = raw
              }
            }
          }

          const resWithHelpers = res as typeof res & {
            status: (code: number) => typeof resWithHelpers
            send: (body: unknown) => void
            json: (body: unknown) => void
          }
          resWithHelpers.status = (code: number) => {
            res.statusCode = code
            return resWithHelpers
          }
          resWithHelpers.send = (body: unknown) => {
            if (typeof body === 'string' || Buffer.isBuffer(body)) {
              res.end(body)
              return
            }
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(body))
          }
          resWithHelpers.json = (body: unknown) => {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(body))
          }

          try {
            const module = await load()
            const handler = (module as { default: (req: unknown, res: unknown) => unknown }).default
            await handler(req, resWithHelpers)
          } catch (error) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                error: 'Local API execution failed',
                details: error instanceof Error ? error.message : String(error),
              }),
            )
          }
        })
      },
    },
    ],
  }
})
