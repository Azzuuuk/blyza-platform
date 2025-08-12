import React from 'react'
import Header from './HeaderNew'

const Layout = ({ 
  children, 
  showBackButton = false, 
  backTo = '/', 
  title = '',
  showBackground = true 
}) => {
  const containerStyle = {
    minHeight: '100vh',
    background: showBackground 
      ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
      : 'transparent',
    color: '#e2e8f0'
  }

  return (
    <div style={containerStyle}>
      {/* Animated Background Elements */}
      {showBackground && (
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
      )}

      <Header 
        showBackButton={showBackButton}
        backTo={backTo}
        title={title}
      />

      <main style={{position: 'relative', zIndex: 1}}>
        {children}
      </main>

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
          
          * {
            box-sizing: border-box;
          }
        `}
      </style>
    </div>
  )
}

export default Layout
