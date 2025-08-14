import { ref } from '../api/firebase'
import { push, set, serverTimestamp, update, onDisconnect, onValue, get } from 'firebase/database'

export async function createSession(managerUid: string) {
  const sessionRef = push(ref('lobbies'))
  const sessionId = sessionRef.key as string
  const code = Math.random().toString(36).slice(2, 8).toUpperCase()
  await set(sessionRef, {
    managerUid,
    code,
    status: 'lobby',
    createdAt: serverTimestamp(),
    startedAt: null,
    endedAt: null
  })
  await set(ref(`lobbyCodes/${code}`), { sessionId })
  return { sessionId, code }
}

export async function joinSession(sessionId: string, user: { uid: string; displayName: string }) {
  const playerRef = ref(`lobbies/${sessionId}/players/${user.uid}`)
  await set(playerRef, {
    displayName: user.displayName || 'Player',
    role: null,
    connected: true,
    ready: false,
    joinedAt: serverTimestamp(),
    lastSeen: serverTimestamp()
  })
  try {
    const connRef = ref('.info/connected')
    onValue(connRef, (snap) => {
      if (snap.val() === true) {
        onDisconnect(playerRef).update({ connected: false, lastSeen: serverTimestamp() })
      }
    })
  } catch {}
}

export async function setReady(sessionId: string, uid: string, ready: boolean) {
  await update(ref(`lobbies/${sessionId}/players/${uid}`), { ready })
}

export async function startGame(sessionId: string) {
  await set(ref(`games/nightfall/${sessionId}/config`), {
    minPlayers: 2,
    maxPlayers: 4,
    rooms: ['archives', 'lab', 'ops', 'vault'],
    timeLimitSec: 1800
  })
  await set(ref(`games/nightfall/${sessionId}/state`), {
    phase: 'IN_PROGRESS',
    turn: 1,
    timers: { startedAt: serverTimestamp(), remainingSec: 1800 }
  })
  // Write roles map from lobby and initialize rooms
  const playersSnap = await get(ref(`lobbies/${sessionId}/players`))
  const players = playersSnap.exists() ? (playersSnap.val() || {}) : {}
  const roles: Record<string,string> = {}
  const playerUids = Object.keys(players).filter((uid) => players[uid]?.role && players[uid].role !== 'manager')
  playerUids.forEach((uid) => { roles[uid] = players[uid].role })
  await set(ref(`games/nightfall/${sessionId}/roles`), roles)

  const roomIds = ['archives','lab','ops','vault']
  const rooms: any = {}
  roomIds.forEach((rid, idx) => {
    rooms[rid] = {
      leadUid: playerUids[idx % Math.max(1, playerUids.length)] || null,
      solved: false,
      progress: 0,
      locks: { a: { open: false }, b: { open: false } },
      clues: { x: { revealed: false }, y: { revealed: false } }
    }
  })
  await set(ref(`games/nightfall/${sessionId}/rooms`), rooms)
  await update(ref(`lobbies/${sessionId}`), { status: 'in_progress', startedAt: serverTimestamp() })
}


