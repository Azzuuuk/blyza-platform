import React from 'react'
import { useRtdbSubscribe } from '../hooks/useRtdbSubscribe'

export default function LobbyPage({ sessionId }: { sessionId: string }) {
  const lobby = useRtdbSubscribe(`lobbies/${sessionId}`)
  if (!lobby) return <div>Loading…</div>
  const players = lobby.players || {}
  return (
    <div style={{ padding: 16 }}>
      <div>Status: {lobby.status}</div>
      <ul>
        {Object.entries(players).map(([uid, p]: any) => (
          <li key={uid}>{p.displayName} {p.ready ? '✅' : '⏳'} {p.role || ''}</li>
        ))}
      </ul>
    </div>
  )
}


