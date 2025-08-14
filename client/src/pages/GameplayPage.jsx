import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import OperationNightfall from '../games/CodeBreakers/OperationNightfall'
import { subscribeGame, fetchRoleForUser } from '../services/nightfallRTDB'
import { useAuthStore } from '../stores/useAuthStore'
import { rtdb } from '../lib/firebase'
import { ref, get } from 'firebase/database'

const GameplayPage = () => {
  const { user } = useAuthStore()
  const { sessionId } = useParams()
  const [searchParams] = useSearchParams()
  const [role, setRole] = useState(null)
  const [spectator, setSpectator] = useState(false)
  const [game, setGame] = useState(null)

  useEffect(() => {
    setSpectator(searchParams.get('spectator') === '1')
  }, [searchParams])

  useEffect(() => {
    const loadRole = async () => {
      if (!user || !sessionId) return
      try {
        const assigned = await fetchRoleForUser(sessionId, user.uid)
        if (assigned) setRole(assigned)
      } catch {}
    }
    loadRole()
  }, [user, sessionId])

  useEffect(() => {
    if (!sessionId) return
    const unsub = subscribeGame(sessionId, setGame)
    return () => unsub?.()
  }, [sessionId])

  if (!sessionId) return null
  return <OperationNightfall sessionId={sessionId} role={role} spectator={spectator} sharedGame={game} />
}

export default GameplayPage
