import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Monitor, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/useAuthStore';
import { createGameSession } from '../services/firebaseMultiplayer';

function LobbyCreation() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!user) {
      toast.error('Please sign in');
      navigate('/login');
      return;
    }
    if (user.role !== 'manager') {
      toast.error('Only managers can create sessions');
      return;
    }
    setCreating(true);
    try {
      const res = await createGameSession('nightfall', { uid: user.uid, name: user.name, role: user.role }, 4);
      if (!res.success) {
        toast.error(res.error || 'Failed to create session');
        return;
      }
      toast.success('Session created');
      navigate(`/lobby/${res.session.id}`, { state: { roomCode: res.session.code } });
    } catch (e) {
      toast.error(e.message || 'Failed to create session');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)', color: '#e2e8f0' }}>
      <header style={{ background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(51, 65, 85, 0.5)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', height: '64px', gap: 12 }}>
            <button onClick={() => navigate('/')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px', color: '#cbd5e1', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <ArrowLeft style={{ width: 20, height: 20 }} />
              <span>Back</span>
            </button>
            <div style={{ width: 1, height: 24, background: '#475569' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #7c3aed, #2563eb)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Monitor style={{ width: 20, height: 20, color: 'white' }} />
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, backgroundImage: 'linear-gradient(135deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>Create Team Session</span>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(51, 65, 85, 0.1)', border: '1px solid rgba(71, 85, 105, 0.3)', borderRadius: 16, padding: 32, textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12, color: 'white' }}>Operation Nightfall</h1>
          <p style={{ color: '#94a3b8', marginBottom: 24 }}>Create a lobby, share the code, and start when everyone has joined.</p>
          <button onClick={handleCreate} disabled={creating} style={{ width: '100%', padding: 14, borderRadius: 8, border: 'none', color: 'white', background: creating ? 'rgba(71, 85, 105, 0.5)' : 'linear-gradient(135deg, #7c3aed, #2563eb)', cursor: creating ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {creating && <Loader2 style={{ width: 20, height: 20, animation: 'spin 1s linear infinite' }} />}
            <span>{creating ? 'Creating…' : 'Create Lobby'}</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default LobbyCreation;
