import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Loader2 } from 'lucide-react';
import { authApi } from '../lib/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authApi.resetPassword({ token, password });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 text-center">
          <p className="text-red-400 mb-4">Invalid reset link.</p>
          <Link to="/forgot-password" className="text-primary-400">Request a new link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Reset Password</h2>
        {error && <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="password" required minLength={6} className="w-full bg-dark-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-slate-200" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="password" required minLength={6} className="w-full bg-dark-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-slate-200" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-primary-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
