// Simple JSON file persistence for Nightfall snapshots (placeholder for DB)
import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = path.resolve(process.cwd(), 'data_nightfall')

async function ensureDir(){
  try { await fs.mkdir(DATA_DIR, { recursive: true }) } catch {}
}

export async function persistNightfallSnapshot(sessionId, snapshot){
  await ensureDir()
  const file = path.join(DATA_DIR, `${sessionId}.snapshot.json`)
  const payload = { savedAt: Date.now(), sessionId, snapshot }
  await fs.writeFile(file, JSON.stringify(payload, null, 2), 'utf8')
}

export async function loadNightfallSnapshot(sessionId){
  try {
    const file = path.join(DATA_DIR, `${sessionId}.snapshot.json`)
    const raw = await fs.readFile(file, 'utf8')
    return JSON.parse(raw)
  } catch { return null }
}

export async function listNightfallSnapshots(){
  await ensureDir()
  const files = await fs.readdir(DATA_DIR)
  return files.filter(f=>f.endsWith('.snapshot.json'))
}
