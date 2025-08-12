import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Clock, 
  Users, 
  Star,
  ArrowLeft,
  Sparkles,
  Play,
  Settings,
  Target,
  Heart,
  Brain,
  Zap,
  KeyRound
} from 'lucide-react'
import { api } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

const GameCatalog = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [selectedDuration, setSelectedDuration] = useState('all')

  // Common styles
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
    color: '#e2e8f0'
  }

  const headerStyle = {
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
    position: 'sticky',
    top: 0,
    zIndex: 50
  }

  const cardStyle = {
    background: 'rgba(51, 65, 85, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(51, 65, 85, 0.2)',
    borderRadius: '12px',
    padding: '24px',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  }

  const buttonStyle = {
    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  }

  // Fetch games with fallback data
  const { data: gamesData, isLoading, error } = useQuery({
    queryKey: ['games', selectedCategory, selectedDifficulty, selectedDuration],
    queryFn: () => api.getGames({
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
      duration: selectedDuration !== 'all' ? selectedDuration : undefined
    }),
    retry: 1,
    retryDelay: 1000
  })

  // Mock data fallback
  const mockGames = [
    {
      id: 'code-breakers-team',
      title: '🔐 Code Breakers: Team Edition',
      description: 'Collaborative cipher-solving mission where each team member has unique intelligence. True interdependence required! 🕵️',
      category: 'Problem Solving',
      difficulty: 'Medium',
      duration: '20-30 min',
      playerCount: '4 players',
      rating: 4.9,
      tags: ['Problem Solving', 'Collaboration', 'Role-based', 'Spy Theme'],
      icon: KeyRound,
      color: '#7c3aed',
      emoji: '🔐',
      isNew: true,
      isPopular: true
    },
    {
      id: 'trust-fall-modern',
      title: '🤝 Trust & Transparency Challenge',
      description: 'Build deeper team trust through fun vulnerability exercises and team support challenges! 💪',
      category: 'Trust Building',
      difficulty: 'Medium',
      duration: '45-60 min',
      playerCount: '4-12',
      rating: 4.8,
      tags: ['Trust', 'Vulnerability', 'Communication'],
      icon: Heart,
      color: '#fb7185',
      emoji: '🤝'
    },
    {
      id: 'creative-storm',
      title: '🌪️ Innovation Storm',
      description: 'Unleash your team\'s creativity through wild brainstorming and crazy problem-solving adventures! 🚀',
      category: 'Creativity',
      difficulty: 'Medium',
      duration: '30-45 min',
      playerCount: '5-15',
      rating: 4.6,
      tags: ['Creativity', 'Innovation', 'Brainstorming'],
      icon: Brain,
      color: '#a855f7',
      emoji: '🌪️'
    },
    {
      id: 'communication-flow',
      title: '💬 Communication Flow',
      description: 'Master the art of clear communication through hilarious listening games and speaking challenges! 🎯',
      category: 'Communication',
      difficulty: 'Easy',
      duration: '20-30 min',
      playerCount: '3-10',
      rating: 4.7,
      tags: ['Communication', 'Listening', 'Clarity'],
      icon: Users,
      color: '#60a5fa',
      emoji: '💬'
    },
    {
      id: 'leadership-maze',
      title: '👑 Leadership Navigation',
      description: 'Step into the leader\'s shoes and guide your team through exciting decision-making adventures! ⚡',
      category: 'Leadership',
      difficulty: 'Hard',
      duration: '60-90 min',
      playerCount: '6-12',
      rating: 4.9,
      tags: ['Leadership', 'Decision Making', 'Strategy'],
      icon: Target,
      color: '#f59e0b',
      emoji: '👑'
    },
    {
      id: 'energy-sync',
      title: '⚡ Team Energy Sync',
      description: 'Boost your team\'s energy and motivation through super fun, high-energy team challenges! 🎉',
      category: 'Team Bonding',
      difficulty: 'Easy',
      duration: '15-25 min',
      playerCount: '4-20',
      rating: 4.5,
      tags: ['Energy', 'Fun', 'Motivation'],
      icon: Zap,
      color: '#34d399',
      emoji: '⚡'
    },
    {
      id: 'problem-solver',
      title: '🧩 Collaborative Problem Solver',
      description: 'Team up to tackle mind-bending puzzles and challenges using everyone\'s unique superpowers! 🦸‍♂️',
      category: 'Problem Solving',
      difficulty: 'Hard',
      duration: '45-75 min',
      playerCount: '5-12',
      rating: 4.8,
      tags: ['Problem Solving', 'Collaboration', 'Strategy'],
      icon: Settings,
      color: '#8b5cf6',
      emoji: '🧩'
    }
  ]

  const categories = [
    { id: 'all', name: 'All Games', count: mockGames.length },
    { id: 'trust', name: 'Trust Building', count: 1 },
    { id: 'communication', name: 'Communication', count: 1 },
    { id: 'creativity', name: 'Creativity', count: 1 },
    { id: 'leadership', name: 'Leadership', count: 1 },
    { id: 'problem-solving', name: 'Problem Solving', count: 1 },
    { id: 'team-bonding', name: 'Team Bonding', count: 1 }
  ]

  const games = gamesData?.games || mockGames
  const filteredGames = games.filter(game => 
    game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#34d399'
      case 'medium': return '#f59e0b'
      case 'hard': return '#ef4444'
      default: return '#94a3b8'
    }
  }

  const GameCard = ({ game }) => {
    const IconComponent = game.icon || Star
    
    return (
      <motion.div
        whileHover={{ scale: 1.05, y: -8, rotateY: 5 }}
        whileTap={{ scale: 0.95 }}
        style={{
          ...cardStyle,
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${game.color}15, rgba(51, 65, 85, 0.1))`,
          border: `2px solid ${game.color}30`,
          boxShadow: `0 10px 25px ${game.color}20`
        }}
      >
        {/* Fun background pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: `linear-gradient(90deg, ${game.color}, ${game.color}dd, ${game.color})`
        }} />

        {/* Floating emoji */}
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          fontSize: '32px',
          animation: 'float 3s ease-in-out infinite'
        }}>
          {game.emoji}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
          marginBottom: '16px'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: `linear-gradient(135deg, ${game.color}30, ${game.color}20)`,
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: `2px solid ${game.color}40`,
            boxShadow: `0 4px 12px ${game.color}25`
          }}>
            <IconComponent style={{width: '28px', height: '28px', color: game.color}} />
          </div>
          
          <div style={{flex: 1}}>
            <h3 style={{
              fontSize: '22px',
              fontWeight: '700',
              color: 'white',
              marginBottom: '8px',
              margin: 0,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              {game.title}
            </h3>
            <p style={{
              color: '#cbd5e1',
              fontSize: '15px',
              lineHeight: '1.6',
              margin: 0
            }}>
              {game.description}
            </p>
          </div>
        </div>

        {/* Game details with fun icons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: '12px',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8'}}>
            <span style={{fontSize: '16px'}}>⏰</span>
            {game.duration}
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8'}}>
            <span style={{fontSize: '16px'}}>👥</span>
            {game.playerCount}
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8'}}>
            <span style={{fontSize: '16px'}}>⭐</span>
            {game.rating}
          </div>
        </div>

        {/* Fun difficulty badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px'
        }}>
          <span style={{
            padding: '6px 16px',
            borderRadius: '25px',
            fontSize: '13px',
            fontWeight: '700',
            background: `linear-gradient(135deg, ${getDifficultyColor(game.difficulty)}30, ${getDifficultyColor(game.difficulty)}20)`,
            color: getDifficultyColor(game.difficulty),
            border: `2px solid ${getDifficultyColor(game.difficulty)}40`,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {game.difficulty === 'easy' ? '🟢 Easy Peasy' : game.difficulty === 'medium' ? '🟡 Just Right' : '🔴 Challenge Mode'}
          </span>
        </div>

        {/* Fun tags */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '20px'
        }}>
          {game.tags?.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                background: `linear-gradient(135deg, ${game.color}25, ${game.color}15)`,
                color: '#e2e8f0',
                border: `1px solid ${game.color}30`
              }}
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{
          display: 'flex',
          gap: '12px'
        }}>
          <Link
            to={game.id === 'code-breakers-team' ? '/games/code-breakers/team' : `/games/${game.id}/customize`}
            style={{
              ...buttonStyle,
              flex: 1,
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: '700',
              padding: '12px 20px',
              background: `linear-gradient(135deg, ${game.color}, ${game.color}dd)`,
              boxShadow: `0 4px 15px ${game.color}30`,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            <Play style={{width: '18px', height: '18px'}} />
            {game.id === 'code-breakers-team' ? 'Start Mission! 🕵️' : 'Let\'s Play! 🎮'}
          </Link>
          <button
            style={{
              ...buttonStyle,
              background: 'rgba(51, 65, 85, 0.4)',
              color: '#cbd5e1',
              padding: '12px 16px',
              border: '2px solid rgba(51, 65, 85, 0.6)'
            }}
          >
            <Settings style={{width: '18px', height: '18px'}} />
          </button>
        </div>
      </motion.div>
    )
  }

  if (isLoading) {
    return (
      <div style={{...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      {/* Animated Background Elements */}
      <div style={{position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none'}}>
        <div style={{
          position: 'absolute',
          top: '25%',
          left: '40px',
          width: '128px',
          height: '128px',
          background: 'rgba(168, 85, 247, 0.1)',
          borderRadius: '50%',
          filter: 'blur(48px)',
          animation: 'pulse 4s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '75%',
          right: '40px',
          width: '192px',
          height: '192px',
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '50%',
          filter: 'blur(48px)',
          animation: 'pulse 4s ease-in-out infinite 2s'
        }}></div>
      </div>

      {/* Header */}
      <header style={headerStyle}>
        <div style={{maxWidth: '1280px', margin: '0 auto', padding: '0 24px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
              <Link to="/game-intent" style={{
                ...buttonStyle,
                background: 'rgba(51, 65, 85, 0.3)',
                color: '#cbd5e1',
                padding: '8px 12px'
              }}>
                <ArrowLeft style={{width: '20px', height: '20px'}} />
                Back
              </Link>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles style={{width: '24px', height: '24px', color: 'white'}} />
              </div>
              <span style={{
                fontSize: '24px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent'
              }}>
                Blyza
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{padding: '40px 24px'}}>
        <div style={{maxWidth: '1280px', margin: '0 auto'}}>
          {/* Page Header */}
          <div style={{textAlign: 'center', marginBottom: '48px'}}>
            <h1 style={{
              fontSize: '48px',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: 'white'
            }}>
              Choose Your Perfect Game
            </h1>
            <p style={{
              fontSize: '20px',
              color: '#94a3b8',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Discover team-building games tailored to your goals and preferences
            </p>
          </div>

          {/* Search and Filters */}
          <div style={{marginBottom: '40px'}}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              gap: '16px',
              marginBottom: '24px'
            }}>
              {/* Search */}
              <div style={{position: 'relative'}}>
                <Search style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '20px',
                  height: '20px',
                  color: '#94a3b8'
                }} />
                <input
                  type="text"
                  placeholder="Search games..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 48px',
                    borderRadius: '8px',
                    border: '1px solid rgba(51, 65, 85, 0.3)',
                    background: 'rgba(51, 65, 85, 0.1)',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.3s ease'
                  }}
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(51, 65, 85, 0.3)',
                  background: 'rgba(51, 65, 85, 0.1)',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                <option value="all">All Categories</option>
                <option value="trust">Trust Building</option>
                <option value="communication">Communication</option>
                <option value="creativity">Creativity</option>
                <option value="leadership">Leadership</option>
                <option value="problem-solving">Problem Solving</option>
              </select>

              {/* Difficulty Filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(51, 65, 85, 0.3)',
                  background: 'rgba(51, 65, 85, 0.1)',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              {/* Duration Filter */}
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(51, 65, 85, 0.3)',
                  background: 'rgba(51, 65, 85, 0.1)',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                <option value="all">Any Duration</option>
                <option value="short">Under 30 min</option>
                <option value="medium">30-60 min</option>
                <option value="long">Over 60 min</option>
              </select>
            </div>

            {/* Quick Categories */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  style={{
                    ...buttonStyle,
                    background: selectedCategory === category.id 
                      ? 'linear-gradient(135deg, #7c3aed, #2563eb)' 
                      : 'rgba(51, 65, 85, 0.3)',
                    color: selectedCategory === category.id ? 'white' : '#cbd5e1',
                    padding: '8px 16px',
                    fontSize: '14px'
                  }}
                >
                  {category.name}
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    background: selectedCategory === category.id ? 'rgba(255,255,255,0.2)' : 'rgba(51, 65, 85, 0.5)'
                  }}>
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Games Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: '24px'
          }}>
            <AnimatePresence>
              {filteredGames.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <GameCard game={game} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredGames.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                ...cardStyle,
                textAlign: 'center',
                padding: '48px',
                marginTop: '40px'
              }}
            >
              <Search style={{width: '48px', height: '48px', color: '#94a3b8', margin: '0 auto 16px'}} />
              <h3 style={{fontSize: '24px', fontWeight: '600', color: 'white', marginBottom: '8px'}}>
                No games found
              </h3>
              <p style={{color: '#94a3b8'}}>
                Try adjusting your search terms or filters to find more games.
              </p>
            </motion.div>
          )}
        </div>
      </main>

      {/* Global Styles */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(5deg); }
          }
        `}
      </style>
    </div>
  )
}

export default GameCatalog
