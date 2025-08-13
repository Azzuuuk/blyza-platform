import { query } from './db.js'

// Idempotent migrations for runtime trigger.
// Copy of scripts/migrate.js without process.exit so it can run in-process.
export async function runMigrations() {
  const statements = [
`CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY,
  join_code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'lobby',
  latest_snapshot JSONB,
  snapshot_version INTEGER,
  snapshot_checksum TEXT,
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
  ]
  // Post-table additive migrations for evolving schema
  const alters = [
    `ALTER TABLE reports ADD COLUMN IF NOT EXISTS type TEXT;`,
    `ALTER TABLE reports ADD COLUMN IF NOT EXISTS payload JSONB;`
  ]
  for(const sql of alters){ await query(sql) }
  for(const sql of statements){
    await query(sql)
  }
  return { applied: statements.length + alters.length }
}
