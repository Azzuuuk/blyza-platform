import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Sparkles, Loader2, User, Building } from 'lucide-react'
import { useAuthStore } from '../stores/useAuthStore'

const SignupPage = () => {
  const navigate = useNavigate()
  const { signup, loading, error, isAuthenticated, clearError } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  
  // Get role from URL params if present
  const urlParams = new URLSearchParams(window.location.search)
  const roleFromUrl = urlParams.get('role') || 'employee'
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: roleFromUrl, // Use role from URL or default to employee
    orgName: ''
  })

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    clearError()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password || !formData.name) return
    
    try {
      console.log('🔥 Starting signup from form:', formData)
      const result = await signup(formData)
      console.log('🔥 Signup result:', result)
      
      if (result && result.success) {
        console.log('✅ Signup successful, navigating home')
        navigate('/')
      } else {
        console.log('❌ Signup failed:', result?.error)
      }
    } catch (err) {
      console.error('❌ Signup exception:', err)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      color: '#e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      {/* Background Animation */}
      <div style={{position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none'}}>
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '300px',
          height: '300px',
          background: 'rgba(124, 58, 237, 0.1)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'pulse 4s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: '200px',
          height: '200px',
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'pulse 4s ease-in-out infinite 2s'
        }}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%',
          maxWidth: '400px',
          position: 'relative'
        }}
      >
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'transparent',
            border: 'none',
            color: '#cbd5e1',
            cursor: 'pointer',
            marginBottom: '32px',
            padding: '8px',
            fontSize: '14px'
          }}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} />
          Back to Home
        </button>

        {/* Signup Card */}
        <div style={{
          background: 'rgba(51, 65, 85, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(51, 65, 85, 0.2)',
          borderRadius: '24px',
          padding: '48px 32px',
          textAlign: 'center'
        }}>
          {/* Logo */}
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <Sparkles style={{ width: 40, height: 40, color: 'white' }} />
          </div>

          <h1 style={{
            fontSize: '32px',
            fontWeight: '800',
            marginBottom: '8px',
            background: 'linear-gradient(135deg, #ffffff, #cbd5e1)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}>
            Create Account
          </h1>
          
          <p style={{
            color: '#94a3b8',
            marginBottom: '24px',
            fontSize: '16px'
          }}>
            Join Blyza and start building amazing teams
          </p>

          {/* Demo Notice */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '24px',
            fontSize: '14px',
            color: '#93c5fd'
          }}>
            <strong>Demo Mode:</strong> Create any account to try the platform!<br />
            Your data will be stored locally for this session.
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
            {/* Name Field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#e2e8f0',
                marginBottom: '8px'
              }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '20px',
                  height: '20px',
                  color: '#6b7280'
                }} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 48px',
                    background: 'rgba(51, 65, 85, 0.3)',
                    border: '1px solid rgba(71, 85, 105, 0.5)',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(71, 85, 105, 0.5)'}
                />
              </div>
            </div>

            {/* Email Field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#e2e8f0',
                marginBottom: '8px'
              }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '20px',
                  height: '20px',
                  color: '#6b7280'
                }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 48px',
                    background: 'rgba(51, 65, 85, 0.3)',
                    border: '1px solid rgba(71, 85, 105, 0.5)',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(71, 85, 105, 0.5)'}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#e2e8f0',
                marginBottom: '8px'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '20px',
                  height: '20px',
                  color: '#6b7280'
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  style={{
                    width: '100%',
                    padding: '12px 48px 12px 48px',
                    background: 'rgba(51, 65, 85, 0.3)',
                    border: '1px solid rgba(71, 85, 105, 0.5)',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(71, 85, 105, 0.5)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#6b7280',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  {showPassword ? <EyeOff style={{ width: 20, height: 20 }} /> : <Eye style={{ width: 20, height: 20 }} />}
                </button>
              </div>
            </div>

            {/* Role Selection Field */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#e2e8f0',
                marginBottom: '8px'
              }}>
                I am a...
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <label style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: formData.role === 'manager' ? 'rgba(124, 58, 237, 0.2)' : 'rgba(51, 65, 85, 0.3)',
                  border: formData.role === 'manager' ? '2px solid #7c3aed' : '2px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}>
                  <input
                    type="radio"
                    name="role"
                    value="manager"
                    checked={formData.role === 'manager'}
                    onChange={handleChange}
                    style={{ marginRight: '8px' }}
                  />
                  <div>
                    <div style={{ fontWeight: '600', color: '#e2e8f0' }}>Manager</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Create & observe sessions</div>
                  </div>
                </label>
                <label style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: formData.role === 'employee' ? 'rgba(124, 58, 237, 0.2)' : 'rgba(51, 65, 85, 0.3)',
                  border: formData.role === 'employee' ? '2px solid #7c3aed' : '2px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}>
                  <input
                    type="radio"
                    name="role"
                    value="employee"
                    checked={formData.role === 'employee'}
                    onChange={handleChange}
                    style={{ marginRight: '8px' }}
                  />
                  <div>
                    <div style={{ fontWeight: '600', color: '#e2e8f0' }}>Employee</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Join & play games</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Organization Field */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#e2e8f0',
                marginBottom: '8px'
              }}>
                Organization (Optional)
              </label>
              <div style={{ position: 'relative' }}>
                <Building style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '20px',
                  height: '20px',
                  color: '#6b7280'
                }} />
                <input
                  type="text"
                  name="orgName"
                  value={formData.orgName}
                  onChange={handleChange}
                  placeholder="Your company or organization"
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 48px',
                    background: 'rgba(51, 65, 85, 0.3)',
                    border: '1px solid rgba(71, 85, 105, 0.5)',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(71, 85, 105, 0.5)'}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px',
                color: '#fca5a5',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            {/* Signup Button */}
            <button
              type="submit"
              disabled={loading || !formData.email || !formData.password || !formData.name}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? '#6b7280' : 'linear-gradient(135deg, #7c3aed, #2563eb)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              {loading ? (
                <>
                  <Loader2 style={{ width: 20, height: 20, animation: 'spin 1s linear infinite' }} />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#94a3b8'
          }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: '#7c3aed',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              Sign in here
            </Link>
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default SignupPage
