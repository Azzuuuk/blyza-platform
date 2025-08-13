import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Gamepad2, 
  Users, 
  Brain, 
  TrendingUp, 
  Sparkles, 
  ArrowRight,
  Trophy,
  Zap
} from 'lucide-react'

const HomePage = () => {
  const features = [
    {
      icon: <Gamepad2 className="w-8 h-8" />,
      title: "18+ Game Templates",
      description: "Curated team-building games targeting specific challenges",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI Customization",
      description: "Personalize games with AI-powered tone and content adaptation",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Real-time Multiplayer",
      description: "Seamless online collaboration with live updates",
      color: "from-green-500 to-blue-600"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "AI Analytics",
      description: "Comprehensive team insights and actionable recommendations",
      color: "from-orange-500 to-red-600"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Rewards Store",
      description: "Motivate teams with points and region-specific rewards",
      color: "from-yellow-500 to-orange-600"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Reports",
      description: "3-page PDF reports delivered via email automatically",
      color: "from-indigo-500 to-purple-600"
    }
  ]

  const gameCategories = [
    { name: "Trust Building", count: 3, color: "bg-blue-100 text-blue-800" },
    { name: "Communication", count: 4, color: "bg-green-100 text-green-800" },
    { name: "Problem Solving", count: 3, color: "bg-purple-100 text-purple-800" },
    { name: "Creativity", count: 3, color: "bg-orange-100 text-orange-800" },
    { name: "Leadership", count: 3, color: "bg-red-100 text-red-800" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">Blyza</span>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <Link to="/game-intent" className="text-slate-300 hover:text-white font-medium transition-colors">
                Games
              </Link>
              <Link to="/rewards" className="text-slate-300 hover:text-white font-medium transition-colors">
                Rewards
              </Link>
              <a href="#features" className="text-slate-300 hover:text-white font-medium transition-colors">
                Features
              </a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Link to="/join" className="bg-slate-800/50 backdrop-blur-sm hover:bg-slate-700/60 text-slate-200 hover:text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 border border-slate-600/50">
                Join Game
              </Link>
              <Link to="/game-intent" className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Start Playing
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6"
            >
              AI-Powered
              <span className="block bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">Team Building</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              Transform your team dynamics with intelligent games, real-time analytics, 
              and actionable insights. The first platform that truly understands your team.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/game-intent" className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-800 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg group">
                Start Building Your Team
                <ArrowRight className="w-5 h-5 ml-2 inline group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/join" className="bg-slate-800/50 backdrop-blur-sm hover:bg-slate-700/60 text-slate-200 hover:text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 border border-slate-600/50 text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                Join Existing Game
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Game Categories */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Choose Your Team Building Focus
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Start with our signature team building experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Team Building - Available */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <Link to="/game-intent" className="block bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-xl p-8 border-2 border-purple-500/50 hover:border-purple-400/70 transition-all duration-300 transform hover:scale-105 group">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8" />
                </div>
                <div className="inline-flex px-4 py-2 rounded-full text-sm font-semibold mb-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/30">
                  Available Now
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors duration-300 mb-2">
                  Team Building
                </h3>
                <p className="text-slate-300 text-sm">
                  Build stronger teams through immersive collaborative challenges
                </p>
              </Link>
            </motion.div>

            {/* Skill Development - Coming Soon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center"
            >
              <div className="bg-slate-900/30 backdrop-blur-sm rounded-xl p-8 border border-slate-700/30 opacity-60 cursor-not-allowed">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 flex items-center justify-center text-slate-400">
                  <Brain className="w-8 h-8" />
                </div>
                <div className="inline-flex px-4 py-2 rounded-full text-sm font-semibold mb-4 bg-gradient-to-r from-slate-500/20 to-slate-600/20 text-slate-400 border border-slate-500/30">
                  Coming Soon
                </div>
                <h3 className="text-xl font-bold text-slate-400 mb-2">
                  Skill Development
                </h3>
                <p className="text-slate-500 text-sm">
                  Individual and team skill enhancement programs
                </p>
              </div>
            </motion.div>

            {/* Leadership Training - Coming Soon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <div className="bg-slate-900/30 backdrop-blur-sm rounded-xl p-8 border border-slate-700/30 opacity-60 cursor-not-allowed">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 flex items-center justify-center text-slate-400">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div className="inline-flex px-4 py-2 rounded-full text-sm font-semibold mb-4 bg-gradient-to-r from-slate-500/20 to-slate-600/20 text-slate-400 border border-slate-500/30">
                  Coming Soon
                </div>
                <h3 className="text-xl font-bold text-slate-400 mb-2">
                  Leadership Training
                </h3>
                <p className="text-slate-500 text-sm">
                  Develop leadership capabilities through interactive scenarios
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Teams Love Blyza
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Built for modern teams who want measurable results from their team building activities
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700/40 hover:border-slate-600/60 transition-all duration-300 group cursor-pointer transform hover:scale-105">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-indigo-600/20 backdrop-blur-sm"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Team?
          </h2>
          <p className="text-xl text-slate-300 mb-10">
            Join thousands of teams already using Blyza to build stronger, more effective collaboration.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/game-intent" className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-800 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-lg">
              Start Your First Game
            </Link>
            <Link to="/join" className="bg-slate-800/50 backdrop-blur-sm hover:bg-slate-700/60 text-slate-200 hover:text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 border border-slate-600/50 text-lg">
              Join Existing Game
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-slate-700/50">
        <div className="bg-slate-900/20 backdrop-blur-md border border-slate-700/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Blyza</span>
              </div>
              
              <div className="flex space-x-6 text-sm text-slate-400">
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
                <a href="#" className="hover:text-white transition-colors">Support</a>
              </div>
            </div>
            
            <div className="border-t border-slate-700/50 mt-8 pt-8 text-center text-slate-400 text-sm">
              © 2024 Blyza. Built for better teams.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
