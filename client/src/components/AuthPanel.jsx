import React, { useState } from 'react'
import { useAuthStore } from '../stores/useAuthStore.js'

export default function AuthPanel(){
  const { user, isAuthenticated, login, signup, logout, loading, error } = useAuthStore()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('manager@blyza.com')
  const [password, setPassword] = useState('password123')
  const [name, setName] = useState('Manager User')
  const [orgName, setOrgName] = useState('Demo Org')

  const handle = async (e) => {
    e.preventDefault()
    try {
      if(mode==='login') await login({ email, password })
      else await signup({ email, password, name, orgName })
    } catch(_e){}
  }

  if(isAuthenticated){
    return (
      <div className="p-4 bg-slate-800/60 rounded-md text-sm text-slate-200 flex flex-col gap-2">
        <div>Signed in as <strong>{user?.email}</strong></div>
        <button onClick={logout} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded">Logout</button>
      </div>
    )
  }

  return (
    <div style={{
      background: 'rgba(51, 65, 85, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(51, 65, 85, 0.2)',
      borderRadius: '16px',
      padding: '32px',
      width: '100%',
      maxWidth: '400px'
    }}>
      {/* Demo Notice */}
      <div style={{
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '20px',
        fontSize: '13px',
        color: '#93c5fd',
        textAlign: 'center'
      }}>
        <strong>Demo Credentials:</strong><br />
        Manager: manager@blyza.com / password123<br />
        Player: player@blyza.com / password123
      </div>

      {/* Mode Toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button 
          type="button" 
          onClick={() => setMode('login')} 
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: mode === 'login' ? 'linear-gradient(135deg, #7c3aed, #2563eb)' : 'rgba(71, 85, 105, 0.3)',
            color: 'white'
          }}
        >
          Login
        </button>
        <button 
          type="button" 
          onClick={() => setMode('signup')} 
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: mode === 'signup' ? 'linear-gradient(135deg, #7c3aed, #2563eb)' : 'rgba(71, 85, 105, 0.3)',
            color: 'white'
          }}
        >
          Signup
        </button>
      </div>

      {/* Form Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <input 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          placeholder="Email address" 
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(71, 85, 105, 0.5)',
            background: 'rgba(51, 65, 85, 0.3)',
            color: '#e2e8f0',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        
        {mode === 'signup' && (
          <input 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="Full name" 
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(71, 85, 105, 0.5)',
              background: 'rgba(51, 65, 85, 0.3)',
              color: '#e2e8f0',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        )}
        
        <input 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          placeholder="Password" 
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(71, 85, 105, 0.5)',
            background: 'rgba(51, 65, 85, 0.3)',
            color: '#e2e8f0',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        
        {mode === 'signup' && (
          <input 
            value={orgName} 
            onChange={e => setOrgName(e.target.value)} 
            placeholder="Organization (optional)" 
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(71, 85, 105, 0.5)',
              background: 'rgba(51, 65, 85, 0.3)',
              color: '#e2e8f0',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        )}
        
        <button 
          disabled={loading} 
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            marginTop: '8px',
            background: loading ? '#6b7280' : 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: 'white',
            opacity: loading ? 0.5 : 1
          }}
        >
          {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
        </button>
        
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            color: '#fca5a5',
            fontSize: '13px'
          }}>
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
