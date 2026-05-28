import React, { useState } from 'react';
import { Search, FileText, Star, Filter, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_NOTES = [
  { id: 1, title: 'Photosynthesis in Higher Plants', subject: 'Botany', chapter: 'Plant Physiology', isFavorite: true },
  { id: 2, title: 'Human Reproduction & Hormones', subject: 'Zoology', chapter: 'Human Reproduction', isFavorite: false },
  { id: 3, title: 'Organic Chemistry Name Reactions', subject: 'Chemistry', chapter: 'Basic Principles', isFavorite: true },
  { id: 4, title: 'Thermodynamics Quick Formulas', subject: 'Physics', chapter: 'Thermodynamics', isFavorite: false },
];

export default function Notes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubject, setActiveSubject] = useState('All');

  const subjects = ['All', 'Botany', 'Zoology', 'Physics', 'Chemistry'];

  const filteredNotes = MOCK_NOTES.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = activeSubject === 'All' || n.subject === activeSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Study Notes</h1>
          <p className="text-slate-400">Access your chapter-wise short notes and summaries.</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar w-full md:w-auto">
          {subjects.map(sub => (
            <button 
              key={sub}
              onClick={() => setActiveSubject(sub)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                activeSubject === sub 
                ? 'bg-primary-500 text-white' 
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-64 flex-shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-500" />
          </div>
          <input
            type="text"
            className="w-full bg-dark-900/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note, idx) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-6 flex flex-col group cursor-pointer hover:border-primary-500/30 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-dark-900/50 rounded-xl border border-white/5 text-primary-400">
                <FileText size={20} />
              </div>
              <button className={`text-slate-400 hover:text-yellow-400 transition-colors ${note.isFavorite ? 'text-yellow-400 fill-yellow-400' : ''}`}>
                <Star size={18} />
              </button>
            </div>
            
            <h3 className="text-lg font-semibold text-slate-200 mb-1 group-hover:text-primary-400 transition-colors">
              {note.title}
            </h3>
            <p className="text-sm text-slate-400 mb-6 flex-1">
              {note.chapter} • {note.subject}
            </p>
            
            <div className="flex items-center text-sm text-primary-400 font-medium group-hover:translate-x-1 transition-transform">
              Read Notes <ArrowRight size={16} className="ml-1" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
