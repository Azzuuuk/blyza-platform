import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from './components/ErrorBoundary'

// Pages (lazy-loaded to prevent whole-app crashes on import errors)
const HomePage = lazy(() => import('./pages/HomePageNew'))
const GameIntent = lazy(() => import('./pages/GameIntentNew'))
const GameCatalog = lazy(() => import('./pages/GameCatalogNew'))
const GameCustomization = lazy(() => import('./pages/GameCustomizationNew'))
const ManagerDashboard = lazy(() => import('./pages/ManagerDashboardNew'))
const AIAnalysisReport = lazy(() => import('./pages/AIAnalysisReport'))
const LobbyCreation = lazy(() => import('./pages/LobbyCreation'))
const LobbyPage = lazy(() => import('./pages/LobbyPage'))
const JoinGame = lazy(() => import('./pages/JoinGame'))
const RewardsStore = lazy(() => import('./pages/RewardsStore'))
const GameAnalysis = lazy(() => import('./pages/GameAnalysis'))
const GameplayPage = lazy(() => import('./pages/GameplayPage'))
const ManagerFeedback = lazy(() => import('./pages/ManagerFeedback'))
const ResultsPage = lazy(() => import('./pages/ResultsPage'))
const GameSimulation = lazy(() => import('./pages/GameSimulationNew'))

// Games
const CodeBreakersTeamGame = lazy(() => import('./games/CodeBreakers/CodeBreakersTeamGame'))
import ProtectedRoute from './components/ProtectedRoute'
import PageLoader from './components/PageLoader'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

function RoutesWithBoundary() {
  const location = useLocation()
  return (
    <ErrorBoundary key={location.pathname}>
      <Suspense fallback={<PageLoader label="Loading page…" />}> 
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/game-intent" element={<GameIntent />} />
            <Route path="/games" element={<GameCatalog />} />
            <Route path="/games/:gameId/customize" element={<GameCustomization />} />
            <Route path="/lobby/create" element={<ProtectedRoute><LobbyCreation /></ProtectedRoute>} />
            <Route path="/lobby/:lobbyId" element={<ProtectedRoute><LobbyPage /></ProtectedRoute>} />
            <Route path="/game/simulation" element={<GameSimulation />} />
            <Route path="/game/analysis" element={<GameAnalysis />} />
            <Route path="/game/:sessionId" element={<GameplayPage />} />
            <Route path="/manager-feedback" element={<ManagerFeedback />} />
            <Route path="/ai-analysis-report" element={<AIAnalysisReport />} />
            {/* Results aliases */}
            <Route path="/results/:sessionId" element={<ResultsPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/rewards" element={<RewardsStore />} />
            {/* Join game aliases */}
            <Route path="/join/:roomCode?" element={<ProtectedRoute><JoinGame /></ProtectedRoute>} />
            <Route path="/join-game" element={<ProtectedRoute><JoinGame /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><ManagerDashboard /></ProtectedRoute>} />
            
            {/* Game Routes */}
            <Route path="/games/code-breakers" element={<ProtectedRoute><CodeBreakersTeamGame /></ProtectedRoute>} />
            <Route path="/games/code-breakers/play" element={<ProtectedRoute><CodeBreakersTeamGame /></ProtectedRoute>} />
            <Route path="/games/code-breakers/team" element={<ProtectedRoute><CodeBreakersTeamGame /></ProtectedRoute>} />
            
            {/* Test Route */}
            <Route path="/test" element={<div style={{padding: '20px', color: 'white', background: '#1a1a2e', minHeight: '100vh'}}>✅ Test Route Working!</div>} />

            {/* Catch-all to avoid white screens on unknown routes */}
            <Route path="*" element={
              <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)',
                color: '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px'
              }}>
                <div style={{
                  background: 'rgba(51, 65, 85, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(51, 65, 85, 0.2)',
                  borderRadius: '16px',
                  padding: '32px',
                  maxWidth: '560px',
                  textAlign: 'center'
                }}>
                  <h1 style={{fontSize: '28px', marginBottom: '8px'}}>Page not found</h1>
                  <p style={{color: '#94a3b8', marginBottom: '16px'}}>The page you’re looking for doesn’t exist. Use the links below to continue.</p>
                  <div style={{display: 'flex', gap: '12px', justifyContent: 'center'}}>
                    <a href="/" style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                      color: 'white',
                      textDecoration: 'none',
                      fontWeight: 600
                    }}>Go Home</a>
                    <a href="/game-intent" style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: '1px solid rgba(51, 65, 85, 0.3)',
                      background: 'rgba(51, 65, 85, 0.1)',
                      color: 'white',
                      textDecoration: 'none',
                      fontWeight: 600
                    }}>Build a Game</a>
                  </div>
                </div>
              </div>
            } />
        </Routes>
      </Suspense>
      {/* Global toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
    </ErrorBoundary>
  )
}

function App() {
  console.log('App with FULL platform restored...')
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <RoutesWithBoundary />
      </Router>
    </QueryClientProvider>
  )
}

export default App
