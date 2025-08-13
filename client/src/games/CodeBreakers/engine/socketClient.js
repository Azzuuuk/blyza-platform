// Firebase-based multiplayer client module: real-time game state with Firebase RTDB
// Replaces Socket.IO with Firebase Realtime Database for game sessions

import { subscribeToGameSession, updatePlayerAction } from '../../../services/firebaseMultiplayer'

// Multiplayer stub flag for games that don't need real-time features
export const isMultiplayerStub = true

// Firebase-based game state synchronization
let currentSessionId = null
let unsubscribeGameState = null

export const initMultiplayer = (sessionId) => {
  return initializeGameSession(sessionId)
}

export const initializeGameSession = (sessionId) => {
  currentSessionId = sessionId
  
  // Subscribe to game state changes
  if (unsubscribeGameState) {
    unsubscribeGameState()
  }
  
  unsubscribeGameState = subscribeToGameSession(sessionId, (gameState) => {
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
  console.log('Chat broadcast (stub):', message)
}
export const onChatMessage = (callback) => {
  console.log('Chat listener registered (stub)')
  return () => {} // Return cleanup function
}
export const offChatMessage = () => {
  console.log('Chat listener removed (stub)')
}
export const getChatHistory = () => []

// Team input stubs
export const broadcastTeamInput = (input) => {
  console.log('Team input broadcast (stub):', input)
}
export const onTeamInput = (callback) => {
  console.log('Team input listener registered (stub)')
  return () => {} // Return cleanup function
}
export const offTeamInput = () => {
  console.log('Team input listener removed (stub)')
}

// Room completion stubs
export const broadcastRoomCompleted = (roomData) => {
  console.log('Room completed broadcast (stub):', roomData)
}
export const onRoomCompleted = (callback) => {
  console.log('Room completed listener registered (stub)')
  return () => {} // Return cleanup function
}
export const offRoomCompleted = () => {
  console.log('Room completed listener removed (stub)')
}

// State patch stubs
export const broadcastStatePatch = (patch) => {
  console.log('State patch broadcast (stub):', patch)
}
export const onStatePatch = (callback) => {
  console.log('State patch listener registered (stub)')
  return () => {} // Return cleanup function
}
export const offStatePatch = () => {
  console.log('State patch listener removed (stub)')
}
