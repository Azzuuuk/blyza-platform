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
  Settings
} from 'lucide-react'
import { api } from '../services/api'
import GameCard from '../components/GameCard'
import LoadingSpinner from '../components/LoadingSpinner'

const GameCatalog = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [selectedDuration, setSelectedDuration] = useState('all')

  // Fetch games
  const { data: gamesData, isLoading, error } = useQuery({
    queryKey: ['games', selectedCategory, selectedDifficulty, selectedDuration],
    queryFn: () => api.getGames({
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
      duration: selectedDuration !== 'all' ? selectedDuration : undefined
    }),
    // Add fallback data when backend is not available
    retry: 1,
    retryDelay: 1000
  })

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['game-categories'],
    queryFn: () => api.getGameCategories(),
    retry: 1,
    retryDelay: 1000
  })

  // Mock data fallback when backend is not available
  const mockGames = [
    {
      id: 'trust-fall-modern',
      title: 'Digital Trust Bridge',
      description: 'Build trust through collaborative online challenges and shared problem-solving.',
      category: 'Trust Building',
      duration: 25,
      teamSize: { min: 4, max: 8 },
      difficulty: 'medium',
      rating: 4.7,
      tags: ['trust', 'collaboration', 'communication']
    },
    {
      id: 'escape-room-virtual',
      title: 'Virtual Escape Challenge',
      description: 'Work together to solve puzzles and escape from a virtual room scenario.',
      category: 'Problem Solving',
      duration: 30,
      teamSize: { min: 3, max: 6 },
      difficulty: 'hard',
      rating: 4.8,
      tags: ['problem-solving', 'critical thinking', 'teamwork']
    },
    {
      id: 'storytelling-chain',
      title: 'Collaborative Story Weaving',
      description: 'Create amazing stories together, building on each other\'s creativity.',
      category: 'Creativity',
      duration: 20,
      teamSize: { min: 3, max: 8 },
      difficulty: 'easy',
      rating: 4.5,
      tags: ['creativity', 'storytelling', 'imagination']
    }
  ]

  const mockCategories = [
    { name: 'Trust Building', count: 3 },
    { name: 'Communication', count: 4 },
    { name: 'Problem Solving', count: 3 },
    { name: 'Creativity', count: 3 },
    { name: 'Leadership', count: 3 }
  ]

  const games = gamesData?.games || (error ? mockGames : [])
  const categories = categoriesData?.categories || (error ? mockCategories : [])

  // Filter games by search term
  const filteredGames = games.filter(game =>
    game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const durationOptions = [
    { value: 'all', label: 'Any Duration' },
    { value: '15-20', label: '15-20 min' },
    { value: '20-30', label: '20-30 min' },
    { value: '30-45', label: '30+ min' }
  ]

  const difficultyOptions = [
    { value: 'all', label: 'Any Level' },
    { value: 'Easy', label: 'Easy' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Hard', label: 'Hard' }
  ]

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Unable to load games</h2>
          <p className="text-slate-300 mb-4">Please check your connection and try again.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl float-animation"></div>
        <div className="absolute top-3/4 right-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl float-animation" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl float-animation" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Header */}
      <header className="nav-glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </Link>
              
              <div className="w-px h-6 bg-slate-600"></div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-lg flex items-center justify-center pulse-glow">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">Game Catalog</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/rewards" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                Rewards
              </Link>
              <Link to="/join" className="btn-secondary">
                Join Game
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search games by name, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category.name} value={category.name}>
                      {category.name} ({category.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {difficultyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {durationOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('all')
                    setSelectedDifficulty('all')
                    setSelectedDuration('all')
                  }}
                  className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredGames.length} Games Found
            </h2>
            
            {searchTerm && (
              <div className="text-sm text-gray-600">
                Searching for: <span className="font-semibold">"{searchTerm}"</span>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {/* Games Grid */}
        {!isLoading && (
          <AnimatePresence mode="wait">
            {filteredGames.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredGames.map((game, index) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <GameCard game={game} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No games found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search terms or filters to find more games.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('all')
                    setSelectedDifficulty('all')
                    setSelectedDuration('all')
                  }}
                  className="btn-primary"
                >
                  Show All Games
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

export default GameCatalog
