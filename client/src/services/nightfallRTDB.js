// Nightfall RTDB Multiplayer Service
// Shared game instance at /games/nightfall/{sessionId}

import { rtdb } from '../lib/firebase'
import { ref, onValue, off, update, push, set, serverTimestamp, get } from 'firebase/database'

export const gamePath = (sessionId) => `games/nightfall/${sessionId}`

export const subscribeGame = (sessionId, cb) => {
  const gameRef = ref(rtdb, gamePath(sessionId))
  const unsub = onValue(gameRef, (snap) => cb(snap.exists() ? { id: sessionId, ...snap.val() } : null))
  return () => off(gameRef, 'value', unsub)
}

export const sendChat = async (sessionId, senderUid, text) => {
  const msgRef = push(ref(rtdb, `${gamePath(sessionId)}/chat`))
  await set(msgRef, { senderUid, text, timestamp: serverTimestamp() })
}

export const useHint = async (sessionId, uid, hintKey) => {
  const hintRef = push(ref(rtdb, `${gamePath(sessionId)}/hints`))
  await set(hintRef, { usedByUid: uid, hintKey: hintKey || null, timestamp: serverTimestamp() })
  await logEvent(sessionId, uid, 'hint_used', { hintKey })
}

export const solveRoom = async (sessionId, roomId, uid) => {
  const roomRef = ref(rtdb, `${gamePath(sessionId)}/rooms/${roomId}`)
  await update(roomRef, { solved: true, solvedAt: serverTimestamp(), solvedBy: uid })
  await logEvent(sessionId, uid, 'room_solved', { roomId })
}

export const setTeamInput = async (sessionId, roomId, inputKey, data, uid) => {
  const roomRef = ref(rtdb, `${gamePath(sessionId)}/rooms/${roomId}/inputs/${inputKey}`)
  await set(roomRef, { data, by: uid, timestamp: serverTimestamp() })
  await logEvent(sessionId, uid, 'team_input', { roomId, inputKey })
}

export const logEvent = async (sessionId, uid, type, payload = {}) => {
  const evRef = push(ref(rtdb, `${gamePath(sessionId)}/eventsLog`))
  await set(evRef, { type, uid, payload, timestamp: serverTimestamp() })
}

export const fetchRoleForUser = async (sessionId, uid) => {
  const snap = await get(ref(rtdb, `lobbies/${sessionId}/players/${uid}/role`))
  return snap.exists() ? snap.val() : null
}


