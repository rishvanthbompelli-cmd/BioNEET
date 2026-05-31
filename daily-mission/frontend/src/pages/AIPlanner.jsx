import React, { useEffect, useState } from 'react';
import { Brain, Sparkles, Calendar, Target, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader, LoadingState } from '../components/LoadingState';
import { aiApi, authApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';

export default function AIPlanner() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name || '',
    examMode: user?.examMode || 'NEET',
    dailyHours: user?.dailyHours || 5,
    targetRank: user?.targetRank || 2000,
    weakSubjects: user?.weakSubjects
      ? (typeof user.weakSubjects === 'string' ? JSON.parse(user.weakSubjects) : user.weakSubjects)
      : ['Chemistry', 'Physics'],
    completedChapters: [],
  });
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    aiApi.getStudyPlans()
      .then((res) => {
        if (res.data.length > 0) setPlan({ ...res.data[0].plan, id: res.data[0].id, goal: res.data[0].goal });
      })
      .catch(console.error)
      .finally(() => setLoadingSaved(false));
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSavedMsg('');
    try {
      await authApi.updateProfile({
        name: form.name,
        examMode: form.examMode,
        dailyHours: form.dailyHours,
        targetRank: form.targetRank,
        weakSubjects: form.weakSubjects,
      });
      updateUser({ ...form, weakSubjects: JSON.stringify(form.weakSubjects) });

      const res = await aiApi.createStudyPlan(form);
      setPlan(res.data);
      setSavedMsg('Plan saved to your account!');
      setTimeout(() => setSavedMsg(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleWeak = (s) => {
    setForm((f) => ({
      ...f,
      weakSubjects: f.weakSubjects.includes(s) ? f.weakSubjects.filter((x) => x !== s) : [...f.weakSubjects, s],
    }));
  };

  if (loadingSaved) return <LoadingState message="Loading your saved plan..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="AI Study Planner"
        subtitle="Set your goals, generate a plan, and it stays saved to your account"
      />

      <form onSubmit={handleGenerate} className="glass-panel p-6 rounded-2xl space-y-5">
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Your Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-dark-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-slate-200" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Exam Mode</label>
            <select value={form.examMode} onChange={(e) => setForm({ ...form, examMode: e.target.value })} className="w-full bg-dark-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-slate-200">
              <option value="NEET">NEET (Conceptual)</option>
              <option value="EAPCET">EAPCET (Speed)</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Daily Hours</label>
            <input type="number" min={1} max={16} value={form.dailyHours} onChange={(e) => setForm({ ...form, dailyHours: parseInt(e.target.value, 10) })} className="w-full bg-dark-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-slate-200" />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Target Rank</label>
            <input type="number" value={form.targetRank} onChange={(e) => setForm({ ...form, targetRank: parseInt(e.target.value, 10) })} className="w-full bg-dark-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-slate-200" />
          </div>
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-2 block">Weak Subjects</label>
          <div className="flex flex-wrap gap-2">
            {['Botany', 'Zoology', 'Physics', 'Chemistry'].map((s) => (
              <button type="button" key={s} onClick={() => toggleWeak(s)} className={`px-4 py-2 rounded-xl text-sm ${form.weakSubjects.includes(s) ? 'bg-primary-500 text-white' : 'bg-white/5 text-slate-400 border border-white/10'}`}>{s}</button>
            ))}
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-primary-500 hover:bg-primary-400 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
          <Sparkles size={20} /> {loading ? 'Generating & Saving...' : 'Generate & Save Study Plan'}
        </button>
        {savedMsg && <p className="text-green-400 text-sm text-center flex items-center justify-center gap-1"><Save size={14} /> {savedMsg}</p>}
      </form>

      {loading && <LoadingState message="AI is building your schedule..." />}

      {plan && !loading && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="glass-card p-6 border border-primary-500/20">
            <div className="flex items-center gap-3"><Brain className="text-primary-400" /><h2 className="text-xl font-bold text-white">{plan.goal}</h2></div>
            <p className="text-xs text-slate-500 mt-2">Saved plan — shown on your dashboard daily missions</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel p-5 rounded-2xl">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><Target size={18} className="text-primary-400" /> Daily Missions</h3>
              <ul className="space-y-2">{plan.dailyMissions?.map((t, i) => <li key={i} className="text-sm text-slate-300 flex gap-2"><span className="text-primary-400">•</span>{t}</li>)}</ul>
            </div>
            <div className="glass-panel p-5 rounded-2xl">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><Calendar size={18} className="text-accent-400" /> Weekly Schedule</h3>
              <ul className="space-y-2">{plan.weeklySchedule?.map((d, i) => <li key={i} className="text-sm text-slate-300"><span className="text-white font-medium">{d.day}:</span> {d.subjects?.join(', ')} ({d.hours}h)</li>)}</ul>
            </div>
          </div>
          {plan.weakTopicFocus && (
            <div className="glass-panel p-5 rounded-2xl">
              <h3 className="text-white font-semibold mb-2">Weak Topic Focus</h3>
              <div className="flex flex-wrap gap-2">{plan.weakTopicFocus.map((t) => <span key={t} className="px-3 py-1 bg-red-500/10 text-red-300 rounded-lg text-sm border border-red-500/20">{t}</span>)}</div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
