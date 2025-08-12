// Real-time state sync service for Operation Nightfall
// Handles: join_session, state_request_full, state_diff, chat_message, room_completed, leader_lock

export class NightfallRealtime {
  constructor(io) {
    this.io = io
    this.sessions = new Map() // sessionId -> { lastSnapshot, players: Set, locks: { roomId: { by, at } } }
    this.expiryMs = 10000
  this.allowedRootKeys = new Set(['roomProgress','currentRoom','timeLeft','gamePhase','ts','version','checksum','recentChat'])
  this.sessionMetrics = new Map() // sessionId -> metrics object
  this.socketLastPatch = new Map() // socket.id -> ts (rate limiting)
    this._setup()
  }

  _setup() {
    this.io.on('connection', socket => {
      socket.on('nightfall_join', data => this.handleJoin(socket, data))
      socket.on('nightfall_request_full', data => this.handleRequestFull(socket, data))
      socket.on('nightfall_state_diff', data => this.handleStateDiff(socket, data))
      socket.on('nightfall_chat', data => this.handleChat(socket, data))
      socket.on('nightfall_room_completed', data => this.handleRoomCompleted(socket, data))
      socket.on('nightfall_lock', data => this.handleLock(socket, data))
      socket.on('disconnect', () => this.handleDisconnect(socket))
    })

    // periodic lock expiry sweep
    setInterval(() => this.sweepLocks(), 4000).unref()
  }

  getSession(sessionId) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, { lastSnapshot: null, players: new Set(), locks: {} })
    }
    return this.sessions.get(sessionId)
  }

  handleJoin(socket, { sessionId, role }) {
    if (!sessionId) return
    const sess = this.getSession(sessionId)
    sess.players.add(socket.id)
    socket.data.nightfall = { sessionId, role }
    socket.join(`nf_${sessionId}`)
    if (sess.lastSnapshot) {
      socket.emit('nightfall_state', { full: true, snapshot: sess.lastSnapshot })
    } else {
      // Attempt cold-load from persistence (DB/file) once
      ;(async () => {
        const loaded = await this._coldLoad(sessionId)
        if (loaded) {
          socket.emit('nightfall_state', { full: true, snapshot: loaded })
        } else {
          socket.emit('nightfall_state', { heartbeat: true })
        }
      })()
    }
  }

  handleRequestFull(socket, { sessionId }) {
    if (!sessionId) return
    const sess = this.getSession(sessionId)
    if (sess.lastSnapshot) {
      socket.emit('nightfall_state', { full: true, snapshot: sess.lastSnapshot })
      return
    }
    ;(async () => {
      const loaded = await this._coldLoad(sessionId)
      if (loaded) socket.emit('nightfall_state', { full: true, snapshot: loaded })
    })()
  }

  handleStateDiff(socket, { sessionId, full, snapshot, patch, ts }) {
    if (!sessionId) return
    // Simple per-socket rate limit (5 patches / second)
    const now = Date.now()
    const last = this.socketLastPatch.get(socket.id) || 0
    if (now - last < 200) { // 200ms min interval
      return // drop silently; could emit warning if needed
    }
    this.socketLastPatch.set(socket.id, now)
    const sess = this.getSession(sessionId)
    if (full && snapshot) {
      // Basic root key filtering
      Object.keys(snapshot).forEach(k => { if(!this.allowedRootKeys.has(k) && !['version','checksum','roomProgress','currentRoom','timeLeft','gamePhase','ts'].includes(k)) delete snapshot[k] })
      if(!this._validateSnapshot(snapshot)) {
        socket.emit('nightfall_state_reject', { reason: 'invalid_snapshot' })
        return
      }
      sess.lastSnapshot = snapshot
      const m = this._ensureMetrics(sessionId)
      m.fullSnapshots += 1
      m.lastFullTs = Date.now()
      try { m.lastFullBytes = JSON.stringify(snapshot).length } catch {}
      m.diffBytesSinceLastFull = 0
      this._persistSnapshot(sessionId, snapshot)
      this.io.to(`nf_${sessionId}`).emit('nightfall_state', { full: true, snapshot })
      return
    }
    if (patch) {
      // Validate patch keys
      const invalid = Object.keys(patch).filter(k => !this.allowedRootKeys.has(k))
      if (invalid.length) {
        socket.emit('nightfall_state_reject', { reason: 'invalid_keys', keys: invalid })
        return
      }
      if(patch.recentChat && !Array.isArray(patch.recentChat)) delete patch.recentChat
      // naive merge for roomProgress + scalar fields
      if (!sess.lastSnapshot) sess.lastSnapshot = {}
      const target = sess.lastSnapshot
      if (patch.roomProgress) {
        target.roomProgress = target.roomProgress || {}
        Object.entries(patch.roomProgress).forEach(([roomId, partial]) => {
          target.roomProgress[roomId] = { ...(target.roomProgress[roomId] || {}), ...partial }
        })
      }
      if (patch.recentChat) {
        // keep only last 50 messages
        target.recentChat = (target.recentChat || []).concat(patch.recentChat).slice(-50)
      }
      ;['currentRoom','timeLeft','gamePhase'].forEach(k => { if (patch[k] !== undefined) target[k] = patch[k] })
      target.ts = ts || Date.now()
      this.io.to(`nf_${sessionId}`).emit('nightfall_state', { patch })
      const m = this._ensureMetrics(sessionId)
      m.patches += 1
      let diffBytes = 0
      try { diffBytes = JSON.stringify(patch).length } catch {}
      m.diffBytesSinceLastFull = (m.diffBytesSinceLastFull || 0) + diffBytes
      if (m.lastFullBytes && m.diffBytesSinceLastFull / m.lastFullBytes > 0.6) {
        socket.emit('nightfall_request_full', { reason: 'inefficient_diffs', ratio: m.diffBytesSinceLastFull / m.lastFullBytes })
      }
    }
  }

  handleChat(socket, { sessionId, message }) {
    if (!sessionId || !message) return
    this.io.to(`nf_${sessionId}`).emit('nightfall_chat', { message, ts: Date.now() })
  }

  handleRoomCompleted(socket, { sessionId, roomId }) {
    if (!sessionId || !roomId) return
    this.io.to(`nf_${sessionId}`).emit('nightfall_room_completed', { roomId, ts: Date.now() })
  }

  handleLock(socket, { sessionId, roomId, action, role }) {
    if (!sessionId || !roomId || !action) return
    const sess = this.getSession(sessionId)
    if (action === 'acquire') {
      const existing = sess.locks[roomId]
      if (existing && existing.by !== role && Date.now() - existing.at < this.expiryMs) {
        socket.emit('nightfall_lock_result', { roomId, success: false })
        return
      }
      sess.locks[roomId] = { by: role, at: Date.now() }
      this.io.to(`nf_${sessionId}`).emit('nightfall_lock_update', { roomId, by: role })
      return
    }
    if (action === 'release') {
      delete sess.locks[roomId]
      this.io.to(`nf_${sessionId}`).emit('nightfall_lock_update', { roomId, by: null })
    }
  }

  handleDisconnect(socket) {
    const meta = socket.data.nightfall
    if (!meta) return
    const { sessionId } = meta
    const sess = this.getSession(sessionId)
    sess.players.delete(socket.id)
  }

  sweepLocks() {
    const now = Date.now()
    this.sessions.forEach(sess => {
      Object.entries(sess.locks).forEach(([roomId, lock]) => {
        if (now - lock.at > this.expiryMs) {
          delete sess.locks[roomId]
        }
      })
    })
  }

  _ensureMetrics(sessionId){
    if(!this.sessionMetrics.has(sessionId)) {
  this.sessionMetrics.set(sessionId, { patches:0, fullSnapshots:0, lastFullTs:0, lastFullBytes:0, diffBytesSinceLastFull:0, createdAt: Date.now() })
    }
    return this.sessionMetrics.get(sessionId)
  }

  async _persistSnapshot(sessionId, snapshot){
    try {
      const { persistNightfallSnapshot } = await import('./nightfallPersistence.js')
      await persistNightfallSnapshot(sessionId, snapshot)
    } catch (e) {
      // swallow errors in persistence to not break realtime
    }
  }

  _validateSnapshot(snap){
    try {
      if(typeof snap !== 'object' || snap === null) return false
      if(typeof snap.currentRoom !== 'number') return false
      if(typeof snap.timeLeft !== 'number') return false
      if(typeof snap.gamePhase !== 'string') return false
      if(snap.roomProgress && typeof snap.roomProgress !== 'object') return false
      if(snap.recentChat && !Array.isArray(snap.recentChat)) return false
      return true
    } catch { return false }
  }

  async _coldLoad(sessionId){
    try {
      const sess = this.getSession(sessionId)
      if (sess.lastSnapshot) return sess.lastSnapshot
      const { loadNightfallSnapshot } = await import('./nightfallPersistence.js')
      const loaded = await loadNightfallSnapshot(sessionId)
      if (loaded?.snapshot && this._validateSnapshot(loaded.snapshot)) {
        sess.lastSnapshot = loaded.snapshot
        return loaded.snapshot
      }
    } catch {/* ignore */}
    return null
  }
}
