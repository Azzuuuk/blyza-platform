// 🎭 Interdependent Team Role System for Code Breakers
// Each role has EXCLUSIVE access to different pieces of information

export const TEAM_ROLES = {
  codebreaker: {
    name: "🔓 Codebreaker",
    description: "Can attempt to decode ciphers, but needs clues from teammates",
    color: "#3b82f6",
    abilities: [
      "Submit cipher solutions",
      "See encrypted messages", 
      "Use decryption tools",
      "Request hints from Intelligence Analyst"
    ],
    limitations: [
      "Cannot see cipher types or keys",
      "Cannot see frequency analysis", 
      "Cannot see contextual clues",
      "Limited to 2 wrong attempts per puzzle"
    ],
    sees: ["encrypted_text", "own_attempts", "team_chat"],
    hidden: ["cipher_type", "cipher_key", "frequency_analysis", "context_clues"]
  },

  analyst: {
    name: "🧠 Intelligence Analyst", 
    description: "Sees cipher types and patterns, guides the Codebreaker",
    color: "#10b981",
    abilities: [
      "Identify cipher types (Caesar, Substitution, etc.)",
      "Perform frequency analysis",
      "Provide strategic hints",
      "See letter patterns and distributions"
    ],
    limitations: [
      "Cannot submit final solutions",
      "Cannot see contextual mission clues",
      "Cannot access field intelligence",
      "Only 3 hints per game"
    ],
    sees: ["cipher_type", "frequency_analysis", "letter_patterns", "team_chat"],
    hidden: ["context_clues", "mission_intelligence", "final_solution"]
  },

  coordinator: {
    name: "📡 Mission Coordinator",
    description: "Has contextual clues and coordinates team strategy", 
    color: "#f59e0b",
    abilities: [
      "See contextual mission clues",
      "Access field intelligence reports",
      "Coordinate team timing", 
      "Manage team resources and hints"
    ],
    limitations: [
      "Cannot see cipher details or frequency analysis",
      "Cannot submit solutions",
      "Cannot perform technical analysis",
      "Must rely on others for decryption"
    ],
    sees: ["context_clues", "mission_intelligence", "team_progress", "team_chat"],
    hidden: ["cipher_type", "frequency_analysis", "encrypted_details"]
  },

  communicator: {
    name: "📞 Communications Specialist",
    description: "Facilitates team communication and sees partial solutions",
    color: "#8b5cf6", 
    abilities: [
      "See partial decrypted text as others work",
      "Facilitate team discussion",
      "Suggest word completions",
      "Bridge information between roles"
    ],
    limitations: [
      "Cannot see full technical details",
      "Cannot submit final solutions", 
      "Cannot access specialized tools",
      "Depends on others for key insights"
    ],
    sees: ["partial_solutions", "word_suggestions", "team_communication", "team_chat"],
    hidden: ["cipher_keys", "technical_analysis", "full_context"]
  }
}

// 🎮 How the Interdependent System Works

export class TeamGameLogic {
  
  // Each role gets different information about the same puzzle
  static generateRoleSpecificData(puzzle, role) {
    const baseData = {
      puzzleId: puzzle.id,
      teamChat: [], // Everyone can see team chat
      timeRemaining: null // Everyone sees time
    }

    switch (role) {
      case 'codebreaker':
        return {
          ...baseData,
          encryptedText: puzzle.encrypted,
          decryptionTools: ['letter_substitution', 'shift_cipher', 'pattern_finder'],
          attemptCount: 0,
          maxAttempts: 2,
          canSubmitSolution: true,
          // HIDDEN: cipher type, key, frequency analysis, context
        }

      case 'analyst':
        return {
          ...baseData,
          cipherType: puzzle.cipher,
          letterFrequency: this.generateFrequencyAnalysis(puzzle.encrypted),
          patternAnalysis: this.generatePatternAnalysis(puzzle.encrypted),
          suggestedShifts: puzzle.cipher === 'caesar' ? [puzzle.key] : null,
          hintsRemaining: 3,
          // HIDDEN: context clues, mission intelligence, final answer
        }

      case 'coordinator':
        return {
          ...baseData,
          contextClues: puzzle.context,
          missionIntelligence: this.generateMissionIntel(puzzle),
          teamProgress: { puzzlesSolved: 0, totalPuzzles: 4 },
          resourceManagement: { hintsUsed: 0, maxHints: 10 },
          // HIDDEN: cipher technical details, frequency analysis
        }

      case 'communicator':
        return {
          ...baseData,
          partialSolution: "", // Updates as team makes progress
          wordSuggestions: this.generateWordSuggestions(puzzle.original),
          communicationFacilities: ['team_chat', 'direct_messaging', 'hint_sharing'],
          // HIDDEN: full technical analysis, complete context
        }

      default:
        return baseData
    }
  }

  // Generate frequency analysis for the Intelligence Analyst
  static generateFrequencyAnalysis(encryptedText) {
    const freq = {}
    const letters = encryptedText.replace(/[^A-Z]/g, '')
    
    for (let char of letters) {
      freq[char] = (freq[char] || 0) + 1
    }
    
    const sortedFreq = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
    
    return {
      topLetters: sortedFreq,
      totalLetters: letters.length,
      uniqueLetters: Object.keys(freq).length,
      mostCommon: sortedFreq[0]?.[0] || 'E',
      analysis: `Most frequent: ${sortedFreq[0]?.[0] || 'Unknown'} (${sortedFreq[0]?.[1] || 0} times)`
    }
  }

  // Generate pattern analysis for the Intelligence Analyst
  static generatePatternAnalysis(encryptedText) {
    return {
      doubleLetters: (encryptedText.match(/([A-Z])\1/g) || []),
      commonPatterns: this.findCommonPatterns(encryptedText),
      wordLengths: encryptedText.split(' ').map(word => word.length),
      suggestedCipher: this.guessCipherType(encryptedText)
    }
  }

  static findCommonPatterns(text) {
    const patterns = []
    // Look for repeated 2-3 letter sequences
    const words = text.split(' ')
    
    if (words.some(word => word.length === 3)) {
      patterns.push("Three-letter words detected (likely THE, AND, FOR)")
    }
    
    if (words.some(word => word.length === 1)) {
      patterns.push("Single letters detected (likely A or I)")
    }
    
    return patterns
  }

  static guessCipherType(text) {
    const freq = this.generateFrequencyAnalysis(text)
    
    if (freq.uniqueLetters === 26) {
      return { type: "Substitution", confidence: "High" }
    } else if (freq.uniqueLetters < 15) {
      return { type: "Caesar", confidence: "Medium" }
    } else {
      return { type: "Complex", confidence: "Low" }
    }
  }

  // Generate mission intelligence for the Coordinator
  static generateMissionIntel(puzzle) {
    const intelMap = {
      spy: {
        background: "Operation NIGHTFALL is compromised. Enemy agents are using encrypted communications.",
        timeframe: "Messages intercepted between 2200-0400 hours",
        location: "Urban environment, suspected safe houses in financial district",
        urgency: "Critical - extraction window closes in 45 minutes"
      },
      treasure: {
        background: "Ancient map recovered from shipwreck off Tortuga Island", 
        timeframe: "Coordinates match 18th century navigation records",
        location: "Caribbean basin, multiple small islands surveyed",
        urgency: "High - rival treasure hunters spotted in area"
      }
    }
    
    return intelMap[puzzle.theme] || intelMap.spy
  }

  // Generate word suggestions for the Communicator
  static generateWordSuggestions(originalText) {
    const words = originalText.split(' ')
    return {
      firstWord: words[0]?.substring(0, 2) + "...",
      lastWord: "..." + words[words.length - 1]?.substring(-2),
      commonWords: ["THE", "AND", "FOR", "ARE", "BUT", "NOT", "YOU", "ALL"],
      lengthHints: words.map(word => `${word.length} letters`)
    }
  }

  // Communication system - how roles share information
  static processTeamCommunication(message, senderRole, receiverRole) {
    const allowedCommunications = {
      analyst_to_codebreaker: [
        "This looks like a Caesar cipher",
        "Try shifting letters by 3-7 positions", 
        "The most frequent letter is probably 'E'",
        "Look for 3-letter words that could be 'THE'"
      ],
      coordinator_to_team: [
        "Context suggests this is about a meeting location",
        "Time-sensitive operation, work quickly",
        "Previous intel mentioned bridges and piers",
        "Agent reported suspicious activity at docks"
      ],
      communicator_to_team: [
        "First word starts with 'TH...'",
        "Last word might be 'SEVEN' or 'BRIDGE'", 
        "I see a pattern forming: '_ _ _ _ _ _ _ _ AT _ _ _'",
        "Team, we need to coordinate - who has what?"
      ],
      codebreaker_to_team: [
        "I think I have part of it: 'THE _____ IS AT'",
        "This attempt failed, trying different approach",
        "Need guidance on cipher type",
        "Ready to submit if we're confident"
      ]
    }

    return allowedCommunications[`${senderRole}_to_${receiverRole}`] || []
  }
}

// 🎯 Victory Conditions - Team must work together
export const TEAM_VICTORY_CONDITIONS = {
  individual_limits: {
    codebreaker: "Cannot solve without guidance (max 2 wrong attempts)",
    analyst: "Cannot submit solutions, only provide analysis", 
    coordinator: "Cannot see cipher details, only context",
    communicator: "Cannot access technical tools, only facilitate"
  },
  
  required_cooperation: [
    "Analyst must identify cipher type and share with Codebreaker",
    "Coordinator must provide context clues to narrow possibilities", 
    "Communicator must bridge information between specialists",
    "Codebreaker must synthesize all inputs to submit solution"
  ],
  
  communication_requirements: [
    "Minimum 3 team messages per puzzle",
    "Each role must contribute unique information",
    "Solutions require confirmation from 2+ team members",
    "Hints can only be requested through proper channels"
  ]
}

export default TeamGameLogic
