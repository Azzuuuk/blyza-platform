import pkg from 'pg'
const { Pool } = pkg

let pool

export function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL not set')
    }
    pool = new Pool({ connectionString, max: 5 })
  }
  return pool
}

export async function query(text, params) {
  const p = getPool()
  const start = Date.now()
  const res = await p.query(text, params)
  const ms = Date.now() - start
  if (ms > 200) {
    console.warn('Slow query', { ms, text })
  }
  return res
}

export async function withClient(fn) {
  const p = getPool()
  const client = await p.connect()
  try { return await fn(client) } finally { client.release() }
}

export async function healthCheck() {
  try {
    await query('SELECT 1')
    return true
  } catch (e) {
    console.error('DB health check failed', e.message)
    return false
  }
}
