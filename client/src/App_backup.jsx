import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Simple test components
const TestHome = () => (
  <div style={{
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
    color: '#e2e8f0',
    padding: '40px',
    textAlign: 'center'
  }}>
    <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>🎮 Blyza Platform</h1>
    <p style={{ fontSize: '1.2rem', marginBottom: '40px' }}>Welcome to the team-building game platform!</p>
    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
      <a href="/test" style={{ 
        background: 'linear-gradient(135deg, #7c3aed, #ec4899)', 
        color: 'white', 
        padding: '12px 24px', 
        borderRadius: '12px', 
        textDecoration: 'none',
        fontWeight: '600'
      }}>
        Test Route
      </a>
      <a href="/games/code-breakers" style={{ 
        background: 'linear-gradient(135deg, #10b981, #059669)', 
        color: 'white', 
        padding: '12px 24px', 
        borderRadius: '12px', 
        textDecoration: 'none',
        fontWeight: '600'
      }}>
        Code Breakers Game
      </a>
    </div>
  </div>
)

const TestRoute = () => (
  <div style={{
    minHeight: '100vh',
    background: '#1a1a2e',
    color: 'white',
    padding: '40px',
    textAlign: 'center'
  }}>
    <h1>✅ Test Route Working!</h1>
    <p>If you can see this, the basic routing is working.</p>
    <a href="/" style={{ color: '#7c3aed' }}>← Back to Home</a>
  </div>
)

// Import the CodeBreakers game
import CodeBreakersGame from './games/CodeBreakers/CodeBreakersGame'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TestHome />} />
        <Route path="/test" element={<TestRoute />} />
        <Route path="/games/code-breakers" element={<CodeBreakersGame />} />
      </Routes>
    </Router>
  )
}

export default App
