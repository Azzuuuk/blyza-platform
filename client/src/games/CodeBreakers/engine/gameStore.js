// Zustand store skeleton for future migration (not yet wired into components)
// When ready, we can move component state into here gradually.

import { create } from 'zustand'
import { ROLES, ROOMS } from './constants'
import { recordEvent } from './analytics'

// Snapshot schema versioning: bump when structure changes (add/remove keys)
export const SNAPSHOT_VERSION = 1

// Lightweight checksum for diagnostics (not cryptographic)
function checksum(obj) {
  try {
    const json = JSON.stringify(obj)
    let hash = 5381
    for (let i = 0; i < json.length; i++) hash = ((hash << 5) + hash) + json.charCodeAt(i)
    return (hash >>> 0).toString(36)
  } catch { return '0' }
}

// Attempt hydration from a previously persisted snapshot (refresh recovery)
let hydratedSnapshot = null
let hydratedPatchEff = null
let hydratedLockStats = null
try {
  if (typeof sessionStorage !== 'undefined') {
    const raw = sessionStorage.getItem('nightfall_snapshot')
    if (raw) hydratedSnapshot = JSON.parse(raw)
  const rawEff = sessionStorage.getItem('nightfall_patch_eff')
  if (rawEff) hydratedPatchEff = JSON.parse(rawEff)
  const rawLocks = sessionStorage.getItem('nightfall_lock_stats')
  if (rawLocks) hydratedLockStats = JSON.parse(rawLocks)
  }
} catch {}

// Helper to safely pick a key from hydrated snapshot (fallback to default)
const pickHydrated = (key, fallback) => (hydratedSnapshot && hydratedSnapshot[key] !== undefined ? hydratedSnapshot[key] : fallback)

// Internal ref for diff computations
let lastSnapshotForDiff = null
const shallowClone = obj => (obj && typeof obj === 'object' ? JSON.parse(JSON.stringify(obj)) : obj)

export const useNightfallStore = create((set, get) => ({
  gamePhase: pickHydrated('gamePhase', 'briefing'),
  currentRoom: pickHydrated('currentRoom', 1),
  timeLeft: pickHydrated('timeLeft', 1800),
  startTime: pickHydrated('startTime', Date.now()),
  playerNames: ['', '', '', ''],
  assignedRoles: ['', '', '', ''],
  activePlayerCount: 4,
  currentPlayerRole: '',
  roomProgress: pickHydrated('roomProgress', {
    1: { unlocked: true, completed: false, leadReady: false, teamInputs: {} },
    2: { unlocked: false, completed: false, leadReady: false, teamInputs: {} },
    3: { unlocked: false, completed: false, leadReady: false, teamInputs: {} },
    4: { unlocked: false, completed: false, leadReady: false, teamInputs: {} },
  }),
  teamChat: pickHydrated('recentChat', []),
  leaderLocks: {}, // { roomId: { by: role, at: ts } }
  lockStats: hydratedLockStats ? { ...hydratedLockStats } : { attempts: 0, acquired: 0, failed: 0, releases: 0, expiries: 0 },
  _lockWaitSamples: hydratedLockStats?.waitSamples || [],
  _lockAttemptStarts: {}, // roomId -> ts when wait started (for contention metrics)
  // Snapshot integrity diagnostics
  lastSnapshotIntegrityOk: true,
  lastSnapshotVerifyTs: null,
  // Patch efficiency metrics (reset on full snapshot)
  _lastFullSnapshotSize: 0,            // bytes of last full snapshot JSON
  _diffBytesAccumulatedSinceFull: 0,   // total diff patch bytes since last full
  _diffPatchesSinceFull: 0,
  _efficiencyWarned: false,
  // Snapshot / version diagnostics
  remoteVersionAhead: false,
  snapshotMismatchCount: 0,
  lastSnapshotMismatchTs: null,
  _mismatchAutoRequestThreshold: 2,
  _lastAutoRequestTs: 0,
  _autoFullSyncAttempts: 0,
  _lastAutoFullSyncTs: 0,
  // Hydrate efficiency if available
  ...(hydratedPatchEff ? {
    _lastFullSnapshotSize: hydratedPatchEff.lastFullBytes || 0,
    _diffBytesAccumulatedSinceFull: hydratedPatchEff.diffBytes || 0,
    _diffPatchesSinceFull: hydratedPatchEff.diffPatches || 0,
  } : {}),
  markFullSnapshotBroadcast: (snapshot) => {
    try {
      const size = JSON.stringify(snapshot || {}).length
  set({ _lastFullSnapshotSize: size, _diffBytesAccumulatedSinceFull: 0, _diffPatchesSinceFull: 0, _efficiencyWarned: false, _autoFullSyncAttempts: 0 })
      try { sessionStorage.setItem('nightfall_patch_eff', JSON.stringify({ lastFullBytes: size, diffBytes: 0, diffPatches: 0 })) } catch {}
    } catch {}
  },
  getPatchEfficiency: () => {
    const st = get()
    const full = st._lastFullSnapshotSize || 1
    const ratio = st._diffBytesAccumulatedSinceFull / full
    return {
      lastFullBytes: st._lastFullSnapshotSize,
      diffBytes: st._diffBytesAccumulatedSinceFull,
      diffPatches: st._diffPatchesSinceFull,
      ratio,
    }
  },
  getSnapshotMismatchInfo: () => ({ count: get().snapshotMismatchCount, lastTs: get().lastSnapshotMismatchTs }),
  shouldAutoRequestFullSync: () => {
    const st = get()
    if (st.snapshotMismatchCount < st._mismatchAutoRequestThreshold) return false
    const now = Date.now()
    const attempts = st._autoFullSyncAttempts || 0
    const base = 3000
    const wait = Math.min(30000, base * Math.pow(2, attempts))
    if (now - st._lastAutoFullSyncTs >= wait) return true
    return false
  },
  noteAutoRequestPerformed: () => {
    const st = get()
    const attempts = (st._autoFullSyncAttempts || 0) + 1
    set({ _lastAutoRequestTs: Date.now(), _lastAutoFullSyncTs: Date.now(), _autoFullSyncAttempts: attempts, snapshotMismatchCount: 0 })
    try { recordEvent('auto_full_sync_attempt', { attempts }) } catch {}
  },
  _lastHydratedTs: hydratedSnapshot?.ts || null,
  _lastPersistTs: null,
  _lockExpiryMs: 10000,
  _lastLockSweep: 0,
  // Snapshot builder (lightweight) for late joiners or reconnections
  buildSnapshot: () => {
    const state = get()
    const core = {
      ts: Date.now(),
      version: SNAPSHOT_VERSION,
      gamePhase: state.gamePhase,
      currentRoom: state.currentRoom,
      timeLeft: state.timeLeft,
      roomProgress: state.roomProgress,
      recentChat: state.teamChat.slice(-50),
    }
    return { ...core, checksum: checksum(core) }
  },
  // Persist snapshot (best-effort) for refresh recovery
  persistSnapshot: () => {
    try {
      const snap = get().buildSnapshot()
      sessionStorage.setItem('nightfall_snapshot', JSON.stringify(snap))
      set({ _lastPersistTs: snap.ts })
    } catch {}
  },
  // Produce a minimal diff patch relative to last sent snapshot
  buildDiffPatch: () => {
    try {
      const current = get().buildSnapshot()
      if (!lastSnapshotForDiff) {
        lastSnapshotForDiff = shallowClone(current)
  // Mark initial full snapshot size for efficiency baseline
  try { useNightfallStore.getState().markFullSnapshotBroadcast(current) } catch {}
        return { full: true, snapshot: current }
      }
      const prev = lastSnapshotForDiff
      const patch = {}
      let changed = 0
      for (const k of Object.keys(current)) {
        const curVal = current[k]
        const prevVal = prev[k]
        const isObj = typeof curVal === 'object' && curVal !== null
        if (isObj) {
          const curStr = JSON.stringify(curVal)
          const prevStr = JSON.stringify(prevVal)
            if (curStr !== prevStr) { patch[k] = curVal; changed++ }
        } else if (curVal !== prevVal) { patch[k] = curVal; changed++ }
      }
      if (!changed) return null
      lastSnapshotForDiff = shallowClone({ ...prev, ...patch })
      // Track diff byte size for efficiency metrics
      try {
        const bytes = JSON.stringify(patch).length
        const st = get()
        set({
          _diffBytesAccumulatedSinceFull: (st._diffBytesAccumulatedSinceFull || 0) + bytes,
          _diffPatchesSinceFull: (st._diffPatchesSinceFull || 0) + 1,
        })
  try { const nowEff = get(); sessionStorage.setItem('nightfall_patch_eff', JSON.stringify({ lastFullBytes: nowEff._lastFullSnapshotSize, diffBytes: nowEff._diffBytesAccumulatedSinceFull, diffPatches: nowEff._diffPatchesSinceFull })) } catch {}
        const updated = get()
        if (updated._lastFullSnapshotSize > 0) {
          const ratio = updated._diffBytesAccumulatedSinceFull / updated._lastFullSnapshotSize
          if (ratio > 0.6 && !updated._efficiencyWarned) {
            try { recordEvent('patch_efficiency_threshold_cross', { ratio, fullBytes: updated._lastFullSnapshotSize, diffBytes: updated._diffBytesAccumulatedSinceFull }) } catch {}
            set({ _efficiencyWarned: true })
          }
        }
      } catch {}
      return { full: false, patch }
    } catch { return null }
  },
  getThrottledSnapshotPatch: (() => {
    let lastTs = 0
    return (minIntervalMs = 1500) => {
      const now = Date.now()
      if (now - lastTs < minIntervalMs) return null
      lastTs = now
      return get().buildDiffPatch() || { heartbeat: true, ts: now }
    }
  })(),
  // Sweep expired leader locks
  sweepExpiredLocks: () => {
    const now = Date.now()
    const state = get()
    if (now - state._lastLockSweep < 2000) return // limit sweep frequency
    const expiry = state._lockExpiryMs
    const locks = state.leaderLocks
    let mutated = false
    const next = { ...locks }
    Object.entries(locks).forEach(([roomId, info]) => {
      if (info?.at && now - info.at > expiry) { delete next[roomId]; mutated = true }
    })
    if (mutated) {
      const stats = { ...get().lockStats, expiries: get().lockStats.expiries + 1 }
      set({ leaderLocks: next, _lastLockSweep: now, lockStats: stats })
      try { recordEvent('leader_lock_expired_sweep', { ts: now, expiries: stats.expiries }) } catch {}
    } else {
      set({ _lastLockSweep: now })
    }
  },
  acquireLeaderLock: (roomId, role) => {
    const locks = get().leaderLocks
    const stats = { ...get().lockStats, attempts: get().lockStats.attempts + 1 }
    if (locks[roomId]?.by && locks[roomId].by !== role) {
      stats.failed += 1
      set({ lockStats: stats })
      try { sessionStorage.setItem('nightfall_lock_stats', JSON.stringify({ ...stats, waitSamples: get()._lockWaitSamples })) } catch {}
      try { recordEvent('leader_lock_denied', { roomId, role, ts: Date.now() }) } catch {}
      // Start wait timer if another holds it
      const attempts = { ...get()._lockAttemptStarts }
      if (!attempts[roomId]) attempts[roomId] = Date.now()
      set({ _lockAttemptStarts: attempts })
      return false
    }
    stats.acquired += 1
    set({ leaderLocks: { ...locks, [roomId]: { by: role, at: Date.now() } }, lockStats: stats })
    // If we had a wait timer running, compute wait duration
    const attempts = { ...get()._lockAttemptStarts }
    if (attempts[roomId]) {
      const waitedMs = Date.now() - attempts[roomId]
      delete attempts[roomId]
      // Store aggregated wait stats inside lockStats (attach fields lazily)
      const ls = { ...get().lockStats }
      ls.waitedAcquisitions = (ls.waitedAcquisitions || 0) + 1
      ls.totalWaitMs = (ls.totalWaitMs || 0) + waitedMs
      // Percentile tracking
      const samples = [...get()._lockWaitSamples, waitedMs].slice(-200)
      const sorted = [...samples].sort((a,b)=>a-b)
      const pct = (q) => sorted.length ? sorted[Math.min(sorted.length-1, Math.floor(q * (sorted.length - 1)))] : 0
      ls.p50WaitMs = pct(0.5)
      ls.p95WaitMs = pct(0.95)
      set({ lockStats: ls, _lockAttemptStarts: attempts, _lockWaitSamples: samples })
      try { sessionStorage.setItem('nightfall_lock_stats', JSON.stringify({ ...ls, waitSamples: samples })) } catch {}
      try { recordEvent('leader_lock_wait_complete', { roomId, waitedMs }) } catch {}
    }
    try { recordEvent('leader_lock_acquired', { roomId, role, ts: Date.now() }) } catch {}
    try { sessionStorage.setItem('nightfall_lock_stats', JSON.stringify({ ...get().lockStats, waitSamples: get()._lockWaitSamples })) } catch {}
    return true
  },
  startLockAttempt: (roomId) => {
    const attempts = { ...get()._lockAttemptStarts }
    if (!attempts[roomId]) attempts[roomId] = Date.now()
    set({ _lockAttemptStarts: attempts })
  },
  completeLockAttempt: (roomId, success) => {
    const attempts = { ...get()._lockAttemptStarts }
    if (!attempts[roomId]) return
    const waitedMs = Date.now() - attempts[roomId]
    delete attempts[roomId]
    const ls = { ...get().lockStats }
    if (success) {
      ls.waitedAcquisitions = (ls.waitedAcquisitions || 0) + 1
      ls.totalWaitMs = (ls.totalWaitMs || 0) + waitedMs
      try { recordEvent('leader_lock_wait_acquired_remote', { roomId, waitedMs }) } catch {}
    } else {
      ls.failedWaits = (ls.failedWaits || 0) + 1
      try { recordEvent('leader_lock_wait_failed_remote', { roomId, waitedMs }) } catch {}
    }
    if (success) {
      const samples = [...get()._lockWaitSamples, waitedMs].slice(-200)
      const sorted = [...samples].sort((a,b)=>a-b)
      const pct = (q) => sorted.length ? sorted[Math.min(sorted.length-1, Math.floor(q * (sorted.length - 1)))] : 0
      ls.p50WaitMs = pct(0.5)
      ls.p95WaitMs = pct(0.95)
      set({ lockStats: ls, _lockAttemptStarts: attempts, _lockWaitSamples: samples })
      try { sessionStorage.setItem('nightfall_lock_stats', JSON.stringify({ ...ls, waitSamples: samples })) } catch {}
    } else {
      set({ lockStats: ls, _lockAttemptStarts: attempts })
      try { sessionStorage.setItem('nightfall_lock_stats', JSON.stringify({ ...ls, waitSamples: get()._lockWaitSamples })) } catch {}
    }
  },
  releaseLeaderLock: (roomId, role) => {
    const locks = get().leaderLocks
    if (locks[roomId]?.by !== role) return false
    const next = { ...locks }
    delete next[roomId]
    const stats = { ...get().lockStats, releases: get().lockStats.releases + 1 }
    set({ leaderLocks: next, lockStats: stats })
    try { recordEvent('leader_lock_released', { roomId, role, ts: Date.now() }) } catch {}
    try { sessionStorage.setItem('nightfall_lock_stats', JSON.stringify({ ...stats, waitSamples: get()._lockWaitSamples })) } catch {}
    return true
  },
  setGamePhase: phase => set({ gamePhase: phase }),
  setCurrentPlayerRole: role => set({ currentPlayerRole: role }),
  addChatMessage: msg => {
    const MAX_CHAT = 500
    const next = [...get().teamChat, msg]
    set({ teamChat: next.length > MAX_CHAT ? next.slice(-MAX_CHAT) : next })
  try { recordEvent('chat_message_added', { ts: Date.now(), kind: msg.kind || 'generic' }) } catch {}
  },
  updateTeamChat: updater => {
    const MAX_CHAT = 500
    const updated = updater(get().teamChat)
    set({ teamChat: updated.length > MAX_CHAT ? updated.slice(-MAX_CHAT) : updated })
  try { recordEvent('chat_bulk_update', { ts: Date.now(), size: updated.length }) } catch {}
  },
  updateRoomProgress: updater => set({ roomProgress: updater(get().roomProgress) }),
  setRoomProgress: next => set({ roomProgress: next }),
  setTimeLeft: val => set({ timeLeft: typeof val === 'function' ? val(get().timeLeft) : val }),
  decrementTimeLeft: () => set({ timeLeft: Math.max(0, get().timeLeft - 1) }),
  // Apply a full authoritative snapshot (multiplayer sync)
  applyFullSnapshot: (snap) => {
    if (!snap) return
    try {
      // Validate version & attempt migration if mismatch
      if (typeof snap.version === 'number' && snap.version !== SNAPSHOT_VERSION) {
        try { recordEvent('snapshot_version_mismatch', { from: snap.version, to: SNAPSHOT_VERSION }) } catch {}
        if (snap.version > SNAPSHOT_VERSION) {
          // Remote ahead: apply only safe known keys, flag for upgrade path
          useNightfallStore.setState({ remoteVersionAhead: true })
        }
        snap = get().migrateSnapshot ? get().migrateSnapshot(snap) : snap
      }
      const next = {}
      if (typeof snap.gamePhase === 'string') next.gamePhase = snap.gamePhase
      if (typeof snap.currentRoom === 'number') next.currentRoom = snap.currentRoom
      if (typeof snap.timeLeft === 'number') next.timeLeft = snap.timeLeft
      if (snap.roomProgress && typeof snap.roomProgress === 'object') next.roomProgress = snap.roomProgress
      set(next)
      try { recordEvent('store_full_snapshot_applied', { keys: Object.keys(next) }) } catch {}
      // Reset mismatch count after authoritative apply
  set({ snapshotMismatchCount: 0, _autoFullSyncAttempts: 0 })
    } catch {}
  },
  // Apply a diff patch (subset of snapshot fields)
  applyDiffPatch: (patch) => {
    if (!patch) return
    try {
      const st = get()
      const next = {}
  const allowedRoot = new Set(['gamePhase','currentRoom','timeLeft','roomProgress'])
  const unknown = Object.keys(patch).filter(k => !allowedRoot.has(k))
  if (unknown.length) { try { recordEvent('store_diff_patch_unknown_keys', { keys: unknown, remoteVersionAhead: st.remoteVersionAhead }) } catch {} }
      if (patch.gamePhase && patch.gamePhase !== st.gamePhase) next.gamePhase = patch.gamePhase
      if (typeof patch.currentRoom === 'number' && patch.currentRoom !== st.currentRoom) next.currentRoom = patch.currentRoom
      if (typeof patch.timeLeft === 'number' && patch.timeLeft !== st.timeLeft) next.timeLeft = patch.timeLeft
      if (patch.roomProgress && typeof patch.roomProgress === 'object') {
        const merged = { ...st.roomProgress }
        let changed = false
        Object.entries(patch.roomProgress).forEach(([roomId, partial]) => {
          if (!merged[roomId]) return
            const before = merged[roomId]
            const after = { ...before, ...partial }
            if (JSON.stringify(before) !== JSON.stringify(after)) { merged[roomId] = after; changed = true }
        })
        if (changed) next.roomProgress = merged
      }
      if (Object.keys(next).length) {
        set(next)
        try { recordEvent('store_diff_patch_applied', { keys: Object.keys(next) }) } catch {}
      }
    } catch {}
  },
  verifySnapshot: (snap) => {
    if (!snap) return false
    try {
      const clone = { ...snap }
      const provided = clone.checksum
      delete clone.checksum
      const expected = checksum(clone)
      const ok = provided === expected
  if (!ok) { try { recordEvent('snapshot_checksum_mismatch', { provided, expected }) } catch {} }
  // Persist integrity result in store (non-authoritative, local only)
      try {
        if (!ok) {
          const st = get()
            set({
              snapshotMismatchCount: (st.snapshotMismatchCount || 0) + 1,
              lastSnapshotMismatchTs: Date.now(),
            })
        }
        useNightfallStore.setState({ lastSnapshotIntegrityOk: ok, lastSnapshotVerifyTs: Date.now() })
      } catch {}
  return ok
    } catch { return false }
  },
  // Migration hook (currently identity). In future adjust structure safely.
  migrateSnapshot: (snap) => {
    // Example: if upgrading from version 0 to 1 we could initialize new fields.
    return snap
  },
}))

export default useNightfallStore
