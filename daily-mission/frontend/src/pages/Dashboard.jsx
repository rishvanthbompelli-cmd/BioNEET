import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Target, Flame, BookOpen, Activity, Clock, Brain, FileQuestion } from 'lucide-react';
import { motion } from 'framer-motion';
import StatCard from '../components/StatCard';
import HeatmapChart from '../components/HeatmapChart';
import LoadingState from '../components/LoadingState';
import { dashboardApi } from '../lib/api';

const activityIcon = {
  mcq: FileQuestion,
  study: Clock,
  mock: Target,
  quiz: Brain,
};

export default function Dashboard() {
  const { user, updateUser, logout } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = () => {
    setLoading(true);
    setError('');
    dashboardApi.getDashboard()
      .then((res) => {
        setData(res.data);
        if (res.data.user) updateUser(res.data.user);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          logout();
          return;
        }
        setError(err.code === 'ERR_NETWORK'
          ? 'Backend server is not running. Start it with: cd backend && npm run dev'
          : 'Could not load dashboard. Please try again.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadDashboard(); }, []);

  if (loading) return <LoadingState message="Loading your study tracker..." />;

  if (error || !data) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-slate-400">{error || 'Could not load dashboard.'}</p>
        <button onClick={loadDashboard} className="bg-primary-500 text-white px-6 py-2 rounded-xl text-sm">Retry</button>
      </div>
    );
  }

  const { stats, heatmap, recentActivity, recentMockScores, subjectAccuracy } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">
            Study Tracker — <span className="text-gradient">{user?.name}</span>
          </h1>
          <p className="text-slate-400">Track what you study, practice, and complete daily</p>
        </div>
        <div className="bg-primary-500/10 border border-primary-500/20 px-4 py-2 rounded-xl flex items-center gap-3">
          <Flame className="text-orange-500" size={24} />
          <div>
            <div className="text-xs text-slate-400 font-medium">Streak</div>
            <div className="text-lg font-bold text-white leading-none">{data.user.streak} Days</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Target} title="Weekly Goal" value={`${stats.dailyGoalProgress}%`} subtext={`${stats.weekStudyHours}h studied`} colorClass="bg-blue-500" iconColor="text-blue-400" />
        <StatCard icon={BookOpen} title="Chapters Done" value={`${stats.chaptersRevised}/${stats.totalChapters}`} subtext="Revised" colorClass="bg-purple-500" iconColor="text-purple-400" />
        <StatCard icon={Activity} title="MCQ Accuracy" value={`${stats.accuracy}%`} subtext={`${stats.totalMcqAttempts} attempts`} colorClass="bg-green-500" iconColor="text-green-400" />
        <StatCard icon={Flame} title="Total Hours" value={`${stats.totalStudyHours}h`} subtext={`Mock avg ${stats.avgMockScore}%`} colorClass="bg-orange-500" iconColor="text-orange-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">What You&apos;ve Been Doing</h3>
            <Link to="/analytics" className="text-xs text-primary-400 hover:underline">Full analytics →</Link>
          </div>
          {recentActivity?.length > 0 ? (
            <ul className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
              {recentActivity.map((item, i) => {
                const Icon = activityIcon[item.type] || Activity;
                return (
                  <li key={i} className="flex items-center gap-3 p-3 bg-dark-900/50 rounded-xl border border-white/5">
                    <div className={`p-2 rounded-lg ${item.success === false ? 'bg-red-500/10 text-red-400' : item.success === true ? 'bg-green-500/10 text-green-400' : 'bg-primary-500/10 text-primary-400'}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 truncate">{item.label}</p>
                      <p className="text-xs text-slate-500">{new Date(item.date).toLocaleString()}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-slate-500 text-sm py-8 text-center">
              No activity yet. <Link to="/mock-tests" className="text-primary-400">Take a mock test</Link> or study your <Link to="/notes" className="text-primary-400">notes</Link> to start tracking.
            </p>
          )}
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Study Heatmap</h3>
          <HeatmapChart data={heatmap} />
          <Link to="/planner" className="block mt-4 text-center text-sm text-primary-400 hover:underline">
            View your AI study plan →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Subject Accuracy</h3>
          <div className="space-y-3">
            {subjectAccuracy.map((s) => (
              <div key={s.subject}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">{s.subject}</span>
                  <span className="text-slate-400">{s.accuracy}% ({s.attempts})</span>
                </div>
                <div className="h-2 bg-dark-900 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${s.accuracy}%` }} className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Mock Tests</h3>
          {recentMockScores.length === 0 ? (
            <p className="text-slate-500 text-sm"><Link to="/mock-tests" className="text-primary-400">Take a mock test →</Link></p>
          ) : (
            <div className="space-y-3">
              {recentMockScores.map((m) => (
                <div key={m.id} className="flex justify-between p-3 bg-dark-900/50 rounded-xl border border-white/5">
                  <div>
                    <div className="text-sm font-medium text-slate-200">{m.title}</div>
                    <div className="text-xs text-slate-500">{m.mode}</div>
                  </div>
                  <div className="text-lg font-bold text-primary-400">{m.percentage}%</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
