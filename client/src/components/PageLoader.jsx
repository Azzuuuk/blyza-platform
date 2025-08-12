import React from 'react'
import LoadingSpinner from './LoadingSpinner'

const PageLoader = ({ label = 'Loading…' }) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      color: '#e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        background: 'rgba(51, 65, 85, 0.15)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(124, 58, 237, 0.3)',
        borderRadius: '16px',
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <LoadingSpinner size="large" />
        <div style={{ fontWeight: 600 }}>{label}</div>
      </div>
    </div>
  )
}

export default PageLoader
