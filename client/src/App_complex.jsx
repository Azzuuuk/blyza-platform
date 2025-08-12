import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from './components/ErrorBoundary'

// Pages
import HomePage from './pages/HomePageNew'
import GameIntent from './pages/GameIntentNew'
import GameCatalog from './pages/GameCatalogNew'
import GameCustomization from './pages/GameCustomizationNew'
import CreateLobby from './pages/CreateLobby'
import LobbyCreation from './pages/LobbyCreation'
import LobbyPage from './pages/LobbyPage'
import GameSimulation from './pages/GameSimulationNew'
import GameAnalysis from './pages/GameAnalysis'
import GameplayPage from './pages/GameplayPage'
import ManagerFeedback from './pages/ManagerFeedback'
import AIAnalysisReport from './pages/AIAnalysisReport'
import ResultsPage from './pages/ResultsPage'
import RewardsStore from './pages/RewardsStore'
import JoinGame from './pages/JoinGame'
import ManagerDashboard from './pages/ManagerDashboardNew'

// Games
import CodeBreakersGame from './games/CodeBreakers/CodeBreakersGame'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/game-intent" element={<GameIntent />} />
            <Route path="/games" element={<GameCatalog />} />
            <Route path="/games/:gameId/customize" element={<GameCustomization />} />
            <Route path="/lobby/create" element={<LobbyCreation />} />
            <Route path="/lobby/:lobbyId" element={<LobbyPage />} />
            <Route path="/game/simulation" element={<GameSimulation />} />
            <Route path="/game/analysis" element={<GameAnalysis />} />
            <Route path="/game/:sessionId" element={<GameplayPage />} />
            <Route path="/manager-feedback" element={<ManagerFeedback />} />
            <Route path="/ai-analysis-report" element={<AIAnalysisReport />} />
            <Route path="/results/:sessionId" element={<ResultsPage />} />
            <Route path="/rewards" element={<RewardsStore />} />
            <Route path="/join/:roomCode?" element={<JoinGame />} />
            <Route path="/dashboard" element={<ManagerDashboard />} />
            
            {/* Game Routes */}
            <Route path="/games/code-breakers" element={<CodeBreakersGame />} />
            
            {/* Test Route */}
            <Route path="/test" element={<div style={{padding: '20px', color: 'white', background: '#1a1a2e', minHeight: '100vh'}}>✅ Test Route Working!</div>} />
          </Routes>
          
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
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
