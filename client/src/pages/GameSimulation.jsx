import React from 'react'
import { Navigate } from 'react-router-dom'

// Redirect to the new GameSimulationNew component
const GameSimulation = () => {
  return <Navigate to="/game/simulation" replace />
}

export default GameSimulation