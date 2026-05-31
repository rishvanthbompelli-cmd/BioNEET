import React, { useState } from 'react';
import { Save, User, Target } from 'lucide-react';
import { PageHeader } from '../components/LoadingState';
import { authApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';

export default function Settings() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name || '',
    examMode: user?.examMode || 'NEET',
    dailyHours: user?.dailyHours || 5,
    targetRank: user?.targetRank || 2000,
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.updateProfile(form);
      updateUser(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <PageHeader title="Settings" subtitle="Profile & exam preferences" />

      <form onSubmit={handleSave} className="glass-panel p-6 rounded-2xl space-y-4">
        <div>
          <label className="text-sm text-slate-400 mb-1 flex items-center gap-2"><User size={14} /> Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-dark-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-slate-200" />
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Exam Mode</label>
          <select value={form.examMode} onChange={(e) => setForm({ ...form, examMode: e.target.value })} className="w-full bg-dark-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-slate-200">
            <option value="NEET">NEET Mode</option>
            <option value="EAPCET">EAPCET Mode</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-1 flex items-center gap-2"><Target size={14} /> Target Rank</label>
          <input type="number" value={form.targetRank} onChange={(e) => setForm({ ...form, targetRank: parseInt(e.target.value, 10) })} className="w-full bg-dark-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-slate-200" />
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Daily Study Hours</label>
          <input type="number" min={1} max={16} value={form.dailyHours} onChange={(e) => setForm({ ...form, dailyHours: parseInt(e.target.value, 10) })} className="w-full bg-dark-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-slate-200" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-primary-500 hover:bg-primary-400 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
          <Save size={18} /> {saved ? 'Saved!' : loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>

      <div className="glass-panel p-4 rounded-2xl text-sm text-slate-400">
        <p>Email: {user?.email}</p>
        <p>Role: {user?.role}</p>
        <p className="mt-2 text-xs">Demo: student@dailymission.com / student123</p>
      </div>
    </div>
  );
}
