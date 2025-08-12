import express from 'express'
import { getNightfallRealtime } from '../services/nightfallRegistry.js'
import { GameSession } from '../models/GameSession.js'
import { randomUUID } from 'crypto'

// In-memory cache (authoritative data stored in Postgres when available)
const sessions = new Map() // sessionId -> GameSession (runtime only)
const sessionCodes = new Map() // joinCode -> sessionId (cached lookup)
let repoLoaded = false
let repo = null
async function ensureRepo(){
  if(repoLoaded) return repo
  try {
    repo = await import('../services/sessionRepo.js')
  } catch (e) {
    repo = null
  }
  repoLoaded = true
  return repo
}

async function createSession({ title='Operation Nightfall', hostId='host_demo', maxPlayers=4 }){
  const joinCode = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,4) || 'ABCD'
  // Use a UUID so it persists cleanly into the sessions table (UUID PK)
  const gs = new GameSession({
    id: randomUUID(),
    gameId: 'operation-nightfall',
    hostId,
    title,
    maxPlayers,
    players: [],
    settings: { maxPlayers },
    gameData: {},
  })
  gs.joinCode = joinCode
  sessions.set(gs.id, gs)
  sessionCodes.set(joinCode, gs.id)
  // Persist session shell in DB if available
  const r = await ensureRepo()
  if(r?.createSessionRecord) {
    try {
      const inserted = await r.createSessionRecord({ id: gs.id, title, hostId, maxPlayers, joinCode })
      if(inserted?.inserted === 0) {
        console.warn('[nightfall] session insert skipped (maybe duplicate?)', { id: gs.id })
      }
    } catch (e) {
      console.error('[nightfall] session insert failed', e.message)
    }
  }
  return gs
}

const router = express.Router()

// Simple API key gate (env NIGHTFALL_API_KEY). If not set, open for dev.
const requireKey = (req,res,next) => {
  const needed = process.env.NIGHTFALL_API_KEY
  if(!needed) return next()
  const provided = req.headers['x-api-key']
  if(provided !== needed) return res.status(401).json({ success:false, error:'invalid api key' })
  next()
}

// Root diagnostic to confirm router is mounted in production
router.get('/', (req,res) => {
  res.json({
    success: true,
    service: 'nightfall',
    note: 'If you can see this, /api/nightfall base path is mounted.',
    endpoints: [
      'POST /api/nightfall/sessions',
      'GET /api/nightfall/sessions',
      'POST /api/nightfall/sessions/:id/join',
      'POST /api/nightfall/join',
      'GET /api/nightfall/sessions/:id/state',
      'GET /api/nightfall/sessions/:id/metrics'
    ]
  })
})

// Create a new Nightfall session
router.post('/sessions', requireKey, async (req,res) => {
  try {
    const { title, hostId, maxPlayers } = req.body || {}
    const session = await createSession({ title, hostId, maxPlayers })
    res.status(201).json({ success:true, session: { ...session.toJSON(), joinCode: session.joinCode } })
  } catch (e) {
    res.status(500).json({ success:false, error: e.message })
  }
})

// List active sessions
router.get('/sessions', async (req,res) => {
  try {
    // Runtime sessions (current process memory)
    const runtime = Array.from(sessions.values()).map(s => ({
      ...s.toJSON(),
      joinCode: s.joinCode,
      runtime: true
    }))
    // Persisted sessions (DB) if repo available
    let persisted = []
    const r = await ensureRepo()
    if (r?.listSessions) {
      try {
        const rows = await r.listSessions(100)
        persisted = rows.map(row => ({
          id: row.id,
          joinCode: row.join_code,
            // Minimal fields until we hydrate full snapshot later
          status: row.status,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          persisted: true
        }))
      } catch (e) {
        // ignore db errors for now
      }
    }
    // Merge by id to avoid duplicates (prefer runtime details if present)
    const byId = new Map()
    for (const p of persisted) byId.set(p.id, p)
    for (const rts of runtime) byId.set(rts.id, { ...byId.get(rts.id), ...rts })
    const combined = Array.from(byId.values()).map(s => ({
      ...s,
      createdAt: s.createdAt || s.created_at || null,
      updatedAt: s.updatedAt || s.updated_at || null
    })).sort((a,b)=> {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return tb - ta // newest first
    })
    res.json({ success:true, sessions: combined, counts: { runtime: runtime.length, persisted: persisted.length } })
  } catch (e) {
    res.status(500).json({ success:false, error: e.message })
  }
})

// Direct DB session list (debug) – does not include runtime-only sessions
router.get('/sessions/db', async (req,res) => {
  const r = await ensureRepo()
  if(!r?.listSessions) return res.status(503).json({ success:false, error:'session repo unavailable' })
  try {
    const rows = await r.listSessions(100)
    res.json({ success:true, sessions: rows })
  } catch (e) {
    res.status(500).json({ success:false, error: e.message })
  }
})

// Join a session (adds player server-side; realtime join still via socket event)
router.post('/sessions/:id/join', requireKey, async (req,res) => {
  try {
    const { id } = req.params
    const { playerId, playerName } = req.body || {}
    if(!playerId) return res.status(400).json({ success:false, error:'playerId required' })
    let sess = sessions.get(id)
    if(!sess) {
      // attempt load from DB (future improvement)
      return res.status(404).json({ success:false, error:'Session not found' })
    }
    try { sess.addPlayer({ id: playerId, name: playerName || playerId }) } catch (err) { return res.status(400).json({ success:false, error: err.message }) }
    const r = await ensureRepo()
    if(r?.addPlayer) { try { await r.addPlayer({ sessionId: id, playerId, playerName: playerName || playerId }) } catch {} }
    res.json({ success:true, session: { ...sess.toJSON(), joinCode: sess.joinCode } })
  } catch(e){
    res.status(500).json({ success:false, error: e.message })
  }
})

// Join via code
router.post('/join', requireKey, async (req,res) => {
  const { code, playerId, playerName } = req.body || {}
  if(!code) return res.status(400).json({ success:false, error:'code required' })
  const upper = code.toUpperCase()
  let sessionId = sessionCodes.get(upper)
  if(!sessionId) {
    const r = await ensureRepo()
    if(r?.findSessionByCode) {
      const row = await r.findSessionByCode(upper)
      if(row) sessionId = row.id
    }
  }
  if(!sessionId) return res.status(404).json({ success:false, error:'invalid code' })
  let sess = sessions.get(sessionId)
  if(!sess) return res.status(404).json({ success:false, error:'session not cached yet'})
  try { sess.addPlayer({ id: playerId || `p_${Date.now()}`, name: playerName || playerId || 'Player' }) } catch (e) { return res.status(400).json({ success:false, error: e.message }) }
  const r = await ensureRepo()
  if(r?.addPlayer) { try { await r.addPlayer({ sessionId, playerId: playerId || `p_${Date.now()}`, playerName: playerName || playerId || 'Player' }) } catch {} }
  res.json({ success:true, session: { ...sess.toJSON(), joinCode: sess.joinCode } })
})

// Fetch lightweight realtime snapshot (for late joiner fallback)
router.get('/sessions/:id/state', (req,res) => {
  const { id } = req.params
  const rt = getNightfallRealtime()
  if(!rt) return res.status(503).json({ success:false, error:'Realtime service not ready' })
  const s = rt.sessions.get(id)
  if(s && s.lastSnapshot) return res.json({ success:true, snapshot: s.lastSnapshot })
  // Attempt cold load if missing
  ;(async () => {
    try {
      const { loadNightfallSnapshot } = await import('../services/nightfallPersistence.js')
      const loaded = await loadNightfallSnapshot(id)
      if(loaded?.snapshot){
        const sess = rt.getSession(id)
        sess.lastSnapshot = loaded.snapshot
        return res.json({ success:true, snapshot: loaded.snapshot, loadedFrom: loaded.loadedFrom || 'file' })
      }
      return res.status(404).json({ success:false, error:'No snapshot yet' })
    } catch (e) {
      return res.status(500).json({ success:false, error:'Load failed' })
    }
  })()
})

// Metrics for diagnostics (development only)
router.get('/sessions/:id/metrics', (req,res) => {
  const { id } = req.params
  const rt = getNightfallRealtime()
  if(!rt) return res.status(503).json({ success:false, error:'Realtime service not ready' })
  const metrics = rt.sessionMetrics.get(id)
  if(!metrics) return res.status(404).json({ success:false, error:'No metrics yet' })
  res.json({ success:true, metrics })
})

export default router
