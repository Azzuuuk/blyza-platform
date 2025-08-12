import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'

const LobbyPage = () => {
  const navigate = useNavigate()

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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Game Lobby
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            This feature is being implemented! Players will be able to wait here before games start.
          </p>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-semibold mb-4">Lobby Features:</h2>
            <ul className="text-left space-y-2 max-w-md mx-auto">
              <li>• Real-time player list</li>
              <li>• Room code sharing</li>
              <li>• Game settings preview</li>
              <li>• Host controls</li>
              <li>• Player chat</li>
            </ul>
          </div>
          
          <button
            onClick={() => navigate('/games')}
            className="btn-primary mt-8"
          >
            Back to Games
          </button>
        </div>
      </div>
    </div>
  )
}

export default LobbyPage
