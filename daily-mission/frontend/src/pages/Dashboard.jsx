import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Target, Flame, BookOpen, Activity, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, title, value, subtext, colorClass }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden group"
  >
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity ${colorClass}`}></div>
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${colorClass.replace('bg-', 'text-')}`}>
        <Icon size={24} />
      </div>
      <ArrowUpRight size={20} className="text-slate-500" />
    </div>
    <div>
      <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-slate-200">{value}</span>
        <span className="text-xs text-green-400 mb-1">{subtext}</span>
      </div>
    </div>
  </motion.div>
);

export default function Dashboard() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">
            Welcome back, <span className="text-gradient">{user?.name || 'Student'}</span>!
          </h1>
          <p className="text-slate-400">Your daily mission is waiting for you.</p>
        </div>
        <div className="bg-primary-500/10 border border-primary-500/20 px-4 py-2 rounded-xl flex items-center gap-3">
          <Flame className="text-orange-500" size={24} />
          <div>
            <div className="text-xs text-slate-400 font-medium">Current Streak</div>
            <div className="text-lg font-bold text-white leading-none">{user?.streak || 2} Days</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Target} 
          title="Daily Goal Progress" 
          value="85%" 
          subtext="+5% today"
          colorClass="bg-blue-500 text-blue-400"
        />
        <StatCard 
          icon={BookOpen} 
          title="Chapters Revised" 
          value="12" 
          subtext="Out of 90"
          colorClass="bg-purple-500 text-purple-400"
        />
        <StatCard 
          icon={Activity} 
          title="Avg. Test Score" 
          value="480" 
          subtext="Target: 600"
          colorClass="bg-green-500 text-green-400"
        />
        <StatCard 
          icon={Flame} 
          title="Total Practice Hours" 
          value="42h" 
          subtext="+2h this week"
          colorClass="bg-orange-500 text-orange-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Study Heatmap</h3>
          <div className="h-48 flex items-center justify-center border border-white/5 rounded-xl bg-dark-900/50">
            <p className="text-slate-500 text-sm">[Heatmap Chart Placeholder - Recharts/SVG]</p>
          </div>
        </div>
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Daily Mission</h3>
          <ul className="space-y-4">
            {['Revise Plant Physiology', 'Solve 50 Chemistry MCQs', 'Read Biology NCERT'].map((task, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded border border-primary-500/50 flex items-center justify-center bg-dark-900/50"></div>
                <span className="text-slate-300 text-sm">{task}</span>
              </li>
            ))}
          </ul>
          <button className="w-full mt-6 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 py-2 rounded-lg transition-colors border border-primary-500/20 text-sm font-medium">
            Generate New Mission
          </button>
        </div>
      </div>
    </div>
  );
}
