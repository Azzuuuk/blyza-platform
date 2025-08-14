import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../stores/useAuthStore'
import { subscribeToLobby, subscribeToPlayers, startGameSession } from '../services/firebaseMultiplayer'

const LobbyPage = () => {
  const navigate = useNavigate()
  const { lobbyId } = useParams()
  const location = useLocation()
  const { user } = useAuthStore()
  const [lobby, setLobby] = useState(null)
  const [players, setPlayers] = useState({})
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    if (!lobbyId) return
    const unsubLobby = subscribeToLobby(lobbyId, (res) => {
      if (res.success) setLobby(res.session)
      else toast.error(res.error)
    })
    const unsubPlayers = subscribeToPlayers(lobbyId, (res) => {
      if (res.success) setPlayers(res.players)
    })
    return () => {
      unsubLobby?.()
      unsubPlayers?.()
    }
  }, [lobbyId])

  const onStart = async () => {
    if (!user || user.uid !== lobby?.managerUid) {
      toast.error('Only the manager can start')
      return
    }
    const total = Object.keys(players || {}).length
    if (total < 2) {
      toast.error('At least 2 players required')
      return
    }
    setStarting(true)
    const res = await startGameSession(lobbyId, user.uid)
    setStarting(false)
    if (!res.success) {
      toast.error(res.error || 'Failed to start')
      return
    }
    navigate(`/game/${lobbyId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/games')}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Leave Lobby</span>
              </button>
              
              <div className="w-px h-6 bg-gray-300"></div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">Game Lobby</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Game Lobby</h1>
          <p className="text-gray-600 mb-1">Code: <span className="font-mono tracking-widest">{lobby?.code || location.state?.roomCode || '—'}</span></p>
          <p className="text-gray-600 mb-8">Status: {lobby?.status || '—'}</p>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-semibold mb-4">Players</h2>
            <ul className="text-left space-y-2 max-w-md mx-auto">
              {Object.entries(players || {}).map(([uid, p]) => (
                <li key={uid} className="flex items-center justify-between">
                  <span className="font-medium">{p.displayName}</span>
                  <span className="text-sm text-gray-500">{p.role || (uid === lobby?.managerUid ? 'manager' : '—')}</span>
                </li>
              ))}
            </ul>
          </div>
          {user?.uid === lobby?.managerUid && (
            <button onClick={onStart} className="btn-primary mt-8" disabled={starting || (Object.keys(players||{}).length < 2)}>
              {starting ? 'Starting…' : 'Start Game'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default LobbyPage
