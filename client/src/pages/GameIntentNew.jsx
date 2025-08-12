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

  const intents = [
    {
      id: 'team-building',
      title: 'Team Building',
      description: 'Strengthen bonds, improve collaboration, and build trust',
      icon: <Users className="w-8 h-8" style={{color: '#60a5fa'}} />,
      popular: true
    },
    {
      id: 'skill-development',
      title: 'Skill Development', 
      description: 'Enhance specific skills through interactive challenges',
      icon: <Target className="w-8 h-8" style={{color: '#34d399'}} />
    },
    {
      id: 'team-assessment',
      title: 'Team Assessment',
      description: 'Evaluate team dynamics and identify areas for improvement',
      icon: <CheckCircle2 className="w-8 h-8" style={{color: '#a855f7'}} />
    },
    {
      id: 'onboarding',
      title: 'New Hire Onboarding',
      description: 'Welcome and integrate new team members effectively',
      icon: <Heart className="w-8 h-8" style={{color: '#fb7185'}} />
    }
  ]

  const teamAspects = [
    { 
      id: 'communication', 
      label: 'Communication & Listening', 
      icon: <Users className="w-6 h-6" style={{color: '#60a5fa'}} />,
      description: 'Improve how team members interact and understand each other'
    },
    { 
      id: 'trust', 
      label: 'Trust & Vulnerability', 
      icon: <Heart className="w-6 h-6" style={{color: '#fb7185'}} />,
      description: 'Build deeper connections and psychological safety'
    },
    { 
      id: 'problem-solving', 
      label: 'Problem Solving & Innovation', 
      icon: <Target className="w-6 h-6" style={{color: '#a855f7'}} />,
      description: 'Enhance creative thinking and solution-finding skills'
    },
    { 
      id: 'leadership', 
      label: 'Leadership Development', 
      icon: <Briefcase className="w-6 h-6" style={{color: '#f59e0b'}} />,
      description: 'Develop leadership skills and decision-making abilities'
    },
    { 
      id: 'creativity', 
      label: 'Creativity & Brainstorming', 
      icon: <Sparkles className="w-6 h-6" style={{color: '#fbbf24'}} />,
      description: 'Unlock creative potential and innovative thinking'
    },
    { 
      id: 'general', 
      label: 'General Team Bonding', 
      icon: <Building className="w-6 h-6" style={{color: '#34d399'}} />,
      description: 'Overall team cohesion and workplace culture'
    },
    { 
      id: 'not-sure', 
      label: 'Let AI Analyze My Team', 
      icon: <Star className="w-6 h-6" style={{color: '#c084fc'}} />,
      description: 'Get personalized recommendations based on team assessment',
      special: true
    }
  ]

  const locationOptions = [
    {
      id: 'online',
      title: 'Online / Remote Play',
      description: 'Perfect for distributed teams working from different locations',
      icon: <Wifi className="w-12 h-12" style={{color: '#60a5fa'}} />,
      features: ['Video conferencing integrated', 'Real-time collaboration', 'No travel required']
    },
    {
      id: 'offline',
      title: 'In-Person / Office Play',
      description: 'Ideal for teams that can meet in the same physical location',
      icon: <MapPin className="w-12 h-12" style={{color: '#34d399'}} />,
      features: ['Face-to-face interaction', 'Physical activities', 'Enhanced bonding']
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

  const handleOptionSelect = (stepKey, value) => {
    setFormData(prev => ({ ...prev, [stepKey]: value }))
  }

  const handleContinue = () => {
    if (currentStep === 'recommendations') {
      navigate('/games')
    } else {
      handleNext()
    }
  }

  const getStepNumber = () => {
    const steps = { intent: 1, location: 2, teambuilding: 3, questions: 4, recommendations: 5 }
    return steps[currentStep] || 1
  }

  const renderProgressBar = () => (
    <div style={{
      width: '100%',
      height: '4px',
      background: 'rgba(51, 65, 85, 0.3)',
      borderRadius: '2px',
      overflow: 'hidden',
      marginBottom: '32px'
    }}>
      <div style={{
        width: `${(getStepNumber() / 5) * 100}%`,
        height: '100%',
        background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
        borderRadius: '2px',
        transition: 'width 0.5s ease'
      }} />
    </div>
  )

  const renderIntentStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{maxWidth: '800px', margin: '0 auto'}}
    >
      <div style={{textAlign: 'center', marginBottom: '48px'}}>
        <h2 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          marginBottom: '16px',
          color: 'white'
        }}>
          What brings your team here today?
        </h2>
        <p style={{fontSize: '18px', color: '#94a3b8'}}>
          Choose your primary goal to get personalized game recommendations
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {intents.map((intent, index) => (
          <motion.div
            key={intent.id}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            style={{
              ...cardStyle,
              border: formData.intent === intent.id ? '2px solid #7c3aed' : '1px solid rgba(51, 65, 85, 0.2)',
              background: formData.intent === intent.id 
                ? 'rgba(124, 58, 237, 0.1)' 
                : 'rgba(51, 65, 85, 0.1)',
              position: 'relative'
            }}
            onClick={() => handleOptionSelect('intent', intent.id)}
          >
            {intent.popular && (
              <div style={{
                position: 'absolute',
                top: '-8px',
                right: '16px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                Most Popular
              </div>
            )}
            
            <div style={{marginBottom: '16px'}}>
              {intent.icon}
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '8px',
              color: 'white'
            }}>
              {intent.title}
            </h3>
            <p style={{color: '#94a3b8', lineHeight: '1.5'}}>
              {intent.description}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )

  const renderLocationStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{maxWidth: '800px', margin: '0 auto'}}
    >
      <div style={{textAlign: 'center', marginBottom: '48px'}}>
        <h2 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          marginBottom: '16px',
          color: 'white'
        }}>
          Where will your team be playing?
        </h2>
        <p style={{fontSize: '18px', color: '#94a3b8'}}>
          Choose the format that works best for your team's situation
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '32px',
        marginBottom: '40px'
      }}>
        {locationOptions.map((option) => (
          <motion.div
            key={option.id}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            style={{
              ...cardStyle,
              border: formData.gameLocation === option.id ? '2px solid #7c3aed' : '1px solid rgba(51, 65, 85, 0.2)',
              background: formData.gameLocation === option.id 
                ? 'rgba(124, 58, 237, 0.1)' 
                : 'rgba(51, 65, 85, 0.1)',
              textAlign: 'center'
            }}
            onClick={() => handleOptionSelect('gameLocation', option.id)}
          >
            <div style={{marginBottom: '20px'}}>
              {option.icon}
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '600',
              marginBottom: '12px',
              color: 'white'
            }}>
              {option.title}
            </h3>
            <p style={{color: '#94a3b8', marginBottom: '20px', lineHeight: '1.5'}}>
              {option.description}
            </p>
            <div style={{marginTop: '16px'}}>
              {option.features.map((feature, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <CheckCircle2 style={{width: '16px', height: '16px', color: '#34d399'}} />
                  <span style={{fontSize: '14px', color: '#cbd5e1'}}>{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )

  const renderTeamBuildingStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{maxWidth: '900px', margin: '0 auto'}}
    >
      <div style={{textAlign: 'center', marginBottom: '48px'}}>
        <h2 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          marginBottom: '16px',
          color: 'white'
        }}>
          What aspect of teamwork needs attention?
        </h2>
        <p style={{fontSize: '18px', color: '#94a3b8'}}>
          Select the area where your team could benefit from improvement
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {teamAspects.map((aspect) => (
          <motion.div
            key={aspect.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              ...cardStyle,
              border: formData.teamAspect === aspect.id ? '2px solid #7c3aed' : '1px solid rgba(51, 65, 85, 0.2)',
              background: formData.teamAspect === aspect.id 
                ? 'rgba(124, 58, 237, 0.1)' 
                : 'rgba(51, 65, 85, 0.1)',
              padding: '20px',
              position: 'relative'
            }}
            onClick={() => handleOptionSelect('teamAspect', aspect.id)}
          >
            {aspect.special && (
              <div style={{
                position: 'absolute',
                top: '-8px',
                right: '12px',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                color: 'white',
                padding: '4px 10px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                AI Powered
              </div>
            )}
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px'
            }}>
              {aspect.icon}
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'white',
                margin: 0
              }}>
                {aspect.label}
              </h3>
            </div>
            <p style={{
              color: '#94a3b8',
              fontSize: '14px',
              lineHeight: '1.4',
              margin: 0
            }}>
              {aspect.description}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )

  const renderQuestionsStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{maxWidth: '600px', margin: '0 auto'}}
    >
      <div style={{textAlign: 'center', marginBottom: '48px'}}>
        <h2 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          marginBottom: '16px',
          color: 'white'
        }}>
          Tell us about your team
        </h2>
        <p style={{fontSize: '18px', color: '#94a3b8'}}>
          A few quick questions to personalize your experience
        </p>
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
        {/* Team Size */}
        <div style={cardStyle}>
          <label style={{
            display: 'block',
            fontSize: '18px',
            fontWeight: '600',
            color: 'white',
            marginBottom: '12px'
          }}>
            How many people are on your team?
          </label>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px'}}>
            {['2-5', '6-10', '11-20', '21+'].map((size) => (
              <button
                key={size}
                style={{
                  ...buttonStyle,
                  background: formData.teamSize === size 
                    ? 'linear-gradient(135deg, #7c3aed, #2563eb)' 
                    : 'rgba(51, 65, 85, 0.3)',
                  justifyContent: 'center'
                }}
                onClick={() => handleOptionSelect('teamSize', size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Time Available */}
        <div style={cardStyle}>
          <label style={{
            display: 'block',
            fontSize: '18px',
            fontWeight: '600',
            color: 'white',
            marginBottom: '12px'
          }}>
            How much time do you have available?
          </label>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px'}}>
            {['15-30 min', '30-60 min', '1-2 hours', '2+ hours'].map((time) => (
              <button
                key={time}
                style={{
                  ...buttonStyle,
                  background: formData.timeAvailable === time 
                    ? 'linear-gradient(135deg, #7c3aed, #2563eb)' 
                    : 'rgba(51, 65, 85, 0.3)',
                  justifyContent: 'center'
                }}
                onClick={() => handleOptionSelect('timeAvailable', time)}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Previous Experience */}
        <div style={cardStyle}>
          <label style={{
            display: 'block',
            fontSize: '18px',
            fontWeight: '600',
            color: 'white',
            marginBottom: '12px'
          }}>
            Previous team building experience?
          </label>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px'}}>
            {['First time', 'Some experience', 'Very experienced'].map((exp) => (
              <button
                key={exp}
                style={{
                  ...buttonStyle,
                  background: formData.previousExperience === exp 
                    ? 'linear-gradient(135deg, #7c3aed, #2563eb)' 
                    : 'rgba(51, 65, 85, 0.3)',
                  justifyContent: 'center'
                }}
                onClick={() => handleOptionSelect('previousExperience', exp)}
              >
                {exp}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )

  const renderRecommendationsStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{maxWidth: '800px', margin: '0 auto', textAlign: 'center'}}
    >
      <div style={{marginBottom: '48px'}}>
        <Sparkles style={{width: '64px', height: '64px', color: '#7c3aed', margin: '0 auto 24px'}} />
        <h2 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          marginBottom: '16px',
          color: 'white'
        }}>
          Perfect! We've found your matches
        </h2>
        <p style={{fontSize: '18px', color: '#94a3b8'}}>
          Based on your preferences, we've curated the ideal games for your team
        </p>
      </div>

      <div style={cardStyle}>
        <div style={{marginBottom: '24px'}}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: 'white',
            marginBottom: '12px'
          }}>
            Your Team Profile
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            textAlign: 'left'
          }}>
            <div>
              <span style={{color: '#94a3b8', fontSize: '14px'}}>Goal:</span>
              <p style={{color: 'white', fontWeight: '600', margin: '4px 0'}}>{formData.intent?.replace('-', ' ')}</p>
            </div>
            <div>
              <span style={{color: '#94a3b8', fontSize: '14px'}}>Format:</span>
              <p style={{color: 'white', fontWeight: '600', margin: '4px 0'}}>{formData.gameLocation}</p>
            </div>
            <div>
              <span style={{color: '#94a3b8', fontSize: '14px'}}>Focus Area:</span>
              <p style={{color: 'white', fontWeight: '600', margin: '4px 0'}}>{formData.teamAspect?.replace('-', ' ')}</p>
            </div>
            <div>
              <span style={{color: '#94a3b8', fontSize: '14px'}}>Team Size:</span>
              <p style={{color: 'white', fontWeight: '600', margin: '4px 0'}}>{formData.teamSize} people</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )

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
            
            <div style={{fontSize: '14px', color: '#94a3b8'}}>
              Step {getStepNumber()} of 5
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{padding: '40px 24px'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
          {renderProgressBar()}
          
          <AnimatePresence mode="wait">
            {currentStep === 'intent' && renderIntentStep()}
            {currentStep === 'location' && renderLocationStep()}
            {currentStep === 'teambuilding' && renderTeamBuildingStep()}
            {currentStep === 'questions' && renderQuestionsStep()}
            {currentStep === 'recommendations' && renderRecommendationsStep()}
          </AnimatePresence>

          {/* Navigation */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '48px',
            maxWidth: '800px',
            margin: '48px auto 0'
          }}>
            <button
              onClick={handleBack}
              style={{
                ...buttonStyle,
                background: 'transparent',
                border: '2px solid rgba(51, 65, 85, 0.5)',
                color: '#94a3b8'
              }}
            >
              <ArrowLeft style={{width: '20px', height: '20px'}} />
              Back
            </button>

            <button
              onClick={handleContinue}
              disabled={
                (currentStep === 'intent' && !formData.intent) ||
                (currentStep === 'location' && !formData.gameLocation) ||
                (currentStep === 'teambuilding' && !formData.teamAspect) ||
                (currentStep === 'questions' && (!formData.teamSize || !formData.timeAvailable || !formData.previousExperience))
              }
              style={{
                ...buttonStyle,
                opacity: (
                  (currentStep === 'intent' && !formData.intent) ||
                  (currentStep === 'location' && !formData.gameLocation) ||
                  (currentStep === 'teambuilding' && !formData.teamAspect) ||
                  (currentStep === 'questions' && (!formData.teamSize || !formData.timeAvailable || !formData.previousExperience))
                ) ? 0.5 : 1
              }}
            >
              {currentStep === 'recommendations' ? 'View Games' : 'Continue'}
              <ArrowRight style={{width: '20px', height: '20px'}} />
            </button>
          </div>
        </div>
      </main>

      {/* Global Styles */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  )
}

export default GameIntent
