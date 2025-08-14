import { ref } from '../api/firebase'
import { push, set, serverTimestamp, onValue, off } from 'firebase/database'

export async function sendChatMessage(sessionId: string, senderUid: string, text: string) {
  const msgRef = push(ref(`games/nightfall/${sessionId}/chat`))
  await set(msgRef, { senderUid, text, ts: serverTimestamp() })
}

export function listenChat(sessionId: string, cb: (messages: any[]) => void) {
  const chatRef = ref(`games/nightfall/${sessionId}/chat`)
  const unsub = onValue(chatRef, (snap) => {
    const v = snap.val() || {}
    cb(Object.values(v))
  })
  return () => off(chatRef, 'value', unsub)
}


