// 🧩 Puzzle Generator - Creates the encrypted messages and clues
// This is the core logic that makes each game unique and challenging

import { CIPHER_TYPES, GAME_THEMES } from './GameConfig.js'

class PuzzleGenerator {
  constructor() {
    // Sample messages for different themes - these get encrypted
    this.messageBank = {
      spy: [
        "THE PACKAGE IS AT THE BRIDGE",
        "MEETING AT MIDNIGHT PIER SEVEN", 
        "ABORT MISSION COVER IS BLOWN",
        "BACKUP PLAN ALPHA IS IN EFFECT",
        "TARGET ACQUIRED PROCEEDING TO EXTRACT"
      ],
      treasure: [
        "THE GOLD IS BURIED UNDER THE OAK",
        "FOLLOW THE NORTH STAR TO VICTORY",
        "X MARKS THE SPOT ON DEAD MANS ISLE",
        "THREE PACES EAST FROM THE SKULL ROCK",
        "THE TREASURE LIES WHERE WATERS MEET"
      ],
      space: [
        "WE COME IN PEACE FROM DISTANT STARS",
        "YOUR PLANET SHOWS GREAT PROMISE",
        "INITIATING FIRST CONTACT PROTOCOL",
        "SHARING KNOWLEDGE IS OUR PURPOSE", 
        "THE UNIVERSE IS VAST AND WONDERFUL"
      ],
      heist: [
        "SECURITY CHANGES SHIFT AT NINE PM",
        "VAULT CODE IS EIGHT SEVEN TWO ONE",
        "CAMERAS GO DOWN FOR MAINTENANCE",
        "EXIT THROUGH THE LOADING DOCK",
        "GETAWAY CAR WAITS ON FIFTH STREET"
      ]
    }
  }

  // 🎲 Generate a complete puzzle set for a team
  generatePuzzleSet(playerCount, theme = 'spy') {
    const config = this.getTeamConfig(playerCount)
    const selectedTheme = GAME_THEMES[theme]
    
    // Pick random messages from the theme
    const messages = this.selectRandomMessages(theme, config.messagesCount)
    
    // Generate cipher keys for each player
    const playerKeys = this.generatePlayerKeys(playerCount, config)
    
    // Create encrypted messages
    const encryptedMessages = this.encryptMessages(messages, playerKeys)
    
    return {
      theme: selectedTheme,
      messages: encryptedMessages,
      playerKeys: playerKeys,
      config: config,
      solutions: messages // Keep for validation
    }
  }

  // 🔑 Generate unique cipher keys for each player
  generatePlayerKeys(playerCount, config) {
    const availableCiphers = ['caesar', 'substitution', 'morse', 'reverse']
    const keys = {}
    
    for (let i = 1; i <= playerCount; i++) {
      keys[`player${i}`] = {
        playerId: `player${i}`,
        ciphers: this.assignCiphersToPlayer(availableCiphers, config.cipherKeysPerPlayer),
        role: this.getPlayerRole(i, playerCount)
      }
    }
    
    return keys
  }

  // 🎭 Assign fun roles to players
  getPlayerRole(playerNumber, totalPlayers) {
    const roles = [
      "🕵️ Crypto Analyst", 
      "🧠 Pattern Seeker", 
      "🔍 Code Hunter", 
      "⚡ Speed Decoder",
      "🤝 Team Coordinator",
      "💡 Hint Master",
      "🎯 Solution Finder",
      "🔐 Cipher Expert"
    ]
    return roles[playerNumber - 1] || roles[0]
  }

  // 🔤 Caesar cipher implementation
  caesarCipher(text, shift) {
    return text.replace(/[A-Z]/g, (char) => {
      const code = char.charCodeAt(0)
      const shifted = ((code - 65 + shift) % 26 + 26) % 26
      return String.fromCharCode(shifted + 65)
    })
  }

  // 🔤 Symbol substitution cipher
  symbolSubstitution(text, symbolMap) {
    return text.replace(/[A-Z]/g, (char) => symbolMap[char] || char)
  }

  // 🔤 Morse code cipher
  morseCode(text) {
    const morseMap = {
      'A': '·−', 'B': '−···', 'C': '−·−·', 'D': '−··', 'E': '·',
      'F': '··−·', 'G': '−−·', 'H': '····', 'I': '··', 'J': '·−−−',
      'K': '−·−', 'L': '·−··', 'M': '−−', 'N': '−·', 'O': '−−−',
      'P': '·−−·', 'Q': '−−·−', 'R': '·−·', 'S': '···', 'T': '−',
      'U': '··−', 'V': '···−', 'W': '·−−', 'X': '−··−', 'Y': '−·−−',
      'Z': '−−··', ' ': '/'
    }
    return text.replace(/[A-Z ]/g, (char) => morseMap[char] || char)
  }

  // 🔄 Reverse cipher (simplest one)
  reverseCipher(text) {
    return text.split('').reverse().join('')
  }

  // 🔐 Apply multiple ciphers to create layered encryption
  encryptMessages(messages, playerKeys) {
    const encrypted = []
    
    messages.forEach((message, index) => {
      // Each message uses different cipher combinations
      const encryptionLayers = this.selectEncryptionLayers(index, playerKeys)
      let encryptedMessage = message.toUpperCase()
      
      // Apply cipher layers
      encryptionLayers.forEach(layer => {
        switch(layer.type) {
          case 'caesar':
            encryptedMessage = this.caesarCipher(encryptedMessage, layer.shift)
            break
          case 'substitution':
            encryptedMessage = this.symbolSubstitution(encryptedMessage, layer.symbolMap)
            break
          case 'morse':
            encryptedMessage = this.morseCode(encryptedMessage)
            break
          case 'reverse':
            encryptedMessage = this.reverseCipher(encryptedMessage)
            break
        }
      })
      
      encrypted.push({
        id: `message_${index + 1}`,
        original: message,
        encrypted: encryptedMessage,
        difficulty: this.calculateDifficulty(encryptionLayers),
        layers: encryptionLayers,
        hint: this.generateHint(message, encryptionLayers)
      })
    })
    
    return encrypted
  }

  // 💡 Generate helpful hints for when teams get stuck
  generateHint(originalMessage, layers) {
    const hints = [
      `This message has ${layers.length} encryption layer(s)`,
      `Try looking for common words like "THE" or "AND"`,
      `The first word might be: "${originalMessage.split(' ')[0].slice(0, 2)}..."`,
      `This message is ${originalMessage.length} characters long`,
      `Look for repeating patterns in the encrypted text`
    ]
    return hints[Math.floor(Math.random() * hints.length)]
  }

  // 🎲 Helper methods
  selectRandomMessages(theme, count) {
    const messages = this.messageBank[theme] || this.messageBank.spy
    return messages.slice(0, count)
  }

  getTeamConfig(playerCount) {
    // Import from GameConfig based on team size
    if (playerCount <= 2) return { messagesCount: 3, cipherKeysPerPlayer: 2 }
    if (playerCount <= 4) return { messagesCount: 4, cipherKeysPerPlayer: 1 }
    if (playerCount <= 6) return { messagesCount: 5, cipherKeysPerPlayer: 1 }
    return { messagesCount: 6, cipherKeysPerPlayer: 1 }
  }

  assignCiphersToPlayer(availableCiphers, keyCount) {
    const shuffled = [...availableCiphers].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, keyCount).map(type => ({
      type,
      ...this.generateCipherDetails(type)
    }))
  }

  generateCipherDetails(type) {
    switch(type) {
      case 'caesar':
        return { shift: Math.floor(Math.random() * 25) + 1 }
      case 'substitution':
        return { symbolMap: this.generateSymbolMap() }
      case 'morse':
        return { separator: ' ' }
      case 'reverse':
        return {}
      default:
        return {}
    }
  }

  generateSymbolMap() {
    const symbols = ['★', '♦', '◆', '♠', '♣', '♥', '●', '◉', '◎', '○']
    const letters = 'ABCDEFGHIJ'.split('')
    const map = {}
    letters.forEach((letter, index) => {
      map[letter] = symbols[index] || letter
    })
    return map
  }

  selectEncryptionLayers(messageIndex, playerKeys) {
    // Simple implementation - each message uses 1-2 cipher types
    const allCiphers = Object.values(playerKeys).flatMap(key => key.ciphers)
    const selectedCipher = allCiphers[messageIndex % allCiphers.length]
    return [selectedCipher]
  }

  calculateDifficulty(layers) {
    return layers.reduce((sum, layer) => sum + (CIPHER_TYPES[layer.type]?.difficulty || 1), 0)
  }
}

export default PuzzleGenerator

// Convenience helper to match the UI component's expected shape
// theme: one of 'spy' | 'treasure' | 'space' | 'heist'
// playerCount: number of players
export const generatePuzzles = (theme = 'spy', playerCount = 3) => {
  const gen = new PuzzleGenerator()
  const set = gen.generatePuzzleSet(playerCount, theme)

  // Add solution field for easy validation in UI
  const messages = (set.messages || []).map(m => ({
    ...m,
    solution: m.original
  }))

  // Provide keys for the current player (player1) as an array with descriptions
  const p1 = set.playerKeys?.player1?.ciphers || []
  const playerKeys = p1.map(c => ({
    type: c.type,
    description: CIPHER_TYPES[c.type]?.description || 'Cipher key'
  }))

  return {
    theme: set.theme,
    messages,
    playerKeys,
    config: set.config
  }
}
