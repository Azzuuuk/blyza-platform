import React, { useState } from 'react'
import { useAuthStore } from '../stores/useAuthStore.js'

export default function AuthPanel(){
  const { user, isAuthenticated, login, signup, logout, loading, error } = useAuthStore()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('manager@blyza.com')
  const [password, setPassword] = useState('password123')
  const [name, setName] = useState('Manager User')
  const [orgName, setOrgName] = useState('Demo Org')

  const handle = async (e) => {
    e.preventDefault()
    try {
      if(mode==='login') await login({ email, password })
      else await signup({ email, password, name, orgName })
    } catch(_e){}
  }

  if(isAuthenticated){
    return (
      <div className="p-4 bg-slate-800/60 rounded-md text-sm text-slate-200 flex flex-col gap-2">
        <div>Signed in as <strong>{user?.email}</strong></div>
        <button onClick={logout} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded">Logout</button>
      </div>
    )
  }

  return (
    <form onSubmit={handle} className="p-4 bg-slate-800/60 rounded-md text-slate-200 flex flex-col gap-2 w-full max-w-sm">
      <div className="flex gap-2 mb-2">
        <button type="button" onClick={()=>setMode('login')} className={`flex-1 px-2 py-1 rounded ${mode==='login'?'bg-blue-600':'bg-slate-700'}`}>Login</button>
        <button type="button" onClick={()=>setMode('signup')} className={`flex-1 px-2 py-1 rounded ${mode==='signup'?'bg-blue-600':'bg-slate-700'}`}>Signup</button>
      </div>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" className="px-2 py-1 rounded bg-slate-700" />
      {mode==='signup' && <input value={name} onChange={e=>setName(e.target.value)} placeholder="name" className="px-2 py-1 rounded bg-slate-700" />}
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" className="px-2 py-1 rounded bg-slate-700" />
      {mode==='signup' && <input value={orgName} onChange={e=>setOrgName(e.target.value)} placeholder="org name (optional)" className="px-2 py-1 rounded bg-slate-700" />}
      <button disabled={loading} className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-3 py-1 rounded mt-2">{loading? 'Please wait...' : mode==='login' ? 'Login' : 'Create Account'}</button>
      {error && <div className="text-red-400 text-xs">{error}</div>}
    </form>
  )
}
