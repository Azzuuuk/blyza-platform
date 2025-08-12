import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Shield, Cpu, Radio, Eye, Lock, Unlock, Terminal, Database,
  Satellite, Map, Clock, Trophy, Users, ArrowLeft, AlertTriangle,
  CheckCircle, Play, ArrowRight, KeyRound, Brain, Headphones, Search
} from 'lucide-react'
import { ROLES, ROOMS } from './engine/constants'
import { computeHasAllInputs, systemMessage, teamInputMessage } from './engine/gameEngine'
import { recordEvent, flush } from './engine/analytics'
import { buildMissionResults, submitMissionResults, getPendingResultRetries, processResultRetryQueue } from './engine/resultsPayload'
import { 
  initMultiplayer, 
  broadcastChat, onChatMessage, offChatMessage,
  broadcastTeamInput, onTeamInput, offTeamInput,
  broadcastRoomCompleted, onRoomCompleted, offRoomCompleted,
  broadcastStatePatch, onStatePatch, offStatePatch,
  getChatHistory,
  isMultiplayerStub,
  requestLeaderLock, releaseLeaderLock, onLockUpdate, offLockUpdate, onLockResult, offLockResult
} from './engine/socketClient'
import { requestFullSync } from './engine/socketClient'
import { getRealtimeMetrics } from './engine/socketClient'
import { useNightfallStore } from './engine/gameStore'
import toast from 'react-hot-toast'
import { MISSION_THEME, MISSION_ANIMATIONS } from './MissionTheme'
import { 
  TerminalWindow, 
  MissionProgress, 
  MissionTimer, 
  RoleBadge, 
  MissionButton, 
  ChatMessage 
} from './MissionComponents'

const OperationNightfall = () => {
  const navigate = useNavigate()

  // Inject mission animations CSS
  useEffect(() => {
    const styleSheet = document.createElement('style')
    styleSheet.textContent = MISSION_ANIMATIONS
    document.head.appendChild(styleSheet)
    return () => document.head.removeChild(styleSheet)
  }, [])

  // 🎮 Game State
  const [gamePhase, setGamePhase] = useState('briefing') // briefing, setup, playing, completed
  const [currentRoom, setCurrentRoom] = useState(1)
  const [timeLeft, setTimeLeft] = useState(1800) // local fallback if store flag not used
  const [sessionId] = useState(() => `sess-${Date.now()}-${Math.random().toString(36).slice(2,8)}`)
  const [startTime] = useState(Date.now())
  const [missionResults, setMissionResults] = useState(null)
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()
  const debugMode = searchParams.get('debug') === '1'
  const multiplayerMode = searchParams.get('multiplayer') === '1'
  const realtimeWanted = ['1','true','yes'].includes((searchParams.get('realtime')||searchParams.get('rt')||'0').toString())
  const storeMode = searchParams.get('store') === '1'
  const storeTimeLeft = storeMode ? useNightfallStore(s => s.timeLeft) : null
  const setStoreTimeLeft = storeMode ? useNightfallStore(s => s.setTimeLeft) : null
  const storeRoomProgress = storeMode ? useNightfallStore(s => s.roomProgress) : null
  const updateRoomProgressStore = storeMode ? useNightfallStore(s => s.updateRoomProgress) : null
  const effectiveTimeLeft = storeMode ? (storeTimeLeft ?? timeLeft) : timeLeft
  const [, forceRerender] = useState(0)

  // 🔄 Periodic analytics flush (every 10s while playing)
  useEffect(() => {
    if (gamePhase !== 'playing') return
    const iv = setInterval(() => {
      flush()
    }, 10000)
    return () => clearInterval(iv)
  }, [gamePhase])

  // 📤 Auto-submit mission results once computed (safe no-op if backend missing)
  useEffect(() => {
    if (missionResults) {
      submitMissionResults(missionResults)
      flush()
    }
  }, [missionResults])

  // 🔍 Debug panel refresher (only when debug=1)
  useEffect(() => {
    if (!debugMode) return
    const iv = setInterval(() => forceRerender(v => v + 1), 3000)
    return () => clearInterval(iv)
  }, [debugMode])

  const DebugOverlay = () => {
    if (!debugMode) return null
    const leaderLocks = (storeMode ? useNightfallStore(s => s.leaderLocks) : {}) || {}
    const lockStats = storeMode ? useNightfallStore(s => s.lockStats) : null
    const buildSnapshot = storeMode ? useNightfallStore(s => s.buildSnapshot) : null
  const integrityOk = storeMode ? useNightfallStore(s => s.lastSnapshotIntegrityOk) : null
  const integrityTs = storeMode ? useNightfallStore(s => s.lastSnapshotVerifyTs) : null
  const getPatchEfficiency = storeMode ? useNightfallStore(s => s.getPatchEfficiency) : null
  const efficiencyWarned = storeMode ? useNightfallStore(s => s._efficiencyWarned) : null
  const mismatchInfo = storeMode ? useNightfallStore(s => s.getSnapshotMismatchInfo && s.getSnapshotMismatchInfo()) : null
  const remoteVersionAhead = storeMode ? useNightfallStore(s => s.remoteVersionAhead) : null
    let snapMeta = null
    try { if (buildSnapshot) snapMeta = buildSnapshot() } catch {}
    return (
      <div style={{ position: 'fixed', bottom: 10, right: 10, width: 320, maxHeight: 400, overflow: 'auto', background: '#0f172a', color: '#e2e8f0', fontSize: 11, fontFamily: 'monospace', border: '1px solid #334155', borderRadius: 6, padding: 10, zIndex: 5000 }}>
        <div style={{ fontWeight: 'bold', marginBottom: 6, color: '#0ea5e9' }}>DEBUG PANEL</div>
        <div style={{ marginBottom: 8 }}>
          <button onClick={() => flush()} style={{ marginRight: 6 }}>Flush Events</button>
          <button onClick={async () => { await processResultRetryQueue(); forceRerender(v=>v+1) }} style={{ marginRight: 6 }}>Retry Results</button>
          <button onClick={() => forceRerender(v=>v+1)} style={{ marginRight: 6 }}>Refresh</button>
          <button onClick={() => { try { const snap = useNightfallStore.getState().buildSnapshot(); console.log('SNAPSHOT', snap); toast.success('Snapshot logged'); } catch { toast.error('Snapshot failed') } }}>Snapshot</button>
          {multiplayerMode && storeMode && (
            <button onClick={() => { try { const snap = useNightfallStore.getState().buildSnapshot(); broadcastStatePatch({ full: true, snapshot: snap, ts: snap.ts, local: true }); toast.success('Full snapshot broadcasted'); } catch { toast.error('Full sync failed') } }} style={{ marginLeft: 6 }}>Force Full Sync</button>
          )}
          {multiplayerMode && (
            <button onClick={() => { try { requestFullSync(); toast.success('Full state requested') } catch { toast.error('Request failed') } }} style={{ marginLeft: 6 }}>Request Full</button>
          )}
          {multiplayerMode && (
            <button onClick={() => { broadcastStatePatch({ heartbeat: true, ts: Date.now(), local: true }); toast.success('Heartbeat sent') }} style={{ marginLeft: 6 }}>Heartbeat</button>
          )}
        </div>
        <div style={{ marginBottom: 8 }}>
          <div>Session: {sessionId}</div>
          <div>GamePhase: {gamePhase}</div>
          <div>Pending Result Retries: {getPendingResultRetries().length}</div>
          <div>StoreMode: {storeMode ? 'ON' : 'off'}</div>
          <div>MP Mode: {multiplayerMode ? 'ON' : 'off'}</div>
          {snapMeta && (
            <div style={{ marginTop: 4 }}>
              <div>Snap Ver: {snapMeta.version} ck:{snapMeta.checksum}</div>
              <div>Snap Age: {Math.max(0, Date.now() - snapMeta.ts)}ms</div>
              {integrityTs && <div>Integrity: <span style={{ color: integrityOk ? '#22c55e' : '#ef4444' }}>{integrityOk ? 'OK' : 'MISMATCH'}</span> ({Math.max(0, Date.now() - integrityTs)}ms)</div>}
              {getPatchEfficiency && (() => { const e = getPatchEfficiency(); return (
                <div style={{ marginTop: 4 }}>
                  <div style={{ fontWeight:'bold', color:'#0ea5e9' }}>Patch Efficiency</div>
                  <div>Last Full: {e.lastFullBytes} B</div>
                  <div>Diff Bytes: {e.diffBytes} B in {e.diffPatches} patches</div>
                  <div>Accum Ratio: {(e.ratio*100).toFixed(1)}%</div>
                  {efficiencyWarned && <div style={{ color:'#fbbf24', fontWeight:'bold' }}>Suggest Full Sync (60%+)</div>}
                </div>
              ) })()}
            </div>
          )}
          {multiplayerMode && (
            <div style={{ marginTop: 6 }}>
              {(() => { const m = getRealtimeMetrics(); return (
                <>
                  <div style={{ fontWeight: 'bold', color: '#0ea5e9' }}>Realtime Metrics ({m.mode})</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
                    <span>Patch Sent:</span><span>{m.patchesSent}</span>
                    <span>Patch Recv:</span><span>{m.patchesReceived}</span>
                    <span>Full Sent:</span><span>{m.fullSnapshotsSent}</span>
                    <span>Full Recv:</span><span>{m.fullSnapshotsReceived}</span>
                    <span>Chat Sent:</span><span>{m.chatSent}</span>
                    <span>Chat Recv:</span><span>{m.chatReceived}</span>
                    <span>Last Patch B:</span><span>{m.lastPatchBytes}</span>
                    <span>Total Patch B:</span><span>{m.totalPatchBytes}</span>
                    {m.prev && <>
                      <span style={{ gridColumn: 'span 2', fontWeight: 'bold', color: '#0ea5e9', marginTop: 4 }}>Δ Since Refresh</span>
                      <span>ΔPatch S:</span><span>{m.patchesSent - (m.prev.patchesSent||0)}</span>
                      <span>ΔPatch R:</span><span>{m.patchesReceived - (m.prev.patchesReceived||0)}</span>
                      <span>ΔFull S:</span><span>{m.fullSnapshotsSent - (m.prev.fullSnapshotsSent||0)}</span>
                      <span>ΔFull R:</span><span>{m.fullSnapshotsReceived - (m.prev.fullSnapshotsReceived||0)}</span>
                      <span>ΔChat S:</span><span>{m.chatSent - (m.prev.chatSent||0)}</span>
                      <span>ΔChat R:</span><span>{m.chatReceived - (m.prev.chatReceived||0)}</span>
                      <span>ΔTotal B:</span><span>{m.totalPatchBytes - (m.prev.totalPatchBytes||0)}</span>
                    </>}
                  </div>
                </>
              ) })()}
            </div>
          )}
        </div>
        {storeMode && (
          <div style={{ marginTop: 6 }}>
            <div style={{ fontWeight: 'bold', color: '#0ea5e9' }}>Leader Locks</div>
            {Object.keys(leaderLocks).length === 0 && <div style={{ opacity: 0.6 }}>none</div>}
            {Object.entries(leaderLocks).map(([roomId, info]) => (
              <div key={roomId}>Room {roomId}: {info.by} {(Date.now()-info.at)>5000?'(stale?)':''}</div>
            ))}
            {lockStats && (
              <div style={{ marginTop: 4 }}>
                <div style={{ fontWeight: 'bold', color: '#0ea5e9' }}>Lock Stats</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 8px' }}>
                  <span>Attempts:</span><span>{lockStats.attempts}</span>
                  <span>Acquired:</span><span>{lockStats.acquired}</span>
                  <span>Failed:</span><span>{lockStats.failed}</span>
                  <span>Releases:</span><span>{lockStats.releases}</span>
                  <span>Expiries:</span><span>{lockStats.expiries}</span>
                  {lockStats.waitedAcquisitions !== undefined && <><span>Waited Acq:</span><span>{lockStats.waitedAcquisitions}</span></>}
                  {lockStats.totalWaitMs !== undefined && <><span>Total Wait:</span><span>{lockStats.totalWaitMs}ms</span></>}
                  {lockStats.waitedAcquisitions && lockStats.totalWaitMs ? <><span>Avg Wait:</span><span>{(lockStats.totalWaitMs/lockStats.waitedAcquisitions).toFixed(0)}ms</span></> : null}
                  {lockStats.p50WaitMs !== undefined && <><span>P50 Wait:</span><span>{lockStats.p50WaitMs}ms</span></>}
                  {lockStats.p95WaitMs !== undefined && <><span>P95 Wait:</span><span>{lockStats.p95WaitMs}ms</span></>}
                </div>
                {lockStats.attempts > 0 && <div>Success Rate: {((lockStats.acquired / lockStats.attempts)*100).toFixed(1)}%</div>}
                <button style={{ marginTop: 4 }} onClick={() => {
                  try {
                    sessionStorage.removeItem('nightfall_lock_stats')
                    const st = useNightfallStore.getState()
                    useNightfallStore.setState({ lockStats: { attempts:0, acquired:0, failed:0, releases:0, expiries:0 }, _lockWaitSamples: [] })
                    toast.success('Lock stats cleared')
                  } catch { toast.error('Clear failed') }
                }}>Clear Lock Stats</button>
              </div>
            )}
          </div>
        )}
        {storeMode && mismatchInfo && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight:'bold', color:'#0ea5e9' }}>Snapshot Integrity</div>
            <div>Mismatches: {mismatchInfo.count}</div>
            {mismatchInfo.lastTs && <div>Last: {Math.max(0, Date.now() - mismatchInfo.lastTs)}ms ago</div>}
            {remoteVersionAhead && <div style={{ color:'#fbbf24' }}>Remote version ahead</div>}
          </div>
        )}
        <div style={{ marginBottom: 4, fontWeight: 'bold' }}>Latest Chat (5)</div>
        {teamChat.slice(-5).map(m => (
          <div key={m.id || m.timestamp} style={{ opacity: 0.8 }}>[{m.type}] {m.content || m.message}</div>
        ))}
      </div>
    )
  }

  // 👥 Team Setup
  const [playerNames, setPlayerNames] = useState(['', '', '', ''])
  const [assignedRoles, setAssignedRoles] = useState(['', '', '', ''])
  const [activePlayerCount, setActivePlayerCount] = useState(4)
  const [currentPlayerRole, setCurrentPlayerRole] = useState('')

  // 🎯 Room Progress & Team Inputs (local fallback; optional Zustand store)
  const [roomProgressLocal, setRoomProgressLocal] = useState({
    1: { unlocked: true, completed: false, leadReady: false, teamInputs: {} },
    2: { unlocked: false, completed: false, leadReady: false, teamInputs: {} },
    3: { unlocked: false, completed: false, leadReady: false, teamInputs: {} },
    4: { unlocked: false, completed: false, leadReady: false, teamInputs: {} }
  })
  const roomProgress = storeMode ? (storeRoomProgress || roomProgressLocal) : roomProgressLocal
  const updateRoomProgress = (updater) => {
    if (storeMode && updateRoomProgressStore) {
      updateRoomProgressStore(prev => updater(prev))
    } else {
      setRoomProgressLocal(prev => updater(prev))
    }
  }

  // 💬 Team Communication
  // Chat: local fallback + optional store-backed mode (mirrors roomProgress pattern)
  const [teamChatLocal, setTeamChatLocal] = useState([])
  const storeTeamChat = storeMode ? useNightfallStore(s => s.teamChat) : null
  const addChatMessageStore = storeMode ? useNightfallStore(s => s.addChatMessage) : null
  const updateTeamChatStore = storeMode ? useNightfallStore(s => s.updateTeamChat) : null
  const teamChat = storeMode ? (storeTeamChat || teamChatLocal) : teamChatLocal
  const updateTeamChat = (updater) => {
    if (storeMode && updateTeamChatStore) {
      updateTeamChatStore(prev => updater(prev))
    } else {
      setTeamChatLocal(prev => updater(prev))
    }
  }
  const pushChat = (entry) => updateTeamChat(prev => [...prev, entry])
  const [newMessage, setNewMessage] = useState('')

  // 🏢 Mission Theme Configuration (Updated)
  const missionTheme = MISSION_THEME.colors

  // ROLES & ROOMS centralized in engine/constants

  // 🎮 Helper Functions (must be declared first)
  // NOTE: Avoid useCallback here so we always reference latest state (previous memo caused stale closures)
  const addSystemMessage = (message) => {
    pushChat(systemMessage(message))
  }

  const handleMissionComplete = () => {
    setGamePhase('completed')
    addSystemMessage('🏁 OPERATION NIGHTFALL COMPLETE')
  }

  // ⏰ Timer Effect (moved after function declarations)
  useEffect(() => {
    if (gamePhase === 'playing' && effectiveTimeLeft > 0) {
      const timer = setInterval(() => {
        const updater = (prev) => {
          if (prev <= 1) {
            setGamePhase('completed')
  pushChat(systemMessage('🏁 OPERATION NIGHTFALL COMPLETE'))
            return 0
          }
          return prev - 1
        }
        if (storeMode && setStoreTimeLeft) {
          setStoreTimeLeft(Math.max(0, (storeTimeLeft || 0) - 1))
        } else {
          setTimeLeft(updater)
        }
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [gamePhase, effectiveTimeLeft, storeMode, storeTimeLeft, setStoreTimeLeft])

  // 🎮 Game Functions
  const startMission = () => {
    // Recompute validation each click using freshest state
    const trimmed = playerNames.slice(0, activePlayerCount)
    const validPlayers = trimmed.every(name => name && name.trim().length > 0)
    const rolesSlice = assignedRoles.slice(0, activePlayerCount)
    const validRoles = rolesSlice.every(role => role)

    if (!validPlayers || !validRoles || !currentPlayerRole) {
      toast.error('Please complete all player names, role assignments, and select your role!')
      return
    }

    setGamePhase('playing')
    if (multiplayerMode) {
      initMultiplayer(sessionId, currentPlayerRole, { realtime: realtimeWanted })
    }
    // Broadcast an initial full snapshot for late joiners if store mode is active
    if (multiplayerMode && storeMode) {
      try {
        const snap = useNightfallStore.getState().buildSnapshot()
        broadcastStatePatch({ full: true, snapshot: snap, ts: snap.ts, local: true })
      } catch {}
    }
    addSystemMessage('🚨 OPERATION NIGHTFALL INITIATED. All personnel report to assigned stations.')
    recordEvent('mission_started', {
      sessionId,
      playerCount: activePlayerCount,
      roles: assignedRoles.slice(0, activePlayerCount).filter(Boolean),
      ts: Date.now()
    })
  }

  const handleTeamInput = (inputType, data, role) => {
    const room = ROOMS[currentRoom]
    
    // Update room progress with team input
  updateRoomProgress(prev => ({
      ...prev,
      [currentRoom]: {
        ...prev[currentRoom],
        teamInputs: {
          ...prev[currentRoom].teamInputs,
          [inputType]: { data, providedBy: role, timestamp: Date.now() }
        }
      }
    }))

    // Add team message
  pushChat(teamInputMessage(role, inputType))

    // Check if leader can now submit
    const updatedInputs = {
      ...roomProgress[currentRoom].teamInputs,
      [inputType]: { data, providedBy: role, timestamp: Date.now() }
    }
    
  // Use pure helper for consistency with future engine
  const hasAllInputs = computeHasAllInputs(room, updatedInputs)
    
    if (hasAllInputs) {
  updateRoomProgress(prev => ({
        ...prev,
        [currentRoom]: {
          ...prev[currentRoom],
          leadReady: true
        }
      }))
  pushChat(systemMessage(`✅ All team inputs received. ${ROLES[room.leadRole].name} authorized to proceed.`))
    }

    toast.success(`Input provided: ${inputType.replace('-', ' ')}`)

    if (multiplayerMode) {
      broadcastTeamInput({
        roomId: currentRoom,
        inputType,
        data,
        role,
        ts: Date.now(),
        local: true
      })
    }
  }

  const submitRoomSolution = () => {
    const room = ROOMS[currentRoom]
    const progress = roomProgress[currentRoom]
    const acquireLeaderLock = storeMode ? useNightfallStore.getState().acquireLeaderLock : null
    const releaseLeaderLock = storeMode ? useNightfallStore.getState().releaseLeaderLock : null
    const persistSnapshot = storeMode ? useNightfallStore.getState().persistSnapshot : null
    const getThrottledSnapshotPatch = storeMode ? useNightfallStore.getState().getThrottledSnapshotPatch : null
    
    // Verify leader role and all inputs
    if (currentPlayerRole !== room.leadRole) {
      toast.error(`Only the ${ROLES[room.leadRole].name} can submit the solution!`)
      return
    }

    if (!progress.leadReady) {
      toast.error('You need input from all team members first!')
      return
    }

    // Optional leader lock (store mode + multiplayer) to avoid double fires
    if (multiplayerMode && storeMode && acquireLeaderLock) {
      const ok = acquireLeaderLock(currentRoom, currentPlayerRole)
      if (!ok) {
        toast.error('Another leader submission is in progress.')
        return
      }
      requestLeaderLock(currentRoom, currentPlayerRole)
    }

    // Success!
  updateRoomProgress(prev => ({
      ...prev,
      [currentRoom]: {
        ...prev[currentRoom],
        completed: true
      },
      [currentRoom + 1]: currentRoom < 4 ? {
        ...prev[currentRoom + 1],
        unlocked: true
      } : prev[currentRoom + 1]
    }))

    // Persist snapshot after state mutation (optimistic)
    if (persistSnapshot) persistSnapshot()

    if (multiplayerMode) {
      broadcastRoomCompleted({ roomId: currentRoom, ts: Date.now(), local: true })
      // Send minimal state patch (only changed pieces)
      const patch = {
        ts: Date.now(),
        roomProgress: {
          [currentRoom]: { completed: true },
          ...(currentRoom < 4 ? { [currentRoom + 1]: { unlocked: true } } : {})
        },
        local: true
      }
      broadcastStatePatch(patch)
      // Optionally send a throttled richer snapshot for late joiners
      if (getThrottledSnapshotPatch) {
        const snap = getThrottledSnapshotPatch()
        if (snap) broadcastStatePatch({ ts: snap.ts, snapshot: snap, local: true })
      }
    }

    if (multiplayerMode && releaseLeaderLock) {
      releaseLeaderLock(currentRoom, currentPlayerRole)
    }

  pushChat(systemMessage(`🎉 ${room.name.toUpperCase()} SECURED! Excellent teamwork.`))
    recordEvent('room_completed', {
      sessionId,
      roomId: currentRoom,
      roomName: room.name,
      leadRole: room.leadRole,
      elapsedSeconds: Math.floor((Date.now() - startTime) / 1000)
    })
    
    if (currentRoom < 4) {
      setTimeout(() => {
        setCurrentRoom(prev => prev + 1)
  pushChat(systemMessage(`🚪 Advancing to ${ROOMS[currentRoom + 1].name.toUpperCase()}`))
  pushChat(systemMessage(`👤 ${ROLES[ROOMS[currentRoom + 1].leadRole].name.toUpperCase()} takes operational lead.`))
        if (persistSnapshot) persistSnapshot()
      }, 2000)
    } else {
      setTimeout(() => {
        setGamePhase('completed')
        const completionMsg = systemMessage('🏁 OPERATION NIGHTFALL COMPLETE')
  pushChat(completionMsg)
        const results = buildMissionResults({
          sessionId,
          startTime,
          endTime: Date.now(),
          roomProgress,
          teamChat: [...teamChat, completionMsg]
        })
        setMissionResults(results)
        recordEvent('mission_completed', { ...results.summary, sessionId })
        if (persistSnapshot) persistSnapshot()
      }, 2000)
    }

    toast.success('🎉 Room completed! Advancing...')
  }

  const sendTeamMessage = () => {
    if (!newMessage.trim()) return

    const message = {
      id: Date.now(),
      type: 'player',
      role: currentPlayerRole.toUpperCase(),
      content: newMessage,
      timestamp: new Date().toLocaleTimeString()
    }
    
  pushChat(message)
    if (multiplayerMode) {
      broadcastChat({ ...message, local: true })
    }
    setNewMessage('')
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Removed locally-defined TerminalWindow to avoid remount flashes; using imported stable component.

  const MissionHUD = () => {
    const room = ROOMS[currentRoom]
    const completedRooms = Object.values(roomProgress).filter(r => r.completed).length
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '70px',
        background: missionTheme.terminal,
        border: `1px solid ${missionTheme.accent}`,
        backdropFilter: 'blur(15px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        fontFamily: missionTheme.fontFamily
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ color: missionTheme.classified, fontWeight: 'bold', fontSize: '14px' }}>
            CLASSIFIED
          </span>
          <span style={{ color: missionTheme.accent, fontSize: '16px', fontWeight: 'bold' }}>
            OPERATION NIGHTFALL - {room.name.toUpperCase()}
          </span>
        </div>
        
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '30px', fontSize: '14px' }}>
          <div>
            <span style={{ color: missionTheme.accent }}>TIME: </span>
            <span style={{ color: effectiveTimeLeft < 300 ? missionTheme.warning : '#fff', fontWeight: 'bold' }}>
              {formatTime(effectiveTimeLeft)}
            </span>
          </div>
          <div>
            <span style={{ color: missionTheme.accent }}>PROGRESS: </span>
            <span style={{ color: '#fff', fontWeight: 'bold' }}>
              {completedRooms}/4
            </span>
          </div>
          <div>
            <span style={{ color: missionTheme.accent }}>ROLE: </span>
            <span style={{ color: ROLES[currentPlayerRole]?.color || '#fff', fontWeight: 'bold' }}>
              {ROLES[currentPlayerRole]?.name?.toUpperCase() || 'SELECT ROLE'}
            </span>
          </div>
          {multiplayerMode && (
            <div>
              <span style={{ color: missionTheme.accent }}>MULTI: </span>
              <span style={{ color: isMultiplayerStub() ? '#0ea5e9' : '#22c55e', fontWeight: 'bold' }}>
                {isMultiplayerStub() ? 'STUB' : 'REAL'}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Multiplayer stub listener (chat)
  useEffect(() => {
    if (!multiplayerMode) return
    const handler = (msg) => {
      if (msg.local) return
  pushChat(msg)
    }
    const off = onChatMessage(handler)
    // Preload backlog (avoid duplicates)
    getChatHistory().forEach(m => {
      updateTeamChat(prev => {
        if (prev.some(p => p.id === m.id)) return prev
        return [...prev, { ...m, backlog: true }]
      })
    })
    return () => {
      offChatMessage(handler)
      if (typeof off === 'function') off()
    }
  }, [multiplayerMode])

  // Multiplayer: team input listener
  useEffect(() => {
    if (!multiplayerMode) return
    const handler = (evt) => {
      if (evt.local) return
      const { roomId, inputType, data, role } = evt
  updateRoomProgress(prev => {
        const roomState = prev[roomId]
        if (!roomState) return prev
        if (roomState.teamInputs[inputType]) return prev // already present
        return {
          ...prev,
          [roomId]: {
            ...roomState,
            teamInputs: {
              ...roomState.teamInputs,
              [inputType]: { data, providedBy: role, timestamp: Date.now() }
            }
          }
        }
      })
  pushChat(teamInputMessage(role, inputType))
    }
    const off = onTeamInput(handler)
    return () => { offTeamInput(handler); if (typeof off === 'function') off() }
  }, [multiplayerMode])

  // Multiplayer: room completed listener
  useEffect(() => {
    if (!multiplayerMode) return
    const handler = (evt) => {
      if (evt.local) return
      const { roomId } = evt
  updateRoomProgress(prev => ({
        ...prev,
        [roomId]: { ...prev[roomId], completed: true }
      }))
    }
    const off = onRoomCompleted(handler)
    return () => { offRoomCompleted(handler); if (typeof off === 'function') off() }
  }, [multiplayerMode])

  // Multiplayer: generic state patch listener
  useEffect(() => {
    if (!multiplayerMode) return
    let diffCountSinceFull = 0
    const handler = (evt) => {
      if (evt.local) return
      if (evt.heartbeat) return
      // Full snapshot apply
      if (evt.full && evt.snapshot) {
        diffCountSinceFull = 0
        if (storeMode) {
          try {
            const st = useNightfallStore.getState()
            const ok = st.verifySnapshot ? st.verifySnapshot(evt.snapshot) : true
            if (!ok) {
              // Force request of another full snapshot by re-broadcasting our local (fallback) or logging
              try { recordEvent('snapshot_verify_failed', { ts: Date.now() }) } catch {}
              // Log only; still apply so user isn't stuck
              try { toast.error('Snapshot integrity mismatch; requesting resync') } catch {}
              try {
                if (st.shouldAutoRequestFullSync && st.shouldAutoRequestFullSync()) {
                  requestFullSync(); st.noteAutoRequestPerformed && st.noteAutoRequestPerformed(); toast('Auto requested full sync (checksum mismatch)', { icon: '♻️' })
                }
              } catch {}
            }
            st.applyFullSnapshot(evt.snapshot)
          } catch {}
          // Reflect critical fields for local component state still outside store
          if (typeof evt.snapshot.gamePhase === 'string') setGamePhase(evt.snapshot.gamePhase)
          if (typeof evt.snapshot.currentRoom === 'number') setCurrentRoom(evt.snapshot.currentRoom)
        } else {
          const snap = evt.snapshot
          if (snap.roomProgress) {
            updateRoomProgress(() => snap.roomProgress)
          }
          if (typeof snap.currentRoom === 'number') setCurrentRoom(snap.currentRoom)
          if (snap.gamePhase) setGamePhase(snap.gamePhase)
          if (typeof snap.timeLeft === 'number') setTimeLeft(snap.timeLeft)
        }
        return
      }
      // Diff patch apply
      if (evt.patch) {
        diffCountSinceFull++
        const { patch } = evt
        if (storeMode) {
          try { useNightfallStore.getState().applyDiffPatch(patch) } catch {}
          if (typeof patch.currentRoom === 'number') setCurrentRoom(patch.currentRoom)
          if (patch.gamePhase) setGamePhase(patch.gamePhase)
          // Opportunistic integrity verification for key structural diffs
          try {
            if (patch.roomProgress || patch.currentRoom !== undefined) {
              const st = useNightfallStore.getState()
              const snap = st.buildSnapshot()
              const ok = st.verifySnapshot(snap)
              if (!ok && st.shouldAutoRequestFullSync && st.shouldAutoRequestFullSync()) {
                requestFullSync(); st.noteAutoRequestPerformed && st.noteAutoRequestPerformed(); toast('Auto requested full sync (diff mismatch)', { icon: '♻️' })
              }
            }
          } catch {}
        } else {
          if (patch.roomProgress) {
            const rpPatch = patch.roomProgress
            updateRoomProgress(prev => {
              let changed = false
              const next = { ...prev }
              Object.entries(rpPatch).forEach(([roomId, partial]) => {
                if (!next[roomId]) return
                const merged = { ...next[roomId], ...partial }
                const before = next[roomId]
                if (before.completed !== merged.completed || before.unlocked !== merged.unlocked || before.leadReady !== merged.leadReady) {
                  next[roomId] = merged
                  changed = true
                }
              })
              return changed ? next : prev
            })
          }
          if (typeof patch.currentRoom === 'number') setCurrentRoom(patch.currentRoom)
          if (typeof patch.timeLeft === 'number') setTimeLeft(patch.timeLeft)
          if (patch.gamePhase) setGamePhase(patch.gamePhase)
        }
        // Auto request / broadcast a full snapshot periodically to prevent drift
        if (storeMode && diffCountSinceFull >= 15) {
          diffCountSinceFull = 0
          try {
            const snap = useNightfallStore.getState().buildSnapshot()
            try { useNightfallStore.getState().markFullSnapshotBroadcast(snap) } catch {}
            broadcastStatePatch({ full: true, snapshot: snap, ts: snap.ts, local: true })
            recordEvent('auto_full_snapshot_emit', { ts: Date.now() })
          } catch {}
        }
        return
      }
      // Legacy simple partial roomProgress message
      const { roomProgress: legacyPatch } = evt
      if (!legacyPatch) return
      updateRoomProgress(prev => {
        let changed = false
        const next = { ...prev }
        Object.entries(legacyPatch).forEach(([roomId, partial]) => {
          if (!next[roomId]) return
          const merged = { ...next[roomId], ...partial }
          const before = next[roomId]
          if (before.completed !== merged.completed || before.unlocked !== merged.unlocked || before.leadReady !== merged.leadReady) {
            next[roomId] = merged
            changed = true
          }
        })
        return changed ? next : prev
      })
    }
    const off = onStatePatch(handler)
    return () => { offStatePatch(handler); if (typeof off === 'function') off() }
  }, [multiplayerMode])

  // Multiplayer: leader lock updates
  useEffect(() => {
    if (!(multiplayerMode && storeMode)) return
    const applyUpdate = evt => {
      const { roomId, by } = evt
      try {
        const st = useNightfallStore.getState()
        const cur = st.leaderLocks || {}
        const next = { ...cur }
        if (by) {
          next[roomId] = { by, at: Date.now() }
        } else {
          delete next[roomId]
        }
        useNightfallStore.setState({ leaderLocks: next })
      } catch {}
    }
    const offU = onLockUpdate(applyUpdate)
    const offR = onLockResult(res => {
      if (!res.success) toast.error('Lock denied by another leader')
    })
    return () => { offLockUpdate(applyUpdate); offLockResult(()=>{}); if (typeof offU==='function') offU(); if (typeof offR==='function') offR() }
  }, [multiplayerMode, storeMode])

  // Multiplayer: periodic diff/full snapshot broadcast + lock expiry sweep
  useEffect(() => {
    if (!(multiplayerMode && storeMode)) return
    const interval = setInterval(() => {
      try {
        const st = useNightfallStore.getState()
        if (st.sweepExpiredLocks) st.sweepExpiredLocks()
        if (st.getThrottledSnapshotPatch) {
          const diff = st.getThrottledSnapshotPatch(1500)
          if (diff) {
            if (diff.full) {
              broadcastStatePatch({ full: true, snapshot: diff.snapshot, ts: diff.snapshot.ts, local: true })
            } else if (diff.patch) {
              broadcastStatePatch({ full: false, patch: diff.patch, ts: Date.now(), local: true })
            }
          }
        }
      } catch {}
    }, 2000)
    return () => clearInterval(interval)
  }, [multiplayerMode, storeMode])

  // 📱 Phase: Mission Briefing (REDESIGNED)
  if (gamePhase === 'briefing') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: MISSION_THEME.colors.background.primary,
        color: MISSION_THEME.colors.text.primary,
        fontFamily: MISSION_THEME.typography.primary,
        position: 'relative',
        overflow: 'hidden'
      }}>
  <DebugOverlay />
        {/* Animated Background Elements */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(0, 255, 136, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(0, 128, 255, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />
        
        {/* Scanning Lines */}
        <div className="scan-line" />
        
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '40px 20px',
          position: 'relative',
          zIndex: 1
        }}>
          
          {/* Mission Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center', marginBottom: '50px' }}
          >
            <div style={{
              width: '120px',
              height: '120px',
              background: `linear-gradient(135deg, ${MISSION_THEME.colors.primary}, ${MISSION_THEME.colors.secondary})`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 30px',
              boxShadow: MISSION_THEME.shadows.glow.primary,
              position: 'relative'
            }}>
              <Shield style={{ width: 60, height: 60, color: '#000' }} />
              <div className="hologram" style={{ position: 'absolute', inset: 0, borderRadius: '50%' }} />
            </div>
            
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
              style={{ 
                fontSize: '56px', 
                fontWeight: '900', 
                background: `linear-gradient(135deg, ${MISSION_THEME.colors.primary}, ${MISSION_THEME.colors.secondary})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '20px',
                letterSpacing: '3px',
                fontFamily: MISSION_THEME.typography.display,
                textShadow: `0 0 30px ${MISSION_THEME.colors.primary}50`
              }}
            >
              OPERATION NIGHTFALL
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                background: `linear-gradient(135deg, ${MISSION_THEME.colors.danger}20, transparent)`,
                border: `2px solid ${MISSION_THEME.colors.danger}`,
                borderRadius: '25px',
                padding: '12px 24px',
                boxShadow: MISSION_THEME.shadows.glow.danger
              }}
            >
              <AlertTriangle style={{ width: 20, height: 20, color: MISSION_THEME.colors.danger }} />
              <span style={{ 
                color: MISSION_THEME.colors.danger, 
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                fontSize: '14px'
              }}>
                CLASSIFIED OPERATION
              </span>
            </motion.div>
          </motion.div>

          {/* Mission Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '2fr 1fr', 
            gap: '30px',
            marginBottom: '40px'
          }}>
            
            {/* Main Briefing Panel */}
            <TerminalWindow title="MISSION BRIEFING" status="classified">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                <h3 style={{ 
                  color: MISSION_THEME.colors.primary, 
                  marginBottom: '20px', 
                  fontSize: '20px',
                  fontFamily: MISSION_THEME.typography.display,
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  SITUATION CRITICAL
                </h3>
                
                <div style={{ 
                  color: MISSION_THEME.colors.text.secondary, 
                  fontSize: '16px', 
                  lineHeight: '1.8',
                  marginBottom: '25px'
                }}>
                  <p style={{ marginBottom: '15px' }}>
                    Intelligence has detected a <strong style={{ color: MISSION_THEME.colors.danger }}>security breach</strong> in 
                    our classified facility. Enemy operatives have infiltrated multiple sectors and are attempting to extract 
                    sensitive data.
                  </p>
                  <p style={{ marginBottom: '15px' }}>
                    You are the <strong style={{ color: MISSION_THEME.colors.primary }}>elite team</strong> sent to investigate 
                    and secure the compromised areas before critical intelligence falls into enemy hands.
                  </p>
                  <p>
                    <strong style={{ color: MISSION_THEME.colors.warning }}>Time is critical.</strong> Work together, trust your 
                    team, and execute the mission with precision.
                  </p>
                </div>

                {/* Mission Objectives */}
                <div style={{
                  background: `linear-gradient(135deg, ${MISSION_THEME.colors.primary}10, transparent)`,
                  border: `1px solid ${MISSION_THEME.colors.primary}30`,
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: '20px'
                }}>
                  <h4 style={{ 
                    color: MISSION_THEME.colors.primary, 
                    marginBottom: '15px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontSize: '14px'
                  }}>
                    PRIMARY OBJECTIVES
                  </h4>
                  <ul style={{ 
                    listStyle: 'none', 
                    padding: 0,
                    color: MISSION_THEME.colors.text.secondary
                  }}>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                      <CheckCircle style={{ width: 16, height: 16, color: MISSION_THEME.colors.primary, marginRight: '12px' }} />
                      Secure 4 critical facility sectors
                    </li>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                      <CheckCircle style={{ width: 16, height: 16, color: MISSION_THEME.colors.primary, marginRight: '12px' }} />
                      Disable enemy surveillance systems
                    </li>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                      <CheckCircle style={{ width: 16, height: 16, color: MISSION_THEME.colors.primary, marginRight: '12px' }} />
                      Extract compromised personnel
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircle style={{ width: 16, height: 16, color: MISSION_THEME.colors.primary, marginRight: '12px' }} />
                      Prevent data exfiltration
                    </li>
                  </ul>
                </div>
              </motion.div>
            </TerminalWindow>

            {/* Mission Stats Panel */}
            <TerminalWindow title="MISSION PARAMETERS" status="online">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    style={{
                      background: `linear-gradient(135deg, ${MISSION_THEME.colors.primary}20, transparent)`,
                      border: `1px solid ${MISSION_THEME.colors.primary}30`,
                      borderRadius: '8px',
                      padding: '15px',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: MISSION_THEME.colors.primary }}>4</div>
                    <div style={{ fontSize: '12px', color: MISSION_THEME.colors.text.secondary, textTransform: 'uppercase' }}>SECTORS</div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                    style={{
                      background: `linear-gradient(135deg, ${MISSION_THEME.colors.warning}20, transparent)`,
                      border: `1px solid ${MISSION_THEME.colors.warning}30`,
                      borderRadius: '8px',
                      padding: '15px',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: MISSION_THEME.colors.warning }}>30</div>
                    <div style={{ fontSize: '12px', color: MISSION_THEME.colors.text.secondary, textTransform: 'uppercase' }}>MINUTES</div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.0, duration: 0.5 }}
                    style={{
                      background: `linear-gradient(135deg, ${MISSION_THEME.colors.secondary}20, transparent)`,
                      border: `1px solid ${MISSION_THEME.colors.secondary}30`,
                      borderRadius: '8px',
                      padding: '15px',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: MISSION_THEME.colors.secondary }}>4</div>
                    <div style={{ fontSize: '12px', color: MISSION_THEME.colors.text.secondary, textTransform: 'uppercase' }}>AGENTS</div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.1, duration: 0.5 }}
                    style={{
                      background: `linear-gradient(135deg, ${MISSION_THEME.colors.danger}20, transparent)`,
                      border: `1px solid ${MISSION_THEME.colors.danger}30`,
                      borderRadius: '8px',
                      padding: '15px',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: MISSION_THEME.colors.danger }}>HIGH</div>
                    <div style={{ fontSize: '12px', color: MISSION_THEME.colors.text.secondary, textTransform: 'uppercase' }}>THREAT</div>
                  </motion.div>
                </div>

                {/* Role Preview */}
                <div>
                  <h4 style={{ 
                    color: MISSION_THEME.colors.text.primary, 
                    marginBottom: '15px',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    SPECIALIZED ROLES
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.entries(ROLES).map(([key, role]) => (
                      <RoleBadge key={key} role={key} />
                    ))}
                  </div>
                </div>
              </div>
            </TerminalWindow>
          </div>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            style={{ textAlign: 'center' }}
          >
            <MissionButton
              size="large"
              onClick={() => setGamePhase('setup')}
            >
              <Play style={{ width: 20, height: 20, marginRight: '12px' }} />
              BEGIN MISSION SETUP
            </MissionButton>
          </motion.div>
        </div>
      </div>
    )
  }
  // 📱 Phase: Team Setup
  if (gamePhase === 'setup') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: missionTheme.background,
        color: '#fff',
        fontFamily: missionTheme.fontFamily
      }}>
  <DebugOverlay />
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
          <TerminalWindow title="TEAM ASSIGNMENT PROTOCOL">
            {/* Player Count */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ color: missionTheme.accent, marginBottom: '16px', fontSize: '16px' }}>
                TEAM SIZE
              </h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                {[2, 3, 4].map(count => (
                  <button
                    key={count}
                    onClick={() => setActivePlayerCount(count)}
                    style={{
                      padding: '12px 24px',
                      background: activePlayerCount === count ? missionTheme.accent : 'rgba(51, 65, 85, 0.3)',
                      color: activePlayerCount === count ? '#000' : '#fff',
                      border: `1px solid ${activePlayerCount === count ? missionTheme.accent : '#475569'}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontFamily: missionTheme.fontFamily,
                      fontWeight: 'bold'
                    }}
                  >
                    {count} OPERATIVES
                  </button>
                ))}
              </div>
            </div>

            {/* Player Names */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ color: missionTheme.accent, marginBottom: '16px', fontSize: '16px' }}>
                OPERATIVE IDENTIFICATION
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {Array.from({ length: activePlayerCount }).map((_, index) => (
                  <div key={index}>
                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', marginBottom: '4px' }}>
                      OPERATIVE {index + 1}
                    </label>
                    <input
                      id={`player-name-${index}`}
                      name={`playerName${index}`}
                      type="text"
                      value={playerNames[index] || ''}
                      onChange={(e) => {
                        const newNames = [...playerNames]
                        newNames[index] = e.target.value
                        setPlayerNames(newNames)
                      }}
                      placeholder="Enter codename"
                      style={{
                        width: '100%',
                        background: 'rgba(0, 20, 40, 0.8)',
                        border: `1px solid ${missionTheme.accent}`,
                        color: '#fff',
                        padding: '12px',
                        borderRadius: '4px',
                        fontFamily: missionTheme.fontFamily,
                        fontSize: '14px'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Role Assignment */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ color: missionTheme.accent, marginBottom: '16px', fontSize: '16px' }}>
                ROLE SPECIALIZATION
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                {Array.from({ length: activePlayerCount }).map((_, index) => {
                  const usedRoles = assignedRoles.slice(0, activePlayerCount).filter((role, i) => i !== index && role)
                  const availableRoles = Object.entries(ROLES).filter(([key]) => !usedRoles.includes(key))
                  
                  return (
                    <div key={index}>
                      <label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', marginBottom: '4px' }}>
                        {playerNames[index] || `OPERATIVE ${index + 1}`}
                      </label>
                      <select
                        id={`player-role-${index}`}
                        name={`playerRole${index}`}
                        value={assignedRoles[index] || ''}
                        onChange={(e) => {
                          const newRoles = [...assignedRoles]
                          newRoles[index] = e.target.value
                          setAssignedRoles(newRoles)
                        }}
                        style={{
                          width: '100%',
                          background: 'rgba(0, 20, 40, 0.8)',
                          border: `1px solid ${missionTheme.accent}`,
                          color: '#fff',
                          padding: '12px',
                          borderRadius: '4px',
                          fontFamily: missionTheme.fontFamily,
                          fontSize: '14px'
                        }}
                      >
                        <option value="">Select Role</option>
                        {availableRoles.map(([key, role]) => (
                          <option key={key} value={key}>
                            {role.name} - {role.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Role Selection for Current Player */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ color: missionTheme.classified, marginBottom: '16px', fontSize: '16px' }}>
                SELECT YOUR ROLE
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {assignedRoles.slice(0, activePlayerCount).map((role, index) => {
                  if (!role) return null
                  const roleData = ROLES[role]
                  const playerName = playerNames[index]
                  
                  return (
                    <button
                      key={role}
                      onClick={() => setCurrentPlayerRole(role)}
                      style={{
                        padding: '16px',
                        background: currentPlayerRole === role ? `${roleData.color}30` : 'rgba(51, 65, 85, 0.3)',
                        border: `2px solid ${currentPlayerRole === role ? roleData.color : '#475569'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontFamily: missionTheme.fontFamily
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <roleData.icon style={{ width: 16, height: 16, color: roleData.color }} />
                        <span style={{ color: roleData.color, fontWeight: 'bold', fontSize: '14px' }}>
                          {roleData.name}
                        </span>
                      </div>
                      <div style={{ color: '#cbd5e1', fontSize: '12px' }}>
                        {playerName || `Player ${index + 1}`}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              onClick={startMission}
              disabled={!currentPlayerRole}
              style={{
                background: currentPlayerRole ? `linear-gradient(135deg, ${missionTheme.accent}, ${ROLES.technician.color})` : '#475569',
                color: currentPlayerRole ? '#000' : '#9ca3af',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: currentPlayerRole ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                margin: '0 auto',
                fontFamily: missionTheme.fontFamily
              }}
            >
              <Play style={{ width: 20, height: 20 }} />
              INITIATE OPERATION
              <ArrowRight style={{ width: 20, height: 20 }} />
            </button>
          </TerminalWindow>
        </div>
      </div>
    )
  }

  // 📱 Phase: Playing - Main Game Interface  
  if (gamePhase === 'playing') {
    const room = ROOMS[currentRoom]
    const progress = roomProgress[currentRoom]
    const playerMechanics = room.mechanics[currentPlayerRole]
    const isRoomLeader = currentPlayerRole === room.leadRole
    
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: missionTheme.background,
        color: '#fff',
        fontFamily: missionTheme.fontFamily,
        paddingTop: '70px'
      }}>
        <MissionHUD />
        
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
          {/* Room Progress Bar */}
          <div style={{ marginBottom: '20px' }}>
            <TerminalWindow title="MISSION PROGRESS">
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {Object.entries(ROOMS).map(([roomId, roomData]) => {
                  const roomProg = roomProgress[roomId]
                  const isActive = parseInt(roomId) === currentRoom
                  const isCompleted = roomProg.completed
                  const isUnlocked = roomProg.unlocked
                  
                  return (
                    <div
                      key={roomId}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '8px',
                        border: isActive ? `2px solid ${missionTheme.accent}` : '1px solid #475569',
                        background: isCompleted 
                          ? `${missionTheme.success}20` 
                          : isActive 
                            ? `${missionTheme.accent}20` 
                            : isUnlocked 
                              ? 'rgba(51, 65, 85, 0.3)' 
                              : 'rgba(30, 41, 59, 0.2)',
                        opacity: isUnlocked ? 1 : 0.5,
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
                        {isCompleted ? (
                          <CheckCircle style={{ width: 16, height: 16, color: missionTheme.success }} />
                        ) : isActive ? (
                          <Terminal style={{ width: 16, height: 16, color: missionTheme.accent }} />
                        ) : isUnlocked ? (
                          <Unlock style={{ width: 16, height: 16, color: '#64748b' }} />
                        ) : (
                          <Lock style={{ width: 16, height: 16, color: '#475569' }} />
                        )}
                        <span style={{ 
                          fontSize: '12px', 
                          fontWeight: 'bold', 
                          color: isActive ? missionTheme.accent : isCompleted ? missionTheme.success : '#fff' 
                        }}>
                          ROOM {roomId}
                        </span>
                      </div>
                      <div style={{ fontSize: '10px', color: '#cbd5e1' }}>
                        {roomData.name}
                      </div>
                      <div style={{ fontSize: '9px', color: ROLES[roomData.leadRole].color, marginTop: '2px' }}>
                        LEAD: {ROLES[roomData.leadRole].name.toUpperCase()}
                      </div>
                    </div>
                  )
                })}
              </div>
            </TerminalWindow>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px' }}>
            {/* Main Interface */}
            <div>
              <TerminalWindow title={`${room.name.toUpperCase()} - ${ROLES[currentPlayerRole].name.toUpperCase()} INTERFACE`}>
                <RoleSpecificInterface 
                  room={room}
                  playerRole={currentPlayerRole}
                  mechanics={playerMechanics}
                  progress={progress}
                  onTeamInput={handleTeamInput}
                  onSubmitSolution={submitRoomSolution}
                  isLeader={isRoomLeader}
                />
              </TerminalWindow>
            </div>

            {/* Team Communications */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <TerminalWindow title="SECURE TEAM CHANNEL">
                <div style={{
                  height: '300px',
                  overflowY: 'auto',
                  marginBottom: '12px',
                  fontSize: '12px',
                  border: '1px solid #475569',
                  padding: '8px',
                  borderRadius: '4px'
                }}>
                  {teamChat.map(msg => (
                    <div key={msg.id} style={{
                      marginBottom: '6px',
                      color: msg.type === 'system' ? missionTheme.warning : '#fff'
                    }}>
                      <span style={{ color: msg.type === 'system' ? missionTheme.warning : ROLES[msg.role.toLowerCase()]?.color || missionTheme.accent }}>
                        [{msg.timestamp}] {msg.role}:
                      </span>
                      <span style={{ marginLeft: '8px' }}>{msg.content}</span>
                    </div>
                  ))}
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    id="team-chat-input"
                    name="teamChatMessage"
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Send secure message..."
                    style={{
                      flex: 1,
                      background: 'rgba(0, 20, 40, 0.8)',
                      border: `1px solid ${missionTheme.accent}`,
                      color: '#fff',
                      padding: '8px',
                      borderRadius: '4px',
                      fontFamily: missionTheme.fontFamily,
                      fontSize: '12px'
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && sendTeamMessage()}
                  />
                  <button
                    onClick={sendTeamMessage}
                    style={{
                      background: missionTheme.accent,
                      color: '#000',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontFamily: missionTheme.fontFamily,
                      fontSize: '12px'
                    }}
                  >
                    SEND
                  </button>
                </div>
              </TerminalWindow>

              {/* Team Status */}
              <TerminalWindow title="TEAM STATUS">
                <div style={{ fontSize: '12px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ color: missionTheme.accent }}>INPUTS REQUIRED:</span>
                  </div>
                  {room.requiredInputs.map(input => {
                    const provided = progress.teamInputs[input]
                    return (
                      <div key={input} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '6px',
                        padding: '6px',
                        background: provided ? `${missionTheme.success}20` : 'rgba(51, 65, 85, 0.3)',
                        borderRadius: '4px'
                      }}>
                        {provided ? (
                          <CheckCircle style={{ width: 12, height: 12, color: missionTheme.success }} />
                        ) : (
                          <Clock style={{ width: 12, height: 12, color: missionTheme.warning }} />
                        )}
                        <span style={{ color: provided ? missionTheme.success : '#cbd5e1' }}>
                          {input.replace('-', ' ').toUpperCase()}
                        </span>
                        {provided && (
                          <span style={{ fontSize: '10px', color: '#64748b', marginLeft: 'auto' }}>
                            BY {provided.providedBy.toUpperCase()}
                          </span>
                        )}
                      </div>
                    )
                  })}
                  
                  {progress.leadReady && (
                    <div style={{
                      marginTop: '12px',
                      padding: '8px',
                      background: `${missionTheme.accent}20`,
                      border: `1px solid ${missionTheme.accent}`,
                      borderRadius: '4px',
                      textAlign: 'center'
                    }}>
                      <span style={{ color: missionTheme.accent, fontWeight: 'bold' }}>
                        ✅ {ROLES[room.leadRole].name.toUpperCase()} READY TO PROCEED
                      </span>
                    </div>
                  )}
                </div>
              </TerminalWindow>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 📱 Phase: Mission Complete
  if (gamePhase === 'completed') {
    const completedRooms = Object.values(roomProgress).filter(r => r.completed).length
    const missionSuccess = completedRooms === 4
    const totalTime = Math.floor((Date.now() - startTime) / 1000)

    return (
      <div style={{ 
        minHeight: '100vh', 
        background: missionTheme.background,
        color: '#fff',
        fontFamily: missionTheme.fontFamily
      }}>
  <DebugOverlay />
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
          <TerminalWindow title="MISSION DEBRIEF">
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: missionSuccess ? `linear-gradient(135deg, ${missionTheme.success}, ${missionTheme.accent})` : `linear-gradient(135deg, ${missionTheme.warning}, ${missionTheme.classified})`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <Trophy style={{ width: 40, height: 40, color: '#000' }} />
              </div>

              <h1 style={{ 
                fontSize: '32px', 
                fontWeight: 'bold', 
                color: missionSuccess ? missionTheme.success : missionTheme.warning, 
                marginBottom: '16px' 
              }}>
                {missionSuccess ? '🎉 MISSION ACCOMPLISHED' : '⏰ MISSION INCOMPLETE'}
              </h1>

              <p style={{ color: '#cbd5e1', fontSize: '16px', marginBottom: '30px' }}>
                {missionSuccess 
                  ? 'The facility has been secured and all threats neutralized. Excellent teamwork!'
                  : `Your team completed ${completedRooms} out of 4 rooms. Great coordination effort!`
                }
              </p>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '16px',
                marginBottom: '30px'
              }}>
                <div style={{
                  padding: '16px',
                  background: `${missionTheme.success}20`,
                  border: `1px solid ${missionTheme.success}`,
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: missionTheme.success }}>
                    {completedRooms}/4
                  </div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1' }}>Rooms Secured</div>
                </div>
                <div style={{
                  padding: '16px',
                  background: `${missionTheme.accent}20`,
                  border: `1px solid ${missionTheme.accent}`,
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: missionTheme.accent }}>
                    {formatTime(totalTime)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1' }}>Mission Time</div>
                </div>
                <div style={{
                  padding: '16px',
                  background: `${missionTheme.classified}20`,
                  border: `1px solid ${missionTheme.classified}`,
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: missionTheme.classified }}>
                    {teamChat.length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1' }}>Team Comms</div>
                </div>
              </div>

              <button
                onClick={() => navigate('/games')}
                style={{
                  background: `linear-gradient(135deg, ${missionTheme.accent}, ${ROLES.technician.color})`,
                  color: '#000',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  margin: '0 auto',
                  fontFamily: missionTheme.fontFamily
                }}
              >
                <ArrowLeft style={{ width: 20, height: 20 }} />
                RETURN TO BASE
              </button>
              {missionResults && (
                <div style={{ marginTop: '30px', fontSize: '12px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                  <div>SESSION ID: {missionResults.sessionId}</div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => {
                        try {
                          const blob = new Blob([JSON.stringify(missionResults, null, 2)], { type: 'application/json' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `operation-nightfall-${missionResults.sessionId}.json`
                          document.body.appendChild(a)
                          a.click()
                          a.remove()
                          URL.revokeObjectURL(url)
                          toast.success('Results downloaded')
                        } catch (e) {
                          toast.error('Download failed')
                        }
                      }}
                      style={{
                        background: missionTheme.accent,
                        color: '#000',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      ⬇️ Download JSON
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(missionResults.sessionId).then(() => toast.success('Session ID copied'))
                      }}
                      style={{
                        background: missionTheme.classified,
                        color: '#fff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      📋 Copy ID
                    </button>
                  </div>
                </div>
              )}
            </div>
          </TerminalWindow>
        </div>
      </div>
    )
  }
}

// 🎮 Role-Specific Interface Component
const RoleSpecificInterface = ({ room, playerRole, mechanics, progress, onTeamInput, onSubmitSolution, isLeader }) => {
  const [inputData, setInputData] = useState('')
  const [processing, setProcessing] = useState(false)

  const handleProvideInput = () => {
    if (!inputData.trim()) {
      toast.error('Please enter the required information!')
      return
    }

    setProcessing(true)
    setTimeout(() => {
      onTeamInput(mechanics.inputType, inputData, playerRole)
      setInputData('')
      setProcessing(false)
    }, 1000)
  }

  // Interface content based on role and room
  const getInterfaceContent = () => {
    switch (mechanics.interface) {
      case 'security-panel':
        return (
          <div>
            <div style={{ color: '#00ff88', marginBottom: '16px', fontSize: '14px' }}>
              🔐 SECURITY BYPASS CONSOLE
            </div>
            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(0, 255, 136, 0.1)', borderRadius: '6px' }}>
              <p style={{ fontSize: '12px', color: '#cbd5e1' }}>
                Only you can see the security layers and input bypass codes. You need information from your team 
                to determine the correct sequence, timing, and safe input codes.
              </p>
            </div>
            {progress.leadReady ? (
              <button
                onClick={onSubmitSolution}
                style={{
                  background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
                  color: '#000',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                🔓 EXECUTE SECURITY BYPASS
              </button>
            ) : (
              <div style={{ color: '#ff6b35', fontSize: '12px' }}>
                ⏳ Waiting for team intelligence...
              </div>
            )}
          </div>
        )

      case 'building-schematic':
        return (
          <div>
            <div style={{ color: '#0080ff', marginBottom: '16px', fontSize: '14px' }}>
              📋 BUILDING SCHEMATIC ACCESS
            </div>
            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(0, 128, 255, 0.1)', borderRadius: '6px' }}>
              <p style={{ fontSize: '12px', color: '#cbd5e1' }}>
                Analyze the facility blueprints to determine the correct order for disabling security layers.
              </p>
            </div>
            <input
              id="building-schematic-sequence"
              name="schematicOrder"
              type="text"
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="Enter security layer sequence..."
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '12px',
                background: 'rgba(0, 20, 40, 0.8)',
                border: '1px solid #0080ff',
                color: '#fff',
                borderRadius: '4px'
              }}
            />
            <button
              onClick={handleProvideInput}
              disabled={processing}
              style={{
                background: processing ? '#475569' : '#0080ff',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: processing ? 'wait' : 'pointer',
                width: '100%'
              }}
            >
              {processing ? '📡 TRANSMITTING...' : '📤 PROVIDE SCHEMATIC DATA'}
            </button>
          </div>
        )

      case 'patrol-monitor':
        return (
          <div>
            <div style={{ color: '#ff6b35', marginBottom: '16px', fontSize: '14px' }}>
              👥 GUARD PATROL MONITOR
            </div>
            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(255, 107, 53, 0.1)', borderRadius: '6px' }}>
              <p style={{ fontSize: '12px', color: '#cbd5e1' }}>
                Monitor security patrol patterns and identify safe timing windows for bypass operations.
              </p>
            </div>
            <input
              id="patrol-monitor-timing"
              name="timingWindows"
              type="text"
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="Enter timing window data..."
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '12px',
                background: 'rgba(0, 20, 40, 0.8)',
                border: '1px solid #ff6b35',
                color: '#fff',
                borderRadius: '4px'
              }}
            />
            <button
              onClick={handleProvideInput}
              disabled={processing}
              style={{
                background: processing ? '#475569' : '#ff6b35',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: processing ? 'wait' : 'pointer',
                width: '100%'
              }}
            >
              {processing ? '📡 TRANSMITTING...' : '📤 PROVIDE TIMING DATA'}
            </button>
          </div>
        )

      case 'camera-scout':
        return (
          <div>
            <div style={{ color: '#ff0080', marginBottom: '16px', fontSize: '14px' }}>
              📹 CAMERA SURVEILLANCE SCOUT
            </div>
            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(255, 0, 128, 0.1)', borderRadius: '6px' }}>
              <p style={{ fontSize: '12px', color: '#cbd5e1' }}>
                Identify camera blind spots and reconnaissance safe input sequences for the technician.
              </p>
            </div>
            <input
              id="camera-scout-sequence"
              name="safeSequences"
              type="text"
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="Enter safe sequence codes..."
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '12px',
                background: 'rgba(0, 20, 40, 0.8)',
                border: '1px solid #ff0080',
                color: '#fff',
                borderRadius: '4px'
              }}
            />
            <button
              onClick={handleProvideInput}
              disabled={processing}
              style={{
                background: processing ? '#475569' : '#ff0080',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: processing ? 'wait' : 'pointer',
                width: '100%'
              }}
            >
              {processing ? '📡 TRANSMITTING...' : '📤 PROVIDE SEQUENCE DATA'}
            </button>
          </div>
        )

      // Add interfaces for all rooms and roles
      case 'database-terminal':
        return (
          <div>
            <div style={{ color: '#0080ff', marginBottom: '16px', fontSize: '14px' }}>
              💾 DATABASE EXTRACTION TERMINAL
            </div>
            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(0, 128, 255, 0.1)', borderRadius: '6px' }}>
              <p style={{ fontSize: '12px', color: '#cbd5e1' }}>
                Only you can navigate the database and extract critical intelligence files. You need your team's input to succeed.
              </p>
            </div>
            {progress.leadReady ? (
              <button
                onClick={onSubmitSolution}
                style={{
                  background: 'linear-gradient(135deg, #0080ff, #0066cc)',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                💾 EXTRACT INTELLIGENCE DATA
              </button>
            ) : (
              <div style={{ color: '#ff6b35', fontSize: '12px' }}>
                ⏳ Waiting for team intelligence...
              </div>
            )}
          </div>
        )

      case 'server-access':
        return (
          <div>
            <div style={{ color: '#00ff88', marginBottom: '16px', fontSize: '14px' }}>
              🖥️ SERVER ACCESS CONTROL
            </div>
            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(0, 255, 136, 0.1)', borderRadius: '6px' }}>
              <p style={{ fontSize: '12px', color: '#cbd5e1' }}>
                Provide system access codes and server locations for database extraction.
              </p>
            </div>
            <input
              id="server-access-codes"
              name="serverAccess"
              type="text"
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="Enter server access codes..."
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '12px',
                background: 'rgba(0, 20, 40, 0.8)',
                border: '1px solid #00ff88',
                color: '#fff',
                borderRadius: '4px'
              }}
            />
            <button
              onClick={handleProvideInput}
              disabled={processing}
              style={{
                background: processing ? '#475569' : '#00ff88',
                color: processing ? '#fff' : '#000',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: processing ? 'wait' : 'pointer',
                width: '100%'
              }}
            >
              {processing ? '📡 TRANSMITTING...' : '📤 PROVIDE ACCESS CODES'}
            </button>
          </div>
        )

      case 'intercepted-calls':
        return (
          <div>
            <div style={{ color: '#ff6b35', marginBottom: '16px', fontSize: '14px' }}>
              📞 INTERCEPTED COMMUNICATIONS
            </div>
            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(255, 107, 53, 0.1)', borderRadius: '6px' }}>
              <p style={{ fontSize: '12px', color: '#cbd5e1' }}>
                Monitor enemy communications to identify which data is most valuable.
              </p>
            </div>
            <input
              id="intercepted-calls-targets"
              name="targetPriorities"
              type="text"
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="Enter target priorities..."
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '12px',
                background: 'rgba(0, 20, 40, 0.8)',
                border: '1px solid #ff6b35',
                color: '#fff',
                borderRadius: '4px'
              }}
            />
            <button
              onClick={handleProvideInput}
              disabled={processing}
              style={{
                background: processing ? '#475569' : '#ff6b35',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: processing ? 'wait' : 'pointer',
                width: '100%'
              }}
            >
              {processing ? '📡 TRANSMITTING...' : '📤 PROVIDE TARGET DATA'}
            </button>
          </div>
        )

      case 'physical-documents':
        return (
          <div>
            <div style={{ color: '#ff0080', marginBottom: '16px', fontSize: '14px' }}>
              📋 PHYSICAL DOCUMENT SEARCH
            </div>
            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(255, 0, 128, 0.1)', borderRadius: '6px' }}>
              <p style={{ fontSize: '12px', color: '#cbd5e1' }}>
                Search for physical documents containing decryption keys for the database.
              </p>
            </div>
            <input
              id="physical-documents-keys"
              name="decryptionKeys"
              type="text"
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="Enter decryption keys..."
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '12px',
                background: 'rgba(0, 20, 40, 0.8)',
                border: '1px solid #ff0080',
                color: '#fff',
                borderRadius: '4px'
              }}
            />
            <button
              onClick={handleProvideInput}
              disabled={processing}
              style={{
                background: processing ? '#475569' : '#ff0080',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: processing ? 'wait' : 'pointer',
                width: '100%'
              }}
            >
              {processing ? '📡 TRANSMITTING...' : '📤 PROVIDE DECRYPTION KEYS'}
            </button>
          </div>
        )

      case 'radio-array':
        return (
          <div>
            <div style={{ color: '#ff6b35', marginBottom: '16px', fontSize: '14px' }}>
              📡 RADIO ARRAY CONTROL
            </div>
            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(255, 107, 53, 0.1)', borderRadius: '6px' }}>
              <p style={{ fontSize: '12px', color: '#cbd5e1' }}>
                Only you can operate the radio array and coordinate the extraction signal.
              </p>
            </div>
            {progress.leadReady ? (
              <button
                onClick={onSubmitSolution}
                style={{
                  background: 'linear-gradient(135deg, #ff6b35, #e55a2b)',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                📡 SEND EXTRACTION SIGNAL
              </button>
            ) : (
              <div style={{ color: '#ff6b35', fontSize: '12px' }}>
                ⏳ Waiting for team coordinates...
              </div>
            )}
          </div>
        )

      case 'reconnaissance':
        return (
          <div>
            <div style={{ color: '#ff0080', marginBottom: '16px', fontSize: '14px' }}>
              🔍 FIELD RECONNAISSANCE
            </div>
            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(255, 0, 128, 0.1)', borderRadius: '6px' }}>
              <p style={{ fontSize: '12px', color: '#cbd5e1' }}>
                Provide real-time extraction coordinates from your field position.
              </p>
            </div>
            <input
              id="reconnaissance-coordinates"
              name="coordinates"
              type="text"
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="Enter extraction coordinates..."
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '12px',
                background: 'rgba(0, 20, 40, 0.8)',
                border: '1px solid #ff0080',
                color: '#fff',
                borderRadius: '4px'
              }}
            />
            <button
              onClick={handleProvideInput}
              disabled={processing}
              style={{
                background: processing ? '#475569' : '#ff0080',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: processing ? 'wait' : 'pointer',
                width: '100%'
              }}
            >
              {processing ? '📡 TRANSMITTING...' : '📤 PROVIDE COORDINATES'}
            </button>
          </div>
        )

      case 'frequency-calibration':
        return (
          <div>
            <div style={{ color: '#00ff88', marginBottom: '16px', fontSize: '14px' }}>
              📻 FREQUENCY CALIBRATION
            </div>
            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(0, 255, 136, 0.1)', borderRadius: '6px' }}>
              <p style={{ fontSize: '12px', color: '#cbd5e1' }}>
                Supply frequency settings and signal amplification for the radio array.
              </p>
            </div>
            <input
              id="frequency-calibration-settings"
              name="frequencies"
              type="text"
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="Enter frequency settings..."
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '12px',
                background: 'rgba(0, 20, 40, 0.8)',
                border: '1px solid #00ff88',
                color: '#fff',
                borderRadius: '4px'
              }}
            />
            <button
              onClick={handleProvideInput}
              disabled={processing}
              style={{
                background: processing ? '#475569' : '#00ff88',
                color: processing ? '#fff' : '#000',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: processing ? 'wait' : 'pointer',
                width: '100%'
              }}
            >
              {processing ? '📡 TRANSMITTING...' : '📤 PROVIDE FREQUENCIES'}
            </button>
          </div>
        )

      case 'enemy-transmissions':
        return (
          <div>
            <div style={{ color: '#0080ff', marginBottom: '16px', fontSize: '14px' }}>
              📶 ENEMY TRANSMISSION ANALYSIS
            </div>
            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(0, 128, 255, 0.1)', borderRadius: '6px' }}>
              <p style={{ fontSize: '12px', color: '#cbd5e1' }}>
                Decode enemy transmissions to reveal safe transmission windows.
              </p>
            </div>
            <input
              id="enemy-transmissions-windows"
              name="transmissionWindows"
              type="text"
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="Enter transmission windows..."
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '12px',
                background: 'rgba(0, 20, 40, 0.8)',
                border: '1px solid #0080ff',
                color: '#fff',
                borderRadius: '4px'
              }}
            />
            <button
              onClick={handleProvideInput}
              disabled={processing}
              style={{
                background: processing ? '#475569' : '#0080ff',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: processing ? 'wait' : 'pointer',
                width: '100%'
              }}
            >
              {processing ? '📡 TRANSMITTING...' : '📤 PROVIDE WINDOWS'}
            </button>
          </div>
        )

      case 'facility-map':
        return (
          <div>
            <div style={{ color: '#ff0080', marginBottom: '16px', fontSize: '14px' }}>
              🗺️ FACILITY NAVIGATION
            </div>
            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(255, 0, 128, 0.1)', borderRadius: '6px' }}>
              <p style={{ fontSize: '12px', color: '#cbd5e1' }}>
                Only you can see the facility layout and choose the safest escape routes.
              </p>
            </div>
            {progress.leadReady ? (
              <button
                onClick={onSubmitSolution}
                style={{
                  background: 'linear-gradient(135deg, #ff0080, #cc0066)',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                🚪 EXECUTE ESCAPE PLAN
              </button>
            ) : (
              <div style={{ color: '#ff6b35', fontSize: '12px' }}>
                ⏳ Waiting for team intelligence...
              </div>
            )}
          </div>
        )

      case 'patrol-analysis':
        return (
          <div>
            <div style={{ color: '#0080ff', marginBottom: '16px', fontSize: '14px' }}>
              👥 PATROL PATTERN ANALYSIS
            </div>
            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(0, 128, 255, 0.1)', borderRadius: '6px' }}>
              <p style={{ fontSize: '12px', color: '#cbd5e1' }}>
                Analyze enemy patrol patterns and predict movement for safe escape routes.
              </p>
            </div>
            <input
              id="patrol-analysis-patterns"
              name="patrolPatterns"
              type="text"
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="Enter patrol patterns..."
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '12px',
                background: 'rgba(0, 20, 40, 0.8)',
                border: '1px solid #0080ff',
                color: '#fff',
                borderRadius: '4px'
              }}
            />
            <button
              onClick={handleProvideInput}
              disabled={processing}
              style={{
                background: processing ? '#475569' : '#0080ff',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: processing ? 'wait' : 'pointer',
                width: '100%'
              }}
            >
              {processing ? '📡 TRANSMITTING...' : '📤 PROVIDE PATTERNS'}
            </button>
          </div>
        )

      case 'system-control':
        return (
          <div>
            <div style={{ color: '#00ff88', marginBottom: '16px', fontSize: '14px' }}>
              ⚡ SYSTEM CONTROL ACCESS
            </div>
            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(0, 255, 136, 0.1)', borderRadius: '6px' }}>
              <p style={{ fontSize: '12px', color: '#cbd5e1' }}>
                Control door locks, elevators, and emergency systems for safe escape.
              </p>
            </div>
            <input
              id="system-control-access"
              name="systemAccess"
              type="text"
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="Enter system access..."
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '12px',
                background: 'rgba(0, 20, 40, 0.8)',
                border: '1px solid #00ff88',
                color: '#fff',
                borderRadius: '4px'
              }}
            />
            <button
              onClick={handleProvideInput}
              disabled={processing}
              style={{
                background: processing ? '#475569' : '#00ff88',
                color: processing ? '#fff' : '#000',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: processing ? 'wait' : 'pointer',
                width: '100%'
              }}
            >
              {processing ? '📡 TRANSMITTING...' : '📤 PROVIDE ACCESS'}
            </button>
          </div>
        )

      case 'lockdown-monitor':
        return (
          <div>
            <div style={{ color: '#ff6b35', marginBottom: '16px', fontSize: '14px' }}>
              🚨 LOCKDOWN STATUS MONITOR
            </div>
            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(255, 107, 53, 0.1)', borderRadius: '6px' }}>
              <p style={{ fontSize: '12px', color: '#cbd5e1' }}>
                Monitor facility lockdown status and identify safe zones.
              </p>
            </div>
            <input
              id="lockdown-monitor-status"
              name="lockdownStatus"
              type="text"
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="Enter lockdown status..."
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '12px',
                background: 'rgba(0, 20, 40, 0.8)',
                border: '1px solid #ff6b35',
                color: '#fff',
                borderRadius: '4px'
              }}
            />
            <button
              onClick={handleProvideInput}
              disabled={processing}
              style={{
                background: processing ? '#475569' : '#ff6b35',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: processing ? 'wait' : 'pointer',
                width: '100%'
              }}
            >
              {processing ? '📡 TRANSMITTING...' : '📤 PROVIDE STATUS'}
            </button>
          </div>
        )
      default:
        return (
          <div>
            <div style={{ color: '#cbd5e1', marginBottom: '16px' }}>
              Interface for {mechanics.interface} - Room {room.id}
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>
              {mechanics.ability}
            </p>
          </div>
        )
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(51, 65, 85, 0.3)', borderRadius: '6px' }}>
        <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0 }}>
          <strong>{room.description}</strong>
        </p>
        {isLeader && (
          <p style={{ fontSize: '11px', color: '#00ff88', margin: '8px 0 0 0' }}>
            🎯 You are the ROOM LEADER - only you can submit the final solution once all team inputs are received.
          </p>
        )}
      </div>
      
      {getInterfaceContent()}
    </div>
  )
}

export default OperationNightfall
