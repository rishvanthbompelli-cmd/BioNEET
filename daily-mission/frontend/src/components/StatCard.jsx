import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, title, value, subtext, colorClass, iconColor = 'text-primary-400' }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden group"
    >
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity ${colorClass}`} />
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${iconColor}`}>
          <Icon size={24} />
        </div>
        <ArrowUpRight size={20} className="text-slate-500" />
      </div>
      <div>
        <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-slate-200">{value}</span>
          {subtext && <span className="text-xs text-green-400 mb-1">{subtext}</span>}
        </div>
      </div>
    </motion.div>
  );
}
