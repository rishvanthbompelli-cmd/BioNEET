import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Target, Flame, BookOpen, Activity, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import StatCard from '../components/StatCard';
import HeatmapChart from '../components/HeatmapChart';
import LoadingState from '../components/LoadingState';
import { dashboardApi, aiApi } from '../lib/api';

export default function Dashboard() {
  const { user, updateUser } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    dashboardApi.getDashboard()
      .then((res) => {
        setData(res.data);
        if (res.data.user) updateUser(res.data.user);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [updateUser]);

  const handleGenerateMission = async () => {
    setGenerating(true);
    try {
      await aiApi.createStudyPlan({
        examMode: user?.examMode || 'NEET',
        dailyHours: user?.dailyHours || 5,
        weakSubjects: user?.weakSubjects ? JSON.parse(user.weakSubjects) : ['Chemistry'],
        targetRank: user?.targetRank || 2000,
      });
      const res = await dashboardApi.getDashboard();
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <LoadingState message="Loading your dashboard..." />;
  if (!data) return <div className="text-slate-400 text-center py-20">Could not load dashboard. Is the backend running?</div>;

  const { stats, heatmap, dailyMission, recentMockScores, subjectAccuracy } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">
            Welcome back, <span className="text-gradient">{user?.name || 'Student'}</span>!
          </h1>
          <p className="text-slate-400">{data.user.examMode} mode · Target rank {data.user.targetRank || '—'}</p>
        </div>
        <div className="bg-primary-500/10 border border-primary-500/20 px-4 py-2 rounded-xl flex items-center gap-3">
          <Flame className="text-orange-500" size={24} />
          <div>
            <div className="text-xs text-slate-400 font-medium">Current Streak</div>
            <div className="text-lg font-bold text-white leading-none">{data.user.streak} Days</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard icon={Target} title="Daily Goal Progress" value={`${stats.dailyGoalProgress}%`} subtext={`${stats.weekStudyHours}h this week`} colorClass="bg-blue-500" iconColor="text-blue-400" />
        <StatCard icon={BookOpen} title="Chapters Revised" value={`${stats.chaptersRevised}/${stats.totalChapters}`} subtext="Completed" colorClass="bg-purple-500" iconColor="text-purple-400" />
        <StatCard icon={Activity} title="MCQ Accuracy" value={`${stats.accuracy}%`} subtext={`${stats.totalMcqAttempts} attempts`} colorClass="bg-green-500" iconColor="text-green-400" />
        <StatCard icon={Flame} title="Study Hours" value={`${stats.totalStudyHours}h`} subtext={`Avg mock: ${stats.avgMockScore}%`} colorClass="bg-orange-500" iconColor="text-orange-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Study Heatmap</h3>
            <Link to="/analytics" className="text-xs text-primary-400 hover:underline">View analytics →</Link>
          </div>
          <HeatmapChart data={heatmap} />
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Daily Mission</h3>
          <ul className="space-y-3">
            {(dailyMission.length ? dailyMission : ['Complete 30 MCQs', 'Revise one weak chapter', 'Review mock mistakes']).map((task, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-primary-400 mt-0.5 shrink-0" />
                <span className="text-slate-300 text-sm">{task}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={handleGenerateMission}
            disabled={generating}
            className="w-full mt-6 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 py-2.5 rounded-lg transition-colors border border-primary-500/20 text-sm font-medium disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate New Mission'}
          </button>
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
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.accuracy}%` }}
                    className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Mock Tests</h3>
          {recentMockScores.length === 0 ? (
            <p className="text-slate-500 text-sm">No mock tests yet. <Link to="/mock-tests" className="text-primary-400">Take one →</Link></p>
          ) : (
            <div className="space-y-3">
              {recentMockScores.map((m) => (
                <div key={m.id} className="flex justify-between items-center p-3 bg-dark-900/50 rounded-xl border border-white/5">
                  <div>
                    <div className="text-sm font-medium text-slate-200">{m.title}</div>
                    <div className="text-xs text-slate-500">{m.mode}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary-400">{m.percentage}%</div>
                    <div className="text-xs text-slate-500">{m.score}/{m.total}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
