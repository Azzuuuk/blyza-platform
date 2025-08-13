import React, { useState } from 'react'
import { signUpUser, signInUser } from '../services/firebaseAuth'
import { auth, db, rtdb } from '../lib/firebase'

const FirebaseDebug = () => {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testFirebaseConnection = async () => {
    setLoading(true)
    setResult('Testing Firebase connection...\n')
    
    try {
      // Test 1: Check if Firebase is initialized
      setResult(prev => prev + '✅ Firebase app initialized\n')
      
      // Test 2: Check Auth
      setResult(prev => prev + `✅ Auth instance: ${!!auth}\n`)
      
      // Test 3: Check Firestore
      setResult(prev => prev + `✅ Firestore instance: ${!!db}\n`)
      
      // Test 4: Check RTDB
      setResult(prev => prev + `✅ RTDB instance: ${!!rtdb}\n`)
      
      // Test 5: Check current auth state
      setResult(prev => prev + `✅ Current user: ${auth.currentUser ? auth.currentUser.email : 'None'}\n`)
      
      // Test 6: Simple signup test
      setResult(prev => prev + '🔥 Testing signup...\n')
      
      const testEmail = `test-${Date.now()}@example.com`
      const testResult = await signUpUser(testEmail, 'password123', 'Test User', 'employee')
      
      if (testResult.success) {
        setResult(prev => prev + '✅ Signup test successful!\n')
        setResult(prev => prev + `✅ User created: ${testResult.user.uid}\n`)
      } else {
        setResult(prev => prev + `❌ Signup test failed: ${testResult.error}\n`)
      }
      
    } catch (error) {
      setResult(prev => prev + `❌ Error: ${error.message}\n`)
      console.error('Debug test error:', error)
    }
    
    setLoading(false)
  }

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'monospace',
      background: '#f5f5f5',
      margin: '20px',
      borderRadius: '8px'
    }}>
      <h2>🔥 Firebase Debug Panel</h2>
      
      <button 
        onClick={testFirebaseConnection}
        disabled={loading}
        style={{
          padding: '10px 20px',
          background: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test Firebase Connection'}
      </button>
      
      <pre style={{
        background: '#000',
        color: '#0f0',
        padding: '15px',
        marginTop: '15px',
        borderRadius: '4px',
        minHeight: '200px',
        whiteSpace: 'pre-wrap'
      }}>
        {result || 'Click "Test Firebase Connection" to start diagnostics...'}
      </pre>
      
      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        <p><strong>Environment Variables:</strong></p>
        <p>VITE_FIREBASE_API_KEY: {import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing'}</p>
        <p>VITE_FIREBASE_AUTH_DOMAIN: {import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing'}</p>
        <p>VITE_FIREBASE_DATABASE_URL: {import.meta.env.VITE_FIREBASE_DATABASE_URL ? '✅ Set' : '❌ Missing'}</p>
        <p>VITE_FIREBASE_PROJECT_ID: {import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing'}</p>
      </div>
    </div>
  )
}

export default FirebaseDebug
