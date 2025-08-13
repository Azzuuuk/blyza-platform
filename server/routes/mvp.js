import express from 'express'
import { apiKey, maybeJwt } from '../middleware/auth.js'
import { addUserIfMissing, adjustPoints, listRewards, redeemReward, getPointsBalance, listTransactions, saveReport, listReports, seedReward } from '../services/mvpRepo.js'

const router = express.Router()
const requireKey = apiKey('MVP_API_KEY')

router.use(maybeJwt())

router.post('/user/upsert', requireKey, async (req,res) => {
  try {
    const { email, name } = req.body||{}
    if(!email) return res.status(400).json({ success:false, error:'email required' })
    const user = await addUserIfMissing({ email, name })
    res.json({ success:true, user })
  } catch (e) { res.status(500).json({ success:false, error:e.message }) }
})

router.get('/points/balance', requireKey, async (req,res) => {
  try {
    const userId = req.user?.id
    if(!userId) return res.status(401).json({ success:false, error:'no user context' })
    const balance = await getPointsBalance({ userId })
    res.json({ success:true, balance })
  } catch (e) { res.status(500).json({ success:false, error:e.message }) }
})

router.post('/points/earn', requireKey, async (req,res) => {
  try {
    const { delta, reason, sessionId } = req.body||{}
    if(!delta || delta <= 0) return res.status(400).json({ success:false, error:'positive delta required' })
    const userId = req.user?.id
    const result = await adjustPoints({ userId, delta, reason: reason||'game_reward', sessionId })
    res.json({ success:true, balance: result.balance })
  } catch (e) { res.status(500).json({ success:false, error:e.message }) }
})

router.get('/rewards', async (_req,res) => {
  try { res.json({ success:true, rewards: await listRewards() }) } catch (e) { res.status(500).json({ success:false, error:e.message }) }
})

router.post('/rewards/seed', requireKey, async (req,res) => {
  try {
    const { id, name, pointsCost, category, metadata } = req.body||{}
    if(!id||!name||!pointsCost) return res.status(400).json({ success:false, error:'id,name,pointsCost required' })
    await seedReward({ id, name, pointsCost, category, metadata })
    res.json({ success:true })
  } catch (e) { res.status(500).json({ success:false, error:e.message }) }
})

router.post('/rewards/redeem', requireKey, async (req,res) => {
  try {
    const { rewardId } = req.body||{}
    if(!rewardId) return res.status(400).json({ success:false, error:'rewardId required' })
    const userId = req.user?.id
    const result = await redeemReward({ userId, rewardId })
    res.json({ success:true, ...result })
  } catch (e) { res.status(400).json({ success:false, error:e.message }) }
})

router.get('/points/transactions', requireKey, async (req,res) => {
  try {
    const userId = req.user?.id
    const tx = await listTransactions({ userId })
    res.json({ success:true, transactions: tx })
  } catch (e) { res.status(500).json({ success:false, error:e.message }) }
})

router.post('/reports/save', requireKey, async (req,res) => {
  try {
    const { sessionId, managerEmail, insights, pdfPath } = req.body||{}
    if(!sessionId) return res.status(400).json({ success:false, error:'sessionId required' })
    const saved = await saveReport({ sessionId, managerEmail, insights, pdfPath })
    res.json({ success:true, reportId: saved.id })
  } catch (e) { res.status(500).json({ success:false, error:e.message }) }
})

router.get('/reports', requireKey, async (req,res) => {
  try {
    const email = req.query.email
    if(!email) return res.status(400).json({ success:false, error:'email query required' })
    const reports = await listReports({ managerEmail: email })
    res.json({ success:true, reports })
  } catch (e) { res.status(500).json({ success:false, error:e.message }) }
})

export default router
