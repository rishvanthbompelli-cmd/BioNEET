import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Flame, Star, Zap, AlertTriangle, BookOpen } from 'lucide-react';
import { PageHeader, LoadingState } from '../components/LoadingState';
import { revisionApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';

const STATUS_CONFIG = {
  MASTERED: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', label: 'Mastered' },
  REVISED: { icon: CheckCircle2, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', label: 'Revised' },
  IN_PROGRESS: { icon: Circle, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', label: 'In Progress' },
  NOT_STARTED: { icon: Circle, color: 'text-slate-500', bg: 'bg-white/5 border-white/10', label: 'Not Started' },
};

const STATUS_OPTIONS = ['NOT_STARTED', 'IN_PROGRESS', 'REVISED', 'MASTERED'];

const WEIGHTAGE_COLOR = {
  VERY_HIGH: 'text-red-400 bg-red-500/10',
  HIGH: 'text-orange-400 bg-orange-500/10',
  MEDIUM: 'text-yellow-400 bg-yellow-500/10',
  LOW: 'text-slate-400 bg-white/5',
};

export default function RevisionTracker() {
  const [chapters, setChapters] = useState([]);
  const [subjects, setSubjects] = useState(['All', 'Botany', 'Zoology', 'Physics', 'Chemistry']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuthStore();
  const [year, setYear] = useState('INTER_1');
  const [subject, setSubject] = useState('All');
  const [filter, setFilter] = useState('All');

  const loadSubjects = () => {
    revisionApi.getSubjects({ year })
      .then((res) => setSubjects(res.data))
      .catch(() => setSubjects(['All', 'Botany', 'Zoology', 'Physics', 'Chemistry']));
  };

  const loadChapters = () => {
    setLoading(true);
    setError('');
    revisionApi.getAll({ year, subject: subject !== 'All' ? subject : undefined })
      .then((res) => setChapters(res.data))
      .catch((err) => {
        setError(err.code === 'ERR_NETWORK'
          ? 'Backend not running. Start: cd backend && npm run dev'
          : 'Failed to load chapters.');
        setChapters([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadSubjects(); }, [year]);
  useEffect(() => { loadChapters(); }, [year, subject]);

  const updateStatus = async (chapterId, status) => {
    try {
      await revisionApi.update(chapterId, { status });
      loadChapters();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = filter === 'All' ? chapters : chapters.filter((c) => c.status === filter);
  const completed = chapters.filter((c) => c.status === 'MASTERED' || c.status === 'REVISED').length;

  const grouped = filtered.reduce((acc, ch) => {
    if (!acc[ch.subject]) acc[ch.subject] = [];
    acc[ch.subject].push(ch);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revision Tracker"
        subtitle={`${completed}/${chapters.length} chapters revised · ${year === 'INTER_1' ? 'Inter 1st Year' : 'Inter 2nd Year'}`}
        action={
          <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-xl">
            <Flame className="text-orange-400" size={20} />
            <span className="text-white font-bold">{user?.streak || 0} day streak</span>
          </div>
        }
      />

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {[{ id: 'INTER_1', label: '🌿 Inter 1st Year' }, { id: 'INTER_2', label: '🌟 Inter 2nd Year' }].map((y) => (
          <button key={y.id} onClick={() => setYear(y.id)} className={`px-4 py-2 rounded-xl text-sm font-medium ${year === y.id ? 'bg-primary-500 text-white' : 'bg-white/5 text-slate-400 border border-white/10'}`}>{y.label}</button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto custom-scrollbar">
        {subjects.map((s) => (
          <button key={s} onClick={() => setSubject(s)} className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${subject === s ? 'bg-accent-500 text-white' : 'bg-white/5 text-slate-400'}`}>{s}</button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto custom-scrollbar">
        {['All', ...STATUS_OPTIONS].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${filter === s ? 'bg-primary-500/30 text-primary-300 border border-primary-500/30' : 'bg-white/5 text-slate-400'}`}>
            {s === 'All' ? 'All' : STATUS_CONFIG[s]?.label || s}
          </button>
        ))}
      </div>

      {loading ? <LoadingState /> : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <BookOpen className="mx-auto mb-3 opacity-50" size={40} />
          <p>No chapters found. Run backend seed: npm run db:reset</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([sub, items]) => (
            <div key={sub}>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-400" />
                {sub}
                <span className="text-xs text-slate-500 font-normal">({items.length} chapters)</span>
              </h3>
              <div className="space-y-2">
                {items.map((c) => {
                  const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.NOT_STARTED;
                  const Icon = cfg.icon;
                  return (
                    <div key={c.chapterId} className={`glass-card p-4 border ${cfg.bg}`}>
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <Icon size={20} className={`${cfg.color} mt-0.5 shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-medium">{c.name}</div>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${WEIGHTAGE_COLOR[c.weightageLevel] || WEIGHTAGE_COLOR.MEDIUM}`}>{c.weightageLevel?.replace('_', ' ')}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400">{c.difficulty}</span>
                              {c.isHighPriority && <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 flex items-center gap-0.5"><Star size={10} /> Priority</span>}
                              {c.isRankBooster && <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-300 flex items-center gap-0.5"><Zap size={10} /> Rank Booster</span>}
                              {c.isMostDifficult && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-300 flex items-center gap-0.5"><AlertTriangle size={10} /> Hard</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 shrink-0">
                          {STATUS_OPTIONS.map((s) => (
                            <button key={s} onClick={() => updateStatus(c.chapterId, s)} className={`px-3 py-1 rounded-lg text-xs ${c.status === s ? 'bg-primary-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                              {STATUS_CONFIG[s].label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
