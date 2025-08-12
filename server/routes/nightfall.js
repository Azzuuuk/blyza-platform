import express from 'express'
import { getNightfallRealtime } from '../services/nightfallRegistry.js'
import { GameSession } from '../models/GameSession.js'

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
  const gs = new GameSession({
    id: `nf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`,
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
    try { await r.createSessionRecord({ id: gs.id, title, hostId, maxPlayers, joinCode }) } catch (e) { /* ignore */ }
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
router.get('/sessions', (req,res) => {
  const list = Array.from(sessions.values()).map(s=>s.toJSON())
  res.json({ success:true, sessions: list })
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
  if(!s || !s.lastSnapshot) return res.status(404).json({ success:false, error:'No snapshot yet' })
  res.json({ success:true, snapshot: s.lastSnapshot })
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
