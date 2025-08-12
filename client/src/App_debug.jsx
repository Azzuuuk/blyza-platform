import React from 'react'

function App() {
  console.log('App component rendering...')
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      color: '#e2e8f0',
      padding: '40px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>🎮 Blyza Platform</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '40px' }}>Debug Mode - Testing Components</p>
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: '20px', 
        borderRadius: '12px',
        maxWidth: '600px'
      }}>
        <p>✅ React is rendering</p>
        <p>✅ CSS styles are working</p>
        <p>✅ Console log check</p>
        <p>✅ Time: {new Date().toLocaleTimeString()}</p>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => console.log('Button clicked!')}
          style={{
            background: '#7c3aed',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Test Button (Check Console)
        </button>
      </div>
    </div>
  )
}

export default App
