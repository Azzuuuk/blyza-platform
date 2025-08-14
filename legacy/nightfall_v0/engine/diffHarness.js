// Diff / Apply Stress Test Harness
// Simple script to simulate random roomProgress mutations and verify
// diff + checksum behavior. Run inside browser console or adapt for Node.

import { useNightfallStore } from './gameStore'
import { recordEvent } from './analytics'

// Generates a random mutation to roomProgress
function randomMutateRoomProgress(rp) {
  const roomIds = Object.keys(rp)
  const roomId = roomIds[Math.floor(Math.random() * roomIds.length)]
  const room = { ...rp[roomId] }
  // Toggle a flag or add a dummy team input
  const actions = ['toggleCompleted','toggleLeadReady','addTeamInput']
  const action = actions[Math.floor(Math.random() * actions.length)]
  if (action === 'toggleCompleted') room.completed = !room.completed
  else if (action === 'toggleLeadReady') room.leadReady = !room.leadReady
  else if (action === 'addTeamInput') {
    const key = 'k' + Math.random().toString(36).slice(2,5)
    room.teamInputs = { ...room.teamInputs, [key]: { data: Math.random().toString(36).slice(2,6), providedBy: 'rnd', timestamp: Date.now() } }
  }
  return { roomId, room }
}

export function runDiffStressTest(iterations = 200, intervalMs = 20) {
  const st = useNightfallStore.getState()
  const originalSnapshot = st.buildSnapshot()
  let applied = 0
  let timer
  function step() {
    if (applied >= iterations) {
      const finalSnap = st.buildSnapshot()
      const ok = st.verifySnapshot(finalSnap)
      console.log('[diffStress] complete', { iterations, checksumOk: ok })
      try { recordEvent('diff_stress_complete', { iterations, checksumOk: ok }) } catch {}
      return
    }
    // mutate store
    useNightfallStore.setState(prev => {
      const rp = { ...prev.roomProgress }
      const mut = randomMutateRoomProgress(rp)
      rp[mut.roomId] = mut.room
      return { roomProgress: rp }
    })
    // build diff (simulate sending)
    const diff = st.buildDiffPatch()
    if (diff && diff.full) {
      st.applyFullSnapshot(diff.snapshot)
    } else if (diff && diff.patch) {
      st.applyDiffPatch(diff.patch)
    }
    applied++
    timer = setTimeout(step, intervalMs)
  }
  step()
  return () => { if (timer) clearTimeout(timer) }
}

window.runDiffStressTest = runDiffStressTest
console.log('[diffStress] harness ready. Call runDiffStressTest() in console.')
