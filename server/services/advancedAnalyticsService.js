import { query } from './db.js';

/**
 * Advanced analytics persistence + computation layer
 */
export const AdvancedAnalyticsService = {
  async recordRawEvents(sessionId, events){
    if(!Array.isArray(events) || events.length===0) return;
    for(const ev of events){
      try {
        await query('INSERT INTO session_events(session_id, type, payload) VALUES($1,$2,$3::jsonb)', [sessionId, ev.type||ev.eventType||'unknown', JSON.stringify(ev.eventData||ev.payload||{})]);
      } catch(e){ console.error('insert session_event failed', e.message); }
    }
  },

  async upsertPlayerStats(sessionId, playerId, stats){
    await query(`INSERT INTO player_session_stats(session_id, player_id, stats) VALUES($1,$2,$3::jsonb)
      ON CONFLICT (session_id, player_id) DO UPDATE SET stats=EXCLUDED.stats, calculated_at=now()`, [sessionId, playerId, JSON.stringify(stats)]);
  },

  async getSessionStats(sessionId){
    const { rows } = await query('SELECT player_id, stats FROM player_session_stats WHERE session_id=$1', [sessionId]);
    return rows;
  },

  async saveCustomTemplate({id, baseGameId, title, createdBy, customization, content}){
    const { rows } = await query(`INSERT INTO custom_game_templates(id, base_game_id, title, created_by, customization, content)
      VALUES($1,$2,$3,$4,$5::jsonb,$6::jsonb) RETURNING *`, [id, baseGameId, title, createdBy, JSON.stringify(customization||{}), JSON.stringify(content||{})]);
    return rows[0];
  },

  async listCustomTemplates(createdBy){
    const { rows } = await query('SELECT * FROM custom_game_templates WHERE created_by=$1 ORDER BY created_at DESC', [createdBy]);
    return rows;
  }
};
