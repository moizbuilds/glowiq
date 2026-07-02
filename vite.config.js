import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

// Read the key straight from the .env file. We deliberately DON'T use Vite's
// loadEnv here: it merges process.env, which lets a stray shell var override
// the file. The file is the source of truth for local dev.
function readKeyFromEnvFile(dir) {
  for (const f of ['.env.local', '.env']) {
    const p = path.join(dir, f)
    if (!fs.existsSync(p)) continue
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = /^\s*ANTHROPIC_API_KEY\s*=\s*(.*)\s*$/.exec(line)
      if (m) return m[1].trim().replace(/^["']|["']$/g, '')
    }
  }
  return process.env.ANTHROPIC_API_KEY || ''
}

// During `npm run dev`, Vite doesn't run the Vercel serverless functions in
// /api. This plugin serves them locally using the SAME core logic, reading the
// key from .env on the server side only — so it never reaches the browser.
// In production, Vercel runs the /api/*.js files instead.
function devApi() {
  // path → { module, fn, resultKey }
  const routes = {
    '/api/analyze': { module: '/api/analyze.js', fn: 'handleAnalyze', resultKey: 'analysis' },
    '/api/weekly': { module: '/api/weekly.js', fn: 'handleWeekly', resultKey: 'report' },
  }
  return {
    name: 'dev-api',
    configureServer(server) {
      for (const [path, route] of Object.entries(routes)) {
        server.middlewares.use(path, (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405
            res.end('Method not allowed')
            return
          }
          let raw = ''
          req.on('data', (c) => (raw += c))
          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json')
            const apiKey = readKeyFromEnvFile(server.config.root)
            if (!apiKey || apiKey === 'your_api_key_here') {
              res.statusCode = 500
              res.end(JSON.stringify({ error: 'Add ANTHROPIC_API_KEY to .env and restart the dev server.' }))
              return
            }
            try {
              const body = JSON.parse(raw || '{}')
              const mod = await server.ssrLoadModule(route.module)
              const result = await mod[route.fn](body, apiKey)
              res.statusCode = 200
              res.end(JSON.stringify({ [route.resultKey]: result }))
            } catch (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: err?.message || 'Request failed.' }))
            }
          })
        })
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), devApi()],
  server: { port: 5177 },
})
