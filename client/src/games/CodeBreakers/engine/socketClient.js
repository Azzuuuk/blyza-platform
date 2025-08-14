// Firebase-based multiplayer client module: real-time game state with Firebase RTDB
// Replaces Socket.IO with Firebase Realtime Database for game sessions

import { rtdb } from '../../../lib/firebase'
import { ref, onValue, off, push, update, set } from 'firebase/database'
import { subscribeToGameState as subGame, updatePlayerAction } from '../../../services/firebaseMultiplayer'

// Multiplayer stub flag for games that don't need real-time features
export const isMultiplayerStub = true

// Firebase-based game state synchronization
let currentSessionId = null
let unsubscribeGameState = null
let chatUnsub = null
let inputsUnsub = null

export const initMultiplayer = (sessionId) => {
  return initializeGameSession(sessionId)
}

export const initializeGameSession = (sessionId) => {
  currentSessionId = sessionId
  
  // Subscribe to game state changes
  if (unsubscribeGameState) {
    unsubscribeGameState()
  }
  
  unsubscribeGameState = subGame(sessionId, (gameState) => {
    // Handle real-time game state updates
    console.log('Game state updated:', gameState)
  })
}

export const updateGameAction = async (action, data) => {
  if (!currentSessionId) {
    console.warn('No active session for game action')
    return
  }
  
  try {
    await updatePlayerAction(currentSessionId, action, data)
  } catch (error) {
    console.error('Failed to update game action:', error)
  }
}

export const cleanupGameSession = () => {
  if (unsubscribeGameState) {
    unsubscribeGameState()
    unsubscribeGameState = null
  }
  if (chatUnsub) { chatUnsub(); chatUnsub = null }
  if (inputsUnsub) { inputsUnsub(); inputsUnsub = null }
  currentSessionId = null
}

// Legacy stub functions for existing game compatibility
export const requestFullSync = () => Promise.resolve({})
export const getRealtimeMetrics = () => ({})
export const requestLeaderLock = () => Promise.resolve(false)
export const releaseLeaderLock = () => Promise.resolve()
export const onLockUpdate = () => {}
export const offLockUpdate = () => {}
export const onLockResult = () => {}
export const offLockResult = () => {}

// Chat system stubs
export const broadcastChat = (message) => {
  if (!currentSessionId) return
  const chatRef = push(ref(rtdb, `games/nightfall/${currentSessionId}/chat`))
  return set(chatRef, { message, ts: Date.now() })
}
export const onChatMessage = (callback) => {
  if (!currentSessionId) return () => {}
  const chatRef = ref(rtdb, `games/nightfall/${currentSessionId}/chat`)
  chatUnsub = onValue(chatRef, (snap) => {
    const list = snap.val() || {}
    const arr = Object.values(list)
    arr.forEach(m => callback(m))
  })
  return () => { if (chatUnsub) chatUnsub(); chatUnsub = null }
}
export const offChatMessage = () => {
  console.log('Chat listener removed (stub)')
}
export const getChatHistory = () => []

// Team input stubs
export const broadcastTeamInput = (input) => {
  if (!currentSessionId) return
  const { roomId, inputType, data, role, ts } = input
  const base = `games/nightfall/${currentSessionId}/rooms/${roomId}`
  return update(ref(rtdb, base), {
    [`teamInputs/${inputType}`]: { data, providedBy: role, timestamp: ts || Date.now() }
  })
}
export const onTeamInput = (callback) => {
  if (!currentSessionId) return () => {}
  const inputsRef = ref(rtdb, `games/nightfall/${currentSessionId}/rooms`)
  inputsUnsub = onValue(inputsRef, (snap) => {
    const rooms = snap.val() || {}
    Object.entries(rooms).forEach(([roomId, room]) => {
      const inputs = room?.teamInputs || {}
      Object.entries(inputs).forEach(([inputType, payload]) => {
        callback({ roomId: Number(roomId), inputType, ...payload })
      })
    })
  })
  return () => { if (inputsUnsub) inputsUnsub(); inputsUnsub = null }
}
export const offTeamInput = () => {
  console.log('Team input listener removed (stub)')
}

// Room completion stubs
export const broadcastRoomCompleted = (roomData) => {
  if (!currentSessionId) return
  const { roomId } = roomData
  return update(ref(rtdb, `games/nightfall/${currentSessionId}/rooms/${roomId}`), { completed: true, completedAt: Date.now() })
}
export const onRoomCompleted = (callback) => {
  if (!currentSessionId) return () => {}
  const roomsRef = ref(rtdb, `games/nightfall/${currentSessionId}/rooms`)
  const unsub = onValue(roomsRef, (snap) => {
    const rooms = snap.val() || {}
    Object.entries(rooms).forEach(([roomId, r]) => { if (r?.completed) callback({ roomId: Number(roomId), ts: r.completedAt }) })
  })
  return () => off(roomsRef, 'value', unsub)
}
export const offRoomCompleted = () => {
  console.log('Room completed listener removed (stub)')
}

// State patch stubs
export const broadcastStatePatch = (patch) => {
  if (!currentSessionId) return
  const baseRef = ref(rtdb, `games/nightfall/${currentSessionId}`)
  if (patch.full && patch.snapshot) {
    return set(baseRef, patch.snapshot)
  }
  // naive merge for game fields
  const updates = {}
  if (patch.gamePhase) updates['game/phase'] = patch.gamePhase
  if (patch.timeLeft !== undefined) updates['game/timeLeft'] = patch.timeLeft
  return update(baseRef, updates)
}
export const onStatePatch = (callback) => {
  if (!currentSessionId) return () => {}
  const baseRef = ref(rtdb, `games/nightfall/${currentSessionId}`)
  const unsub = onValue(baseRef, (snap) => { callback({ snapshot: snap.val() }) })
  return () => off(baseRef, 'value', unsub)
}
export const offStatePatch = () => {
  console.log('State patch listener removed (stub)')
}
