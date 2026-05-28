import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, PenTool, LayoutTemplate, FlaskConical, Target, Award, Database } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: BookOpen, label: 'Notes', path: '/notes' },
  { icon: Target, label: 'MCQs', path: '/mcqs' },
  { icon: LayoutTemplate, label: 'Mock Tests', path: '/mock-tests' },
  { icon: PenTool, label: 'Quiz Generator', path: '/quiz-gen' },
  { icon: FlaskConical, label: 'Formulas', path: '/formulas' },
  { icon: Award, label: 'Analytics', path: '/analytics' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 hidden md:flex flex-col glass-panel h-[calc(100vh-73px)] sticky top-[73px] border-t-0 rounded-tr-none rounded-tl-none border-l-0 border-b-0">
      <div className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
      
      <div className="p-4 border-t border-white/10">
        <div className="bg-gradient-to-br from-dark-800 to-dark-900 rounded-xl p-4 border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h4 className="text-sm font-semibold text-slate-200 mb-1">Study Planner</h4>
          <p className="text-xs text-slate-400 mb-3">AI generated schedule based on your goals.</p>
          <button className="w-full text-xs bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg transition-colors border border-white/5 backdrop-blur-md">
            View Plan
          </button>
        </div>
      </div>
    </aside>
  );
}
