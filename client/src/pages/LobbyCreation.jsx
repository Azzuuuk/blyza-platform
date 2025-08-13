import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ...other imports (icons, motion, etc.)

function LobbyCreation(props) {
  // ...existing logic (state, hooks, etc.)
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)', color: '#e2e8f0' }}>
      {/* Header */}
      <header style={{ background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(51, 65, 85, 0.5)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={() => navigate('/')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 12px', color: '#cbd5e1', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <ArrowLeft style={{ width: 20, height: 20 }} />
                <span>Back</span>
              </button>
              <div style={{ width: 1, height: 24, background: '#475569' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 32, height: 32, background: `linear-gradient(135deg, ${currentGame.color}, #2563eb)`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Monitor style={{ width: 20, height: 20, color: 'white' }} />
                </div>
                <span style={{
                  fontSize: 18,
                  fontWeight: 700,
                  backgroundImage: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block'
                }}>Manager Session</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Employees Joined and Manager Role Assignment UI */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(168, 85, 247, 0.1)', backdropFilter: 'blur(10px)', border: '2px solid rgba(168, 85, 247, 0.3)', borderRadius: '16px', padding: '32px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>Employees Joined ({Object.keys(players).length}/{currentGame.maxPlayers})</h2>
          {Object.keys(players).length > 0 ? Object.values(players).map((player, index) => (
            <div key={player.uid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 32, height: 32, background: `linear-gradient(135deg, ${currentGame.color}, #2563eb)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: 'white', fontWeight: 'bold' }}>{player.name?.charAt(0).toUpperCase() || '?'}</div>
                <div>
                  <div style={{ fontWeight: '600', color: 'white' }}>{player.name}</div>
                  <div style={{ fontSize: '12px', color: '#22c55e' }}>Ready to play</div>
                </div>
              </div>
              {/* Manager role assignment dropdown */}
              <div>
                <label style={{ color: 'white', fontSize: '12px', marginRight: 8 }}>Role:</label>
                <select value={player.role || ''} onChange={e => { /* Update role for this player in Firebase */ toast.success(`Assigned role ${e.target.value} to ${player.name}`) }} style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                  <option value="">Select</option>
                  <option value="operative">Operative</option>
                  <option value="analyst">Analyst</option>
                  <option value="lead">Lead</option>
                  {/* Add more roles as needed */}
                </select>
              </div>
            </div>
          )) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', background: 'rgba(51, 65, 85, 0.1)', border: '1px dashed rgba(71, 85, 105, 0.5)', borderRadius: '8px', color: '#64748b' }}>No employees have joined yet.</div>
          )}
        </motion.div>
        {/* ...rest of the UI: room code, join link, instructions, start button, etc. ... */}
      </div>
    </div>
  );
// ...existing code...
                }}>Manager Session</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Employees Joined and Manager Role Assignment UI */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(168, 85, 247, 0.1)', backdropFilter: 'blur(10px)', border: '2px solid rgba(168, 85, 247, 0.3)', borderRadius: '16px', padding: '32px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>Employees Joined ({Object.keys(players).length}/{currentGame.maxPlayers})</h2>
          {Object.keys(players).length > 0 ? Object.values(players).map((player, index) => (
            <div key={player.uid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 32, height: 32, background: `linear-gradient(135deg, ${currentGame.color}, #2563eb)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: 'white', fontWeight: 'bold' }}>{player.name?.charAt(0).toUpperCase() || '?'}</div>
                <div>
                  <div style={{ fontWeight: '600', color: 'white' }}>{player.name}</div>
                  <div style={{ fontSize: '12px', color: '#22c55e' }}>Ready to play</div>
                </div>
              </div>
              {/* Manager role assignment dropdown */}
              <div>
                <label style={{ color: 'white', fontSize: '12px', marginRight: 8 }}>Role:</label>
                <select value={player.role || ''} onChange={e => { /* Update role for this player in Firebase */ toast.success(`Assigned role ${e.target.value} to ${player.name}`) }} style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                  <option value="">Select</option>
                  <option value="operative">Operative</option>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Employees Joined and Manager Role Assignment UI */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(168, 85, 247, 0.1)', backdropFilter: 'blur(10px)', border: '2px solid rgba(168, 85, 247, 0.3)', borderRadius: '16px', padding: '32px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>Employees Joined ({Object.keys(players).length}/{currentGame.maxPlayers})</h2>
          {Object.keys(players).length > 0 ? Object.values(players).map((player, index) => (
            <div key={player.uid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 32, height: 32, background: `linear-gradient(135deg, ${currentGame.color}, #2563eb)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: 'white', fontWeight: 'bold' }}>{player.name?.charAt(0).toUpperCase() || '?'}</div>
                <div>
                  <div style={{ fontWeight: '600', color: 'white' }}>{player.name}</div>
                  <div style={{ fontSize: '12px', color: '#22c55e' }}>Ready to play</div>
                </div>
              </div>
              {/* Manager role assignment dropdown */}
              <div>
                <label style={{ color: 'white', fontSize: '12px', marginRight: 8 }}>Role:</label>
                <select value={player.role || ''} onChange={e => { /* Update role for this player in Firebase */ toast.success(`Assigned role ${e.target.value} to ${player.name}`) }} style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                  <option value="">Select</option>
                  <option value="operative">Operative</option>
                  <option value="analyst">Analyst</option>
                  <option value="lead">Lead</option>
                  {/* Add more roles as needed */}
                </select>
              </div>
            </div>
          )) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', background: 'rgba(51, 65, 85, 0.1)', border: '1px dashed rgba(71, 85, 105, 0.5)', borderRadius: '8px', color: '#64748b' }}>No employees have joined yet.</div>
          )}
        </motion.div>
      </div>
                  {lobby?.roomCode || 'LOADING'}
                </div>
                <button
                  onClick={copyRoomCode}
                  style={{
                    padding: '20px',
                    background: copied ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                    border: `2px solid ${copied ? '#22c55e' : '#3b82f6'}`,
                    borderRadius: '12px',
                    color: copied ? '#22c55e' : '#60a5fa',
                    cursor: 'pointer'
                  }}
                >
                  {copied ? <CheckCircle style={{ width: 24, height: 24 }} /> : <Copy style={{ width: 24, height: 24 }} />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>
                Direct Join Link
              </label>
              <div style={{
                display: 'flex',
                gap: '12px'
              }}>
                <input
                  type="text"
                  value={`${window.location.origin}/join?code=${lobby?.roomCode || 'LOADING'}`}
                  readOnly
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'rgba(51, 65, 85, 0.3)',
                    border: '1px solid rgba(71, 85, 105, 0.5)',
                    borderRadius: '8px',
                    color: '#cbd5e1',
                    fontSize: '14px'
                  }}
                />
                <button
                  onClick={copyJoinLink}
                  style={{
                    padding: '12px 16px',
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid #3b82f6',
                    borderRadius: '8px',
                    color: '#60a5fa',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ExternalLink style={{ width: 16, height: 16 }} />
                  Copy
                </button>
              </div>
            </div>

            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '8px',
              }
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '8px',
                    marginBottom: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      background: `linear-gradient(135deg, ${currentGame.color}, #2563eb)`,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      {player.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: 'white' }}>
                        {player.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#22c55e' }}>
                        Ready to play
                      </div>
                    </div>
                  </div>
                  <div style={{
                    width: 8,
                    height: 8,
                    background: '#22c55e',
                    borderRadius: '50%'
                  }} />
                </div>
              )) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '32px',
                  background: 'rgba(51, 65, 85, 0.1)',
                  border: '1px dashed rgba(71, 85, 105, 0.5)',
                  borderRadius: '8px',
                  color: '#64748b',
                  textAlign: 'center',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <UserPlus style={{ width: 24, height: 24 }} />
                  <div>Waiting for employees to join...</div>
                  <div style={{ fontSize: '12px' }}>Share the room code above</div>
                </div>
              )}

              {/* Empty slots */}
              {Array.from({ length: Math.max(0, currentGame.maxPlayers - Object.keys(players).length) }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px 16px',
                    background: 'rgba(51, 65, 85, 0.1)',
                    border: '1px dashed rgba(71, 85, 105, 0.5)',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    color: '#64748b',
                    fontSize: '14px'
                  }}
                >
                  <UserPlus style={{ width: 16, height: 16, marginRight: '8px' }} />
                  Open slot for employee...
                </div>
              ))}
            </div>

            {/* Start Session Button */}
            <button
              onClick={startGameSession_old}
              disabled={Object.keys(players).length < currentGame.minPlayers || loading}
              style={{
                width: '100%',
                padding: '16px',
                background: Object.keys(players).length >= currentGame.minPlayers 
                  ? 'linear-gradient(135deg, #7c3aed, #2563eb)' 
                  : 'rgba(71, 85, 105, 0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: Object.keys(players).length >= currentGame.minPlayers ? 'pointer' : 'not-allowed',
                opacity: Object.keys(players).length >= currentGame.minPlayers ? 1 : 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <Loader2 style={{ width: 20, height: 20 }} />
              ) : (
                <Eye style={{ width: 20, height: 20 }} />
              )}
              {Object.keys(players).length >= currentGame.minPlayers 
                ? 'Start Session & Observe' 
                : `Need ${currentGame.minPlayers - Object.keys(players).length} more employees`
              }
            </button>

            {Object.keys(players).length >= currentGame.minPlayers && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '14px',
                color: '#22c55e'
              }}>
                ✅ Ready to start! You'll observe the session and receive AI insights.
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default LobbyCreation
