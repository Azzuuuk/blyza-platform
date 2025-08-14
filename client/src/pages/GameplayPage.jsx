import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import OperationNightfall from '../games/CodeBreakers/OperationNightfall'
import { useAuthStore } from '../stores/useAuthStore'
import { rtdb } from '../lib/firebase'
import { ref, get } from 'firebase/database'

const GameplayPage = () => {
  const { user } = useAuthStore()
  const { sessionId } = useParams()
  const [searchParams] = useSearchParams()
  const [role, setRole] = useState(null)
  const [spectator, setSpectator] = useState(false)

  useEffect(() => {
    setSpectator(searchParams.get('spectator') === '1')
  }, [searchParams])

  useEffect(() => {
    const loadRole = async () => {
      if (!user || !sessionId) return
      try {
        const snap = await get(ref(rtdb, `lobbies/${sessionId}/players/${user.uid}/role`))
        if (snap.exists()) setRole(snap.val())
      } catch {}
    }
    loadRole()
  }, [user, sessionId])

  if (!sessionId) return null
  return <OperationNightfall sessionId={sessionId} role={role} spectator={spectator} />
}

export default GameplayPage
