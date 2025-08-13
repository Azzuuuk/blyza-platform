import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Play,
  Sparkles,
  Users,
  Clock,
  Target,
  KeyRound
} from 'lucide-react'

const QuickGames = () => {
  const navigate = useNavigate()
  
  const games = [
    {
      id: 'code-breakers',
      title: 'Operation Nightfall',
      subtitle: 'Code Breakers Team Game',
      description: 'Collaborative spy mission with real-time multiplayer, role-based gameplay, and comprehensive analytics. Perfect for testing the full MVP workflow.',
      emoji: '🕵️',
      difficulty: 'Medium',
      duration: '20-30 min',
      players: '2-6 players',
      features: ['Real-time Multiplayer', 'Data Analytics', 'n8n Integration', 'AI Insights'],
      color: '#7c3aed',
      available: true,
      route: '/games/code-breakers'
    },
    {
      id: 'team-escape',
      title: 'Virtual Escape Room',
      subtitle: 'Problem Solving Challenge',
      description: 'Coming soon - Immersive puzzle-solving experience.',
      emoji: '🔓',
      difficulty: 'Hard',
      duration: '45-60 min',
      players: '4-8 players',
      features: ['Puzzle Solving', 'Team Communication', 'Time Pressure'],
      color: '#334155',
      available: false,
      route: null
    }
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      color: '#e2e8f0'
    }}>
      {/* Header */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(51, 65, 85, 0.5)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => navigate('/')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  color: '#cbd5e1',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft style={{ width: 20, height: 20 }} />
                <span>Back</span>
              </button>

              <div style={{ width: 1, height: 24, background: '#475569' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 32,
                  height: 32,
                  background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Sparkles style={{ width: 20, height: 20, color: 'white' }} />
                </div>
                <span style={{
                  fontSize: 18,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent'
                }}>Quick Games</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '48px' }}
        >
          <h1 style={{ fontSize: 40, fontWeight: 800, color: 'white', marginBottom: 12 }}>
            Available Games
          </h1>
          <p style={{ fontSize: 18, color: '#94a3b8' }}>
            Test our MVP features with these interactive team-building experiences
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '32px'
        }}>
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{
                background: 'rgba(51, 65, 85, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(51, 65, 85, 0.2)',
                borderRadius: '16px',
                padding: '32px',
                opacity: game.available ? 1 : 0.6
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{
                  fontSize: '48px',
                  filter: game.available ? 'none' : 'grayscale(100%)'
                }}>
                  {game.emoji}
                </div>
                <div>
                  <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>
                    {game.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#94a3b8' }}>
                    {game.subtitle}
                  </p>
                </div>
              </div>

              <p style={{ color: '#cbd5e1', marginBottom: '24px', lineHeight: '1.6' }}>
                {game.description}
              </p>

              {/* Game Info */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px',
                  background: 'rgba(71, 85, 105, 0.3)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#cbd5e1'
                }}>
                  <Target style={{ width: 14, height: 14 }} />
                  {game.difficulty}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px',
                  background: 'rgba(71, 85, 105, 0.3)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#cbd5e1'
                }}>
                  <Clock style={{ width: 14, height: 14 }} />
                  {game.duration}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px',
                  background: 'rgba(71, 85, 105, 0.3)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#cbd5e1'
                }}>
                  <Users style={{ width: 14, height: 14 }} />
                  {game.players}
                </div>
              </div>

              {/* Features */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '8px' }}>
                  Features:
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {game.features.map((feature) => (
                    <span
                      key={feature}
                      style={{
                        padding: '2px 8px',
                        background: 'rgba(124, 58, 237, 0.2)',
                        color: '#c4b5fd',
                        borderRadius: '4px',
                        fontSize: '11px'
                      }}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              {game.available ? (
                <button
                  onClick={() => navigate(game.route)}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                    color: 'white',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Play style={{ width: 20, height: 20 }} />
                  Start Game
                </button>
              ) : (
                <div style={{
                  width: '100%',
                  background: 'rgba(71, 85, 105, 0.3)',
                  color: '#94a3b8',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  Coming Soon
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ marginTop: '64px', textAlign: 'center' }}
        >
          <div style={{
            background: 'rgba(51, 65, 85, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{ fontWeight: 600, color: '#60a5fa', marginBottom: 8 }}>Testing the MVP</h3>
            <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 16 }}>
              The CodeBreakers game tests all MVP features: multiplayer gameplay, data collection, 
              n8n workflow integration, and AI-powered analytics dashboard.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => navigate('/join-game')}
                style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  color: '#22c55e',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  cursor: 'pointer'
                }}
              >
                Join Existing Game
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  color: '#60a5fa',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  cursor: 'pointer'
                }}
              >
                View Dashboard
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default QuickGames
