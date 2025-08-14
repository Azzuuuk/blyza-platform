// Lightweight analytics queue (safe no-op if endpoint missing)
const queue = []
let flushing = false

export function recordEvent(eventType, payload = {}) {
  queue.push({
    id: `${eventType}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    ts: Date.now(),
    type: eventType,
    payload,
  })
  if (queue.length >= 10) flush()
}

export async function flush(endpoint = '/api/analytics/event') {
  if (flushing || queue.length === 0) return
  flushing = true
  const batch = queue.splice(0, queue.length)
  try {
    if (typeof fetch !== 'undefined') {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: batch }),
      })
    }
  } catch (e) {
    batch.forEach(ev => queue.push(ev))
  } finally {
    flushing = false
  }
}

export function pendingEvents() { return [...queue] }
