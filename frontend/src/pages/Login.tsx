import React, { useState } from 'react';
import api from '../api';
import { Shield, User, Lock, AlertCircle } from 'lucide-react';

export default function Login({ setAuth }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', age: '', role: 'Compliance Officer', email: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isRegistering) {
        const payload = { ...formData, age: parseInt(formData.age) || 0 };
        const res = await api.post('/dashboard_users/register', payload);
        if (res.data.error) {
          setError(res.data.error);
        } else {
          setIsRegistering(false);
          setFormData({ ...formData, password: '' });
          setError('Registration successful! Please log in.');
        }
      } else {
        const res = await api.post('/dashboard_users/login', { username: formData.username, password: formData.password });
        if (res.data.error) {
          setError(res.data.error);
        } else {
          localStorage.setItem('dashboard_user', JSON.stringify(res.data.user));
          setAuth(res.data.user);
        }
      }
    } catch (err) {
      setError('Network error or server down.');
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#060608] text-white">
      <div className="glass w-[400px] rounded-xl border border-cyan/20 p-8 shadow-[0_0_40px_rgba(0,229,255,0.1)]">
        <div className="flex flex-col items-center mb-8">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-cyan/10 border border-cyan/30 mb-4">
            <Shield size={32} className="text-cyan" />
          </div>
          <h1 className="text-2xl font-bold tracking-widest text-white uppercase">VigilOS</h1>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-[0.2em]">Secure Access Node</p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-red-500/10 p-3 text-xs text-red-500 border border-red-500/20">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block">Username</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan/50" />
              <input 
                type="text" 
                required
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
                className="w-full bg-[#0a0f18] border border-cyan/20 rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-cyan transition-colors"
              />
            </div>
          </div>
          
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan/50" />
              <input 
                type="password" 
                required
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full bg-[#0a0f18] border border-cyan/20 rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-cyan transition-colors"
              />
            </div>
          </div>

          {isRegistering && (
            <>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block">Age</label>
                <input 
                  type="number" 
                  required
                  value={formData.age}
                  onChange={e => setFormData({...formData, age: e.target.value})}
                  className="w-full bg-[#0a0f18] border border-cyan/20 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-cyan transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block">Email</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-[#0a0f18] border border-cyan/20 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-cyan transition-colors"
                />
              </div>
            </>
          )}

          <button 
            type="submit"
            className="w-full mt-4 rounded-md bg-cyan/20 border border-cyan/40 py-2.5 text-xs font-bold uppercase tracking-widest text-cyan transition-all hover:bg-cyan/30 shadow-[0_0_15px_-3px_rgba(0,229,255,0.2)]"
          >
            {isRegistering ? 'Register Profile' : 'Authenticate'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-[11px] text-muted-foreground hover:text-cyan transition-colors"
          >
            {isRegistering ? 'Already have a profile? Login' : 'Need clearance? Register profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
