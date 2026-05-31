import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { UserPlus, Mail, Lock, User, Loader2 } from 'lucide-react';
import { authApi } from '../lib/api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.register({ name, email, password });
      login(res.data.user, res.data.token, res.data.refreshToken);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8 relative overflow-hidden">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-accent-500/20 border border-accent-500/30 rounded-2xl flex items-center justify-center mb-4 text-accent-400">
            <UserPlus size={24} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Join BioNEET</h2>
          <p className="text-slate-400 text-sm">Start your NEET & EAPCET BiPC journey.</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-6 text-center">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" required className="w-full bg-dark-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-slate-200" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="email" required className="w-full bg-dark-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-slate-200" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password (min 6 chars)</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="password" required minLength={6} className="w-full bg-dark-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-slate-200" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-accent-500 hover:bg-accent-400 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-70">
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Already have an account? <Link to="/login" className="text-accent-400 font-medium">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
