import functions from 'firebase-functions'
import admin from 'firebase-admin'
import fetch from 'node-fetch'

admin.initializeApp()
const db = admin.firestore()
const rtdb = admin.database()

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL
const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET
const N8N_CALLBACK_SECRET = process.env.N8N_CALLBACK_SECRET

async function postWithRetry(url, payload, headers = {}, attempts = 4) {
  let delay = 500
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify(payload)
    })
    if (res.ok) return await res.json().catch(() => ({}))
    await new Promise(r => setTimeout(r, delay))
    delay *= 2
  }
  throw new Error('n8n request failed after retries')
}

export const onGameComplete = functions.https.onRequest(async (req, res) => {
  try {
    const { sessionId } = req.body || {}
    if (!sessionId) return res.status(400).json({ success: false, error: 'sessionId required' })

    // Read analytics from RTDB and roles from Firestore
    const [analyticsSnap, lobbySnap] = await Promise.all([
      rtdb.ref(`/analytics/${sessionId}`).get(),
      rtdb.ref(`/lobbies/${sessionId}`).get()
    ])
    const quantitative = analyticsSnap.exists() ? analyticsSnap.val() : {}
    const lobby = lobbySnap.val() || {}

    const payload = {
      sessionId,
      quantitative,
      ts: Date.now(),
      nonce: `${sessionId}:${Date.now()}`
    }
    await postWithRetry(N8N_WEBHOOK_URL, payload, { 'x-n8n-signature': N8N_WEBHOOK_SECRET })
    return res.json({ success: true })
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message })
  }
})

export const onManagerFormSubmit = functions.https.onRequest(async (req, res) => {
  try {
    const { sessionId, qualitative } = req.body || {}
    if (!sessionId || !qualitative) return res.status(400).json({ success: false, error: 'invalid payload' })
    await db.collection('managerFeedback').doc(sessionId).set({ ...qualitative, createdAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true })
    await postWithRetry(N8N_WEBHOOK_URL, { sessionId, qualitative, ts: Date.now(), nonce: `${sessionId}:${Date.now()}` }, { 'x-n8n-signature': N8N_WEBHOOK_SECRET })
    return res.json({ success: true })
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message })
  }
})

export const n8nCallback = functions.https.onRequest(async (req, res) => {
  try {
    const sig = req.header('x-n8n-signature')
    if (sig !== N8N_CALLBACK_SECRET) return res.status(401).json({ success: false })
    const { sessionId, reportUrl, summaryJson, emailSent } = req.body || {}
    if (!sessionId) return res.status(400).json({ success: false, error: 'sessionId required' })

    await Promise.all([
      db.collection('reports').doc(sessionId).set({ sessionId, reportUrl, summaryJson, emailSent: !!emailSent, createdAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true }),
      rtdb.ref(`/games/nightfall/${sessionId}/reportSummary`).set({ status: 'ready', url: reportUrl || null, insights: summaryJson || null })
    ])
    return res.json({ success: true })
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message })
  }
})


