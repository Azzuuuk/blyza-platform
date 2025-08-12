import { query } from './db.js'
import { randomUUID } from 'crypto'

// Create a session record. If an id is supplied (preferred) we use it so that
// the in-memory GameSession id matches the persisted row. This lets us later
// hydrate or look up by the same id instead of having divergent identifiers.
export async function createSessionRecord({ id, title, hostId, maxPlayers, joinCode }) {
  const finalId = id || randomUUID()
  const res = await query(
    `INSERT INTO sessions (id, join_code, status, latest_snapshot, snapshot_version, snapshot_checksum)
     VALUES ($1,$2,'lobby', $3, $4, $5)
     ON CONFLICT (id) DO NOTHING`,
    [finalId, joinCode, null, null, null]
  )
  return { id: finalId, joinCode, inserted: res.rowCount }
}

export async function addPlayer({ sessionId, playerId, playerName, role }) {
  await query(
    `INSERT INTO session_players (id, session_id, name, role)
     VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
    [playerId, sessionId, playerName, role || null]
  )
}

export async function recordEvent({ sessionId, type, payload }) {
  await query(
    `INSERT INTO session_events (session_id, type, payload) VALUES ($1,$2,$3)`,
    [sessionId, type, payload || null]
  )
}

export async function updateSnapshot({ sessionId, snapshot, version, checksum }) {
  await query(
    `UPDATE sessions SET latest_snapshot=$2, snapshot_version=$3, snapshot_checksum=$4, updated_at=now() WHERE id=$1`,
    [sessionId, snapshot, version, checksum]
  )
}

export async function findSessionByCode(joinCode) {
  const res = await query(`SELECT id, join_code FROM sessions WHERE join_code=$1`, [joinCode])
  return res.rows[0] || null
}

export async function getSession(sessionId) {
  const res = await query(`SELECT * FROM sessions WHERE id=$1`, [sessionId])
  return res.rows[0] || null
}

export async function listSessions(limit=50) {
  const res = await query(`SELECT id, join_code, status, created_at, updated_at FROM sessions ORDER BY created_at DESC LIMIT $1`, [limit])
  return res.rows
}
