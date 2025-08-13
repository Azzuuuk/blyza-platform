import { query } from './db.js'
import { randomUUID } from 'crypto'

export async function addUserIfMissing({ email, name }) {
  if(!email) return null
  const id = randomUUID()
  await query(`INSERT INTO users (id,email,name) VALUES ($1,$2,$3) ON CONFLICT (email) DO NOTHING`, [id,email,name||null])
  const res = await query(`SELECT id,email,name,points_balance FROM users WHERE email=$1`, [email])
  return res.rows[0]
}

export async function adjustPoints({ userId, delta, reason, sessionId }) {
  await query('BEGIN')
  try {
    await query(`UPDATE users SET points_balance = points_balance + $2 WHERE id=$1`, [userId, delta])
    await query(`INSERT INTO points_transactions (user_id, session_id, delta, reason) VALUES ($1,$2,$3,$4)`, [userId, sessionId||null, delta, reason||null])
    const bal = await query(`SELECT points_balance FROM users WHERE id=$1`, [userId])
    await query('COMMIT')
    return { balance: bal.rows[0]?.points_balance || 0 }
  } catch (e) {
    await query('ROLLBACK')
    throw e
  }
}

export async function listRewards() {
  const res = await query(`SELECT id,name,points_cost as pointsCost,category,metadata,active FROM rewards WHERE active=true ORDER BY points_cost ASC`)
  return res.rows
}

export async function seedReward({ id, name, pointsCost, category, metadata }) {
  await query(`INSERT INTO rewards (id,name,points_cost,category,metadata) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING`, [id,name,pointsCost,category||null,metadata||null])
}

export async function redeemReward({ userId, rewardId }) {
  const rewardRes = await query(`SELECT id, points_cost FROM rewards WHERE id=$1 AND active=true`, [rewardId])
  if(rewardRes.rowCount === 0) throw new Error('reward_not_found')
  const cost = rewardRes.rows[0].points_cost
  await query('BEGIN')
  try {
    const balRes = await query(`SELECT points_balance FROM users WHERE id=$1 FOR UPDATE`, [userId])
    if(balRes.rowCount === 0) throw new Error('user_not_found')
    const bal = balRes.rows[0].points_balance
    if(bal < cost) throw new Error('insufficient_points')
    await query(`UPDATE users SET points_balance = points_balance - $2 WHERE id=$1`, [userId, cost])
    const red = await query(`INSERT INTO reward_redemptions (user_id,reward_id,status) VALUES ($1,$2,'pending') RETURNING id,status,created_at`, [userId,rewardId])
    await query('COMMIT')
    return { redemption: { id: red.rows[0].id, status: red.rows[0].status, createdAt: red.rows[0].created_at }, newBalance: bal - cost }
  } catch (e) {
    await query('ROLLBACK')
    throw e
  }
}

export async function saveReport({ sessionId, managerEmail, insights, pdfPath }) {
  const id = randomUUID()
  await query(`INSERT INTO reports (id, session_id, manager_email, insights, pdf_path) VALUES ($1,$2,$3,$4,$5)`, [id, sessionId, managerEmail||null, insights||null, pdfPath||null])
  return { id }
}

export async function listReports({ managerEmail, limit=50 }) {
  const res = await query(`SELECT id, session_id as sessionId, manager_email as managerEmail, created_at as createdAt FROM reports WHERE manager_email=$1 ORDER BY created_at DESC LIMIT $2`, [managerEmail, limit])
  return res.rows
}

export async function getPointsBalance({ userId }) {
  const res = await query(`SELECT points_balance FROM users WHERE id=$1`, [userId])
  return res.rows[0]?.points_balance || 0
}

export async function listTransactions({ userId, limit=100 }) {
  const res = await query(`SELECT id, session_id as sessionId, delta, reason, created_at as createdAt FROM points_transactions WHERE user_id=$1 ORDER BY id DESC LIMIT $2`, [userId, limit])
  return res.rows
}

export default { addUserIfMissing, adjustPoints, listRewards, seedReward, redeemReward, saveReport, listReports, getPointsBalance, listTransactions }
