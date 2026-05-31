import React, { useEffect, useState } from 'react';
import { BookMarked } from 'lucide-react';
import { PageHeader, LoadingState } from '../components/LoadingState';
import { contentApi } from '../lib/api';

export default function Handbook() {
  const [handbooks, setHandbooks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contentApi.getHandbooks().then((res) => setHandbooks(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (selected) {
    return (
      <div className="max-w-3xl mx-auto">
        <button onClick={() => setSelected(null)} className="text-primary-400 text-sm mb-4">← Back</button>
        <div className="glass-panel p-8 rounded-2xl">
          <div className="text-xs text-accent-400 mb-2">{selected.category.replace('-', ' ').toUpperCase()}</div>
          <h1 className="text-2xl font-bold text-white mb-4">{selected.title}</h1>
          <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">{selected.content}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Handbook" subtitle="Quick revision guides, rank boosters & last-minute NEET/EAPCET prep" />
      {loading ? <LoadingState /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {handbooks.map((h) => (
            <div key={h.id} onClick={() => setSelected(h)} className="glass-card p-6 cursor-pointer hover:border-accent-500/30 transition-colors group">
              <BookMarked className="text-accent-400 mb-3 group-hover:scale-110 transition-transform" size={28} />
              <div className="text-xs text-slate-500 mb-1">{h.subject} · {h.category}</div>
              <h3 className="text-lg font-semibold text-white">{h.title}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
