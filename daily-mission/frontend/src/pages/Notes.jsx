import React, { useEffect, useState } from 'react';
import { Search, FileText, Star, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader, LoadingState } from '../components/LoadingState';
import { notesApi } from '../lib/api';

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubject, setActiveSubject] = useState('All');
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();
  const subjects = ['All', 'Botany', 'Zoology', 'Physics', 'Chemistry'];

  useEffect(() => {
    notesApi.getAll({ subject: activeSubject !== 'All' ? activeSubject : undefined, search: searchTerm || undefined })
      .then((res) => setNotes(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeSubject, searchTerm]);

  const handleFavorite = async (e, id) => {
    e.stopPropagation();
    try {
      const res = await notesApi.toggleFavorite(id);
      setNotes((prev) => prev.map((n) => (n.id === id ? res.data : n)));
    } catch (err) {
      console.error(err);
    }
  };

  if (selected) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <button onClick={() => setSelected(null)} className="text-primary-400 text-sm hover:underline">← Back to notes</button>
        <div className="glass-panel p-8 rounded-2xl">
          <div className="flex gap-2 text-sm text-primary-400 mb-2">
            <span>{selected.subject}</span>
            {selected.chapter && <><span>•</span><span>{selected.chapter.name}</span></>}
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">{selected.title}</h1>
          {selected.highlights && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-4">
              <div className="text-yellow-400 text-xs font-semibold mb-1">KEY POINTS</div>
              <p className="text-slate-300 text-sm">{selected.highlights}</p>
            </div>
          )}
          <div className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-wrap">{selected.content}</div>
          {selected.memoryTrick && (
            <div className="mt-6 bg-accent-500/10 border border-accent-500/20 rounded-xl p-4">
              <div className="text-accent-400 text-xs font-semibold mb-1">MEMORY TRICK</div>
              <p className="text-slate-300 text-sm">{selected.memoryTrick}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Study Notes" subtitle="Chapter-wise short notes from the database" />

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setActiveSubject(sub)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                activeSubject === sub ? 'bg-primary-500 text-white' : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            className="w-full bg-dark-900/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <LoadingState />
      ) : notes.length === 0 ? (
        <p className="text-slate-500 text-center py-12">No notes found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note, idx) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => notesApi.getById(note.id).then((r) => setSelected(r.data))}
              className="glass-card p-6 flex flex-col group cursor-pointer hover:border-primary-500/30 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-dark-900/50 rounded-xl border border-white/5 text-primary-400">
                  <FileText size={20} />
                </div>
                <button onClick={(e) => handleFavorite(e, note.id)} className={`transition-colors ${note.isFavorite ? 'text-yellow-400' : 'text-slate-400 hover:text-yellow-400'}`}>
                  <Star size={18} fill={note.isFavorite ? 'currentColor' : 'none'} />
                </button>
              </div>
              <h3 className="text-lg font-semibold text-slate-200 mb-1 group-hover:text-primary-400 transition-colors">{note.title}</h3>
              <p className="text-sm text-slate-400 mb-4 flex-1">{note.chapter?.name || note.subject} • {note.subject}</p>
              <div className="flex items-center text-sm text-primary-400 font-medium group-hover:translate-x-1 transition-transform">
                Read Notes <ArrowRight size={16} className="ml-1" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
