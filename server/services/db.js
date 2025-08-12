import pkg from 'pg'
const { Pool } = pkg

let pool
let lastDbVarUsed = null

function buildFromDiscreteEnv(){
  const { PGUSER, PGPASSWORD, PGHOST, PGPORT, PGDATABASE } = process.env
  if(PGHOST && PGDATABASE){
    const user = PGUSER || 'postgres'
    const pass = PGPASSWORD ? encodeURIComponent(PGPASSWORD) : ''
    const auth = pass ? `${encodeURIComponent(user)}:${pass}@` : ''
    const host = PGHOST
    const port = PGPORT || 5432
    return `postgres://${auth}${host}:${port}/${PGDATABASE}`
  }
  return null
}

export function getPool() {
  if (!pool) {
    const candidates = [
      ['DATABASE_URL', process.env.DATABASE_URL],
      ['RAILWAY_DATABASE_URL', process.env.RAILWAY_DATABASE_URL],
      ['POSTGRES_URL', process.env.POSTGRES_URL],
      ['SUPABASE_DB_URL', process.env.SUPABASE_DB_URL],
      ['DISCRETE_VARS', buildFromDiscreteEnv()]
    ]
    const found = candidates.find(([k,v]) => v)
    if(!found){
      throw new Error('No database connection string env var found (tried DATABASE_URL, RAILWAY_DATABASE_URL, POSTGRES_URL, SUPABASE_DB_URL, discrete PG vars)')
    }
    lastDbVarUsed = found[0]
    const connectionString = found[1]
    pool = new Pool({ connectionString, max: parseInt(process.env.PG_POOL_MAX)||5 })
    console.log(`📦 DB pool created using ${lastDbVarUsed}`)
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

export function dbDiagnostics(){
  return {
    poolCreated: !!pool,
    lastDbVarUsed,
    maxClients: pool?.options?.max || null
  }
}
