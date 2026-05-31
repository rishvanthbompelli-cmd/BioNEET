import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from 'recharts';
import { PageHeader, LoadingState } from '../components/LoadingState';
import ProgressRing from '../components/ProgressRing';
import HeatmapChart from '../components/HeatmapChart';
import { dashboardApi } from '../lib/api';

const COLORS = ['#3b82f6', '#a855f7', '#22c55e', '#f97316'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getAnalytics()
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading analytics..." />;
  if (!data) return <div className="text-slate-400 text-center py-20">Could not load analytics.</div>;

  const pieData = data.subjectAccuracy.filter((s) => s.attempts > 0).map((s) => ({
    name: s.subject,
    value: s.accuracy,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Real performance data from your study sessions and MCQ attempts" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 flex flex-col items-center">
          <ProgressRing value={data.stats.accuracy} label="Accuracy" />
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-bold text-white">{data.stats.totalMcqAttempts}</div>
          <div className="text-sm text-slate-400 mt-1">MCQ Attempts</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-bold text-white">{data.stats.chaptersRevised}</div>
          <div className="text-sm text-slate-400 mt-1">Chapters Done</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-bold text-white">{data.stats.avgMockScore}%</div>
          <div className="text-sm text-slate-400 mt-1">Avg Mock Score</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-white font-semibold mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Bar dataKey="studyMinutes" fill="#3b82f6" name="Study (min)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="mcqCount" fill="#a855f7" name="MCQs" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-white font-semibold mb-4">Subject Accuracy</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}%`}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-sm py-16 text-center">Start practicing MCQs to see subject breakdown</p>
          )}
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="text-white font-semibold mb-4">Study Consistency Heatmap</h3>
        <HeatmapChart data={data.heatmap} />
      </div>

      {data.weakChapters?.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-white font-semibold mb-4">Weak Chapters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.weakChapters.map((c) => (
              <div key={c.id} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div className="text-sm font-medium text-red-300">{c.name}</div>
                <div className="text-xs text-slate-400">{c.subject} · {c.revisionCount} revisions</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-panel p-6 rounded-2xl border border-primary-500/20">
        <h3 className="text-white font-semibold mb-4">AI Improvement Suggestions</h3>
        <ul className="space-y-2">
          {data.aiSuggestions.map((s, i) => (
            <li key={i} className="text-sm text-slate-300 flex gap-2">
              <span className="text-primary-400">→</span> {s}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
