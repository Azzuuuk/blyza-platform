import { ref } from '../api/firebase'
import { runTransaction, update, serverTimestamp, push, set } from 'firebase/database'

export async function useHint(sessionId: string, roomId: string, uid: string) {
  const hintRef = push(ref(`games/nightfall/${sessionId}/hints`))
  await set(hintRef, { usedByUid: uid, roomId, ts: serverTimestamp() })
  await runTransaction(ref(`analytics/${sessionId}/counters/hintsUsed`), (n) => (n || 0) + 1)
}

export async function solveLock(sessionId: string, roomId: string, lockId: string) {
  await update(ref(`games/nightfall/${sessionId}/rooms/${roomId}/locks/${lockId}`), { open: true })
  await runTransaction(ref(`analytics/${sessionId}/counters/puzzlesSolved`), (n) => (n || 0) + 1)
}

export async function revealClue(sessionId: string, roomId: string, clueId: string) {
  await update(ref(`games/nightfall/${sessionId}/rooms/${roomId}/clues/${clueId}`), { revealed: true })
}


