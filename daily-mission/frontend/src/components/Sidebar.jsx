import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard, BookOpen, PenTool, LayoutTemplate, FlaskConical,
  Target, Award, Brain, Image, BookMarked, RotateCcw, Settings, Shield,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Brain, label: 'AI Planner', path: '/planner' },
  { icon: BookOpen, label: 'Notes', path: '/notes' },
  { icon: Target, label: 'MCQs', path: '/mcqs' },
  { icon: PenTool, label: 'Quiz Gen', path: '/quiz-gen' },
  { icon: LayoutTemplate, label: 'Mock Tests', path: '/mock-tests' },
  { icon: RotateCcw, label: 'Revision', path: '/revision' },
  { icon: FlaskConical, label: 'Formulas', path: '/formulas' },
  { icon: Image, label: 'Diagrams', path: '/diagrams' },
  { icon: BookMarked, label: 'Handbook', path: '/handbook' },
  { icon: Award, label: 'Analytics', path: '/analytics' },
  { icon: Settings, label: 'Settings', path: '/settings' },
  { icon: Shield, label: 'Admin', path: '/admin', adminOnly: true },
];

export default function Sidebar() {
  const { user } = useAuthStore();
  const items = navItems.filter((item) => !item.adminOnly || user?.role === 'ADMIN');

  return (
    <aside className="w-64 hidden md:flex flex-col glass-panel h-[calc(100vh-73px)] sticky top-[73px] border-t-0 rounded-tr-none rounded-tl-none border-l-0 border-b-0 shrink-0">
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm ${
                isActive
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`
            }
          >
            <item.icon size={18} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="p-3 border-t border-white/10">
        <NavLink to="/planner" className="block bg-gradient-to-br from-dark-800 to-dark-900 rounded-xl p-4 border border-white/5 hover:border-primary-500/30 transition-colors group">
          <h4 className="text-sm font-semibold text-slate-200 mb-1">Study Planner</h4>
          <p className="text-xs text-slate-400 mb-2">AI schedule for your goals</p>
          <span className="text-xs text-primary-400 group-hover:underline">View Plan →</span>
        </NavLink>
      </div>
    </aside>
  );
}
