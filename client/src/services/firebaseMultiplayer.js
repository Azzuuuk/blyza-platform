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
  get
} from 'firebase/database'
import { rtdb } from '../lib/firebase'

/**
 * Generate a unique room code
 */
const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

/**
 * Create a new game session
 */
export const createGameSession = async (gameType, hostUser, maxPlayers = 6) => {
  try {
    const roomCode = generateRoomCode()
    const sessionRef = push(ref(rtdb, 'gameSessions'))
    const sessionId = sessionRef.key

    const sessionData = {
      id: sessionId,
      roomCode,
      gameType,
      host: {
        uid: hostUser.uid,
        name: hostUser.name,
        role: hostUser.role
      },
      status: 'waiting', // waiting, active, completed
      maxPlayers,
      createdAt: serverTimestamp(),
      players: {},
      gameState: {
        phase: 'lobby', // lobby, playing, results
        startedAt: null,
        currentRound: 0,
        scores: {},
        actions: {}
      },
      settings: {
        timeLimit: 600, // 10 minutes default
        difficulty: 'medium'
      }
    }

    await set(sessionRef, sessionData)

    return {
      success: true,
      session: {
        id: sessionId,
        roomCode,
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
    
    // Find session by room code
    const sessionsRef = ref(rtdb, 'gameSessions')
    console.log('🔥 JOIN: Reading sessions from Firebase...')
    
    const snapshot = await get(sessionsRef)
    console.log('🔥 JOIN: Sessions snapshot:', snapshot.exists(), snapshot.val())
    
    let targetSessionId = null
    let targetSession = null

    if (snapshot.exists()) {
      const sessions = snapshot.val()
      console.log('🔥 JOIN: Available sessions:', Object.keys(sessions))
      
      for (const [sessionId, session] of Object.entries(sessions)) {
        console.log(`🔥 JOIN: Checking session ${sessionId}:`, { 
          sessionRoomCode: session.roomCode, 
          lookingFor: roomCode, 
          status: session.status 
        })
        
        if (session.roomCode === roomCode && session.status === 'waiting') {
          targetSessionId = sessionId
          targetSession = session
          console.log('✅ JOIN: Found matching session!')
          break
        }
      }
    }

    if (!targetSession) {
      console.error('❌ JOIN: No session found for room code:', roomCode)
      return {
        success: false,
        error: 'Game session not found or already started'
      }
    }

    console.log('🔥 JOIN: Target session found:', { targetSessionId, targetSession })

    // Check if room is full
    const currentPlayers = Object.keys(targetSession.players || {}).length
    console.log('🔥 JOIN: Current players:', currentPlayers, 'Max:', targetSession.maxPlayers)
    
    if (currentPlayers >= targetSession.maxPlayers) {
      return {
        success: false,
        error: 'Game session is full'
      }
    }

    // Add player to session
    const playerData = {
      uid: playerUser.uid,
      name: playerUser.name,
      role: playerUser.role,
      joinedAt: serverTimestamp(),
      status: 'connected',
      score: 0
    }

    console.log('🔥 JOIN: Adding player to session:', playerData)
    
    const playerRef = ref(rtdb, `gameSessions/${targetSessionId}/players/${playerUser.uid}`)
    await update(playerRef, playerData)
    
    console.log('✅ JOIN: Successfully joined session!')

    return {
      success: true,
      sessionId: targetSessionId,
      session: targetSession,
      message: 'Successfully joined game session'
    }
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
 * Start a game session
 */
export const startGameSession = async (sessionId, hostUid) => {
  try {
    const sessionRef = ref(rtdb, `gameSessions/${sessionId}`)
    const snapshot = await get(sessionRef)

    if (!snapshot.exists()) {
      return {
        success: false,
        error: 'Session not found'
      }
    }

    const session = snapshot.val()
    
    // Verify host permissions
    if (session.host.uid !== hostUid) {
      return {
        success: false,
        error: 'Only the host can start the game'
      }
    }

    // Update session status
    await update(sessionRef, {
      status: 'active',
      'gameState/phase': 'playing',
      'gameState/startedAt': serverTimestamp()
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
    const actionRef = ref(rtdb, `gameSessions/${sessionId}/gameState/actions/${playerId}`)
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
    await update(ref(rtdb, `gameSessions/${sessionId}/gameState/scores/${playerId}`), {
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
 * Subscribe to game session updates
 */
export const subscribeToGameSession = (sessionId, callback) => {
  const sessionRef = ref(rtdb, `gameSessions/${sessionId}`)
  
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
  const gameStateRef = ref(rtdb, `gameSessions/${sessionId}/gameState`)
  
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
  const playersRef = ref(rtdb, `gameSessions/${sessionId}/players`)
  
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
    const sessionRef = ref(rtdb, `gameSessions/${sessionId}`)
    
    await update(sessionRef, {
      status: 'completed',
      'gameState/phase': 'results',
      'gameState/completedAt': serverTimestamp(),
      'gameState/finalScores': finalScores,
      'gameState/finalData': gameData
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
    await remove(ref(rtdb, `gameSessions/${sessionId}/players/${playerId}`))
    
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
    const sessionsRef = ref(rtdb, 'gameSessions')
    const snapshot = await get(sessionsRef)
    
    const activeSessions = []
    
    if (snapshot.exists()) {
      const sessions = snapshot.val()
      for (const [sessionId, session] of Object.entries(sessions)) {
        // Check if user is host or player in active session
        if (session.status === 'active' && 
            (session.host.uid === userId || 
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
