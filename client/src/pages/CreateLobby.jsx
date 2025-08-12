import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, Clock, Settings, Play } from 'lucide-react'

const CreateLobby = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const gameId = location.state?.gameId
  
  const [lobbySettings, setLobbySettings] = useState({
    lobbyName: '',
    maxPlayers: 8,
    isPrivate: false,
    waitTime: '2'
  })

  const handleCreateLobby = () => {
    // In a real app, this would create a lobby via API
    const lobbyId = `lobby_${Date.now()}`
    navigate(`/lobby/${lobbyId}`, { state: { gameId, settings: lobbySettings } })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            
            <h1 className="text-xl font-bold text-gray-900">Create Game Lobby</h1>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Set Up Your Game
            </h2>
            <p className="text-gray-600">
              Configure your lobby settings before inviting team members
            </p>
          </div>

          <div className="space-y-6">
            {/* Lobby Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Lobby Name
              </label>
              <input
                type="text"
                value={lobbySettings.lobbyName}
                onChange={(e) => setLobbySettings({ ...lobbySettings, lobbyName: e.target.value })}
                placeholder="Enter a name for your game session"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Max Players */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Maximum Players
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[4, 6, 8, 12].map((num) => (
                  <button
                    key={num}
                    onClick={() => setLobbySettings({ ...lobbySettings, maxPlayers: num })}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      lobbySettings.maxPlayers === num
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Wait Time */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Wait Time for Late Joiners (minutes)
              </label>
              <div className="grid grid-cols-4 gap-3">
                {['1', '2', '5', '10'].map((time) => (
                  <button
                    key={time}
                    onClick={() => setLobbySettings({ ...lobbySettings, waitTime: time })}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      lobbySettings.waitTime === time
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {time}m
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy Setting */}
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={lobbySettings.isPrivate}
                  onChange={(e) => setLobbySettings({ ...lobbySettings, isPrivate: e.target.checked })}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-900">
                  Make this lobby private (requires invite code)
                </span>
              </label>
            </div>

            <button
              onClick={handleCreateLobby}
              disabled={!lobbySettings.lobbyName.trim()}
              className="w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>Create Lobby</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default CreateLobby
