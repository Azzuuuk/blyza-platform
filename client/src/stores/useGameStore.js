import { create } from 'zustand'

/**
 * Game Store - Manages global game state
 * Tracks current game, session, players, and game state
 */
export const useGameStore = create((set, get) => ({
  // Current game data
  currentGame: null,
  gameSession: null,
  players: [],
  gameState: 'idle', // idle, lobby, playing, paused, finished
  
  // Game settings
  settings: {
    teamSize: 4,
    duration: 30,
    difficulty: 'medium'
  },
  
  // Actions
  setCurrentGame: (game) => set({ currentGame: game }),
  setGameSession: (session) => set({ gameSession: session }),
  updatePlayers: (players) => set({ players }),
  setGameState: (state) => set({ gameState: state }),
  updateSettings: (newSettings) => set(state => ({
    settings: { ...state.settings, ...newSettings }
  })),
  
  // Add player to current session
  addPlayer: (player) => set(state => ({
    players: [...state.players, player]
  })),
  
  // Remove player from session
  removePlayer: (playerId) => set(state => ({
    players: state.players.filter(p => p.id !== playerId)
  })),
  
  // Reset all game data
  resetGame: () => set({
    currentGame: null,
    gameSession: null,
    players: [],
    gameState: 'idle'
  }),
  
  // Getters
  isGameActive: () => {
    const state = get()
    return ['lobby', 'playing', 'paused'].includes(state.gameState)
  },
  
  getPlayerCount: () => get().players.length
}))
