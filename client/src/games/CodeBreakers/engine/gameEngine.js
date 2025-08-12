// Pure helper functions for Operation Nightfall game logic
// Side-effect free so they can run on server or client

/** Determine if all required inputs for a room have been provided. */
export function computeHasAllInputs(room, providedInputs) {
  if (!room || !room.requiredInputs) return false
  return room.requiredInputs.every(inputKey => !!providedInputs[inputKey])
}

/** Return updated roomProgress object when a room is completed (immutable). */
export function completeRoom(roomProgress, currentRoom) {
  const next = { ...roomProgress }
  if (!next[currentRoom]) return next
  next[currentRoom] = { ...next[currentRoom], completed: true }
  if (next[currentRoom + 1]) {
    next[currentRoom + 1] = { ...next[currentRoom + 1], unlocked: true }
  }
  return next
}

/** Build a formatted system chat message object. */
export function systemMessage(content) {
  return {
    id: `${Date.now()}-sys-${Math.random().toString(36).slice(2,7)}`,
    type: 'system',
    role: 'MISSION-CONTROL',
    content,
    timestamp: new Date().toLocaleTimeString(),
  }
}

/** Build a team input chat message object. */
export function teamInputMessage(role, inputType) {
  return {
    id: `${Date.now()}-inp-${Math.random().toString(36).slice(2,7)}`,
    type: 'team-input',
    role: role.toUpperCase(),
    content: `📡 PROVIDED: ${inputType.replace(/-/g, ' ').toUpperCase()}`,
    timestamp: new Date().toLocaleTimeString(),
  }
}

/** Format seconds as M:SS. */
export function formatSeconds(sec) {
  const mins = Math.floor(sec / 60)
  const secs = sec % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
