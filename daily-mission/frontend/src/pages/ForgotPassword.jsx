import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { authApi } from '../lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await authApi.forgotPassword({ email });
      setMessage(res.data.message);
      if (res.data.resetUrl) {
        setMessage(`${res.data.message} Dev link: ${res.data.resetUrl}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8">
        <Link to="/login" className="text-primary-400 text-sm flex items-center gap-1 mb-6 hover:underline">
          <ArrowLeft size={16} /> Back to login
        </Link>
        <h2 className="text-2xl font-bold text-white mb-2">Forgot Password</h2>
        <p className="text-slate-400 text-sm mb-6">Enter your email and we'll send a reset link.</p>

        {error && <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>}
        {message && <div className="bg-green-500/10 text-green-400 px-4 py-3 rounded-xl text-sm mb-4">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="email" required className="w-full bg-dark-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-slate-200" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-primary-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-70">
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
}
