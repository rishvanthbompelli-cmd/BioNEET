import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Target, BarChart3, Brain, MoreHorizontal,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
  { icon: BookOpen, label: 'Notes', path: '/notes' },
  { icon: Target, label: 'MCQs', path: '/mcqs' },
  { icon: Brain, label: 'AI Plan', path: '/planner' },
  { icon: BarChart3, label: 'Stats', path: '/analytics' },
];

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-white/10 px-2 py-2 safe-area-pb">
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                isActive ? 'text-primary-400' : 'text-slate-500'
              }`
            }
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
              isActive ? 'text-primary-400' : 'text-slate-500'
            }`
          }
        >
          <MoreHorizontal size={20} />
          <span className="text-[10px] font-medium">More</span>
        </NavLink>
      </div>
    </nav>
  );
}
