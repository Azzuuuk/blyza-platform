// 🎮 Code Breakers Game Configuration
// This file defines all the game rules, puzzle types, and team size configurations

export const GAME_CONFIG = {
  // Basic game settings
  name: "Code Breakers",
  description: "Decode encrypted messages as a team! 🔐",
  minPlayers: 2,
  maxPlayers: 8,
  
  // Time settings (in seconds)
  defaultDuration: 1200, // 20 minutes
  phases: {
    setup: 120,        // 2 minutes to review clues
    collaboration: 900, // 15 minutes main game
    finalRush: 180     // 3 minutes final decoding
  },

  // Scoring system
  scoring: {
    correctMessage: 100,     // Points per correctly decoded message
    speedBonus: 50,          // Bonus for fast completion
    collaborationBonus: 25,  // Bonus for good teamwork
    hintsUsed: -10          // Penalty for using hints
  },

  // Team size configurations - game adapts based on number of players
  teamConfigs: {
    2: {
      puzzleComplexity: 'simple',
      messagesCount: 3,
      hintsAvailable: 3,
      timeLimit: 1500, // 25 minutes for smaller teams
      cipherKeysPerPlayer: 2
    },
    3: {
      puzzleComplexity: 'simple',
      messagesCount: 4,
      hintsAvailable: 2,
      timeLimit: 1320, // 22 minutes
      cipherKeysPerPlayer: 2
    },
    4: {
      puzzleComplexity: 'medium',
      messagesCount: 5,
      hintsAvailable: 2,
      timeLimit: 1200, // 20 minutes
      cipherKeysPerPlayer: 1
    },
    5: {
      puzzleComplexity: 'medium',
      messagesCount: 5,
      hintsAvailable: 1,
      timeLimit: 1080, // 18 minutes
      cipherKeysPerPlayer: 1
    },
    6: {
      puzzleComplexity: 'complex',
      messagesCount: 6,
      hintsAvailable: 1,
      timeLimit: 1080, // 18 minutes
      cipherKeysPerPlayer: 1
    },
    '7+': {
      puzzleComplexity: 'complex',
      messagesCount: 7,
      hintsAvailable: 0,
      timeLimit: 1500, // 25 minutes for coordination
      cipherKeysPerPlayer: 1,
      useSubTeams: true
    }
  }
}

// 🔐 Cipher types available in the game
export const CIPHER_TYPES = {
  caesar: {
    name: "Caesar Cipher",
  story: "You've intercepted enemy communications! Decode them to save the mission! \ud83d\udd75\ufe0f",
  description: "Decode spy messages using classic ciphers",
  icon: "🕵️",
    difficulty: 1,
    example: "A → D (shift of 3)"
  },
  substitution: {
    name: "Symbol Substitution", 
  story: "Ancient pirates left encrypted clues to their treasure! Work together to find it! \ud83c\udff4\u200d\u2620\ufe0f",
  description: "Find the treasure by cracking encrypted clues",
  icon: "🏴‍☠️",
    difficulty: 2,
    example: "A → ★, B → ♦"
  },
  morse: {
    name: "Morse Code",
  story: "We've received encrypted messages from space! Decode them to make first contact! \ud83d\udef8",
  description: "Translate mysterious signals from outer space",
  icon: "🛸",
    difficulty: 2,
    example: "A → ·−, B → −···"
  },
  reverse: {
    name: "Reverse Cipher",
  story: "You're planning the perfect heist! Decode the security plans! \ud83d\udcb0",
  description: "Outsmart the vault with clever codebreaking",
  icon: "💰",
    difficulty: 1,
    example: "HELLO → OLLEH"
  },
  atbash: {
    name: "Atbash Cipher",
    description: "A↔Z, B↔Y, C↔X pattern",
    difficulty: 3,
    example: "A → Z, B → Y"
  }
}

// 🎯 Sample missions with different themes (keeps it fun!)
export const GAME_THEMES = {
  spy: {
    name: "Secret Agent Mission",
    story: "You've intercepted enemy communications! Decode them to save the mission! 🕵️",
    messagePrefix: "AGENT:",
    backgroundStyle: "spy-theme"
  },
  treasure: {
    name: "Treasure Hunt",
    story: "Ancient pirates left encrypted clues to their treasure! Work together to find it! 🏴‍☠️",
    messagePrefix: "PIRATES:",
    backgroundStyle: "treasure-theme"
  },
  space: {
    name: "Alien Contact",
    story: "We've received encrypted messages from space! Decode them to make first contact! 🛸",
    messagePrefix: "ALIENS:",
    backgroundStyle: "space-theme"
  },
  heist: {
    name: "Bank Heist",
    story: "You're planning the perfect heist! Decode the security plans! 💰",
    messagePrefix: "SECURITY:",
    backgroundStyle: "heist-theme"
  }
}

// 🏆 Achievement system to make it more fun
export const ACHIEVEMENTS = {
  speedDemon: {
    name: "Speed Demon",
    description: "Completed in under 10 minutes",
    icon: "⚡",
    condition: (gameData) => gameData.duration < 600
  },
  perfectTeam: {
    name: "Perfect Team",
    description: "Decoded all messages without hints",
    icon: "🏆", 
    condition: (gameData) => gameData.hintsUsed === 0 && gameData.messagesDecoded === gameData.totalMessages
  },
  collaborator: {
    name: "Team Player",
    description: "Shared clues 10+ times",
    icon: "🤝",
    condition: (gameData) => gameData.cluesShared >= 10
  },
  codemaster: {
    name: "Code Master",
    description: "Solved the hardest puzzle first",
    icon: "🧠",
    condition: (gameData) => gameData.hardestPuzzleFirst === true
  }
}

export default GAME_CONFIG
