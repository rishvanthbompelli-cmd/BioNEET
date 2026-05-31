import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Circle, Flame } from 'lucide-react';
import { PageHeader, LoadingState } from '../components/LoadingState';
import { revisionApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';

const STATUS_CONFIG = {
  COMPLETED: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  WEAK: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  IN_PROGRESS: { icon: Circle, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  NOT_STARTED: { icon: Circle, color: 'text-slate-500', bg: 'bg-white/5 border-white/10' },
};

export default function RevisionTracker() {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, updateUser } = useAuthStore();
  const [filter, setFilter] = useState('All');

  const load = () => {
    revisionApi.getAll().then((res) => setChapters(res.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (chapterId, status) => {
    try {
      await revisionApi.update(chapterId, { status });
      load();
      if (status === 'COMPLETED') updateUser({ streak: (user?.streak || 0) + 1 });
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = filter === 'All' ? chapters : chapters.filter((c) => c.status === filter);
  const completed = chapters.filter((c) => c.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revision Tracker"
        subtitle={`${completed}/${chapters.length} chapters completed`}
        action={
          <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-xl">
            <Flame className="text-orange-400" size={20} />
            <span className="text-white font-bold">{user?.streak || 0} day streak</span>
          </div>
        }
      />

      <div className="flex gap-2 overflow-x-auto custom-scrollbar">
        {['All', 'COMPLETED', 'WEAK', 'IN_PROGRESS', 'NOT_STARTED'].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${filter === s ? 'bg-primary-500 text-white' : 'bg-white/5 text-slate-400'}`}>{s.replace('_', ' ')}</button>
        ))}
      </div>

      {loading ? <LoadingState /> : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.NOT_STARTED;
            const Icon = cfg.icon;
            return (
              <div key={c.chapterId} className={`glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border ${cfg.bg}`}>
                <div className="flex items-center gap-3">
                  <Icon size={20} className={cfg.color} />
                  <div>
                    <div className="text-white font-medium">{c.name}</div>
                    <div className="text-xs text-slate-400">{c.subject} · Weightage {c.weightage} · {c.revisionCount} revisions</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {['COMPLETED', 'WEAK', 'IN_PROGRESS'].map((s) => (
                    <button key={s} onClick={() => updateStatus(c.chapterId, s)} className={`px-3 py-1 rounded-lg text-xs ${c.status === s ? 'bg-primary-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>{s.replace('_', ' ')}</button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
