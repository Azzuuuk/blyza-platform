import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// In-memory lobby storage (use Redis in production)
const lobbies = new Map();

/**
 * @route POST /api/lobby/create
 * @desc Create a new game lobby
 * @access Private
 */
router.post('/create', authenticateUser, async (req, res) => {
  try {
    console.log('Creating lobby with body:', req.body);
    console.log('User:', req.user);
    
    const { gameId, gameType, settings, maxPlayers } = req.body;
    const finalGameId = gameId || gameType;
    
    if (!finalGameId) {
      return res.status(400).json({
        success: false,
        error: 'Game ID or game type is required'
      });
    }
    
    const lobbyId = uuidv4();
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const lobby = {
      id: lobbyId,
      roomCode,
      gameId: finalGameId,
      hostId: req.user.uid,
      hostName: req.user.name,
      settings: settings || {},
      players: [{
        id: req.user.uid,
        name: req.user.name,
        isHost: true,
        joinedAt: new Date().toISOString(),
        status: 'connected'
      }],
      status: 'waiting', // waiting, starting, in-progress, completed
      createdAt: new Date().toISOString(),
      maxPlayers: maxPlayers || settings?.maxPlayers || 8
    };
    
    lobbies.set(lobbyId, lobby);
    console.log('Lobby created:', lobby);
    
    res.json({
      success: true,
      lobby: {
        ...lobby,
        joinLink: `${process.env.CLIENT_URL || 'http://localhost:3002'}/join/${roomCode}`
      }
    });
  } catch (error) {
    console.error('Error creating lobby:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create lobby'
    });
  }
});

/**
 * @route POST /api/lobby/join
 * @desc Join a lobby by room code
 * @access Public
 */
router.post('/join', async (req, res) => {
  try {
    const { roomCode, playerName, playerId } = req.body;
    
    if (!roomCode || !playerName) {
      return res.status(400).json({
        success: false,
        error: 'Room code and player name are required'
      });
    }
    
    // Find lobby by room code
    let targetLobby = null;
    for (const [id, lobby] of lobbies) {
      if (lobby.roomCode === roomCode.toUpperCase()) {
        targetLobby = lobby;
        break;
      }
    }
    
    if (!targetLobby) {
      return res.status(404).json({
        success: false,
        error: 'Lobby not found'
      });
    }
    
    if (targetLobby.status !== 'waiting') {
      return res.status(400).json({
        success: false,
        error: 'Game has already started'
      });
    }
    
    if (targetLobby.players.length >= targetLobby.maxPlayers) {
      return res.status(400).json({
        success: false,
        error: 'Lobby is full'
      });
    }
    
    // Check if player already exists
    const existingPlayer = targetLobby.players.find(p => 
      p.name.toLowerCase() === playerName.toLowerCase() ||
      (playerId && p.id === playerId)
    );
    
    if (existingPlayer) {
      return res.status(400).json({
        success: false,
        error: 'Player name already taken'
      });
    }
    
    // Add player to lobby
    const newPlayer = {
      id: playerId || uuidv4(),
      name: playerName,
      isHost: false,
      joinedAt: new Date().toISOString(),
      status: 'connected'
    };
    
    targetLobby.players.push(newPlayer);
    
    res.json({
      success: true,
      lobby: targetLobby,
      playerId: newPlayer.id
    });
  } catch (error) {
    console.error('Error joining lobby:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join lobby'
    });
  }
});

/**
 * @route GET /api/lobby/:id
 * @desc Get lobby details
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    const lobby = lobbies.get(req.params.id);
    
    if (!lobby) {
      return res.status(404).json({
        success: false,
        error: 'Lobby not found'
      });
    }
    
    res.json({
      success: true,
      lobby
    });
  } catch (error) {
    console.error('Error fetching lobby:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lobby'
    });
  }
});

/**
 * @route POST /api/lobby/:id/start
 * @desc Start the game
 * @access Private
 */
router.post('/:id/start', authenticateUser, async (req, res) => {
  try {
    const lobby = lobbies.get(req.params.id);
    
    if (!lobby) {
      return res.status(404).json({
        success: false,
        error: 'Lobby not found'
      });
    }
    
    if (lobby.hostId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        error: 'Only the host can start the game'
      });
    }
    
    if (lobby.players.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 players required to start'
      });
    }
    
    lobby.status = 'starting';
    lobby.startedAt = new Date().toISOString();
    
    res.json({
      success: true,
      lobby
    });
  } catch (error) {
    console.error('Error starting game:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start game'
    });
  }
});

/**
 * @route DELETE /api/lobby/:id/leave
 * @desc Leave a lobby
 * @access Public
 */
router.delete('/:id/leave', async (req, res) => {
  try {
    const { playerId } = req.body;
    const lobby = lobbies.get(req.params.id);
    
    if (!lobby) {
      return res.status(404).json({
        success: false,
        error: 'Lobby not found'
      });
    }
    
    const playerIndex = lobby.players.findIndex(p => p.id === playerId);
    
    if (playerIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Player not found in lobby'
      });
    }
    
    const player = lobby.players[playerIndex];
    lobby.players.splice(playerIndex, 1);
    
    // If host leaves, assign new host or close lobby
    if (player.isHost) {
      if (lobby.players.length > 0) {
        lobby.players[0].isHost = true;
        lobby.hostId = lobby.players[0].id;
        lobby.hostName = lobby.players[0].name;
      } else {
        // Delete empty lobby
        lobbies.delete(req.params.id);
      }
    }
    
    res.json({
      success: true,
      message: 'Left lobby successfully'
    });
  } catch (error) {
    console.error('Error leaving lobby:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to leave lobby'
    });
  }
});

export { lobbies };
export default router;
