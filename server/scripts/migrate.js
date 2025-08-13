import { query } from '../services/db.js'

async function run(){
  const statements = [
`CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY,
  join_code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'lobby',
  latest_snapshot JSONB,
  snapshot_version INTEGER,
  snapshot_checksum TEXT,
  final_score INTEGER,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`,
`CREATE TABLE IF NOT EXISTS session_players (
  id TEXT PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  name TEXT,
  role TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`,
`CREATE TABLE IF NOT EXISTS session_events (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`,
`CREATE INDEX IF NOT EXISTS idx_sessions_join_code ON sessions(join_code);`,
`CREATE INDEX IF NOT EXISTS idx_session_events_session_id_created_at ON session_events(session_id, created_at DESC);`
  ,
`CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  points_balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`,
`CREATE TABLE IF NOT EXISTS points_transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  delta INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`,
`CREATE TABLE IF NOT EXISTS rewards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  points_cost INTEGER NOT NULL,
  category TEXT,
  metadata JSONB,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`,
`CREATE TABLE IF NOT EXISTS reward_redemptions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reward_id TEXT REFERENCES rewards(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`,
`CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  manager_email TEXT,
  insights JSONB,
  pdf_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`
  ]
  for(const sql of statements){
    await query(sql)
  }
  console.log('✅ Migrations applied')
  process.exit(0)
}
run().catch(e=>{ console.error('Migration failed', e); process.exit(1) })
