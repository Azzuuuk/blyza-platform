import React, { useEffect, useState } from 'react'
import { createSession, startGame } from '../lib/session'
import { ref } from '../api/firebase'
import { onValue, update } from 'firebase/database'

export default function ManagerPage({ user }: { user: { uid: string; displayName?: string } }) {
  const [session, setSession] = useState<{ id: string; code: string } | null>(null)
  const [players, setPlayers] = useState<Record<string, any>>({})

  const handleCreate = async () => {
    const s = await createSession(user.uid)
    setSession({ id: s.sessionId, code: s.code })
    onValue(ref(`lobbies/${s.sessionId}/players`), (snap) => setPlayers(snap.val() || {}))
  }

  const assignRole = async (uid: string, role: string) => {
    if (!session) return
    await update(ref(`lobbies/${session.id}/players/${uid}`), { role })
  }

  const doStart = async () => {
    if (!session) return
    await startGame(session.id)
  }

  return (
    <div style={{ padding: 16 }}>
      {!session ? (
        <button onClick={handleCreate}>Create Session</button>
      ) : (
        <div>
          <div>Code: {session.code}</div>
          <ul>
            {Object.entries(players).map(([uid, p]) => (
              <li key={uid}>
                {p.displayName}
                <select value={p.role || ''} onChange={(e) => assignRole(uid, e.target.value)}>
                  <option value="">Select role</option>
                  <option value="scout">Scout</option>
                  <option value="analyst">Analyst</option>
                  <option value="engineer">Engineer</option>
                  <option value="coordinator">Coordinator</option>
                </select>
              </li>
            ))}
          </ul>
          <button onClick={doStart}>Start Game</button>
        </div>
      )}
    </div>
  )
}


