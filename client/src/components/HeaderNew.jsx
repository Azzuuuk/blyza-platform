import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, ArrowLeft } from 'lucide-react'

const Header = ({ showBackButton = false, backTo = '/', title = '' }) => {
  const headerStyle = {
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
    position: 'sticky',
    top: 0,
    zIndex: 50
  }

  const buttonStyle = {
    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
    color: 'white',
    padding: '8px 12px',
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

  return (
    <header style={headerStyle}>
      <div style={{maxWidth: '1280px', margin: '0 auto', padding: '0 24px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            {showBackButton && (
              <Link to={backTo} style={{
                ...buttonStyle,
                background: 'rgba(51, 65, 85, 0.3)',
                color: '#cbd5e1'
              }}>
                <ArrowLeft style={{width: '20px', height: '20px'}} />
                Back
              </Link>
            )}
            
            <Link to="/" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none'
            }}>
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
            </Link>
          </div>
          
          {title && (
            <div style={{
              fontSize: '14px',
              color: '#94a3b8',
              fontWeight: '500'
            }}>
              {title}
            </div>
          )}
          
          <div style={{display: 'flex', gap: '16px'}}>
            <Link to="/login" style={{
              color: '#cbd5e1',
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              transition: 'color 0.3s ease'
            }}>
              Login
            </Link>
            <Link to="/signup" style={{
              ...buttonStyle,
              fontSize: '14px'
            }}>
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
