import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  ArrowRight, 
  Users, 
  Building, 
  Target, 
  Sparkles,
  Heart,
  Briefcase,
  Wifi,
  WifiOff,
  Monitor,
  MapPin,
  CheckCircle2,
  Star,
  Zap
} from 'lucide-react'

const GameIntent = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState('intent') // intent, location, teambuilding, questions, recommendations
  const [formData, setFormData] = useState({
    intent: '',
    gameLocation: '', // 'online' or 'offline'
    teamAspect: '',
    teamSize: '',
    industry: '',
    seniority: '',
    timeAvailable: '',
    previousExperience: ''
  })

  const intents = [
    {
      id: 'team-building',
      title: 'Team Building',
      description: 'Strengthen bonds, improve collaboration, and build trust',
      icon: <Users className="w-8 h-8" />,
      gradient: 'from-blue-500 to-purple-600',
      popular: true
    },
    {
      id: 'skill-development',
      title: 'Skill Development',
      description: 'Enhance specific skills through interactive challenges',
      icon: <Target className="w-8 h-8" />,
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'onboarding',
      title: 'Onboarding',
      description: 'Welcome new team members with engaging activities',
      icon: <Sparkles className="w-8 h-8" />,
      gradient: 'from-orange-500 to-red-600'
    },
    {
      id: 'meeting-energizer',
      title: 'Meeting Energizer',
      description: 'Break the ice and energize your meetings',
      icon: <Zap className="w-8 h-8" />,
      gradient: 'from-yellow-500 to-orange-600'
    }
  ]

  const gameLocations = [
    {
      id: 'online',
      title: 'Online/Remote',
      description: 'Perfect for distributed teams working from different locations',
      icon: <Wifi className="w-8 h-8" />,
      features: ['Video conferencing integration', 'Real-time collaboration', 'Screen sharing support', 'Digital whiteboards'],
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'offline',
      title: 'In-Person/Local',
      description: 'Great for teams meeting in the same physical location',
      icon: <MapPin className="w-8 h-8" />,
      features: ['Physical team activities', 'Face-to-face interaction', 'Room-based challenges', 'Hands-on experiences'],
      gradient: 'from-emerald-500 to-green-600'
    }
  ]

  const teamAspects = [
    { 
      id: 'communication', 
      label: 'Communication & Collaboration', 
      icon: <Users className="w-6 h-6" />,
      description: 'Improve how your team shares ideas and works together',
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      id: 'trust', 
      label: 'Trust Building & Bonding', 
      icon: <Heart className="w-6 h-6" />,
      description: 'Strengthen relationships and build deeper connections',
      gradient: 'from-pink-500 to-rose-500'
    },
    { 
      id: 'problem-solving', 
      label: 'Problem Solving & Innovation', 
      icon: <Target className="w-6 h-6" />,
      description: 'Enhance creative thinking and solution-finding skills',
      gradient: 'from-purple-500 to-indigo-500'
    },
    { 
      id: 'leadership', 
      label: 'Leadership Development', 
      icon: <Briefcase className="w-6 h-6" />,
      description: 'Develop leadership skills and decision-making abilities',
      gradient: 'from-orange-500 to-red-500'
    },
    { 
      id: 'creativity', 
      label: 'Creativity & Brainstorming', 
      icon: <Sparkles className="w-6 h-6" />,
      description: 'Unlock creative potential and innovative thinking',
      gradient: 'from-yellow-500 to-orange-500'
    },
    { 
      id: 'general', 
      label: 'General Team Bonding', 
      icon: <Building className="w-6 h-6" />,
      description: 'Overall team cohesion and workplace culture',
      gradient: 'from-emerald-500 to-teal-500'
    },
    { 
      id: 'not-sure', 
      label: 'Let AI Analyze My Team', 
      icon: <Star className="w-6 h-6" />,
      description: 'Get personalized recommendations based on team assessment',
      gradient: 'from-violet-500 to-purple-500',
      special: true
    }
  ]

  const handleNext = () => {
    if (currentStep === 'intent' && formData.intent) {
      setCurrentStep('location')
    } else if (currentStep === 'location' && formData.gameLocation) {
      setCurrentStep('teambuilding')
    } else if (currentStep === 'teambuilding' && formData.teamAspect) {
      setCurrentStep('questions')
    } else if (currentStep === 'questions') {
      setCurrentStep('recommendations')
    }
  }

  const handleBack = () => {
    if (currentStep === 'location') {
      setCurrentStep('intent')
    } else if (currentStep === 'teambuilding') {
      setCurrentStep('location')
    } else if (currentStep === 'questions') {
      setCurrentStep('teambuilding')
    } else if (currentStep === 'recommendations') {
      setCurrentStep('questions')
    } else {
      navigate('/')
    }
  }

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { y: -5, scale: 1.02 }
  }

  const renderIntentStep = () => (
    <motion.div
      key="intent"
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8"
    >
      <div className="text-center space-y-4">
        <motion.h1 
          className="text-5xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          What brings you to{' '}
          <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Blyza
          </span>
          ?
        </motion.h1>
        <motion.p 
          className="text-xl text-slate-300 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Choose your primary goal to get personalized game recommendations powered by AI
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {intents.map((intent, index) => (
          <motion.div
            key={intent.id}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ delay: index * 0.1 }}
            className={`relative overflow-hidden cursor-pointer group ${
              formData.intent === intent.id 
                ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-900' 
                : ''
            }`}
            onClick={() => setFormData({...formData, intent: intent.id})}
          >
            {intent.popular && (
              <div className="absolute top-4 right-4 z-10">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                  POPULAR
                </span>
              </div>
            )}
            
            <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 h-full transition-all duration-300 group-hover:border-slate-600/80">
              <div className={`absolute inset-0 bg-gradient-to-br ${intent.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}></div>
              
              <div className="relative z-10 space-y-4">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${intent.gradient} bg-opacity-10`}>
                  <div className="text-white">
                    {intent.icon}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors">
                  {intent.title}
                </h3>
                
                <p className="text-slate-300 group-hover:text-slate-200 transition-colors">
                  {intent.description}
                </p>
                
                {formData.intent === intent.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-2 text-purple-400"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Selected</span>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )

  const renderLocationStep = () => (
    <motion.div
      key="location"
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8"
    >
      <div className="text-center space-y-4">
        <motion.h1 
          className="text-5xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Where is your team{' '}
          <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            located
          </span>
          ?
        </motion.h1>
        <motion.p 
          className="text-xl text-slate-300 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          This helps us recommend games optimized for your team's setup
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {gameLocations.map((location, index) => (
          <motion.div
            key={location.id}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ delay: index * 0.2 }}
            className={`relative overflow-hidden cursor-pointer group ${
              formData.gameLocation === location.id 
                ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-900' 
                : ''
            }`}
            onClick={() => setFormData({...formData, gameLocation: location.id})}
          >
            <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 h-full transition-all duration-300 group-hover:border-slate-600/80">
              <div className={`absolute inset-0 bg-gradient-to-br ${location.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}></div>
              
              <div className="relative z-10 space-y-6">
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${location.gradient} bg-opacity-10`}>
                  <div className="text-white">
                    {location.icon}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors">
                    {location.title}
                  </h3>
                  
                  <p className="text-slate-300 group-hover:text-slate-200 transition-colors">
                    {location.description}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Features</h4>
                  <ul className="space-y-1">
                    {location.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {formData.gameLocation === location.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-2 text-purple-400 pt-4 border-t border-slate-700/50"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Selected</span>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )

  const renderTeamBuildingStep = () => (
    <motion.div
      key="teambuilding"
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8"
    >
      <div className="text-center space-y-4">
        <motion.h1 
          className="text-5xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          What aspect of{' '}
          <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            teamwork
          </span>
          {' '}would you like to focus on?
        </motion.h1>
        <motion.p 
          className="text-xl text-slate-300 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Select the area your team needs the most improvement in
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {teamAspects.map((aspect, index) => (
          <motion.div
            key={aspect.id}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ delay: index * 0.1 }}
            className={`relative overflow-hidden cursor-pointer group ${
              formData.teamAspect === aspect.id 
                ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-900' 
                : ''
            } ${aspect.special ? 'md:col-span-2 lg:col-span-1' : ''}`}
            onClick={() => setFormData({...formData, teamAspect: aspect.id})}
          >
            {aspect.special && (
              <div className="absolute top-4 right-4 z-10">
                <span className="bg-gradient-to-r from-purple-400 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  AI POWERED
                </span>
              </div>
            )}
            
            <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 h-full transition-all duration-300 group-hover:border-slate-600/80">
              <div className={`absolute inset-0 bg-gradient-to-br ${aspect.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}></div>
              
              <div className="relative z-10 space-y-4">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${aspect.gradient} bg-opacity-10`}>
                  <div className="text-white">
                    {aspect.icon}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                  {aspect.label}
                </h3>
                
                <p className="text-slate-300 group-hover:text-slate-200 transition-colors text-sm">
                  {aspect.description}
                </p>
                
                {formData.teamAspect === aspect.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-2 text-purple-400"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Selected</span>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )

  // Continue with existing questions and recommendations steps...
  const renderQuestionsStep = () => (
    <motion.div
      key="questions"
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8 max-w-4xl mx-auto"
    >
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">Tell us about your team</h1>
        <p className="text-lg text-slate-300">This helps us recommend the perfect games</p>
      </div>
      
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 space-y-8">
        {/* Team Size */}
        <div className="space-y-3">
          <label className="text-lg font-semibold text-white">Team Size</label>
          <select 
            className="w-full px-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-slate-200 transition-all duration-200"
            value={formData.teamSize}
            onChange={(e) => setFormData({...formData, teamSize: e.target.value})}
          >
            <option value="">Select team size</option>
            <option value="2-5">2-5 people</option>
            <option value="6-10">6-10 people</option>
            <option value="11-20">11-20 people</option>
            <option value="21-50">21-50 people</option>
            <option value="50+">50+ people</option>
          </select>
        </div>

        {/* Time Available */}
        <div className="space-y-3">
          <label className="text-lg font-semibold text-white">Time Available</label>
          <select 
            className="w-full px-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-slate-200 transition-all duration-200"
            value={formData.timeAvailable}
            onChange={(e) => setFormData({...formData, timeAvailable: e.target.value})}
          >
            <option value="">Select duration</option>
            <option value="15-30">15-30 minutes</option>
            <option value="30-60">30-60 minutes</option>
            <option value="1-2">1-2 hours</option>
            <option value="2+">2+ hours</option>
          </select>
        </div>

        {/* Industry */}
        <div className="space-y-3">
          <label className="text-lg font-semibold text-white">Industry (Optional)</label>
          <select 
            className="w-full px-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-slate-200 transition-all duration-200"
            value={formData.industry}
            onChange={(e) => setFormData({...formData, industry: e.target.value})}
          >
            <option value="">Select industry</option>
            <option value="Technology">Technology</option>
            <option value="Finance">Finance</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Education">Education</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </motion.div>
  )

  const isStepValid = () => {
    switch (currentStep) {
      case 'intent':
        return formData.intent !== ''
      case 'location':
        return formData.gameLocation !== ''
      case 'teambuilding':
        return formData.teamAspect !== ''
      case 'questions':
        return formData.teamSize !== '' && formData.timeAvailable !== ''
      default:
        return false
    }
  }

  const getStepNumber = () => {
    const steps = ['intent', 'location', 'teambuilding', 'questions']
    return steps.indexOf(currentStep) + 1
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="text-slate-400">
                Step {getStepNumber()} of 4
              </span>
            </div>
            
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Blyza
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {currentStep === 'intent' && renderIntentStep()}
            {currentStep === 'location' && renderLocationStep()}
            {currentStep === 'teambuilding' && renderTeamBuildingStep()}
            {currentStep === 'questions' && renderQuestionsStep()}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <motion.div 
            className="flex justify-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className={`group relative bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-800 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                !isStepValid() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span className="relative z-10 flex items-center space-x-2">
                <span>{currentStep === 'questions' ? 'Get Recommendations' : 'Continue'}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
            </button>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default GameIntent
