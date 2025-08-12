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
    transition: 'all 0.3s ease'
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

  const features = [
    {
      icon: <Gamepad2 className="w-8 h-8" style={{color: '#60a5fa'}} />,
      title: "18+ Game Templates",
      description: "Curated team-building games targeting specific challenges"
    },
    {
      icon: <Brain className="w-8 h-8" style={{color: '#a855f7'}} />,
      title: "AI Customization",
      description: "Personalize games with AI-powered tone and content adaptation"
    },
    {
      icon: <Users className="w-8 h-8" style={{color: '#34d399'}} />,
      title: "Real-time Multiplayer",
      description: "Seamless online collaboration with live updates"
    },
    {
      icon: <TrendingUp className="w-8 h-8" style={{color: '#fb7185'}} />,
      title: "AI Analytics",
      description: "Comprehensive team insights and actionable recommendations"
    }
  ]

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
            
            <div style={{display: 'flex', gap: '16px'}}>
              <Link to="/login" style={{color: '#cbd5e1', textDecoration: 'none', padding: '8px 16px'}}>
                Login
              </Link>
              <Link to="/signup" style={buttonStyle}>
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{textAlign: 'center', padding: '80px 24px'}}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{maxWidth: '1280px', margin: '0 auto'}}
        >
          <h1 style={{
            fontSize: '56px',
            fontWeight: 'bold',
            marginBottom: '24px',
            lineHeight: '1.1',
            background: 'linear-gradient(135deg, #ffffff, #cbd5e1)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}>
            AI-Powered Team Building
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent'
            }}>
              Redefined
            </span>
          </h1>
          
          <p style={{
            fontSize: '20px',
            color: '#94a3b8',
            marginBottom: '40px',
            maxWidth: '600px',
            margin: '0 auto 40px'
          }}>
            Transform your team dynamics with intelligent, adaptive games that build trust, 
            improve communication, and deliver actionable insights.
          </p>
          
          <div style={{display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap'}}>
            <Link to="/game-intent" style={{...buttonStyle, fontSize: '18px', padding: '16px 32px'}}>
              Start Building Your Team
              <ArrowRight style={{width: '20px', height: '20px'}} />
            </Link>
            <a href="#features" style={{
              ...buttonStyle,
              background: 'transparent',
              border: '2px solid #475569',
              color: '#e2e8f0'
            }}>
              Learn More
            </a>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" style={{padding: '80px 24px', background: 'rgba(15, 23, 42, 0.5)'}}>
        <div style={{maxWidth: '1280px', margin: '0 auto'}}>
          <div style={{textAlign: 'center', marginBottom: '64px'}}>
            <h2 style={{
              fontSize: '48px',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: 'white'
            }}>
              Everything You Need
            </h2>
            <p style={{fontSize: '20px', color: '#94a3b8', maxWidth: '600px', margin: '0 auto'}}>
              Comprehensive tools designed for modern teams working across any environment
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px'
          }}>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                style={{
                  ...cardStyle,
                  cursor: 'pointer'
                }}
                whileHover={{ scale: 1.05 }}
              >
                <div style={{marginBottom: '16px'}}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: 'white'
                }}>
                  {feature.title}
                </h3>
                <p style={{color: '#94a3b8', lineHeight: '1.6'}}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{padding: '80px 24px', textAlign: 'center'}}>
        <div style={{maxWidth: '800px', margin: '0 auto'}}>
          <h2 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            marginBottom: '24px',
            color: 'white'
          }}>
            Ready to Transform Your Team?
          </h2>
          <p style={{fontSize: '20px', color: '#94a3b8', marginBottom: '40px'}}>
            Join thousands of teams already using Blyza to build stronger, more connected organizations.
          </p>
          <Link to="/game-intent" style={{...buttonStyle, fontSize: '18px', padding: '16px 32px'}}>
            Get Started Free
            <ArrowRight style={{width: '20px', height: '20px'}} />
          </Link>
        </div>
      </section>

      {/* Global Styles */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            margin: 0;
            padding: 0;
          }
        `}
      </style>
    </div>
  )
}

export default HomePage
