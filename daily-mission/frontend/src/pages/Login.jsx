import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';
import { authApi } from '../lib/api';
import EvilEye from '../components/EvilEye';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login({ email, password });
      login(res.data.user, res.data.token, res.data.refreshToken);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleResponse = async (response) => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.googleLogin({ credential: response.credential });
      login(res.data.user, res.data.token, res.data.refreshToken);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !googleBtnRef.current) return;

    const initGoogle = () => {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
      });
      window.google?.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'filled_black',
        size: 'large',
        width: 320,
        text: 'continue_with',
      });
    };

    if (window.google) initGoogle();
    else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = initGoogle;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 overflow-hidden bg-black z-40">
      <EvilEye eyeColor="#FF6F37" intensity={1.5} pupilSize={0.6} irisWidth={0.25} glowIntensity={0.35} scale={1.5} noiseScale={1} pupilFollow={1} flameSpeed={1} backgroundColor="#000000" className="absolute inset-0 z-0 pointer-events-none" />
      <div className="glass-card w-full max-w-md p-8 relative z-10">
        <div className="relative z-10">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="text-center mb-8 relative z-10">
          <div className="mx-auto w-12 h-12 bg-primary-500/20 border border-primary-500/30 rounded-2xl flex items-center justify-center mb-4 text-primary-400">
            <LogIn size={24} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to BioNEET</h2>
          <p className="text-slate-400 text-sm">Sign in to access your study dashboard.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="email" required className="w-full bg-dark-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <Link to="/forgot-password" className="text-xs text-primary-400 hover:text-primary-300">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="password" required className="w-full bg-dark-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-primary-500 hover:bg-primary-400 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-70">
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Sign In'}
          </button>
        </form>

        {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
          <div className="mt-6 flex flex-col items-center gap-3 relative z-10">
            <span className="text-xs text-slate-500">or continue with</span>
            <div ref={googleBtnRef} />
          </div>
        )}

        <div className="mt-6 text-center text-sm text-slate-400">
          Don't have an account? <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">Create one</Link>
        </div>
        <div className="mt-3 text-center">
          <Link to="/" className="text-xs text-slate-500 hover:text-slate-300">← Back to BioNEET home</Link>
        </div>
        </div>
      </div>
    </div>
  );
}
