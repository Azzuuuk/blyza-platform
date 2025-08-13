// Centralized API helper
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

async function api(path, { method='GET', body, headers } = {}){
  let authHeaders = {}
  try {
    // dynamic import to avoid circular
    const { useAuthStore } = await import('../stores/useAuthStore.js')
    const token = useAuthStore.getState().token
    if(token) authHeaders.Authorization = `Bearer ${token}`
  } catch(_e){}
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type':'application/json', ...authHeaders, ...(headers||{}) },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include'
  });
  if(!res.ok){
    const text = await res.text();
    throw new Error(`API ${method} ${path} failed ${res.status}: ${text}`);
  }
  return res.headers.get('content-type')?.includes('application/json') ? res.json() : res;
}

export const ReportsAPI = {
  deep(sessionId){ return api(`/api/reports/deep`, { method:'POST', body:{ sessionId, gameId:'generic' }}); },
  compute(sessionId){ return api(`/api/reports/session/${sessionId}/compute`, { method:'POST' }); },
  stats(sessionId){ return api(`/api/reports/session/${sessionId}/stats`); },
  listPdf(email){ return api(`/api/mvp/reports/pdf/list?email=${encodeURIComponent(email||'manager@blyza.com')}`)},
  async generatePDF({ sessionId, gameId='generic', managerEvaluation={}, companyInfo={}, emailSettings }){
    // Direct fetch to handle binary PDF with auth token if present
    let authHeaders = { 'Content-Type':'application/json' }
    try {
      const { useAuthStore } = await import('../stores/useAuthStore.js')
      const token = useAuthStore.getState().token
      if(token) authHeaders.Authorization = `Bearer ${token}`
      else authHeaders.Authorization = 'Bearer demo-token'
    } catch(_e){ authHeaders.Authorization = 'Bearer demo-token' }
    const res = await fetch(`${API_BASE}/api/reports/generate`, {
      method:'POST',
      headers: authHeaders,
      body: JSON.stringify({ sessionId, gameId, managerEvaluation, companyInfo, emailSettings })
    });
    if(!res.ok){
      const text = await res.text();
      throw new Error(`Report PDF failed ${res.status}: ${text}`);
    }
    const blob = await res.blob();
    return blob;
  }
};

export const GamesAPI = {
  scenarios(gameId, context){ return api(`/api/games/${gameId}/scenarios`, { method:'POST', body:{ context }}); },
  customize(gameId, payload){ return api(`/api/games/${gameId}/customize`, { method:'POST', body: payload }); }
};

export const MvpAPI = {
  upsertUser(email, name){ return api('/api/mvp/user/upsert', { method:'POST', body:{ email, name }, headers: { 'x-api-key': import.meta.env.VITE_MVP_API_KEY || '' }}); },
  balance(){ return api('/api/mvp/points/balance', { headers:{ 'x-api-key': import.meta.env.VITE_MVP_API_KEY || '' }}); },
  earn(delta, reason, sessionId){ return api('/api/mvp/points/earn', { method:'POST', body:{ delta, reason, sessionId }, headers:{ 'x-api-key': import.meta.env.VITE_MVP_API_KEY || '' }}); },
  rewards(){ return api('/api/mvp/rewards'); },
  redeem(rewardId){ return api('/api/mvp/rewards/redeem', { method:'POST', body:{ rewardId }, headers:{ 'x-api-key': import.meta.env.VITE_MVP_API_KEY || '' }}); },
  transactions(){ return api('/api/mvp/points/transactions', { headers:{ 'x-api-key': import.meta.env.VITE_MVP_API_KEY || '' }}); },
  redemptions(userId){ return api(`/api/mvp/rewards/redemptions/${userId}`); },
  evaluation(payload){ return api('/api/mvp/evaluation', { method:'POST', body: payload }); },
  saveTemplate(t){ return api('/api/mvp/templates', { method:'POST', body: t }); },
  listTemplates(){ return api('/api/mvp/templates'); }
};

export default { api, ReportsAPI, GamesAPI, MvpAPI };
