import { query } from './db.js'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'

const BCRYPT_ROUNDS = 10
async function hashPassword(pw){
  if(!pw) return null
  return bcrypt.hash(pw, BCRYPT_ROUNDS)
}

export async function createOrg({ name }) {
  const id = randomUUID()
  await query(`INSERT INTO orgs (id,name) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [id,name])
  return { id, name }
}

export async function addUserWithPassword({ email, name, password, orgId, role='member' }) {
  const id = randomUUID()
  const hash = await hashPassword(password)
  await query(`INSERT INTO users (id,email,name,password_hash,org_id) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (email) DO NOTHING`, [id,email,name||null,hash,orgId||null])
  const res = await query(`SELECT id,email,name,points_balance,org_id FROM users WHERE email=$1`, [email])
  const user = res.rows[0]
  if(orgId && user){
    await query(`INSERT INTO org_members (org_id,user_id,role) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`, [orgId,user.id,role])
  }
  return user
}

export async function findUserByEmail(email){
  const res = await query(`SELECT id,email,name,password_hash,points_balance,org_id FROM users WHERE email=$1`, [email])
  return res.rows[0]||null
}

export async function verifyPassword(raw, hash){
  if(!hash) return false
  try { return await bcrypt.compare(raw, hash) } catch { return false }
}

export async function logAudit({ userId, orgId, action, details, ip }){
  await query(`INSERT INTO audit_log (user_id, org_id, action, details, ip) VALUES ($1,$2,$3,$4,$5)`, [userId||null, orgId||null, action, details?JSON.stringify(details):null, ip||null])
}

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
  // Generate a pseudo unique code (placeholder)
  const code = 'RWD-' + Math.random().toString(36).slice(2,10).toUpperCase()
  const red = await query(`INSERT INTO reward_redemptions (user_id,reward_id,status,code) VALUES ($1,$2,'pending',$3) RETURNING id,status,code,created_at`, [userId,rewardId,code])
    await query('COMMIT')
  return { redemption: { id: red.rows[0].id, status: red.rows[0].status, code: red.rows[0].code, createdAt: red.rows[0].created_at }, newBalance: bal - cost }
  } catch (e) {
    await query('ROLLBACK')
    throw e
  }
}

export async function listRedemptions({ userId, limit=50 }) {
  const res = await query(`SELECT rr.id, rr.status, rr.created_at as createdAt, r.name, r.points_cost as pointsCost
    FROM reward_redemptions rr
    JOIN rewards r ON r.id = rr.reward_id
    WHERE rr.user_id=$1 ORDER BY rr.id DESC LIMIT $2`, [userId, limit])
  return res.rows
}

export async function consumeReward({ redemptionId, userId }) {
  await query('BEGIN')
  try {
    const resSel = await query(`SELECT id,status FROM reward_redemptions WHERE id=$1 AND user_id=$2 FOR UPDATE`, [redemptionId, userId])
    if(resSel.rowCount===0) throw new Error('not_found')
    if(resSel.rows[0].status !== 'pending') throw new Error('invalid_status')
    await query(`UPDATE reward_redemptions SET status='consumed', consumed_at=now() WHERE id=$1`, [redemptionId])
    await query('COMMIT')
    return { id:redemptionId, status:'consumed' }
  } catch(e){
    await query('ROLLBACK')
    throw e
  }
}

export async function listPdfReports({ managerEmail, limit=50 }) {
  const res = await query(`SELECT id, session_id as sessionId, manager_email as managerEmail, created_at as createdAt, pdf_path as pdfPath, pdf_size as pdfSize
    FROM reports WHERE type='pdf' AND ($1::text IS NULL OR manager_email=$1) ORDER BY created_at DESC LIMIT $2`, [managerEmail||null, limit])
  return res.rows
}

export async function seedDefaultRewards(){
  // Minimal curated defaults; idempotent insertion
  const defaults = [
    { id:'coffee_5', name:'$5 Coffee Credit', pointsCost:100, category:'food', metadata:{ type:'coupon', provider:'CoffeeNet'} },
    { id:'lunch_15', name:'$15 Lunch Voucher', pointsCost:300, category:'food', metadata:{ type:'coupon', provider:'LunchLink'} },
    { id:'stream_1m', name:'1 Month Streaming', pointsCost:250, category:'entertainment', metadata:{ type:'code'} },
    { id:'wellness_pass', name:'Wellness Day Pass', pointsCost:200, category:'wellness', metadata:{ type:'qr'} },
  ]
  const inserted = []
  for(const r of defaults){
    try { await seedReward(r); inserted.push(r.id) } catch(_){}
  }
  return inserted
}

export async function saveReport({ sessionId, managerEmail, insights, pdfPath, type, payload }) {
  const id = randomUUID()
  await query(`INSERT INTO reports (id, session_id, manager_email, insights, pdf_path, type, payload) VALUES ($1,$2,$3,$4,$5,$6,$7)`, [id, sessionId||null, managerEmail||null, insights||null, pdfPath||null, type||null, payload||null])
  return { id, type }
}

export async function listReports({ managerEmail, type, limit=50 }) {
  const clauses = []
  const params = []
  if(managerEmail){ params.push(managerEmail); clauses.push(`manager_email=$${params.length}`) }
  if(type){ params.push(type); clauses.push(`type=$${params.length}`) }
  const where = clauses.length? ('WHERE '+clauses.join(' AND ')) : ''
  params.push(limit)
  const res = await query(`SELECT id, session_id as sessionId, manager_email as managerEmail, type, created_at as createdAt, payload FROM reports ${where} ORDER BY created_at DESC LIMIT $${params.length}`, params)
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

export default { addUserIfMissing, adjustPoints, listRewards, seedReward, redeemReward, saveReport, listReports, getPointsBalance, listTransactions, listRedemptions, seedDefaultRewards, createOrg, addUserWithPassword, findUserByEmail, verifyPassword, logAudit, consumeReward, listPdfReports }
// Named exports already provided above for new auth/org helpers
