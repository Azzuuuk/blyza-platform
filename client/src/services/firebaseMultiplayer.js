/**
 * Firebase Realtime Database Multiplayer Service
 * Handles real-time game sessions, player actions, and manager monitoring
 */

import {
  ref,
  push,
  set,
  update,
  onValue,
  off,
  remove,
  serverTimestamp,
  child,
  get,
  onDisconnect
} from 'firebase/database'
import { rtdb } from '../lib/firebase'

/**
 * Generate a unique room code
 */
const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

/**
 * Create a new Nightfall lobby (manager only)
 */
export const createGameSession = async (gameType, hostUser, maxPlayers = 4) => {
  try {
    const roomCode = generateRoomCode()
    const sessionRef = push(ref(rtdb, 'lobbies'))
    const sessionId = sessionRef.key

    const sessionData = {
      id: sessionId,
      code: roomCode,
      game: gameType || 'nightfall',
      managerUid: hostUser.uid,
      status: 'lobby', // lobby | in_progress | finished
      maxPlayers,
      createdAt: serverTimestamp(),
      startedAt: null,
      endedAt: null,
      players: {}
    }

    await set(sessionRef, sessionData)

    // Map room code -> sessionId for secure lookups
    const codeRef = ref(rtdb, `lobbyCodes/${roomCode}`)
    await set(codeRef, { sessionId })

    // Add manager to players list
    const managerPlayerRef = ref(rtdb, `lobbies/${sessionId}/players/${hostUser.uid}`)
    await set(managerPlayerRef, {
      displayName: hostUser.name,
      connected: true,
      role: 'manager',
      ready: true,
      joinedAt: serverTimestamp(),
      lastSeen: serverTimestamp()
    })

    // Initialize game container
    const gameRef = ref(rtdb, `games/nightfall/${sessionId}`)
    await set(gameRef, {
      game: {
        phase: 'LOBBY',
        turn: 0,
        timers: {},
        progress: { percent: 0, roomsCompleted: 0 }
      }
    })

    return {
      success: true,
      session: {
        id: sessionId,
        code: roomCode,
        ...sessionData
      }
    }
  } catch (error) {
    console.error('Error creating game session:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Join a game session by room code
 */
export const joinGameSession = async (roomCode, playerUser) => {
  try {
    console.log('🔥 JOIN: Starting join process:', { roomCode, playerUser })
    
    // Resolve sessionId via lobbyCodes mapping (no broad read)
    const codeRef = ref(rtdb, `lobbyCodes/${roomCode}`)
    const codeSnap = await get(codeRef)
    if (!codeSnap.exists()) {
      console.error('❌ JOIN: Invalid or expired room code:', roomCode)
      return { success: false, error: 'Invalid or expired room code' }
    }
    const targetSessionId = codeSnap.val()?.sessionId
    if (!targetSessionId) {
      console.error('❌ JOIN: Code mapping missing sessionId')
      return { success: false, error: 'Invalid code mapping' }
    }

    console.log('🔥 JOIN: Target session resolved:', { targetSessionId })

    // Add player to lobby with presence
    const playerRef = ref(rtdb, `lobbies/${targetSessionId}/players/${playerUser.uid}`)
    await set(playerRef, {
      displayName: playerUser.name,
      connected: true,
      role: playerUser.role || null,
      ready: false,
      joinedAt: serverTimestamp(),
      lastSeen: serverTimestamp()
    })

    // Setup presence onDisconnect
    try {
      const connRef = ref(rtdb, `.info/connected`)
      onValue(connRef, (snap) => {
        if (snap.val() === true) {
          onDisconnect(playerRef).update({ connected: false, lastSeen: serverTimestamp() })
        }
      })
    } catch {}

    console.log('🔥 JOIN: Player added to lobby')
    
    console.log('✅ JOIN: Successfully joined session!')

    return { success: true, sessionId: targetSessionId, message: 'Successfully joined game session' }
  } catch (error) {
    console.error('❌ JOIN: Firebase error:', error)
    console.error('❌ JOIN: Error code:', error.code)
    console.error('❌ JOIN: Error message:', error.message)
    return {
      success: false,
      error: `Failed to join session: ${error.message}`
    }
  }
}

/**
 * Start Nightfall game (manager only)
 */
export const startGameSession = async (sessionId, hostUid) => {
  try {
    const sessionRef = ref(rtdb, `lobbies/${sessionId}`)
    const snapshot = await get(sessionRef)

    if (!snapshot.exists()) {
      return {
        success: false,
        error: 'Session not found'
      }
    }

    const session = snapshot.val()
    
    // Verify host permissions
    if (session.managerUid !== hostUid) {
      return {
        success: false,
        error: 'Only the host can start the game'
      }
    }

    // If roles pre-assigned by manager, keep them. Otherwise auto-assign.
    const playerEntries = Object.entries(session.players || {}).filter(([uid]) => uid !== hostUid)
    const hasAssigned = playerEntries.some(([_, p]) => !!p.role)
    if (!hasAssigned) {
      const playerCount = playerEntries.length
      const roleSets = { 2: ['lead', 'analyst'], 3: ['lead', 'analyst', 'operative'], 4: ['lead', 'analyst', 'operative', 'specialist'] }
      const roles = roleSets[Math.min(4, Math.max(2, playerCount))] || roleSets[2]
      const assignments = {}
      playerEntries.slice(0, 4).forEach(([uid], idx) => { assignments[uid] = roles[idx] || 'operative' })
      await Promise.all(Object.entries(assignments).map(([uid, role]) => update(ref(rtdb, `lobbies/${sessionId}/players/${uid}`), { role })))
    }

    // Initialize game state
    const gameRef = ref(rtdb, `games/nightfall/${sessionId}`)
    await update(gameRef, {
      game: {
        phase: 'IN_PROGRESS',
        turn: 1,
        timers: {},
        progress: { percent: 0, roomsCompleted: 0 }
      }
    })

    // Update session status
    await update(sessionRef, {
      status: 'in_progress',
      startedAt: serverTimestamp()
    })

    return {
      success: true,
      sessionId
    }
  } catch (error) {
    console.error('Error starting game session:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Update player action/state in game
 */
export const updatePlayerAction = async (sessionId, playerId, action) => {
  try {
    const actionRef = ref(rtdb, `games/nightfall/${sessionId}/eventsLog/${playerId}`)
    const actionData = {
      ...action,
      timestamp: serverTimestamp(),
      playerId
    }

    await set(actionRef, actionData)

    return {
      success: true
    }
  } catch (error) {
    console.error('Error updating player action:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Update player score
 */
export const updatePlayerScore = async (sessionId, playerId, score) => {
  try {
    await update(ref(rtdb, `games/nightfall/${sessionId}/scores/${playerId}`), {
      score,
      updatedAt: serverTimestamp()
    })

    return {
      success: true
    }
  } catch (error) {
    console.error('Error updating player score:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Subscribe to lobby updates
 */
export const subscribeToLobby = (sessionId, callback) => {
  const sessionRef = ref(rtdb, `lobbies/${sessionId}`)
  
  onValue(sessionRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({
        success: true,
        session: { id: sessionId, ...snapshot.val() }
      })
    } else {
      callback({
        success: false,
        error: 'Session not found'
      })
    }
  })

  // Return unsubscribe function
  return () => off(sessionRef)
}

/**
 * Subscribe to game state changes (for real-time updates)
 */
export const subscribeToGameState = (sessionId, callback) => {
  const gameStateRef = ref(rtdb, `games/nightfall/${sessionId}`)
  
  onValue(gameStateRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({
        success: true,
        gameState: snapshot.val()
      })
    }
  })

  // Return unsubscribe function
  return () => off(gameStateRef)
}

/**
 * Subscribe to player list changes
 */
export const subscribeToPlayers = (sessionId, callback) => {
  const playersRef = ref(rtdb, `lobbies/${sessionId}/players`)
  
  onValue(playersRef, (snapshot) => {
    const players = snapshot.val() || {}
    callback({
      success: true,
      players
    })
  })

  // Return unsubscribe function
  return () => off(playersRef)
}

/**
 * Complete a game session
 */
export const completeGameSession = async (sessionId, finalScores, gameData) => {
  try {
    const sessionRef = ref(rtdb, `lobbies/${sessionId}`)
    
    await update(sessionRef, {
      status: 'finished',
      endedAt: serverTimestamp()
    })

    await update(ref(rtdb, `games/nightfall/${sessionId}`), {
      summary: { finalScores, finalData: gameData, completedAt: serverTimestamp() },
      game: { phase: 'COMPLETE' }
    })

    return {
      success: true
    }
  } catch (error) {
    console.error('Error completing game session:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Remove/leave game session
 */
export const leaveGameSession = async (sessionId, playerId) => {
  try {
    await remove(ref(rtdb, `lobbies/${sessionId}/players/${playerId}`))
    
    return {
      success: true
    }
  } catch (error) {
    console.error('Error leaving game session:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Get active sessions for a user
 */
export const getUserActiveSessions = async (userId) => {
  try {
    const sessionsRef = ref(rtdb, 'lobbies')
    const snapshot = await get(sessionsRef)
    
    const activeSessions = []
    
    if (snapshot.exists()) {
      const sessions = snapshot.val()
      for (const [sessionId, session] of Object.entries(sessions)) {
        // Check if user is host or player in active session
        if (session.status === 'in_progress' &&
            (session.managerUid === userId ||
             (session.players && session.players[userId]))) {
          activeSessions.push({ id: sessionId, ...session })
        }
      }
    }

    return {
      success: true,
      sessions: activeSessions
    }
  } catch (error) {
    console.error('Error getting user active sessions:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/** Backwards compatibility alias */
export const subscribeToGameSession = subscribeToLobby
