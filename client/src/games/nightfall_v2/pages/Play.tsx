import React from 'react'
import { useRtdbSubscribe } from '../hooks/useRtdbSubscribe'
import { sendChatMessage } from '../lib/chat'

export default function PlayPage({ sessionId, user }: { sessionId: string; user: { uid: string } }) {
  const game = useRtdbSubscribe(`games/nightfall/${sessionId}`)
  const [text, setText] = React.useState('')
  if (!game) return <div>Loading game…</div>
  const chat = game.chat ? Object.values(game.chat) as any[] : []
  return (
    <div style={{ padding: 16 }}>
      <div>Phase: {game?.state?.phase}</div>
      <div>
        <ul>
          {chat.slice(-10).map((m, idx) => (
            <li key={idx}>{m.senderUid}: {m.text}</li>
          ))}
        </ul>
        <input value={text} onChange={(e)=>setText(e.target.value)} />
        <button onClick={()=>{ if(text.trim()) sendChatMessage(sessionId, user.uid, text.trim()); setText('') }}>Send</button>
      </div>
    </div>
  )
}


