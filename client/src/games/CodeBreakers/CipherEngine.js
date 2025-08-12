// 🔐 Real Cipher Engine - Actual encryption/decryption logic
export class CipherEngine {
  
  // Caesar Cipher Implementation
  static caesarEncode(text, shift) {
    return text.split('').map(char => {
      if (char.match(/[A-Z]/)) {
        return String.fromCharCode(((char.charCodeAt(0) - 65 + shift) % 26) + 65)
      }
      if (char.match(/[a-z]/)) {
        return String.fromCharCode(((char.charCodeAt(0) - 97 + shift) % 26) + 97)
      }
      return char
    }).join('')
  }
  
  static caesarDecode(text, shift) {
    return this.caesarEncode(text, 26 - shift)
  }
  
  // Substitution Cipher Implementation  
  static substitutionEncode(text, keyMap) {
    return text.split('').map(char => keyMap[char.toUpperCase()] || char).join('')
  }
  
  static substitutionDecode(text, keyMap) {
    const reverseMap = {}
    Object.keys(keyMap).forEach(key => {
      reverseMap[keyMap[key]] = key
    })
    return this.substitutionEncode(text, reverseMap)
  }
  
  // Atbash Cipher (A=Z, B=Y, etc.)
  static atbashEncode(text) {
    return text.split('').map(char => {
      if (char.match(/[A-Z]/)) {
        return String.fromCharCode(90 - (char.charCodeAt(0) - 65))
      }
      if (char.match(/[a-z]/)) {
        return String.fromCharCode(122 - (char.charCodeAt(0) - 97))
      }
      return char
    }).join('')
  }
  
  static atbashDecode(text) {
    return this.atbashEncode(text) // Atbash is its own reverse
  }
  
  // Letter frequency analysis helper
  static analyzeFrequency(text) {
    const freq = {}
    const letters = text.replace(/[^A-Z]/g, '')
    
    for (let char of letters) {
      freq[char] = (freq[char] || 0) + 1
    }
    
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5) // Top 5 most frequent
  }
  
  // Common English letter frequencies (for hints)
  static getCommonLetters() {
    return ['E', 'T', 'A', 'O', 'I', 'N', 'S', 'H', 'R', 'D']
  }
}

// 🎮 Game Messages Database
export const GAME_MESSAGES = {
  spy: [
    {
      id: 1,
      original: "THE PACKAGE IS AT THE BRIDGE",
      cipher: "caesar",
      key: 3,
      context: "Agent spotted carrying briefcase near water",
      difficulty: "easy"
    },
    {
      id: 2, 
      original: "MEETING AT MIDNIGHT PIER SEVEN",
      cipher: "caesar",
      key: 7,
      context: "Surveillance detected unusual activity at docks",
      difficulty: "medium"
    },
    {
      id: 3,
      original: "ABORT MISSION COVER IS BLOWN", 
      cipher: "substitution",
      key: { A: 'Z', B: 'Y', C: 'X', D: 'W', E: 'V', F: 'U', G: 'T', H: 'S', I: 'R', J: 'Q', K: 'P', L: 'O', M: 'N', N: 'M', O: 'L', P: 'K', Q: 'J', R: 'I', S: 'H', T: 'G', U: 'F', V: 'E', W: 'D', X: 'C', Y: 'B', Z: 'A' },
      context: "Emergency transmission from field operative",
      difficulty: "hard"
    },
    {
      id: 4,
      original: "TARGET ACQUIRED PROCEEDING TO EXTRACT",
      cipher: "atbash", 
      key: null,
      context: "Mission update from reconnaissance team",
      difficulty: "medium"
    }
  ],
  treasure: [
    {
      id: 1,
      original: "THE GOLD IS BURIED UNDER THE OAK",
      cipher: "caesar",
      key: 5,
      context: "Found in an old pirate's journal",
      difficulty: "easy"
    },
    {
      id: 2,
      original: "FOLLOW THE NORTH STAR TO VICTORY", 
      cipher: "atbash",
      key: null,
      context: "Carved into the ship's compass",
      difficulty: "medium"
    }
  ]
}

// 🎯 Role Definitions
export const GAME_ROLES = {
  cryptographer: {
    name: "Cryptographer", 
    icon: "🔐",
    description: "Sees cipher patterns and encryption methods",
    abilities: ["View cipher type", "See encryption keys", "Access pattern analysis"],
    color: "#7c3aed"
  },
  analyst: {
    name: "Intelligence Analyst",
    icon: "🕵️", 
    description: "Sees message context and background information",
    abilities: ["View message context", "Access historical clues", "See mission briefings"],
    color: "#059669"
  },
  decoder: {
    name: "Field Decoder", 
    icon: "📝",
    description: "Sees letter frequency and statistical analysis",
    abilities: ["Letter frequency analysis", "Common word patterns", "Decryption hints"],
    color: "#dc2626"
  },
  coordinator: {
    name: "Mission Coordinator",
    icon: "📊",
    description: "Sees team progress and manages resources", 
    abilities: ["Team progress tracking", "Hint management", "Time coordination"],
    color: "#ea580c"
  }
}

// 🎲 Puzzle Generator with Real Logic
export function generateRealPuzzles(theme, difficulty, messageCount = 3) {
  const messages = GAME_MESSAGES[theme] || GAME_MESSAGES.spy
  const selectedMessages = messages.slice(0, messageCount)
  
  return selectedMessages.map(msg => {
    let encrypted = ""
    
    // Actually encrypt the message based on cipher type
    switch (msg.cipher) {
      case "caesar":
        encrypted = CipherEngine.caesarEncode(msg.original, msg.key)
        break
      case "substitution":
        encrypted = CipherEngine.substitutionEncode(msg.original, msg.key)
        break
      case "atbash":
        encrypted = CipherEngine.atbashEncode(msg.original)
        break
      default:
        encrypted = msg.original
    }
    
    return {
      id: msg.id,
      original: msg.original,
      encrypted: encrypted,
      cipher: msg.cipher,
      key: msg.key,
      context: msg.context,
      difficulty: msg.difficulty,
      solved: false
    }
  })
}

// 🔍 Solution Validator
export function validateSolution(userAnswer, correctAnswer) {
  // Normalize both strings - remove spaces, punctuation, make uppercase
  const normalize = (str) => str.replace(/[^A-Z0-9]/g, '').toUpperCase()
  const normalizedUser = normalize(userAnswer)
  const normalizedCorrect = normalize(correctAnswer)
  
  // Exact match
  if (normalizedUser === normalizedCorrect) {
    return { correct: true, accuracy: 100 }
  }
  
  // Partial match scoring
  const similarity = calculateSimilarity(normalizedUser, normalizedCorrect)
  return { 
    correct: similarity >= 0.8, // 80% similarity counts as correct
    accuracy: Math.round(similarity * 100)
  }
}

function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1
  
  if (longer.length === 0) return 1.0
  
  const editDistance = levenshteinDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

function levenshteinDistance(str1, str2) {
  const matrix = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}
