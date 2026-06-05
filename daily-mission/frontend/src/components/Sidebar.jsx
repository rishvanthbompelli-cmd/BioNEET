import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, PenTool, LayoutTemplate, FlaskConical,
  Target, Award, Brain, Image, BookMarked, RotateCcw, Shield, FileText, GraduationCap
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Brain, label: 'AI Planner', path: '/planner' },
  { icon: Target, label: 'NEET Rank', path: '/rank-predictor-neet' },
  { icon: GraduationCap, label: 'EAPCET Rank', path: '/rank-predictor-eapcet' },
  { icon: BookOpen, label: 'Notes', path: '/notes' },
  { icon: LayoutTemplate, label: 'Mock Tests', path: '/mock-tests' },
  { icon: RotateCcw, label: 'Revision', path: '/revision' },
  { icon: FileText, label: 'Papers', path: '/papers' },
  { icon: FlaskConical, label: 'Formulas', path: '/formulas' },
  { icon: Image, label: 'Diagrams', path: '/diagrams' },
  { icon: BookMarked, label: 'Handbook', path: '/handbook' },
  { icon: Award, label: 'Analytics', path: '/analytics' },
  { icon: Shield, label: 'Admin', path: '/admin', adminOnly: true },
];

const sidebarItemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.03, type: 'spring', stiffness: 400, damping: 25 },
  }),
};

export default function Sidebar() {
  const { user } = useAuthStore();
  const items = navItems.filter((item) => !item.adminOnly || user?.isAdmin);

  return (
    <aside className="w-64 hidden md:flex flex-col glass-panel h-[calc(100dvh-65px)] sticky top-[65px] border-t-0 rounded-tr-none rounded-tl-none border-l-0 border-b-0 shrink-0">
      <div className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto custom-scrollbar pb-4 overscroll-contain">
        {items.map((item, index) => (
          <motion.div
            key={item.path}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={sidebarItemVariants}
            whileHover={{ scale: 1.02, x: 3 }}
            whileTap={{ scale: 0.97 }}
            style={{ willChange: 'transform' }}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm ${
                  isActive
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30 shadow-sm shadow-primary-500/10'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`
              }
            >
              <item.icon size={18} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          </motion.div>
        ))}
      </div>

      <div className="p-3 border-t border-white/10">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <NavLink to="/planner" className="block bg-gradient-to-br from-dark-800 to-dark-900 rounded-xl p-4 border border-white/5 hover:border-primary-500/30 transition-colors group">
            <h4 className="text-sm font-semibold text-slate-200 mb-1">Study Planner</h4>
            <p className="text-xs text-slate-400 mb-2">AI schedule for your goals</p>
            <span className="text-xs text-primary-400 group-hover:underline">View Plan →</span>
          </NavLink>
        </motion.div>
      </div>
    </aside>
  );
}
