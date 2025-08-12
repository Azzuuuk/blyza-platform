import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Clock, 
  Users, 
  Star, 
  Play,
  Settings,
  TrendingUp,
  Brain,
  MessageCircle,
  Target
} from 'lucide-react'

const GameCard = ({ game }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'trust building': return <Target className="w-4 h-4" />
      case 'communication': return <MessageCircle className="w-4 h-4" />
      case 'problem solving': return <Brain className="w-4 h-4" />
      case 'creativity': return <Star className="w-4 h-4" />
      case 'leadership': return <TrendingUp className="w-4 h-4" />
      default: return <Play className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case 'trust building': return 'from-blue-500 to-cyan-500'
      case 'communication': return 'from-green-500 to-emerald-500'
      case 'problem solving': return 'from-purple-500 to-violet-500'
      case 'creativity': return 'from-orange-500 to-amber-500'
      case 'leadership': return 'from-red-500 to-pink-500'
      default: return 'from-gray-500 to-slate-500'
    }
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="game-card group"
    >
      {/* Card Header */}
      <div className={`relative h-40 bg-gradient-to-br ${getCategoryColor(game.category)} p-6 text-white`}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-2">
            {getCategoryIcon(game.category)}
            <span className="text-sm font-medium opacity-90">{game.category}</span>
          </div>
          
          <div className="flex items-center space-x-1 bg-white/20 rounded-full px-2 py-1">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">{game.rating}</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold mb-2 group-hover:scale-105 transition-transform duration-200">
          {game.title}
        </h3>
        
        <div className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(game.difficulty)} bg-white/90`}>
          {game.difficulty}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6">
        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
          {game.description}
        </p>

        {/* Game Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{game.duration} min</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>{game.teamSize.min}-{game.teamSize.max} players</span>
          </div>
        </div>

        {/* Tags */}
        {game.tags && game.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {game.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
              >
                {tag}
              </span>
            ))}
            {game.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                +{game.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Link
            to={`/games/${game.id}/customize`}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg text-center group"
          >
            <div className="flex items-center justify-center space-x-2">
              <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Start Game</span>
            </div>
          </Link>
          
          <Link
            to={`/games/${game.id}/customize?mode=preview`}
            className="bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all duration-200 border border-gray-200 hover:border-gray-300 shadow-md hover:shadow-lg"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl" />
    </motion.div>
  )
}

export default GameCard
