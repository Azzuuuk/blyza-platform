// Build a standardized results payload for Operation Nightfall.
// Pure function so it can run client or server side.

export function buildMissionResults({ sessionId, startTime, endTime, roomProgress, teamChat }) {
  const totalRooms = 4
  const completedRooms = Object.values(roomProgress || {}).filter(r => r.completed).length
  const durationSeconds = Math.max(0, Math.floor((endTime - startTime) / 1000))
  const systemMessages = teamChat.filter(m => m.type === 'system')
  const playerMessages = teamChat.filter(m => m.type === 'player')
  const teamInputMessages = teamChat.filter(m => m.type === 'team-input')

  return {
    sessionId,
    game: 'operation-nightfall',
    timestamp: new Date().toISOString(),
    summary: {
      completedRooms,
      totalRooms,
      success: completedRooms === totalRooms,
      durationSeconds,
    },
    communication: {
      totalMessages: teamChat.length,
      systemMessages: systemMessages.length,
      playerMessages: playerMessages.length,
      teamInputMessages: teamInputMessages.length,
    },
    rooms: Object.entries(roomProgress).map(([id, r]) => ({
      id: Number(id),
      unlocked: r.unlocked,
      completed: r.completed,
      leadReady: r.leadReady,
      inputsProvided: Object.keys(r.teamInputs || {}).length,
      requiredCount: (r.requiredInputs ? r.requiredInputs.length : undefined)
    })),
  }
}

// Optional helper to POST results; safe no-op on failure.
const RETRY_KEY = 'nightfall_results_retry_queue'

function loadQueue() {
  if (typeof localStorage === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(RETRY_KEY)) || [] } catch { return [] }
}

function saveQueue(queue) {
  if (typeof localStorage === 'undefined') return
  try { localStorage.setItem(RETRY_KEY, JSON.stringify(queue.slice(0, 20))) } catch {}
}

export function getPendingResultRetries() { return loadQueue() }

export async function submitMissionResults(payload, endpoint = '/api/analytics/results') {
  try {
    if (typeof fetch !== 'undefined') {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Non-200')
      return true
    }
  } catch (e) {
    // Queue for retry
    const queue = loadQueue()
    queue.push({ payload, firstAttempt: Date.now() })
    saveQueue(queue)
    return false
  }
}

export async function processResultRetryQueue(endpoint = '/api/analytics/results') {
  const queue = loadQueue()
  if (!queue.length) return { attempted: 0, remaining: 0 }
  const remaining = []
  let attempted = 0
  for (const item of queue) {
    attempted++
    try {
      if (typeof fetch !== 'undefined') {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload)
        })
        if (!res.ok) throw new Error('Non-200')
        continue
      }
      // If fetch missing, keep item
      remaining.push(item)
    } catch (e) {
      // Keep for future (cap retention 24h)
      if (Date.now() - (item.firstAttempt || Date.now()) < 24*60*60*1000) remaining.push(item)
    }
  }
  saveQueue(remaining)
  return { attempted, remaining: remaining.length }
}
