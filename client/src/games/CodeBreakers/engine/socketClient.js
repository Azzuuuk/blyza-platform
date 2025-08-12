// Multiplayer client module: real-time Socket.IO integration with graceful fallback to local stub.
// URL params:
//   ?multiplayer=1           -> enable multiplayer layer
//   &realtime=1 (or &rt=1)   -> attempt real socket.io connection (server events prefixed nightfall_*)
//   &server=http://host:3001 -> override server origin for socket connection
// Exposes stable generic events to the rest of the app: chat_message, team_input, room_completed, state_patch, status

import { recordEvent } from './analytics'
let ioImport = null
try { ioImport = require('socket.io-client') } catch {}

const listeners = {}
const chatHistory = [] // retain recent chat for late join UI (local only; not authoritative)
const MAX_CHAT = 200

const emitLocal = (event, payload) => {
  ;(listeners[event] || []).forEach(h => { try { h(payload) } catch {} })
}

export function on(event, handler) {
  (listeners[event] = listeners[event] || []).push(handler)
  return () => off(event, handler)
}
export function off(event, handler) {
  if (!listeners[event]) return
  listeners[event] = listeners[event].filter(h => h !== handler)
}

let mode = 'stub' // 'stub' | 'realtime'
let initialized = false
let socket = null
let currentSessionId = null
let currentRole = null
let connectionTimer = null
// Metrics (lightweight, reset only on reload)
// Attempt to hydrate previous metrics (for delta / diagnostics across refresh)
let prevMetrics = null
try {
  if (typeof sessionStorage !== 'undefined') {
    const rawPrev = sessionStorage.getItem('nightfall_metrics')
    if (rawPrev) prevMetrics = JSON.parse(rawPrev)
  }
} catch {}

const metrics = {
  patchesSent: 0,
  fullSnapshotsSent: 0,
  patchesReceived: 0,
  fullSnapshotsReceived: 0,
  chatSent: 0,
  chatReceived: 0,
  lastPatchBytes: 0,
  totalPatchBytes: 0,
  _lastPersist: 0,
  prev: prevMetrics || null,
}
function persistMetricsDebounced() {
  try {
    const now = Date.now()
    if (now - metrics._lastPersist < 1500) return
    metrics._lastPersist = now
    const copy = { ...metrics }
    delete copy._lastPersist
    try { sessionStorage.setItem('nightfall_metrics', JSON.stringify(copy)) } catch {}
  } catch {}
}
export function getRealtimeMetrics() { return { ...metrics, mode } }

function pushChat(message) {
  chatHistory.push(message)
  if (chatHistory.length > MAX_CHAT) chatHistory.splice(0, chatHistory.length - MAX_CHAT)
  emitLocal('chat_message', message)
}

export function getChatHistory() { return [...chatHistory] }

export function initMultiplayer(sessionId, role, opts = {}) {
  if (initialized) return
  initialized = true
  currentSessionId = sessionId
  currentRole = role

  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()
  const wantRealtime = ['1','true','yes'].includes((opts.realtime ?? params.get('realtime') ?? params.get('rt') ?? '0').toString())
  if (!wantRealtime || !ioImport?.io) {
    console.log('[multiplayer] using stub mode')
    emitLocal('status', { connected: true, mode })
    return
  }

  // Attempt real-time connection
  try {
    const serverOverride = opts.server || params.get('server')
    let baseURL = serverOverride
    if (!baseURL) {
      if (typeof window !== 'undefined') {
        // If client served on vite dev (5173) assume server on 3001
        const loc = window.location
        if (loc.port && loc.port !== '3001') baseURL = `${loc.protocol}//${loc.hostname}:3001`
        else baseURL = `${loc.protocol}//${loc.host}`
      } else baseURL = 'http://localhost:3001'
    }
    const { io } = ioImport
    socket = io(baseURL, { transports: ['websocket'], timeout: 5000 })
    mode = 'realtime'
    connectionTimer = setTimeout(() => {
      if (!socket.connected) {
        console.warn('[multiplayer] realtime connect timeout, falling back to stub')
        try { socket.disconnect() } catch {}
        socket = null
        mode = 'stub'
        emitLocal('status', { connected: true, mode })
      }
    }, 4000)

    socket.on('connect', () => {
      clearTimeout(connectionTimer)
      recordEvent('rt_connect', { sid: socket.id })
      emitLocal('status', { connected: true, mode })
      socket.emit('nightfall_join', { sessionId, role })
      // Request full state explicitly (safety)
      socket.emit('nightfall_request_full', { sessionId })
    })
    socket.on('disconnect', reason => {
      recordEvent('rt_disconnect', { reason })
      emitLocal('status', { connected: false, mode })
    })

    // Server -> client translations
    socket.on('nightfall_chat', ({ message }) => {
      metrics.chatReceived++
      persistMetricsDebounced()
      pushChat({ ...message, remote: true })
    })
    socket.on('nightfall_state', payload => {
      // Translate to generic state_patch event shape used by component
      if (payload.full && payload.snapshot) {
        recordEvent('rt_state_full', { ts: payload.snapshot.ts || Date.now() })
        metrics.fullSnapshotsReceived++
        persistMetricsDebounced()
        emitLocal('state_patch', { full: true, snapshot: payload.snapshot })
      } else if (payload.patch) {
        recordEvent('rt_state_patch', { keys: Object.keys(payload.patch) })
        metrics.patchesReceived++
        metrics.lastPatchBytes = JSON.stringify(payload.patch).length
        metrics.totalPatchBytes += metrics.lastPatchBytes
        persistMetricsDebounced()
        emitLocal('state_patch', { patch: payload.patch })
      } else if (payload.heartbeat) {
        emitLocal('state_patch', { heartbeat: true })
      }
    })
    socket.on('nightfall_room_completed', ({ roomId }) => {
      emitLocal('room_completed', { roomId, remote: true })
    })
    socket.on('nightfall_lock_update', ({ roomId, by }) => {
      emitLocal('lock_update', { roomId, by })
    })
    socket.on('nightfall_lock_result', res => {
    if (!res.success) recordEvent('rt_lock_failed', { roomId: res.roomId })
    else recordEvent('rt_lock_ok', { roomId: res.roomId })
    emitLocal('lock_result', res)
    })
  } catch (e) {
    console.warn('[multiplayer] realtime initialization failed, fallback to stub', e)
    mode = 'stub'
    emitLocal('status', { connected: true, mode })
  }
}

// Public broadcasting APIs unify stub + realtime
export function broadcastChat(message) {
  if (mode === 'realtime' && socket?.connected) {
    try { socket.emit('nightfall_chat', { sessionId: currentSessionId, message }) } catch {}
  }
  metrics.chatSent++
  persistMetricsDebounced()
  pushChat({ ...message }) // Always reflect locally (optimistic)
}

export function onChatMessage(handler) { return on('chat_message', handler) }
export function offChatMessage(handler) { off('chat_message', handler) }

export function broadcastTeamInput(payload) {
  if (mode === 'realtime' && socket?.connected) {
    // Convert team input to state diff patch with partial teamInputs
    const { roomId, inputType, data, role } = payload
    const patch = {
      roomProgress: {
        [roomId]: {
          teamInputs: {
            [inputType]: { data, providedBy: role, timestamp: Date.now() }
          }
        }
      }
    }
    try {
      socket.emit('nightfall_state_diff', { sessionId: currentSessionId, patch, ts: Date.now() })
      recordEvent('rt_patch_sent', { kind: 'team_input', bytes: JSON.stringify(patch).length })
    } catch {}
  } else {
    emitLocal('team_input', { ...payload })
  }
}
export function onTeamInput(handler) { return on('team_input', handler) }
export function offTeamInput(handler) { off('team_input', handler) }

export function broadcastRoomCompleted(payload) {
  if (mode === 'realtime' && socket?.connected) {
    try { socket.emit('nightfall_room_completed', { sessionId: currentSessionId, roomId: payload.roomId }) } catch {}
  }
  emitLocal('room_completed', { ...payload })
}
export function onRoomCompleted(handler) { return on('room_completed', handler) }
export function offRoomCompleted(handler) { off('room_completed', handler) }

let lastDiffSentTs = 0
export function broadcastStatePatch(patch) {
  if (mode === 'realtime' && socket?.connected) {
    try {
      if (patch.full && patch.snapshot) {
        socket.emit('nightfall_state_diff', { sessionId: currentSessionId, full: true, snapshot: patch.snapshot })
        recordEvent('rt_patch_sent', { kind: 'full', bytes: JSON.stringify(patch.snapshot).length })
        metrics.fullSnapshotsSent++
        persistMetricsDebounced()
      } else if (patch.patch) {
        const now = Date.now()
        if (now - lastDiffSentTs < 300) {
          recordEvent('rt_patch_rate_skip', { msSinceLast: now - lastDiffSentTs })
        } else {
          lastDiffSentTs = now
        socket.emit('nightfall_state_diff', { sessionId: currentSessionId, patch: patch.patch, ts: patch.ts || Date.now() })
        recordEvent('rt_patch_sent', { kind: 'diff', keys: Object.keys(patch.patch), bytes: JSON.stringify(patch.patch).length })
          metrics.patchesSent++
          metrics.lastPatchBytes = JSON.stringify(patch.patch).length
          metrics.totalPatchBytes += metrics.lastPatchBytes
          persistMetricsDebounced()
        }
      } else if (patch.snapshot) { // legacy snapshot wrapper
        socket.emit('nightfall_state_diff', { sessionId: currentSessionId, full: true, snapshot: patch.snapshot })
      }
    } catch {}
  }
  emitLocal('state_patch', { ...patch })
}
export function onStatePatch(handler) { return on('state_patch', handler) }
export function offStatePatch(handler) { off('state_patch', handler) }

export function isMultiplayerStub() { return mode === 'stub' }

// Manual full snapshot request (server will respond with authoritative full state)
export function requestFullSync() {
  if (mode === 'realtime' && socket?.connected) {
    try { socket.emit('nightfall_request_full', { sessionId: currentSessionId }) } catch {}
  } else {
    console.log('[multiplayer] full sync request ignored (stub mode)')
  }
  try { recordEvent('rt_manual_full_request', { mode }) } catch {}
}

// Leader lock APIs
export function requestLeaderLock(roomId, role) {
  if (mode === 'realtime' && socket?.connected) {
    try { socket.emit('nightfall_lock', { sessionId: currentSessionId, roomId, action: 'acquire', role }) } catch {}
  } else {
    // stub: optimistic local broadcast
    emitLocal('lock_update', { roomId, by: role, local: true })
    emitLocal('lock_result', { roomId, success: true })
  }
}
export function releaseLeaderLock(roomId, role) {
  if (mode === 'realtime' && socket?.connected) {
    try { socket.emit('nightfall_lock', { sessionId: currentSessionId, roomId, action: 'release', role }) } catch {}
  } else {
    emitLocal('lock_update', { roomId, by: null, local: true })
  }
}
export function onLockUpdate(handler) { return on('lock_update', handler) }
export function offLockUpdate(handler) { off('lock_update', handler) }
export function onLockResult(handler) { return on('lock_result', handler) }
export function offLockResult(handler) { off('lock_result', handler) }
