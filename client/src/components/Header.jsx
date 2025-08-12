import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Sparkles, Menu, X, User, LogOut } from 'lucide-react'
import { useAuthStore } from '../stores/useAuthStore'

/**
 * Header Component - Main navigation bar
 * Responsive design with mobile menu
 */
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsMenuOpen(false)
  }

  const isActivePath = (path) => location.pathname === path

  const navLinks = [
    { path: '/game-intent', label: 'Games', public: true },
    { path: '/rewards', label: 'Rewards', public: true },
    { path: '/analytics', label: 'Analytics', auth: true }
  ]

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-accent-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">Blyza</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map(link => {
              if (link.auth && !isAuthenticated) return null
              if (link.manager && !user?.role === 'manager') return null
              
              return (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className={`font-medium transition-colors hover:text-primary-600 ${
                    isActivePath(link.path) 
                      ? 'text-primary-600 border-b-2 border-primary-600' 
                      : 'text-gray-600'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
          
          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-800">
                    {user?.name || 'User'}
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <Link to="/join" className="btn-secondary">
                  Join Game
                </Link>
                <Link to="/game-intent" className="btn-primary">
                  Start Playing
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white">
            <nav className="flex flex-col space-y-2">
              {navLinks.map(link => {
                if (link.auth && !isAuthenticated) return null
                
                return (
                  <Link 
                    key={link.path}
                    to={link.path} 
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      isActivePath(link.path)
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              })}
              
              {/* Mobile User Section */}
              <div className="px-4 py-2 border-t border-gray-200 mt-2">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{user?.name || 'User'}</span>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-red-600 hover:text-red-700 text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link 
                      to="/join" 
                      className="btn-secondary w-full text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Join Game
                    </Link>
                    <Link 
                      to="/game-intent" 
                      className="btn-primary w-full text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Start Playing
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
